#!/bin/bash
# Properly fix .bashrc syntax error

HOST="92.205.231.55"
USER="nomadadmin"

echo "🔧 Fixing .bashrc Properly"
echo "=========================="
echo ""

ssh $USER@$HOST << 'ENDSSH'
cd ~

echo "1. Checking .bashrc for issues..."
bash -n ~/.bashrc 2>&1 | head -5

echo ""
echo "2. Checking last 15 lines of .bashrc:"
tail -15 ~/.bashrc

echo ""
echo "3. Checking for unmatched if/fi:"
if_count=$(grep -c "^[[:space:]]*if " ~/.bashrc 2>/dev/null || echo "0")
fi_count=$(grep -c "^[[:space:]]*fi" ~/.bashrc 2>/dev/null || echo "0")
echo "if statements: $if_count"
echo "fi statements: $fi_count"

echo ""
echo "4. Fixing .bashrc..."

# Create a clean .bashrc from backup, removing malware
if [ -f ~/.bashrc.backup ]; then
    # Copy backup
    cp ~/.bashrc.backup ~/.bashrc.tmp
    
    # Remove javs malware section
    sed -i '/# javs自启动/,/nohup.*javs.*daemonized/d' ~/.bashrc.tmp
    
    # Remove any orphaned if/fi
    sed -i '/^[[:space:]]*if[[:space:]]*$/d' ~/.bashrc.tmp
    sed -i '/^[[:space:]]*fi[[:space:]]*$/d' ~/.bashrc.tmp
    
    # Remove incomplete if statements at end
    while tail -1 ~/.bashrc.tmp | grep -q "^[[:space:]]*if"; do
        sed -i '$ d' ~/.bashrc.tmp
    done
    
    # Ensure file ends with newline
    echo "" >> ~/.bashrc.tmp
    
    # Test the fixed version
    if bash -n ~/.bashrc.tmp 2>/dev/null; then
        mv ~/.bashrc.tmp ~/.bashrc
        echo "✅ .bashrc fixed from backup"
    else
        echo "Backup also has issues, trying different approach..."
        rm ~/.bashrc.tmp
        
        # Try to fix current file
        # Remove last few lines that might be broken
        head -n 100 ~/.bashrc > ~/.bashrc.tmp2 2>/dev/null
        if bash -n ~/.bashrc.tmp2 2>/dev/null; then
            mv ~/.bashrc.tmp2 ~/.bashrc
            echo "✅ .bashrc fixed by removing broken lines"
        else
            echo "Creating minimal .bashrc..."
            # Create a basic .bashrc
            cat > ~/.bashrc << 'BASHRC_EOF'
# ~/.bashrc: executed by bash(1) for non-login shells.

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# History settings
HISTCONTROL=ignoreboth
HISTSIZE=1000
HISTFILESIZE=2000

# Append to history file, don't overwrite it
shopt -s histappend

# Check window size after each command
shopt -s checkwinsize

# Make less more friendly for non-text input files
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# Enable color support
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# Alias definitions
if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

# Enable programmable completion features
if ! shopt -oq posix; then
  if [ -f /usr/share/bash-completion/bash_completion ]; then
    . /usr/share/bash-completion/bash_completion
  elif [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
  fi
fi
BASHRC_EOF
            echo "✅ Created clean .bashrc"
        fi
    fi
else
    echo "No backup found, creating clean .bashrc..."
    # Create basic .bashrc (same as above)
    cat > ~/.bashrc << 'BASHRC_EOF'
# ~/.bashrc: executed by bash(1) for non-login shells.

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# History settings
HISTCONTROL=ignoreboth
HISTSIZE=1000
HISTFILESIZE=2000

# Append to history file, don't overwrite it
shopt -s histappend

# Check window size after each command
shopt -s checkwinsize

# Make less more friendly for non-text input files
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# Enable color support
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# Alias definitions
if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

# Enable programmable completion features
if ! shopt -oq posix; then
  if [ -f /usr/share/bash-completion/bash_completion ]; then
    . /usr/share/bash-completion/bash_completion
  elif [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
  fi
fi
BASHRC_EOF
    echo "✅ Created clean .bashrc"
fi

echo ""
echo "5. Testing .bashrc syntax:"
if bash -n ~/.bashrc 2>/dev/null; then
    echo "✅ .bashrc syntax is now valid!"
else
    echo "❌ Still has errors:"
    bash -n ~/.bashrc 2>&1 | head -5
fi

echo ""
echo "6. Verifying .bashrc loads:"
bash -c "source ~/.bashrc && echo '✅ .bashrc loads successfully'"

echo ""
echo "✅ Fix complete!"
ENDSSH

