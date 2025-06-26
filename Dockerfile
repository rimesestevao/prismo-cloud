# Multi-stage build otimizado
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copiar apenas arquivos de dependências primeiro (melhor cache)
COPY package*.json ./
COPY prisma/schema.prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Gerar cliente Prisma
RUN npx prisma generate

# Estágio de build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma/ ./prisma/

# Instalar todas as dependências (incluindo dev)
RUN npm ci

# Copiar código fonte
COPY src/ ./src/

# Gerar Prisma client e compilar
RUN npx prisma generate
RUN npm run build

# Estágio de produção
FROM node:18-alpine AS production

# Instalar dumb-init e dependências do sistema
RUN apk add --no-cache dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copiar dependências de produção
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=dependencies --chown=nodejs:nodejs /app/package*.json ./

# Copiar código compilado
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Mudar para usuário não-root
USER nodejs

# Configurar health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Expor porta
EXPOSE 3000

# Comando de inicialização
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]