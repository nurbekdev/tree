# Server SSH Banner Exchange Timeout Fix

## ⚠️ Muammo

SSH connection banner exchange timeout:
```
Connection timed out during banner exchange
```

Bu server'da SSH service juda sekin javob berayotganini anglatadi.

## 🔧 Server-Side Fix (Muhim!)

Server'ga boshqa usul bilan ulaning (cloud console, VNC, yoki boshqa SSH connection) va quyidagilarni bajaring:

### 1. SSH Service Status

```bash
# SSH service status
sudo systemctl status ssh
# yoki
sudo systemctl status sshd

# Agar ishlamayotgan bo'lsa:
sudo systemctl start ssh
sudo systemctl enable ssh
```

### 2. SSH Config Optimizatsiya

```bash
# SSH config faylini ochish
sudo nano /etc/ssh/sshd_config
```

Quyidagilarni qo'shing yoki o'zgartiring:

```bash
# Port
Port 22

# Banner exchange timeout'ni oshirish
LoginGraceTime 60

# Max startups (connection queue)
MaxStartups 10:30:100

# DNS lookup o'chirish (tezroq)
UseDNS no

# GSSAPI o'chirish
GSSAPIAuthentication no

# Client alive
ClientAliveInterval 60
ClientAliveCountMax 3

# TCP keep alive
TCPKeepAlive yes

# Compression
Compression yes
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

### 3. Firewall Tekshirish

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

### 4. Server Load Tekshirish

```bash
# Server yuklanishini ko'rish
uptime
top
htop

# Agar juda yuklangan bo'lsa:
# - Keraksiz process'larni to'xtatish
# - Memory/CPU usage'ni kamaytirish
# - Server'ni restart qilish
```

### 5. SSH Logs Tekshirish

```bash
# SSH connection attempt'larni ko'rish
sudo tail -f /var/log/auth.log
# yoki
sudo journalctl -u ssh -f

# Xatolarni qidirish
sudo grep "sshd" /var/log/auth.log | tail -50
```

### 6. Port 22 Tekshirish

```bash
# Port 22'da nima ishlayotganini ko'rish
sudo netstat -tuln | grep 22
# yoki
sudo ss -tuln | grep 22

# Kutilgan natija:
# tcp  0  0 0.0.0.0:22  0.0.0.0:*  LISTEN
```

### 7. SSH Service Restart

Agar hali ham muammo bo'lsa:

```bash
# SSH service'ni to'liq restart qilish
sudo systemctl stop ssh
sudo systemctl start ssh
sudo systemctl status ssh

# yoki
sudo systemctl restart ssh
```

## 🔍 GitHub Actions Optimizatsiyalar

GitHub Actions workflow'da quyidagilar qo'shildi:

1. **ConnectTimeout 60** - Banner exchange uchun ko'proq vaqt
2. **ServerAliveInterval 20** - Keep-alive interval
3. **Raw TCP test** - Port 22 ochiqligini tekshirish
4. **Verbose logging** - Debug uchun
5. **5 retry** - Exponential backoff

## 📊 Kutilayotgan Natija

**Eski:** Banner exchange timeout
**Yangi:** Connection muvaffaqiyatli (60s timeout)

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

## 🐛 Muammolarni Hal Qilish

### Banner Exchange Hali Ham Timeout Bo'lsa

1. **Server'ni restart qilish:**
   ```bash
   sudo reboot
   ```

2. **SSH service'ni to'liq qayta o'rnatish:**
   ```bash
   sudo apt-get update
   sudo apt-get install --reinstall openssh-server
   sudo systemctl restart ssh
   ```

3. **Alternative SSH port ishlatish:**
   ```bash
   # /etc/ssh/sshd_config
   Port 2222
   
   # Firewall
   sudo ufw allow 2222/tcp
   
   # GitHub Secrets'da port qo'shing
   SERVER_HOST: your-server:2222
   ```

4. **SSH key authentication'ni tekshirish:**
   ```bash
   # Authorized keys
   cat ~/.ssh/authorized_keys
   
   # Permissions
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

## 📝 Eslatmalar

1. **Server-side fix muhim** - Client-side optimizatsiyalar yetarli bo'lmasligi mumkin
2. **LoginGraceTime** - Banner exchange uchun vaqt
3. **MaxStartups** - Connection queue'ni boshqarish
4. **UseDNS no** - DNS lookup o'chirish, tezroq connection

## 🔗 Qo'shimcha Ma'lumot

- [SSH Server Configuration](https://www.ssh.com/academy/ssh/sshd_config)
- [SSH Troubleshooting](https://www.ssh.com/academy/ssh/troubleshooting)
