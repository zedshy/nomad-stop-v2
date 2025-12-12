#!/bin/bash
# Secure SSH by disabling password authentication

HOST="92.205.231.55"
USER="nomadadmin"

echo "🔒 Securing SSH - Disabling Password Authentication"
echo "===================================================="
echo ""

ssh $USER@$HOST << 'ENDSSH'
cd ~

echo "=== STEP 1: Verify SSH Key Authentication Works ==="
echo ""

if [ -f ~/.ssh/authorized_keys ]; then
    key_count=$(wc -l < ~/.ssh/authorized_keys)
    echo "✅ SSH keys are set up ($key_count key(s))"
    echo ""
    echo "Your authorized keys:"
    cat ~/.ssh/authorized_keys
    echo ""
else
    echo "❌ No authorized_keys found! Don't disable passwords yet!"
    exit 1
fi

echo ""
echo "=== STEP 2: Backup SSH Config ==="
echo ""

sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup created: /etc/ssh/sshd_config.backup.*"

echo ""
echo "=== STEP 3: Check Current SSH Settings ==="
echo ""

echo "Current settings:"
sudo grep -E "^PasswordAuthentication|^PermitRootLogin|^PubkeyAuthentication" /etc/ssh/sshd_config || echo "Using defaults (password auth enabled)"

echo ""
echo "=== STEP 4: Update SSH Configuration ==="
echo ""

# Update PasswordAuthentication
if sudo grep -q "^PasswordAuthentication" /etc/ssh/sshd_config; then
    sudo sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
else
    echo "PasswordAuthentication no" | sudo tee -a /etc/ssh/sshd_config
fi

# Update PermitRootLogin
if sudo grep -q "^PermitRootLogin" /etc/ssh/sshd_config; then
    sudo sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
else
    echo "PermitRootLogin no" | sudo tee -a /etc/ssh/sshd_config
fi

# Ensure PubkeyAuthentication is enabled
if sudo grep -q "^PubkeyAuthentication" /etc/ssh/sshd_config; then
    sudo sed -i 's/^PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
else
    echo "PubkeyAuthentication yes" | sudo tee -a /etc/ssh/sshd_config
fi

echo ""
echo "✅ SSH config updated"

echo ""
echo "=== STEP 5: Verify SSH Config ==="
echo ""

echo "New settings:"
sudo grep -E "^PasswordAuthentication|^PermitRootLogin|^PubkeyAuthentication" /etc/ssh/sshd_config

echo ""
echo "Testing SSH config syntax..."
if sudo sshd -t 2>/dev/null; then
    echo "✅ SSH config is valid"
else
    echo "❌ SSH config has errors! Restoring backup..."
    sudo cp /etc/ssh/sshd_config.backup.* /etc/ssh/sshd_config
    exit 1
fi

echo ""
echo "=== STEP 6: Restart SSH Service ==="
echo ""
echo "⚠️  IMPORTANT:"
echo "1. Keep this SSH session open!"
echo "2. Test in a NEW terminal window first!"
echo "3. If new terminal works, you're good!"
echo ""
read -p "Press Enter to restart SSH (or Ctrl+C to cancel)..." 

sudo systemctl restart sshd

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSH restarted successfully"
    echo ""
    echo "=== NEXT STEPS ==="
    echo ""
    echo "1. Open a NEW terminal on your Mac"
    echo "2. Test SSH login:"
    echo "   ssh nomadadmin@92.205.231.55"
    echo ""
    echo "3. If it works without password: ✅ SUCCESS!"
    echo "   Password authentication is now disabled"
    echo ""
    echo "4. If it doesn't work:"
    echo "   - You can still use this session to fix it"
    echo "   - Restore backup: sudo cp /etc/ssh/sshd_config.backup.* /etc/ssh/sshd_config"
    echo "   - Restart: sudo systemctl restart sshd"
else
    echo "❌ Failed to restart SSH"
    echo "Restoring backup..."
    sudo cp /etc/ssh/sshd_config.backup.* /etc/ssh/sshd_config
    sudo systemctl restart sshd
fi

echo ""
echo "=== ✅ SSH Security Setup Complete ==="
ENDSSH

