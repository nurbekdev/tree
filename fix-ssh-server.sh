#!/bin/bash
# SSH Server Optimizatsiya Script
# Server'da ishga tushiring: bash fix-ssh-server.sh

echo "=========================================="
echo "SSH Server Optimizatsiya"
echo "=========================================="

# SSH config backup
echo "1. SSH config backup qilinmoqda..."
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d_%H%M%S)

# SSH config optimizatsiya
echo "2. SSH config optimizatsiya qilinmoqda..."
sudo tee -a /etc/ssh/sshd_config > /dev/null << 'EOF'

# GitHub Actions Deployment Optimizatsiya
LoginGraceTime 120
MaxStartups 20:30:100
UseDNS no
GSSAPIAuthentication no
ClientAliveInterval 60
ClientAliveCountMax 10
TCPKeepAlive yes
Compression yes
MaxSessions 20
MaxAuthTries 6
EOF

# SSH config test
echo "3. SSH config test qilinmoqda..."
if sudo sshd -t; then
    echo "✓ SSH config to'g'ri"
else
    echo "❌ SSH config xatolik bor!"
    echo "Backup'dan restore qiling: sudo cp /etc/ssh/sshd_config.backup.* /etc/ssh/sshd_config"
    exit 1
fi

# SSH service reload
echo "4. SSH service reload qilinmoqda..."
sudo systemctl reload ssh || sudo systemctl reload sshd

# Firewall check
echo "5. Firewall tekshirilmoqda..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp
    sudo ufw reload
    echo "✓ UFW firewall sozlandi"
elif command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --add-port=22/tcp --permanent
    sudo firewall-cmd --reload
    echo "✓ Firewalld sozlandi"
fi

# Port 22 check
echo "6. Port 22 tekshirilmoqda..."
if sudo ss -tuln | grep -q ":22 "; then
    echo "✓ Port 22 ochiq"
    sudo ss -tuln | grep ":22 "
else
    echo "⚠️  Port 22 topilmadi"
fi

# SSH service status
echo "7. SSH service status:"
sudo systemctl status ssh --no-pager || sudo systemctl status sshd --no-pager

echo ""
echo "=========================================="
echo "✓ SSH optimizatsiya yakunlandi!"
echo "=========================================="
echo ""
echo "Test qilish:"
echo "  ssh -v root@$(hostname -I | awk '{print $1}') 'echo test'"
echo ""
