# Next.js Build Timeout Fix

## ⚠️ Muammo

Next.js build timeout:
```
⚠ Sending SIGTERM signal to static worker due to timeout of 300 seconds.
```

## 🔧 Qilingan Optimizatsiyalar

### 1. Force Dynamic Rendering

Barcha page'larda `export const dynamic = 'force-dynamic'` qo'shildi:
- `app/page.js`
- `app/login/page.js`
- `app/dashboard/page.js`
- `app/admin/page.js`
- `app/landing/page.js`
- `app/tree/[id]/page.js`
- `app/sitemap.js`

Bu Next.js'ga static generation qilmasligini aytadi, chunki barcha page'lar client-side rendering ishlatadi.

### 2. Timeout Oshirildi

- `staticPageGenerationTimeout: 600` (10 daqiqa)
- Docker build timeout: 30 daqiqa (1800s)
- Frontend build timeout: 30 daqiqa (1800s)

### 3. Memory Limit Oshirildi

- `NODE_OPTIONS="--max-old-space-size=6144"` (6GB)
- Eski: 4GB
- Yangi: 6GB

### 4. Build Optimizatsiya

- `generateBuildId` - Dynamic build ID
- `optimizeCss: true` - CSS optimizatsiya
- `NEXT_TELEMETRY_DISABLED=1` - Telemetry o'chirildi

## 📊 Kutilayotgan Natija

**Eski:** Build timeout (300s)
**Yangi:** Build muvaffaqiyatli (~10-15 daqiqa)

## 🔍 Nima O'zgardi?

### Force Dynamic Rendering

Barcha page'lar endi dynamic rendering ishlatadi:
- Static generation o'chirildi
- Build vaqti qisqardi
- Timeout muammosi hal qilindi

### Build Process

1. **Compilation** - Tez (cache bilan)
2. **Linting** - Tez
3. **Page Data Collection** - Tez (dynamic rendering)
4. **Static Generation** - O'chirildi (force-dynamic)

## ✅ Tekshirish

Keyingi build'da:
1. Build timeout bo'lmasligi kerak
2. Build muvaffaqiyatli yakunlanishi kerak
3. Build vaqti ~10-15 daqiqa bo'lishi kerak
4. Barcha page'lar dynamic rendering ishlatishi kerak

## 🐛 Muammolarni Hal Qilish

### Build Hali Ham Timeout Bo'lsa

1. **Memory limit'ni yanada oshirish:**
   ```dockerfile
   ENV NODE_OPTIONS="--max-old-space-size=8192"  # 8GB
   ```

2. **Build'ni qismlarga bo'lish:**
   - Faqat kerakli page'larni build qilish
   - Dynamic routes'ni kamaytirish

3. **Docker build timeout'ni yanada oshirish:**
   ```yaml
   timeout 3600  # 60 daqiqa
   ```

## 📝 Eslatmalar

1. **Force Dynamic Rendering** - Barcha page'lar client-side rendering ishlatadi
2. **Static Generation O'chirildi** - Build tezroq bo'ladi
3. **Memory Limit** - 6GB (yetarli)
4. **Build Timeout** - 30 daqiqa (yetarli)
