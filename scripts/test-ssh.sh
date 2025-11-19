#!/bin/bash

# SSH Connection Test Script
# Bu script SSH key'ning to'g'ri ishlayotganini tekshiradi

set -e

echo "=========================================="
echo "SSH Connection Test"
echo "=========================================="

SERVER_HOST="${1:-209.38.61.156}"
SERVER_USER="${2:-root}"
SSH_KEY="${3:-~/.ssh/github_actions_deploy}"

echo "Server: $SERVER_USER@$SERVER_HOST"
echo "SSH Key: $SSH_KEY"
echo ""

# Check if key file exists
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ ERROR: SSH key file not found: $SSH_KEY"
    echo ""
    echo "SSH key yaratish:"
    echo "  ssh-keygen -t rsa -b 4096 -C 'github-actions-deploy' -f ~/.ssh/github_actions_deploy"
    exit 1
fi

echo "✓ SSH key file found"
echo ""

# Check key permissions
KEY_PERMS=$(stat -c "%a" "$SSH_KEY" 2>/dev/null || stat -f "%OLp" "$SSH_KEY" 2>/dev/null)
if [ "$KEY_PERMS" != "600" ]; then
    echo "⚠ WARNING: SSH key permissions should be 600, but is $KEY_PERMS"
    echo "Fixing permissions..."
    chmod 600 "$SSH_KEY"
fi

# Check key format
FIRST_LINE=$(head -1 "$SSH_KEY")
if [[ "$FIRST_LINE" != "-----BEGIN"* ]]; then
    echo "❌ ERROR: SSH key format is incorrect!"
    echo "First line: $FIRST_LINE"
    echo ""
    echo "Key should start with: -----BEGIN OPENSSH PRIVATE KEY-----"
    echo "or: -----BEGIN RSA PRIVATE KEY-----"
    exit 1
fi

echo "✓ SSH key format is correct"
echo ""

# Test connection
echo "Testing SSH connection..."
if ssh -i "$SSH_KEY" \
    -o StrictHostKeyChecking=no \
    -o ConnectTimeout=10 \
    -o BatchMode=yes \
    "$SERVER_USER@$SERVER_HOST" \
    echo "✓ SSH connection successful!"; then
    echo ""
    echo "=========================================="
    echo "✅ SSH connection test PASSED!"
    echo "=========================================="
    echo ""
    echo "GitHub Secrets'ga qo'shish uchun private key:"
    echo "  cat $SSH_KEY"
    exit 0
else
    echo ""
    echo "❌ SSH connection test FAILED!"
    echo ""
    echo "Troubleshooting:"
    echo "1. Public key server'ga qo'shilganini tekshiring:"
    echo "   ssh-copy-id -i ${SSH_KEY}.pub $SERVER_USER@$SERVER_HOST"
    echo ""
    echo "2. Server'da authorized_keys tekshiring:"
    echo "   ssh $SERVER_USER@$SERVER_HOST 'cat ~/.ssh/authorized_keys'"
    echo ""
    echo "3. Server'da permissions tekshiring:"
    echo "   ssh $SERVER_USER@$SERVER_HOST 'ls -la ~/.ssh/'"
    exit 1
fi

