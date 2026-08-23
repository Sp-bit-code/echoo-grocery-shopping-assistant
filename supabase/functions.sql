/* ============================================================
   ECHOO GROCERY SHOPPING ASSISTANT
   functions.sql

   Purpose:
   - updated_at automation
   - profile creation after Supabase signup
   - lowercase role normalization
   - admin helper
   - cart quantity / stock validation
   - product stock protection
   - order total synchronization
   - atomic Cash On Delivery checkout RPC

   IMPORTANT:
   This file assumes these tables already exist:

   public.profiles
   public.products
   public.cart_items
   public.orders
   public.order_items

   Auth:
   auth.users
============================================================ */


/* ============================================================
   1. UPDATED_AT FUNCTION
============================================================ */

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();

  return new;
end;
$$;


/* ============================================================
   UPDATED_AT TRIGGERS
============================================================ */


/* PROFILES */

drop trigger if exists trigger_profiles_updated_at
on public.profiles;

create trigger trigger_profiles_updated_at
before update
on public.profiles
for each row
execute function public.set_updated_at();


/* PRODUCTS */

drop trigger if exists trigger_products_updated_at
on public.products;

create trigger trigger_products_updated_at
before update
on public.products
for each row
execute function public.set_updated_at();


/* CART ITEMS */

drop trigger if exists trigger_cart_items_updated_at
on public.cart_items;

create trigger trigger_cart_items_updated_at
before update
on public.cart_items
for each row
execute function public.set_updated_at();


/* ORDERS */

drop trigger if exists trigger_orders_updated_at
on public.orders;

create trigger trigger_orders_updated_at
before update
on public.orders
for each row
execute function public.set_updated_at();



/* ============================================================
   2. NORMALIZE PROFILE ROLE

   Database roles:

   user
   admin

   Prevent:

   User
   Admin
   USER
   ADMIN
============================================================ */

create or replace function public.normalize_profile_role()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin

  new.role :=
    lower(
      trim(
        coalesce(
          new.role,
          'user'
        )
      )
    );


  if new.role not in (
    'user',
    'admin'
  ) then

    raise exception
      'Invalid role. Allowed roles are user or admin.';

  end if;


  return new;

end;
$$;


/* ROLE NORMALIZATION TRIGGER */

drop trigger if exists trigger_normalize_profile_role
on public.profiles;

create trigger trigger_normalize_profile_role
before insert or update of role
on public.profiles
for each row
execute function public.normalize_profile_role();



/* ============================================================
   3. CREATE PROFILE AFTER SUPABASE SIGNUP

   Supports:

   Email/password signup
   Google signup

   Does NOT trust role from frontend.

   Every new user becomes:
   role = user
============================================================ */

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare

  v_full_name text;
  v_avatar_url text;

begin

  /* ----------------------------------------------------------
     FULL NAME

     Google commonly sends:
     full_name
     name

     Email signup may send:
     full_name
  ---------------------------------------------------------- */

  v_full_name :=
    coalesce(
      nullif(
        new.raw_user_meta_data ->> 'full_name',
        ''
      ),

      nullif(
        new.raw_user_meta_data ->> 'name',
        ''
      ),

      nullif(
        split_part(
          coalesce(
            new.email,
            ''
          ),
          '@',
          1
        ),
        ''
      ),

      'User'
    );


  /* ----------------------------------------------------------
     PROFILE IMAGE
  ---------------------------------------------------------- */

  v_avatar_url :=
    coalesce(
      nullif(
        new.raw_user_meta_data ->> 'avatar_url',
        ''
      ),

      nullif(
        new.raw_user_meta_data ->> 'picture',
        ''
      )
    );


  /* ----------------------------------------------------------
     CREATE PROFILE
  ---------------------------------------------------------- */

  insert into public.profiles
  (
    id,
    email,
    full_name,
    avatar_url,
    role
  )
  values
  (
    new.id,
    new.email,
    v_full_name,
    v_avatar_url,
    'user'
  )

  on conflict (id)
  do update
  set

    email =
      excluded.email,

    full_name =
      coalesce(
        nullif(
          excluded.full_name,
          ''
        ),
        public.profiles.full_name
      ),

    avatar_url =
      coalesce(
        nullif(
          excluded.avatar_url,
          ''
        ),
        public.profiles.avatar_url
      ),

    updated_at =
      now();


  return new;

end;
$$;


/* ============================================================
   AUTH SIGNUP TRIGGER
============================================================ */

drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created

after insert
on auth.users

for each row

execute function public.handle_new_user();



