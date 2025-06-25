#!/bin/bash

# Setup script para o ambiente de produção
echo "🚀 Configurando ambiente Prismo Cloud..."

# Verifica se o Docker e Docker Compose estão instalados
if ! command -v docker &> /dev/null || ! command -v docker compose &> /dev/null; then
  echo "⚠️ Docker e/ou Docker Compose não encontrados. Por favor, instale-os primeiro."
  exit 1
fi

# Cria arquivo .env com configurações adequadas
echo "📝 Criando arquivo .env..."
cat > .env << EOL
PORT=3000
MONGODB_URI=mongodb://localhost:27017/prismo
DATABASE_URL=postgresql://user:password@localhost:5432/prismo
LOG_LEVEL=info
EOL

# Configura permissões
echo "🔒 Configurando permissões..."
chmod +x setup.sh

# Instalando dependências do projeto
echo "📦 Instalando dependências do projeto..."
npm install

# Compilando o projeto
echo "🛠️ Compilando o projeto..."
npm run build

# Inicia os containers Docker
echo "🐳 Iniciando containers Docker..."
docker compose down
docker compose up -d

# Espera um momento para garantir que os bancos de dados estejam prontos
echo "⏳ Aguardando a inicialização dos bancos de dados..."
sleep 10

# Executa as migrações do Prisma
echo "🔄 Executando migrações do Prisma..."
npx prisma migrate deploy

# Instala PM2 globalmente
echo "🔄 Instalando PM2 globalmente..."
npm install -g pm2

# Inicia a aplicação com PM2
echo "✅ Iniciando aplicação com PM2..."
pm2 delete prismo-cloud 2>/dev/null || true
pm2 start dist/app.js --name prismo-cloud

echo "🎉 Setup completo! A aplicação Prismo Cloud está rodando."
echo "🌐 Acesse a API em: http://localhost:3000/api/v1/health"