# Fleet Management System - Docker Setup

Complete Docker setup for running the entire Fleet Management System (Frontend + Keycloak + PostgreSQL) in containers.

---

## 🚀 Quick Start (Full Stack)

### 1. Setup Environment

```bash
# Copy environment template
cp .env.docker.example .env.docker

# Edit with your configuration
nano .env.docker
```

**Required Configuration:**
- `KEYCLOAK_DB_PASSWORD` - PostgreSQL password (generate secure)
- `KEYCLOAK_ADMIN_PASSWORD` - Keycloak admin password (generate secure)
- `NEXTAUTH_SECRET` - NextAuth secret (generate with: `openssl rand -base64 32`)
- `KEYCLOAK_SECRET` - Get from Keycloak admin (see First-Time Setup below)

### 2. Start Everything

```bash
# Start all services (Keycloak + Frontend)
./scripts/start-all.sh

# Or manually:
docker-compose build
docker-compose up -d
```

### 3. First-Time Setup

**If this is your first time running:**

1. Start without KEYCLOAK_SECRET (use temporary value):
   ```env
   KEYCLOAK_SECRET=temporary
   ```

2. Once Keycloak is running, get the real client secret:
   - Open: http://localhost:8080
   - Login with admin credentials (from .env.docker)
   - Navigate to: **Clients** → **fleet-management-frontend** → **Credentials**
   - Copy the **Client Secret**

3. Update `.env.docker`:
   ```env
   KEYCLOAK_SECRET=<paste-real-secret-here>
   ```

4. Restart frontend:
   ```bash
   docker-compose restart frontend
   ```

### 4. Access the System

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Use test users below |
| **Keycloak Admin** | http://localhost:8080 | admin / (from .env.docker) |

**Test Users:**
- `admin` / `admin123` (fleet-admin role)
- `employee` / `employee123` (fleet-employee role)

---

## 📁 What's Included

### Services

1. **keycloak-db** (PostgreSQL)
   - Stores Keycloak data (users, roles, clients)
   - Persistent volume: `keycloak_postgres_data`

2. **keycloak** (Authentication Server)
   - Handles authentication/authorization
   - Port: 8080
   - Auto-imports realm configuration

3. **frontend** (Next.js Application)
   - Fleet Management UI
   - Port: 3000
   - Built with multi-stage Docker

### Networking

All services run on the `fleet-network` bridge network:
- Frontend can reach Keycloak via `http://keycloak:8080` (internal)
- Browser accesses Keycloak via `http://localhost:8080` (external)

---

## 🛠️ Development

### Run Individual Services

**Keycloak Only:**
```bash
docker-compose -f docker-compose.keycloak.yml up -d
```

**Frontend Only (development mode):**
```bash
npm run dev
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f keycloak
docker-compose logs -f keycloak-db
```

### Rebuild Frontend

```bash
docker-compose build frontend
docker-compose up -d frontend
```

### Stop Services

```bash
# Stop all
./scripts/stop-all.sh

# Or manually
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

---

## 🌐 Production Deployment

### Environment Configuration

Update `.env.docker` for production:

```env
# Use your domain
KEYCLOAK_HOSTNAME=keycloak.yourdomain.com
NEXT_PUBLIC_KEYCLOAK_ISSUER=https://keycloak.yourdomain.com/realms/fleet-management-app

# Production NextAuth URL
NEXTAUTH_URL=https://yourdomain.com

# Strong passwords
KEYCLOAK_DB_PASSWORD=<64-char-random-string>
KEYCLOAK_ADMIN_PASSWORD=<64-char-random-string>
NEXTAUTH_SECRET=<64-char-random-string>
```

### Add Reverse Proxy

Use Nginx or Traefik for:
- SSL/TLS termination
- Domain routing
- Load balancing

**Example Nginx config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Update Keycloak for Production

Modify `docker-compose.yml`:

```yaml
keycloak:
  command: start  # Remove -dev
  environment:
    KC_HOSTNAME_STRICT: true
    KC_HOSTNAME_STRICT_HTTPS: true
    KC_HTTP_ENABLED: false  # HTTPS only
    KC_HTTPS_ENABLED: true
```

---

## 🔒 Security Checklist

Production deployment:

- [ ] Use strong passwords (64+ chars)
- [ ] Enable HTTPS everywhere
- [ ] Set `KC_HOSTNAME_STRICT=true`
- [ ] Disable `start-dev` mode in Keycloak
- [ ] Use reverse proxy (Nginx/Traefik)
- [ ] Configure firewall rules
- [ ] Regular database backups
- [ ] Update Docker images regularly
- [ ] Restrict Keycloak admin console (VPN/IP whitelist)
- [ ] Enable Docker secrets for sensitive data

---

## 🐛 Troubleshooting

### Frontend can't connect to Keycloak

**Check environment variables:**
```bash
docker-compose exec frontend env | grep KEYCLOAK
```

**Verify Keycloak is running:**
```bash
curl http://localhost:8080/health
```

### "Invalid redirect URI" error

1. Check Keycloak client configuration:
   - Valid Redirect URIs: `http://localhost:3000/*`
   - Web Origins: `http://localhost:3000`

### Frontend build fails

**Check Node memory:**
```yaml
frontend:
  environment:
    NODE_OPTIONS: "--max-old-space-size=4096"
```

### Database connection issues

```bash
# Check database logs
docker-compose logs keycloak-db

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

### Port already in use

```bash
# Change ports in .env.docker
KEYCLOAK_PORT=8081
FRONTEND_PORT=3001
```

---

## 📊 Monitoring

### Health Checks

```bash
# Keycloak health
curl http://localhost:8080/health

# Frontend health
curl http://localhost:3000

# Check all service status
docker-compose ps
```

### Resource Usage

```bash
# View resource consumption
docker stats

# View specific service
docker stats fleet-frontend keycloak
```

---

## 🔄 Updates

### Update Docker Images

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

### Backup Database

```bash
# Backup Keycloak database
docker exec keycloak-postgres pg_dump -U keycloak keycloak > backup-$(date +%Y%m%d).sql

# Restore
docker exec -i keycloak-postgres psql -U keycloak keycloak < backup-20231216.sql
```

---

## 📚 Additional Documentation

- [KEYCLOAK_SETUP.txt](KEYCLOAK_SETUP.txt) - Original Keycloak setup guide
- [KEYCLOAK_DEPLOYMENT.md](KEYCLOAK_DEPLOYMENT.md) - Cloud deployment guide
- [keycloak/README.md](keycloak/README.md) - Keycloak quick reference
- [Dockerfile](Dockerfile) - Frontend Docker build configuration
- [docker-compose.yml](docker-compose.yml) - Service orchestration

---

## 🆘 Support

**Common Commands:**

```bash
# Start everything
./scripts/start-all.sh

# Stop everything
./scripts/stop-all.sh

# View all logs
docker-compose logs -f

# Restart single service
docker-compose restart frontend

# Rebuild frontend
docker-compose build frontend && docker-compose up -d frontend

# Fresh start (deletes data)
docker-compose down -v && docker-compose up -d
```

For more help, see [KEYCLOAK_DEPLOYMENT.md](KEYCLOAK_DEPLOYMENT.md)
