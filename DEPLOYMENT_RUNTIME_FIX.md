# Deployment Runtime Error Fix

## ⚠️ Muammo

Deployment paytida runtime error'lar:
- Docker Compose `--progress` flag ogohlantirishlari
- `COMPOSE_BAKE=true` to'g'ri ishlatilmayapti
- Runtime error'lar

## 🔧 Qilingan Optimizatsiyalar

### 1. Docker Compose Command Optimizatsiya

**Eski (xato):**
```bash
docker compose -f docker-compose.prod.yml --progress=plain build
```

**Yangi (to'g'ri):**
```bash
docker compose --progress=plain -f docker-compose.prod.yml build
```

`--progress` flag global flag bo'lishi kerak va `-f` flag'dan oldin yozilishi kerak.

### 2. COMPOSE_BAKE=true

`COMPOSE_BAKE=true` export qilingan va to'g'ri ishlatilmoqda:
- BuildKit'ning to'liq imkoniyatlaridan foydalanadi
- Tezroq build
- Yaxshiroq cache

### 3. Error Handling Yaxshilandi

```bash
set -e              # Exit on error
set -o pipefail      # Pipe error handling
```

Qo'shimcha tekshiruvlar:
- `docker-compose.prod.yml` fayli mavjudligini tekshirish
- Directory mavjudligini tekshirish
- Service health check'lar yaxshilandi

### 4. Service Health Check

**Eski:**
- 5 marta retry
- 1 soniya delay

**Yangi:**
- 10 marta retry
- 2 soniya delay
- Container log'larni ko'rsatish (agar muammo bo'lsa)

## 📊 Kutilayotgan Natija

**Eski:** Runtime error'lar, ogohlantirishlar
**Yangi:** To'liq ishlaydigan deployment, error handling

## ✅ Qilingan O'zgarishlar

1. **Docker Compose command'lar to'g'rilandi**
   - `--progress` flag global qilib ishlatiladi
   - Flag'lar to'g'ri tartibda

2. **Error handling yaxshilandi**
   - `set -e` va `set -o pipefail`
   - Directory va file tekshiruvlari
   - Better error messages

3. **Service health check yaxshilandi**
   - 10 retry (eski: 5)
   - 2s delay (eski: 1s)
   - Container log'lar ko'rsatiladi

4. **COMPOSE_BAKE to'g'ri ishlatiladi**
   - Export qilingan
   - BuildKit optimizatsiyalari ishlatiladi

## 🔍 Tekshirish

Keyingi deployment'da:
1. `--progress` ogohlantirishlari yo'qolishi kerak
2. Build tezroq bo'lishi kerak
3. Runtime error'lar bo'lmasligi kerak
4. Service health check'lar to'g'ri ishlashi kerak

## 🐛 Muammolarni Hal Qilish

### Hali Ham Runtime Error Bo'lsa

1. **Docker Compose versiyasini tekshirish:**
   ```bash
   docker compose version
   ```

2. **BuildKit'ni tekshirish:**
   ```bash
   echo $DOCKER_BUILDKIT
   echo $COMPOSE_BAKE
   ```

3. **Container log'larni ko'rish:**
   ```bash
   docker compose -f docker-compose.prod.yml logs
   ```

4. **Service status'ni tekshirish:**
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```

## 📝 Eslatmalar

1. **--progress flag** - Global flag, `-f` flag'dan oldin yozilishi kerak
2. **COMPOSE_BAKE** - BuildKit optimizatsiyalari uchun
3. **Error handling** - `set -e` va `set -o pipefail` muhim
4. **Health check** - Service'lar to'liq ishga tushganini tekshirish
