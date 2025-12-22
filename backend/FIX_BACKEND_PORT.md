# Backend Port 3000 Muammosini Hal Qilish

## ⚠️ Muammo

`http://64.225.20.211:3000` ga ulanib bo'lmayapti - **ERR_CONNECTION_REFUSED**

Bu backend port 3000'da ishlamayotganini yoki ochiq emasligini anglatadi.

## 🔧 Yechim

### 1. Backend Container Status Tekshirish

```bash
# Container status
docker ps -a | grep backend

# Agar container ishlamayotgan bo'lsa:
cd backend
docker compose -f docker-compose.prod.yml up -d backend
```

### 2. Port 3000 Ochikligini Tekshirish

```bash
# Port 3000'da nima ishlayotganini ko'rish
sudo netstat -tuln | grep 3000

# yoki
sudo ss -tuln | grep 3000

# yoki
sudo lsof -i :3000
```

**Kutilgan natija:**
```
tcp  0  0 0.0.0.0:3000  0.0.0.0:*  LISTEN
```

Agar port ochiq bo'lmasa, docker-compose'ni tekshiring.

### 3. Docker Compose Port Mapping

`backend/docker-compose.prod.yml` faylida quyidagilar bo'lishi kerak:

```yaml
ports:
  - "0.0.0.0:3000:3000"  # Tashqi tarmoqdan ochiq
```

**Muhim:** `127.0.0.1:3000:3000` emas, `0.0.0.0:3000:3000` bo'lishi kerak!

### 4. Backend'ni Qayta Ishga Tushirish

```bash
cd backend

# Container'ni to'xtatish
docker compose -f docker-compose.prod.yml down

# Container'ni qayta ishga tushirish
docker compose -f docker-compose.prod.yml up -d

# Loglarni kuzatish
docker logs -f tree-monitor-api-prod
```

### 5. Backend Loglarini Tekshirish

```bash
# Backend loglari
docker logs tree-monitor-api-prod

# Real-time loglar
docker logs -f tree-monitor-api-prod
```

Kutilgan xabar:
```
Server running on port 3000
```

### 6. Health Check

```bash
# Server'dan
curl http://localhost:3000/health

# Tashqi tarmoqdan (boshqa kompyuterdan)
curl http://64.225.20.211:3000/health
```

**Kutilgan javob:**
```json
{"status":"ok","timestamp":"2024-..."}
```

### 7. Firewall Tekshirish

```bash
# UFW (Ubuntu)
sudo ufw status
sudo ufw allow 3000/tcp

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --list-ports
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload
```

## 🔍 Tekshirish Ro'yxati

- [ ] Backend container ishlayapti (`docker ps | grep backend`)
- [ ] Port 3000 ochiq (`netstat -tuln | grep 3000`)
- [ ] Docker compose port mapping to'g'ri (`0.0.0.0:3000:3000`)
- [ ] Backend loglarida "Server running on port 3000" ko'rinadi
- [ ] Health check ishlayapti (`curl http://64.225.20.211:3000/health`)
- [ ] Firewall port 3000'ni bloklamagan

## 🐛 Muammolarni Hal Qilish

### Container ishlamayapti

```bash
# Container'ni qayta ishga tushirish
docker compose -f docker-compose.prod.yml restart backend

# Agar ishlamasa, qayta build qilish
docker compose -f docker-compose.prod.yml build backend --no-cache
docker compose -f docker-compose.prod.yml up -d backend
```

### Port 3000 ishlatilmoqda

```bash
# Qaysi process port 3000'ni ishlatayotganini topish
sudo lsof -i :3000

# Process'ni to'xtatish (agar kerak bo'lsa)
sudo kill -9 <PID>
```

### Connection Refused

1. Backend container ishlamayapti
2. Port mapping noto'g'ri
3. Firewall port'ni bloklagan

**Yechim:**
```bash
# 1. Container'ni tekshirish
docker ps -a | grep backend

# 2. Port mapping'ni tekshirish
cat docker-compose.prod.yml | grep ports

# 3. Firewall'ni tekshirish
sudo ufw status
```

## ✅ Keyingi Qadamlar

1. Backend'ni qayta ishga tushirish
2. Port 3000 ochikligini tekshirish
3. Health check qilish
4. ESP8266 firmware'ni yangilash (`http://64.225.20.211:3000`)
5. Serial Monitor'da tekshirish
