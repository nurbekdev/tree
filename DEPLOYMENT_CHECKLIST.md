# 🚀 GitHub Actions Deployment Checklist

## ✅ Tuzatilgan Muammolar

### 1. **Firmware Fayllari Path Muammosi**
- ✅ Docker-compose'da firmware volume mount qo'shildi
- ✅ API route'larda bir nechta path variantlari qo'shildi
- ✅ Production'da firmware fayllari `/app/firmware` path'ida mavjud bo'ladi

### 2. **Docker Compose Konfiguratsiyasi**
- ✅ Frontend build context to'g'ri sozlandi
- ✅ Firmware volume mount qo'shildi
- ✅ Port conflicts hal qilindi

### 3. **API Route'lar**
- ✅ Firmware download API'lar to'g'ri path'larni tekshiradi
- ✅ Xatoliklar bilan ishlash yaxshilandi

## 📋 Pre-Deployment Checklist

### GitHub Secrets (Repository → Settings → Secrets)
- [ ] `SERVER_HOST` - Server IP (masalan: `209.38.61.156`)
- [ ] `SERVER_USER` - SSH user (masalan: `root`)
- [ ] `SERVER_PATH` - Deployment path (masalan: `/var/www/tree-monitor/tree`)
- [ ] `SERVER_SSH_KEY` - SSH private key (to'liq key, `-----BEGIN` dan `-----END` gacha)

### Server'da Tekshirish
- [ ] Git repository klonlangan
- [ ] `.env` fayli to'g'ri sozlangan (backend/.env)
- [ ] Docker va Docker Compose o'rnatilgan
- [ ] Nginx sozlangan
- [ ] Portlar 3000 va 3001 ochiq (localhost uchun)
- [ ] Firewall sozlangan (80, 443, 22 portlar)

### Repository'da Tekshirish
- [ ] `firmware/` papkasi mavjud va commit qilingan
- [ ] `.github/workflows/deploy.yml` mavjud
- [ ] `backend/docker-compose.prod.yml` mavjud
- [ ] `frontend/Dockerfile` mavjud
- [ ] Barcha o'zgarishlar commit va push qilingan

## 🔍 Deployment Jarayoni

1. **GitHub'ga Push**
   ```bash
   git add .
   git commit -m "Deploy: Add firmware download functionality"
   git push origin main
   ```

2. **GitHub Actions**
   - Avtomatik ishga tushadi
   - SSH orqali server'ga ulanish
   - Code pull qilish
   - Docker build
   - Container'lar ishga tushirish

3. **Tekshirish**
   - Health check: `http://YOUR_SERVER_IP/health`
   - Frontend: `http://YOUR_SERVER_IP`
   - API: `http://YOUR_SERVER_IP/api/v1/trees`
   - Firmware download: `http://YOUR_SERVER_IP/api/firmware/base_station`

## ⚠️ Ehtimoliy Muammolar va Yechimlar

### 1. Firmware fayllari topilmayapti
**Muammo**: API route firmware faylini topa olmayapti
**Yechim**: 
- Docker-compose'da volume mount to'g'ri sozlanganligini tekshiring
- Server'da `firmware/` papkasi mavjudligini tekshiring
- Container ichida: `docker exec tree-monitor-frontend-prod ls -la /app/firmware`

### 2. Port conflict
**Muammo**: Port 3000 yoki 3001 band
**Yechim**: 
- GitHub Actions workflow'da port cleanup qo'shilgan
- Server'da: `lsof -ti:3000 | xargs kill -9`

### 3. Build xatoliklari
**Muammo**: Docker build muvaffaqiyatsiz
**Yechim**:
- GitHub Actions log'larini tekshiring
- Server'da manual build qilib ko'ring: `cd backend && docker compose -f docker-compose.prod.yml build`

### 4. Nginx proxy muammolari
**Muammo**: Frontend yoki API ishlamayapti
**Yechim**:
- Nginx config: `/etc/nginx/sites-available/tree-monitor`
- Nginx reload: `nginx -t && systemctl reload nginx`
- Log'lar: `tail -f /var/log/nginx/error.log`

## 📝 Post-Deployment Tekshiruv

1. **Health Check**
   ```bash
   curl http://YOUR_SERVER_IP/health
   ```

2. **Firmware Download Test**
   ```bash
   curl http://YOUR_SERVER_IP/api/firmware/base_station
   curl "http://YOUR_SERVER_IP/api/firmware/transmitter?tree_id=1"
   ```

3. **Container Status**
   ```bash
   docker ps
   docker logs tree-monitor-api-prod
   docker logs tree-monitor-frontend-prod
   ```

4. **Database Migration**
   ```bash
   docker exec tree-monitor-api-prod npm run migrate
   ```

## 🎯 Keyingi Qadamlar

1. Push qilishdan oldin barcha o'zgarishlarni commit qiling
2. GitHub Actions workflow'ni tekshiring
3. Deployment log'larini kuzatib boring
4. Post-deployment testlarni o'tkazing

