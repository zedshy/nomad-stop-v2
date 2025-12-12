# Feature Implementation Plan

## Database Schema Changes ✅

All schema changes have been made:
- ✅ `OrderItem.notes` - Customer notes per item
- ✅ `Addon.isRequired` - Mark addons as required or optional
- ✅ `Product.isMeal` - Mark products as combo meals
- ✅ `Product.mealDrinks` - Available drinks for meal combos
- ✅ `ProductVariant.bases` - Pizza base options
- ✅ `ProductVariant.toppings` - Pizza topping options

## Implementation Checklist

### 1. Customer Notes Per Item ✅ (Schema Done)
- [ ] Add notes input field in cart/checkout
- [ ] Update cart store to handle notes
- [ ] Update order creation API to save notes
- [ ] Display notes in admin order view

### 2. Multiple Add-ons with Required/Optional ✅ (Schema Done)
- [ ] Update admin panel to show required/optional checkbox for addons
- [ ] Update product card to show required addons
- [ ] Update cart to enforce required addons
- [ ] Update checkout to show addon selection

### 3. Meal/Combo Option ✅ (Schema Done)
- [ ] Add "Is Meal" checkbox in admin
- [ ] Add drink selection UI in admin
- [ ] Update product card to show meal option
- [ ] Add drink selection in cart/checkout

### 4. Print Order
- [ ] Add print button in admin order view
- [ ] Create print-friendly order template
- [ ] Add print CSS styles

### 5. Email Notifications ✅ (Partially Done)
- [x] Accept email - Already implemented
- [ ] Reject email - Need to add
- [ ] Update reject route to send email

### 6. Pizza Base & Toppings ✅ (Schema Done)
- [ ] Add base/topping configuration in admin
- [ ] Update pizza selection flow in cart
- [ ] Show base/topping selection after size
- [ ] Update order to store base/topping choices

### 7. Category Reordering
- [ ] Add category sort order field
- [ ] Add drag-and-drop or up/down buttons in admin
- [ ] Update menu display to respect category order

## Next Steps

1. Run database migration
2. Update admin panel UI
3. Update cart/checkout flow
4. Test each feature

