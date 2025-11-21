# 🔧 SSH Connection Troubleshooting

## Xatolik: "Permission denied (publickey,password)"

Bu xatolik SSH key to'g'ri sozlanmaganligini ko'rsatadi.

## ✅ Tezkor Yechim

### 1-qadam: SSH Key'ni Qayta Yaratish

```bash
# Eski key'ni o'chirish (agar mavjud bo'lsa)
rm ~/.ssh/github_actions_deploy*

# Yangi key yaratish
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy -N ""
```

**Muhim**: `-N ""` flag'i password bo'sh qoldiradi.

### 2-qadam: Public Key'ni Server'ga Qo'shish

```bash
# Usul 1: ssh-copy-id (Tavsiya etiladi)
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub root@209.38.61.156

# Parol so'ralganda: Polatov2004!@#Nur
```

Agar `ssh-copy-id` ishlamasa:

```bash
# Usul 2: Qo'lda
cat ~/.ssh/github_actions_deploy.pub | ssh root@209.38.61.156 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

### 3-qadam: Server'da Permissions Tekshirish

```bash
ssh root@209.38.61.156
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
ls -la ~/.ssh/
```

Quyidagicha ko'rinishi kerak:
```
drwx------ 2 root root 4096 ... .ssh
-rw------- 1 root root  ... authorized_keys
```

### 4-qadam: Local Test

```bash
# Test qilish (parol so'ralmasligi kerak!)
ssh -i ~/.ssh/github_actions_deploy root@209.38.61.156 "echo 'Success!'"
```

Agar bu ishlasa, keyingi qadamga o'ting!

### 5-qadam: GitHub Secrets'ni Qayta Sozlash

1. **Private Key'ni Ko'rish**:
```bash
cat ~/.ssh/github_actions_deploy
```

2. **GitHub'da**:
   - Repository → Settings → Secrets → Actions
   - `SERVER_SSH_KEY` ni o'chirib, qayta qo'shing
   - **To'liq private key** ni qo'shing (-----BEGIN dan -----END gacha)

**Muhim**: 
- Barcha qatorlarni qo'shing
- Hech qanday qatorni o'tkazib yubormang
- Bo'sh joylar va yangi qatorlarni saqlang

## 🔍 Qo'shimcha Tekshiruvlar

### SSH Key Format Tekshirish

```bash
# Key'ning birinchi qatorini ko'rish
head -1 ~/.ssh/github_actions_deploy

# Quyidagicha bo'lishi kerak:
# -----BEGIN OPENSSH PRIVATE KEY-----
# yoki
# -----BEGIN RSA PRIVATE KEY-----
```

### Server'da Public Key Tekshirish

```bash
ssh root@209.38.61.156 "cat ~/.ssh/authorized_keys | grep github-actions"
```

Agar hech narsa ko'rinmasa, public key qo'shilmagan.

### SSH Verbose Mode

```bash
# Batafsil loglar bilan test
ssh -vvv -i ~/.ssh/github_actions_deploy root@209.38.61.156
```

Bu batafsil xatolik ma'lumotlarini ko'rsatadi.

## 🆘 Alternative Yechimlar

### Usul 1: Password Authentication (Vaqtinchalik)

Agar SSH key ishlamasa, vaqtinchalik password authentication ishlatish mumkin:

```yaml
# .github/workflows/deploy.yml da
- name: Deploy to server
  run: |
    sshpass -p "${{ secrets.SERVER_PASSWORD }}" \
      ssh -o StrictHostKeyChecking=no \
      ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} \
      "cd ${{ secrets.SERVER_PATH }} && git pull"
```

**Muhim**: Bu xavfsiz emas! Faqat test uchun.

### Usul 2: Deploy Key (GitHub)

1. GitHub → Settings → Deploy keys
2. New deploy key qo'shing
3. Public key'ni qo'shing
4. "Allow write access" ni yoqing

## ✅ Muvaffaqiyatli Sozlash Tekshiruvi

Quyidagi buyruq muvaffaqiyatli ishlashi kerak:

```bash
./scripts/test-ssh.sh 209.38.61.156 root ~/.ssh/github_actions_deploy
```

Yoki qo'lda:

```bash
ssh -i ~/.ssh/github_actions_deploy \
  -o StrictHostKeyChecking=no \
  -o BatchMode=yes \
  root@209.38.61.156 \
  "cd /var/www/tree-monitor/tree && pwd && ls -la"
```

## 📞 Yordam

Agar hali ham muammo bo'lsa:

1. `GITHUB_ACTIONS_SETUP.md` faylini ko'ring
2. `SSH_SETUP_QUICK.md` faylini ko'ring
3. GitHub Actions loglarini batafsil ko'ring

