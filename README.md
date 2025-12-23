# Sistema de Agendamento Petshop

Sistema simples e mobile-first para gerenciamento de agendamentos de petshop, desenvolvido especialmente para uso em dispositivos móveis.

## Características

- 📅 **Agenda Visual**: Calendário estilo Google/Teams para visualização e criação de agendamentos
- 🐾 **Gerenciamento de Agendamentos**: Criar, editar e excluir agendamentos
- 🚗 **Serviço de Leva e Traz**: Opção para marcar agendamentos com serviço de busca e entrega
- 🛠️ **Gerenciamento de Serviços**: Adicionar, editar e remover serviços oferecidos
- 📱 **Mobile-First**: Interface otimizada para dispositivos móveis

## Tecnologias

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React
- **Containerização**: Docker Compose

## Requisitos

- Docker
- Docker Compose

## Instalação e Execução

1. Clone ou baixe este repositório

2. Execute o Docker Compose:
```bash
docker-compose up -d
```

3. Aguarde alguns instantes para os containers iniciarem

4. Acesse o sistema:
   - **No computador**: http://localhost:3000
   - **No celular (mesma rede Wi-Fi)**: http://[IP_DO_COMPUTADOR]:3000
   - Backend API: http://localhost:3001/api

### Acesso pelo Celular

Para acessar do celular na mesma rede Wi-Fi:

1. **Descubra o IP do seu computador:**
   - Windows: Abra o CMD e digite `ipconfig`
   - Procure por "Endereço IPv4" (exemplo: 192.168.15.6)

2. **Libere o Firewall (se necessário):**
   - Execute o arquivo `liberar-firewall.bat` como Administrador
   - Ou manualmente: Painel de Controle > Firewall > Regras de Entrada > Nova Regra > Porta > TCP > 3000

3. **Acesse do celular:**
   - Abra o navegador no celular
   - Digite: `http://[IP_DO_COMPUTADOR]:3000`
   - Exemplo: `http://192.168.15.6:3000`

**Importante**: O celular precisa estar na mesma rede Wi-Fi do computador!

## Estrutura do Projeto

```
pet/
├── backend/
│   ├── server.js          # Servidor Express
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── services/      # Serviços API
│   │   └── App.js
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## Uso

### Agendamentos

1. Na aba **Agenda**, visualize o calendário mensal
2. Clique em um dia para criar um novo agendamento
3. Clique em um agendamento existente para editá-lo
4. Preencha os dados do pet, dono, serviço e horário
5. Marque "Serviço de Leva e Traz" se necessário e informe o endereço

### Serviços

1. Na aba **Serviços**, visualize todos os serviços cadastrados
2. Clique em "Adicionar Serviço" para criar um novo
3. Edite ou exclua serviços existentes usando os botões correspondentes

## Configuração

As configurações do banco de dados podem ser alteradas no arquivo `docker-compose.yml`:

```yaml
environment:
  POSTGRES_USER: petshop
  POSTGRES_PASSWORD: petshop123
  POSTGRES_DB: petshop_db
```

**Importante**: Altere as senhas padrão em produção!

## Acesso Remoto via VPN

Para acessar remotamente via VPN (quando não estiver na mesma rede):

1. Configure sua VPN para permitir acesso à porta 3000 (frontend)
2. Acesse usando o IP do servidor: `http://[IP_DO_SERVIDOR]:3000`
3. Certifique-se de que o firewall do servidor permite conexões na porta 3000

## Parar o Sistema

```bash
docker-compose down
```

Para remover também os volumes (dados do banco):

```bash
docker-compose down -v
```

## Suporte

Sistema desenvolvido para uso simples e intuitivo em dispositivos móveis.

