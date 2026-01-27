# DEPLOY.md

Guia de deploy para aplicações Nuxt 4 em diferentes plataformas.

## Índice

1. [Preparação para Produção](#preparação-para-produção)
2. [Vercel](#vercel)
3. [Netlify](#netlify)
4. [Docker](#docker)
5. [Node.js Standalone](#nodejs-standalone)
6. [Cloudflare Pages](#cloudflare-pages)
7. [AWS](#aws)
8. [Variáveis de Ambiente](#variáveis-de-ambiente)
9. [Checklist de Deploy](#checklist-de-deploy)

---

## Preparação para Produção

### Build de Produção

```bash
# Build padrão (SSR)
npm run build

# Build estático (SSG)
npm run generate
```

### Verificações Pré-Deploy

```bash
# Verificar tipos TypeScript
npm run typecheck

# Verificar lint
npm run lint

# Rodar testes
npm run test:run

# Preview local do build
npm run preview
```

### Configuração de Produção

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Desabilitar devtools em produção
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  // Desabilitar sourcemaps
  sourcemap: {
    client: false,
    server: false
  },

  // Nitro preset (detectado automaticamente na maioria das plataformas)
  nitro: {
    preset: 'node-server' // ou 'vercel', 'netlify', etc.
  }
})
```

---

## Vercel

### Deploy Automático

1. Conectar repositório GitHub no [Vercel](https://vercel.com)
2. Vercel detecta Nuxt automaticamente
3. Deploy acontece a cada push

### Configuração Manual

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".output",
  "installCommand": "npm ci",
  "framework": "nuxt"
}
```

### Variáveis de Ambiente

No painel do Vercel:
1. Settings → Environment Variables
2. Adicionar variáveis para Production/Preview/Development

```bash
# Variáveis necessárias
NUXT_PUBLIC_API_BASE_URL=https://api.exemplo.com
NUXT_JWT_SECRET=sua-chave-secreta
```

### Route Rules para Vercel

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel'
  },

  routeRules: {
    // ISR - Regeneração incremental
    '/blog/**': { isr: 3600 },

    // Edge function
    '/api/fast/**': { experimentalNoVPC: true }
  }
})
```

### CLI Deploy

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

---

## Netlify

### Deploy Automático

1. Conectar repositório no [Netlify](https://netlify.com)
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.output/public`

### Configuração

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "20"

# Redirects para SPA fallback
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Para SSR (Netlify Functions)

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = ".netlify/functions-internal"
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'netlify'
  }
})
```

### Variáveis de Ambiente

No painel do Netlify:
1. Site settings → Environment variables
2. Adicionar variáveis

### CLI Deploy

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Link ao site
netlify link

# Deploy preview
netlify deploy

# Deploy produção
netlify deploy --prod
```

---

## Docker

### Dockerfile Multi-stage

```dockerfile
# Dockerfile
# Estágio de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build
RUN npm run build

# Estágio de produção
FROM node:20-alpine AS runner

WORKDIR /app

# Copiar apenas o necessário do build
COPY --from=builder /app/.output /app/.output

# Variáveis de ambiente
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Expor porta
EXPOSE 3000

# Iniciar aplicação
CMD ["node", ".output/server/index.mjs"]
```

### .dockerignore

```dockerignore
# .dockerignore
node_modules
.nuxt
.output
.git
.github
*.md
!README.md
.env*
!.env.example
coverage
tests
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NUXT_PUBLIC_API_BASE_URL=https://api.exemplo.com
      - NUXT_JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Comandos Docker

```bash
# Build da imagem
docker build -t minha-app .

# Rodar container
docker run -p 3000:3000 --env-file .env.production minha-app

# Com Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

### Docker com NGINX (produção)

```dockerfile
# Dockerfile.nginx
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run generate

FROM nginx:alpine AS runner
COPY --from=builder /app/.output/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Gzip
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml;

        # Cache de assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

---

## Node.js Standalone

### Build e Execução

```bash
# Build
npm run build

# Executar
node .output/server/index.mjs
```

### Process Manager (PM2)

```bash
# Instalar PM2
npm i -g pm2

# Iniciar aplicação
pm2 start .output/server/index.mjs --name "nuxt-app"

# Ver status
pm2 status

# Ver logs
pm2 logs nuxt-app

# Reiniciar
pm2 restart nuxt-app

# Parar
pm2 stop nuxt-app

# Salvar configuração para auto-start
pm2 save
pm2 startup
```

### Ecosystem File (PM2)

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'nuxt-app',
    script: '.output/server/index.mjs',
    instances: 'max', // Cluster mode
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

```bash
# Usar ecosystem file
pm2 start ecosystem.config.cjs --env production
```

### Systemd Service

```ini
# /etc/systemd/system/nuxt-app.service
[Unit]
Description=Nuxt App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/nuxt-app
ExecStart=/usr/bin/node .output/server/index.mjs
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=nuxt-app
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
# Habilitar e iniciar
sudo systemctl enable nuxt-app
sudo systemctl start nuxt-app

# Ver status
sudo systemctl status nuxt-app

# Ver logs
sudo journalctl -u nuxt-app -f
```

---

## Cloudflare Pages

### Deploy Automático

1. Conectar repositório no [Cloudflare Pages](https://pages.cloudflare.com)
2. Build settings:
   - Build command: `npm run build`
   - Build output directory: `.output/public`

### Configuração para SSR (Workers)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare-pages'
  }
})
```

### wrangler.toml

```toml
# wrangler.toml
name = "nuxt-app"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".output/public"

[vars]
NUXT_PUBLIC_API_BASE_URL = "https://api.exemplo.com"
```

### CLI Deploy

```bash
# Instalar Wrangler
npm i -g wrangler

# Login
wrangler login

# Deploy
wrangler pages deploy .output/public
```

---

## AWS

### AWS Amplify

1. Conectar repositório no [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Build settings automáticas ou:

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .output/public
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### EC2 com PM2

```bash
# No servidor EC2

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm i -g pm2

# Clonar e buildar
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo
npm ci
npm run build

# Iniciar com PM2
pm2 start .output/server/index.mjs --name "nuxt-app"
pm2 save
pm2 startup
```

### Lambda com SST

```typescript
// sst.config.ts
export default {
  config() {
    return {
      name: "nuxt-app",
      region: "us-east-1"
    }
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new SSTNuxt(stack, "site", {
        path: ".",
      })

      stack.addOutputs({
        url: site.url
      })
    })
  }
}
```

---

## Variáveis de Ambiente

### Estrutura Recomendada

```bash
# .env.example (commitar)
NUXT_PUBLIC_API_BASE_URL=
NUXT_JWT_SECRET=
DATABASE_URL=

# .env.local (não commitar - desenvolvimento)
NUXT_PUBLIC_API_BASE_URL=http://localhost:4000
NUXT_JWT_SECRET=dev-secret
DATABASE_URL=postgresql://localhost:5432/dev

# .env.production (não commitar ou usar secrets manager)
NUXT_PUBLIC_API_BASE_URL=https://api.exemplo.com
NUXT_JWT_SECRET=super-secret-key-here
DATABASE_URL=postgresql://user:pass@prod-host:5432/prod
```

### Acessar no Código

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Privado (servidor)
    jwtSecret: process.env.NUXT_JWT_SECRET,
    dbUrl: process.env.DATABASE_URL,

    // Público (cliente)
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL
    }
  }
})
```

```typescript
// No código
const config = useRuntimeConfig()

