# 🔧 Nginx Fix - "Not Found" Xatosi

## Muammo

Frontend ishlayapti, lekin `http://64.225.20.211/` ga kirganda "Not Found" xatosi chiqyapti.

## Tezkor Yechim

Server'da quyidagi buyruqlarni bajaring:

```bash
ssh root@209.38.61.156

# Nginx fix script'ni ishga tushirish
cd /var/www/tree-monitor
./scripts/fix-nginx.sh
```

Yoki qo'lda:

```bash
# Nginx konfiguratsiyasini yangilash
nano /etc/nginx/sites-available/tree-monitor
```

Quyidagi konfiguratsiyani qo'llang (yoki yangilang):

```nginx
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    # Next.js static files (MUHIM: / dan oldin bo'lishi kerak!)
    location /_next/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    # Frontend (Next.js) - OXIRGI location block bo'lishi kerak!
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
        
        # Next.js specific
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Keyin:

```bash
# Konfiguratsiyani tekshirish
nginx -t

# Nginx'ni qayta yuklash
systemctl reload nginx
```

## Tekshirish

```bash
# Frontend container ishlayaptimi?
docker ps | grep frontend

# Frontend loglar
docker logs tree-monitor-frontend-prod

# Nginx loglar
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

## Muhim Eslatmalar

1. **Location block'lar tartibi muhim!** `/_next/` `/` dan oldin bo'lishi kerak
2. **Frontend location `/` oxirgi bo'lishi kerak** - boshqa barcha location'lardan keyin
3. **Proxy headers to'liq bo'lishi kerak** - Next.js routing uchun

## Troubleshooting

### Hali ham "Not Found"

```bash
# Frontend container'ni tekshirish
docker logs tree-monitor-frontend-prod -f

# Nginx error loglarini ko'rish
tail -50 /var/log/nginx/error.log

# Frontend'ga to'g'ridan-to'g'ri ulanish
curl http://127.0.0.1:3001
```

### 502 Bad Gateway

```bash
# Frontend container ishlayaptimi?
docker ps | grep frontend

# Container'ni qayta ishga tushirish
cd /var/www/tree-monitor/backend
docker compose -f docker-compose.prod.yml restart frontend
```

### 404 Not Found (Next.js routing)

Bu Next.js routing muammosi. Quyidagilarni tekshiring:
- `/_next/` location block mavjudmi?
- Location block'lar to'g'ri tartibdamı?
- Proxy headers to'liqmi?

