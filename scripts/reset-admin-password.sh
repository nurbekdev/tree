#!/bin/bash

# Reset Admin Password
# Bu script admin user password'ni qayta o'rnatadi

set -e

echo "=========================================="
echo "Reset Admin Password"
echo "=========================================="
echo ""

cd /var/www/tree-monitor/tree/backend

# Get new password from user or use default
if [ -z "$1" ]; then
    NEW_PASSWORD="admin123"
    echo "Using default password: admin123"
    echo "To set custom password: $0 <new_password>"
else
    NEW_PASSWORD="$1"
    echo "Setting new password..."
fi

# Generate password hash using Node.js
echo "Generating password hash..."
PASSWORD_HASH=$(docker compose -f docker-compose.prod.yml exec -T backend node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('$NEW_PASSWORD', 10).then(hash => {
  console.log(hash);
});
" | tr -d '\r\n')

if [ -z "$PASSWORD_HASH" ]; then
    echo "❌ Failed to generate password hash"
    exit 1
fi

echo "Updating password in database..."
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d tree_monitor -c "
UPDATE users 
SET password_hash = '$PASSWORD_HASH' 
WHERE username = 'admin';
"

if [ $? -eq 0 ]; then
    echo "✓ Password updated successfully!"
    echo ""
    echo "New credentials:"
    echo "  Username: admin"
    echo "  Password: $NEW_PASSWORD"
    echo ""
    echo "⚠️  Please test login now!"
else
    echo "❌ Failed to update password"
    exit 1
fi

