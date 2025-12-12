#!/bin/bash
# Interactive script to set up SSH keys

echo "🔐 SSH Key Setup Guide"
echo "====================="
echo ""

# Check if keys exist
if [ -f ~/.ssh/id_ed25519 ] || [ -f ~/.ssh/id_rsa ]; then
    echo "✅ You already have SSH keys!"
    echo ""
    echo "Your public key:"
    if [ -f ~/.ssh/id_ed25519.pub ]; then
        cat ~/.ssh/id_ed25519.pub
    elif [ -f ~/.ssh/id_rsa.pub ]; then
        cat ~/.ssh/id_rsa.pub
    fi
    echo ""
    echo "To copy this key to the server, run:"
    echo "  ssh-copy-id nomadadmin@92.205.231.55"
else
    echo "No SSH keys found. Let's create them!"
    echo ""
    read -p "Enter your email (for key identification): " email
    
    if [ -z "$email" ]; then
        email="nomadadmin@nomadstop.com"
    fi
    
    echo ""
    echo "Generating SSH key..."
    ssh-keygen -t ed25519 -C "$email" -f ~/.ssh/id_ed25519 -N ""
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ SSH key generated!"
        echo ""
        echo "Your public key:"
        cat ~/.ssh/id_ed25519.pub
        echo ""
        echo "Next steps:"
        echo "1. Copy this key to the server:"
        echo "   ssh-copy-id nomadadmin@92.205.231.55"
        echo ""
        echo "2. Test that it works:"
        echo "   ssh nomadadmin@92.205.231.55"
        echo ""
        echo "3. Once key login works, disable password auth on the server"
    else
        echo "❌ Failed to generate key"
        exit 1
    fi
fi

