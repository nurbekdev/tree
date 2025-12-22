# Next.js Build Timeout Optimizatsiya

## ⚠️ Muammo

Next.js build timeout:
```
⚠ Sending SIGTERM signal to static worker due to timeout of 60 seconds.
```

Bu Next.js'ning static page generation juda uzoq vaqt olayotganini anglatadi.

## 🔧 Qilingan Optimizatsiyalar

### 1. Next.js Config Optimizatsiya

`frontend/next.config.js` faylida:

```javascript
// Increase static generation timeout (default is 60s)
staticPageGenerationTimeout: 300, // 5 minutes

// Optimize build
experimental: {
  optimizeCss: true,
}
```

### 2. Dockerfile Optimizatsiya

`frontend/Dockerfile` faylida:

```dockerfile
# Increase Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED=1
```

### 3. Docker Build Timeout

GitHub Actions workflow'da:

```yaml
# Frontend build timeout: 15 daqiqa (900s)
timeout 900 docker compose build frontend
```

## 📊 Kutilayotgan Natija

**Eski vaqt:** Build timeout (60s)
**Yangi vaqt:** ~5-10 daqiqa (timeout: 15 daqiqa)

## 🔍 Qo'shimcha Optimizatsiyalar

### 1. Build Cache

Docker build cache ishlatiladi:
- Dependencies cache
- Source code cache
- Build artifacts cache

### 2. Memory Limit

Node.js memory limit oshirildi:
- Default: ~1.5GB
- Yangi: 4GB (`--max-old-space-size=4096`)

### 3. Static Generation Timeout

Next.js static generation timeout:
- Default: 60s
- Yangi: 300s (5 daqiqa)

## 🐛 Muammolarni Hal Qilish

### Build Hali Ham Timeout Bo'lsa

1. **Memory limit'ni yanada oshirish:**
   ```dockerfile
   ENV NODE_OPTIONS="--max-old-space-size=6144"  # 6GB
   ```

2. **Static generation'ni o'chirish:**
   ```javascript
   // next.config.js
   output: 'standalone', // Already enabled
   generateStaticParams: false, // If using dynamic routes
   ```

3. **Build'ni qismlarga bo'lish:**
   - Faqat kerakli page'larni build qilish
   - Dynamic routes'ni kamaytirish

### Build Juda Sekin Bo'lsa

1. **Dependencies'ni optimizatsiya qilish:**
   ```bash
   npm audit fix
   npm prune
   ```

2. **Build cache'ni tozalash:**
   ```bash
   rm -rf .next
   npm run build
   ```

3. **Docker build cache'ni tozalash:**
   ```bash
   docker builder prune -af
   ```

## ✅ Tekshirish

Keyingi build'da:
1. Build timeout bo'lmasligi kerak
2. Build vaqti ~5-10 daqiqa bo'lishi kerak
3. Memory limit yetarli bo'lishi kerak
4. Static generation muvaffaqiyatli bo'lishi kerak