/* ============================================================
   4. SYNC AUTH USER CHANGES TO PROFILE

   Useful if:

   Google changes avatar
   email changes
   auth metadata changes
============================================================ */

create or replace function public.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare

  v_full_name text;
  v_avatar_url text;

begin

  v_full_name :=
    coalesce(
      nullif(
        new.raw_user_meta_data ->> 'full_name',
        ''
      ),

      nullif(
        new.raw_user_meta_data ->> 'name',
        ''
      )
    );


  v_avatar_url :=
    coalesce(
      nullif(
        new.raw_user_meta_data ->> 'avatar_url',
        ''
      ),

      nullif(
        new.raw_user_meta_data ->> 'picture',
        ''
      )
    );


  update public.profiles
  set

    email =
      coalesce(
        new.email,
        email
      ),

    full_name =
      coalesce(
        v_full_name,
        full_name
      ),

    avatar_url =
      coalesce(
        v_avatar_url,
        avatar_url
      ),

    updated_at =
      now()

  where id =
    new.id;


  return new;

end;
$$;


/* AUTH UPDATE TRIGGER */

drop trigger if exists on_auth_user_updated
on auth.users;

create trigger on_auth_user_updated

after update of
  email,
  raw_user_meta_data

on auth.users

for each row

execute function public.sync_auth_user_profile();



/* ============================================================
   5. ADMIN CHECK

   Can be used inside RLS policies:

   public.is_admin()
============================================================ */

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$

  select exists (

    select 1

    from public.profiles

    where
      id = auth.uid()

      and lower(
        coalesce(
          role,
          ''
        )
      ) = 'admin'

  );

$$;


/* ============================================================
   FUNCTION PERMISSIONS
============================================================ */

revoke all
on function public.is_admin()
from public;

grant execute
on function public.is_admin()
to authenticated;



/* ============================================================
   6. PROTECT ROLE FROM NORMAL USER

   A normal logged-in user must NOT be able to do:

   role = admin

   Only:
   - existing admin
   - service role / database operations

   may change a role.
============================================================ */

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  /*
    If role did not change,
    allow normal profile editing.
  */

  if new.role is not distinct from old.role then
    return new;
  end if;


  /*
    auth.uid() = null means this is normally
    a trusted server/database operation.
  */

  if auth.uid() is null then
    return new;
  end if;


  /*
    Existing admin may change roles.
  */

  if public.is_admin() then
    return new;
  end if;


  /*
    Normal user cannot change role.
  */

  new.role :=
    old.role;


  return new;

end;
$$;


drop trigger if exists trigger_protect_profile_role
on public.profiles;

create trigger trigger_protect_profile_role
before update of role
on public.profiles
for each row
execute function public.protect_profile_role();



/* ============================================================
   7. PRODUCT STOCK VALIDATION

   Prevent database stock from becoming negative.
============================================================ */

create or replace function public.validate_product_stock()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin

  if new.stock is null then
    new.stock := 0;
  end if;


  if new.stock < 0 then

    raise exception
      'Product stock cannot be negative.';

  end if;


  return new;

end;
$$;


drop trigger if exists trigger_validate_product_stock
on public.products;

create trigger trigger_validate_product_stock

before insert or update of stock
on public.products

for each row

execute function public.validate_product_stock();



/* ============================================================
   8. CART VALIDATION

   Makes sure:

   quantity > 0
   product exists
   product is active
   requested quantity <= stock
============================================================ */

create or replace function public.validate_cart_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare

  v_stock integer;
  v_is_active boolean;
  v_product_name text;

begin

  /* ----------------------------------------------------------
     QUANTITY
  ---------------------------------------------------------- */

  if new.quantity is null
     or new.quantity <= 0 then

    raise exception
      'Cart quantity must be greater than zero.';

  end if;


  /* ----------------------------------------------------------
     GET PRODUCT
  ---------------------------------------------------------- */

  select
    p.stock,
    p.is_active,
    p.name

  into
    v_stock,
    v_is_active,
    v_product_name

  from public.products p

  where p.id =
    new.product_id;


  /* ----------------------------------------------------------
     PRODUCT EXISTS
  ---------------------------------------------------------- */

  if not found then

    raise exception
      'Product does not exist.';

  end if;


  /* ----------------------------------------------------------
     PRODUCT ACTIVE
  ---------------------------------------------------------- */

  if v_is_active is false then

    raise exception
      'This product is currently unavailable.';

  end if;


  /* ----------------------------------------------------------
     STOCK
  ---------------------------------------------------------- */

  if coalesce(
    v_stock,
    0
  ) <= 0 then

    raise exception
      '% is out of stock.',
      coalesce(
        v_product_name,
        'Product'
      );

  end if;


  if new.quantity >
     v_stock then

    raise exception
      'Only % units of % are available.',
      v_stock,
      coalesce(
        v_product_name,
        'this product'
      );

  end if;


  return new;

