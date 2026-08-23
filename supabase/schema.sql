/* ============================================================
   ECHOO GROCERY VOICE SHOPPING ASSISTANT
   schema.sql

   RUN ORDER:

   1. schema.sql
   2. functions.sql
   3. policies.sql
   4. seed.sql
   5. product images / embeddings

   DATABASE DESIGN:

   products table = SKU rows

   Example:

   Amul Taaza Toned Milk
       500 ml -> one products row
       1 L    -> one products row
       2 L    -> one products row
       6 L    -> one products row

   Frontend groups these into ONE logical product.
============================================================ */


/* ============================================================
   EXTENSIONS
============================================================ */

create extension if not exists pgcrypto;

create extension if not exists vector;


/* ============================================================
   1. PROFILES
============================================================ */

create table if not exists public.profiles
(
    id uuid primary key
        references auth.users(id)
        on delete cascade,

    email text,

    full_name text,

    phone text,

    role text
        not null
        default 'user'
        check (
            role in (
                'user',
                'admin'
            )
        ),

    avatar_url text,

    /*
      Can hold:

      {
        "address_line_1": "...",
        "address_line_2": "...",
        "city": "...",
        "state": "...",
        "pincode": "...",
        "country": "India"
      }
    */

    address jsonb
        default '{}'::jsonb,

    created_at timestamptz
        not null
        default now(),

    updated_at timestamptz
        not null
        default now()
);


/* ============================================================
   PROFILE INDEXES
============================================================ */

create index if not exists
idx_profiles_email
on public.profiles(email);

create index if not exists
idx_profiles_role
on public.profiles(role);



/* ============================================================
   2. CATEGORIES
============================================================ */

create table if not exists public.categories
(
    id uuid primary key
        default gen_random_uuid(),

    name text
        not null,

    slug text
        not null
        unique,

    description text,

    image_url text,

    sort_order integer
        not null
        default 0,

    is_active boolean
        not null
        default true,

    created_at timestamptz
        not null
        default now(),

    updated_at timestamptz
        not null
        default now()
);


/* ============================================================
   CATEGORY INDEXES
============================================================ */

create index if not exists
idx_categories_slug
on public.categories(slug);

create index if not exists
idx_categories_active
on public.categories(is_active);

create index if not exists
idx_categories_sort_order
on public.categories(sort_order);



/* ============================================================
   3. PRODUCTS

   IMPORTANT:

   Every row = one purchasable SKU / pack option.
============================================================ */

create table if not exists public.products
(
    id uuid primary key
        default gen_random_uuid(),

    category_id uuid
        references public.categories(id)
        on delete set null,


    /* --------------------------------------------------------
       LOGICAL PRODUCT
    -------------------------------------------------------- */

    name text
        not null,

    slug text
        not null
        unique,

    brand text,


    /* --------------------------------------------------------
       OPTIONAL GROUP KEY

       Example:

       amul-taaza-toned-milk

       Can later replace frontend name-based grouping.
    -------------------------------------------------------- */

    product_group_key text,


    /* --------------------------------------------------------
       DESCRIPTION
    -------------------------------------------------------- */

    description text,

    short_description text,


    /* --------------------------------------------------------
       PRICE

       Indian Rupees
    -------------------------------------------------------- */

    price numeric(12,2)
        not null
        default 0
        check (
            price >= 0
        ),

    discount_price numeric(12,2)
        check (
            discount_price is null
            or discount_price >= 0
        ),


    /* --------------------------------------------------------
       STOCK

       Stock belongs to THIS SKU only.
    -------------------------------------------------------- */

    stock integer
        not null
        default 0
        check (
            stock >= 0
        ),


    /* --------------------------------------------------------
       PACK INFORMATION

       Example:

       quantity = 500
       unit     = ml
       pack_size = 500 ml
    -------------------------------------------------------- */

    quantity numeric(12,3),

    unit text,

    pack_size text,


    /* --------------------------------------------------------
       RATING
    -------------------------------------------------------- */

    rating numeric(3,2)
        not null
        default 0
        check (
            rating >= 0
            and rating <= 5
        ),


    /* --------------------------------------------------------
       CURRENCY
    -------------------------------------------------------- */

    currency text
        not null
        default 'INR',


    /* --------------------------------------------------------
       FLAGS
    -------------------------------------------------------- */

    is_featured boolean
        not null
        default false,

    is_active boolean
        not null
        default true,


    /* --------------------------------------------------------
       FLEXIBLE PRODUCT DATA
    -------------------------------------------------------- */

    features jsonb
        not null
        default '[]'::jsonb,

    specs jsonb
        not null
        default '{}'::jsonb,

    variants jsonb
        not null
        default '{}'::jsonb,


    /* --------------------------------------------------------
       TIMESTAMPS
    -------------------------------------------------------- */

    created_at timestamptz
        not null
        default now(),

    updated_at timestamptz
        not null
        default now(),


    /* --------------------------------------------------------
       PRICE VALIDATION
    -------------------------------------------------------- */

    constraint products_discount_price_valid
    check
    (
        discount_price is null
        or discount_price <= price
    )
);


