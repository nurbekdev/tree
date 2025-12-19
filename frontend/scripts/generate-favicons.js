/**
 * Favicon Generator Script
 * 
 * Bu script LOGO.png faylidan barcha kerakli favicon formatlarini yaratadi.
 * 
 * Talablar:
 * npm install --save-dev sharp
 * 
 * Ishlatish:
 * node scripts/generate-favicons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const logoPath = path.join(publicDir, 'LOGO.png');

// Favicon o'lchamlari
const faviconSizes = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512,
  'mstile-70x70.png': 70,
  'mstile-150x150.png': 150,
  'mstile-310x150.png': { width: 310, height: 150 },
  'mstile-310x310.png': 310,
  'mstile-144x144.png': 144,
};

async function generateFavicons() {
  // LOGO.png faylini tekshirish
  if (!fs.existsSync(logoPath)) {
    console.error('❌ LOGO.png fayli topilmadi:', logoPath);
    console.log('Iltimos, LOGO.png faylini public/ papkasiga qo\'ying.');
    process.exit(1);
  }

  console.log('✅ LOGO.png topildi. Faviconlar yaratilmoqda...\n');

  // Har bir o'lcham uchun favicon yaratish
  for (const [filename, size] of Object.entries(faviconSizes)) {
    const outputPath = path.join(publicDir, filename);
    
    try {
      if (typeof size === 'object') {
        // Rectangular favicon (mstile-310x150)
        await sharp(logoPath)
          .resize(size.width, size.height, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .png()
          .toFile(outputPath);
        console.log(`✅ ${filename} yaratildi (${size.width}x${size.height})`);
      } else {
        // Square favicon
        await sharp(logoPath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .png()
          .toFile(outputPath);
        console.log(`✅ ${filename} yaratildi (${size}x${size})`);
      }
    } catch (error) {
      console.error(`❌ ${filename} yaratishda xatolik:`, error.message);
    }
  }

  // favicon.ico yaratish (16x16 va 32x32 dan)
  try {
    const favicon16 = await sharp(path.join(publicDir, 'favicon-16x16.png')).toBuffer();
    const favicon32 = await sharp(path.join(publicDir, 'favicon-32x32.png')).toBuffer();
    
    // ICO formatini yaratish uchun oddiy PNG dan foydalanish
    // Haqiqiy ICO format uchun ico-convert paketidan foydalanish kerak
    // Hozircha 32x32 PNG ni favicon.ico sifatida nusxalash
    fs.copyFileSync(
      path.join(publicDir, 'favicon-32x32.png'),
      path.join(publicDir, 'favicon.ico')
    );
    console.log('✅ favicon.ico yaratildi (favicon-32x32.png dan)');
  } catch (error) {
    console.error('❌ favicon.ico yaratishda xatolik:', error.message);
  }

  console.log('\n✨ Barcha faviconlar muvaffaqiyatli yaratildi!');
  console.log('📁 Fayllar:', publicDir);
}

// Scriptni ishga tushirish
generateFavicons().catch(error => {
  console.error('❌ Xatolik:', error);
  process.exit(1);
});
