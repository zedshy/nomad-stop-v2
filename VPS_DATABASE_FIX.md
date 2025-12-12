# Fix Database Connection on VPS

## Issue Found During Build

The build showed this error:
```
error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
```

This means your `DATABASE_URL` in `.env` is **incomplete or malformed**.

## Fix on VPS

### Step 1: Check current DATABASE_URL

```bash
cd /var/www/nomad-stop
cat .env | grep DATABASE_URL
```

### Step 2: Fix DATABASE_URL format

Your `DATABASE_URL` should look like this:
```
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
```

**Important points:**
- Must start with `postgresql://` or `postgres://`
- Username and password must be URL-encoded if they contain special characters
- Port is usually `5432`
- Database name (usually `postgres` or your database name)
- Add `?sslmode=require` at the end

### Step 3: Edit .env file

```bash
nano .env
```

Make sure `DATABASE_URL` looks like:
```env
DATABASE_URL="postgresql://your_username:your_password@your_host:5432/your_database?sslmode=require"
```

Save with: `Ctrl+X`, then `Y`, then `Enter`

### Step 4: Test database connection

```bash
npx prisma db pull
```

If this works, your database connection is correct.

### Step 5: Run migrations

```bash
npx prisma migrate deploy
```

### Step 6: Rebuild and restart

```bash
npm run build:prod
pm2 restart nomad-stop
pm2 status
```

## Current Status

✅ **Site is LIVE at: http://92.205.231.55**
✅ **Homepage working** (using mock data)
⚠️ **Database connection needs fixing** for admin features to work fully
⚠️ **DATABASE_URL format needs correction** in .env




