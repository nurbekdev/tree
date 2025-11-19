# 🚀 SSH Key Tezkor Sozlash

## 1. SSH Key Yaratish

```bash
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy
```

**Muhim**: Password so'ralganda, faqat **Enter** bosing (bo'sh qoldiring)!

## 2. Public Key'ni Server'ga Qo'shish

```bash
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub root@209.38.61.156
```

Parol so'ralganda: `Polatov2004!@#Nur`

## 3. Test Qilish

```bash
# Test script ishlatish
./scripts/test-ssh.sh

# Yoki qo'lda
ssh -i ~/.ssh/github_actions_deploy root@209.38.61.156
```

Agar parol so'ralmasa va muvaffaqiyatli ulansa, keyingi qadamga o'ting!

## 4. GitHub Secrets Qo'shish

### Private Key'ni Ko'rish

```bash
cat ~/.ssh/github_actions_deploy
```

### GitHub'da Sozlash

1. Repository → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** tugmasini bosing
3. Quyidagilarni qo'shing:

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
/var/www/tree-monitor
```

#### SERVER_SSH_KEY
```bash
# Private key'ning TO'LIQ mazmunini qo'shing
cat ~/.ssh/github_actions_deploy
```

**Muhim**: 
- Barcha qatorlarni qo'shing (-----BEGIN dan -----END gacha)
- Hech qanday qatorni o'tkazib yubormang
- Bo'sh joylar va yangi qatorlarni saqlang

## 5. Server'da Repository Sozlash

```bash
ssh root@209.38.61.156

# Repository klonlash (agar hali bo'lsa)
cd /var/www/tree-monitor
git clone <your-github-repo-url> .

# Yoki mavjud repository'ni yangilash
git pull origin main
```

## 6. GitHub Actions'ni Test Qilish

1. GitHub → **Actions** tab
2. **Deploy to Production Server** workflow'ni toping
3. **Run workflow** tugmasini bosing
4. Loglarni kuzating

## ❌ Xatoliklar

### "Permission denied" xatosi

**Yechim 1**: Public key'ni qayta qo'shing
```bash
cat ~/.ssh/github_actions_deploy.pub | ssh root@209.38.61.156 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

**Yechim 2**: Server'da permissions tekshiring
```bash
ssh root@209.38.61.156
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
ls -la ~/.ssh/
```

**Yechim 3**: GitHub Secrets'dagi key'ni tekshiring
- Private key to'liq bo'lishi kerak
- Barcha qatorlar bo'lishi kerak
- Hech qanday qator o'tkazib yuborilmasligi kerak

### "Host key verification failed"

Bu normal, workflow'da avtomatik hal qilinadi.

### "Connection timeout"

Server'ga ulanish mumkin emas. IP'ni tekshiring:
```bash
ping 209.38.61.156
```

## ✅ Muvaffaqiyatli Sozlash

Agar quyidagi test muvaffaqiyatli bo'lsa, hammasi to'g'ri:

```bash
ssh -i ~/.ssh/github_actions_deploy root@209.38.61.156 "echo 'SSH connection successful!'"
```

Bu buyruq parol so'ralmasdan ishlashi kerak!

