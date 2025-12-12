-- Get variant IDs for direct updates
-- Run this to get IDs, then update by ID (simpler queries)

-- Get IDs for products we need to update
SELECT 
    p.name as product_name,
    pv.name as variant_name,
    pv.id as variant_id,
    pv.price as current_price
FROM products p
JOIN product_variants pv ON pv."productId" = p.id
WHERE p.name IN (
    'Kabuli Pilau (Lamb Shank)',
    'Mantu',
    'Lamb Karahi',
    'Chicken Karahi',
    'Lamb Biryani',
    'Chicken Biryani',
    'Margherita',
    'Pepperoni Pizza',
    'Chicken Tikka Pizza',
    'Vegetarian Supreme',
    'Afghan Special Pizza (Lamb & Chilli)',
    'Chips',
    'Garlic Bread',
    'Spicy Wings (6pcs)'
)
ORDER BY p.name, pv.name;


