#!/bin/bash

# ZentroBus Monitoring Script
echo "📊 ZentroBus System Status"
echo "=========================="

# Check Docker status
echo "🐳 Docker Status:"
systemctl is-active docker
echo ""

# Check container status
echo "📦 Container Status:"
docker-compose ps
echo ""

# Check resource usage
echo "💻 Resource Usage:"
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1
echo ""

echo "Memory Usage:"
free -h
echo ""

echo "Disk Usage:"
df -h
echo ""

# Check logs for errors
echo "🚨 Recent Errors:"
docker-compose logs --since=1h | grep -i error | tail -10
echo ""

# Check database connection
echo "💾 Database Connection:"
docker exec zentrobus-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrongPassword123! -Q "SELECT 1" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database: Connected"
else
    echo "❌ Database: Connection failed"
fi

# Check API health
echo "🔧 API Health:"
curl -s http://localhost:5000/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ API: Healthy"
else
    echo "❌ API: Not responding"
fi

# Check frontend
echo "🌐 Frontend Health:"
curl -s http://localhost/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Frontend: Healthy"
else
    echo "❌ Frontend: Not responding"
fi

echo ""
echo "📈 Quick Stats:"
echo "Active Containers: $(docker ps -q | wc -l)"
echo "Total Images: $(docker images -q | wc -l)"
echo "System Uptime: $(uptime -p)" 