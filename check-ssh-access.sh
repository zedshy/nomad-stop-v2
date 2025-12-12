#!/bin/bash
# Show who has SSH access to the server

HOST="92.205.231.55"
USER="nomadadmin"

echo "👥 Who Has SSH Access?"
echo "======================"
echo ""

ssh $USER@$HOST << 'ENDSSH'
echo "=== People/Devices That Can Login ==="
echo ""

if [ -f ~/.ssh/authorized_keys ]; then
    key_count=$(wc -l < ~/.ssh/authorized_keys)
    echo "Total keys (people/devices): $key_count"
    echo ""
    echo "Public keys:"
    echo "------------"
    cat ~/.ssh/authorized_keys | nl -w2 -s'. '
    echo ""
    
    echo "Key details:"
    echo "------------"
    cat ~/.ssh/authorized_keys | while read line; do
        if [ ! -z "$line" ]; then
            key_type=$(echo "$line" | awk '{print $1}')
            key_fingerprint=$(echo "$line" | awk '{print $2}' | cut -c1-20)
            key_comment=$(echo "$line" | awk '{print $3}')
            echo "  Type: $key_type"
            echo "  Comment: ${key_comment:-No comment}"
            echo "  Fingerprint: ${key_fingerprint}..."
            echo ""
        fi
    done
else
    echo "❌ No authorized_keys file found"
    echo "No one can login with SSH keys!"
fi

echo ""
echo "=== SSH Configuration ==="
echo ""

echo "Password authentication:"
sudo grep -E "^PasswordAuthentication" /etc/ssh/sshd_config 2>/dev/null | awk '{print "  " $0}' || echo "  Using default (enabled)"

echo ""
echo "Public key authentication:"
sudo grep -E "^PubkeyAuthentication" /etc/ssh/sshd_config 2>/dev/null | awk '{print "  " $0}' || echo "  Using default (enabled)"

echo ""
echo "=== Summary ==="
echo ""
if [ -f ~/.ssh/authorized_keys ]; then
    echo "✅ SSH keys are set up"
    echo "✅ $key_count person/device(s) can login"
    if sudo grep -q "^PasswordAuthentication.*no" /etc/ssh/sshd_config 2>/dev/null; then
        echo "✅ Password authentication is DISABLED (keys only)"
    else
        echo "⚠️  Password authentication is ENABLED (less secure)"
    fi
else
    echo "❌ No SSH keys set up"
    echo "⚠️  Only password login available"
fi
ENDSSH

