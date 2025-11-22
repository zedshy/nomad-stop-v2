#!/usr/bin/expect -f

set timeout 300
set host "92.205.231.55"
set user "nomadadmin"
set password "Nomad133@"

spawn ssh -o StrictHostKeyChecking=no $user@$host

expect {
    "password:" {
        send "$password\r"
        exp_continue
    }
    "$ " {
        send "echo '✅ Connected to VPS'\r"
    }
    "# " {
        send "echo '✅ Connected to VPS (root)'\r"
    }
    timeout {
        puts "Connection timed out"
        exit 1
    }
}

# Now run deployment commands
expect {
    "$ " {
        send "sudo su -\r"
        expect "password:"
        send "$password\r"
        expect "# "
    }
    "# " {
        # Already root
    }
}

# Update system
send "apt update && apt upgrade -y\r"
expect "# "

# Install Node.js 20
send "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -\r"
expect "# "
send "apt install -y nodejs\r"
expect "# "

# Install PM2, Nginx, Git
send "npm install -g pm2\r"
expect "# "
send "apt install -y nginx git\r"
expect "# "

# Setup project directory
send "mkdir -p /var/www/nomad-stop\r"
expect "# "
send "chown -R $user:$user /var/www/nomad-stop\r"
expect "# "
send "cd /var/www/nomad-stop\r"
expect "# "

# Clone repository
send "git clone https://github.com/zedshy/nomad-stop-v2.git .\r"
expect "# "

# Install dependencies
send "npm install --production\r"
expect "# "
send "npx prisma generate\r"
expect "# "

# Create .env file
send "cat > .env << 'ENVEOF'\r"
send "# Database\r"
send "DATABASE_URL=\"postgresql://user:password@host:5432/database?sslmode=require\"\r"
send "DISABLE_DB=\"false\"\r"
send "\r"
send "# Next.js\r"
send "NODE_ENV=\"production\"\r"
send "NEXT_PUBLIC_SITE_URL=\"http://92.205.231.55\"\r"
send "\r"
send "# Worldpay\r"
send "WORLDPAY_USERNAME=\"your_username\"\r"
send "WORLDPAY_PASSWORD=\"your_password\"\r"
send "WORLDPAY_CHECKOUT_ID=\"your_checkout_id\"\r"
send "WORLDPAY_ENTITY_ID=\"your_entity_id\"\r"
send "WORLDPAY_ENVIRONMENT=\"production\"\r"
send "WORLDPAY_WEBHOOK_SECRET=\"your_webhook_secret\"\r"
send "\r"
send "# Email\r"
send "EMAIL_HOST=\"smtp.gmail.com\"\r"
send "EMAIL_USER=\"your-email@gmail.com\"\r"
send "EMAIL_PASS=\"your-email-password\"\r"
send "ADMIN_EMAIL=\"admin@nomadstop.com\"\r"
send "\r"
send "# Admin\r"
send "ADMIN_PASSWORD=\"your-secure-password\"\r"
send "ENVEOF\r"
expect "# "

send "echo '⚠️  Please edit .env file with your actual values: nano .env'\r"
expect "# "

send "exit\r"
expect eof

