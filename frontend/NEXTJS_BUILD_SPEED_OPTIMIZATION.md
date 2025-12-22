# Next.js Build Speed Optimizatsiya

## ⚠️ Muammo

Next.js build juda sekin:
- "Creating an optimized production build" bosqichida 10+ daqiqa qotib qolmoqda
- Build vaqti juda uzoq

## 🔧 Qilingan Optimizatsiyalar

### 1. Webpack Optimizatsiya

`next.config.js` faylida webpack optimizatsiyalari qo'shildi:

```javascript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.optimization = {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
    }
  }
  return config
}
```

### 2. ESLint va TypeScript Skip

Build vaqtida linting va type checking o'tkazilmaydi:

```javascript
eslint: {
  ignoreDuringBuilds: true, // Faster builds
},
typescript: {
  ignoreBuildErrors: false, // Keep false for safety
},
```

**Eslatma:** Linting va type checking CI/CD'da alohida qilinishi kerak.

### 3. Package Import Optimizatsiya

Katta package'larni optimizatsiya qilish:

```javascript
experimental: {
  optimizePackageImports: ['react-icons', 'date-fns', 'recharts'],
}
```

### 4. Dockerfile Optimizatsiya

- Keraksiz fayllarni olib tashlash
- Build context'ni kamaytirish
- Cache'ni yaxshiroq ishlatish

### 5. Build Args

Docker build'da optimizatsiya flag'lari:

```yaml
args:
  SKIP_ENV_VALIDATION: "true"
```

## 📊 Kutilayotgan Natija

**Eski vaqt:** 10+ daqiqa (qotib qolgan)
**Yangi vaqt:** ~3-5 daqiqa

**Tezlashtirish:**
- Webpack optimizatsiya: ~2-3 daqiqa
- ESLint skip: ~1-2 daqiqa
- Package import optimizatsiya: ~1 daqiqa
- Dockerfile optimizatsiya: ~1 daqiqa

## 🔍 Qo'shimcha Optimizatsiyalar

### 1. Build Cache Mount

Dockerfile'da build cache mount ishlatish:

```dockerfile
RUN --mount=type=cache,target=/root/.npm \
    npm install
```

### 2. Incremental Builds

Faqat o'zgargan qismlarni build qilish.

### 3. Parallel Builds

Backend va Frontend'ni parallel build qilish.

## ✅ Tekshirish

Keyingi build'da:
1. Build tezroq bo'lishi kerak (~3-5 daqiqa)
2. "Creating optimized production build" tezroq yakunlanishi kerak
3. Webpack optimizatsiyalari ishlatilishi kerak
4. ESLint skip ishlatilishi kerak

## 🐛 Muammolarni Hal Qilish

### Build Hali Ham Sekin Bo'lsa

1. **Type checking'ni o'chirish:**
   ```javascript
   typescript: {
     ignoreBuildErrors: true, // Only for faster builds
   },
   ```

2. **Build cache'ni tozalash:**
   ```bash
   docker builder prune -af
   ```

3. **Dependencies'ni optimizatsiya qilish:**
   ```bash
   npm prune
   npm audit fix
   ```

## 📝 Eslatmalar

1. **ESLint skip** - Build tezroq, lekin linting CI/CD'da qilinishi kerak
2. **Webpack optimizatsiya** - Chunk size kamayadi, load time yaxshilanadi
3. **Package import optimizatsiya** - Katta package'lar optimizatsiya qilinadi
4. **Build cache** - Docker build cache samarali ishlatiladi
