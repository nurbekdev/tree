# HTTPS Setup Guide

## 🚀 Tezkor O'rnatish

Server'da quyidagi command'larni bajaring:

```bash
cd /var/www/tree-monitor/tree

# 1. HTTPS sozlash (SSL certificate olish)
sudo bash scripts/setup-https.sh

# 2. Nginx config'ni yangilash (HTTPS bilan)
sudo bash scripts/fix-domain-nginx.sh
```

## 📋 Qadamlarni Batafsil

### 1. Certbot O'rnatish va SSL Certificate Olish

```bash
cd /var/www/tree-monitor/tree
sudo bash scripts/setup-https.sh
```

Bu script:
- ✅ Certbot va Nginx plugin'ni o'rnatadi
- ✅ Port 80 va 443 ni firewall'da ochadi
- ✅ SSL certificate olish uchun Let's Encrypt'ga murojaat qiladi
- ✅ Auto-renewal sozlaydi

**Muhim:** 
- DNS to'g'ri sozlanishi kerak (`nextree.app` → `64.225.20.211`)
- Port 80 internetdan ochiq bo'lishi kerak
- Email manzilini o'zgartirish: `CERTBOT_EMAIL=your@email.com sudo bash scripts/setup-https.sh`

### 2. Nginx Config Yangilash

```bash
sudo bash scripts/fix-domain-nginx.sh
```

Bu script:
- ✅ SSL certificate bor-yo'qligini tekshiradi
- ✅ Agar SSL bor bo'lsa, HTTP dan HTTPS ga redirect qiladi
- ✅ HTTPS server block qo'shadi
- ✅ Security headers qo'shadi

## ✅ Tekshirish

### 1. Browser'da

- `https://nextree.app` - ✅ Ishashi kerak
- `https://www.nextree.app` - ✅ Ishashi kerak
- `http://nextree.app` - ✅ HTTPS ga redirect qilishi kerak
- `http://64.225.20.211` - ✅ ESP8266 uchun HTTP ishlaydi

### 2. Command Line'da

```bash
# HTTPS test
curl -I https://nextree.app

# HTTP redirect test
curl -I http://nextree.app
# Kutilgan: Location: https://nextree.app/...

# SSL certificate tekshirish
sudo certbot certificates
```

## 🔧 Muammolarni Hal Qilish

### SSL Certificate Olinmayapti

**Sabablar:**
1. DNS to'g'ri sozlanmagan
2. Port 80 bloklangan
3. Nginx ishlamayapti

**Yechim:**
```bash
# DNS tekshirish
nslookup nextree.app
# Kutilgan: 64.225.20.211

# Port 80 tekshirish
sudo ufw status | grep 80
sudo ufw allow 80/tcp

# Nginx status
sudo systemctl status nginx
```

### HTTPS Ishlamayapti

**Sabablar:**
1. SSL certificate olinmagan
2. Nginx config xato
3. Port 443 bloklangan

**Yechim:**
```bash
# SSL certificate tekshirish
ls -la /etc/letsencrypt/live/nextree.app/

# Nginx config test
sudo nginx -t

# Port 443 tekshirish
sudo ufw status | grep 443
sudo ufw allow 443/tcp

# Nginx reload
sudo systemctl reload nginx
```

### HTTP HTTPS ga Redirect Qilmayapti

**Yechim:**
```bash
# Nginx config'ni qayta yuklash
sudo bash scripts/fix-domain-nginx.sh

# Nginx reload
sudo systemctl reload nginx
```

## 🔄 SSL Certificate Auto-Renewal

Let's Encrypt sertifikatlari 90 kunda bir yangilanadi. Certbot avtomatik renewal qiladi.

**Tekshirish:**
```bash
# Auto-renewal test
sudo certbot renew --dry-run

# Manual renewal
sudo certbot renew
```

**Cron job (avtomatik):**
Certbot o'zi systemd timer yaratadi:
```bash
sudo systemctl status certbot.timer
```

## 📝 Eslatmalar

1. **ESP8266 uchun IP manzil** - Hardware qurilmalar DNS resolution qila olmaydi, shuning uchun `http://64.225.20.211` ishlatiladi
2. **Frontend HTTPS** - Browser'lar `https://nextree.app` orqali ulanishadi
3. **Auto-renewal** - Certbot avtomatik renewal qiladi, qo'shimcha sozlash kerak emas
4. **Security Headers** - HTTPS config'da security headers qo'shilgan (HSTS, X-Frame-Options, va boshqalar)

## 🔒 Security Best Practices

HTTPS config'da quyidagilar qo'shilgan:
- ✅ TLS 1.2 va 1.3
- ✅ Strong cipher suites
- ✅ HSTS (Strict-Transport-Security)
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
