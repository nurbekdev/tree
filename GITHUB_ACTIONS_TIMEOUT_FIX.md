# GitHub Actions Timeout Fix

## ⚠️ Muammo

GitHub Actions deployment timeout:
```
Error: The action 'Deploy to server' has timed out after 15 minutes.
```

Next.js build juda uzoq vaqt olmoqda va 15 daqiqada timeout bo'lyapti.

## 🔧 Qilingan Optimizatsiyalar

### 1. Timeout Oshirildi

**Job timeout:**
- Eski: 15 daqiqa
- Yangi: **45 daqiqa**

**Deploy step timeout:**
- Eski: 15 daqiqa  
- Yangi: **40 daqiqa**

### 2. SSH Connection Keep-Alive

SSH connection'ni uzoq vaqt saqlash uchun:
```bash
-o ServerAliveInterval=15
-o ServerAliveCountMax=30
-o TCPKeepAlive=yes
```

### 3. Docker Build Timeout

Docker build timeout oshirildi:
```bash
export COMPOSE_HTTP_TIMEOUT=2400  # 40 daqiqa
export DOCKER_CLIENT_TIMEOUT=2400  # 40 daqiqa
```

### 4. Build Progress Monitoring

Build progress'ni ko'rsatish:
- Build start vaqti
- Build completion vaqti
- Progress log'lar

## 📊 Kutilayotgan Natija

**Eski:** 15 daqiqada timeout
**Yangi:** 40 daqiqa timeout, build uchun yetarli vaqt

## ✅ Qilingan O'zgarishlar

1. **Job timeout: 45 daqiqa** - Butun workflow uchun
2. **Deploy step timeout: 40 daqiqa** - Deployment uchun
3. **SSH keep-alive** - Connection'ni saqlash
4. **Docker timeout** - Build uchun 40 daqiqa

## 🔍 Tekshirish

Keyingi deployment'da:
1. Timeout 40 daqiqa bo'lishi kerak
2. Build to'liq yakunlanishi kerak
3. SSH connection saqlanishi kerak

## 🐛 Muammolarni Hal Qilish

### Hali Ham Timeout Bo'lsa

1. **GitHub Actions cache'ni tozalash:**
   - Settings → Actions → Clear cache

2. **Workflow'ni qayta ishga tushirish:**
   - Actions → Workflow → Re-run all jobs

3. **Build'ni tezlashtirish:**
   - Docker cache'ni ishlatish
   - Next.js build optimizatsiyalari
   - Keraksiz dependency'larni olib tashlash

4. **Server'da build qilish:**
   - GitHub Actions o'rniga server'da to'g'ridan-to'g'ri build qilish
   - CI/CD'ni soddalashtirish

## 📝 Eslatmalar

1. **Timeout** - GitHub Actions'da maksimal 360 daqiqa (6 soat)
2. **SSH keep-alive** - Uzoq build'lar uchun muhim
3. **Docker timeout** - Build uchun yetarli vaqt kerak
4. **Build progress** - Progress'ni ko'rsatish foydali

## 🔗 Qo'shimcha Optimizatsiyalar

### 1. Build Cache

Docker build cache'ni ishlatish:
```bash
docker compose build --build-arg BUILDKIT_INLINE_CACHE=1
```

### 2. Parallel Builds

Backend va Frontend'ni parallel build qilish (agar mumkin bo'lsa):
```bash
docker compose build backend frontend
```

### 3. Incremental Builds

Faqat o'zgargan qismlarni build qilish.
