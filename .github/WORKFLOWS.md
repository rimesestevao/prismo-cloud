# CI/CD Workflows

Este projeto utiliza GitHub Actions para automação de CI/CD com os seguintes workflows:

## 🔄 Workflows Disponíveis

### 1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)

- **Trigger**: Push para `main` ou `develop`
- **Funcionalidades**:
  - Executa todos os testes com PostgreSQL e MongoDB
  - Build e push da imagem Docker para `ixtevu/prismo-cloud`
  - Suporte multi-arquitetura (amd64/arm64)
  - Cache otimizado para builds mais rápidos

### 2. **Pull Request Checks** (`.github/workflows/pr-checks.yml`)

- **Trigger**: Abertura/atualização de PRs para `main` ou `develop`
- **Funcionalidades**:
  - Verificação de compilação TypeScript
  - Execução de testes com coverage
  - Linting do código
  - Comentários automáticos no PR com resultados

## 🐳 Tags Docker Geradas

As imagens Docker são automaticamente taggeadas:

- `latest` - Branch main
- `develop` - Branch develop
- `main-<sha>` - Commit específico da main
- `develop-<sha>` - Commit específico da develop

## 🔧 Configuração de Secrets

Para que os workflows funcionem, configure estes secrets no GitHub:

```bash
DOCKER_USERNAME=ixtevu
DOCKER_PASSWORD=[seu_token_docker_hub]
```

## 📊 Exemplo de Uso

1. **Pull Request**: Cria PR → Testes executam automaticamente
2. **Merge para develop**: Push → Build + Deploy da imagem `ixtevu/prismo-cloud:develop`
3. **Merge para main**: Push → Build + Deploy da imagem `ixtevu/prismo-cloud:latest`

## 🚀 Deploy Manual

```bash
# Build local
npm run docker:build

# Pull da imagem do registry
docker pull ixtevu/prismo-cloud:latest

# Run com docker-compose
npm run docker:dev
```
