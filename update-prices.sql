-- Quick price updates for critical items
-- Run this with: psql $DATABASE_URL -f update-prices.sql

-- Update Afghan items
UPDATE product_variants 
SET price = 1495 
WHERE id IN (
  SELECT pv.id FROM product_variants pv
  JOIN products p ON pv."productId" = p.id
  WHERE p.name = 'Kabuli Pilau (Lamb Shank)' AND pv.name = 'Standard'
);

UPDATE product_variants 
SET price = 1195 
WHERE id IN (
  SELECT pv.id FROM product_variants pv
  JOIN products p ON pv."productId" = p.id
  WHERE p.name = 'Mantu' AND pv.name = 'Standard'
);

UPDATE product_variants 
SET price = 1095 
WHERE id IN (
  SELECT pv.id FROM product_variants pv
  JOIN products p ON pv."productId" = p.id
  WHERE p.name = 'Lamb Karahi' AND pv.name = 'Standard'
);

UPDATE product_variants 
SET price = 995 
WHERE id IN (
  SELECT pv.id FROM product_variants pv
  JOIN products p ON pv."productId" = p.id
  WHERE p.name = 'Chicken Karahi' AND pv.name IN ('Mild', 'Spicy')
);

UPDATE product_variants 
SET price = 1195 
WHERE id IN (
  SELECT pv.id FROM product_variants pv
  JOIN products p ON pv."productId" = p.id
  WHERE p.name = 'Lamb Biryani' AND pv.name = 'Standard'
);

UPDATE product_variants 
SET price = 1095 
WHERE id IN (
  SELECT pv.id FROM product_variants pv
  JOIN products p ON pv."productId" = p.id
  WHERE p.name = 'Chicken Biryani' AND pv.name = 'Standard'
);

-- Update Pizza prices
UPDATE product_variants 
SET price = 1299 
WHERE id IN (
  SELECT pv.id FROM product_variants pv
  JOIN products p ON pv."productId" = p.id
  WHERE p.name IN ('Margherita', 'Pepperoni Pizza', 'Chicken Tikka Pizza', 'Vegetarian Supreme', 'Afghan Special Pizza (Lamb & Chilli)')
  AND pv.name = '10"'
);

UPDATE product_variants 
SET price = 1499 
WHERE id IN (
  SELECT pv.id FROM product_variants pv
  JOIN products p ON pv."productId" = p.id
  WHERE p.name IN ('Margherita', 'Pepperoni Pizza', 'Chicken Tikka Pizza', 'Vegetarian Supreme', 'Afghan Special Pizza (Lamb & Chilli)')
  AND pv.name = '12"'
);

-- Update Sides
UPDATE product_variants 
SET price = 199 
WHERE id IN (
  SELECT pv.id FROM product_variants pv
  JOIN products p ON pv."productId" = p.id
  WHERE p.name = 'Chips' AND pv.name = 'Standard'
);

UPDATE product_variants 
SET price = 299 
WHERE id IN (
  SELECT pv.id FROM product_variants pv
  JOIN products p ON pv."productId" = p.id
  WHERE p.name = 'Garlic Bread' AND pv.name = 'Standard'
);

UPDATE product_variants 
SET price = 499 
WHERE id IN (
  SELECT pv.id FROM product_variants pv
  JOIN products p ON pv."productId" = p.id
  WHERE p.name = 'Spicy Wings (6pcs)' AND pv.name = 'Standard'
);

-- Update Lamb Chops
UPDATE product_variants 
SET price = 1495 
WHERE id IN (
  SELECT pv.id FROM product_variants pv
  JOIN products p ON pv."productId" = p.id
  WHERE p.name = 'Lamb Chops (4pcs)' AND pv.name = 'Standard'
);

SELECT 'Price updates complete!' as status;