/* ============================================================
   PRODUCT INDEXES
============================================================ */

create index if not exists
idx_products_category_id
on public.products(category_id);

create index if not exists
idx_products_name
on public.products(name);

create index if not exists
idx_products_brand
on public.products(brand);

create index if not exists
idx_products_slug
on public.products(slug);

create index if not exists
idx_products_group_key
on public.products(product_group_key);

create index if not exists
idx_products_price
on public.products(price);

create index if not exists
idx_products_discount_price
on public.products(discount_price);

create index if not exists
idx_products_stock
on public.products(stock);

create index if not exists
idx_products_featured
on public.products(is_featured);

create index if not exists
idx_products_active
on public.products(is_active);

create index if not exists
idx_products_brand_name
on public.products(brand, name);


/* ============================================================
   JSON INDEXES
============================================================ */

create index if not exists
idx_products_features_gin
on public.products
using gin(features);

create index if not exists
idx_products_specs_gin
on public.products
using gin(specs);



/* ============================================================
   4. PRODUCT IMAGES
============================================================ */

create table if not exists public.product_images
(
    id uuid primary key
        default gen_random_uuid(),

    product_id uuid
        not null
        references public.products(id)
        on delete cascade,

    image_url text
        not null,

    is_primary boolean
        not null
        default false,

    sort_order integer
        not null
        default 0,

    created_at timestamptz
        not null
        default now()
);


/* ============================================================
   PRODUCT IMAGE INDEXES
============================================================ */

create index if not exists
idx_product_images_product
on public.product_images(product_id);

create index if not exists
idx_product_images_primary
on public.product_images(
    product_id,
    is_primary
);

create index if not exists
idx_product_images_sort
on public.product_images(
    product_id,
    sort_order
);


/* Prevent same image being inserted twice */

create unique index if not exists
idx_product_images_unique_url
on public.product_images(
    product_id,
    image_url
);



/* ============================================================
   5. CART ITEMS

   product_id = EXACT SKU ID.

   Example:

   user selected:

       Amul Milk
       2 L

   product_id points to the 2 L products row.
============================================================ */

create table if not exists public.cart_items
(
    id uuid primary key
        default gen_random_uuid(),

    user_id uuid
        not null
        references auth.users(id)
        on delete cascade,

    product_id uuid
        not null
        references public.products(id)
        on delete cascade,

    quantity integer
        not null
        default 1
        check (
            quantity > 0
        ),

    created_at timestamptz
        not null
        default now(),

    updated_at timestamptz
        not null
        default now(),


    /*
      Same SKU should only appear once
      in one user's cart.

      Increasing quantity updates the row.
    */

    constraint cart_items_user_product_unique
    unique (
        user_id,
        product_id
    )
);


/* ============================================================
   CART INDEXES
============================================================ */

create index if not exists
idx_cart_items_user
on public.cart_items(user_id);

create index if not exists
idx_cart_items_product
on public.cart_items(product_id);

create index if not exists
idx_cart_items_created
on public.cart_items(created_at);



/* ============================================================
   6. ORDERS

   COD ONLY
============================================================ */

create table if not exists public.orders
(
    id uuid primary key
        default gen_random_uuid(),

    user_id uuid
        not null
        references auth.users(id)
        on delete restrict,


    /* --------------------------------------------------------
       PRICE SUMMARY
    -------------------------------------------------------- */

    subtotal numeric(12,2)
        not null
        default 0
        check (
            subtotal >= 0
        ),

    delivery_fee numeric(12,2)
        not null
        default 0
        check (
            delivery_fee >= 0
        ),

    discount_amount numeric(12,2)
        not null
        default 0
        check (
            discount_amount >= 0
        ),

    total_amount numeric(12,2)
        not null
        default 0
        check (
            total_amount >= 0
        ),


    /* --------------------------------------------------------
       CURRENCY
    -------------------------------------------------------- */

    currency text
        not null
        default 'INR',


    /* --------------------------------------------------------
       PAYMENT

       Current project:
       Cash on Delivery only
    -------------------------------------------------------- */

    payment_method text
        not null
        default 'cod'
        check (
            payment_method = 'cod'
        ),

    payment_status text
        not null
        default 'pending'
        check (
            payment_status in (
                'pending',
                'paid',
                'failed',
                'refunded',
                'cancelled'
            )
        ),

    payment_id text,


    /* --------------------------------------------------------
       ORDER STATUS
    -------------------------------------------------------- */

    order_status text
        not null
        default 'placed'
        check (
            order_status in (
                'placed',
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'out_for_delivery',
                'delivered',
                'completed',
                'cancelled'
            )
        ),


    /* --------------------------------------------------------
       ADDRESS SNAPSHOT

       Store address at time of order.

       Changing profile address later must not alter
       historical orders.
    -------------------------------------------------------- */

    address jsonb
        not null
        default '{}'::jsonb,


    notes text,


    /* --------------------------------------------------------
       TIMESTAMPS
    -------------------------------------------------------- */

    created_at timestamptz
        not null
        default now(),

    updated_at timestamptz
        not null
        default now()
);