end;
$$;


drop trigger if exists trigger_validate_cart_item
on public.cart_items;

create trigger trigger_validate_cart_item

before insert or update of
  product_id,
  quantity

on public.cart_items

for each row

execute function public.validate_cart_item();



/* ============================================================
   9. ORDER ITEM VALIDATION

   Prevent invalid order lines.
============================================================ */

create or replace function public.validate_order_item()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin

  if new.quantity is null
     or new.quantity <= 0 then

    raise exception
      'Order item quantity must be greater than zero.';

  end if;


  if new.price is null
     or new.price < 0 then

    raise exception
      'Order item price cannot be negative.';

  end if;


  return new;

end;
$$;


drop trigger if exists trigger_validate_order_item
on public.order_items;

create trigger trigger_validate_order_item

before insert or update
on public.order_items

for each row

execute function public.validate_order_item();



/* ============================================================
   10. KEEP ORDER TOTAL SYNCHRONIZED

   total_amount =
     SUM(order_item.price * order_item.quantity)

   This prevents frontend-calculated totals from being trusted.
============================================================ */

create or replace function public.recalculate_order_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare

  v_order_id uuid;

begin

  v_order_id :=
    coalesce(
      new.order_id,
      old.order_id
    );


  update public.orders

  set

    total_amount =
      coalesce(
        (
          select
            sum(
              oi.price *
              oi.quantity
            )

          from public.order_items oi

          where oi.order_id =
            v_order_id
        ),
        0
      ),

    updated_at =
      now()

  where id =
    v_order_id;


  /*
    Handle rare case where an order_item
    gets moved to another order.
  */

  if
    tg_op = 'UPDATE'

    and old.order_id
      is distinct from
      new.order_id
  then

    update public.orders

    set

      total_amount =
        coalesce(
          (
            select
              sum(
                oi.price *
                oi.quantity
              )

            from public.order_items oi

            where oi.order_id =
              old.order_id
          ),
          0
        ),

      updated_at =
        now()

    where id =
      old.order_id;

  end if;


  return coalesce(
    new,
    old
  );

end;
$$;


drop trigger if exists trigger_recalculate_order_total
on public.order_items;

create trigger trigger_recalculate_order_total

after insert or update or delete
on public.order_items

for each row

execute function public.recalculate_order_total();



/* ============================================================
   11. PLACE COD ORDER

   THIS IS THE IMPORTANT CHECKOUT FUNCTION.

   Performs the whole checkout atomically:

   1. Logged-in user required
   2. Read user's cart
   3. Lock product rows
   4. Validate product stock
   5. Recalculate real DB prices
   6. Create COD order
   7. Create order_items
   8. Reduce stock
   9. Clear cart
   10. Return order information

   Never trust price / total sent from frontend.
============================================================ */