// Cliente e servidor
config.public.apiBaseUrl

// Apenas servidor
config.jwtSecret
```

### Secrets em CI/CD

```yaml
# GitHub Actions
env:
  NUXT_PUBLIC_API_BASE_URL: ${{ secrets.API_BASE_URL }}
  NUXT_JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

---

## Checklist de Deploy

### Antes do Deploy

- [ ] Build local funciona (`npm run build`)
- [ ] Preview local funciona (`npm run preview`)
- [ ] TypeScript sem erros (`npm run typecheck`)
- [ ] Lint sem erros (`npm run lint`)
- [ ] Testes passando (`npm run test:run`)
- [ ] Variáveis de ambiente configuradas

### Configuração de Produção

- [ ] `devtools` desabilitado
- [ ] `sourcemap` desabilitado
- [ ] Secrets não expostos no cliente
- [ ] HTTPS configurado
- [ ] Headers de segurança ativos

### Pós-Deploy

- [ ] Site acessível
- [ ] API funcionando
- [ ] Autenticação funcionando
- [ ] Performance aceitável (Lighthouse > 80)
- [ ] Monitoramento configurado
- [ ] Logs acessíveis

### Monitoramento

- [ ] Health check endpoint (`/api/health`)
- [ ] Error tracking (Sentry, LogRocket)
- [ ] Analytics (Google Analytics, Plausible)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)

---

## Health Check Endpoint

```typescript
// server/api/health.get.ts
export default defineEventHandler(() => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  }
})
```

---

## Referências

- [Nuxt Deployment](https://nuxt.com/docs/getting-started/deployment)
- [Vercel Nuxt](https://vercel.com/docs/frameworks/nuxt)
- [Netlify Nuxt](https://docs.netlify.com/integrations/frameworks/nuxt/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nuxt-site/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
