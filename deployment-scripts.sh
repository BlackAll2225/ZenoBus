#!/bin/bash

# =============================================================================
# ZentroBus Deployment Scripts
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project variables
PROJECT_NAME="zentrobus"
DOMAIN="your-domain.com"
EMAIL="your-email@domain.com"
DB_PASSWORD="YourStrongPassword123!"

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

print_header() {
    echo -e "${BLUE}=================================${NC}"
    echo -e "${BLUE}🚀 $1${NC}"
    echo -e "${BLUE}=================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

# =============================================================================
# SYSTEM SETUP FUNCTIONS
# =============================================================================

setup_system() {
    print_header "Setting up system"
    
    # Update system
    sudo apt update && sudo apt upgrade -y
    
    # Install essential packages
    sudo apt install -y curl wget git vim ufw htop tree jq
    
    # Setup firewall
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    print_success "System setup completed"
}

install_docker() {
    print_header "Installing Docker & Docker Compose"
    
    # Install Docker
    if ! check_command docker; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
    fi
    
    # Install Docker Compose
    if ! check_command docker-compose; then
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    print_success "Docker installation completed"
    print_warning "Please logout and login again to apply Docker group changes"
}

# =============================================================================
# SSL CERTIFICATE FUNCTIONS
# =============================================================================

install_certbot() {
    print_header "Installing Certbot"
    
    sudo apt install -y certbot python3-certbot-nginx
    
    print_success "Certbot installed"
}

setup_ssl() {
    print_header "Setting up SSL certificates"
    
    # Stop nginx if running
    sudo systemctl stop nginx 2>/dev/null || true
    docker-compose down nginx 2>/dev/null || true
    
    # Get certificate
    sudo certbot certonly --standalone \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d www.$DOMAIN
    
    # Create nginx ssl directory
    mkdir -p nginx/ssl
    
    # Copy certificates
    sudo cp -L /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
    sudo cp -L /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/
    sudo cp -L /etc/letsencrypt/live/$DOMAIN/chain.pem nginx/ssl/
    sudo chown -R $USER:$USER nginx/ssl
    
    # Setup auto-renewal
    echo "0 3 * * * root certbot renew --quiet --post-hook 'docker-compose -f $(pwd)/production-docker-compose.yml restart nginx'" | sudo tee /etc/cron.d/certbot-renew
    
    print_success "SSL certificates configured"
}

# =============================================================================
# PROJECT DEPLOYMENT FUNCTIONS
# =============================================================================

prepare_project() {
    print_header "Preparing project files"
    
    # Create necessary directories
    mkdir -p nginx/logs nginx/ssl BE/logs BE/uploads BE/backups
    
    # Copy configuration files
    cp production-docker-compose.yml docker-compose.yml
    cp production-nginx.conf nginx/nginx.conf
    
    # Update domain in nginx config
    sed -i "s/your-domain.com/$DOMAIN/g" nginx/nginx.conf
    sed -i "s/your-email@domain.com/$EMAIL/g" docker-compose.yml
    sed -i "s/your-domain.com/$DOMAIN/g" docker-compose.yml
    
    # Create production environment file
    cd BE
    if [ ! -f .env.production ]; then
        cp .env .env.production
        
        # Update production values
        sed -i "s/NODE_ENV=development/NODE_ENV=production/g" .env.production
        sed -i "s/DB_SERVER=localhost/DB_SERVER=sqlserver/g" .env.production
        sed -i "s/DB_PASSWORD=123456/DB_PASSWORD=$DB_PASSWORD/g" .env.production
        sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|g" .env.production
        sed -i "s|BACKEND_URL=.*|BACKEND_URL=https://$DOMAIN|g" .env.production
        
        print_warning "Please update PayOS credentials in BE/.env.production"
    fi
    cd ..
    
    print_success "Project files prepared"
}

build_and_deploy() {
    print_header "Building and deploying application"
    
    # Build images
    docker-compose build --no-cache
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be ready
    echo "Waiting for services to start..."
    sleep 60
    
    print_success "Application deployed"
}

# =============================================================================
# MONITORING FUNCTIONS
# =============================================================================

create_monitoring_scripts() {
    print_header "Creating monitoring scripts"
    
    # Create monitor script
    cat > monitor.sh << 'EOF'
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
if curl -s https://DOMAIN/health > /dev/null; then
    echo "✅ API is responding"
    curl -s https://DOMAIN/health | jq '.' 2>/dev/null || echo "Response received but not JSON"
else
    echo "❌ API is not responding"
fi

# Check SSL certificate
echo -e "\n🔒 SSL Certificate:"
cert_expiry=$(echo | openssl s_client -servername DOMAIN -connect DOMAIN:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
echo "Expires: $cert_expiry"

echo -e "\n✅ Monitor completed!"
EOF
    
    sed -i "s/DOMAIN/$DOMAIN/g" monitor.sh
    chmod +x monitor.sh
    
    # Create backup script
    cat > backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/home/$USER/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="zentrobus_backup_$DATE.bak"

mkdir -p $BACKUP_DIR

echo "📦 Creating database backup..."

# Create database backup
docker exec zentrobus_db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "DB_PASSWORD" \
  -Q "BACKUP DATABASE BusBookingSystem TO DISK='/var/backups/$BACKUP_FILE'"

# Copy backup to host
docker cp zentrobus_db:/var/backups/$BACKUP_FILE $BACKUP_DIR/

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Keep only last 7 backups
find $BACKUP_DIR -name "zentrobus_backup_*.bak.gz" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_FILE.gz"
echo "📍 Backup location: $BACKUP_DIR/$BACKUP_FILE.gz"
EOF
    
    sed -i "s/DB_PASSWORD/$DB_PASSWORD/g" backup.sh
    chmod +x backup.sh
    
    # Create deployment script
    cat > deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying ZentroBus Backend..."

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Build and restart services
echo "🔨 Building and restarting services..."
docker-compose build --no-cache backend
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check health
echo "🔍 Checking service health..."
docker-compose ps

if curl -f https://DOMAIN/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment may have issues - check logs"
    docker-compose logs --tail=50 backend
fi
EOF
    
    sed -i "s/DOMAIN/$DOMAIN/g" deploy.sh
    chmod +x deploy.sh
    
    # Setup cron for backups
    (crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/backup.sh >> $(pwd)/backup.log 2>&1") | crontab -
    
    print_success "Monitoring scripts created"
}

# =============================================================================
# VERIFICATION FUNCTIONS
# =============================================================================

verify_deployment() {
    print_header "Verifying deployment"
    
    echo "Checking Docker containers..."
    docker-compose ps
    
    echo -e "\nChecking API health..."
    if curl -f https://$DOMAIN/health; then
        print_success "API is responding correctly"
    else
        print_error "API health check failed"
    fi
    
    echo -e "\nChecking SSL certificate..."
    if echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -text | grep -q "DNS:$DOMAIN"; then
        print_success "SSL certificate is valid"
    else
        print_error "SSL certificate issues detected"
    fi
    
    echo -e "\nChecking database connection..."
    if docker exec zentrobus_db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -Q "SELECT 1" > /dev/null 2>&1; then
        print_success "Database is accessible"
    else
        print_error "Database connection failed"
    fi
}

# =============================================================================
# MAIN DEPLOYMENT FUNCTION
# =============================================================================

full_deployment() {
    print_header "Starting full deployment"
    
    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root"
        exit 1
    fi
    
    # Prompt for domain and email
    read -p "Enter your domain name (e.g., example.com): " DOMAIN
    read -p "Enter your email address: " EMAIL
    read -s -p "Enter database password: " DB_PASSWORD
    echo
    
    # Confirm details
    echo -e "\n${YELLOW}Deployment Configuration:${NC}"
    echo "Domain: $DOMAIN"
    echo "Email: $EMAIL"
    echo "Database Password: [hidden]"
    echo
    read -p "Proceed with deployment? (y/N): " confirm
    
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 0
    fi
    
    # Run deployment steps
    setup_system
    install_docker
    install_certbot
    prepare_project
    setup_ssl
    build_and_deploy
    create_monitoring_scripts
    
    # Wait a bit for services to fully start
    sleep 30
    verify_deployment
    
    print_header "Deployment completed!"
    echo -e "${GREEN}🎉 Your ZentroBus application is now deployed!${NC}"
    echo -e "${BLUE}📱 API URL: https://$DOMAIN${NC}"
    echo -e "${BLUE}🔍 Health Check: https://$DOMAIN/health${NC}"
    echo -e "${BLUE}📊 Monitor: ./monitor.sh${NC}"
    echo -e "${BLUE}💾 Backup: ./backup.sh${NC}"
    echo -e "${BLUE}🚀 Deploy: ./deploy.sh${NC}"
    echo
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Configure your frontend environment variables with: https://$DOMAIN/api"
    echo "2. Deploy your frontend to Vercel"
    echo "3. Update CORS settings with your Vercel domain"
    echo "4. Test the complete application flow"
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================

case "${1:-full}" in
    "system")
        setup_system
        ;;
    "docker")
        install_docker
        ;;
    "ssl")
        setup_ssl
        ;;
    "deploy")
        build_and_deploy
        ;;
    "monitor")
        create_monitoring_scripts
        ;;
    "verify")
        verify_deployment
        ;;
    "full")
        full_deployment
        ;;
    *)
        echo "Usage: $0 {system|docker|ssl|deploy|monitor|verify|full}"
        echo "  system  - Setup system packages and firewall"
        echo "  docker  - Install Docker and Docker Compose"
        echo "  ssl     - Setup SSL certificates"
        echo "  deploy  - Build and deploy application"
        echo "  monitor - Create monitoring scripts"
        echo "  verify  - Verify deployment"
        echo "  full    - Run complete deployment (default)"
        exit 1
        ;;
esac 