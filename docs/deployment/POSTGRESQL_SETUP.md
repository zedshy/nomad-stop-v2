# PostgreSQL Database Setup on VPS

This guide explains how to set up PostgreSQL directly on your VPS for the Nomad Stop application.

## Prerequisites

- VPS with Ubuntu/Debian or similar Linux distribution
- SSH access to your VPS
- Root or sudo access

## Installation

### 1. Install PostgreSQL

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL prompt:
CREATE DATABASE nomadstop;
CREATE USER nomadstop_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE nomadstop TO nomadstop_user;

# For PostgreSQL 15+, you may also need:
\c nomadstop
GRANT ALL ON SCHEMA public TO nomadstop_user;

# Exit PostgreSQL
\q
```

### 3. Configure PostgreSQL for Remote Access (Optional)

If your application runs on a different server:

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/[version]/main/postgresql.conf

# Find and update:
listen_addresses = '*'  # or specific IP

# Edit pg_hba.conf
sudo nano /etc/postgresql/[version]/main/pg_hba.conf

# Add line for your application server:
host    nomadstop    nomadstop_user    [YOUR_APP_IP]/32    md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 4. Configure Firewall (if applicable)

```bash
# Allow PostgreSQL port
sudo ufw allow 5432/tcp
# Or restrict to specific IP:
sudo ufw allow from [YOUR_APP_IP] to any port 5432
```

## Connection String Format

Update your `.env` file with:

```bash
# For local connection (same VPS)
DATABASE_URL="postgresql://nomadstop_user:your_secure_password_here@localhost:5432/nomadstop?sslmode=prefer"

# For remote connection (different server)
DATABASE_URL="postgresql://nomadstop_user:your_secure_password_here@[VPS_IP_OR_DOMAIN]:5432/nomadstop?sslmode=prefer"
```

## Run Migrations

Once PostgreSQL is set up:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run seed
```

## Security Notes

1. **Use strong passwords** for database users
2. **Limit remote access** - only allow connections from your application server
3. **Use SSL** in production by setting `sslmode=require` in connection string
4. **Regular backups** - set up automated PostgreSQL backups
5. **Keep PostgreSQL updated** - regularly update packages

## Troubleshooting

### Connection Refused
- Check if PostgreSQL is running: `sudo systemctl status postgresql`
- Verify firewall settings
- Check `postgresql.conf` for `listen_addresses`

### Authentication Failed
- Verify username and password
- Check `pg_hba.conf` for correct authentication method
- Ensure user has proper permissions

### Permission Denied
- Grant proper permissions to database user
- Check schema permissions for PostgreSQL 15+

## Backup and Restore

### Create Backup
```bash
sudo -u postgres pg_dump nomadstop > backup_$(date +%Y%m%d).sql
```

### Restore Backup
```bash
sudo -u postgres psql nomadstop < backup_20240101.sql
```

