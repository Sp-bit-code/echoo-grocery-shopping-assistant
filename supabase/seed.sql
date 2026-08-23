-- =========================================================
-- Voice Grocery Shopping Assistant - Indian Grocery Seed Data
-- Products: 200
-- Image records: 200 (remote public image URLs only)
--
-- NOTE:
-- products.price is used as MRP.
-- discount_price is intentionally NULL for initial seed data.
-- Prices are representative Indian-market seed values and can
-- later be edited from the Admin Dashboard.
-- =========================================================

begin;

-- Fresh seed. Run this only when you want to reset product seed data.
delete from public.product_images;
delete from public.product_embeddings;
delete from public.products;

-- =========================================================
-- INSERT 200 PRODUCTS
-- =========================================================

insert into public.products (
    category_id,
    name,
    slug,
    brand,
    description,
    short_description,
    price,
    discount_price,
    stock,
    quantity,
    unit,
    pack_size,
    rating,
    is_featured,
    is_active,
    variants,
    features,
    specs,
    currency
) values
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Amul Taaza Toned Milk', 'amul-taaza-toned-milk-500-ml', 'Amul', 'Everyday toned milk for tea, coffee, cereals and household use.', 'Amul Taaza Toned Milk - 500 ml.', 29.00, null, 50, 500.00, 'ml', '500 ml', 4.2, false, true, '{}'::jsonb, '["Brand: Amul", "Pack size: 500 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "500 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Amul Taaza Toned Milk', 'amul-taaza-toned-milk-1-l', 'Amul', 'Everyday toned milk for tea, coffee, cereals and household use.', 'Amul Taaza Toned Milk - 1 L.', 58.00, null, 151, 1.00, 'L', '1 L', 4.5, false, true, '{}'::jsonb, '["Brand: Amul", "Pack size: 1 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Amul Taaza Toned Milk', 'amul-taaza-toned-milk-2-l', 'Amul', 'Everyday toned milk for tea, coffee, cereals and household use.', 'Amul Taaza Toned Milk - 2 L.', 116.00, null, 46, 2.00, 'L', '2 L', 4.1, false, true, '{}'::jsonb, '["Brand: Amul", "Pack size: 2 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "2 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Amul Taaza Toned Milk', 'amul-taaza-toned-milk-6-l', 'Amul', 'Everyday toned milk for tea, coffee, cereals and household use.', 'Amul Taaza Toned Milk - 6 L.', 348.00, null, 179, 6.00, 'L', '6 L', 4.4, false, true, '{}'::jsonb, '["Brand: Amul", "Pack size: 6 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "6 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Amul Pasteurised Butter', 'amul-pasteurised-butter-100-g', 'Amul', 'Salted pasteurised butter for toast, cooking, baking and everyday breakfast.', 'Amul Pasteurised Butter - 100 g.', 62.00, null, 166, 100.00, 'g', '100 g', 4.4, false, true, '{}'::jsonb, '["Brand: Amul", "Pack size: 100 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "100 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Amul Pasteurised Butter', 'amul-pasteurised-butter-200-g', 'Amul', 'Salted pasteurised butter for toast, cooking, baking and everyday breakfast.', 'Amul Pasteurised Butter - 200 g.', 120.00, null, 145, 200.00, 'g', '200 g', 4.4, false, true, '{}'::jsonb, '["Brand: Amul", "Pack size: 200 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "200 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Amul Pasteurised Butter', 'amul-pasteurised-butter-500-g', 'Amul', 'Salted pasteurised butter for toast, cooking, baking and everyday breakfast.', 'Amul Pasteurised Butter - 500 g.', 285.00, null, 20, 500.00, 'g', '500 g', 4.4, true, true, '{}'::jsonb, '["Brand: Amul", "Pack size: 500 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "500 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Amul Pasteurised Butter', 'amul-pasteurised-butter-1-kg', 'Amul', 'Salted pasteurised butter for toast, cooking, baking and everyday breakfast.', 'Amul Pasteurised Butter - 1 kg.', 570.00, null, 93, 1.00, 'kg', '1 kg', 4.0, false, true, '{}'::jsonb, '["Brand: Amul", "Pack size: 1 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Amul Cheese Slices', 'amul-cheese-slices-100-g', 'Amul', 'Processed cheese slices for sandwiches, burgers, toast and quick snacks.', 'Amul Cheese Slices - 100 g.', 75.00, null, 145, 100.00, 'g', '100 g', 4.5, false, true, '{}'::jsonb, '["Brand: Amul", "Pack size: 100 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "100 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Amul Cheese Slices', 'amul-cheese-slices-200-g', 'Amul', 'Processed cheese slices for sandwiches, burgers, toast and quick snacks.', 'Amul Cheese Slices - 200 g.', 145.00, null, 121, 200.00, 'g', '200 g', 4.2, false, true, '{}'::jsonb, '["Brand: Amul", "Pack size: 200 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "200 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Amul Cheese Slices', 'amul-cheese-slices-400-g', 'Amul', 'Processed cheese slices for sandwiches, burgers, toast and quick snacks.', 'Amul Cheese Slices - 400 g.', 290.00, null, 111, 400.00, 'g', '400 g', 4.3, false, true, '{}'::jsonb, '["Brand: Amul", "Pack size: 400 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "400 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Amul Cheese Slices', 'amul-cheese-slices-750-g', 'Amul', 'Processed cheese slices for sandwiches, burgers, toast and quick snacks.', 'Amul Cheese Slices - 750 g.', 525.00, null, 151, 750.00, 'g', '750 g', 4.5, true, true, '{}'::jsonb, '["Brand: Amul", "Pack size: 750 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "750 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Mother Dairy Classic Curd', 'mother-dairy-classic-curd-200-g', 'Mother Dairy', 'Fresh classic curd for meals, raita, smoothies and everyday use.', 'Mother Dairy Classic Curd - 200 g.', 30.00, null, 107, 200.00, 'g', '200 g', 4.0, false, true, '{}'::jsonb, '["Brand: Mother Dairy", "Pack size: 200 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "200 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Mother Dairy Classic Curd', 'mother-dairy-classic-curd-400-g', 'Mother Dairy', 'Fresh classic curd for meals, raita, smoothies and everyday use.', 'Mother Dairy Classic Curd - 400 g.', 45.00, null, 94, 400.00, 'g', '400 g', 4.2, false, true, '{}'::jsonb, '["Brand: Mother Dairy", "Pack size: 400 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "400 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Mother Dairy Classic Curd', 'mother-dairy-classic-curd-1-kg', 'Mother Dairy', 'Fresh classic curd for meals, raita, smoothies and everyday use.', 'Mother Dairy Classic Curd - 1 kg.', 74.00, null, 167, 1.00, 'kg', '1 kg', 4.2, true, true, '{}'::jsonb, '["Brand: Mother Dairy", "Pack size: 1 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Mother Dairy Classic Curd', 'mother-dairy-classic-curd-2-kg', 'Mother Dairy', 'Fresh classic curd for meals, raita, smoothies and everyday use.', 'Mother Dairy Classic Curd - 2 kg.', 145.00, null, 114, 2.00, 'kg', '2 kg', 4.2, false, true, '{}'::jsonb, '["Brand: Mother Dairy", "Pack size: 2 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "2 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Amul Fresh Paneer', 'amul-fresh-paneer-200-g', 'Amul', 'Fresh paneer suitable for curries, snacks, grilling and Indian meals.', 'Amul Fresh Paneer - 200 g.', 95.00, null, 43, 200.00, 'g', '200 g', 4.3, false, true, '{}'::jsonb, '["Brand: Amul", "Pack size: 200 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "200 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Amul Fresh Paneer', 'amul-fresh-paneer-500-g', 'Amul', 'Fresh paneer suitable for curries, snacks, grilling and Indian meals.', 'Amul Fresh Paneer - 500 g.', 230.00, null, 161, 500.00, 'g', '500 g', 4.3, false, true, '{}'::jsonb, '["Brand: Amul", "Pack size: 500 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "500 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Amul Fresh Paneer', 'amul-fresh-paneer-1-kg', 'Amul', 'Fresh paneer suitable for curries, snacks, grilling and Indian meals.', 'Amul Fresh Paneer - 1 kg.', 450.00, null, 128, 1.00, 'kg', '1 kg', 4.4, false, true, '{}'::jsonb, '["Brand: Amul", "Pack size: 1 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Amul Fresh Paneer', 'amul-fresh-paneer-2-kg', 'Amul', 'Fresh paneer suitable for curries, snacks, grilling and Indian meals.', 'Amul Fresh Paneer - 2 kg.', 880.00, null, 173, 2.00, 'kg', '2 kg', 4.3, false, true, '{}'::jsonb, '["Brand: Amul", "Pack size: 2 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "2 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'bakery-biscuits'), 'Britannia Brown Bread', 'britannia-brown-bread-400-g', 'Britannia', 'Soft brown bread for breakfast, toast, sandwiches and everyday meals.', 'Britannia Brown Bread - 400 g.', 42.00, null, 154, 400.00, 'g', '400 g', 4.2, false, true, '{}'::jsonb, '["Brand: Britannia", "Pack size: 400 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "400 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'bakery-biscuits'), 'Britannia Brown Bread', 'britannia-brown-bread-450-g', 'Britannia', 'Soft brown bread for breakfast, toast, sandwiches and everyday meals.', 'Britannia Brown Bread - 450 g.', 50.00, null, 164, 450.00, 'g', '450 g', 4.3, false, true, '{}'::jsonb, '["Brand: Britannia", "Pack size: 450 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "450 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'bakery-biscuits'), 'Britannia Brown Bread', 'britannia-brown-bread-800-g', 'Britannia', 'Soft brown bread for breakfast, toast, sandwiches and everyday meals.', 'Britannia Brown Bread - 800 g.', 85.00, null, 26, 800.00, 'g', '800 g', 4.4, false, true, '{}'::jsonb, '["Brand: Britannia", "Pack size: 800 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "800 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'bakery-biscuits'), 'Britannia Brown Bread', 'britannia-brown-bread-2-x-400-g', 'Britannia', 'Soft brown bread for breakfast, toast, sandwiches and everyday meals.', 'Britannia Brown Bread - 2 x 400 g.', 80.00, null, 53, 800.00, 'g', '2 x 400 g', 4.0, false, true, '{}'::jsonb, '["Brand: Britannia", "Pack size: 2 x 400 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "2 x 400 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Kellogg''s Corn Flakes Original', 'kellogg-s-corn-flakes-original-250-g', 'Kellogg''s', 'Classic corn flakes breakfast cereal, best served with milk and fruit.', 'Kellogg''s Corn Flakes Original - 250 g.', 110.00, null, 153, 250.00, 'g', '250 g', 4.5, true, true, '{}'::jsonb, '["Brand: Kellogg''s", "Pack size: 250 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "250 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Kellogg''s Corn Flakes Original', 'kellogg-s-corn-flakes-original-475-g', 'Kellogg''s', 'Classic corn flakes breakfast cereal, best served with milk and fruit.', 'Kellogg''s Corn Flakes Original - 475 g.', 195.00, null, 179, 475.00, 'g', '475 g', 4.3, false, true, '{}'::jsonb, '["Brand: Kellogg''s", "Pack size: 475 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "475 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Kellogg''s Corn Flakes Original', 'kellogg-s-corn-flakes-original-875-g', 'Kellogg''s', 'Classic corn flakes breakfast cereal, best served with milk and fruit.', 'Kellogg''s Corn Flakes Original - 875 g.', 335.00, null, 143, 875.00, 'g', '875 g', 4.1, false, true, '{}'::jsonb, '["Brand: Kellogg''s", "Pack size: 875 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "875 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Kellogg''s Corn Flakes Original', 'kellogg-s-corn-flakes-original-1-2-kg', 'Kellogg''s', 'Classic corn flakes breakfast cereal, best served with milk and fruit.', 'Kellogg''s Corn Flakes Original - 1.2 kg.', 450.00, null, 51, 1.20, 'kg', '1.2 kg', 4.5, false, true, '{}'::jsonb, '["Brand: Kellogg''s", "Pack size: 1.2 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1.2 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Quaker Oats', 'quaker-oats-400-g', 'Quaker', 'Wholegrain oats for porridge, breakfast bowls, smoothies and savoury recipes.', 'Quaker Oats - 400 g.', 90.00, null, 140, 400.00, 'g', '400 g', 4.5, false, true, '{}'::jsonb, '["Brand: Quaker", "Pack size: 400 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "400 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Quaker Oats', 'quaker-oats-1-kg', 'Quaker', 'Wholegrain oats for porridge, breakfast bowls, smoothies and savoury recipes.', 'Quaker Oats - 1 kg.', 199.00, null, 159, 1.00, 'kg', '1 kg', 4.2, false, true, '{}'::jsonb, '["Brand: Quaker", "Pack size: 1 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Quaker Oats', 'quaker-oats-1-5-kg', 'Quaker', 'Wholegrain oats for porridge, breakfast bowls, smoothies and savoury recipes.', 'Quaker Oats - 1.5 kg.', 280.00, null, 98, 1.50, 'kg', '1.5 kg', 4.4, false, true, '{}'::jsonb, '["Brand: Quaker", "Pack size: 1.5 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1.5 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'dairy-breakfast'), 'Quaker Oats', 'quaker-oats-2-kg', 'Quaker', 'Wholegrain oats for porridge, breakfast bowls, smoothies and savoury recipes.', 'Quaker Oats - 2 kg.', 360.00, null, 148, 2.00, 'kg', '2 kg', 4.5, false, true, '{}'::jsonb, '["Brand: Quaker", "Pack size: 2 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "2 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'atta-rice-dal'), 'Aashirvaad Shudh Chakki Atta', 'aashirvaad-shudh-chakki-atta-1-kg', 'Aashirvaad', 'Whole wheat chakki atta for soft rotis, parathas and everyday Indian meals.', 'Aashirvaad Shudh Chakki Atta - 1 kg.', 65.00, null, 122, 1.00, 'kg', '1 kg', 4.3, false, true, '{}'::jsonb, '["Brand: Aashirvaad", "Pack size: 1 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'atta-rice-dal'), 'Aashirvaad Shudh Chakki Atta', 'aashirvaad-shudh-chakki-atta-2-kg', 'Aashirvaad', 'Whole wheat chakki atta for soft rotis, parathas and everyday Indian meals.', 'Aashirvaad Shudh Chakki Atta - 2 kg.', 125.00, null, 88, 2.00, 'kg', '2 kg', 4.0, true, true, '{}'::jsonb, '["Brand: Aashirvaad", "Pack size: 2 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "2 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'atta-rice-dal'), 'Aashirvaad Shudh Chakki Atta', 'aashirvaad-shudh-chakki-atta-5-kg', 'Aashirvaad', 'Whole wheat chakki atta for soft rotis, parathas and everyday Indian meals.', 'Aashirvaad Shudh Chakki Atta - 5 kg.', 278.00, null, 172, 5.00, 'kg', '5 kg', 4.3, false, true, '{}'::jsonb, '["Brand: Aashirvaad", "Pack size: 5 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "5 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'atta-rice-dal'), 'Aashirvaad Shudh Chakki Atta', 'aashirvaad-shudh-chakki-atta-10-kg', 'Aashirvaad', 'Whole wheat chakki atta for soft rotis, parathas and everyday Indian meals.', 'Aashirvaad Shudh Chakki Atta - 10 kg.', 540.00, null, 145, 10.00, 'kg', '10 kg', 4.2, false, true, '{}'::jsonb, '["Brand: Aashirvaad", "Pack size: 10 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "10 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'atta-rice-dal'), 'India Gate Basmati Rice Super', 'india-gate-basmati-rice-super-1-kg', 'India Gate', 'Long-grain basmati rice for pulao, biryani and everyday rice dishes.', 'India Gate Basmati Rice Super - 1 kg.', 225.00, null, 86, 1.00, 'kg', '1 kg', 4.5, false, true, '{}'::jsonb, '["Brand: India Gate", "Pack size: 1 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'atta-rice-dal'), 'India Gate Basmati Rice Super', 'india-gate-basmati-rice-super-5-kg', 'India Gate', 'Long-grain basmati rice for pulao, biryani and everyday rice dishes.', 'India Gate Basmati Rice Super - 5 kg.', 1082.00, null, 150, 5.00, 'kg', '5 kg', 4.3, false, true, '{}'::jsonb, '["Brand: India Gate", "Pack size: 5 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "5 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'atta-rice-dal'), 'India Gate Basmati Rice Super', 'india-gate-basmati-rice-super-10-kg', 'India Gate', 'Long-grain basmati rice for pulao, biryani and everyday rice dishes.', 'India Gate Basmati Rice Super - 10 kg.', 2050.00, null, 162, 10.00, 'kg', '10 kg', 4.5, false, true, '{}'::jsonb, '["Brand: India Gate", "Pack size: 10 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "10 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'atta-rice-dal'), 'India Gate Basmati Rice Super', 'india-gate-basmati-rice-super-20-kg', 'India Gate', 'Long-grain basmati rice for pulao, biryani and everyday rice dishes.', 'India Gate Basmati Rice Super - 20 kg.', 3990.00, null, 94, 20.00, 'kg', '20 kg', 4.2, false, true, '{}'::jsonb, '["Brand: India Gate", "Pack size: 20 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "20 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'atta-rice-dal'), 'Tata Sampann Unpolished Toor Dal', 'tata-sampann-unpolished-toor-dal-500-g', 'Tata Sampann', 'Unpolished toor/arhar dal for dal tadka, sambar and daily Indian cooking.', 'Tata Sampann Unpolished Toor Dal - 500 g.', 110.00, null, 45, 500.00, 'g', '500 g', 4.3, false, true, '{}'::jsonb, '["Brand: Tata Sampann", "Pack size: 500 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "500 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'atta-rice-dal'), 'Tata Sampann Unpolished Toor Dal', 'tata-sampann-unpolished-toor-dal-1-kg', 'Tata Sampann', 'Unpolished toor/arhar dal for dal tadka, sambar and daily Indian cooking.', 'Tata Sampann Unpolished Toor Dal - 1 kg.', 199.00, null, 151, 1.00, 'kg', '1 kg', 4.2, false, true, '{}'::jsonb, '["Brand: Tata Sampann", "Pack size: 1 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'atta-rice-dal'), 'Tata Sampann Unpolished Toor Dal', 'tata-sampann-unpolished-toor-dal-2-kg', 'Tata Sampann', 'Unpolished toor/arhar dal for dal tadka, sambar and daily Indian cooking.', 'Tata Sampann Unpolished Toor Dal - 2 kg.', 390.00, null, 66, 2.00, 'kg', '2 kg', 4.3, false, true, '{}'::jsonb, '["Brand: Tata Sampann", "Pack size: 2 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "2 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'atta-rice-dal'), 'Tata Sampann Unpolished Toor Dal', 'tata-sampann-unpolished-toor-dal-5-kg', 'Tata Sampann', 'Unpolished toor/arhar dal for dal tadka, sambar and daily Indian cooking.', 'Tata Sampann Unpolished Toor Dal - 5 kg.', 960.00, null, 142, 5.00, 'kg', '5 kg', 4.0, false, true, '{}'::jsonb, '["Brand: Tata Sampann", "Pack size: 5 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "5 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'oil-ghee-masala'), 'Fortune Sunlite Refined Sunflower Oil', 'fortune-sunlite-refined-sunflower-oil-1-l', 'Fortune', 'Refined sunflower cooking oil suitable for frying, sauteing and daily cooking.', 'Fortune Sunlite Refined Sunflower Oil - 1 L.', 210.00, null, 147, 1.00, 'L', '1 L', 4.2, true, true, '{}'::jsonb, '["Brand: Fortune", "Pack size: 1 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'oil-ghee-masala'), 'Fortune Sunlite Refined Sunflower Oil', 'fortune-sunlite-refined-sunflower-oil-2-l', 'Fortune', 'Refined sunflower cooking oil suitable for frying, sauteing and daily cooking.', 'Fortune Sunlite Refined Sunflower Oil - 2 L.', 420.00, null, 125, 2.00, 'L', '2 L', 4.1, false, true, '{}'::jsonb, '["Brand: Fortune", "Pack size: 2 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "2 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'oil-ghee-masala'), 'Fortune Sunlite Refined Sunflower Oil', 'fortune-sunlite-refined-sunflower-oil-5-l', 'Fortune', 'Refined sunflower cooking oil suitable for frying, sauteing and daily cooking.', 'Fortune Sunlite Refined Sunflower Oil - 5 L.', 975.00, null, 23, 5.00, 'L', '5 L', 4.0, true, true, '{}'::jsonb, '["Brand: Fortune", "Pack size: 5 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "5 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'oil-ghee-masala'), 'Fortune Sunlite Refined Sunflower Oil', 'fortune-sunlite-refined-sunflower-oil-15-l', 'Fortune', 'Refined sunflower cooking oil suitable for frying, sauteing and daily cooking.', 'Fortune Sunlite Refined Sunflower Oil - 15 L.', 2750.00, null, 168, 15.00, 'L', '15 L', 4.4, false, true, '{}'::jsonb, '["Brand: Fortune", "Pack size: 15 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "15 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'oil-ghee-masala'), 'Tata Salt Iodised', 'tata-salt-iodised-1-kg', 'Tata Salt', 'Iodised table salt for everyday Indian cooking and seasoning.', 'Tata Salt Iodised - 1 kg.', 28.00, null, 41, 1.00, 'kg', '1 kg', 4.4, false, true, '{}'::jsonb, '["Brand: Tata Salt", "Pack size: 1 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'oil-ghee-masala'), 'Tata Salt Iodised', 'tata-salt-iodised-2-kg', 'Tata Salt', 'Iodised table salt for everyday Indian cooking and seasoning.', 'Tata Salt Iodised - 2 kg.', 56.00, null, 83, 2.00, 'kg', '2 kg', 4.0, false, true, '{}'::jsonb, '["Brand: Tata Salt", "Pack size: 2 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "2 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'oil-ghee-masala'), 'Tata Salt Iodised', 'tata-salt-iodised-5-kg', 'Tata Salt', 'Iodised table salt for everyday Indian cooking and seasoning.', 'Tata Salt Iodised - 5 kg.', 140.00, null, 159, 5.00, 'kg', '5 kg', 4.2, false, true, '{}'::jsonb, '["Brand: Tata Salt", "Pack size: 5 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "5 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'oil-ghee-masala'), 'Tata Salt Iodised', 'tata-salt-iodised-10-kg', 'Tata Salt', 'Iodised table salt for everyday Indian cooking and seasoning.', 'Tata Salt Iodised - 10 kg.', 280.00, null, 111, 10.00, 'kg', '10 kg', 4.1, true, true, '{}'::jsonb, '["Brand: Tata Salt", "Pack size: 10 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "10 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'oil-ghee-masala'), 'MDH Garam Masala', 'mdh-garam-masala-50-g', 'MDH', 'Classic Indian garam masala blend for curries, gravies and vegetable dishes.', 'MDH Garam Masala - 50 g.', 50.00, null, 169, 50.00, 'g', '50 g', 4.4, false, true, '{}'::jsonb, '["Brand: MDH", "Pack size: 50 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "50 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'oil-ghee-masala'), 'MDH Garam Masala', 'mdh-garam-masala-100-g', 'MDH', 'Classic Indian garam masala blend for curries, gravies and vegetable dishes.', 'MDH Garam Masala - 100 g.', 96.00, null, 145, 100.00, 'g', '100 g', 4.5, false, true, '{}'::jsonb, '["Brand: MDH", "Pack size: 100 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "100 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'oil-ghee-masala'), 'MDH Garam Masala', 'mdh-garam-masala-200-g', 'MDH', 'Classic Indian garam masala blend for curries, gravies and vegetable dishes.', 'MDH Garam Masala - 200 g.', 185.00, null, 54, 200.00, 'g', '200 g', 4.4, false, true, '{}'::jsonb, '["Brand: MDH", "Pack size: 200 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "200 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'oil-ghee-masala'), 'MDH Garam Masala', 'mdh-garam-masala-500-g', 'MDH', 'Classic Indian garam masala blend for curries, gravies and vegetable dishes.', 'MDH Garam Masala - 500 g.', 450.00, null, 170, 500.00, 'g', '500 g', 4.1, false, true, '{}'::jsonb, '["Brand: MDH", "Pack size: 500 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "500 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'oil-ghee-masala'), 'Everest Turmeric Powder', 'everest-turmeric-powder-100-g', 'Everest', 'Haldi/turmeric powder for curries, dals, vegetables and everyday Indian cooking.', 'Everest Turmeric Powder - 100 g.', 42.00, null, 149, 100.00, 'g', '100 g', 4.2, true, true, '{}'::jsonb, '["Brand: Everest", "Pack size: 100 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "100 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'oil-ghee-masala'), 'Everest Turmeric Powder', 'everest-turmeric-powder-200-g', 'Everest', 'Haldi/turmeric powder for curries, dals, vegetables and everyday Indian cooking.', 'Everest Turmeric Powder - 200 g.', 78.00, null, 60, 200.00, 'g', '200 g', 4.1, false, true, '{}'::jsonb, '["Brand: Everest", "Pack size: 200 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "200 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'oil-ghee-masala'), 'Everest Turmeric Powder', 'everest-turmeric-powder-500-g', 'Everest', 'Haldi/turmeric powder for curries, dals, vegetables and everyday Indian cooking.', 'Everest Turmeric Powder - 500 g.', 185.00, null, 170, 500.00, 'g', '500 g', 4.2, false, true, '{}'::jsonb, '["Brand: Everest", "Pack size: 500 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "500 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'oil-ghee-masala'), 'Everest Turmeric Powder', 'everest-turmeric-powder-1-kg', 'Everest', 'Haldi/turmeric powder for curries, dals, vegetables and everyday Indian cooking.', 'Everest Turmeric Powder - 1 kg.', 350.00, null, 119, 1.00, 'kg', '1 kg', 4.1, false, true, '{}'::jsonb, '["Brand: Everest", "Pack size: 1 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'snacks-munchies'), 'Lay''s India''s Magic Masala Potato Chips', 'lay-s-india-s-magic-masala-potato-chips-24-g', 'Lay''s', 'Crunchy potato chips with India''s Magic Masala seasoning.', 'Lay''s India''s Magic Masala Potato Chips - 24 g.', 10.00, null, 70, 24.00, 'g', '24 g', 4.3, true, true, '{}'::jsonb, '["Brand: Lay''s", "Pack size: 24 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "24 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'snacks-munchies'), 'Lay''s India''s Magic Masala Potato Chips', 'lay-s-india-s-magic-masala-potato-chips-48-g', 'Lay''s', 'Crunchy potato chips with India''s Magic Masala seasoning.', 'Lay''s India''s Magic Masala Potato Chips - 48 g.', 20.00, null, 47, 48.00, 'g', '48 g', 4.3, false, true, '{}'::jsonb, '["Brand: Lay''s", "Pack size: 48 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "48 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'snacks-munchies'), 'Lay''s India''s Magic Masala Potato Chips', 'lay-s-india-s-magic-masala-potato-chips-90-g', 'Lay''s', 'Crunchy potato chips with India''s Magic Masala seasoning.', 'Lay''s India''s Magic Masala Potato Chips - 90 g.', 35.00, null, 33, 90.00, 'g', '90 g', 4.2, false, true, '{}'::jsonb, '["Brand: Lay''s", "Pack size: 90 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "90 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'snacks-munchies'), 'Lay''s India''s Magic Masala Potato Chips', 'lay-s-india-s-magic-masala-potato-chips-143-g', 'Lay''s', 'Crunchy potato chips with India''s Magic Masala seasoning.', 'Lay''s India''s Magic Masala Potato Chips - 143 g.', 81.00, null, 26, 143.00, 'g', '143 g', 4.0, false, true, '{}'::jsonb, '["Brand: Lay''s", "Pack size: 143 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "143 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'snacks-munchies'), 'Lay''s India''s Magic Masala Potato Chips', 'lay-s-india-s-magic-masala-potato-chips-12-g', 'Lay''s', 'Crunchy potato chips with India''s Magic Masala seasoning.', 'Lay''s India''s Magic Masala Potato Chips - 12 g.', 5.00, null, 103, 12.00, 'g', '12 g', 4.5, false, true, '{}'::jsonb, '["Brand: Lay''s", "Pack size: 12 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "12 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'snacks-munchies'), 'Kurkure Masala Munch Namkeen', 'kurkure-masala-munch-namkeen-18-g', 'Kurkure', 'Crunchy masala-flavoured puffed snack for tea-time and quick snacking.', 'Kurkure Masala Munch Namkeen - 18 g.', 5.00, null, 103, 18.00, 'g', '18 g', 4.0, false, true, '{}'::jsonb, '["Brand: Kurkure", "Pack size: 18 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "18 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'snacks-munchies'), 'Kurkure Masala Munch Namkeen', 'kurkure-masala-munch-namkeen-75-g', 'Kurkure', 'Crunchy masala-flavoured puffed snack for tea-time and quick snacking.', 'Kurkure Masala Munch Namkeen - 75 g.', 20.00, null, 139, 75.00, 'g', '75 g', 4.4, false, true, '{}'::jsonb, '["Brand: Kurkure", "Pack size: 75 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "75 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'snacks-munchies'), 'Kurkure Masala Munch Namkeen', 'kurkure-masala-munch-namkeen-94-g', 'Kurkure', 'Crunchy masala-flavoured puffed snack for tea-time and quick snacking.', 'Kurkure Masala Munch Namkeen - 94 g.', 30.00, null, 63, 94.00, 'g', '94 g', 4.1, false, true, '{}'::jsonb, '["Brand: Kurkure", "Pack size: 94 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "94 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'snacks-munchies'), 'Kurkure Masala Munch Namkeen', 'kurkure-masala-munch-namkeen-166-g', 'Kurkure', 'Crunchy masala-flavoured puffed snack for tea-time and quick snacking.', 'Kurkure Masala Munch Namkeen - 166 g.', 50.00, null, 72, 166.00, 'g', '166 g', 4.3, false, true, '{}'::jsonb, '["Brand: Kurkure", "Pack size: 166 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "166 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'snacks-munchies'), 'Kurkure Masala Munch Namkeen', 'kurkure-masala-munch-namkeen-3-x-75-g', 'Kurkure', 'Crunchy masala-flavoured puffed snack for tea-time and quick snacking.', 'Kurkure Masala Munch Namkeen - 3 x 75 g.', 60.00, null, 137, 225.00, 'g', '3 x 75 g', 4.4, false, true, '{}'::jsonb, '["Brand: Kurkure", "Pack size: 3 x 75 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "3 x 75 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'snacks-munchies'), 'Bingo! Mad Angles Mmmmm Masala', 'bingo-mad-angles-mmmmm-masala-30-g', 'Bingo!', 'Triangular crunchy chips with a bold Indian masala flavour.', 'Bingo! Mad Angles Mmmmm Masala - 30 g.', 10.00, null, 37, 30.00, 'g', '30 g', 4.4, false, true, '{}'::jsonb, '["Brand: Bingo!", "Pack size: 30 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "30 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'snacks-munchies'), 'Bingo! Mad Angles Mmmmm Masala', 'bingo-mad-angles-mmmmm-masala-60-g', 'Bingo!', 'Triangular crunchy chips with a bold Indian masala flavour.', 'Bingo! Mad Angles Mmmmm Masala - 60 g.', 20.00, null, 70, 60.00, 'g', '60 g', 4.5, false, true, '{}'::jsonb, '["Brand: Bingo!", "Pack size: 60 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "60 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'snacks-munchies'), 'Bingo! Mad Angles Mmmmm Masala', 'bingo-mad-angles-mmmmm-masala-117-g', 'Bingo!', 'Triangular crunchy chips with a bold Indian masala flavour.', 'Bingo! Mad Angles Mmmmm Masala - 117 g.', 50.00, null, 31, 117.00, 'g', '117 g', 4.5, false, true, '{}'::jsonb, '["Brand: Bingo!", "Pack size: 117 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "117 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'snacks-munchies'), 'Bingo! Mad Angles Mmmmm Masala', 'bingo-mad-angles-mmmmm-masala-130-g', 'Bingo!', 'Triangular crunchy chips with a bold Indian masala flavour.', 'Bingo! Mad Angles Mmmmm Masala - 130 g.', 50.00, null, 32, 130.00, 'g', '130 g', 4.3, false, true, '{}'::jsonb, '["Brand: Bingo!", "Pack size: 130 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "130 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'bakery-biscuits'), 'Parle-G Original Gluco Biscuits', 'parle-g-original-gluco-biscuits-45-g', 'Parle', 'Classic glucose biscuits made for tea-time, travel and everyday snacking.', 'Parle-G Original Gluco Biscuits - 45 g.', 5.00, null, 68, 45.00, 'g', '45 g', 4.3, false, true, '{}'::jsonb, '["Brand: Parle", "Pack size: 45 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "45 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'bakery-biscuits'), 'Parle-G Original Gluco Biscuits', 'parle-g-original-gluco-biscuits-90-g', 'Parle', 'Classic glucose biscuits made for tea-time, travel and everyday snacking.', 'Parle-G Original Gluco Biscuits - 90 g.', 10.00, null, 25, 90.00, 'g', '90 g', 4.1, false, true, '{}'::jsonb, '["Brand: Parle", "Pack size: 90 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "90 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'bakery-biscuits'), 'Parle-G Original Gluco Biscuits', 'parle-g-original-gluco-biscuits-250-g', 'Parle', 'Classic glucose biscuits made for tea-time, travel and everyday snacking.', 'Parle-G Original Gluco Biscuits - 250 g.', 25.00, null, 75, 250.00, 'g', '250 g', 4.4, false, true, '{}'::jsonb, '["Brand: Parle", "Pack size: 250 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "250 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'bakery-biscuits'), 'Parle-G Original Gluco Biscuits', 'parle-g-original-gluco-biscuits-800-g', 'Parle', 'Classic glucose biscuits made for tea-time, travel and everyday snacking.', 'Parle-G Original Gluco Biscuits - 800 g.', 100.00, null, 55, 800.00, 'g', '800 g', 4.1, false, true, '{}'::jsonb, '["Brand: Parle", "Pack size: 800 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "800 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'bakery-biscuits'), 'Britannia Good Day Rich Cashew Cookies', 'britannia-good-day-rich-cashew-cookies-60-1-g', 'Britannia', 'Crunchy cashew cookies for tea-time, snacks and sharing.', 'Britannia Good Day Rich Cashew Cookies - 60.1 g.', 10.00, null, 67, 60.10, 'g', '60.1 g', 4.3, false, true, '{}'::jsonb, '["Brand: Britannia", "Pack size: 60.1 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "60.1 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'bakery-biscuits'), 'Britannia Good Day Rich Cashew Cookies', 'britannia-good-day-rich-cashew-cookies-82-7-g', 'Britannia', 'Crunchy cashew cookies for tea-time, snacks and sharing.', 'Britannia Good Day Rich Cashew Cookies - 82.7 g.', 20.00, null, 156, 82.70, 'g', '82.7 g', 4.3, false, true, '{}'::jsonb, '["Brand: Britannia", "Pack size: 82.7 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "82.7 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'bakery-biscuits'), 'Britannia Good Day Rich Cashew Cookies', 'britannia-good-day-rich-cashew-cookies-250-g', 'Britannia', 'Crunchy cashew cookies for tea-time, snacks and sharing.', 'Britannia Good Day Rich Cashew Cookies - 250 g.', 60.00, null, 118, 250.00, 'g', '250 g', 4.2, false, true, '{}'::jsonb, '["Brand: Britannia", "Pack size: 250 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "250 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'bakery-biscuits'), 'Britannia Good Day Rich Cashew Cookies', 'britannia-good-day-rich-cashew-cookies-526-1-g', 'Britannia', 'Crunchy cashew cookies for tea-time, snacks and sharing.', 'Britannia Good Day Rich Cashew Cookies - 526.1 g.', 130.00, null, 64, 526.10, 'g', '526.1 g', 4.2, false, true, '{}'::jsonb, '["Brand: Britannia", "Pack size: 526.1 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "526.1 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'chocolates-sweets'), 'Cadbury Oreo Vanilla Creme Sandwich Biscuit', 'cadbury-oreo-vanilla-creme-sandwich-biscuit-41-75-g', 'Cadbury Oreo', 'Chocolate sandwich biscuits with a sweet vanilla creme centre.', 'Cadbury Oreo Vanilla Creme Sandwich Biscuit - 41.75 g.', 10.00, null, 126, 41.75, 'g', '41.75 g', 4.2, false, true, '{}'::jsonb, '["Brand: Cadbury Oreo", "Pack size: 41.75 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "41.75 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'chocolates-sweets'), 'Cadbury Oreo Vanilla Creme Sandwich Biscuit', 'cadbury-oreo-vanilla-creme-sandwich-biscuit-125-25-g', 'Cadbury Oreo', 'Chocolate sandwich biscuits with a sweet vanilla creme centre.', 'Cadbury Oreo Vanilla Creme Sandwich Biscuit - 125.25 g.', 35.00, null, 103, 125.25, 'g', '125.25 g', 4.4, false, true, '{}'::jsonb, '["Brand: Cadbury Oreo", "Pack size: 125.25 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "125.25 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'chocolates-sweets'), 'Cadbury Oreo Vanilla Creme Sandwich Biscuit', 'cadbury-oreo-vanilla-creme-sandwich-biscuit-275-55-g', 'Cadbury Oreo', 'Chocolate sandwich biscuits with a sweet vanilla creme centre.', 'Cadbury Oreo Vanilla Creme Sandwich Biscuit - 275.55 g.', 87.00, null, 50, 275.55, 'g', '275.55 g', 4.4, false, true, '{}'::jsonb, '["Brand: Cadbury Oreo", "Pack size: 275.55 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "275.55 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'chocolates-sweets'), 'Cadbury Oreo Vanilla Creme Sandwich Biscuit', 'cadbury-oreo-vanilla-creme-sandwich-biscuit-459-25-g', 'Cadbury Oreo', 'Chocolate sandwich biscuits with a sweet vanilla creme centre.', 'Cadbury Oreo Vanilla Creme Sandwich Biscuit - 459.25 g.', 144.00, null, 90, 459.25, 'g', '459.25 g', 4.0, false, true, '{}'::jsonb, '["Brand: Cadbury Oreo", "Pack size: 459.25 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "459.25 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Coca-Cola Original Taste Soft Drink', 'coca-cola-original-taste-soft-drink-200-ml-can', 'Coca-Cola', 'Carbonated cola soft drink for chilled refreshment and sharing.', 'Coca-Cola Original Taste Soft Drink - 200 ml Can.', 30.00, null, 79, 200.00, 'ml', '200 ml Can', 4.0, false, true, '{}'::jsonb, '["Brand: Coca-Cola", "Pack size: 200 ml Can", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "200 ml Can", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Coca-Cola Original Taste Soft Drink', 'coca-cola-original-taste-soft-drink-300-ml-can', 'Coca-Cola', 'Carbonated cola soft drink for chilled refreshment and sharing.', 'Coca-Cola Original Taste Soft Drink - 300 ml Can.', 40.00, null, 136, 300.00, 'ml', '300 ml Can', 4.5, false, true, '{}'::jsonb, '["Brand: Coca-Cola", "Pack size: 300 ml Can", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "300 ml Can", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Coca-Cola Original Taste Soft Drink', 'coca-cola-original-taste-soft-drink-740-ml-pet-bottle', 'Coca-Cola', 'Carbonated cola soft drink for chilled refreshment and sharing.', 'Coca-Cola Original Taste Soft Drink - 740 ml PET Bottle.', 40.00, null, 159, 740.00, 'ml', '740 ml PET Bottle', 4.5, false, true, '{}'::jsonb, '["Brand: Coca-Cola", "Pack size: 740 ml PET Bottle", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "740 ml PET Bottle", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Coca-Cola Original Taste Soft Drink', 'coca-cola-original-taste-soft-drink-1-75-l-pet-bottle', 'Coca-Cola', 'Carbonated cola soft drink for chilled refreshment and sharing.', 'Coca-Cola Original Taste Soft Drink - 1.75 L PET Bottle.', 90.00, null, 26, 1.75, 'L', '1.75 L PET Bottle', 4.2, false, true, '{}'::jsonb, '["Brand: Coca-Cola", "Pack size: 1.75 L PET Bottle", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1.75 L PET Bottle", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Thums Up Soft Drink', 'thums-up-soft-drink-300-ml-can', 'Thums Up', 'Strong fizzy cola drink with a bold taste popular across India.', 'Thums Up Soft Drink - 300 ml Can.', 40.00, null, 110, 300.00, 'ml', '300 ml Can', 4.4, false, true, '{}'::jsonb, '["Brand: Thums Up", "Pack size: 300 ml Can", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "300 ml Can", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Thums Up Soft Drink', 'thums-up-soft-drink-750-ml', 'Thums Up', 'Strong fizzy cola drink with a bold taste popular across India.', 'Thums Up Soft Drink - 750 ml.', 40.00, null, 157, 750.00, 'ml', '750 ml', 4.1, true, true, '{}'::jsonb, '["Brand: Thums Up", "Pack size: 750 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "750 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Thums Up Soft Drink', 'thums-up-soft-drink-1-25-l', 'Thums Up', 'Strong fizzy cola drink with a bold taste popular across India.', 'Thums Up Soft Drink - 1.25 L.', 70.00, null, 91, 1.25, 'L', '1.25 L', 4.4, false, true, '{}'::jsonb, '["Brand: Thums Up", "Pack size: 1.25 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1.25 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Thums Up Soft Drink', 'thums-up-soft-drink-2-25-l', 'Thums Up', 'Strong fizzy cola drink with a bold taste popular across India.', 'Thums Up Soft Drink - 2.25 L.', 90.00, null, 74, 2.25, 'L', '2.25 L', 4.4, false, true, '{}'::jsonb, '["Brand: Thums Up", "Pack size: 2.25 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "2.25 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Sprite Lemon-Lime Soft Drink', 'sprite-lemon-lime-soft-drink-250-ml', 'Sprite', 'Caffeine-free lemon-lime flavoured carbonated soft drink.', 'Sprite Lemon-Lime Soft Drink - 250 ml.', 20.00, null, 88, 250.00, 'ml', '250 ml', 4.5, false, true, '{}'::jsonb, '["Brand: Sprite", "Pack size: 250 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "250 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Sprite Lemon-Lime Soft Drink', 'sprite-lemon-lime-soft-drink-750-ml', 'Sprite', 'Caffeine-free lemon-lime flavoured carbonated soft drink.', 'Sprite Lemon-Lime Soft Drink - 750 ml.', 40.00, null, 45, 750.00, 'ml', '750 ml', 4.2, true, true, '{}'::jsonb, '["Brand: Sprite", "Pack size: 750 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "750 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Sprite Lemon-Lime Soft Drink', 'sprite-lemon-lime-soft-drink-1-25-l', 'Sprite', 'Caffeine-free lemon-lime flavoured carbonated soft drink.', 'Sprite Lemon-Lime Soft Drink - 1.25 L.', 70.00, null, 131, 1.25, 'L', '1.25 L', 4.1, true, true, '{}'::jsonb, '["Brand: Sprite", "Pack size: 1.25 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1.25 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Sprite Lemon-Lime Soft Drink', 'sprite-lemon-lime-soft-drink-2-l', 'Sprite', 'Caffeine-free lemon-lime flavoured carbonated soft drink.', 'Sprite Lemon-Lime Soft Drink - 2 L.', 99.00, null, 35, 2.00, 'L', '2 L', 4.2, false, true, '{}'::jsonb, '["Brand: Sprite", "Pack size: 2 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "2 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Maaza Mango Fruit Drink', 'maaza-mango-fruit-drink-125-ml', 'Maaza', 'Ready-to-serve mango fruit drink with rich mango flavour.', 'Maaza Mango Fruit Drink - 125 ml.', 10.00, null, 67, 125.00, 'ml', '125 ml', 4.5, false, true, '{}'::jsonb, '["Brand: Maaza", "Pack size: 125 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "125 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Maaza Mango Fruit Drink', 'maaza-mango-fruit-drink-600-ml', 'Maaza', 'Ready-to-serve mango fruit drink with rich mango flavour.', 'Maaza Mango Fruit Drink - 600 ml.', 35.00, null, 149, 600.00, 'ml', '600 ml', 4.2, false, true, '{}'::jsonb, '["Brand: Maaza", "Pack size: 600 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "600 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Maaza Mango Fruit Drink', 'maaza-mango-fruit-drink-1-2-l', 'Maaza', 'Ready-to-serve mango fruit drink with rich mango flavour.', 'Maaza Mango Fruit Drink - 1.2 L.', 70.00, null, 36, 1.20, 'L', '1.2 L', 4.2, false, true, '{}'::jsonb, '["Brand: Maaza", "Pack size: 1.2 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1.2 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Maaza Mango Fruit Drink', 'maaza-mango-fruit-drink-1-5-l', 'Maaza', 'Ready-to-serve mango fruit drink with rich mango flavour.', 'Maaza Mango Fruit Drink - 1.5 L.', 85.00, null, 61, 1.50, 'L', '1.5 L', 4.2, false, true, '{}'::jsonb, '["Brand: Maaza", "Pack size: 1.5 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1.5 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Real Fruit Power Mixed Fruit Juice', 'real-fruit-power-mixed-fruit-juice-180-ml', 'Real', 'Mixed fruit juice drink for breakfast, snacks and daily refreshment.', 'Real Fruit Power Mixed Fruit Juice - 180 ml.', 20.00, null, 23, 180.00, 'ml', '180 ml', 4.3, false, true, '{}'::jsonb, '["Brand: Real", "Pack size: 180 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "180 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Real Fruit Power Mixed Fruit Juice', 'real-fruit-power-mixed-fruit-juice-1-l', 'Real', 'Mixed fruit juice drink for breakfast, snacks and daily refreshment.', 'Real Fruit Power Mixed Fruit Juice - 1 L.', 125.00, null, 85, 1.00, 'L', '1 L', 4.3, false, true, '{}'::jsonb, '["Brand: Real", "Pack size: 1 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Real Fruit Power Mixed Fruit Juice', 'real-fruit-power-mixed-fruit-juice-2-x-1-l', 'Real', 'Mixed fruit juice drink for breakfast, snacks and daily refreshment.', 'Real Fruit Power Mixed Fruit Juice - 2 x 1 L.', 250.00, null, 34, 2.00, 'L', '2 x 1 L', 4.0, false, true, '{}'::jsonb, '["Brand: Real", "Pack size: 2 x 1 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "2 x 1 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'cold-drinks-juices'), 'Real Fruit Power Mixed Fruit Juice', 'real-fruit-power-mixed-fruit-juice-12-x-180-ml', 'Real', 'Mixed fruit juice drink for breakfast, snacks and daily refreshment.', 'Real Fruit Power Mixed Fruit Juice - 12 x 180 ml.', 240.00, null, 99, 2.16, 'L', '12 x 180 ml', 4.0, true, true, '{}'::jsonb, '["Brand: Real", "Pack size: 12 x 180 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "12 x 180 ml", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'tea-coffee-beverages'), 'Tata Tea Premium Desh Ki Chai', 'tata-tea-premium-desh-ki-chai-100-g', 'Tata Tea Premium', 'Popular Indian black tea blend for strong everyday milk tea/chai.', 'Tata Tea Premium Desh Ki Chai - 100 g.', 30.00, null, 163, 100.00, 'g', '100 g', 4.4, false, true, '{}'::jsonb, '["Brand: Tata Tea Premium", "Pack size: 100 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "100 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'tea-coffee-beverages'), 'Tata Tea Premium Desh Ki Chai', 'tata-tea-premium-desh-ki-chai-250-g', 'Tata Tea Premium', 'Popular Indian black tea blend for strong everyday milk tea/chai.', 'Tata Tea Premium Desh Ki Chai - 250 g.', 110.00, null, 109, 250.00, 'g', '250 g', 4.2, false, true, '{}'::jsonb, '["Brand: Tata Tea Premium", "Pack size: 250 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "250 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'tea-coffee-beverages'), 'Tata Tea Premium Desh Ki Chai', 'tata-tea-premium-desh-ki-chai-500-g', 'Tata Tea Premium', 'Popular Indian black tea blend for strong everyday milk tea/chai.', 'Tata Tea Premium Desh Ki Chai - 500 g.', 240.00, null, 175, 500.00, 'g', '500 g', 4.5, false, true, '{}'::jsonb, '["Brand: Tata Tea Premium", "Pack size: 500 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "500 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'tea-coffee-beverages'), 'Tata Tea Premium Desh Ki Chai', 'tata-tea-premium-desh-ki-chai-1-kg', 'Tata Tea Premium', 'Popular Indian black tea blend for strong everyday milk tea/chai.', 'Tata Tea Premium Desh Ki Chai - 1 kg.', 480.00, null, 177, 1.00, 'kg', '1 kg', 4.0, false, true, '{}'::jsonb, '["Brand: Tata Tea Premium", "Pack size: 1 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'tea-coffee-beverages'), 'Tata Tea Premium Desh Ki Chai', 'tata-tea-premium-desh-ki-chai-1-5-kg', 'Tata Tea Premium', 'Popular Indian black tea blend for strong everyday milk tea/chai.', 'Tata Tea Premium Desh Ki Chai - 1.5 kg.', 705.00, null, 100, 1.50, 'kg', '1.5 kg', 4.4, false, true, '{}'::jsonb, '["Brand: Tata Tea Premium", "Pack size: 1.5 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1.5 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'tea-coffee-beverages'), 'Brooke Bond Red Label Tea', 'brooke-bond-red-label-tea-100-g', 'Red Label', 'Strong CTC black tea blend for everyday Indian chai.', 'Brooke Bond Red Label Tea - 100 g.', 30.00, null, 138, 100.00, 'g', '100 g', 4.3, false, true, '{}'::jsonb, '["Brand: Red Label", "Pack size: 100 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "100 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'tea-coffee-beverages'), 'Brooke Bond Red Label Tea', 'brooke-bond-red-label-tea-250-g', 'Red Label', 'Strong CTC black tea blend for everyday Indian chai.', 'Brooke Bond Red Label Tea - 250 g.', 120.00, null, 50, 250.00, 'g', '250 g', 4.5, false, true, '{}'::jsonb, '["Brand: Red Label", "Pack size: 250 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "250 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'tea-coffee-beverages'), 'Brooke Bond Red Label Tea', 'brooke-bond-red-label-tea-500-g', 'Red Label', 'Strong CTC black tea blend for everyday Indian chai.', 'Brooke Bond Red Label Tea - 500 g.', 250.00, null, 148, 500.00, 'g', '500 g', 4.5, false, true, '{}'::jsonb, '["Brand: Red Label", "Pack size: 500 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "500 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'tea-coffee-beverages'), 'Brooke Bond Red Label Tea', 'brooke-bond-red-label-tea-1-kg', 'Red Label', 'Strong CTC black tea blend for everyday Indian chai.', 'Brooke Bond Red Label Tea - 1 kg.', 580.00, null, 84, 1.00, 'kg', '1 kg', 4.3, false, true, '{}'::jsonb, '["Brand: Red Label", "Pack size: 1 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'tea-coffee-beverages'), 'Nescafe Classic Instant Coffee', 'nescafe-classic-instant-coffee-24-g', 'Nescafe', 'Instant coffee powder for quick hot or cold coffee at home.', 'Nescafe Classic Instant Coffee - 24 g.', 92.00, null, 111, 24.00, 'g', '24 g', 4.0, false, true, '{}'::jsonb, '["Brand: Nescafe", "Pack size: 24 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "24 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'tea-coffee-beverages'), 'Nescafe Classic Instant Coffee', 'nescafe-classic-instant-coffee-90-g', 'Nescafe', 'Instant coffee powder for quick hot or cold coffee at home.', 'Nescafe Classic Instant Coffee - 90 g.', 445.00, null, 131, 90.00, 'g', '90 g', 4.0, false, true, '{}'::jsonb, '["Brand: Nescafe", "Pack size: 90 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "90 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'tea-coffee-beverages'), 'Nescafe Classic Instant Coffee', 'nescafe-classic-instant-coffee-180-g', 'Nescafe', 'Instant coffee powder for quick hot or cold coffee at home.', 'Nescafe Classic Instant Coffee - 180 g.', 640.00, null, 104, 180.00, 'g', '180 g', 4.2, false, true, '{}'::jsonb, '["Brand: Nescafe", "Pack size: 180 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "180 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'tea-coffee-beverages'), 'Nescafe Classic Instant Coffee', 'nescafe-classic-instant-coffee-200-g', 'Nescafe', 'Instant coffee powder for quick hot or cold coffee at home.', 'Nescafe Classic Instant Coffee - 200 g.', 910.00, null, 51, 200.00, 'g', '200 g', 4.2, false, true, '{}'::jsonb, '["Brand: Nescafe", "Pack size: 200 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "200 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'tea-coffee-beverages'), 'Nescafe Classic Instant Coffee', 'nescafe-classic-instant-coffee-500-g', 'Nescafe', 'Instant coffee powder for quick hot or cold coffee at home.', 'Nescafe Classic Instant Coffee - 500 g.', 1485.00, null, 101, 500.00, 'g', '500 g', 4.4, false, true, '{}'::jsonb, '["Brand: Nescafe", "Pack size: 500 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "500 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'Maggi 2-Minute Masala Instant Noodles', 'maggi-2-minute-masala-instant-noodles-32-g', 'Maggi', 'Classic masala instant noodles for a quick snack or light meal.', 'Maggi 2-Minute Masala Instant Noodles - 32 g.', 5.00, null, 158, 32.00, 'g', '32 g', 4.2, false, true, '{}'::jsonb, '["Brand: Maggi", "Pack size: 32 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "32 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'Maggi 2-Minute Masala Instant Noodles', 'maggi-2-minute-masala-instant-noodles-70-g', 'Maggi', 'Classic masala instant noodles for a quick snack or light meal.', 'Maggi 2-Minute Masala Instant Noodles - 70 g.', 20.00, null, 34, 70.00, 'g', '70 g', 4.5, false, true, '{}'::jsonb, '["Brand: Maggi", "Pack size: 70 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "70 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'Maggi 2-Minute Masala Instant Noodles', 'maggi-2-minute-masala-instant-noodles-280-g', 'Maggi', 'Classic masala instant noodles for a quick snack or light meal.', 'Maggi 2-Minute Masala Instant Noodles - 280 g.', 80.00, null, 61, 280.00, 'g', '280 g', 4.4, true, true, '{}'::jsonb, '["Brand: Maggi", "Pack size: 280 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "280 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'Maggi 2-Minute Masala Instant Noodles', 'maggi-2-minute-masala-instant-noodles-840-g', 'Maggi', 'Classic masala instant noodles for a quick snack or light meal.', 'Maggi 2-Minute Masala Instant Noodles - 840 g.', 240.00, null, 29, 840.00, 'g', '840 g', 4.1, false, true, '{}'::jsonb, '["Brand: Maggi", "Pack size: 840 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "840 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'Maggi 2-Minute Masala Instant Noodles', 'maggi-2-minute-masala-instant-noodles-8-x-70-g', 'Maggi', 'Classic masala instant noodles for a quick snack or light meal.', 'Maggi 2-Minute Masala Instant Noodles - 8 x 70 g.', 160.00, null, 172, 560.00, 'g', '8 x 70 g', 4.5, false, true, '{}'::jsonb, '["Brand: Maggi", "Pack size: 8 x 70 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "8 x 70 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'Sunfeast YiPPee! Magic Masala Instant Noodles', 'sunfeast-yippee-magic-masala-instant-noodles-23-5-g', 'Sunfeast YiPPee!', 'Long non-sticky instant noodles with Indian Magic Masala seasoning.', 'Sunfeast YiPPee! Magic Masala Instant Noodles - 23.5 g.', 5.00, null, 97, 23.50, 'g', '23.5 g', 4.0, false, true, '{}'::jsonb, '["Brand: Sunfeast YiPPee!", "Pack size: 23.5 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "23.5 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'Sunfeast YiPPee! Magic Masala Instant Noodles', 'sunfeast-yippee-magic-masala-instant-noodles-51-2-g', 'Sunfeast YiPPee!', 'Long non-sticky instant noodles with Indian Magic Masala seasoning.', 'Sunfeast YiPPee! Magic Masala Instant Noodles - 51.2 g.', 10.00, null, 52, 51.20, 'g', '51.2 g', 4.2, false, true, '{}'::jsonb, '["Brand: Sunfeast YiPPee!", "Pack size: 51.2 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "51.2 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'Sunfeast YiPPee! Magic Masala Instant Noodles', 'sunfeast-yippee-magic-masala-instant-noodles-272-g', 'Sunfeast YiPPee!', 'Long non-sticky instant noodles with Indian Magic Masala seasoning.', 'Sunfeast YiPPee! Magic Masala Instant Noodles - 272 g.', 60.00, null, 116, 272.00, 'g', '272 g', 4.1, false, true, '{}'::jsonb, '["Brand: Sunfeast YiPPee!", "Pack size: 272 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "272 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'Sunfeast YiPPee! Magic Masala Instant Noodles', 'sunfeast-yippee-magic-masala-instant-noodles-544-g', 'Sunfeast YiPPee!', 'Long non-sticky instant noodles with Indian Magic Masala seasoning.', 'Sunfeast YiPPee! Magic Masala Instant Noodles - 544 g.', 112.00, null, 76, 544.00, 'g', '544 g', 4.1, false, true, '{}'::jsonb, '["Brand: Sunfeast YiPPee!", "Pack size: 544 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "544 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'MTR Upma Mix', 'mtr-upma-mix-160-g', 'MTR', 'Ready breakfast mix for preparing South Indian-style upma quickly.', 'MTR Upma Mix - 160 g.', 58.00, null, 27, 160.00, 'g', '160 g', 4.5, false, true, '{}'::jsonb, '["Brand: MTR", "Pack size: 160 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "160 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'MTR Upma Mix', 'mtr-upma-mix-500-g', 'MTR', 'Ready breakfast mix for preparing South Indian-style upma quickly.', 'MTR Upma Mix - 500 g.', 115.00, null, 158, 500.00, 'g', '500 g', 4.5, false, true, '{}'::jsonb, '["Brand: MTR", "Pack size: 500 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "500 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'MTR Upma Mix', 'mtr-upma-mix-2-x-160-g', 'MTR', 'Ready breakfast mix for preparing South Indian-style upma quickly.', 'MTR Upma Mix - 2 x 160 g.', 116.00, null, 85, 320.00, 'g', '2 x 160 g', 4.1, false, true, '{}'::jsonb, '["Brand: MTR", "Pack size: 2 x 160 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "2 x 160 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'MTR Upma Mix', 'mtr-upma-mix-1-kg', 'MTR', 'Ready breakfast mix for preparing South Indian-style upma quickly.', 'MTR Upma Mix - 1 kg.', 220.00, null, 24, 1.00, 'kg', '1 kg', 4.2, false, true, '{}'::jsonb, '["Brand: MTR", "Pack size: 1 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'McCain French Fries', 'mccain-french-fries-200-g', 'McCain', 'Frozen potato fries for air frying, baking or deep frying.', 'McCain French Fries - 200 g.', 55.00, null, 126, 200.00, 'g', '200 g', 4.2, false, true, '{}'::jsonb, '["Brand: McCain", "Pack size: 200 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "200 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'McCain French Fries', 'mccain-french-fries-420-g', 'McCain', 'Frozen potato fries for air frying, baking or deep frying.', 'McCain French Fries - 420 g.', 129.00, null, 55, 420.00, 'g', '420 g', 4.5, false, true, '{}'::jsonb, '["Brand: McCain", "Pack size: 420 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "420 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'McCain French Fries', 'mccain-french-fries-1-kg', 'McCain', 'Frozen potato fries for air frying, baking or deep frying.', 'McCain French Fries - 1 kg.', 279.00, null, 65, 1.00, 'kg', '1 kg', 4.4, true, true, '{}'::jsonb, '["Brand: McCain", "Pack size: 1 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'instant-frozen-food'), 'McCain French Fries', 'mccain-french-fries-1-25-kg', 'McCain', 'Frozen potato fries for air frying, baking or deep frying.', 'McCain French Fries - 1.25 kg.', 330.00, null, 151, 1.25, 'kg', '1.25 kg', 4.2, false, true, '{}'::jsonb, '["Brand: McCain", "Pack size: 1.25 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1.25 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'sauces-spreads'), 'Kissan Fresh Tomato Ketchup', 'kissan-fresh-tomato-ketchup-90-g', 'Kissan', 'Tomato ketchup for sandwiches, snacks, fries, noodles and everyday meals.', 'Kissan Fresh Tomato Ketchup - 90 g.', 10.00, null, 153, 90.00, 'g', '90 g', 4.5, false, true, '{}'::jsonb, '["Brand: Kissan", "Pack size: 90 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "90 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'sauces-spreads'), 'Kissan Fresh Tomato Ketchup', 'kissan-fresh-tomato-ketchup-415-g', 'Kissan', 'Tomato ketchup for sandwiches, snacks, fries, noodles and everyday meals.', 'Kissan Fresh Tomato Ketchup - 415 g.', 60.00, null, 22, 415.00, 'g', '415 g', 4.5, false, true, '{}'::jsonb, '["Brand: Kissan", "Pack size: 415 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "415 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'sauces-spreads'), 'Kissan Fresh Tomato Ketchup', 'kissan-fresh-tomato-ketchup-825-g', 'Kissan', 'Tomato ketchup for sandwiches, snacks, fries, noodles and everyday meals.', 'Kissan Fresh Tomato Ketchup - 825 g.', 99.00, null, 140, 825.00, 'g', '825 g', 4.0, false, true, '{}'::jsonb, '["Brand: Kissan", "Pack size: 825 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "825 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'sauces-spreads'), 'Kissan Fresh Tomato Ketchup', 'kissan-fresh-tomato-ketchup-1-kg', 'Kissan', 'Tomato ketchup for sandwiches, snacks, fries, noodles and everyday meals.', 'Kissan Fresh Tomato Ketchup - 1 kg.', 140.00, null, 150, 1.00, 'kg', '1 kg', 4.1, false, true, '{}'::jsonb, '["Brand: Kissan", "Pack size: 1 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'sauces-spreads'), 'Veeba Eggless Veg Mayonnaise', 'veeba-eggless-veg-mayonnaise-100-g', 'Veeba', 'Creamy eggless vegetarian mayonnaise for sandwiches, burgers and dips.', 'Veeba Eggless Veg Mayonnaise - 100 g.', 45.00, null, 122, 100.00, 'g', '100 g', 4.5, false, true, '{}'::jsonb, '["Brand: Veeba", "Pack size: 100 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "100 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'sauces-spreads'), 'Veeba Eggless Veg Mayonnaise', 'veeba-eggless-veg-mayonnaise-250-g', 'Veeba', 'Creamy eggless vegetarian mayonnaise for sandwiches, burgers and dips.', 'Veeba Eggless Veg Mayonnaise - 250 g.', 89.00, null, 79, 250.00, 'g', '250 g', 4.4, false, true, '{}'::jsonb, '["Brand: Veeba", "Pack size: 250 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "250 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'sauces-spreads'), 'Veeba Eggless Veg Mayonnaise', 'veeba-eggless-veg-mayonnaise-500-g', 'Veeba', 'Creamy eggless vegetarian mayonnaise for sandwiches, burgers and dips.', 'Veeba Eggless Veg Mayonnaise - 500 g.', 159.00, null, 107, 500.00, 'g', '500 g', 4.1, false, true, '{}'::jsonb, '["Brand: Veeba", "Pack size: 500 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "500 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'sauces-spreads'), 'Veeba Eggless Veg Mayonnaise', 'veeba-eggless-veg-mayonnaise-875-g', 'Veeba', 'Creamy eggless vegetarian mayonnaise for sandwiches, burgers and dips.', 'Veeba Eggless Veg Mayonnaise - 875 g.', 219.00, null, 137, 875.00, 'g', '875 g', 4.5, false, true, '{}'::jsonb, '["Brand: Veeba", "Pack size: 875 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "875 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'sauces-spreads'), 'Nutella Hazelnut & Cocoa Spread', 'nutella-hazelnut-and-cocoa-spread-180-g', 'Nutella', 'Hazelnut and cocoa spread for bread, pancakes, desserts and breakfast.', 'Nutella Hazelnut & Cocoa Spread - 180 g.', 220.00, null, 141, 180.00, 'g', '180 g', 4.5, false, true, '{}'::jsonb, '["Brand: Nutella", "Pack size: 180 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "180 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'sauces-spreads'), 'Nutella Hazelnut & Cocoa Spread', 'nutella-hazelnut-and-cocoa-spread-290-g', 'Nutella', 'Hazelnut and cocoa spread for bread, pancakes, desserts and breakfast.', 'Nutella Hazelnut & Cocoa Spread - 290 g.', 339.00, null, 68, 290.00, 'g', '290 g', 4.1, false, true, '{}'::jsonb, '["Brand: Nutella", "Pack size: 290 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "290 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'sauces-spreads'), 'Nutella Hazelnut & Cocoa Spread', 'nutella-hazelnut-and-cocoa-spread-350-g', 'Nutella', 'Hazelnut and cocoa spread for bread, pancakes, desserts and breakfast.', 'Nutella Hazelnut & Cocoa Spread - 350 g.', 380.00, null, 59, 350.00, 'g', '350 g', 4.3, false, true, '{}'::jsonb, '["Brand: Nutella", "Pack size: 350 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "350 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'sauces-spreads'), 'Nutella Hazelnut & Cocoa Spread', 'nutella-hazelnut-and-cocoa-spread-750-g', 'Nutella', 'Hazelnut and cocoa spread for bread, pancakes, desserts and breakfast.', 'Nutella Hazelnut & Cocoa Spread - 750 g.', 819.00, null, 110, 750.00, 'g', '750 g', 4.4, false, true, '{}'::jsonb, '["Brand: Nutella", "Pack size: 750 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "750 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Colgate Strong Teeth Anticavity Toothpaste', 'colgate-strong-teeth-anticavity-toothpaste-40-g', 'Colgate', 'Everyday family anticavity toothpaste for cleaning and stronger teeth.', 'Colgate Strong Teeth Anticavity Toothpaste - 40 g.', 20.00, null, 29, 40.00, 'g', '40 g', 4.5, true, true, '{}'::jsonb, '["Brand: Colgate", "Pack size: 40 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "40 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Colgate Strong Teeth Anticavity Toothpaste', 'colgate-strong-teeth-anticavity-toothpaste-100-g', 'Colgate', 'Everyday family anticavity toothpaste for cleaning and stronger teeth.', 'Colgate Strong Teeth Anticavity Toothpaste - 100 g.', 73.00, null, 96, 100.00, 'g', '100 g', 4.2, false, true, '{}'::jsonb, '["Brand: Colgate", "Pack size: 100 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "100 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Colgate Strong Teeth Anticavity Toothpaste', 'colgate-strong-teeth-anticavity-toothpaste-150-g', 'Colgate', 'Everyday family anticavity toothpaste for cleaning and stronger teeth.', 'Colgate Strong Teeth Anticavity Toothpaste - 150 g.', 86.00, null, 87, 150.00, 'g', '150 g', 4.1, false, true, '{}'::jsonb, '["Brand: Colgate", "Pack size: 150 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "150 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Colgate Strong Teeth Anticavity Toothpaste', 'colgate-strong-teeth-anticavity-toothpaste-200-g', 'Colgate', 'Everyday family anticavity toothpaste for cleaning and stronger teeth.', 'Colgate Strong Teeth Anticavity Toothpaste - 200 g.', 125.00, null, 45, 200.00, 'g', '200 g', 4.0, false, true, '{}'::jsonb, '["Brand: Colgate", "Pack size: 200 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "200 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Colgate Strong Teeth Anticavity Toothpaste', 'colgate-strong-teeth-anticavity-toothpaste-300-g-toothbrush', 'Colgate', 'Everyday family anticavity toothpaste for cleaning and stronger teeth.', 'Colgate Strong Teeth Anticavity Toothpaste - 300 g + Toothbrush.', 199.00, null, 169, 300.00, 'g', '300 g + Toothbrush', 4.2, false, true, '{}'::jsonb, '["Brand: Colgate", "Pack size: 300 g + Toothbrush", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "300 g + Toothbrush", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Pepsodent 12Hr Germicheck Toothpaste', 'pepsodent-12hr-germicheck-toothpaste-25-g', 'Pepsodent', 'Family toothpaste for cavity protection and everyday oral hygiene.', 'Pepsodent 12Hr Germicheck Toothpaste - 25 g.', 15.00, null, 120, 25.00, 'g', '25 g', 4.3, false, true, '{}'::jsonb, '["Brand: Pepsodent", "Pack size: 25 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "25 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Pepsodent 12Hr Germicheck Toothpaste', 'pepsodent-12hr-germicheck-toothpaste-100-g', 'Pepsodent', 'Family toothpaste for cavity protection and everyday oral hygiene.', 'Pepsodent 12Hr Germicheck Toothpaste - 100 g.', 70.00, null, 152, 100.00, 'g', '100 g', 4.5, false, true, '{}'::jsonb, '["Brand: Pepsodent", "Pack size: 100 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "100 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Pepsodent 12Hr Germicheck Toothpaste', 'pepsodent-12hr-germicheck-toothpaste-150-g', 'Pepsodent', 'Family toothpaste for cavity protection and everyday oral hygiene.', 'Pepsodent 12Hr Germicheck Toothpaste - 150 g.', 103.00, null, 150, 150.00, 'g', '150 g', 4.0, true, true, '{}'::jsonb, '["Brand: Pepsodent", "Pack size: 150 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "150 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Pepsodent 12Hr Germicheck Toothpaste', 'pepsodent-12hr-germicheck-toothpaste-200-g', 'Pepsodent', 'Family toothpaste for cavity protection and everyday oral hygiene.', 'Pepsodent 12Hr Germicheck Toothpaste - 200 g.', 131.00, null, 119, 200.00, 'g', '200 g', 4.2, false, true, '{}'::jsonb, '["Brand: Pepsodent", "Pack size: 200 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "200 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Dove Nutrient Serum Soap Bar', 'dove-nutrient-serum-soap-bar-50-g', 'Dove', 'Gentle bathing bar for daily cleansing and moisturised-feeling skin.', 'Dove Nutrient Serum Soap Bar - 50 g.', 25.00, null, 99, 50.00, 'g', '50 g', 4.0, false, true, '{}'::jsonb, '["Brand: Dove", "Pack size: 50 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "50 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Dove Nutrient Serum Soap Bar', 'dove-nutrient-serum-soap-bar-100-g', 'Dove', 'Gentle bathing bar for daily cleansing and moisturised-feeling skin.', 'Dove Nutrient Serum Soap Bar - 100 g.', 62.00, null, 68, 100.00, 'g', '100 g', 4.1, false, true, '{}'::jsonb, '["Brand: Dove", "Pack size: 100 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "100 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Dove Nutrient Serum Soap Bar', 'dove-nutrient-serum-soap-bar-3-x-75-g', 'Dove', 'Gentle bathing bar for daily cleansing and moisturised-feeling skin.', 'Dove Nutrient Serum Soap Bar - 3 x 75 g.', 150.00, null, 95, 225.00, 'g', '3 x 75 g', 4.4, false, true, '{}'::jsonb, '["Brand: Dove", "Pack size: 3 x 75 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "3 x 75 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Dove Nutrient Serum Soap Bar', 'dove-nutrient-serum-soap-bar-3-x-125-g', 'Dove', 'Gentle bathing bar for daily cleansing and moisturised-feeling skin.', 'Dove Nutrient Serum Soap Bar - 3 x 125 g.', 240.00, null, 54, 375.00, 'g', '3 x 125 g', 4.3, false, true, '{}'::jsonb, '["Brand: Dove", "Pack size: 3 x 125 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "3 x 125 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Lux Glow Lush Rose Bathing Soap', 'lux-glow-lush-rose-bathing-soap-43-g', 'Lux', 'Rose-fragranced bathing soap for daily cleansing and a fresh floral fragrance.', 'Lux Glow Lush Rose Bathing Soap - 43 g.', 10.00, null, 22, 43.00, 'g', '43 g', 4.4, false, true, '{}'::jsonb, '["Brand: Lux", "Pack size: 43 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "43 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Lux Glow Lush Rose Bathing Soap', 'lux-glow-lush-rose-bathing-soap-100-g', 'Lux', 'Rose-fragranced bathing soap for daily cleansing and a fresh floral fragrance.', 'Lux Glow Lush Rose Bathing Soap - 100 g.', 40.00, null, 128, 100.00, 'g', '100 g', 4.2, false, true, '{}'::jsonb, '["Brand: Lux", "Pack size: 100 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "100 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Lux Glow Lush Rose Bathing Soap', 'lux-glow-lush-rose-bathing-soap-150-g', 'Lux', 'Rose-fragranced bathing soap for daily cleansing and a fresh floral fragrance.', 'Lux Glow Lush Rose Bathing Soap - 150 g.', 50.00, null, 157, 150.00, 'g', '150 g', 4.1, false, true, '{}'::jsonb, '["Brand: Lux", "Pack size: 150 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "150 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Lux Glow Lush Rose Bathing Soap', 'lux-glow-lush-rose-bathing-soap-3-x-150-g', 'Lux', 'Rose-fragranced bathing soap for daily cleansing and a fresh floral fragrance.', 'Lux Glow Lush Rose Bathing Soap - 3 x 150 g.', 185.00, null, 27, 450.00, 'g', '3 x 150 g', 4.1, false, true, '{}'::jsonb, '["Brand: Lux", "Pack size: 3 x 150 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "3 x 150 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Head & Shoulders Smooth & Silky Anti-Dandruff Shampoo', 'head-and-shoulders-smooth-and-silky-anti-dandruff-shampoo-72-ml', 'Head & Shoulders', 'Anti-dandruff shampoo formulated for smooth and silky-feeling hair.', 'Head & Shoulders Smooth & Silky Anti-Dandruff Shampoo - 72 ml.', 74.00, null, 57, 72.00, 'ml', '72 ml', 4.1, true, true, '{}'::jsonb, '["Brand: Head & Shoulders", "Pack size: 72 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "72 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Head & Shoulders Smooth & Silky Anti-Dandruff Shampoo', 'head-and-shoulders-smooth-and-silky-anti-dandruff-shampoo-180-ml', 'Head & Shoulders', 'Anti-dandruff shampoo formulated for smooth and silky-feeling hair.', 'Head & Shoulders Smooth & Silky Anti-Dandruff Shampoo - 180 ml.', 191.00, null, 49, 180.00, 'ml', '180 ml', 4.4, false, true, '{}'::jsonb, '["Brand: Head & Shoulders", "Pack size: 180 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "180 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Head & Shoulders Smooth & Silky Anti-Dandruff Shampoo', 'head-and-shoulders-smooth-and-silky-anti-dandruff-shampoo-340-ml', 'Head & Shoulders', 'Anti-dandruff shampoo formulated for smooth and silky-feeling hair.', 'Head & Shoulders Smooth & Silky Anti-Dandruff Shampoo - 340 ml.', 364.00, null, 20, 340.00, 'ml', '340 ml', 4.2, true, true, '{}'::jsonb, '["Brand: Head & Shoulders", "Pack size: 340 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "340 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Head & Shoulders Smooth & Silky Anti-Dandruff Shampoo', 'head-and-shoulders-smooth-and-silky-anti-dandruff-shampoo-650-ml', 'Head & Shoulders', 'Anti-dandruff shampoo formulated for smooth and silky-feeling hair.', 'Head & Shoulders Smooth & Silky Anti-Dandruff Shampoo - 650 ml.', 989.00, null, 97, 650.00, 'ml', '650 ml', 4.1, false, true, '{}'::jsonb, '["Brand: Head & Shoulders", "Pack size: 650 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "650 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Head & Shoulders Smooth & Silky Anti-Dandruff Shampoo', 'head-and-shoulders-smooth-and-silky-anti-dandruff-shampoo-1-l', 'Head & Shoulders', 'Anti-dandruff shampoo formulated for smooth and silky-feeling hair.', 'Head & Shoulders Smooth & Silky Anti-Dandruff Shampoo - 1 L.', 1199.00, null, 173, 1.00, 'L', '1 L', 4.4, false, true, '{}'::jsonb, '["Brand: Head & Shoulders", "Pack size: 1 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Surf Excel Matic Front Load Detergent Powder', 'surf-excel-matic-front-load-detergent-powder-1-kg', 'Surf Excel', 'Detergent powder formulated for front-load washing machines and tough stains.', 'Surf Excel Matic Front Load Detergent Powder - 1 kg.', 290.00, null, 47, 1.00, 'kg', '1 kg', 4.2, false, true, '{}'::jsonb, '["Brand: Surf Excel", "Pack size: 1 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Surf Excel Matic Front Load Detergent Powder', 'surf-excel-matic-front-load-detergent-powder-2-kg', 'Surf Excel', 'Detergent powder formulated for front-load washing machines and tough stains.', 'Surf Excel Matic Front Load Detergent Powder - 2 kg.', 600.00, null, 38, 2.00, 'kg', '2 kg', 4.3, false, true, '{}'::jsonb, '["Brand: Surf Excel", "Pack size: 2 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "2 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Surf Excel Matic Front Load Detergent Powder', 'surf-excel-matic-front-load-detergent-powder-4-kg', 'Surf Excel', 'Detergent powder formulated for front-load washing machines and tough stains.', 'Surf Excel Matic Front Load Detergent Powder - 4 kg.', 920.00, null, 97, 4.00, 'kg', '4 kg', 4.5, true, true, '{}'::jsonb, '["Brand: Surf Excel", "Pack size: 4 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "4 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Surf Excel Matic Front Load Detergent Powder', 'surf-excel-matic-front-load-detergent-powder-6-kg', 'Surf Excel', 'Detergent powder formulated for front-load washing machines and tough stains.', 'Surf Excel Matic Front Load Detergent Powder - 6 kg.', 1475.00, null, 141, 6.00, 'kg', '6 kg', 4.3, true, true, '{}'::jsonb, '["Brand: Surf Excel", "Pack size: 6 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "6 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Surf Excel Matic Front Load Detergent Powder', 'surf-excel-matic-front-load-detergent-powder-500-g', 'Surf Excel', 'Detergent powder formulated for front-load washing machines and tough stains.', 'Surf Excel Matic Front Load Detergent Powder - 500 g.', 160.00, null, 152, 500.00, 'g', '500 g', 4.1, false, true, '{}'::jsonb, '["Brand: Surf Excel", "Pack size: 500 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "500 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Ariel Matic Front Load Detergent Powder', 'ariel-matic-front-load-detergent-powder-500-g', 'Ariel', 'Front-load machine detergent powder for everyday laundry and stain removal.', 'Ariel Matic Front Load Detergent Powder - 500 g.', 185.00, null, 136, 500.00, 'g', '500 g', 4.4, false, true, '{}'::jsonb, '["Brand: Ariel", "Pack size: 500 g", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "500 g", "unit": "g", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Ariel Matic Front Load Detergent Powder', 'ariel-matic-front-load-detergent-powder-1-kg', 'Ariel', 'Front-load machine detergent powder for everyday laundry and stain removal.', 'Ariel Matic Front Load Detergent Powder - 1 kg.', 360.00, null, 37, 1.00, 'kg', '1 kg', 4.0, false, true, '{}'::jsonb, '["Brand: Ariel", "Pack size: 1 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Ariel Matic Front Load Detergent Powder', 'ariel-matic-front-load-detergent-powder-2-kg', 'Ariel', 'Front-load machine detergent powder for everyday laundry and stain removal.', 'Ariel Matic Front Load Detergent Powder - 2 kg.', 685.00, null, 99, 2.00, 'kg', '2 kg', 4.2, false, true, '{}'::jsonb, '["Brand: Ariel", "Pack size: 2 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "2 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Ariel Matic Front Load Detergent Powder', 'ariel-matic-front-load-detergent-powder-4-kg', 'Ariel', 'Front-load machine detergent powder for everyday laundry and stain removal.', 'Ariel Matic Front Load Detergent Powder - 4 kg.', 1525.00, null, 77, 4.00, 'kg', '4 kg', 4.1, false, true, '{}'::jsonb, '["Brand: Ariel", "Pack size: 4 kg", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "4 kg", "unit": "kg", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Vim Concentrated Dishwash Gel', 'vim-concentrated-dishwash-gel-130-ml', 'Vim', 'Lemon dishwashing gel for grease removal and everyday utensil cleaning.', 'Vim Concentrated Dishwash Gel - 130 ml.', 20.00, null, 149, 130.00, 'ml', '130 ml', 4.4, false, true, '{}'::jsonb, '["Brand: Vim", "Pack size: 130 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "130 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Vim Concentrated Dishwash Gel', 'vim-concentrated-dishwash-gel-250-ml', 'Vim', 'Lemon dishwashing gel for grease removal and everyday utensil cleaning.', 'Vim Concentrated Dishwash Gel - 250 ml.', 65.00, null, 146, 250.00, 'ml', '250 ml', 4.3, false, true, '{}'::jsonb, '["Brand: Vim", "Pack size: 250 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "250 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Vim Concentrated Dishwash Gel', 'vim-concentrated-dishwash-gel-500-ml', 'Vim', 'Lemon dishwashing gel for grease removal and everyday utensil cleaning.', 'Vim Concentrated Dishwash Gel - 500 ml.', 120.00, null, 70, 500.00, 'ml', '500 ml', 4.3, false, true, '{}'::jsonb, '["Brand: Vim", "Pack size: 500 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "500 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Vim Concentrated Dishwash Gel', 'vim-concentrated-dishwash-gel-900-ml', 'Vim', 'Lemon dishwashing gel for grease removal and everyday utensil cleaning.', 'Vim Concentrated Dishwash Gel - 900 ml.', 190.00, null, 109, 900.00, 'ml', '900 ml', 4.2, false, true, '{}'::jsonb, '["Brand: Vim", "Pack size: 900 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "900 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Harpic Power Plus Original Toilet Cleaner', 'harpic-power-plus-original-toilet-cleaner-200-ml', 'Harpic', 'Liquid toilet cleaner for everyday toilet bowl cleaning and stain removal.', 'Harpic Power Plus Original Toilet Cleaner - 200 ml.', 40.00, null, 171, 200.00, 'ml', '200 ml', 4.3, false, true, '{}'::jsonb, '["Brand: Harpic", "Pack size: 200 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "200 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Harpic Power Plus Original Toilet Cleaner', 'harpic-power-plus-original-toilet-cleaner-500-ml', 'Harpic', 'Liquid toilet cleaner for everyday toilet bowl cleaning and stain removal.', 'Harpic Power Plus Original Toilet Cleaner - 500 ml.', 110.00, null, 133, 500.00, 'ml', '500 ml', 4.5, false, true, '{}'::jsonb, '["Brand: Harpic", "Pack size: 500 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "500 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Harpic Power Plus Original Toilet Cleaner', 'harpic-power-plus-original-toilet-cleaner-1-l', 'Harpic', 'Liquid toilet cleaner for everyday toilet bowl cleaning and stain removal.', 'Harpic Power Plus Original Toilet Cleaner - 1 L.', 195.00, null, 52, 1.00, 'L', '1 L', 4.3, false, true, '{}'::jsonb, '["Brand: Harpic", "Pack size: 1 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'household-care'), 'Harpic Power Plus Original Toilet Cleaner', 'harpic-power-plus-original-toilet-cleaner-2-x-1-l', 'Harpic', 'Liquid toilet cleaner for everyday toilet bowl cleaning and stain removal.', 'Harpic Power Plus Original Toilet Cleaner - 2 x 1 L.', 430.00, null, 50, 2.00, 'L', '2 x 1 L', 4.2, false, true, '{}'::jsonb, '["Brand: Harpic", "Pack size: 2 x 1 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "2 x 1 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Dettol Original Liquid Handwash', 'dettol-original-liquid-handwash-175-ml', 'Dettol', 'Liquid handwash for everyday hand cleaning and household hygiene.', 'Dettol Original Liquid Handwash - 175 ml.', 50.00, null, 133, 175.00, 'ml', '175 ml', 4.2, true, true, '{}'::jsonb, '["Brand: Dettol", "Pack size: 175 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "175 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Dettol Original Liquid Handwash', 'dettol-original-liquid-handwash-675-ml', 'Dettol', 'Liquid handwash for everyday hand cleaning and household hygiene.', 'Dettol Original Liquid Handwash - 675 ml.', 109.00, null, 180, 675.00, 'ml', '675 ml', 4.2, false, true, '{}'::jsonb, '["Brand: Dettol", "Pack size: 675 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "675 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Dettol Original Liquid Handwash', 'dettol-original-liquid-handwash-875-ml', 'Dettol', 'Liquid handwash for everyday hand cleaning and household hygiene.', 'Dettol Original Liquid Handwash - 875 ml.', 155.00, null, 56, 875.00, 'ml', '875 ml', 4.4, false, true, '{}'::jsonb, '["Brand: Dettol", "Pack size: 875 ml", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "875 ml", "unit": "ml", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'personal-care'), 'Dettol Original Liquid Handwash', 'dettol-original-liquid-handwash-1-35-l', 'Dettol', 'Liquid handwash for everyday hand cleaning and household hygiene.', 'Dettol Original Liquid Handwash - 1.35 L.', 219.00, null, 88, 1.35, 'L', '1.35 L', 4.2, false, true, '{}'::jsonb, '["Brand: Dettol", "Pack size: 1.35 L", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "1.35 L", "unit": "L", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'baby-care'), 'Pampers Baby-Dry Diaper Pants New Baby', 'pampers-baby-dry-diaper-pants-new-baby-8-pcs', 'Pampers', 'Baby diaper pants designed for comfortable daily use and leak protection.', 'Pampers Baby-Dry Diaper Pants New Baby - 8 pcs.', 93.00, null, 122, 8.00, 'pcs', '8 pcs', 4.3, true, true, '{}'::jsonb, '["Brand: Pampers", "Pack size: 8 pcs", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "8 pcs", "unit": "pcs", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'baby-care'), 'Pampers Baby-Dry Diaper Pants New Baby', 'pampers-baby-dry-diaper-pants-new-baby-17-pcs', 'Pampers', 'Baby diaper pants designed for comfortable daily use and leak protection.', 'Pampers Baby-Dry Diaper Pants New Baby - 17 pcs.', 199.00, null, 104, 17.00, 'pcs', '17 pcs', 4.5, false, true, '{}'::jsonb, '["Brand: Pampers", "Pack size: 17 pcs", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "17 pcs", "unit": "pcs", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'baby-care'), 'Pampers Baby-Dry Diaper Pants New Baby', 'pampers-baby-dry-diaper-pants-new-baby-34-pcs', 'Pampers', 'Baby diaper pants designed for comfortable daily use and leak protection.', 'Pampers Baby-Dry Diaper Pants New Baby - 34 pcs.', 399.00, null, 44, 34.00, 'pcs', '34 pcs', 4.5, false, true, '{}'::jsonb, '["Brand: Pampers", "Pack size: 34 pcs", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "34 pcs", "unit": "pcs", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'baby-care'), 'Pampers Baby-Dry Diaper Pants New Baby', 'pampers-baby-dry-diaper-pants-new-baby-56-pcs', 'Pampers', 'Baby diaper pants designed for comfortable daily use and leak protection.', 'Pampers Baby-Dry Diaper Pants New Baby - 56 pcs.', 699.00, null, 146, 56.00, 'pcs', '56 pcs', 4.5, false, true, '{}'::jsonb, '["Brand: Pampers", "Pack size: 56 pcs", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "56 pcs", "unit": "pcs", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'baby-care'), 'Huggies Baby Wipes Cucumber & Aloe', 'huggies-baby-wipes-cucumber-and-aloe-20-wipes', 'Huggies', 'Soft baby wipes with cucumber and aloe for everyday cleaning.', 'Huggies Baby Wipes Cucumber & Aloe - 20 wipes.', 55.00, null, 159, 20.00, 'pcs', '20 wipes', 4.4, false, true, '{}'::jsonb, '["Brand: Huggies", "Pack size: 20 wipes", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "20 wipes", "unit": "pcs", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'baby-care'), 'Huggies Baby Wipes Cucumber & Aloe', 'huggies-baby-wipes-cucumber-and-aloe-72-wipes', 'Huggies', 'Soft baby wipes with cucumber and aloe for everyday cleaning.', 'Huggies Baby Wipes Cucumber & Aloe - 72 wipes.', 199.00, null, 110, 72.00, 'pcs', '72 wipes', 4.5, false, true, '{}'::jsonb, '["Brand: Huggies", "Pack size: 72 wipes", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "72 wipes", "unit": "pcs", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'baby-care'), 'Huggies Baby Wipes Cucumber & Aloe', 'huggies-baby-wipes-cucumber-and-aloe-3-x-72-wipes', 'Huggies', 'Soft baby wipes with cucumber and aloe for everyday cleaning.', 'Huggies Baby Wipes Cucumber & Aloe - 3 x 72 wipes.', 549.00, null, 122, 216.00, 'pcs', '3 x 72 wipes', 4.5, true, true, '{}'::jsonb, '["Brand: Huggies", "Pack size: 3 x 72 wipes", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "3 x 72 wipes", "unit": "pcs", "market": "India", "price_type": "MRP"}'::jsonb, 'INR'),
    ((select id from public.categories where slug = 'baby-care'), 'Huggies Baby Wipes Cucumber & Aloe', 'huggies-baby-wipes-cucumber-and-aloe-5-x-72-wipes', 'Huggies', 'Soft baby wipes with cucumber and aloe for everyday cleaning.', 'Huggies Baby Wipes Cucumber & Aloe - 5 x 72 wipes.', 899.00, null, 88, 360.00, 'pcs', '5 x 72 wipes', 4.4, false, true, '{}'::jsonb, '["Brand: Huggies", "Pack size: 5 x 72 wipes", "Indian-market grocery/daily-use product"]'::jsonb, '{"pack_size": "5 x 72 wipes", "unit": "pcs", "market": "India", "price_type": "MRP"}'::jsonb, 'INR');

-- =========================================================
-- INSERT PRODUCT IMAGE URLS
-- The images are NOT uploaded to Supabase Storage.
-- Frontend can render these URLs directly from product_images.
-- =========================================================

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.jiomart.com/images/product/original/590008612/amul-taaza-toned-milk-2-l-product-images-o590008612-p610100848-0-202508041920.jpg?im=Resize%3D%281000%2C1000%29', true, 0
from public.products where slug = 'amul-taaza-toned-milk-500-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.jiomart.com/images/product/original/590008612/amul-taaza-toned-milk-2-l-product-images-o590008612-p610100848-0-202508041920.jpg?im=Resize%3D%281000%2C1000%29', true, 0
from public.products where slug = 'amul-taaza-toned-milk-1-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.jiomart.com/images/product/original/590008612/amul-taaza-toned-milk-2-l-product-images-o590008612-p610100848-0-202508041920.jpg?im=Resize%3D%281000%2C1000%29', true, 0
from public.products where slug = 'amul-taaza-toned-milk-2-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.jiomart.com/images/product/original/590008612/amul-taaza-toned-milk-2-l-product-images-o590008612-p610100848-0-202508041920.jpg?im=Resize%3D%281000%2C1000%29', true, 0
from public.products where slug = 'amul-taaza-toned-milk-6-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.jiomart.com/images/product/original/490001387a3x/amul-pasteurised-butter-100-g-product-images-o490001387a3x-p611732442-6-202506271246.jpg?im=Resize%3D%28420%2C420%29', true, 0
from public.products where slug = 'amul-pasteurised-butter-100-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.jiomart.com/images/product/original/490001387a3x/amul-pasteurised-butter-100-g-product-images-o490001387a3x-p611732442-6-202506271246.jpg?im=Resize%3D%28420%2C420%29', true, 0
from public.products where slug = 'amul-pasteurised-butter-200-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.jiomart.com/images/product/original/490001387a3x/amul-pasteurised-butter-100-g-product-images-o490001387a3x-p611732442-6-202506271246.jpg?im=Resize%3D%28420%2C420%29', true, 0
from public.products where slug = 'amul-pasteurised-butter-500-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.jiomart.com/images/product/original/490001387a3x/amul-pasteurised-butter-100-g-product-images-o490001387a3x-p611732442-6-202506271246.jpg?im=Resize%3D%28420%2C420%29', true, 0
from public.products where slug = 'amul-pasteurised-butter-1-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://services.kpnfresh.com/media/v1/products/images/c971d646-7652-4861-a60b-346b6af757da/amul-cheese-slice.webp?c_type=C1', true, 0
from public.products where slug = 'amul-cheese-slices-100-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://services.kpnfresh.com/media/v1/products/images/c971d646-7652-4861-a60b-346b6af757da/amul-cheese-slice.webp?c_type=C1', true, 0
from public.products where slug = 'amul-cheese-slices-200-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://services.kpnfresh.com/media/v1/products/images/c971d646-7652-4861-a60b-346b6af757da/amul-cheese-slice.webp?c_type=C1', true, 0
from public.products where slug = 'amul-cheese-slices-400-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://services.kpnfresh.com/media/v1/products/images/c971d646-7652-4861-a60b-346b6af757da/amul-cheese-slice.webp?c_type=C1', true, 0
from public.products where slug = 'amul-cheese-slices-750-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40343420_1-mother-dairy-classic-curd.jpg', true, 0
from public.products where slug = 'mother-dairy-classic-curd-200-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40343420_1-mother-dairy-classic-curd.jpg', true, 0
from public.products where slug = 'mother-dairy-classic-curd-400-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40343420_1-mother-dairy-classic-curd.jpg', true, 0
from public.products where slug = 'mother-dairy-classic-curd-1-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40343420_1-mother-dairy-classic-curd.jpg', true, 0
from public.products where slug = 'mother-dairy-classic-curd-2-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.gandhi-bazar.com/cdn/shop/products/amul-paneer-fresh-200g.jpg?v=1616022146', true, 0
from public.products where slug = 'amul-fresh-paneer-200-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.gandhi-bazar.com/cdn/shop/products/amul-paneer-fresh-200g.jpg?v=1616022146', true, 0
from public.products where slug = 'amul-fresh-paneer-500-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.gandhi-bazar.com/cdn/shop/products/amul-paneer-fresh-200g.jpg?v=1616022146', true, 0
from public.products where slug = 'amul-fresh-paneer-1-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.gandhi-bazar.com/cdn/shop/products/amul-paneer-fresh-200g.jpg?v=1616022146', true, 0
from public.products where slug = 'amul-fresh-paneer-2-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40092241_9-britannia-brown-bread-with-goodness-of-wheat-enriched-with-vitamins.jpg', true, 0
from public.products where slug = 'britannia-brown-bread-400-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40092241_9-britannia-brown-bread-with-goodness-of-wheat-enriched-with-vitamins.jpg', true, 0
from public.products where slug = 'britannia-brown-bread-450-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40092241_9-britannia-brown-bread-with-goodness-of-wheat-enriched-with-vitamins.jpg', true, 0
from public.products where slug = 'britannia-brown-bread-800-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40092241_9-britannia-brown-bread-with-goodness-of-wheat-enriched-with-vitamins.jpg', true, 0
from public.products where slug = 'britannia-brown-bread-2-x-400-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/122620_15-kelloggs-corn-flakes.jpg', true, 0
from public.products where slug = 'kellogg-s-corn-flakes-original-250-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/122620_15-kelloggs-corn-flakes.jpg', true, 0
from public.products where slug = 'kellogg-s-corn-flakes-original-475-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/122620_15-kelloggs-corn-flakes.jpg', true, 0
from public.products where slug = 'kellogg-s-corn-flakes-original-875-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/122620_15-kelloggs-corn-flakes.jpg', true, 0
from public.products where slug = 'kellogg-s-corn-flakes-original-1-2-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/208345_24-quaker-oats-breakfast-cereal-rich-in-protein-dietary-fibre-nutritious-easy-to-cook.jpg', true, 0
from public.products where slug = 'quaker-oats-400-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/208345_24-quaker-oats-breakfast-cereal-rich-in-protein-dietary-fibre-nutritious-easy-to-cook.jpg', true, 0
from public.products where slug = 'quaker-oats-1-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/208345_24-quaker-oats-breakfast-cereal-rich-in-protein-dietary-fibre-nutritious-easy-to-cook.jpg', true, 0
from public.products where slug = 'quaker-oats-1-5-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/208345_24-quaker-oats-breakfast-cereal-rich-in-protein-dietary-fibre-nutritious-easy-to-cook.jpg', true, 0
from public.products where slug = 'quaker-oats-2-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40127506_9-aashirvaad-shudh-chakki-atta.jpg', true, 0
from public.products where slug = 'aashirvaad-shudh-chakki-atta-1-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40127506_9-aashirvaad-shudh-chakki-atta.jpg', true, 0
from public.products where slug = 'aashirvaad-shudh-chakki-atta-2-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40127506_9-aashirvaad-shudh-chakki-atta.jpg', true, 0
from public.products where slug = 'aashirvaad-shudh-chakki-atta-5-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40127506_9-aashirvaad-shudh-chakki-atta.jpg', true, 0
from public.products where slug = 'aashirvaad-shudh-chakki-atta-10-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/190594_8-india-gate-basmati-rice-super.jpg', true, 0
from public.products where slug = 'india-gate-basmati-rice-super-1-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/190594_8-india-gate-basmati-rice-super.jpg', true, 0
from public.products where slug = 'india-gate-basmati-rice-super-5-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/190594_8-india-gate-basmati-rice-super.jpg', true, 0
from public.products where slug = 'india-gate-basmati-rice-super-10-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/190594_8-india-gate-basmati-rice-super.jpg', true, 0
from public.products where slug = 'india-gate-basmati-rice-super-20-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40000291_14-tata-sampann-unpolished-toor-dalar-dal.jpg', true, 0
from public.products where slug = 'tata-sampann-unpolished-toor-dal-500-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40000291_14-tata-sampann-unpolished-toor-dalar-dal.jpg', true, 0
from public.products where slug = 'tata-sampann-unpolished-toor-dal-1-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40000291_14-tata-sampann-unpolished-toor-dalar-dal.jpg', true, 0
from public.products where slug = 'tata-sampann-unpolished-toor-dal-2-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40000291_14-tata-sampann-unpolished-toor-dalar-dal.jpg', true, 0
from public.products where slug = 'tata-sampann-unpolished-toor-dal-5-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40161771_7-fortune-sunflower-oil.jpg', true, 0
from public.products where slug = 'fortune-sunlite-refined-sunflower-oil-1-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40161771_7-fortune-sunflower-oil.jpg', true, 0
from public.products where slug = 'fortune-sunlite-refined-sunflower-oil-2-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40161771_7-fortune-sunflower-oil.jpg', true, 0
from public.products where slug = 'fortune-sunlite-refined-sunflower-oil-5-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40161771_7-fortune-sunflower-oil.jpg', true, 0
from public.products where slug = 'fortune-sunlite-refined-sunflower-oil-15-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/241600_10-tata-salt-iodized.jpg', true, 0
from public.products where slug = 'tata-salt-iodised-1-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/241600_10-tata-salt-iodized.jpg', true, 0
from public.products where slug = 'tata-salt-iodised-2-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/241600_10-tata-salt-iodized.jpg', true, 0
from public.products where slug = 'tata-salt-iodised-5-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/241600_10-tata-salt-iodized.jpg', true, 0
from public.products where slug = 'tata-salt-iodised-10-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/100004473_4-mdh-masala-garam.jpg', true, 0
from public.products where slug = 'mdh-garam-masala-50-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/100004473_4-mdh-masala-garam.jpg', true, 0
from public.products where slug = 'mdh-garam-masala-100-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/100004473_4-mdh-masala-garam.jpg', true, 0
from public.products where slug = 'mdh-garam-masala-200-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/100004473_4-mdh-masala-garam.jpg', true, 0
from public.products where slug = 'mdh-garam-masala-500-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://bazaar5.com/image/cache/catalog/pro/product/10005/everest-turmeric-powder-200-g-product-images-o490005440-p490005440-0-202203141822-1000x1000.jpg', true, 0
from public.products where slug = 'everest-turmeric-powder-100-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://bazaar5.com/image/cache/catalog/pro/product/10005/everest-turmeric-powder-200-g-product-images-o490005440-p490005440-0-202203141822-1000x1000.jpg', true, 0
from public.products where slug = 'everest-turmeric-powder-200-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://bazaar5.com/image/cache/catalog/pro/product/10005/everest-turmeric-powder-200-g-product-images-o490005440-p490005440-0-202203141822-1000x1000.jpg', true, 0
from public.products where slug = 'everest-turmeric-powder-500-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://bazaar5.com/image/cache/catalog/pro/product/10005/everest-turmeric-powder-200-g-product-images-o490005440-p490005440-0-202203141822-1000x1000.jpg', true, 0
from public.products where slug = 'everest-turmeric-powder-1-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/102750_20-lays-potato-chips-indias-magic-masala.jpg', true, 0
from public.products where slug = 'lay-s-india-s-magic-masala-potato-chips-24-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/102750_20-lays-potato-chips-indias-magic-masala.jpg', true, 0
from public.products where slug = 'lay-s-india-s-magic-masala-potato-chips-48-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/102750_20-lays-potato-chips-indias-magic-masala.jpg', true, 0
from public.products where slug = 'lay-s-india-s-magic-masala-potato-chips-90-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/102750_20-lays-potato-chips-indias-magic-masala.jpg', true, 0
from public.products where slug = 'lay-s-india-s-magic-masala-potato-chips-143-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/102750_20-lays-potato-chips-indias-magic-masala.jpg', true, 0
from public.products where slug = 'lay-s-india-s-magic-masala-potato-chips-12-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/102761_18-kurkure-namkeen-masala-munch.jpg', true, 0
from public.products where slug = 'kurkure-masala-munch-namkeen-18-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/102761_18-kurkure-namkeen-masala-munch.jpg', true, 0
from public.products where slug = 'kurkure-masala-munch-namkeen-75-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/102761_18-kurkure-namkeen-masala-munch.jpg', true, 0
from public.products where slug = 'kurkure-masala-munch-namkeen-94-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/102761_18-kurkure-namkeen-masala-munch.jpg', true, 0
from public.products where slug = 'kurkure-masala-munch-namkeen-166-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/102761_18-kurkure-namkeen-masala-munch.jpg', true, 0
from public.products where slug = 'kurkure-masala-munch-namkeen-3-x-75-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/238380_21-bingo-mad-angles-mmmmm-masala.jpg', true, 0
from public.products where slug = 'bingo-mad-angles-mmmmm-masala-30-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/238380_21-bingo-mad-angles-mmmmm-masala.jpg', true, 0
from public.products where slug = 'bingo-mad-angles-mmmmm-masala-60-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/238380_21-bingo-mad-angles-mmmmm-masala.jpg', true, 0
from public.products where slug = 'bingo-mad-angles-mmmmm-masala-117-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/238380_21-bingo-mad-angles-mmmmm-masala.jpg', true, 0
from public.products where slug = 'bingo-mad-angles-mmmmm-masala-130-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/302110_7-parle-gluco-biscuits-parle-g.jpg', true, 0
from public.products where slug = 'parle-g-original-gluco-biscuits-45-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/302110_7-parle-gluco-biscuits-parle-g.jpg', true, 0
from public.products where slug = 'parle-g-original-gluco-biscuits-90-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/302110_7-parle-gluco-biscuits-parle-g.jpg', true, 0
from public.products where slug = 'parle-g-original-gluco-biscuits-250-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/302110_7-parle-gluco-biscuits-parle-g.jpg', true, 0
from public.products where slug = 'parle-g-original-gluco-biscuits-800-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/270729_23-britannia-good-day-cashew-cookies.jpg', true, 0
from public.products where slug = 'britannia-good-day-rich-cashew-cookies-60-1-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/270729_23-britannia-good-day-cashew-cookies.jpg', true, 0
from public.products where slug = 'britannia-good-day-rich-cashew-cookies-82-7-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/270729_23-britannia-good-day-cashew-cookies.jpg', true, 0
from public.products where slug = 'britannia-good-day-rich-cashew-cookies-250-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/270729_23-britannia-good-day-cashew-cookies.jpg', true, 0
from public.products where slug = 'britannia-good-day-rich-cashew-cookies-526-1-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/277584_55-cadbury-oreo-creme-biscuit-vanilla-original.jpg', true, 0
from public.products where slug = 'cadbury-oreo-vanilla-creme-sandwich-biscuit-41-75-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/277584_55-cadbury-oreo-creme-biscuit-vanilla-original.jpg', true, 0
from public.products where slug = 'cadbury-oreo-vanilla-creme-sandwich-biscuit-125-25-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/277584_55-cadbury-oreo-creme-biscuit-vanilla-original.jpg', true, 0
from public.products where slug = 'cadbury-oreo-vanilla-creme-sandwich-biscuit-275-55-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/277584_55-cadbury-oreo-creme-biscuit-vanilla-original.jpg', true, 0
from public.products where slug = 'cadbury-oreo-vanilla-creme-sandwich-biscuit-459-25-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/100401160_12-coca-cola-soft-drink-original-taste.jpg', true, 0
from public.products where slug = 'coca-cola-original-taste-soft-drink-200-ml-can';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/100401160_12-coca-cola-soft-drink-original-taste.jpg', true, 0
from public.products where slug = 'coca-cola-original-taste-soft-drink-300-ml-can';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/100401160_12-coca-cola-soft-drink-original-taste.jpg', true, 0
from public.products where slug = 'coca-cola-original-taste-soft-drink-740-ml-pet-bottle';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/100401160_12-coca-cola-soft-drink-original-taste.jpg', true, 0
from public.products where slug = 'coca-cola-original-taste-soft-drink-1-75-l-pet-bottle';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/288927_11-thums-up-soft-drink.jpg', true, 0
from public.products where slug = 'thums-up-soft-drink-300-ml-can';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/288927_11-thums-up-soft-drink.jpg', true, 0
from public.products where slug = 'thums-up-soft-drink-750-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/288927_11-thums-up-soft-drink.jpg', true, 0
from public.products where slug = 'thums-up-soft-drink-1-25-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/288927_11-thums-up-soft-drink.jpg', true, 0
from public.products where slug = 'thums-up-soft-drink-2-25-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40032983_8-sprite-soft-drink.jpg', true, 0
from public.products where slug = 'sprite-lemon-lime-soft-drink-250-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40032983_8-sprite-soft-drink.jpg', true, 0
from public.products where slug = 'sprite-lemon-lime-soft-drink-750-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40032983_8-sprite-soft-drink.jpg', true, 0
from public.products where slug = 'sprite-lemon-lime-soft-drink-1-25-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40032983_8-sprite-soft-drink.jpg', true, 0
from public.products where slug = 'sprite-lemon-lime-soft-drink-2-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40001001_23-maaza-juice-mango.jpg', true, 0
from public.products where slug = 'maaza-mango-fruit-drink-125-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40001001_23-maaza-juice-mango.jpg', true, 0
from public.products where slug = 'maaza-mango-fruit-drink-600-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40001001_23-maaza-juice-mango.jpg', true, 0
from public.products where slug = 'maaza-mango-fruit-drink-1-2-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40001001_23-maaza-juice-mango.jpg', true, 0
from public.products where slug = 'maaza-mango-fruit-drink-1-5-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/229922_16-real-fruit-power-juice-mixed.jpg', true, 0
from public.products where slug = 'real-fruit-power-mixed-fruit-juice-180-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/229922_16-real-fruit-power-juice-mixed.jpg', true, 0
from public.products where slug = 'real-fruit-power-mixed-fruit-juice-1-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/229922_16-real-fruit-power-juice-mixed.jpg', true, 0
from public.products where slug = 'real-fruit-power-mixed-fruit-juice-2-x-1-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/229922_16-real-fruit-power-juice-mixed.jpg', true, 0
from public.products where slug = 'real-fruit-power-mixed-fruit-juice-12-x-180-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/240049_8-tata-tea-premium-the-countrys-tea.jpg', true, 0
from public.products where slug = 'tata-tea-premium-desh-ki-chai-100-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/240049_8-tata-tea-premium-the-countrys-tea.jpg', true, 0
from public.products where slug = 'tata-tea-premium-desh-ki-chai-250-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/240049_8-tata-tea-premium-the-countrys-tea.jpg', true, 0
from public.products where slug = 'tata-tea-premium-desh-ki-chai-500-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/240049_8-tata-tea-premium-the-countrys-tea.jpg', true, 0
from public.products where slug = 'tata-tea-premium-desh-ki-chai-1-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/240049_8-tata-tea-premium-the-countrys-tea.jpg', true, 0
from public.products where slug = 'tata-tea-premium-desh-ki-chai-1-5-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/266616_16-red-label-tea.jpg', true, 0
from public.products where slug = 'brooke-bond-red-label-tea-100-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/266616_16-red-label-tea.jpg', true, 0
from public.products where slug = 'brooke-bond-red-label-tea-250-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/266616_16-red-label-tea.jpg', true, 0
from public.products where slug = 'brooke-bond-red-label-tea-500-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/266616_16-red-label-tea.jpg', true, 0
from public.products where slug = 'brooke-bond-red-label-tea-1-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/231187_14-nescafe-classic-100-pure-instant-coffee.jpg', true, 0
from public.products where slug = 'nescafe-classic-instant-coffee-24-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/231187_14-nescafe-classic-100-pure-instant-coffee.jpg', true, 0
from public.products where slug = 'nescafe-classic-instant-coffee-90-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/231187_14-nescafe-classic-100-pure-instant-coffee.jpg', true, 0
from public.products where slug = 'nescafe-classic-instant-coffee-180-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/231187_14-nescafe-classic-100-pure-instant-coffee.jpg', true, 0
from public.products where slug = 'nescafe-classic-instant-coffee-200-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/231187_14-nescafe-classic-100-pure-instant-coffee.jpg', true, 0
from public.products where slug = 'nescafe-classic-instant-coffee-500-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/20005893_3-maggi-noodles-masala.jpg', true, 0
from public.products where slug = 'maggi-2-minute-masala-instant-noodles-32-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/20005893_3-maggi-noodles-masala.jpg', true, 0
from public.products where slug = 'maggi-2-minute-masala-instant-noodles-70-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/20005893_3-maggi-noodles-masala.jpg', true, 0
from public.products where slug = 'maggi-2-minute-masala-instant-noodles-280-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/20005893_3-maggi-noodles-masala.jpg', true, 0
from public.products where slug = 'maggi-2-minute-masala-instant-noodles-840-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/20005893_3-maggi-noodles-masala.jpg', true, 0
from public.products where slug = 'maggi-2-minute-masala-instant-noodles-8-x-70-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/287005_20-sunfeast-yippee-magic-masala-noodles.jpg', true, 0
from public.products where slug = 'sunfeast-yippee-magic-masala-instant-noodles-23-5-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/287005_20-sunfeast-yippee-magic-masala-noodles.jpg', true, 0
from public.products where slug = 'sunfeast-yippee-magic-masala-instant-noodles-51-2-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/287005_20-sunfeast-yippee-magic-masala-noodles.jpg', true, 0
from public.products where slug = 'sunfeast-yippee-magic-masala-instant-noodles-272-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/287005_20-sunfeast-yippee-magic-masala-noodles.jpg', true, 0
from public.products where slug = 'sunfeast-yippee-magic-masala-instant-noodles-544-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/265956_6-mtr-breakfast-mix-upma.jpg', true, 0
from public.products where slug = 'mtr-upma-mix-160-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/265956_6-mtr-breakfast-mix-upma.jpg', true, 0
from public.products where slug = 'mtr-upma-mix-500-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/265956_6-mtr-breakfast-mix-upma.jpg', true, 0
from public.products where slug = 'mtr-upma-mix-2-x-160-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/265956_6-mtr-breakfast-mix-upma.jpg', true, 0
from public.products where slug = 'mtr-upma-mix-1-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40016985_10-mccain-french-fries.jpg', true, 0
from public.products where slug = 'mccain-french-fries-200-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40016985_10-mccain-french-fries.jpg', true, 0
from public.products where slug = 'mccain-french-fries-420-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40016985_10-mccain-french-fries.jpg', true, 0
from public.products where slug = 'mccain-french-fries-1-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40016985_10-mccain-french-fries.jpg', true, 0
from public.products where slug = 'mccain-french-fries-1-25-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/293385_25-kissan-fresh-tomato-ketchup.jpg', true, 0
from public.products where slug = 'kissan-fresh-tomato-ketchup-90-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/293385_25-kissan-fresh-tomato-ketchup.jpg', true, 0
from public.products where slug = 'kissan-fresh-tomato-ketchup-415-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/293385_25-kissan-fresh-tomato-ketchup.jpg', true, 0
from public.products where slug = 'kissan-fresh-tomato-ketchup-825-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/293385_25-kissan-fresh-tomato-ketchup.jpg', true, 0
from public.products where slug = 'kissan-fresh-tomato-ketchup-1-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40109852_14-veeba-mayonnaise-eggless.jpg', true, 0
from public.products where slug = 'veeba-eggless-veg-mayonnaise-100-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40109852_14-veeba-mayonnaise-eggless.jpg', true, 0
from public.products where slug = 'veeba-eggless-veg-mayonnaise-250-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40109852_14-veeba-mayonnaise-eggless.jpg', true, 0
from public.products where slug = 'veeba-eggless-veg-mayonnaise-500-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40109852_14-veeba-mayonnaise-eggless.jpg', true, 0
from public.products where slug = 'veeba-eggless-veg-mayonnaise-875-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40094923_16-nutella-hazelnut-spread-with-cocoa.jpg', true, 0
from public.products where slug = 'nutella-hazelnut-and-cocoa-spread-180-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40094923_16-nutella-hazelnut-spread-with-cocoa.jpg', true, 0
from public.products where slug = 'nutella-hazelnut-and-cocoa-spread-290-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40094923_16-nutella-hazelnut-spread-with-cocoa.jpg', true, 0
from public.products where slug = 'nutella-hazelnut-and-cocoa-spread-350-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40094923_16-nutella-hazelnut-spread-with-cocoa.jpg', true, 0
from public.products where slug = 'nutella-hazelnut-and-cocoa-spread-750-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/20005547_24-colgate-strong-teeth-anticavity-toothpaste-with-amino-shakti-formula-provides-fresher-breath.jpg', true, 0
from public.products where slug = 'colgate-strong-teeth-anticavity-toothpaste-40-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/20005547_24-colgate-strong-teeth-anticavity-toothpaste-with-amino-shakti-formula-provides-fresher-breath.jpg', true, 0
from public.products where slug = 'colgate-strong-teeth-anticavity-toothpaste-100-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/20005547_24-colgate-strong-teeth-anticavity-toothpaste-with-amino-shakti-formula-provides-fresher-breath.jpg', true, 0
from public.products where slug = 'colgate-strong-teeth-anticavity-toothpaste-150-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/20005547_24-colgate-strong-teeth-anticavity-toothpaste-with-amino-shakti-formula-provides-fresher-breath.jpg', true, 0
from public.products where slug = 'colgate-strong-teeth-anticavity-toothpaste-200-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/20005547_24-colgate-strong-teeth-anticavity-toothpaste-with-amino-shakti-formula-provides-fresher-breath.jpg', true, 0
from public.products where slug = 'colgate-strong-teeth-anticavity-toothpaste-300-g-toothbrush';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40019050_13-pepsodent-germicheck-12h-germ-protection-toothpaste.jpg', true, 0
from public.products where slug = 'pepsodent-12hr-germicheck-toothpaste-25-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40019050_13-pepsodent-germicheck-12h-germ-protection-toothpaste.jpg', true, 0
from public.products where slug = 'pepsodent-12hr-germicheck-toothpaste-100-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40019050_13-pepsodent-germicheck-12h-germ-protection-toothpaste.jpg', true, 0
from public.products where slug = 'pepsodent-12hr-germicheck-toothpaste-150-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40019050_13-pepsodent-germicheck-12h-germ-protection-toothpaste.jpg', true, 0
from public.products where slug = 'pepsodent-12hr-germicheck-toothpaste-200-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/306161_12-dove-cream-beauty-bathing-bar.jpg', true, 0
from public.products where slug = 'dove-nutrient-serum-soap-bar-50-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/306161_12-dove-cream-beauty-bathing-bar.jpg', true, 0
from public.products where slug = 'dove-nutrient-serum-soap-bar-100-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/306161_12-dove-cream-beauty-bathing-bar.jpg', true, 0
from public.products where slug = 'dove-nutrient-serum-soap-bar-3-x-75-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/306161_12-dove-cream-beauty-bathing-bar.jpg', true, 0
from public.products where slug = 'dove-nutrient-serum-soap-bar-3-x-125-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/274795_7-lux-beauty-soap-for-glowing-skin-rose-vitamin-e-mega.jpg', true, 0
from public.products where slug = 'lux-glow-lush-rose-bathing-soap-43-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/274795_7-lux-beauty-soap-for-glowing-skin-rose-vitamin-e-mega.jpg', true, 0
from public.products where slug = 'lux-glow-lush-rose-bathing-soap-100-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/274795_7-lux-beauty-soap-for-glowing-skin-rose-vitamin-e-mega.jpg', true, 0
from public.products where slug = 'lux-glow-lush-rose-bathing-soap-150-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/274795_7-lux-beauty-soap-for-glowing-skin-rose-vitamin-e-mega.jpg', true, 0
from public.products where slug = 'lux-glow-lush-rose-bathing-soap-3-x-150-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/267963_10-head-shoulders-anti-dandruff-shampoo-smooth-silky.jpg', true, 0
from public.products where slug = 'head-and-shoulders-smooth-and-silky-anti-dandruff-shampoo-72-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/267963_10-head-shoulders-anti-dandruff-shampoo-smooth-silky.jpg', true, 0
from public.products where slug = 'head-and-shoulders-smooth-and-silky-anti-dandruff-shampoo-180-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/267963_10-head-shoulders-anti-dandruff-shampoo-smooth-silky.jpg', true, 0
from public.products where slug = 'head-and-shoulders-smooth-and-silky-anti-dandruff-shampoo-340-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/267963_10-head-shoulders-anti-dandruff-shampoo-smooth-silky.jpg', true, 0
from public.products where slug = 'head-and-shoulders-smooth-and-silky-anti-dandruff-shampoo-650-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/267963_10-head-shoulders-anti-dandruff-shampoo-smooth-silky.jpg', true, 0
from public.products where slug = 'head-and-shoulders-smooth-and-silky-anti-dandruff-shampoo-1-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/266949_15-surf-excel-matic-front-load-detergent-powder.jpg', true, 0
from public.products where slug = 'surf-excel-matic-front-load-detergent-powder-1-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/266949_15-surf-excel-matic-front-load-detergent-powder.jpg', true, 0
from public.products where slug = 'surf-excel-matic-front-load-detergent-powder-2-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/266949_15-surf-excel-matic-front-load-detergent-powder.jpg', true, 0
from public.products where slug = 'surf-excel-matic-front-load-detergent-powder-4-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/266949_15-surf-excel-matic-front-load-detergent-powder.jpg', true, 0
from public.products where slug = 'surf-excel-matic-front-load-detergent-powder-6-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/266949_15-surf-excel-matic-front-load-detergent-powder.jpg', true, 0
from public.products where slug = 'surf-excel-matic-front-load-detergent-powder-500-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40097083_14-ariel-detergent-washing-powder-matic-front-load.jpg', true, 0
from public.products where slug = 'ariel-matic-front-load-detergent-powder-500-g';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40097083_14-ariel-detergent-washing-powder-matic-front-load.jpg', true, 0
from public.products where slug = 'ariel-matic-front-load-detergent-powder-1-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40097083_14-ariel-detergent-washing-powder-matic-front-load.jpg', true, 0
from public.products where slug = 'ariel-matic-front-load-detergent-powder-2-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40097083_14-ariel-detergent-washing-powder-matic-front-load.jpg', true, 0
from public.products where slug = 'ariel-matic-front-load-detergent-powder-4-kg';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/266959_8-vim-dishwash-liquid-gel-green-lemon.jpg', true, 0
from public.products where slug = 'vim-concentrated-dishwash-gel-130-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/266959_8-vim-dishwash-liquid-gel-green-lemon.jpg', true, 0
from public.products where slug = 'vim-concentrated-dishwash-gel-250-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/266959_8-vim-dishwash-liquid-gel-green-lemon.jpg', true, 0
from public.products where slug = 'vim-concentrated-dishwash-gel-500-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/266959_8-vim-dishwash-liquid-gel-green-lemon.jpg', true, 0
from public.products where slug = 'vim-concentrated-dishwash-gel-900-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/298290_22-harpic-power-plus-disinfectant-toilet-cleaner-original.jpg', true, 0
from public.products where slug = 'harpic-power-plus-original-toilet-cleaner-200-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/298290_22-harpic-power-plus-disinfectant-toilet-cleaner-original.jpg', true, 0
from public.products where slug = 'harpic-power-plus-original-toilet-cleaner-500-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/298290_22-harpic-power-plus-disinfectant-toilet-cleaner-original.jpg', true, 0
from public.products where slug = 'harpic-power-plus-original-toilet-cleaner-1-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/298290_22-harpic-power-plus-disinfectant-toilet-cleaner-original.jpg', true, 0
from public.products where slug = 'harpic-power-plus-original-toilet-cleaner-2-x-1-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40034580_28-dettol-liquid-handwash-original-everyday-protection-fights-germs.jpg', true, 0
from public.products where slug = 'dettol-original-liquid-handwash-175-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40034580_28-dettol-liquid-handwash-original-everyday-protection-fights-germs.jpg', true, 0
from public.products where slug = 'dettol-original-liquid-handwash-675-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40034580_28-dettol-liquid-handwash-original-everyday-protection-fights-germs.jpg', true, 0
from public.products where slug = 'dettol-original-liquid-handwash-875-ml';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40034580_28-dettol-liquid-handwash-original-everyday-protection-fights-germs.jpg', true, 0
from public.products where slug = 'dettol-original-liquid-handwash-1-35-l';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40136606_5-pampers-diaper-pants-new-born.jpg', true, 0
from public.products where slug = 'pampers-baby-dry-diaper-pants-new-baby-8-pcs';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40136606_5-pampers-diaper-pants-new-born.jpg', true, 0
from public.products where slug = 'pampers-baby-dry-diaper-pants-new-baby-17-pcs';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40136606_5-pampers-diaper-pants-new-born.jpg', true, 0
from public.products where slug = 'pampers-baby-dry-diaper-pants-new-baby-34-pcs';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40136606_5-pampers-diaper-pants-new-born.jpg', true, 0
from public.products where slug = 'pampers-baby-dry-diaper-pants-new-baby-56-pcs';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40142549_2-huggies-baby-wipes-cucumber-aloe.jpg', true, 0
from public.products where slug = 'huggies-baby-wipes-cucumber-and-aloe-20-wipes';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40142549_2-huggies-baby-wipes-cucumber-aloe.jpg', true, 0
from public.products where slug = 'huggies-baby-wipes-cucumber-and-aloe-72-wipes';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40142549_2-huggies-baby-wipes-cucumber-aloe.jpg', true, 0
from public.products where slug = 'huggies-baby-wipes-cucumber-and-aloe-3-x-72-wipes';

insert into public.product_images (product_id, image_url, is_primary, sort_order)
select id, 'https://www.bbassets.com/media/uploads/p/s/40142549_2-huggies-baby-wipes-cucumber-aloe.jpg', true, 0
from public.products where slug = 'huggies-baby-wipes-cucumber-and-aloe-5-x-72-wipes';

commit;

-- =========================================================
-- QUICK CHECKS
-- =========================================================
-- select count(*) from public.products;        -- should return 200
-- select count(*) from public.product_images;  -- should return 200
-- =========================================================
