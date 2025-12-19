# Favicon va Logo Sozlash Qo'llanmasi

## Kerakli Favicon Fayllari

Quyidagi favicon fayllarini `public/` papkasiga qo'yishingiz kerak:

### Asosiy Faviconlar
1. **favicon.ico** - 16x16 va 32x32 o'lchamlarda (multi-resolution ICO format)
2. **favicon-16x16.png** - 16x16 piksel
3. **favicon-32x32.png** - 32x32 piksel

### Apple Touch Icon
4. **apple-touch-icon.png** - 180x180 piksel (iOS uchun)

### Android Chrome Icons
5. **android-chrome-192x192.png** - 192x192 piksel
6. **android-chrome-512x512.png** - 512x512 piksel

### Microsoft Tiles (ixtiyoriy)
7. **mstile-70x70.png** - 70x70 piksel
8. **mstile-150x150.png** - 150x150 piksel
9. **mstile-310x150.png** - 310x150 piksel
10. **mstile-310x310.png** - 310x310 piksel
11. **mstile-144x144.png** - 144x144 piksel

## Favicon Yaratish Usullari

### 1. Online Tool (Tavsiya etiladi)
- [Favicon.io](https://favicon.io/) - PNG dan barcha formatlarni yaratadi
- [RealFaviconGenerator](https://realfavicongenerator.net/) - To'liq favicon paketini yaratadi
- [Favicon Generator](https://www.favicon-generator.org/)

### 2. LOGO.png dan Yaratish
Agar sizda `LOGO.png` fayli bo'lsa:

1. [Favicon.io](https://favicon.io/favicon-converter/) ga o'ting
2. `LOGO.png` faylini yuklang
3. Barcha kerakli formatlarni yuklab oling
4. `public/` papkasiga qo'ying

### 3. ImageMagick orqali (Terminal)
```bash
# Favicon.ico yaratish (16x16 va 32x32)
convert LOGO.png -resize 16x16 favicon-16x16.png
convert LOGO.png -resize 32x32 favicon-32x32.png
convert favicon-16x16.png favicon-32x32.png favicon.ico

# Apple Touch Icon
convert LOGO.png -resize 180x180 apple-touch-icon.png

# Android Chrome
convert LOGO.png -resize 192x192 android-chrome-192x192.png
convert LOGO.png -resize 512x512 android-chrome-512x512.png
```

### 4. Node.js Script (npm paketlar bilan)
```bash
cd frontend
npm install --save-dev sharp
node scripts/generate-favicons.js
```

## Tekshirish

Faviconlarni tekshirish uchun:
1. Brauzerda `/favicon.ico` ga o'ting
2. [Favicon Checker](https://realfavicongenerator.net/favicon_checker) dan foydalaning
3. [Google Rich Results Test](https://search.google.com/test/rich-results) dan SEO tekshiring

## Eslatmalar

- Barcha faviconlar PNG formatida bo'lishi kerak (favicon.ico bundan mustasno)
- Faviconlar shaffof fon bilan yaxshi ko'rinadi
- Logo markazda bo'lishi kerak
- Kichik o'lchamlarda ham aniq ko'rinishi kerak
