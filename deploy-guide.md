# 🚀 Hướng dẫn Deploy Project ZentroBus

## Tổng quan
- **Backend + Database**: VPS Ubuntu 22.04 với Docker
- **Frontend**: Vercel (CDN toàn cầu)
- **Database**: SQL Server 2022 trong Docker container
- **Reverse Proxy**: Nginx với SSL

---

## 📋 PHẦN 1: CHUẨN BỊ VPS UBUNTU 22.04

### Step 1.1: Cập nhật hệ thống
```bash
# SSH vào VPS
ssh root@YOUR_VPS_IP

# Cập nhật packages
sudo apt update && sudo apt upgrade -y

# Cài đặt các tools cần thiết
sudo apt install -y curl wget git vim ufw
```

### Step 1.2: Tạo user deploy (khuyến nghị)
```bash
# Tạo user mới
sudo adduser deploy
sudo usermod -aG sudo deploy

# Chuyển sang user deploy
su - deploy
```

### Step 1.3: Cài đặt Docker & Docker Compose
```bash
# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Thêm user vào group docker
sudo usermod -aG docker $USER

# Cài đặt Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Khởi động lại để apply group changes
sudo systemctl reboot
```

### Step 1.4: Cấu hình Firewall
```bash
# Enable UFW
sudo ufw enable

# Cho phép SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Kiểm tra status
sudo ufw status
```

---

## 📦 PHẦN 2: CHUẨN BỊ PROJECT FILES

### Step 2.1: Clone project về VPS
```bash
# Clone repository
git clone https://github.com/your-username/Putiee.git
cd Putiee
```

### Step 2.2: Tạo production environment files
```bash
# Tạo .env cho production
cd BE
cp .env .env.production
```

### Step 2.3: Cập nhật .env.production
```bash
# Chỉnh sửa file .env.production
nano .env.production
```

```env
# Production Environment
NODE_ENV=production
PORT=5000

# Database
DB_USER=sa
DB_PASSWORD=YourStrongPassword123!
DB_NAME=BusBookingSystem
DB_SERVER=sqlserver

# JWT Secret (tạo secret mạnh)
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# Frontend URL (sẽ cập nhật sau khi deploy Vercel)
FRONTEND_URL=https://your-app.vercel.app

# Payment (PayOS)
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key

# Backend URL
BACKEND_URL=https://your-domain.com
```

---

## 🐳 PHẦN 3: DOCKERIZE BACKEND

### Step 3.1: Tạo Dockerfile cho Backend
```bash
cd BE
nano Dockerfile
```

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Step 3.2: Tạo .dockerignore
```bash
nano .dockerignore
```

```dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
.env.development
README.md
.nyc_output
coverage
.nyc_output
.coverage
.vscode
```

### Step 3.3: Thêm health check endpoint
```bash
nano src/server.js
```

Thêm route health check:
```javascript
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

---

## 🗄️ PHẦN 4: DOCKER COMPOSE SETUP

### Step 4.1: Tạo docker-compose.yml
```bash
cd Putiee
nano docker-compose.yml
```

```yaml
version: '3.8'

services:
  # SQL Server Database
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: zentrobus_db
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrongPassword123!
      - MSSQL_PID=Express
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql
      - ./db-init:/docker-entrypoint-initdb.d
    restart: unless-stopped
    networks:
      - zentrobus_network
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrongPassword123! -Q 'SELECT 1'"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s

  # Backend API
  backend:
    build: 
      context: ./BE
      dockerfile: Dockerfile
    container_name: zentrobus_api
    environment:
      - NODE_ENV=production
    env_file:
      - ./BE/.env.production
    ports:
      - "5000:5000"
    depends_on:
      sqlserver:
        condition: service_healthy
    volumes:
      - ./BE/uploads:/app/uploads
      - ./BE/logs:/app/logs
    restart: unless-stopped
    networks:
      - zentrobus_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: zentrobus_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - zentrobus_network

volumes:
  sqlserver_data:
    driver: local

networks:
  zentrobus_network:
    driver: bridge
```

### Step 4.2: Tạo Nginx configuration
```bash
mkdir -p nginx
nano nginx/nginx.conf
```

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:5000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=login:10m rate=10r/m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeout settings
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Special rate limiting for auth endpoints
        location ~ ^/api/(auth|admin)/ {
            limit_req zone=login burst=5 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://backend/api/health;
        }
    }
}
```

---

## 🔐 PHẦN 5: SSL CERTIFICATE

### Step 5.1: Cài đặt Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Step 5.2: Tạo SSL certificate
```bash
# Dừng nginx tạm thời
sudo systemctl stop nginx

# Tạo certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy certificates
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl
```

### Step 5.3: Auto-renewal setup
```bash
# Tạo script renew
sudo nano /etc/cron.d/certbot-renew
```

```bash
0 3 * * * root certbot renew --quiet --post-hook "docker-compose -f /path/to/your/docker-compose.yml restart nginx"
```

---

## 🚀 PHẦN 6: DEPLOY BACKEND

### Step 6.1: Build và start services
```bash
cd Putiee

# Build images
docker-compose build

# Start services
docker-compose up -d

# Kiểm tra logs
docker-compose logs -f backend
docker-compose logs -f sqlserver
```

### Step 6.2: Verify deployment
```bash
# Kiểm tra containers
docker-compose ps

# Test API health
curl https://your-domain.com/health

# Test database connection
curl https://your-domain.com/api/health
```

