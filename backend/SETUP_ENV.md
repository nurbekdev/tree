# Environment Variables Setup

## API_KEY va JWT_SECRET yaratish

Bu key'lar sizning tizimingiz uchun maxfiy kalitlardir. Ularni o'zingiz yaratishingiz kerak.

### 1-usul: Node.js orqali (Tavsiya etiladi)

```bash
cd backend
node -e "console.log('API_KEY=' + require('crypto').randomBytes(32).toString('hex')); console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'));"
```

Bu buyruq ikkita random key yaratadi va ko'rsatadi.

### 2-usul: Online generator

Quyidagi saytlardan foydalanishingiz mumkin:
- https://randomkeygen.com/
- https://www.lastpass.com/features/password-generator

**API_KEY** uchun: kamida 32 belgi uzunlikdagi random string
**JWT_SECRET** uchun: kamida 64 belgi uzunlikdagi random string

### 3-usul: Qo'lda yaratish

Har qanday random belgilar kombinatsiyasini ishlatishingiz mumkin:
- API_KEY: `my-secret-api-key-12345-abcdef`
- JWT_SECRET: `my-super-secret-jwt-key-12345-abcdef-xyz`

## .env faylini yaratish

1. `backend/env.example` faylini ko'ring
2. `backend/.env` faylini yarating (`.env.example` dan nusxa oling)
3. `API_KEY` va `JWT_SECRET` ni o'zingiz yaratgan qiymatlar bilan to'ldiring

### Misol:

```bash
cd backend
cp env.example .env
```

Keyin `.env` faylini ochib, quyidagilarni o'zgartiring:

```
API_KEY=your-generated-api-key-here
JWT_SECRET=your-generated-jwt-secret-here
```

## Muhim eslatmalar:

1. **Hech qachon `.env` faylini Git'ga commit qilmang!**
2. Production'da har doim kuchli random key'lar ishlating
3. Har bir muhit (development, production) uchun alohida key'lar yarating
4. Key'larni xavfsiz joyda saqlang

