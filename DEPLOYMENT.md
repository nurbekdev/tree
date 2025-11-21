# Production Deployment Guide

## Server Information

- **Server IP**: 64.225.20.211 (Public)
- **Reserved IP**: 209.38.61.156
- **Private IP**: 10.108.0.2
- **OS**: Ubuntu 24.10 x64
- **SSH**: root@209.38.61.156

## Initial Server Setup

### 1. Connect to Server

```bash
ssh root@209.38.61.156
# Password: Polatov2004!@#Nur
```

### 2. Run Setup Script

```bash
# Upload setup script to server
scp scripts/setup-server.sh root@209.38.61.156:/root/

# SSH into server and run
ssh root@209.38.61.156
chmod +x setup-server.sh
./setup-server.sh
```

### 3. Configure Environment Variables

```bash
cd /var/www/tree-monitor/tree/backend
nano .env
```

Set the following values:

```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=tree_monitor
DB_USER=postgres
DB_PASSWORD=<strong-password-here>

# API Configuration
PORT=3000
API_KEY=26a826cbadeb499a604e69cbb34c3d6b84edb23e2bacc282732db8f576255af0
JWT_SECRET=<generate-with-openssl-rand-hex-32>

# Frontend URL (if needed)
FRONTEND_URL=http://64.225.20.211
```

Generate secure keys:
```bash
openssl rand -hex 32  # For JWT_SECRET
```

### 4. Start Application

```bash
cd /var/www/tree-monitor/tree/backend
docker compose -f docker-compose.prod.yml up -d
```

### 5. Check Status

```bash
# Check containers
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Test API
curl http://localhost:3000/health
```

## GitHub Actions CI/CD Setup

Batafsil qo'llanma uchun `GITHUB_ACTIONS_SETUP.md` faylini ko'ring.

### Tezkor Sozlash:

1. **SSH Key yaratish**:
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy
```

2. **Public Key'ni Server'ga qo'shish**:
```bash
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub root@209.38.61.156
# Password: Polatov2004!@#Nur
```

3. **GitHub Secrets qo'shish** (Repository → Settings → Secrets):
   - **SERVER_HOST**: `209.38.61.156`
   - **SERVER_USER**: `root`
   - **SERVER_PATH**: `/var/www/tree-monitor/tree`
   - **SERVER_SSH_KEY**: `cat ~/.ssh/github_actions_deploy` (to'liq private key)

4. **Test qilish**:
```bash
ssh -i ~/.ssh/github_actions_deploy root@209.38.61.156
# Password so'ralmasligi kerak!
```

### 4. Clone Repository on Server

```bash
cd /var/www/tree-monitor/tree
git clone <your-github-repo-url> .
```

## Automatic Deployment

After setup, every push to `main` or `master` branch will automatically:

1. Pull latest code
2. Rebuild Docker containers
3. Restart services

## Manual Deployment

If you need to deploy manually:

```bash
ssh root@209.38.61.156
cd /var/www/tree-monitor/tree
./scripts/deploy.sh
```

Or use the deployment script directly:

```bash
cd /var/www/tree-monitor/tree
git pull origin main
cd backend
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

## Nginx Configuration

Nginx is configured to proxy requests to the backend:

- **API**: `http://64.225.20.211/api`
- **Health Check**: `http://64.225.20.211/health`

## SSL Setup (Optional but Recommended)

```bash
# Install certbot if not already installed
apt-get install certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
certbot --nginx -d yourdomain.com

# Auto-renewal is set up automatically
```

## Firewall Configuration

```bash
# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp  # SSH
ufw enable
```

## Monitoring

### Check Application Status

```bash
# Container status
docker compose -f docker-compose.prod.yml ps

# Application logs
docker compose -f docker-compose.prod.yml logs -f backend

# Database logs
docker compose -f docker-compose.prod.yml logs -f postgres

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Health Check

```bash
curl http://64.225.20.211/health
```

## Troubleshooting

### Application Not Starting

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Check container status
docker ps -a

# Restart services
docker compose -f docker-compose.prod.yml restart
```

### Database Connection Issues

```bash
# Check database container
docker compose -f docker-compose.prod.yml logs postgres

# Test connection
docker exec -it tree-monitor-db-prod psql -U postgres -d tree_monitor
```

### Nginx Issues

```bash
# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Check status
systemctl status nginx
```

## Frontend Deployment

Frontend avtomatik backend bilan birga deploy bo'ladi. Agar alohida deploy qilish kerak bo'lsa:

```bash
cd /var/www/tree-monitor/tree/backend
docker compose -f docker-compose.prod.yml up -d frontend
```

Frontend'ga kirish: `http://64.225.20.211`

Batafsil ma'lumot uchun `FRONTEND_DEPLOYMENT.md` faylini ko'ring.

## Base Station Firmware Update

After deployment, update base station firmware:

1. Open `firmware/base_station/base_station.ino`
2. Update `BACKEND_URL` to: `http://64.225.20.211`
3. Upload to ESP8266

## Backup

### Database Backup

```bash
# Create backup
docker exec tree-monitor-db-prod pg_dump -U postgres tree_monitor > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
cat backup.sql | docker exec -i tree-monitor-db-prod psql -U postgres tree_monitor
```

## Security Notes

1. **Change default passwords** in `.env`
2. **Use strong API keys** and JWT secrets
3. **Enable firewall** (ufw)
4. **Setup SSL** for production
5. **Regular updates**: `apt-get update && apt-get upgrade`
6. **Monitor logs** regularly

## Support

For issues, check:
- Application logs: `docker compose -f docker-compose.prod.yml logs`
- Nginx logs: `/var/log/nginx/`
- System logs: `journalctl -u docker`