/* ============================================================
   ORDER INDEXES
============================================================ */

create index if not exists
idx_orders_user
on public.orders(user_id);

create index if not exists
idx_orders_created
on public.orders(created_at desc);

create index if not exists
idx_orders_status
on public.orders(order_status);

create index if not exists
idx_orders_payment_status
on public.orders(payment_status);

create index if not exists
idx_orders_user_created
on public.orders(
    user_id,
    created_at desc
);



/* ============================================================
   7. ORDER ITEMS

   Historical snapshot of purchased SKU.

   IMPORTANT:

   Product prices can change later.

   The price stored here is the price at checkout.
============================================================ */

create table if not exists public.order_items
(
    id uuid primary key
        default gen_random_uuid(),

    order_id uuid
        not null
        references public.orders(id)
        on delete cascade,

    product_id uuid
        references public.products(id)
        on delete set null,


    /* --------------------------------------------------------
       OPTIONAL PRODUCT SNAPSHOT

       Keeps order readable even if product later changes.
    -------------------------------------------------------- */

    product_name text,

    brand text,

    pack_size text,


    /* --------------------------------------------------------
       QUANTITY
    -------------------------------------------------------- */

    quantity integer
        not null
        check (
            quantity > 0
        ),


    /* --------------------------------------------------------
       HISTORICAL UNIT PRICE

       functions.sql currently writes "price".
    -------------------------------------------------------- */

    price numeric(12,2)
        not null
        check (
            price >= 0
        ),


    /*
      Compatibility aliases for backend.

      Backend can read:

      unit_price
      total_price

      while frontend/functions continue to use:

      price
    */

    unit_price numeric(12,2)
        generated always as (
            price
        ) stored,

    total_price numeric(14,2)
        generated always as (
            price * quantity
        ) stored,


    created_at timestamptz
        not null
        default now()
);


/* ============================================================
   ORDER ITEM INDEXES
============================================================ */

create index if not exists
idx_order_items_order
on public.order_items(order_id);

create index if not exists
idx_order_items_product
on public.order_items(product_id);

create index if not exists
idx_order_items_created
on public.order_items(created_at);



/* ============================================================
   8. PAYMENTS

   Current project is COD.

   Table is retained because:
   - existing APIs already reference it
   - future payment support can use it
   - COD payment confirmation can also be recorded here
============================================================ */

create table if not exists public.payments
(
    id uuid primary key
        default gen_random_uuid(),

    order_id uuid
        not null
        references public.orders(id)
        on delete cascade,

    user_id uuid
        not null
        references auth.users(id)
        on delete restrict,

    provider text
        not null
        default 'cod',

    payment_id text,

    amount numeric(12,2)
        not null
        default 0
        check (
            amount >= 0
        ),

    status text
        not null
        default 'pending'
        check (
            status in (
                'pending',
                'paid',
                'failed',
                'refunded',
                'cancelled'
            )
        ),

    raw_response jsonb,

    created_at timestamptz
        not null
        default now(),

    updated_at timestamptz
        not null
        default now()
);


/* ============================================================
   PAYMENT INDEXES
============================================================ */

create index if not exists
idx_payments_order
on public.payments(order_id);

create index if not exists
idx_payments_user
on public.payments(user_id);

create index if not exists
idx_payments_status
on public.payments(status);

create index if not exists
idx_payments_provider
on public.payments(provider);


/*
  Usually one payment record per order for COD.
*/

create unique index if not exists
idx_payments_order_unique
on public.payments(order_id);



/* ============================================================
   9. PRODUCT EMBEDDINGS

   Used for semantic search / RAG.

   all-MiniLM-L6-v2:
   384 dimensions
============================================================ */

create table if not exists public.product_embeddings
(
    id uuid primary key
        default gen_random_uuid(),

    product_id uuid
        not null
        references public.products(id)
        on delete cascade,

    /*
      Text that was embedded.
    */

    content text
        not null,

    embedding vector(384),

    embedding_model text
        default 'sentence-transformers/all-MiniLM-L6-v2',

    metadata jsonb
        not null
        default '{}'::jsonb,

    created_at timestamptz
        not null
        default now(),

    updated_at timestamptz
        not null
        default now(),

    constraint product_embeddings_product_unique
    unique(product_id)
);


