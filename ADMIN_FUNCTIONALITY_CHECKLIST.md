# Admin Panel Functionality Checklist

## ✅ Admin Panel Features

### 1. Login System
- [x] Login with password (works with database or ADMIN_PASSWORD env var)
- [x] "Remember me" functionality (7 days persistence)
- [x] Password visibility toggle
- [x] Login persistence across page refreshes
- [ ] **Verify on VPS:** Test login works

### 2. Orders Management
- [x] View all orders (auto-refresh every 10 seconds)
- [x] View order details
- [x] Accept order (updates status to 'captured' and sends email)
- [x] Reject order (button exists, needs implementation)
- [x] Order statistics (pending, completed, revenue)
- [x] Filter by status
- [ ] **Verify on VPS:** Test accepting an order and receiving confirmation email

### 3. Products Management
- [x] View all products
- [x] Add new product
- [x] Edit existing product
- [x] Delete product
- [x] Add variants (sizes/prices)
- [x] Add addons/extras
- [x] Set as popular
- [x] Add allergens info
- [ ] **Verify on VPS:** Test adding/editing a product appears on main website

### 4. Promo Codes Management
- [x] View all promo codes
- [x] Create new promo code (percentage or fixed discount)
- [x] Edit promo code
- [x] Delete promo code
- [x] Set usage limits
- [x] Set expiration dates
- [x] Activate/deactivate
- [ ] **Verify on VPS:** Test creating a promo code and using it in checkout

### 5. Admin Users Management
- [x] View all admin users
- [x] Add new admin user (super_admin, admin, staff roles)
- [x] Edit admin user (email, username, name, role, active status)
- [x] Delete admin user
- [x] View last login times
- [ ] **Verify on VPS:** Test adding a new admin user

### 6. Settings
- [x] Change password
- [x] View current admin info
- [ ] **Verify on VPS:** Test changing password works

### 7. Order Statistics
- [x] Total revenue calculation
- [x] Pending orders count
- [x] Completed orders count
- [x] Currency display (GBP £)
- [ ] **Verify on VPS:** Test statistics are accurate

---

## 🔧 What Needs to be Fixed/Verified on VPS

### Database Connection
- [ ] Ensure `.env` has `DISABLE_DB="false"` on VPS
- [ ] Verify `DATABASE_URL` is correct in `.env`
- [ ] Run `npx prisma migrate deploy` to ensure all tables exist
- [ ] Verify database connection works: Test a simple API call

### Email Configuration
- [ ] Verify email credentials in `.env` (EMAIL_USER, EMAIL_PASS)
- [ ] Test order confirmation email sending
- [ ] Test email works with SMTP settings

### Worldpay Integration
- [ ] Verify Worldpay credentials in `.env`
- [ ] Test payment processing
- [ ] Verify webhook endpoint is accessible

### Admin Access
- [ ] Test admin login works
- [ ] Verify admin password is set in `.env` (ADMIN_PASSWORD)
- [ ] Test creating admin users works

---

## 🚀 Quick VPS Verification Commands

On your VPS, run these to verify everything:

```bash
cd /var/www/nomad-stop

# 1. Check .env has correct settings
cat .env | grep DISABLE_DB
cat .env | grep DATABASE_URL | head -1

# 2. Test database connection
npx prisma migrate deploy

# 3. Test admin login works (visit http://92.205.231.55/admin)
# Use the password from ADMIN_PASSWORD in .env

# 4. Check if API routes work
curl http://localhost:3000/api/admin/products
curl http://localhost:3000/api/admin/orders
```

---

## 📝 Next Steps

1. **Fix VPS 502 error first** - Make sure the app is running
2. **Verify database connection** - Ensure DISABLE_DB=false
3. **Test admin login** - Verify login works
4. **Test features one by one** - Go through the checklist above

