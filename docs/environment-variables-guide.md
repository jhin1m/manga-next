# Environment Variables Guide for Docker Production

## Current Setup Analysis

### 🔍 **How Environment Variables Work in Our Docker Setup**

#### **Build Time (Dockerfile)**

```dockerfile
# Builder stage - only for build process
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV DATABASE_URL "postgresql://dummy:dummy@dummy:5432/dummy"  # Dummy for build

# Production stage - runtime defaults
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
```

#### **Runtime (docker-compose.yml)**

```yaml
environment:
  - NODE_ENV=production
  - DATABASE_URL=postgresql://postgres:password@db:5432/manga-next
  - NEXTAUTH_SECRET=your-super-secret-key-for-nextauth-jwt-encryption
  - NEXTAUTH_URL=http://localhost:3000
  - NEXT_PUBLIC_API_URL=http://localhost:3000
  - SEED_DATABASE=false
```

### ✅ **What's Good About Current Setup**

1. **No .env files in image** - Secrets not baked into image
2. **Dummy DATABASE_URL for build** - Real credentials not in image layers
3. **Runtime injection** - Variables provided at container start
4. **Multi-stage separation** - Build vs runtime environment isolation

### ⚠️ **Security Concerns in Current Setup**

1. **Hardcoded secrets in docker-compose.yml** - Visible in plain text
2. **No encryption** - Secrets stored unencrypted
3. **Version control risk** - docker-compose.yml might be committed with secrets
4. **No secret rotation** - Difficult to update secrets

## 🔒 **Recommended Production Security Improvements**

### **Method 1: Environment Files (Recommended for Development)**

```yaml
# docker-compose.prod.yml
services:
  app:
    env_file:
      - .env.production # Not committed to git
    environment:
      - NODE_ENV=production
```

### **Method 2: Docker Secrets (Recommended for Production)**

```yaml
# docker-compose.prod.yml
services:
  app:
    secrets:
      - database_url
      - nextauth_secret
    environment:
      - DATABASE_URL_FILE=/run/secrets/database_url
      - NEXTAUTH_SECRET_FILE=/run/secrets/nextauth_secret

secrets:
  database_url:
    external: true
  nextauth_secret:
    external: true
```

### **Method 3: External Secret Management**

- **Railway**: Environment variables in dashboard
- **Vercel**: Environment variables in project settings
- **AWS**: Parameter Store / Secrets Manager
- **Kubernetes**: Secrets and ConfigMaps

## 🚀 **Implementation Examples**

### **For Railway Deployment**

```bash
# Set via Railway CLI
railway variables set DATABASE_URL="postgresql://..."
railway variables set NEXTAUTH_SECRET="your-secret"
railway variables set NEXTAUTH_URL="https://your-app.railway.app"
```

### **For Production VPS**

```bash
# Use external .env file
docker compose --env-file .env.production up -d

# Or pass directly
DATABASE_URL="postgresql://..." \
NEXTAUTH_SECRET="your-secret" \
docker compose up -d
```

### **For Kubernetes**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: manga-secrets
type: Opaque
stringData:
  database-url: 'postgresql://...'
  nextauth-secret: 'your-secret'
```

## 📝 **Best Practices Summary**

### ✅ **DO**

- Use external secret management in production
- Rotate secrets regularly
- Use different secrets per environment
- Validate required environment variables at startup
- Use Docker secrets for sensitive data
- Mount secrets as files, not environment variables

### ❌ **DON'T**

- Hardcode secrets in Dockerfile or docker-compose.yml
- Commit .env files with real secrets
- Use the same secrets across environments
- Store secrets in image layers
- Log environment variables containing secrets

## 🔧 **Next Steps for Security**

1. Create separate docker-compose files for different environments
2. Implement Docker secrets for production
3. Add environment variable validation
4. Set up secret rotation procedures
5. Use external secret management services
