# Production Testing Checklist

Complete checklist before going live with production Worldpay transactions.

## Pre-Production Setup

### 1. Environment Variables

- [ ] **Worldpay Production Credentials**
  - [ ] `WORLDPAY_USERNAME` - Production username
  - [ ] `WORLDPAY_PASSWORD` - Production password
  - [ ] `WORLDPAY_CHECKOUT_ID` - Production checkout ID
  - [ ] `WORLDPAY_ENTITY_ID` - Production entity ID
  - [ ] `WORLDPAY_ENVIRONMENT="production"` - Set to production
  - [ ] `WORLDPAY_WEBHOOK_SECRET` - Production webhook secret

- [ ] **Database**
  - [ ] `DATABASE_URL` - Neon connection string (already set)
  - [ ] `DISABLE_DB="false"` - Database enabled

- [ ] **Email**
  - [ ] `RESEND_API_KEY` - Production Resend API key
  - [ ] `NEXT_PUBLIC_SITE_URL` - Production domain URL

- [ ] **Admin**
  - [ ] `ADMIN_PASSWORD` - Strong production password

### 2. Admin Panel Testing

#### Login & Authentication
- [ ] Admin login works
- [ ] Password change functionality works
- [ ] Multiple admin users can be created
- [ ] Role-based access works (if implemented)
- [ ] Session management works correctly

#### Order Management
- [ ] View all orders
- [ ] Filter orders by status (pending, completed, etc.)
- [ ] Accept orders (changes status)
- [ ] View order details
- [ ] Order statistics calculate correctly
  - [ ] Total orders count
  - [ ] Pending orders count
  - [ ] Completed orders count
  - [ ] Revenue calculation

#### Product Management
- [ ] View all products
- [ ] Create new products
- [ ] Edit existing products
- [ ] Delete products
- [ ] Add variants (sizes/prices)
- [ ] Add extras/addons
- [ ] Changes reflect on main website immediately
- [ ] Product images work correctly

#### Promo Code Management
- [ ] View all promo codes
- [ ] Create new promo codes
- [ ] Edit promo codes
- [ ] Delete promo codes
- [ ] Promo codes save to database
- [ ] Promo codes work on checkout page
- [ ] Discount calculations are correct

#### Settings
- [ ] Change password works
- [ ] Admin user management works
- [ ] Database status indicator shows correctly

### 3. Customer-Facing Features

#### Homepage
- [ ] Page loads correctly
- [ ] Popular products display
- [ ] Navigation works
- [ ] All links work

#### Menu Page
- [ ] All products display
- [ ] Categories work
- [ ] Product details show correctly
- [ ] Add to cart works
- [ ] Variants and addons work

#### Cart
- [ ] Items display correctly
- [ ] Quantity updates work
- [ ] Remove items works
- [ ] Total calculations correct
- [ ] Proceed to checkout works

#### Checkout Flow
- [ ] Step 1: Customer details form works
- [ ] Step 2: Delivery/pickup selection works
- [ ] Step 3: Time slot selection works
- [ ] Step 4: Promo code entry works
  - [ ] Valid codes apply discount
  - [ ] Invalid codes show error
  - [ ] Discount calculations correct
- [ ] Step 5: Payment form works
  - [ ] Card number input
  - [ ] Expiry date input
  - [ ] CVC input
  - [ ] Cardholder name input

### 4. Payment Testing (Production)

#### Test Cards (Worldpay Production)
- [ ] Use Worldpay's production test cards
- [ ] Test successful payment
- [ ] Test declined payment
- [ ] Test 3D Secure (if applicable)

#### Payment Flow
- [ ] Payment authorization works
- [ ] Order created in database
- [ ] Payment record created
- [ ] Order confirmation email sent
- [ ] Admin notification email sent
- [ ] Kitchen ticket email sent (if applicable)
- [ ] Redirect to success page works
- [ ] Error handling works correctly

#### Webhooks
- [ ] Webhook endpoint accessible
- [ ] Webhook signature verification works
- [ ] Payment status updates correctly
- [ ] Order status updates correctly

### 5. Email Notifications

- [ ] **Order Confirmation** (Customer)
  - [ ] Email sent on successful payment
  - [ ] Contains order details
  - [ ] Contains delivery/pickup info
  - [ ] Contains time slot
  - [ ] Professional formatting

- [ ] **Admin Notification** (Restaurant)
  - [ ] Email sent on new order
  - [ ] Contains all order details
  - [ ] Contains customer contact info
  - [ ] Contains payment reference

- [ ] **Kitchen Ticket** (Optional)
  - [ ] Email sent to kitchen
  - [ ] Contains order items
  - [ ] Contains special instructions

### 6. Database Operations

- [ ] Orders save correctly
- [ ] Order items save correctly
- [ ] Payment records save correctly
- [ ] Products save correctly
- [ ] Promo codes save correctly
- [ ] Admin users save correctly
- [ ] All relationships work (order → items, order → payment)

### 7. Error Handling

- [ ] Payment failures handled gracefully
- [ ] Database errors don't crash site
- [ ] Network errors handled
- [ ] Invalid input validation works
- [ ] Error messages are user-friendly

### 8. Performance

- [ ] Page load times acceptable
- [ ] Database queries optimized
- [ ] Images load quickly
- [ ] No memory leaks
- [ ] PM2 process stable

### 9. Security

- [ ] Admin routes protected
- [ ] Passwords hashed correctly
- [ ] Environment variables not exposed
- [ ] SQL injection protected (Prisma handles this)
- [ ] XSS protection
- [ ] HTTPS ready (for production)

### 10. Production Worldpay Setup

#### API Endpoints
- [ ] Production API URL configured
- [ ] Authorization endpoint works
- [ ] Capture endpoint works (if needed)
- [ ] Void endpoint works (if needed)

#### Webhook Configuration
- [ ] Webhook URL set in Worldpay dashboard
- [ ] Webhook secret matches
- [ ] Webhook endpoint accessible from internet
- [ ] Webhook signature verification works

#### Test Transactions
- [ ] Small test transaction (£1.00)
- [ ] Normal transaction (£20-30)
- [ ] Large transaction (£100+)
- [ ] Transaction with promo code
- [ ] Transaction with delivery
- [ ] Transaction with pickup
- [ ] Declined card test
- [ ] 3D Secure test (if applicable)

## Testing Procedure

### Phase 1: Admin Panel
1. Test all admin features
2. Create test products
3. Create test promo codes
4. Verify changes appear on site

### Phase 2: Customer Flow
1. Browse menu
2. Add items to cart
3. Complete checkout
4. Use promo code
5. Complete payment

### Phase 3: Production Payment
1. Switch to production Worldpay credentials
2. Use production test cards
3. Complete test transactions
4. Verify orders in admin
5. Verify emails sent
6. Verify database records

### Phase 4: End-to-End
1. Full order flow from customer to admin
2. Admin accepts order
3. Order status updates
4. Customer receives updates

## Rollback Plan

If issues found:
- [ ] Switch back to sandbox/test mode
- [ ] Fix issues
- [ ] Test again
- [ ] Re-attempt production testing

## Post-Testing

After successful testing:
- [ ] Document any issues found
- [ ] Fix any bugs
- [ ] Update documentation
- [ ] Prepare for VPS deployment
- [ ] Create backup of working state

## Notes

- Keep test transactions small initially
- Monitor Worldpay dashboard for transactions
- Check database after each test
- Verify emails are received
- Test on different devices/browsers
- Test with different payment scenarios