create or replace function public.place_cod_order(
  p_address jsonb default null,
  p_notes text default ''
)
returns table
(
  order_id uuid,
  total_amount numeric,
  payment_method text,
  payment_status text,
  order_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare

  v_user_id uuid;

  v_order_id uuid;

  v_total numeric(12, 2);

  v_cart_count integer;

  v_invalid_count integer;

begin

  /* =========================================================
     AUTH
  ========================================================= */

  v_user_id :=
    auth.uid();


  if v_user_id is null then

    raise exception
      'You must be logged in to place an order.';

  end if;



  /* =========================================================
     CART EXISTS
  ========================================================= */

  select
    count(*)

  into
    v_cart_count

  from public.cart_items ci

  where ci.user_id =
    v_user_id;


  if v_cart_count = 0 then

    raise exception
      'Your cart is empty.';

  end if;



  /* =========================================================
     LOCK PRODUCT ROWS

     Prevent two checkouts from consuming
     the same stock simultaneously.
  ========================================================= */

  perform
    p.id

  from public.products p

  inner join public.cart_items ci
    on ci.product_id =
       p.id

  where ci.user_id =
    v_user_id

  for update of p;



  /* =========================================================
     VALIDATE CART
  ========================================================= */

  select
    count(*)

  into
    v_invalid_count

  from public.cart_items ci

  inner join public.products p
    on p.id =
       ci.product_id

  where
    ci.user_id =
      v_user_id

    and
    (
      ci.quantity <= 0

      or p.is_active is false

      or p.stock <
         ci.quantity
    );


  if v_invalid_count > 0 then

    raise exception
      'One or more cart items are unavailable or do not have enough stock.';

  end if;



  /* =========================================================
     CALCULATE TOTAL

     Price ALWAYS comes from products table.

     discount_price when available,
     otherwise normal price.
  ========================================================= */

  select
    round(
      coalesce(
        sum(
          ci.quantity *
          coalesce(
            p.discount_price,
            p.price
          )
        ),
        0
      ),
      2
    )

  into
    v_total

  from public.cart_items ci

  inner join public.products p
    on p.id =
       ci.product_id

  where ci.user_id =
    v_user_id;


  if
    v_total is null
    or v_total <= 0
  then

    raise exception
      'Order total is invalid.';

  end if;



  /* =========================================================
     CREATE ORDER

     COD ONLY
  ========================================================= */

  insert into public.orders
  (
    user_id,

    total_amount,

    payment_method,

    payment_status,

    order_status,

    address,

    notes
  )
  values
  (
    v_user_id,

    v_total,

    'cod',

    'pending',

    'placed',

    p_address,

    coalesce(
      p_notes,
      ''
    )
  )

  returning id
  into v_order_id;



  /* =========================================================
     CREATE ORDER ITEMS

     Price snapshot is saved here.

     Very important:
     future product price changes will NOT
     alter existing order history.
  ========================================================= */

  insert into public.order_items
  (
    order_id,

    product_id,

    quantity,

    price
  )

  select

    v_order_id,

    p.id,

    ci.quantity,

    coalesce(
      p.discount_price,
      p.price
    )

  from public.cart_items ci

  inner join public.products p
    on p.id =
       ci.product_id

  where ci.user_id =
    v_user_id;



  /* =========================================================
     REDUCE STOCK

     Pack variants are independent product rows.

     Example:

     Amul Taaza 500 ml
     Amul Taaza 1 L
     Amul Taaza 2 L

     Selecting 2 L reduces ONLY
     stock of 2 L SKU.
  ========================================================= */

  update public.products p

  set

    stock =
      p.stock -
      ci.quantity,

    updated_at =
      now()

  from public.cart_items ci

  where

    ci.user_id =
      v_user_id

    and ci.product_id =
      p.id;



  /* =========================================================
     CLEAR USER CART
  ========================================================= */

  delete from public.cart_items

  where user_id =
    v_user_id;



  /* =========================================================
     RETURN ORDER
  ========================================================= */

  return query

  select

    o.id,

    o.total_amount,

    o.payment_method,

    o.payment_status,

    o.order_status

  from public.orders o

  where o.id =
    v_order_id;

end;
$$;



/* ============================================================
   RPC PERMISSIONS
============================================================ */

revoke all
on function public.place_cod_order(
  jsonb,
  text
)
from public;


grant execute
on function public.place_cod_order(
  jsonb,
  text
)
to authenticated;



/* ============================================================
   12. GET CURRENT USER CART SUMMARY

   Optional helper for:
   cart badge
   assistant
   checkout
============================================================ */

create or replace function public.get_my_cart_summary()
returns table
(
  total_items bigint,
  total_amount numeric
)
language sql
stable
security definer
set search_path = public
as $$

  select

    coalesce(
      sum(
        ci.quantity
      ),
      0
    )::bigint
      as total_items,

    coalesce(
      sum(
        ci.quantity *
        coalesce(
          p.discount_price,
          p.price
        )
      ),
      0
    )::numeric
      as total_amount

  from public.cart_items ci

  inner join public.products p
    on p.id =
       ci.product_id

  where ci.user_id =
    auth.uid();

$$;


revoke all
on function public.get_my_cart_summary()
from public;


grant execute
on function public.get_my_cart_summary()
to authenticated;



/* ============================================================
   13. GET CURRENT USER ORDER COUNT

   Useful for profile / assistant.
============================================================ */

create or replace function public.get_my_order_count()
returns bigint
language sql
stable
security definer
set search_path = public
as $$

  select
    count(*)::bigint

  from public.orders

  where user_id =
    auth.uid();

$$;


revoke all
on function public.get_my_order_count()
from public;


grant execute
on function public.get_my_order_count()
to authenticated;



/* ============================================================
   14. OPTIONAL DATABASE CHECKS

   These do not change data.
============================================================ */


/* CHECK PROFILE ROLES */

-- select
--   role,
--   count(*)
-- from public.profiles
-- group by role;


/* CHECK CART */

-- select *
-- from public.cart_items;


/* CHECK ORDERS */

-- select *
-- from public.orders
-- order by created_at desc;


/* CHECK ORDER ITEMS */

-- select *
-- from public.order_items;


/* ============================================================
   DONE
============================================================ */
