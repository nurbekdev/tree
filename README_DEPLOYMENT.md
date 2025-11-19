# 🚀 Production Deployment Guide

Bu loyiha DigitalOcean server'ga deploy qilish uchun to'liq sozlangan.

## ⚡ Tezkor Boshlash

### 1. Server'ga ulanish

```bash
ssh root@209.38.61.156
# Password: Polatov2004!@#Nur
```

### 2. Server setup

```bash
# Setup script'ni yuklash
scp scripts/setup-server.sh root@209.38.61.156:/root/

# Server'da ishga tushirish
ssh root@209.38.61.156
chmod +x setup-server.sh
./setup-server.sh
```

### 3. Repository'ni klonlash

```bash
cd /var/www/tree-monitor
git clone <your-github-repo-url> .
```

### 4. Environment sozlash

```bash
cd backend
cp env.example .env
nano .env
```

`.env` faylida quyidagilarni sozlang:

```env
DB_PASSWORD=<kuchli-parol>
API_KEY=26a826cbadeb499a604e69cbb34c3d6b84edb23e2bacc282732db8f576255af0
JWT_SECRET=<openssl-rand-hex-32-bilan-yaratilgan>
```

### 5. Application'ni ishga tushirish

```bash
docker compose -f docker-compose.prod.yml up -d
```

## 🔄 GitHub Actions CI/CD

### SSH Key yaratish

```bash
ssh-keygen -t rsa -b 4096 -C "deploy@tree-monitor" -f ~/.ssh/deploy_key
```

### Server'ga SSH key qo'shish

```bash
ssh-copy-id -i ~/.ssh/deploy_key.pub root@209.38.61.156
```

### GitHub Secrets qo'shish

GitHub repository → Settings → Secrets and variables → Actions

Quyidagi secret'larni qo'shing:

- **SERVER_HOST**: `209.38.61.156`
- **SERVER_USER**: `root`
- **SERVER_PATH**: `/var/www/tree-monitor`
- **SERVER_SSH_KEY**: `~/.ssh/deploy_key` faylning to'liq mazmuni

```bash
cat ~/.ssh/deploy_key
```

### Avtomatik Deploy

Endi har safar `main` yoki `master` branch'ga push qilganda, avtomatik deploy bo'ladi!

## 📍 API Endpoints

Deploy qilingandan keyin:

- **API**: `http://64.225.20.211/api`
- **Health Check**: `http://64.225.20.211/health`

## 🔧 Base Station Firmware

Base station firmware'da `BACKEND_URL` ni yangilash:

```cpp
const char* BACKEND_URL = "http://64.225.20.211";
```

## 📊 Monitoring

### Status tekshirish

```bash
docker compose -f docker-compose.prod.yml ps
```

### Loglar

```bash
# Backend loglar
docker compose -f docker-compose.prod.yml logs -f backend

# Database loglar
docker compose -f docker-compose.prod.yml logs -f postgres
```

## 🔒 Xavfsizlik

1. ✅ Kuchli parollar ishlatish
2. ✅ SSL sozlash (certbot)
3. ✅ Firewall yoqish (ufw)
4. ✅ Regular updates

## 📝 Batafsil ma'lumot

Batafsil qo'llanma uchun `DEPLOYMENT.md` faylini ko'ring.

