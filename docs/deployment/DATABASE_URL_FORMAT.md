# DATABASE_URL Format Guide

## Correct Format

```
postgresql://username:password@host:port/database?sslmode=require
```

## Common Issues and Fixes

### 1. Missing Port Number
❌ **Wrong:**
```
postgresql://user:pass@host/database
```

✅ **Correct:**
```
postgresql://user:pass@host:5432/database?sslmode=require
```

### 2. Special Characters in Password
If your password contains special characters like `@`, `#`, `%`, `&`, etc., you **must URL-encode** them:

**Special Character Encoding:**
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `?` → `%3F`
- `/` → `%2F`
- `:` → `%3A`
- ` ` (space) → `%20`

**Example:**
If your password is `My@Pass#123`, it should be:
```
postgresql://user:My%40Pass%23123@host:5432/database?sslmode=require
```

### 3. Spaces in Connection String
❌ **Wrong:**
```
postgresql://user:pass @host:5432/database
```

✅ **Correct:**
```
postgresql://user:pass@host:5432/database?sslmode=require
```

### 4. Missing SSL Mode
For most cloud databases (Neon, Supabase, etc.), you need `sslmode=require`:

✅ **Correct:**
```
postgresql://user:pass@host:5432/database?sslmode=require
```

## Database Provider Examples

### Neon PostgreSQL
```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech:5432/dbname?sslmode=require
```

### Supabase
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres?sslmode=require
```

### Direct PostgreSQL
```
postgresql://username:password@your-host.com:5432/database_name?sslmode=require
```

## How to Fix in Vercel

1. Go to **Settings** → **Environment Variables**
2. Find `DATABASE_URL` and click the **edit icon** (pencil)
3. Make sure the format is exactly:
   ```
   postgresql://username:password@host:5432/database?sslmode=require
   ```
4. **URL-encode** any special characters in the password
5. Click **Save**
6. **Redeploy** your application

## Quick URL Encoding Tool

You can use an online tool like:
- https://www.urlencoder.org/
- Or use this command in terminal:
  ```bash
  python3 -c "import urllib.parse; print(urllib.parse.quote('your-password-here'))"
  ```

## Testing Your Connection String

Before adding to Vercel, you can test it locally:
```bash
# Test connection (replace with your actual connection string)
psql "postgresql://user:pass@host:5432/db?sslmode=require"
```

If it connects successfully, the format is correct!

