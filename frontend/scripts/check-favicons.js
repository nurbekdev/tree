/**
 * Favicon Checker Script
 * 
 * Bu script barcha kerakli favicon fayllarining mavjudligini tekshiradi.
 * 
 * Ishlatish:
 * node scripts/check-favicons.js
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// Kerakli favicon fayllari
const requiredFavicons = [
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
];

// Ixtiyoriy favicon fayllari
const optionalFavicons = [
  'mstile-70x70.png',
  'mstile-150x150.png',
  'mstile-310x150.png',
  'mstile-310x310.png',
  'mstile-144x144.png',
];

// Boshqa kerakli fayllar
const otherFiles = [
  'site.webmanifest',
  'browserconfig.xml',
  'LOGO.png',
];

console.log('🔍 Favicon fayllarini tekshiryapman...\n');

let allGood = true;
let missingRequired = [];
let missingOptional = [];
let missingOther = [];

// Kerakli faviconlarni tekshirish
console.log('📋 Kerakli faviconlar:');
requiredFavicons.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`  ✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`  ❌ ${file} - TOPILMADI`);
    missingRequired.push(file);
    allGood = false;
  }
});

// Ixtiyoriy faviconlarni tekshirish
console.log('\n📋 Ixtiyoriy faviconlar:');
optionalFavicons.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`  ✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`  ⚠️  ${file} - Topilmadi (ixtiyoriy)`);
    missingOptional.push(file);
  }
});

// Boshqa fayllarni tekshirish
console.log('\n📋 Boshqa kerakli fayllar:');
otherFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`  ✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`  ❌ ${file} - TOPILMADI`);
    missingOther.push(file);
    if (file !== 'LOGO.png') {
      allGood = false;
    }
  }
});

// Natijalar
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✨ Barcha kerakli faviconlar mavjud!');
} else {
  console.log('❌ Ba\'zi faviconlar topilmadi.\n');
  
  if (missingRequired.length > 0) {
    console.log('⚠️  Kerakli faviconlar:');
    missingRequired.forEach(file => {
      console.log(`   - ${file}`);
    });
    console.log('\n💡 Faviconlarni yaratish uchun:');
    console.log('   npm run generate-favicons');
    console.log('   yoki');
    console.log('   public/FAVICON_GUIDE.md faylini o\'qing\n');
  }
  
  if (missingOther.length > 0) {
    console.log('⚠️  Boshqa kerakli fayllar:');
    missingOther.forEach(file => {
      console.log(`   - ${file}`);
    });
  }
}

if (missingOptional.length > 0) {
  console.log('\n💡 Ixtiyoriy faviconlar (Microsoft Tiles):');
  missingOptional.forEach(file => {
    console.log(`   - ${file}`);
  });
  console.log('   Bu fayllar Windows tiles uchun ishlatiladi.');
}

console.log('\n' + '='.repeat(50));

process.exit(allGood ? 0 : 1);
