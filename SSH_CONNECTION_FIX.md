# SSH Connection Timeout Fix

## ⚠️ Muammo

GitHub Actions'da SSH connection timeout:
```
Connection timed out during banner exchange
Connection to *** port 22 timed out
Error: Process completed with exit code 255.
```

## 🔧 Yechim

### 1. SSH Connection Retry Mechanism

Workflow'ga retry mechanism qo'shildi:
- **5 marta retry** (default)
- **Exponential backoff** (10s, 15s, 20s, 25s, 30s)
- **Connection test** deploy'dan oldin

### 2. SSH Options Optimizatsiya

```bash
-o ConnectTimeout=20          # 30s → 20s
-o ServerAliveInterval=5      # 10s → 5s
-o ServerAliveCountMax=3      # Optimizatsiya
-o TCPKeepAlive=yes           # Connection'ni saqlash
-o LogLevel=ERROR             # Faqat error loglar
```

### 3. Conditional Steps

Deploy va Health Check faqat SSH connection muvaffaqiyatli bo'lganda ishlaydi:

```yaml
if: steps.ssh_test.outputs.connected == 'true'
```

## 🔍 Tekshirish

### 1. Server SSH Service

Server'da SSH service ishlayotganini tekshiring:

```bash
sudo systemctl status ssh
# yoki
sudo systemctl status sshd
```

### 2. Firewall

Port 22 ochikligini tekshiring:

```bash
# UFW
sudo ufw status | grep 22

# Firewalld
sudo firewall-cmd --list-ports | grep 22

# iptables
sudo iptables -L -n | grep 22
```

### 3. SSH Config

Server'da `/etc/ssh/sshd_config` faylini tekshiring:

```bash
sudo nano /etc/ssh/sshd_config
```

Quyidagilar bo'lishi kerak:
```
Port 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Keyin SSH service'ni reload qiling:
```bash
sudo systemctl reload ssh
# yoki
sudo systemctl reload sshd
```

### 4. SSH Key

GitHub Secrets'da SSH key to'g'ri ekanligini tekshiring:
- `SERVER_SSH_KEY` - to'liq private key (-----BEGIN OPENSSH PRIVATE KEY----- dan boshlanadi)
- `SERVER_HOST` - server IP yoki domain
- `SERVER_USER` - SSH user (odatda `root` yoki `ubuntu`)

## 🐛 Muammolarni Hal Qilish

### Connection Timeout

1. **Server ishlamayapti:**
   ```bash
   ping <SERVER_HOST>
   ```

2. **Port 22 bloklangan:**
   ```bash
   # Firewall'ni tekshirish
   sudo ufw allow 22/tcp
   ```

3. **SSH service ishlamayapti:**
   ```bash
   sudo systemctl start ssh
   sudo systemctl enable ssh
   ```

### Banner Exchange Timeout

Bu server juda sekin javob berayotganini anglatadi:

1. **Server yuklanishini tekshiring:**
   ```bash
   top
   # yoki
   htop
   ```

2. **SSH config optimizatsiya:**
   ```bash
   # /etc/ssh/sshd_config
   MaxStartups 10:30:100
   LoginGraceTime 30
   ```

### Authentication Failed

1. **SSH key to'g'riligini tekshiring:**
   ```bash
   # Server'da
   cat ~/.ssh/authorized_keys
   ```

2. **SSH key permissions:**
   ```bash
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

## 📋 Checklist

- [ ] SSH service ishlayapti (`systemctl status ssh`)
- [ ] Port 22 ochiq (`ufw status | grep 22`)
- [ ] SSH key to'g'ri (GitHub Secrets)
- [ ] Server host to'g'ri (GitHub Secrets)
- [ ] Server user to'g'ri (GitHub Secrets)
- [ ] SSH config optimizatsiya qilingan
- [ ] GitHub Actions workflow yangilangan

## ✅ Keyingi Qadamlar

1. **GitHub Secrets'ni tekshiring:**
   - Settings → Secrets and variables → Actions
   - `SERVER_SSH_KEY`, `SERVER_HOST`, `SERVER_USER`, `SERVER_PATH`

2. **Server'da SSH'ni tekshiring:**
   ```bash
   sudo systemctl status ssh
   sudo ufw status
   ```

3. **Workflow'ni qayta ishga tushiring:**
   - Actions → Deploy to Production Server → Re-run jobs
