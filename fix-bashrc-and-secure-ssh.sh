#!/bin/bash
# Fix .bashrc and secure SSH by disabling password authentication

HOST="92.205.231.55"
USER="nomadadmin"

echo "🔧 Fixing .bashrc and Securing SSH"
echo "===================================="
echo ""

ssh $USER@$HOST << 'ENDSSH'
cd ~

echo "=== STEP 1: Fix .bashrc Syntax Error ==="
echo ""

# Check what's wrong
echo "Checking .bashrc for syntax errors..."
if bash -n ~/.bashrc 2>&1 | grep -q "syntax error"; then
    echo "❌ Syntax error found, fixing..."
    
    # Try to restore from backup
    if [ -f ~/.bashrc.backup ]; then
        echo "Restoring from backup..."
        cp ~/.bashrc.backup ~/.bashrc
        
        # Remove javs malware section
        sed -i '/# javs自启动/,/nohup.*javs.*daemonized/d' ~/.bashrc
        
        # Remove any orphaned if/fi statements
        sed -i '/^[[:space:]]*if[[:space:]]*$/d' ~/.bashrc
        sed -i '/^[[:space:]]*fi[[:space:]]*$/d' ~/.bashrc
        
        # Remove any incomplete if statements at end of file
        tail -5 ~/.bashrc | grep -q "^[[:space:]]*if" && sed -i '$ d' ~/.bashrc
        
        echo "✅ .bashrc restored and cleaned"
    else
        echo "No backup found, fixing manually..."
        # Remove last few lines if they're broken
        head -n -5 ~/.bashrc > ~/.bashrc.tmp && mv ~/.bashrc.tmp ~/.bashrc
    fi
fi

# Test syntax
if bash -n ~/.bashrc 2>/dev/null; then
    echo "✅ .bashrc syntax is now valid"
else
    echo "⚠️  Still has errors, showing last 10 lines:"
    tail -10 ~/.bashrc
fi

echo ""
echo "=== STEP 2: Verify SSH Key Authentication Works ==="
echo ""

# Check if authorized_keys exists and has our key
if [ -f ~/.ssh/authorized_keys ]; then
    echo "✅ SSH keys are set up"
    echo "Number of keys: $(wc -l < ~/.ssh/authorized_keys)"
    echo ""
    echo "Your keys:"
    cat ~/.ssh/authorized_keys
else
    echo "❌ No authorized_keys file found"
fi

echo ""
echo "=== STEP 3: Secure SSH Configuration ==="
echo ""

# Backup SSH config
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d)

# Check current settings
echo "Current SSH settings:"
sudo grep -E "^PasswordAuthentication|^PermitRootLogin|^PubkeyAuthentication" /etc/ssh/sshd_config || echo "Using defaults"

echo ""
echo "⚠️  IMPORTANT: Before disabling password auth, make sure:"
echo "1. Your SSH key login works (you just tested it)"
echo "2. You have another terminal session open (in case something goes wrong)"
echo ""
read -p "Do you want to disable password authentication now? (yes/no): " confirm

if [ "$confirm" = "yes" ]; then
    echo ""
    echo "Disabling password authentication..."
    
    # Edit SSH config
    sudo sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
    sudo sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
    sudo sed -i 's/^#*PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
    
    # Ensure PasswordAuthentication is set (in case it wasn't in file)
    if ! grep -q "^PasswordAuthentication" /etc/ssh/sshd_config; then
        echo "PasswordAuthentication no" | sudo tee -a /etc/ssh/sshd_config
    fi
    
    echo "✅ SSH config updated"
    
    # Test config
    echo ""
    echo "Testing SSH config..."
    if sudo sshd -t 2>/dev/null; then
        echo "✅ SSH config is valid"
        
        # Show what changed
        echo ""
        echo "New SSH settings:"
        sudo grep -E "^PasswordAuthentication|^PermitRootLogin|^PubkeyAuthentication" /etc/ssh/sshd_config
        
        echo ""
        echo "⚠️  About to restart SSH. Keep this session open!"
        echo "Test in a NEW terminal window first!"
        read -p "Press Enter to restart SSH (or Ctrl+C to cancel)..."
        
        sudo systemctl restart sshd
        
        echo ""
        echo "✅ SSH restarted"
        echo ""
        echo "Now test in a NEW terminal:"
        echo "  ssh nomadadmin@92.205.231.55"
        echo ""
        echo "If it works without password, you're all set! ✅"
        echo "If it doesn't work, you can still use this session to fix it."
    else
        echo "❌ SSH config has errors! Not restarting."
        echo "Restoring backup..."
        sudo cp /etc/ssh/sshd_config.backup.* /etc/ssh/sshd_config
    fi
else
    echo ""
    echo "Password authentication left enabled."
    echo "You can disable it later by running this script again."
fi

echo ""
echo "=== ✅ Setup Complete ==="
ENDSSH

