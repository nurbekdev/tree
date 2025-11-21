# GitHub Actions CI/CD Setup Guide

## SSH Key Yaratish va Sozlash

### 1. SSH Key Yaratish (Local Machine'da)

```bash
# SSH key yaratish (password bo'sh qoldiring)
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Bu ikkita fayl yaratadi:
# ~/.ssh/github_actions_deploy (private key - GitHub Secrets'ga qo'shish kerak)
# ~/.ssh/github_actions_deploy.pub (public key - Server'ga qo'shish kerak)
```

### 2. Public Key'ni Server'ga Qo'shish

**Usul 1: ssh-copy-id (Tavsiya etiladi)**

```bash
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub root@209.38.61.156
# Password: Polatov2004!@#Nur
```

**Usul 2: Qo'lda**

```bash
# Public key'ni ko'rish
cat ~/.ssh/github_actions_deploy.pub

# Server'ga ulanish
ssh root@209.38.61.156
# Password: Polatov2004!@#Nur

# Server'da:
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**Usul 3: Bir qatorda**

```bash
cat ~/.ssh/github_actions_deploy.pub | ssh root@209.38.61.156 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

### 3. SSH Connection'ni Test Qilish

```bash
# Password so'ralmasligi kerak
ssh -i ~/.ssh/github_actions_deploy root@209.38.61.156

# Agar ishlayotgan bo'lsa, "exit" yozib chiqing
```

### 4. GitHub Secrets Qo'shish

GitHub repository'ga kiring:
1. **Settings** → **Secrets and variables** → **Actions**
2. Quyidagi secret'larni qo'shing:

#### SERVER_HOST
```
209.38.61.156
```

#### SERVER_USER
```
root
```

#### SERVER_PATH
```
/var/www/tree-monitor/tree
```

#### SERVER_SSH_KEY
```bash
# Private key'ni ko'rish va nusxalash
cat ~/.ssh/github_actions_deploy
```

**Muhim**: Private key'ning to'liq mazmunini qo'shing, shu jumladan:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

### 5. Server'da Git Repository Sozlash

```bash
# Server'ga ulanish
ssh root@209.38.61.156

# Repository'ni klonlash (agar hali klonlanmagan bo'lsa)
cd /var/www/tree-monitor/tree
git clone <your-github-repo-url> .

# Yoki mavjud repository'ni yangilash
cd /var/www/tree-monitor/tree
git remote set-url origin <your-github-repo-url>
```

### 6. GitHub Actions'ni Test Qilish

1. GitHub repository'ga kiring
2. **Actions** tab'ga o'ting
3. **Deploy to Production Server** workflow'ni toping
4. **Run workflow** tugmasini bosing
5. Loglarni kuzating

## Troubleshooting

### "Permission denied (publickey)" xatosi

**Sabab**: SSH key server'ga to'g'ri qo'shilmagan yoki private key noto'g'ri.

**Yechim**:
1. Public key'ni qayta qo'shing:
```bash
cat ~/.ssh/github_actions_deploy.pub | ssh root@209.38.61.156 "cat >> ~/.ssh/authorized_keys"
```

2. Server'da permissions'ni tekshiring:
```bash
ssh root@209.38.61.156
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

3. GitHub Secrets'dagi `SERVER_SSH_KEY` ni qayta tekshiring (to'liq private key bo'lishi kerak)

### "Host key verification failed" xatosi

**Yechim**: Workflow'da `ssh-keyscan` qo'shilgan, bu avtomatik hal qiladi.

### "Connection timeout" xatosi

**Sabab**: Server'ga ulanish mumkin emas.

**Yechim**:
1. Server IP'ni tekshiring: `209.38.61.156`
2. Firewall'ni tekshiring:
```bash
ssh root@209.38.61.156
ufw status
# Agar SSH port ochiq bo'lmasa:
ufw allow 22/tcp
```

### "Repository not found" xatosi

**Sabab**: Server'da repository klonlanmagan yoki path noto'g'ri.

**Yechim**:
```bash
ssh root@209.38.61.156
cd /var/www/tree-monitor/tree
ls -la
# Agar bo'sh bo'lsa:
git clone <your-github-repo-url> .
```

### "Docker compose command not found" xatosi

**Sabab**: Server'da docker-compose o'rnatilmagan.

**Yechim**:
```bash
ssh root@209.38.61.156
apt-get update
apt-get install -y docker-compose
# Yoki
apt-get install -y docker.io docker-compose
```

## Xavfsizlik Eslatmalari

1. ✅ Private key'ni hech qachon Git'ga commit qilmang
2. ✅ GitHub Secrets'da saqlang
3. ✅ Server'da `~/.ssh/authorized_keys` permissions'ni to'g'ri sozlang (600)
4. ✅ SSH key'ga password qo'shing (optional, lekin tavsiya etiladi)
5. ✅ Regular audit qiling (kimlar server'ga kirish huquqiga ega)

## Qo'shimcha Sozlamalar

### SSH Config (Optional)

Local machine'da `~/.ssh/config` faylini yaratish:

```
Host tree-monitor-server
    HostName 209.38.61.156
    User root
    IdentityFile ~/.ssh/github_actions_deploy
    StrictHostKeyChecking no
```

Keyin shunchaki quyidagicha ulanish mumkin:
```bash
ssh tree-monitor-server
```

## Test Qilish

Deploy'ni test qilish uchun:

```bash
# Manual deploy test
ssh -i ~/.ssh/github_actions_deploy root@209.38.61.156 << 'EOF'
cd /var/www/tree-monitor/tree
git pull origin main
cd backend
docker compose -f docker-compose.prod.yml up -d --build
EOF
```

Agar bu ishlasa, GitHub Actions ham ishlaydi!

