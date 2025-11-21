# 🔧 404 "Not Found" Muammosini Tuzatish

## Muammo
Root route (`/`) 404 qaytaryapti, lekin boshqa route'lar (`/login`, `/dashboard`) ishlayapti.

## Sabab
Next.js root route client-side redirect qilmoqda, bu production build'da to'g'ri ishlamaydi.

## Yechim

### 1. Frontend'ni qayta build qilish

Server'da quyidagi buyruqlarni bajaring:

```bash
cd /var/www/tree-monitor/tree/backend

# Frontend container'ni to'xtatish
docker compose -f docker-compose.prod.yml stop frontend

# Frontend'ni qayta build qilish (yangi kod bilan)
docker compose -f docker-compose.prod.yml build --no-cache frontend

# Frontend'ni ishga tushirish
docker compose -f docker-compose.prod.yml up -d frontend

# Loglarni kuzatish
docker compose -f docker-compose.prod.yml logs -f frontend
```

### 2. Tekshirish

```bash
# 10-15 soniya kutib turing (build uchun)
sleep 15

# Root route'ni tekshirish
curl -I http://127.0.0.1:3001/
curl -I http://64.225.20.211/

# Login route'ni tekshirish
curl -I http://64.225.20.211/login
```

### 3. Agar hali ham 404 bo'lsa

Next.js config'da redirect qo'shildi. Agar hali ham ishlamasa:

```bash
# Frontend container loglarini ko'rish
docker compose -f docker-compose.prod.yml logs frontend --tail=100

# Container ichiga kirish va tekshirish
docker exec -it tree-monitor-frontend-prod sh
# Container ichida:
ps aux | grep node
netstat -tuln | grep 3001
```

### 4. To'liq qayta deploy

Agar yuqoridagi qadamlardan keyin hali ham muammo bo'lsa:

```bash
cd /var/www/tree-monitor/tree

# Git'dan yangi kodni olish
git pull origin main

# To'liq qayta deploy
cd backend
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Nginx'ni qayta sozlash
cd ..
./scripts/fix-nginx.sh
```

## O'zgarishlar

1. ✅ `frontend/app/page.js` - Loading state qo'shildi
2. ✅ `frontend/next.config.js` - Root route redirect qo'shildi
3. ✅ `scripts/fix-nginx.sh` - Nginx konfiguratsiyasi yaxshilandi

## Keyingi qadamlar

1. O'zgarishlarni GitHub'ga push qiling
2. Server'da frontend'ni qayta build qiling (yuqoridagi qadamlarni bajaring)
3. Tekshiring: `http://64.225.20.211/` endi `/login` ga redirect qilishi kerak

## Eslatma

Agar root route hali ham 404 qaytarsa, bu Next.js build muammosi bo'lishi mumkin. Bunda:
- Frontend container loglarini tekshiring
- Container ichida Next.js to'g'ri ishlayotganligini tekshiring
- Build jarayonida xatolik bo'lmaganligini tekshiring

