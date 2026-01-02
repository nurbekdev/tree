# Server SSH Tekshirish va Tuzatish

## ⚠️ Muammo

1 oydan beri deploy bo'lmayapti. SSH connection timeout.

## 🔍 Server'ni Tekshirish (Muhim!)

### 1. Server'ga Boshqa Usul Bilan Ulanish

Agar SSH ishlamayotgan bo'lsa, quyidagi usullardan birini ishlating:
- **Cloud Provider Console** (DigitalOcean, AWS, Linode, va h.k.)
- **VNC** (agar mavjud bo'lsa)
- **KVM/IPMI** (agar mavjud bo'lsa)

### 2. SSH Service Status

Server'ga ulangandan keyin:

```bash
# SSH service status
sudo systemctl status ssh
# yoki
sudo systemctl status sshd

# Agar ishlamayotgan bo'lsa:
sudo systemctl start ssh
sudo systemctl enable ssh
sudo systemctl restart ssh
```

### 3. SSH Config Optimizatsiya (TEZKOR YECHIM)

**Avtomatik script ishlatish:**
```bash
# Script'ni yuklab olish va ishga tushirish
cd /root
wget https://raw.githubusercontent.com/your-repo/ootree/main/fix-ssh-server.sh
# yoki
curl -O https://raw.githubusercontent.com/your-repo/ootree/main/fix-ssh-server.sh

chmod +x fix-ssh-server.sh
bash fix-ssh-server.sh
```

**Yoki qo'lda:**

```bash
# SSH config faylini ochish
sudo nano /etc/ssh/sshd_config
```

Quyidagilarni qo'shing yoki o'zgartiring:

```bash
# Port
Port 22

# Banner exchange timeout'ni oshirish
LoginGraceTime 120

# Max startups (connection queue)
MaxStartups 20:30:100

# DNS lookup o'chirish (tezroq)
UseDNS no

# GSSAPI o'chirish
GSSAPIAuthentication no

# Client alive
ClientAliveInterval 60
ClientAliveCountMax 10

# TCP keep alive
TCPKeepAlive yes

# Compression
Compression yes

# Max sessions
MaxSessions 20

# Max auth tries
MaxAuthTries 6
```

Keyin SSH service'ni reload qiling:

```bash
# Config'ni test qilish
sudo sshd -t

# Agar xato bo'lmasa, reload qiling
sudo systemctl reload ssh
# yoki
sudo systemctl reload sshd

# Status'ni tekshiring
sudo systemctl status ssh
```

### 4. Firewall Tekshirish

```bash
# UFW
sudo ufw status
sudo ufw allow 22/tcp
sudo ufw reload

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --list-ports
sudo firewall-cmd --add-port=22/tcp --permanent
sudo firewall-cmd --reload

# iptables
sudo iptables -L -n | grep 22
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables-save
```

### 5. Port 22 Tekshirish

```bash
# Port 22'da nima ishlayotganini ko'rish
sudo netstat -tuln | grep 22
# yoki
sudo ss -tuln | grep 22

# Kutilgan natija:
# tcp  0  0 0.0.0.0:22  0.0.0.0:*  LISTEN
```

### 6. Server Load Tekshirish

```bash
# Server yuklanishini ko'rish
uptime


htop

# Agar juda yuklangan bo'lsa:
# - Keraksiz process'larni to'xtatish
# - Memory/CPU usage'ni kamaytirish
# - Server'ni restart qilish
```

### 7. SSH Logs Tekshirish

```bash
# SSH connection attempt'larni ko'rish
sudo tail -f /var/log/auth.log
# yoki
sudo journalctl -u ssh -f

# Xatolarni qidirish
sudo grep "sshd" /var/log/auth.log | tail -50
```

### 8. SSH Key Tekshirish

```bash
# Authorized keys
cat ~/.ssh/authorized_keys

# Permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

## 🔧 To'liq Tuzatish

Agar hali ham muammo bo'lsa, quyidagi script'ni ishga tushiring:

```bash
#!/bin/bash
# SSH to'liq tuzatish script'i

echo "=== SSH Service Status ==="
sudo systemctl status ssh || sudo systemctl status sshd

echo "=== SSH Service Restart ==="
sudo systemctl restart ssh || sudo systemctl restart sshd

echo "=== Firewall Check ==="
sudo ufw allow 22/tcp || sudo firewall-cmd --add-port=22/tcp --permanent

echo "=== Port 22 Check ==="
sudo ss -tuln | grep 22

echo "=== SSH Config Test ==="
sudo sshd -t

echo "=== SSH Service Reload ==="
sudo systemctl reload ssh || sudo systemctl reload sshd

echo "=== Final Status ==="
sudo systemctl status ssh || sudo systemctl status sshd
```

## 🚨 Agar SSH Umuman Ishlamasa

### 1. Alternative Port

SSH'ni boshqa port'ga ko'chirish:

```bash
# /etc/ssh/sshd_config
Port 2222

# Firewall
sudo ufw allow 2222/tcp

# GitHub Secrets'da port qo'shing
SERVER_HOST: your-server:2222
```

### 2. Server Restart

```bash
sudo reboot
```

### 3. SSH Reinstall

```bash
sudo apt-get update
sudo apt-get install --reinstall openssh-server
sudo systemctl restart ssh
```

## ✅ Tekshirish

Server'da quyidagilarni tekshiring:

```bash
# 1. SSH service ishlayapti
sudo systemctl status ssh

# 2. Port 22 ochiq
sudo ss -tuln | grep 22

# 3. Firewall to'g'ri
sudo ufw status | grep 22

# 4. SSH config to'g'ri
sudo sshd -t

# 5. Test connection
ssh -v localhost
```

## 📝 GitHub Secrets Tekshirish

GitHub'da quyidagi secrets to'g'ri ekanligini tekshiring:

1. **Settings → Secrets and variables → Actions**

2. **SERVER_SSH_KEY:**
   - To'liq private key (-----BEGIN OPENSSH PRIVATE KEY----- dan boshlanadi)
   - Yoki -----BEGIN RSA PRIVATE KEY-----

3. **SERVER_HOST:**
   - Server IP yoki domain
   - Port bo'lmasa: `64.225.20.211`
   - Port bo'lsa: `64.225.20.211:2222`

4. **SERVER_USER:**
   - SSH user (odatda `root` yoki `ubuntu`)

5. **SERVER_PATH:**
   - Loyiha path (masalan: `/root/ootree`)

## 🔗 Qo'shimcha Ma'lumot

- [SSH Server Configuration](https://www.ssh.com/academy/ssh/sshd_config)
- [SSH Troubleshooting](https://www.ssh.com/academy/ssh/troubleshooting)
