#!/bin/bash
# Disable password authentication - automated version

HOST="92.205.231.55"
USER="nomadadmin"

echo "🔒 Disabling Password Authentication"
echo "===================================="
echo ""

ssh $USER@$HOST << 'ENDSSH'
cd ~

echo "1. Verifying SSH key is set up..."
if [ -f ~/.ssh/authorized_keys ]; then
    echo "✅ SSH key found:"
    cat ~/.ssh/authorized_keys
    echo ""
else
    echo "❌ No SSH key! Don't disable passwords yet!"
    exit 1
fi

echo ""
echo "2. Backing up SSH config..."
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup created"

echo ""
echo "3. Current SSH settings:"
sudo grep -E "^PasswordAuthentication|^PermitRootLogin|^PubkeyAuthentication" /etc/ssh/sshd_config 2>/dev/null || echo "Using defaults"

echo ""
echo "4. Updating SSH config to disable password authentication..."

# Update PasswordAuthentication
if sudo grep -q "^PasswordAuthentication" /etc/ssh/sshd_config; then
    sudo sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
else
    echo "PasswordAuthentication no" | sudo tee -a /etc/ssh/sshd_config > /dev/null
fi

# Update PermitRootLogin
if sudo grep -q "^PermitRootLogin" /etc/ssh/sshd_config; then
    sudo sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
else
    echo "PermitRootLogin no" | sudo tee -a /etc/ssh/sshd_config > /dev/null
fi

# Ensure PubkeyAuthentication is enabled
if sudo grep -q "^PubkeyAuthentication" /etc/ssh/sshd_config; then
    sudo sed -i 's/^PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
else
    echo "PubkeyAuthentication yes" | sudo tee -a /etc/ssh/sshd_config > /dev/null
fi

echo "✅ Config updated"

echo ""
echo "5. New SSH settings:"
sudo grep -E "^PasswordAuthentication|^PermitRootLogin|^PubkeyAuthentication" /etc/ssh/sshd_config

echo ""
echo "6. Testing SSH config syntax..."
if sudo sshd -t 2>/dev/null; then
    echo "✅ Config is valid"
else
    echo "❌ Config has errors! Restoring backup..."
    sudo cp /etc/ssh/sshd_config.backup.* /etc/ssh/sshd_config
    exit 1
fi

echo ""
echo "7. Restarting SSH service..."
sudo systemctl restart sshd

if [ $? -eq 0 ]; then
    echo "✅ SSH restarted successfully"
    echo ""
    echo "=== ✅ PASSWORD AUTHENTICATION DISABLED ==="
    echo ""
    echo "Now only SSH keys can be used to login."
    echo ""
    echo "⚠️  IMPORTANT: Test in a NEW terminal:"
    echo "   ssh nomadadmin@92.205.231.55"
    echo ""
    echo "If it works without password, you're all set! ✅"
    echo "If it doesn't work, you can still use this session to fix it."
else
    echo "❌ Failed to restart SSH"
    echo "Restoring backup..."
    sudo cp /etc/ssh/sshd_config.backup.* /etc/ssh/sshd_config
    sudo systemctl restart sshd
fi
ENDSSH

