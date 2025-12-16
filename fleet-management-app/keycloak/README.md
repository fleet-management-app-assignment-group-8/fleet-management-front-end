# Keycloak Quick Reference

## 🚀 Quick Start

### Local Development
```bash
# Start Keycloak
./scripts/start-keycloak.sh

# Stop Keycloak
./scripts/stop-keycloak.sh
```

### Manual Start
```bash
# Start
docker-compose -f docker-compose.keycloak.yml --env-file .env.keycloak up -d

# Stop
docker-compose -f docker-compose.keycloak.yml down

# Fresh start (delete all data)
docker-compose -f docker-compose.keycloak.yml down -v
```

## 📍 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Admin Console | http://localhost:8080 | admin / (from .env.keycloak) |
| Realm | http://localhost:8080/realms/fleet-management-app | - |
| Health Check | http://localhost:8080/health | - |

## 👤 Test Users

| Username | Password | Role | Email |
|----------|----------|------|-------|
| admin | admin123 | fleet-admin | admin@fleet.com |
| employee | employee123 | fleet-employee | employee@fleet.com |

## 🔑 Get Client Secret

1. Login to Admin Console
2. Navigate to: **Clients** → **fleet-management-frontend** → **Credentials**
3. Copy the **Client Secret**
4. Add to frontend `.env.local`:

```env
KEYCLOAK_ID=fleet-management-frontend
KEYCLOAK_SECRET=<paste-client-secret-here>
KEYCLOAK_ISSUER=http://localhost:8080/realms/fleet-management-app
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
```

## 📊 Monitoring

```bash
# View logs
docker-compose -f docker-compose.keycloak.yml logs -f keycloak

# Check health
curl http://localhost:8080/health/ready

# Check status
docker-compose -f docker-compose.keycloak.yml ps
```

## 🌐 Cloud Deployment

See [KEYCLOAK_DEPLOYMENT.md](KEYCLOAK_DEPLOYMENT.md) for detailed cloud deployment instructions including:
- Docker Compose on VM/VPS
- Kubernetes deployment
- Nginx reverse proxy setup
- SSL/TLS configuration
- Production security checklist

## 📁 Files Created

- `docker-compose.keycloak.yml` - Docker Compose configuration
- `.env.keycloak.example` - Environment template
- `keycloak/realm-export.json` - Pre-configured realm with roles, users, client
- `keycloak/kubernetes.yaml` - Kubernetes manifests
- `scripts/start-keycloak.sh` - Quick start script
- `scripts/stop-keycloak.sh` - Stop script
- `KEYCLOAK_DEPLOYMENT.md` - Complete deployment guide

## 🔒 Security Notes

⚠️ **Never commit `.env.keycloak`** - it contains sensitive credentials

For production:
- Use strong passwords (32+ characters)
- Enable HTTPS
- Use reverse proxy (Nginx/Traefik)
- Restrict admin console access (VPN/IP whitelist)
- Regular database backups

## 📚 Documentation

- [KEYCLOAK_SETUP.txt](KEYCLOAK_SETUP.txt) - Original setup guide
- [KEYCLOAK_DEPLOYMENT.md](KEYCLOAK_DEPLOYMENT.md) - Complete deployment guide
- [Keycloak Official Docs](https://www.keycloak.org/documentation)
