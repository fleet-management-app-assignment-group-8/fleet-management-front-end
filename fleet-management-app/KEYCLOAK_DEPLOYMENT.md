# Keycloak Deployment Guide

Complete guide for deploying Keycloak authentication server for the Fleet Management System.

---

## Table of Contents
- [Local Development Setup](#local-development-setup)
- [Cloud Deployment](#cloud-deployment)
- [Configuration](#configuration)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites
- Docker and Docker Compose installed
- Ports 8080 (Keycloak) available

### Quick Start

1. **Create environment file**
   ```bash
   cp .env.keycloak.example .env.keycloak
   ```

2. **Edit `.env.keycloak` with secure passwords**
   ```bash
   # Generate secure passwords
   openssl rand -base64 32
   ```

3. **Start Keycloak**
   ```bash
   docker-compose -f docker-compose.keycloak.yml --env-file .env.keycloak up -d
   ```

4. **Wait for Keycloak to start** (takes ~60 seconds)
   ```bash
   docker-compose -f docker-compose.keycloak.yml logs -f keycloak
   ```
   Wait until you see: "Keycloak 23.0 started"

5. **Access Keycloak Admin Console**
   - URL: http://localhost:8080
   - Username: admin (from .env.keycloak)
   - Password: (from .env.keycloak)

6. **Verify realm and users**
   - Switch to realm: `fleet-management-app`
   - Check Users: admin@fleet.com, employee@fleet.com
   - Check Roles: fleet-admin, fleet-employee
   - Check Clients: fleet-management-frontend

7. **Get Client Secret**
   - Go to: Clients → fleet-management-frontend → Credentials
   - Copy the "Client Secret"
   - Add to your frontend `.env.local`:
     ```env
     KEYCLOAK_ID=fleet-management-frontend
     KEYCLOAK_SECRET=<paste-client-secret-here>
     KEYCLOAK_ISSUER=http://localhost:8080/realms/fleet-management-app
     ```

### Stop Keycloak
```bash
docker-compose -f docker-compose.keycloak.yml down
```

### Stop and Remove Data (Fresh Start)
```bash
docker-compose -f docker-compose.keycloak.yml down -v
```

---

## Cloud Deployment

### Option 1: Docker Compose on VM/VPS

1. **Provision a VM** (AWS EC2, Azure VM, GCP Compute Engine, DigitalOcean Droplet)
   - Minimum: 2GB RAM, 2 vCPUs
   - Recommended: 4GB RAM, 2 vCPUs
   - OS: Ubuntu 22.04 LTS

2. **Install Docker and Docker Compose**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Configure Firewall**
   ```bash
   # Allow SSH
   sudo ufw allow 22/tcp
   
   # Allow Keycloak (if exposing directly)
   sudo ufw allow 8080/tcp
   
   # Or allow HTTPS only (if using reverse proxy)
   sudo ufw allow 443/tcp
   
   sudo ufw enable
   ```

4. **Clone your repository**
   ```bash
   git clone <your-repo-url>
   cd fleet-management-app
   ```

5. **Configure environment**
   ```bash
   cp .env.keycloak.example .env.keycloak
   nano .env.keycloak
   ```
   Update:
   - Set strong passwords
   - Set `KEYCLOAK_HOSTNAME` to your domain (e.g., `keycloak.yourcompany.com`)

6. **Start Keycloak**
   ```bash
   docker-compose -f docker-compose.keycloak.yml --env-file .env.keycloak up -d
   ```

7. **Setup Reverse Proxy (RECOMMENDED)**
   
   Install Nginx:
   ```bash
   sudo apt update
   sudo apt install nginx certbot python3-certbot-nginx -y
   ```
   
   Create Nginx config:
   ```bash
   sudo nano /etc/nginx/sites-available/keycloak
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name keycloak.yourcompany.com;
       
       location / {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_buffer_size 128k;
           proxy_buffers 4 256k;
           proxy_busy_buffers_size 256k;
       }
   }
   ```
   
   Enable and get SSL:
   ```bash
   sudo ln -s /etc/nginx/sites-available/keycloak /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   sudo certbot --nginx -d keycloak.yourcompany.com
   ```

8. **Update DNS**
   - Add A record: `keycloak.yourcompany.com` → Your VM IP

9. **Update Keycloak configuration**
   - Edit `.env.keycloak`: Set `KEYCLOAK_HOSTNAME=keycloak.yourcompany.com`
   - Restart: `docker-compose -f docker-compose.keycloak.yml restart keycloak`

10. **Update Frontend environment**
    ```env
    KEYCLOAK_ISSUER=https://keycloak.yourcompany.com/realms/fleet-management-app
    NEXT_PUBLIC_KEYCLOAK_ISSUER=https://keycloak.yourcompany.com/realms/fleet-management-app
    ```

### Option 2: Kubernetes Deployment

1. **Create namespace**
   ```bash
   kubectl create namespace keycloak
   ```

2. **Create secrets**
   ```bash
   kubectl create secret generic keycloak-db-secret \
     --from-literal=password=<your-secure-password> \
     -n keycloak
   
   kubectl create secret generic keycloak-admin-secret \
     --from-literal=username=admin \
     --from-literal=password=<your-secure-password> \
     -n keycloak
   ```

3. **Apply manifests** (create `k8s/keycloak.yaml`)
   ```yaml
   # See kubernetes section below for full manifest
   ```

4. **Apply**
   ```bash
   kubectl apply -f k8s/keycloak.yaml
   ```

### Option 3: Managed Keycloak Services

Consider using managed services:
- **AWS**: Amazon Cognito (alternative)
- **Azure**: Azure AD B2C (alternative) or deploy Keycloak on AKS
- **GCP**: Cloud Identity Platform (alternative) or deploy on GKE
- **Heroku**: Deploy Keycloak as container
- **Railway.app**: Deploy from GitHub
- **Render.com**: Deploy from GitHub

---

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `KEYCLOAK_DB_PASSWORD` | PostgreSQL password | - | Yes |
| `KEYCLOAK_ADMIN_USER` | Admin username | admin | Yes |
| `KEYCLOAK_ADMIN_PASSWORD` | Admin password | - | Yes |
| `KEYCLOAK_HOSTNAME` | Public hostname | localhost | Yes |
| `KEYCLOAK_PORT` | Exposed port | 8080 | No |

### Realm Configuration

The realm is auto-imported from `keycloak/realm-export.json` which includes:
- Realm: `fleet-management-app`
- Roles: `fleet-admin`, `fleet-employee`
- Client: `fleet-management-frontend`
- Test users: admin, employee

### Frontend Configuration

Update your frontend `.env.local`:

```env
# Keycloak Client Configuration
KEYCLOAK_ID=fleet-management-frontend
KEYCLOAK_SECRET=<get-from-keycloak-admin-console>
KEYCLOAK_ISSUER=http://localhost:8080/realms/fleet-management-app

# For cloud deployment:
# KEYCLOAK_ISSUER=https://keycloak.yourcompany.com/realms/fleet-management-app

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-random-32-char-string>

# Public variables (accessible in browser)
NEXT_PUBLIC_KEYCLOAK_ISSUER=http://localhost:8080/realms/fleet-management-app
NEXT_PUBLIC_KEYCLOAK_ID=fleet-management-frontend
```

---

## Security

### Production Security Checklist

- [ ] Change all default passwords
- [ ] Use strong passwords (32+ characters)
- [ ] Enable HTTPS (TLS/SSL)
- [ ] Configure proper CORS origins
- [ ] Set `KC_HOSTNAME_STRICT=true` in production
- [ ] Enable `KC_HOSTNAME_STRICT_HTTPS=true` in production
- [ ] Use reverse proxy (Nginx/Traefik)
- [ ] Enable firewall rules
- [ ] Regular backups of PostgreSQL
- [ ] Monitor logs for suspicious activity
- [ ] Keep Keycloak updated
- [ ] Use secure network (VPC/private network)
- [ ] Implement rate limiting
- [ ] Configure session timeouts
- [ ] Enable brute force protection (already configured)

### Admin Console Access

**Production Best Practices:**

1. **VPN Access Only**
   - Place admin console behind VPN
   - Only allow access from corporate network

2. **IP Whitelist**
   - Configure firewall to allow only specific IPs
   - Use security groups/network policies

3. **Separate Admin Realm**
   - Don't use master realm for admin access
   - Create dedicated admin realm

4. **2FA/MFA**
   - Enable multi-factor authentication for admins

### Database Backups

**Automated Backup Script:**
```bash
#!/bin/bash
# backup-keycloak.sh

BACKUP_DIR="/backups/keycloak"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

docker exec keycloak-postgres pg_dump -U keycloak keycloak | gzip > $BACKUP_DIR/keycloak_$TIMESTAMP.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "keycloak_*.sql.gz" -mtime +30 -delete
```

**Add to crontab:**
```bash
0 2 * * * /path/to/backup-keycloak.sh
```

---

## Troubleshooting

### Container won't start

**Check logs:**
```bash
docker-compose -f docker-compose.keycloak.yml logs keycloak
docker-compose -f docker-compose.keycloak.yml logs keycloak-db
```

**Common issues:**
- Port 8080 already in use
- Database not ready (wait 60s for health check)
- Insufficient memory (increase VM size)

### Can't access admin console

**Check container is running:**
```bash
docker ps | grep keycloak
```

**Check port binding:**
```bash
netstat -tulpn | grep 8080
```

**Check firewall:**
```bash
sudo ufw status
```

### "Invalid redirect URI" error

1. Check frontend URL in Keycloak:
   - Clients → fleet-management-frontend → Settings
   - Valid Redirect URIs should include: `http://localhost:3000/*`

2. Check Web Origins:
   - Should include: `http://localhost:3000`

### Database connection issues

**Reset database:**
```bash
docker-compose -f docker-compose.keycloak.yml down -v
docker-compose -f docker-compose.keycloak.yml up -d
```

### Realm not imported

**Manual import:**
1. Login to admin console
2. Click "Create Realm"
3. Click "Browse" and select `keycloak/realm-export.json`
4. Click "Create"

### SSL/HTTPS issues in production

**Update docker-compose for production:**
```yaml
environment:
  KC_HOSTNAME_STRICT: true
  KC_HOSTNAME_STRICT_HTTPS: true
  KC_PROXY: edge
```

**Ensure reverse proxy passes headers:**
```nginx
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
```

---

## Monitoring

### Health Checks

**Keycloak health endpoint:**
```bash
curl http://localhost:8080/health
curl http://localhost:8080/health/ready
curl http://localhost:8080/health/live
```

**Metrics endpoint:**
```bash
curl http://localhost:8080/metrics
```

### Logs

**View logs:**
```bash
docker-compose -f docker-compose.keycloak.yml logs -f keycloak
```

**Export logs:**
```bash
docker-compose -f docker-compose.keycloak.yml logs keycloak > keycloak.log
```

---

## Useful Commands

```bash
# Start services
docker-compose -f docker-compose.keycloak.yml up -d

# Stop services
docker-compose -f docker-compose.keycloak.yml down

# View logs
docker-compose -f docker-compose.keycloak.yml logs -f

# Restart Keycloak only
docker-compose -f docker-compose.keycloak.yml restart keycloak

# Check status
docker-compose -f docker-compose.keycloak.yml ps

# Update to latest image
docker-compose -f docker-compose.keycloak.yml pull
docker-compose -f docker-compose.keycloak.yml up -d

# Database backup
docker exec keycloak-postgres pg_dump -U keycloak keycloak > backup.sql

# Database restore
docker exec -i keycloak-postgres psql -U keycloak keycloak < backup.sql
```

---

## Support

For more information:
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Keycloak Docker Guide](https://www.keycloak.org/server/containers)
- [NextAuth.js Keycloak Provider](https://next-auth.js.org/providers/keycloak)
