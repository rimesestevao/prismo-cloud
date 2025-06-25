FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Instala apenas dependências de produção
RUN npm ci --only=production

COPY . .

# Compila TypeScript para JavaScript
RUN npm run build

# Imagem final para produção com menos camadas
FROM node:18-alpine

# Define o ambiente para produção
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copia apenas os arquivos necessários da imagem de build
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# Expõe a porta da aplicação
EXPOSE 3000

# Inicia a aplicação
CMD ["node", "dist/app.js"]