### Step 6.3: Tạo script quản lý
```bash
nano deploy.sh
chmod +x deploy.sh
```

```bash
#!/bin/bash

echo "🚀 Deploying ZentroBus Backend..."

# Pull latest changes
git pull origin main

# Build and restart services
docker-compose build --no-cache backend
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check health
echo "🔍 Checking service health..."
docker-compose ps
curl -f https://your-domain.com/health

echo "✅ Deployment completed!"
```

---

## 🌐 PHẦN 7: DEPLOY FRONTEND TRÊN VERCEL

### Step 7.1: Chuẩn bị Frontend
```bash
cd FE

# Cập nhật API base URL
nano src/services/api.ts
```

```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/api'
  : 'http://localhost:5000/api';
```

### Step 7.2: Tạo environment variables file
```bash
nano .env.production
```

```env
VITE_API_BASE_URL=https://your-domain.com/api
VITE_BACKEND_URL=https://your-domain.com
```

### Step 7.3: Deploy lên Vercel

#### Option A: Vercel CLI
```bash
# Cài đặt Vercel CLI
npm install -g vercel

# Login và deploy
vercel login
vercel --prod

# Set environment variables
vercel env add VITE_API_BASE_URL
vercel env add VITE_BACKEND_URL
```

#### Option B: GitHub Integration
1. Push code lên GitHub
2. Vào [vercel.com](https://vercel.com)
3. Connect GitHub repository
4. Configure build settings:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-domain.com/api`
   - `VITE_BACKEND_URL`: `https://your-domain.com`

### Step 7.4: Cập nhật CORS settings
```bash
# Cập nhật backend CORS
nano BE/src/config/cors.js
```

```javascript
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://localhost:3000',
    'https://your-app.vercel.app', // Add Vercel domain
    'https://your-custom-domain.com' // If using custom domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

---

## 🔄 PHẦN 8: MONITORING & MAINTENANCE

### Step 8.1: Tạo monitoring script
```bash
nano monitor.sh
chmod +x monitor.sh
```

```bash
#!/bin/bash

echo "📊 ZentroBus System Monitor"
echo "=========================="

# Check Docker containers
echo "🐳 Docker Containers:"
docker-compose ps

# Check system resources
echo -e "\n💾 System Resources:"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')%"
echo "Memory Usage: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "Disk Usage: $(df -h / | awk 'NR==2{print $5}')"

# Check API health
echo -e "\n🚀 API Health:"
curl -s https://your-domain.com/health | jq '.'

# Check database
echo -e "\n🗄️  Database Status:"
docker exec zentrobus_db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrongPassword123! -Q "SELECT @@VERSION" 2>/dev/null

echo -e "\n✅ Monitor completed!"
```

### Step 8.2: Setup log rotation
```bash
sudo nano /etc/logrotate.d/zentrobus
```

```bash
/home/deploy/Putiee/nginx/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 0640 deploy deploy
    postrotate
        docker-compose -f /home/deploy/Putiee/docker-compose.yml restart nginx
    endscript
}
```

### Step 8.3: Database backup script
```bash
nano backup.sh
chmod +x backup.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="zentrobus_backup_$DATE.bak"

mkdir -p $BACKUP_DIR

echo "📦 Creating database backup..."

docker exec zentrobus_db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrongPassword123! \
  -Q "BACKUP DATABASE BusBookingSystem TO DISK='/var/backups/$BACKUP_FILE'"

docker cp zentrobus_db:/var/backups/$BACKUP_FILE $BACKUP_DIR/

# Keep only last 7 backups
find $BACKUP_DIR -name "zentrobus_backup_*.bak" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_FILE"
```

---

## 📋 PHẦN 9: FINAL CHECKLIST

### ✅ VPS Setup
- [ ] Ubuntu 22.04 updated
- [ ] Docker & Docker Compose installed
- [ ] Firewall configured
- [ ] SSL certificate installed

### ✅ Backend Deployment
- [ ] Environment variables configured
- [ ] Docker containers running
- [ ] Database connected
- [ ] API health check passing
- [ ] Nginx reverse proxy working

### ✅ Frontend Deployment
- [ ] Vercel deployment successful
- [ ] Environment variables set
- [ ] API connection working
- [ ] CORS configured

### ✅ Security & Monitoring
- [ ] SSL certificate auto-renewal
- [ ] Log rotation setup
- [ ] Database backup scheduled
- [ ] Monitoring scripts created

### ✅ Testing
- [ ] User registration/login
- [ ] Booking flow
- [ ] Payment integration
- [ ] Admin panel access

---

## 🆘 TROUBLESHOOTING

### Common Issues:

1. **Container won't start**
   ```bash
   docker-compose logs container_name
   docker-compose down && docker-compose up -d
   ```

2. **Database connection failed**
   ```bash
   docker exec -it zentrobus_db bash
   /opt/mssql-tools/bin/sqlcmd -S localhost -U sa
   ```

3. **SSL certificate issues**
   ```bash
   sudo certbot renew --dry-run
   docker-compose restart nginx
   ```

4. **API not accessible**
   ```bash
   sudo ufw status
   docker-compose ps
   curl -I https://your-domain.com/health
   ```

---

## 📞 SUPPORT

Nếu gặp vấn đề trong quá trình deploy, hãy:
1. Kiểm tra logs: `docker-compose logs -f`
2. Verify network: `docker network ls`
3. Check firewall: `sudo ufw status`
4. Monitor resources: `./monitor.sh`

**🎉 Chúc mừng! Project ZentroBus đã được deploy thành công!** 