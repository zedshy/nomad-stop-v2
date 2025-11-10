# Deploying Nomad Stop Next.js Website to GoDaddy cPanel

## Prerequisites

1. **GoDaddy Shared Hosting with cPanel** (Minimum Deluxe Plan recommended)
2. **Node.js Support** - cPanel should have Node.js selector
3. **Database** - cPanel MySQL for Prisma
4. **FTP/SFTP Access** or cPanel File Manager

## Deployment Steps

### 1. Build the Application Locally

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build the production version
npm run build
```

### 2. Upload Files to cPanel

**Important Files to Upload:**
- `.env` (your production environment variables)
- `prisma/` (database schema and migrations)
- `.next/` (production build)
- `public/` (static assets)
- `src/` (source code)
- `node_modules/` (dependencies - optional if you install on server)
- `package.json` and `package-lock.json`
- `.htaccess` (Apache configuration)

**Directory Structure on Server:**
```
/home/username/nomadstop/
├── .env
├── .htaccess
├── .next/
├── node_modules/ (optional)
├── public/
├── prisma/
├── src/
├── package.json
└── package-lock.json
```

### 3. Configure Environment Variables

In cPanel, navigate to **Environment Variables** or edit `.env` file directly:

```env
# Admin Configuration
ADMIN_PASSWORD=your-secure-password

# Worldpay Payment Configuration
WORLDPAY_CLIENT_KEY=88a4ae8f-977d-4fb4-80c1-c54f496582b9
WORLDPAY_USERNAME=tY5vFOEBm0Y4rGRV
WORLDPAY_PASSWORD=HlOqIseYf16eP8xH1UnoDXnoQx9kOVOkRSGXgmvgnkUkCWhHC2B65IAjnMuC7MrE
WORLDPAY_API_KEY=PO4085650052
WORLDPAY_CHECKOUT_ID=88a4ae8f-977d-4fb4-80c1-c54f496582b9

# Email Configuration
EMAIL_HOST=smtp.secureserver.net
EMAIL_USER=your-email@nomadstop.com
EMAIL_PASS=your-password
ADMIN_EMAIL=admin@nomadstop.com

# Database Configuration (cPanel MySQL)
DATABASE_URL="mysql://username:password@localhost:3306/nomadstop"
```

### 4. Set Up Database

**Option A: Using cPanel MySQL Database Wizard**

1. Go to **MySQL Databases** in cPanel
2. Create a new database: `nomadstop`
3. Create a new user and grant privileges
4. Update `DATABASE_URL` in `.env`

**Option B: Migrate Existing SQLite Database**

```bash
# Export from SQLite
npx prisma db pull --schema=./prisma/schema.prisma
npx prisma migrate deploy

# Import to MySQL
# Use cPanel phpMyAdmin or MySQL command line
```

### 5. Configure Node.js in cPanel

1. Navigate to **Node.js** in cPanel
2. **Create Application:**
   - **Node.js version:** 20.x
   - **Application root:** `nomadstop`
   - **Application URL:** `nomadstop.com` (or subdomain)
   - **Application startup file:** `server.js`
3. Click **Create**

### 6. Create Server Entry Point

Create a `server.js` file in your root directory:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Prepare Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

### 7. Install Dependencies and Run Migrations

In **Terminal** or via **cPanel Terminal:**

```bash
cd ~/nomadstop
npm install
npx prisma generate
npx prisma migrate deploy
npm run start
```

### 8. Seed the Database (Optional)

```bash
npm run seed
```

### 9. Configure Domain/Subdomain

1. Go to **Subdomains** in cPanel
2. Create subdomain: `nomadstop.com` or `www.nomadstop.com`
3. Point to `nomadstop` directory

### 10. SSL Certificate

1. Go to **SSL/TLS** in cPanel
2. Request **Let's Encrypt** free SSL certificate
3. Force HTTPS redirect in `.htaccess`

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{SERVER_PORT} 80
  RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R,L]
</IfModule>
```

## Troubleshooting

### Problem: Node.js not starting

**Solution:**
- Check Node.js version (use Node.js 20)
- Ensure all dependencies are installed
- Check `.env` file exists and is configured

### Problem: Database connection error

**Solution:**
- Verify `DATABASE_URL` in `.env`
- Check MySQL credentials in cPanel
- Ensure database and user have proper permissions

### Problem: 502 Bad Gateway

**Solution:**
- Restart Node.js application in cPanel
- Check application logs in cPanel
- Verify port configuration

### Problem: Static files not loading

**Solution:**
- Ensure `public/` folder is uploaded
- Check `.htaccess` rewrite rules
- Verify file permissions (755 for directories, 644 for files)

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrated and seeded
- [ ] SSL certificate installed
- [ ] Worldpay credentials configured
- [ ] Email SMTP configured
- [ ] Admin password changed from default
- [ ] Domain/subdomain configured
- [ ] Node.js application started
- [ ] Website tested on production URL
- [ ] Admin dashboard accessible
- [ ] Orders can be created and tracked

## Alternative: VPS Hosting

If you encounter issues with shared hosting, consider:

1. **GoDaddy VPS Hosting** - More control and resources
2. **DigitalOcean** - $6/month droplet
3. **AWS Lightsail** - Simple VPS solution

These provide better performance for Next.js applications.

## Support

For issues specific to:
- **cPanel:** Contact GoDaddy support
- **Next.js:** Check Next.js documentation
- **Prisma:** Check Prisma documentation












