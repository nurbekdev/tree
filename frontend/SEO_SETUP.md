# SEO va Favicon Sozlash - To'liq Qo'llanma

## ✅ Nima qilindi

### 1. SEO Metadata (To'liq)
- ✅ Open Graph meta taglar (Facebook, LinkedIn uchun)
- ✅ Twitter Card meta taglar
- ✅ Barcha kerakli meta taglar (description, keywords, author, va boshqalar)
- ✅ Structured Data (JSON-LD) - Google uchun
- ✅ Sitemap.xml avtomatik yaratiladi
- ✅ Robots.txt sozlandi
- ✅ Canonical URL'lar
- ✅ Mobile app meta taglar (PWA uchun)

### 2. Favicon Strukturasi
- ✅ Barcha favicon formatlari uchun metadata sozlandi
- ✅ site.webmanifest yaratildi
- ✅ browserconfig.xml yaratildi (Windows tiles uchun)
- ✅ Favicon generatsiya skripti yaratildi
- ✅ Favicon tekshirish skripti yaratildi

### 3. Logo
- ✅ Logo metadata'ga qo'shildi
- ✅ Open Graph va Twitter Card'da ishlatiladi

## 📋 Keyingi Qadamlar

### 1. Faviconlarni Yaratish

Sizda ikkita variant bor:

#### Variant A: Online Tool (Tavsiya etiladi)
1. [Favicon.io](https://favicon.io/favicon-converter/) ga o'ting
2. `public/LOGO.png` faylini yuklang
3. Barcha formatlarni yuklab oling
4. `public/` papkasiga qo'ying

#### Variant B: Node.js Script
```bash
cd frontend
npm install --save-dev sharp
npm run generate-favicons
```

### 2. Faviconlarni Tekshirish
```bash
npm run check-favicons
```

### 3. Environment Variable Sozlash

`.env` yoki `.env.local` faylida quyidagini qo'shing:
```env
NEXT_PUBLIC_SITE_URL=https://nextree.app
```

**Muhim:** Production'da `nextree.app` ishlatiladi.

### 4. Robots.txt ni Yangilash

`public/robots.txt` faylida sitemap URL yangilandi:
```
Sitemap: https://nextree.app/sitemap.xml
```

## 📁 Kerakli Favicon Fayllari

Quyidagi fayllar `public/` papkasida bo'lishi kerak:

### Asosiy (Majburiy)
- ✅ `favicon.ico` - 16x16 va 32x32
- ✅ `favicon-16x16.png`
- ✅ `favicon-32x32.png`
- ✅ `apple-touch-icon.png` - 180x180
- ✅ `android-chrome-192x192.png`
- ✅ `android-chrome-512x512.png`

### Ixtiyoriy (Microsoft uchun)
- `mstile-70x70.png`
- `mstile-150x150.png`
- `mstile-310x150.png`
- `mstile-310x310.png`
- `mstile-144x144.png`

## 🔍 SEO Tekshirish

### 1. Google Rich Results Test
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- Sizning saytingiz URL'ini kiriting
- Structured Data to'g'ri ishlayotganini tekshiring

### 2. Facebook Sharing Debugger
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- Open Graph taglarini tekshiring

### 3. Twitter Card Validator
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- Twitter Card'lar to'g'ri ishlayotganini tekshiring

### 4. Favicon Checker
- [RealFaviconGenerator Favicon Checker](https://realfavicongenerator.net/favicon_checker)
- Barcha faviconlarni tekshiring

## 📝 Metadata Tafsilotlari

### Title
- Asosiy: "Dala Qo'riqchisi - Aqlli Daraxt Monitoring Tizimi"
- Template: "%s | Dala Qo'riqchisi" (har bir sahifa uchun)

### Description
"Aqlli qishloq xo'jaligi daraxt monitoring tizimi. Harorat, namlik, tutun va kesilish holatini real vaqtda kuzatish. ESP8266 asosida qurilgan IoT tizim."

### Keywords
- daraxt monitoring
- aqlli qishloq xo'jaligi
- IoT
- ESP8266
- sensor monitoring
- real-time monitoring
- va boshqalar...

## 🎨 Theme Colors

- **Theme Color:** `#1e5f3f` (yashil rang)
- **MS Tile Color:** `#1e5f3f`

## 📱 PWA Sozlamalari

- ✅ Mobile web app capable
- ✅ Apple mobile web app
- ✅ Standalone display mode
- ✅ Theme color sozlandi

## 🚀 Production Deployment

Production'ga deploy qilishdan oldin:

1. ✅ Barcha faviconlarni yaratish
2. ✅ `NEXT_PUBLIC_SITE_URL` ni sozlash
3. ✅ `robots.txt` da sitemap URL'ni yangilash
4. ✅ Faviconlarni tekshirish (`npm run check-favicons`)
5. ✅ Build qilish va test qilish

## 📚 Qo'shimcha Ma'lumot

- `public/FAVICON_GUIDE.md` - Favicon yaratish qo'llanmasi
- `scripts/generate-favicons.js` - Favicon generatsiya skripti
- `scripts/check-favicons.js` - Favicon tekshirish skripti

## ⚠️ Eslatmalar

1. **Domain URL:** `NEXT_PUBLIC_SITE_URL` production'da `https://nextree.app` ga sozlangan
2. **Logo:** Agar `LOGO.png` o'lchami katta bo'lsa, Open Graph uchun 1200x630 o'lchamda versiyasini yarating
3. **Faviconlar:** Barcha faviconlar PNG formatida bo'lishi kerak (favicon.ico bundan mustasno)
4. **Sitemap:** Next.js avtomatik `/sitemap.xml` yaratadi

## ✅ Tekshirish Ro'yxati

- [ ] Barcha faviconlar yaratildi
- [x] `NEXT_PUBLIC_SITE_URL` sozlandi (`https://nextree.app`)
- [x] `robots.txt` da sitemap URL yangilandi
- [ ] Faviconlar tekshirildi (`npm run check-favicons`)
- [ ] Google Rich Results Test o'tkazildi
- [ ] Facebook Sharing Debugger'da tekshirildi
- [ ] Twitter Card Validator'da tekshirildi
- [ ] Production build qilindi va test qilindi
