-- Simple, direct price updates - no complex subqueries
-- Run these one at a time on the VPS

-- Step 1: Update Kabuli Pilau
UPDATE product_variants 
SET price = 1495 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Kabuli Pilau (Lamb Shank)' 
  AND product_variants.name = 'Standard';

-- Step 2: Update Mantu
UPDATE product_variants 
SET price = 1195 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Mantu' 
  AND product_variants.name = 'Standard';

-- Step 3: Update Lamb Karahi
UPDATE product_variants 
SET price = 1095 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Lamb Karahi' 
  AND product_variants.name = 'Standard';

-- Step 4: Update Chicken Karahi (Mild)
UPDATE product_variants 
SET price = 995 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Chicken Karahi' 
  AND product_variants.name = 'Mild';

-- Step 5: Update Chicken Karahi (Spicy)
UPDATE product_variants 
SET price = 995 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Chicken Karahi' 
  AND product_variants.name = 'Spicy';

-- Step 6: Update Lamb Biryani
UPDATE product_variants 
SET price = 1195 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Lamb Biryani' 
  AND product_variants.name = 'Standard';

-- Step 7: Update Chicken Biryani
UPDATE product_variants 
SET price = 1095 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Chicken Biryani' 
  AND product_variants.name = 'Standard';

-- Step 8: Update Pizza 10" - Margherita
UPDATE product_variants 
SET price = 1299 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Margherita' 
  AND product_variants.name = '10"';

-- Step 9: Update Pizza 12" - Margherita
UPDATE product_variants 
SET price = 1499 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Margherita' 
  AND product_variants.name = '12"';

-- Step 10: Update Pizza 10" - Pepperoni
UPDATE product_variants 
SET price = 1299 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Pepperoni Pizza' 
  AND product_variants.name = '10"';

-- Step 11: Update Pizza 12" - Pepperoni
UPDATE product_variants 
SET price = 1499 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Pepperoni Pizza' 
  AND product_variants.name = '12"';

-- Step 12: Update Pizza 10" - Chicken Tikka
UPDATE product_variants 
SET price = 1299 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Chicken Tikka Pizza' 
  AND product_variants.name = '10"';

-- Step 13: Update Pizza 12" - Chicken Tikka
UPDATE product_variants 
SET price = 1499 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Chicken Tikka Pizza' 
  AND product_variants.name = '12"';

-- Step 14: Update Pizza 10" - Vegetarian Supreme
UPDATE product_variants 
SET price = 1299 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Vegetarian Supreme' 
  AND product_variants.name = '10"';

-- Step 15: Update Pizza 12" - Vegetarian Supreme
UPDATE product_variants 
SET price = 1499 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Vegetarian Supreme' 
  AND product_variants.name = '12"';

-- Step 16: Update Pizza 10" - Afghan Special
UPDATE product_variants 
SET price = 1299 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Afghan Special Pizza (Lamb & Chilli)' 
  AND product_variants.name = '10"';

-- Step 17: Update Pizza 12" - Afghan Special
UPDATE product_variants 
SET price = 1499 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Afghan Special Pizza (Lamb & Chilli)' 
  AND product_variants.name = '12"';

-- Step 18: Update Chips
UPDATE product_variants 
SET price = 199 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Chips' 
  AND product_variants.name = 'Standard';

-- Step 19: Update Garlic Bread
UPDATE product_variants 
SET price = 299 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Garlic Bread' 
  AND product_variants.name = 'Standard';

-- Step 20: Update Spicy Wings
UPDATE product_variants 
SET price = 499 
FROM products 
WHERE product_variants."productId" = products.id 
  AND products.name = 'Spicy Wings (6pcs)' 
  AND product_variants.name = 'Standard';

