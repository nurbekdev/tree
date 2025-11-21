#!/bin/bash

# Test Login Endpoint
# Bu script login endpoint'ni test qiladi

set -e

echo "=========================================="
echo "Testing Login Endpoint"
echo "=========================================="
echo ""

# Test with default credentials
echo "1. Testing with default credentials (admin/admin123):"
echo "-------------------"
RESPONSE=$(curl -s -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "Response: $RESPONSE"
echo ""

# Check if token is present
if echo "$RESPONSE" | grep -q "token"; then
    echo "✓ Login successful!"
    TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "Token (first 20 chars): ${TOKEN:0:20}..."
else
    echo "✗ Login failed!"
    echo "Full response: $RESPONSE"
fi
echo ""

# Test with wrong password
echo "2. Testing with wrong password (admin/wrongpass):"
echo "-------------------"
WRONG_RESPONSE=$(curl -s -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpass"}')

echo "Response: $WRONG_RESPONSE"
if echo "$WRONG_RESPONSE" | grep -q "Invalid credentials"; then
    echo "✓ Correctly rejected wrong password"
else
    echo "⚠️  Unexpected response"
fi
echo ""

# Test with wrong username
echo "3. Testing with wrong username (wronguser/admin123):"
echo "-------------------"
WRONG_USER_RESPONSE=$(curl -s -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"wronguser","password":"admin123"}')

echo "Response: $WRONG_USER_RESPONSE"
if echo "$WRONG_USER_RESPONSE" | grep -q "Invalid credentials"; then
    echo "✓ Correctly rejected wrong username"
else
    echo "⚠️  Unexpected response"
fi
echo ""

echo "=========================================="
echo "Test Complete"
echo "=========================================="
echo ""
echo "Default credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""

