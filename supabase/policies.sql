/* ============================================================
   ECHOO GROCERY SHOPPING ASSISTANT
   policies.sql

   Run AFTER:
   1. tables.sql
   2. functions.sql

   Roles:
   - anonymous
   - authenticated user
   - admin (profiles.role = 'admin')

   Tables:
   - profiles
   - categories
   - products
   - product_images
   - cart_items
   - orders
   - order_items
   - payments
   - product_embeddings
============================================================ */


/* ============================================================
   1. ENABLE ROW LEVEL SECURITY
============================================================ */

alter table public.profiles
enable row level security;

alter table public.categories
enable row level security;

alter table public.products
enable row level security;

alter table public.product_images
enable row level security;

alter table public.cart_items
enable row level security;

alter table public.orders
enable row level security;

alter table public.order_items
enable row level security;

alter table public.payments
enable row level security;

alter table public.product_embeddings
enable row level security;



/* ============================================================
   2. PROFILES
============================================================ */


/* ------------------------------------------------------------
   DROP OLD POLICIES
------------------------------------------------------------ */

drop policy if exists
"profiles_select_own"
on public.profiles;

drop policy if exists
"profiles_update_own"
on public.profiles;

drop policy if exists
"profiles_admin_select"
on public.profiles;

drop policy if exists
"profiles_admin_update"
on public.profiles;

drop policy if exists
"profiles_admin_delete"
on public.profiles;

drop policy if exists
"profiles_admin_insert"
on public.profiles;


/* ------------------------------------------------------------
   USER: READ OWN PROFILE
------------------------------------------------------------ */

create policy
"profiles_select_own"

on public.profiles

for select

to authenticated

using (
  id = auth.uid()
);


/* ------------------------------------------------------------
   USER: UPDATE OWN PROFILE

   Role protection is already handled by
   protect_profile_role() trigger.
------------------------------------------------------------ */

create policy
"profiles_update_own"

on public.profiles

for update

to authenticated

using (
  id = auth.uid()
)

with check (
  id = auth.uid()
);


/* ------------------------------------------------------------
   ADMIN: READ ALL PROFILES
------------------------------------------------------------ */

create policy
"profiles_admin_select"

on public.profiles

for select

to authenticated

