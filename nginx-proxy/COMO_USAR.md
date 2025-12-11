# Como Acessar o Sistema de Forma Mais Fácil

## Opção 1: Acesso sem porta (Recomendado)

Agora você pode acessar o sistema **sem precisar especificar a porta**:

```
http://192.168.15.10
```

Ao invés de `http://192.168.15.10:3000`, agora é só `http://192.168.15.10`!

## Opção 2: Usar Tailscale MagicDNS (RECOMENDADO para VPN!)

Se você está usando Tailscale, esta é a **melhor opção** porque o nome nunca muda, mesmo se o IP mudar!

### Configurar MagicDNS no Tailscale:

1. Acesse o painel do Tailscale: https://login.tailscale.com/admin/settings/dns
2. Ative o **MagicDNS**
3. Configure um nome para o seu servidor (ex: `petshop`)
4. Agora você pode acessar por: `http://petshop` ou `http://petshop.seu-nome.ts.net`

**Vantagens:**

- ✅ Nome fixo que nunca muda
- ✅ Funciona em qualquer dispositivo conectado ao Tailscale
- ✅ Não precisa configurar nada no computador/celular
- ✅ Funciona mesmo se o IP do Tailscale mudar

### Exemplo:

- Seu servidor se chama `petshop` no Tailscale
- Acesse: `http://petshop` (sem porta!)
- Ou: `http://petshop.ericm.ts.net` (se seu nome de usuário for ericm)

## Opção 3: Configurar um domínio local (Alternativa)

Para não precisar lembrar o IP, você pode configurar um domínio local como `petshop.local`:

### No Windows:

1. Abra o Bloco de Notas **como Administrador**
2. Abra o arquivo: `C:\Windows\System32\drivers\etc\hosts`
3. Adicione esta linha no final:
   ```
   192.168.15.10    petshop.local
   ```
   (Substitua `192.168.15.10` pelo IP do seu servidor)
4. Salve o arquivo
5. Agora acesse: `http://petshop.local`

### No Linux/Mac:

1. Abra o terminal
2. Execute:
   ```bash
   sudo nano /etc/hosts
   ```
3. Adicione esta linha:
   ```
   192.168.15.10    petshop.local
   ```
   (Substitua `192.168.15.10` pelo IP do seu servidor)
4. Salve (Ctrl+X, depois Y, depois Enter)
5. Agora acesse: `http://petshop.local`

### No Celular/Tablet (Android):

1. Instale um app como "Hosts Go" ou "Hosts File Editor" (requer root)
2. Ou use um app de VPN local que permita configurar hosts

### No iPhone/iPad:

Infelizmente, iOS não permite editar o arquivo hosts sem jailbreak. Use a Opção 1 (acesso direto pelo IP sem porta).

## Resumo

- **Antes**: `http://192.168.15.10:3000` ou `http://100.79.195.84:3000` (difícil de lembrar e IP pode mudar)
- **Agora (Rede Local)**: `http://192.168.15.10` (mais fácil!)
- **Agora (Tailscale)**: `http://petshop` ou `http://petshop.seu-nome.ts.net` (nome fixo, nunca muda!)
- **Alternativa**: `http://petshop.local` (se configurar o hosts manualmente)

## Importante

⚠️ **Atenção**: Se você já tinha a porta 80 em uso, pode haver conflito. Nesse caso, você pode:

- Parar o serviço que usa a porta 80
- Ou mudar a porta do nginx-proxy no docker-compose.yml para outra (ex: 8080)
