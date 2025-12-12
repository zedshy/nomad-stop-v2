# 🔐 How to Set Up SSH Key Authentication

## What are SSH Keys?

SSH keys are like a password that's much more secure:
- **Private key**: Stays on your Mac (never share this!)
- **Public key**: Goes on the server (safe to share)

Instead of typing a password, your Mac uses the private key to prove your identity.

## Step-by-Step Setup

### **Step 1: Check if you already have SSH keys**

```bash
# On your Mac, check if keys already exist
ls -la ~/.ssh/id_ed25519* ~/.ssh/id_rsa* 2>/dev/null
```

If you see files like `id_ed25519` or `id_rsa`, you already have keys! Skip to Step 3.

### **Step 2: Generate new SSH keys (if needed)**

```bash
# On your Mac, generate a new SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# When prompted:
# - Press Enter to save to default location (~/.ssh/id_ed25519)
# - Press Enter for no passphrase (or set one for extra security)
# - Press Enter again to confirm
```

**What this does:**
- Creates `~/.ssh/id_ed25519` (private key - keep secret!)
- Creates `~/.ssh/id_ed25519.pub` (public key - safe to share)

### **Step 3: Copy your public key to the server**

**Option A: Automatic (easiest)**
```bash
# On your Mac, this will copy your key and set it up
ssh-copy-id nomadadmin@92.205.231.55

# Enter your password when prompted (last time you'll need it!)
```

**Option B: Manual (if ssh-copy-id doesn't work)**
```bash
# On your Mac, display your public key
cat ~/.ssh/id_ed25519.pub

# Copy the entire output (it's one long line)

# Then on the VPS, run:
ssh nomadadmin@92.205.231.55
# Enter password

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add your public key
nano ~/.ssh/authorized_keys
# Paste your public key (the long line you copied)
# Save and exit (Ctrl+X, then Y, then Enter)

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
```

### **Step 4: Test that key authentication works**

```bash
# On your Mac, try to SSH in (should NOT ask for password)
ssh nomadadmin@92.205.231.55

# If it works without asking for a password, you're good! ✅
# If it still asks for password, check the steps above
```

### **Step 5: Disable password authentication (ONLY after keys work!)**

**⚠️ IMPORTANT: Make sure key login works first! Otherwise you'll be locked out!**

```bash
# On the VPS, edit SSH config
sudo nano /etc/ssh/sshd_config

# Find these lines and change them:
PasswordAuthentication no          # Change from 'yes' to 'no'
PermitRootLogin no                 # Change from 'yes' to 'no' (if not already)
PubkeyAuthentication yes           # Make sure this is 'yes'

# Save and exit (Ctrl+X, then Y, then Enter)

# Test the config (make sure no errors)
sudo sshd -t

# If no errors, restart SSH
sudo systemctl restart sshd

# Keep your current SSH session open! Test in a NEW terminal:
# On your Mac, open a new terminal and try:
ssh nomadadmin@92.205.231.55

# If it works, you're done! ✅
# If it doesn't work, you can still use your old session to fix it
```

## Troubleshooting

### **"Permission denied (publickey)"**

This means your key isn't set up correctly. Check:

```bash
# On VPS, check permissions
ls -la ~/.ssh/
# Should show:
# drwx------ (700) for .ssh directory
# -rw------- (600) for authorized_keys file

# Fix permissions if needed:
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### **"Too many authentication failures"**

```bash
# On your Mac, specify which key to use:
ssh -i ~/.ssh/id_ed25519 nomadadmin@92.205.231.55
```

### **Still asking for password**

1. Make sure you copied the **public** key (ends in `.pub`)
2. Make sure it's in `~/.ssh/authorized_keys` on the server
3. Check file permissions (600 for authorized_keys, 700 for .ssh)

## Where are the keys stored?

**On your Mac:**
- Private key: `~/.ssh/id_ed25519` (NEVER share this!)
- Public key: `~/.ssh/id_ed25519.pub` (safe to share)

**On the server:**
- Public keys: `~/.ssh/authorized_keys` (contains all allowed keys)

## Security Tips

1. **Backup your private key**: If you lose it, you'll need to set up keys again
2. **Use a passphrase**: When generating keys, you can add a passphrase for extra security
3. **One key per device**: Generate separate keys for different computers
4. **Never share private key**: The `.pub` file is safe, but never share the private key

## Quick Reference

```bash
# Generate key (Mac)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy to server (Mac)
ssh-copy-id nomadadmin@92.205.231.55

# Test login (Mac)
ssh nomadadmin@92.205.231.55

# Disable passwords (VPS - after testing!)
sudo nano /etc/ssh/sshd_config
# Change: PasswordAuthentication no
sudo systemctl restart sshd
```