using (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN: UPDATE ANY PROFILE
------------------------------------------------------------ */

create policy
"profiles_admin_update"

on public.profiles

for update

to authenticated

using (
  public.is_admin()
)

with check (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN: DELETE PROFILE
------------------------------------------------------------ */

create policy
"profiles_admin_delete"

on public.profiles

for delete

to authenticated

using (
  public.is_admin()
);


/*
  No normal-user INSERT policy is needed.

  New profiles are automatically created by:

  public.handle_new_user()

  after auth.users signup.
*/



/* ============================================================
   3. CATEGORIES
============================================================ */

drop policy if exists
"categories_public_read"
on public.categories;

drop policy if exists
"categories_admin_insert"
on public.categories;

drop policy if exists
"categories_admin_update"
on public.categories;

drop policy if exists
"categories_admin_delete"
on public.categories;


/* ------------------------------------------------------------
   EVERYONE CAN READ CATEGORIES
------------------------------------------------------------ */

create policy
"categories_public_read"

on public.categories

for select

to anon, authenticated

using (
  true
);


/* ------------------------------------------------------------
   ADMIN CREATE
------------------------------------------------------------ */

create policy
"categories_admin_insert"

on public.categories

for insert

to authenticated

with check (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN UPDATE
------------------------------------------------------------ */

create policy
"categories_admin_update"

on public.categories

for update

to authenticated

using (
  public.is_admin()
)

with check (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN DELETE
------------------------------------------------------------ */

create policy
"categories_admin_delete"

on public.categories

for delete

to authenticated

using (
  public.is_admin()
);



/* ============================================================
   4. PRODUCTS
============================================================ */

drop policy if exists
"products_public_read_active"
on public.products;

drop policy if exists
"products_admin_read_all"
on public.products;

drop policy if exists
"products_admin_insert"
on public.products;

drop policy if exists
"products_admin_update"
on public.products;

drop policy if exists
"products_admin_delete"
on public.products;


/* ------------------------------------------------------------
   CUSTOMER / GUEST

   Only active products are visible.
------------------------------------------------------------ */

create policy
"products_public_read_active"

on public.products

for select

to anon, authenticated

using (
  is_active = true
);


/* ------------------------------------------------------------
   ADMIN CAN SEE ACTIVE + INACTIVE
------------------------------------------------------------ */

create policy
"products_admin_read_all"

on public.products

for select

to authenticated

using (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN CREATE PRODUCT
------------------------------------------------------------ */

create policy
"products_admin_insert"

on public.products

for insert

to authenticated

with check (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN UPDATE PRODUCT
------------------------------------------------------------ */

create policy
"products_admin_update"

on public.products

for update

to authenticated

using (
  public.is_admin()
)

with check (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN DELETE PRODUCT
------------------------------------------------------------ */

create policy
"products_admin_delete"

on public.products

for delete

to authenticated

using (
  public.is_admin()
);



/* ============================================================
   5. PRODUCT IMAGES
============================================================ */

drop policy if exists
"product_images_public_read"
on public.product_images;

drop policy if exists
"product_images_admin_insert"
on public.product_images;

drop policy if exists
"product_images_admin_update"
on public.product_images;

drop policy if exists
"product_images_admin_delete"
on public.product_images;


/* ------------------------------------------------------------
   PUBLIC READ

   Only expose images belonging to active products.
------------------------------------------------------------ */

create policy
"product_images_public_read"

on public.product_images

for select

to anon, authenticated

using (
  exists (
    select 1
    from public.products p

    where
      p.id = product_images.product_id
      and p.is_active = true
  )
  or public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN INSERT IMAGE
------------------------------------------------------------ */

create policy
"product_images_admin_insert"

on public.product_images

for insert

to authenticated

with check (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN UPDATE IMAGE
------------------------------------------------------------ */

create policy
"product_images_admin_update"

on public.product_images

for update

to authenticated

using (
  public.is_admin()
)

with check (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN DELETE IMAGE
------------------------------------------------------------ */

create policy
"product_images_admin_delete"

on public.product_images

for delete

to authenticated

using (
  public.is_admin()
);



/* ============================================================
   6. CART ITEMS
============================================================ */

drop policy if exists
"cart_select_own"
on public.cart_items;

drop policy if exists
"cart_insert_own"
on public.cart_items;

drop policy if exists
"cart_update_own"
on public.cart_items;

drop policy if exists
"cart_delete_own"
on public.cart_items;

drop policy if exists
"cart_admin_select"
on public.cart_items;


/* ------------------------------------------------------------
   USER READ OWN CART
------------------------------------------------------------ */

create policy
"cart_select_own"

on public.cart_items

for select

to authenticated

using (
  user_id = auth.uid()
);


/* ------------------------------------------------------------
   USER ADD TO OWN CART
------------------------------------------------------------ */

create policy
"cart_insert_own"

on public.cart_items

for insert

to authenticated

with check (
  user_id = auth.uid()
);


/* ------------------------------------------------------------
   USER UPDATE OWN CART
------------------------------------------------------------ */

create policy
"cart_update_own"

on public.cart_items

for update

to authenticated

using (
  user_id = auth.uid()
)

with check (
  user_id = auth.uid()
);


/* ------------------------------------------------------------
   USER REMOVE FROM OWN CART
------------------------------------------------------------ */

create policy
"cart_delete_own"

on public.cart_items

for delete

to authenticated

using (
  user_id = auth.uid()
);


/* ------------------------------------------------------------
   ADMIN OPTIONAL READ
------------------------------------------------------------ */

create policy
"cart_admin_select"

on public.cart_items

for select

to authenticated

using (
  public.is_admin()
);



/* ============================================================
   7. ORDERS
============================================================ */

drop policy if exists
"orders_select_own"
on public.orders;

drop policy if exists
"orders_admin_select"
on public.orders;

drop policy if exists
"orders_admin_update"
on public.orders;

drop policy if exists
"orders_admin_delete"
on public.orders;


/* ------------------------------------------------------------
   CUSTOMER CAN SEE OWN ORDERS
------------------------------------------------------------ */

create policy
"orders_select_own"

on public.orders

for select

to authenticated

using (
  user_id = auth.uid()
);


/*
  IMPORTANT:

  No customer INSERT policy.

  Customers create orders through:

  public.place_cod_order()

  This prevents frontend manipulation of:

  total_amount
  price
  stock
  payment status
*/


/* ------------------------------------------------------------
   ADMIN READ ALL ORDERS
------------------------------------------------------------ */

create policy
"orders_admin_select"

on public.orders

for select

to authenticated

using (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN UPDATE ORDERS

   Example:

   placed
   confirmed
   shipped
   delivered
   cancelled
------------------------------------------------------------ */

create policy
"orders_admin_update"

on public.orders

for update

to authenticated

using (
  public.is_admin()
)

with check (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN DELETE ORDER
------------------------------------------------------------ */

create policy
"orders_admin_delete"

on public.orders

for delete

to authenticated

using (
  public.is_admin()
);



/* ============================================================
   8. ORDER ITEMS
============================================================ */

drop policy if exists
"order_items_select_own"
on public.order_items;

drop policy if exists
"order_items_admin_select"
on public.order_items;

drop policy if exists
"order_items_admin_update"
on public.order_items;

drop policy if exists
"order_items_admin_delete"
on public.order_items;


/* ------------------------------------------------------------
   USER READ ITEMS OF OWN ORDERS
------------------------------------------------------------ */

create policy
"order_items_select_own"

on public.order_items

for select

to authenticated

using (
  exists (
    select 1

    from public.orders o

    where
      o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);


/*
  No customer INSERT policy.

  order_items are created by:

  public.place_cod_order()
*/


/* ------------------------------------------------------------
   ADMIN READ ALL ORDER ITEMS
------------------------------------------------------------ */

create policy
"order_items_admin_select"

on public.order_items

for select

to authenticated

using (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN UPDATE
------------------------------------------------------------ */

create policy
"order_items_admin_update"

on public.order_items

for update

to authenticated

using (
  public.is_admin()
)

with check (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN DELETE
------------------------------------------------------------ */

create policy
"order_items_admin_delete"

on public.order_items

for delete

to authenticated

using (
  public.is_admin()
);



/* ============================================================
   9. PAYMENTS

   Project currently uses Cash On Delivery.

   Keep table protected in case it is retained for future use.
============================================================ */

drop policy if exists
"payments_select_own"
on public.payments;

drop policy if exists
"payments_admin_select"
on public.payments;

drop policy if exists
"payments_admin_insert"
on public.payments;

drop policy if exists
"payments_admin_update"
on public.payments;

drop policy if exists
"payments_admin_delete"
on public.payments;


/* ------------------------------------------------------------
   CUSTOMER CAN ONLY READ PAYMENT RECORDS
   RELATED TO OWN ORDERS
------------------------------------------------------------ */

create policy
"payments_select_own"

on public.payments

for select

to authenticated

using (
  exists (
    select 1

    from public.orders o

    where
      o.id = payments.order_id
      and o.user_id = auth.uid()
  )
);


/* ------------------------------------------------------------
   ADMIN READ
------------------------------------------------------------ */

create policy
"payments_admin_select"

on public.payments

for select

to authenticated

using (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN INSERT
------------------------------------------------------------ */

create policy
"payments_admin_insert"

on public.payments

for insert

to authenticated

with check (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN UPDATE
------------------------------------------------------------ */

create policy
"payments_admin_update"

on public.payments

for update

to authenticated

using (
  public.is_admin()
)

with check (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN DELETE
------------------------------------------------------------ */

create policy
"payments_admin_delete"

on public.payments

for delete

to authenticated

using (
  public.is_admin()
);



/* ============================================================
   10. PRODUCT EMBEDDINGS

   Used internally for semantic/RAG search.

   Do NOT expose embedding vectors publicly.

   Backend/service role should normally manage this table.
============================================================ */

drop policy if exists
"product_embeddings_admin_select"
on public.product_embeddings;

drop policy if exists
"product_embeddings_admin_insert"
on public.product_embeddings;

drop policy if exists
"product_embeddings_admin_update"
on public.product_embeddings;

drop policy if exists
"product_embeddings_admin_delete"
on public.product_embeddings;


/* ------------------------------------------------------------
   ADMIN SELECT
------------------------------------------------------------ */

create policy
"product_embeddings_admin_select"

on public.product_embeddings

for select

to authenticated

using (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN INSERT
------------------------------------------------------------ */

create policy
"product_embeddings_admin_insert"

on public.product_embeddings

for insert

to authenticated

with check (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN UPDATE
------------------------------------------------------------ */

create policy
"product_embeddings_admin_update"

on public.product_embeddings

for update

to authenticated

using (
  public.is_admin()
)

with check (
  public.is_admin()
);


/* ------------------------------------------------------------
   ADMIN DELETE
------------------------------------------------------------ */

create policy
"product_embeddings_admin_delete"

on public.product_embeddings

for delete

to authenticated

using (
  public.is_admin()
);



/* ============================================================
   11. GRANTS

   RLS decides WHICH rows users can access.
   Grants decide WHICH operations are available.
============================================================ */


/* ------------------------------------------------------------
   PUBLIC CATALOGUE
------------------------------------------------------------ */

grant select
on public.categories
to anon, authenticated;

grant select
on public.products
to anon, authenticated;

grant select
on public.product_images
to anon, authenticated;


/* ------------------------------------------------------------
   PROFILES
------------------------------------------------------------ */

grant select, update
on public.profiles
to authenticated;


/* ------------------------------------------------------------
   CART
------------------------------------------------------------ */

grant select, insert, update, delete
on public.cart_items
to authenticated;


/* ------------------------------------------------------------
   ORDERS

   No normal INSERT needed because
   place_cod_order() handles creation.
------------------------------------------------------------ */

grant select, update, delete
on public.orders
to authenticated;


/* ------------------------------------------------------------
   ORDER ITEMS
------------------------------------------------------------ */

grant select, update, delete
on public.order_items
to authenticated;


/* ------------------------------------------------------------
   PAYMENTS
------------------------------------------------------------ */

grant select, insert, update, delete
on public.payments
to authenticated;


/* ------------------------------------------------------------
   ADMIN CRUD

   RLS still checks public.is_admin().
------------------------------------------------------------ */

grant insert, update, delete
on public.categories
to authenticated;

grant insert, update, delete
on public.products
to authenticated;

grant insert, update, delete
on public.product_images
to authenticated;


/* ============================================================
   12. OPTIONAL SECURITY HARDENING

   Anonymous users should not modify anything.
============================================================ */

revoke insert, update, delete
on public.profiles
from anon;

revoke insert, update, delete
on public.categories
from anon;

revoke insert, update, delete
on public.products
from anon;

revoke insert, update, delete
on public.product_images
from anon;

revoke insert, update, delete
on public.cart_items
from anon;

revoke insert, update, delete
on public.orders
from anon;

revoke insert, update, delete
on public.order_items
from anon;

revoke insert, update, delete
on public.payments
from anon;

revoke all
on public.product_embeddings
from anon;



/* ============================================================
   13. TEST QUERIES

   Run separately when needed.
============================================================ */


/* ACTIVE PRODUCTS */

-- select
--   name,
--   pack_size,
--   price,
--   stock
-- from public.products
-- where is_active = true;


/* USERS */

-- select
--   id,
--   email,
--   full_name,
--   role
-- from public.profiles;


/* ORDERS */

-- select
--   id,
--   user_id,
--   total_amount,
--   payment_method,
--   payment_status,
--   order_status
-- from public.orders
-- order by created_at desc;


/* ============================================================
   DONE
============================================================ */