/* ============================================================
   EMBEDDING INDEXES
============================================================ */

create index if not exists
idx_product_embeddings_product
on public.product_embeddings(product_id);


/*
  Create vector index after embeddings exist.

  For a small assessment dataset this is optional.

  Uncomment later if required.
*/

/*
create index if not exists
idx_product_embeddings_vector
on public.product_embeddings
using ivfflat (
    embedding vector_cosine_ops
)
with (
    lists = 20
);
*/



/* ============================================================
   10. OPTIONAL LOGICAL PRODUCT DESCRIPTION TABLE

   One row per logical product.

   Your operational products table contains SKU rows.

   This table can contain:

   48 rows
   rather than
   200 SKU rows.

   Useful for RAG/search descriptions.
============================================================ */

create table if not exists public.product_descriptions
(
    id uuid primary key
        default gen_random_uuid(),

    logical_product_key text
        not null
        unique,

    product_name text
        not null,

    brand text,

    category_id uuid
        references public.categories(id)
        on delete set null,

    category_slug text,

    product_domain text,

    description text
        not null,

    semantic_tags text[]
        not null
        default '{}'::text[],

    use_cases text[]
        not null
        default '{}'::text[],

    meal_contexts text[]
        not null
        default '{}'::text[],

    health_tags text[]
        not null
        default '{}'::text[],

    health_context text,

    rag_text text,

    embedding vector(384),

    embedding_model text,

    embedding_updated_at timestamptz,

    is_active boolean
        not null
        default true,

    created_at timestamptz
        not null
        default now(),

    updated_at timestamptz
        not null
        default now()
);


/* ============================================================
   PRODUCT DESCRIPTION INDEXES
============================================================ */

create index if not exists
idx_product_descriptions_category
on public.product_descriptions(category_id);

create index if not exists
idx_product_descriptions_category_slug
on public.product_descriptions(category_slug);

create index if not exists
idx_product_descriptions_brand
on public.product_descriptions(brand);

create index if not exists
idx_product_descriptions_active
on public.product_descriptions(is_active);

create index if not exists
idx_product_descriptions_semantic_tags
on public.product_descriptions
using gin(semantic_tags);

create index if not exists
idx_product_descriptions_use_cases
on public.product_descriptions
using gin(use_cases);



/* ============================================================
   11. USEFUL VIEW:
   LOGICAL PRODUCT SUMMARY

   This DOES NOT replace products.

   It just helps inspect:

   200 SKUs
        ↓
   logical grocery products
============================================================ */

create or replace view public.logical_product_summary
as

select

    lower(
        trim(
            coalesce(
                brand,
                ''
            )
        )
    )
    ||
    '::'
    ||
    lower(
        trim(name)
    )
        as logical_product_key,

    name,

    brand,

    category_id,

    count(*)::integer
        as sku_count,

    count(*) filter (
        where is_active = true
    )::integer
        as active_sku_count,

    count(*) filter (
        where
            is_active = true
            and stock > 0
    )::integer
        as available_sku_count,

    coalesce(
        sum(stock),
        0
    )::integer
        as total_stock,

    min(
        coalesce(
            discount_price,
            price
        )
    )
        as min_price,

    max(
        coalesce(
            discount_price,
            price
        )
    )
        as max_price,

    round(
        avg(rating),
        2
    )
        as average_rating,

    bool_or(is_featured)
        as is_featured,

    array_agg(
        pack_size
        order by quantity
    )
    filter (
        where pack_size is not null
    )
        as pack_options

from public.products

group by

    lower(
        trim(
            coalesce(
                brand,
                ''
            )
        )
    ),

    lower(
        trim(name)
    ),

    name,

    brand,

    category_id;



/* ============================================================
   12. BASIC DATABASE GRANTS

   RLS POLICIES ARE CREATED IN policies.sql.
============================================================ */

grant usage
on schema public
to anon, authenticated;


/* ============================================================
   13. VERIFY TABLES
============================================================ */

/*

select
    table_name

from information_schema.tables

where
    table_schema = 'public'

order by
    table_name;

*/


/* ============================================================
   14. VERIFY PRODUCTS / SKUS
============================================================ */

/*

select
    count(*) as sku_rows
from public.products;

*/


/* ============================================================
   15. VERIFY LOGICAL PRODUCTS
============================================================ */

/*

select
    count(*) as logical_products
from public.logical_product_summary;

*/


/* ============================================================
   16. VERIFY PACK VARIANTS
============================================================ */

/*

select
    name,
    brand,
    sku_count,
    pack_options

from public.logical_product_summary

order by name;

*/


/* ============================================================
   DONE
============================================================ */
