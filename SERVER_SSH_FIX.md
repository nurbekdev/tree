# Server SSH Connection Fix

## ⚠️ Muammo

GitHub Actions'da SSH connection timeout:
```
Connection timed out during banner exchange
Connection to *** port 22 timed out
```

Bu server'da SSH muammosi borligini anglatadi.

## 🔧 Server'da Tekshirish va Tuzatish

### 1. SSH Service Status

Server'ga boshqa usul bilan ulaning (masalan, cloud provider console) va quyidagilarni bajaring:

```bash
# SSH service status
sudo systemctl status ssh
# yoki
sudo systemctl status sshd

# Agar ishlamayotgan bo'lsa:
sudo systemctl start ssh
sudo systemctl enable ssh
```

### 2. Firewall Tekshirish

```bash
# UFW (Ubuntu)
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

### 3. SSH Config Tekshirish

```bash
# SSH config faylini ochish
sudo nano /etc/ssh/sshd_config

# Quyidagilar bo'lishi kerak:
# Port 22
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes
# MaxStartups 10:30:100
# LoginGraceTime 30

# SSH service'ni reload qilish
sudo systemctl reload ssh
# yoki
sudo systemctl reload sshd
```

### 4. SSH Key Tekshirish

```bash
# Authorized keys faylini tekshirish
cat ~/.ssh/authorized_keys

# Permissions to'g'ri bo'lishi kerak
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 5. Port 22 Ochikligini Tekshirish

```bash
# Port 22'da nima ishlayotganini ko'rish
sudo netstat -tuln | grep 22
# yoki
sudo ss -tuln | grep 22

# Kutilgan natija:
# tcp  0  0 0.0.0.0:22  0.0.0.0:*  LISTEN
```

## 🔍 GitHub Secrets Tekshirish

GitHub'da quyidagi secrets to'g'ri ekanligini tekshiring:

1. **Settings → Secrets and variables → Actions**

2. **SERVER_SSH_KEY:**
   - To'liq private key (-----BEGIN OPENSSH PRIVATE KEY----- dan boshlanadi)
   - Yoki (-----BEGIN RSA PRIVATE KEY-----)
   - Key'da yangi qatorlar to'g'ri bo'lishi kerak

3. **SERVER_HOST:**
   - Server IP manzil (masalan: `64.225.20.211`)
   - Yoki domain nom (masalan: `nextree.app`)

4. **SERVER_USER:**
   - SSH user (odatda `root` yoki `ubuntu`)

5. **SERVER_PATH:**
   - Deployment path (masalan: `/var/www/tree-monitor`)

## 🛠️ SSH Key Yaratish (Agar Kerak Bo'lsa)

Agar SSH key yo'q bo'lsa yoki yangilash kerak bo'lsa:

### 1. Local Machine'da Key Yaratish

```bash
# Yangi SSH key yaratish
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions_key

# Public key'ni ko'rish
cat ~/.ssh/github_actions_key.pub
```

### 2. Server'ga Key Qo'shish

```bash
# Server'ga ulanish (boshqa usul bilan)
ssh user@server

# Authorized keys fayliga qo'shish
echo "YOUR_PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. GitHub Secrets'ga Qo'shish

1. GitHub → Settings → Secrets and variables → Actions
2. `SERVER_SSH_KEY` ni yangilash
3. Private key'ni to'liq ko'chirish (-----BEGIN dan -----END gacha)

## 🔄 Alternative: Manual Deployment

Agar SSH ishlamasa, manual deployment:

```bash
# Server'ga ulanish (boshqa usul bilan)
ssh user@server

# Code'ni pull qilish
cd /var/www/tree-monitor
git pull origin main

# Deploy qilish
cd backend
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

## 📋 Checklist

- [ ] SSH service ishlayapti (`systemctl status ssh`)
- [ ] Port 22 ochiq (`ufw status | grep 22`)
- [ ] SSH config to'g'ri (`/etc/ssh/sshd_config`)
- [ ] SSH key to'g'ri (GitHub Secrets)
- [ ] Server host to'g'ri (GitHub Secrets)
- [ ] Server user to'g'ri (GitHub Secrets)
- [ ] Authorized keys mavjud (`~/.ssh/authorized_keys`)
- [ ] Permissions to'g'ri (`chmod 700 ~/.ssh`, `chmod 600 ~/.ssh/authorized_keys`)

## 🚨 Tezkor Yechim

Agar SSH ishlamasa va tezkor yechim kerak bo'lsa:

1. **Cloud Provider Console orqali server'ga ulaning**
2. **SSH service'ni ishga tushiring:**
   ```bash
   sudo systemctl start ssh
   sudo systemctl enable ssh
   ```
3. **Firewall'ni oching:**
   ```bash
   sudo ufw allow 22/tcp
   ```
4. **SSH'ni test qiling:**
   ```bash
   ssh user@server
   ```

Keyin GitHub Actions'ni qayta ishga tushiring.
