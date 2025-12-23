# Instruções para Ambiente de Desenvolvimento

## Configuração do Docker Compose de Desenvolvimento

Foi criado um arquivo `docker-compose.dev.yml` que pode rodar em paralelo com o ambiente de produção, permitindo testar melhorias antes de implementar.

## Configuração das Portas

- **Frontend**: Porta `3001` (ambiente de desenvolvimento)
- **Backend**: Porta `3002` (exposto externamente)
- **PostgreSQL**: Porta `5433` (para não conflitar com produção na 5432)

## Containers Criados

- `petshop_db_dev` - Banco de dados de desenvolvimento
- `petshop_backend_dev` - Backend de desenvolvimento
- `petshop_frontend_dev` - Frontend de desenvolvimento

## Como usar no Portainer

1. No Portainer, vá em **Stacks**
2. Clique em **Add Stack**
3. Dê um nome para a stack (ex: `petfacil-dev`)
4. Cole o conteúdo do arquivo `docker-compose.dev.yml` no editor
5. Clique em **Deploy the stack**

## Comandos via Terminal (alternativa)

```bash
# Subir o ambiente de desenvolvimento
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Parar o ambiente
docker-compose -f docker-compose.dev.yml down

# Parar e remover volumes (cuidado: apaga dados)
docker-compose -f docker-compose.dev.yml down -v
```

## Acessos

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3002/api
- **PostgreSQL**: localhost:5433

## Observações

- O ambiente de desenvolvimento usa um banco de dados separado (`petshop_db_dev`)
- Os dados de desenvolvimento não interferem com o ambiente de produção
- O backend está configurado com hot-reload através de volumes montados
- O frontend usa uma configuração nginx específica para desenvolvimento

