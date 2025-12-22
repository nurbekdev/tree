# SSH Connection Timeout Fix

## ⚠️ Muammo

SSH connection banner exchange timeout:
```
Connection timed out during banner exchange
Connection to *** port 22 timed out
```

Bu SSH server'ga ulanishda banner exchange bosqichida timeout bo'lishini anglatadi.

## 🔧 Qilingan Optimizatsiyalar

### 1. SSH Config Optimizatsiya

GitHub Actions workflow'da SSH config fayli yaratildi:

```bash
Host $SERVER_HOST
  ConnectTimeout 30          # Banner exchange uchun ko'proq vaqt
  ServerAliveInterval 15      # Keep-alive interval
  ServerAliveCountMax 6        # Keep-alive retry count
  TCPKeepAlive yes            # TCP keep-alive
  Compression yes             # Slow connection uchun compression
  GSSAPIAuthentication no     # GSSAPI o'chirildi
  GSSAPIDelegateCredentials no
```

### 2. Connection Timeout Oshirildi

- **Eski:** `ConnectTimeout=15` (15 soniya)
- **Yangi:** `ConnectTimeout=30` (30 soniya)

Banner exchange uchun ko'proq vaqt berildi.

### 3. Retry Logic Yaxshilandi

- **Eski:** 3 retry, 15s delay
- **Yangi:** 5 retry, 10s delay (exponential backoff)

### 4. SSH Control Master

SSH Control Master qo'shildi:
- Connection reuse
- Faster subsequent connections
- ControlPersist 5m

### 5. Cipher Optimizatsiya

Faster cipher algorithms:
```bash
Ciphers aes128-ctr,aes192-ctr,aes256-ctr
MACs hmac-sha2-256,hmac-sha2-512
```

## 📊 Kutilayotgan Natija

**Eski:** Connection timeout (15s)
**Yangi:** Connection muvaffaqiyatli (30s timeout, 5 retry)

## 🔍 Qo'shimcha Optimizatsiyalar

### 1. Server-Side SSH Config

Server'da SSH config optimizatsiya qilish:

```bash
# /etc/ssh/sshd_config
ClientAliveInterval 60
ClientAliveCountMax 3
TCPKeepAlive yes
UseDNS no
GSSAPIAuthentication no
```

### 2. Firewall Check

Port 22 ochiqligini tekshirish:

```bash
sudo ufw status
sudo ufw allow 22/tcp
```

### 3. SSH Service Restart

SSH service'ni qayta ishga tushirish:

```bash
sudo systemctl restart ssh
sudo systemctl status ssh
```

## ✅ Tekshirish

Keyingi deployment'da:
1. SSH connection tezroq bo'lishi kerak
2. Banner exchange timeout bo'lmasligi kerak
3. Connection muvaffaqiyatli bo'lishi kerak

## 🐛 Muammolarni Hal Qilish

### Connection Hali Ham Timeout Bo'lsa

1. **Server load'ni tekshirish:**
   ```bash
   ssh user@server 'uptime'
   ```

2. **SSH logs'ni ko'rish:**
   ```bash
   sudo tail -f /var/log/auth.log
   ```

3. **SSH service'ni restart qilish:**
   ```bash
   sudo systemctl restart ssh
   ```

4. **Firewall'ni tekshirish:**
   ```bash
   sudo ufw status
   sudo ufw allow 22/tcp
   ```

5. **SSH config'ni optimizatsiya qilish:**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Quyidagilarni qo'shing:
   ClientAliveInterval 60
   ClientAliveCountMax 3
   UseDNS no
   ```

### Network Latency Muammosi

Agar network latency yuqori bo'lsa:

1. **Compression'ni yoqish:**
   ```bash
   Compression yes
   ```

2. **Connection timeout'ni yanada oshirish:**
   ```bash
   ConnectTimeout 60
   ```

3. **Alternative deployment method:**
   - GitHub Actions runner'ni server'ga yaqin joyga qo'yish
   - Self-hosted runner ishlatish

## 📝 Eslatmalar

1. **SSH Config** - GitHub Actions'da avtomatik yaratiladi
2. **Connection Reuse** - Control Master connection'larni reuse qiladi
3. **Compression** - Slow connection'lar uchun foydali
4. **DNS Lookup** - O'chirildi, tezroq connection

## 🔗 Qo'shimcha Ma'lumot

- [SSH Connection Optimization](https://www.ssh.com/academy/ssh/config)
- [SSH Timeout Issues](https://www.ssh.com/academy/ssh/troubleshooting-timeout)
