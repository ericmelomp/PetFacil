# Configuração do Tailscale MagicDNS

## Por que usar MagicDNS?

O IP do Tailscale pode mudar (ex: `100.79.195.84`), mas com MagicDNS você terá um **nome fixo** que sempre funciona, mesmo se o IP mudar!

## Passo a Passo

### 1. Ativar MagicDNS no Painel do Tailscale

1. Acesse: https://login.tailscale.com/admin/settings/dns
2. Procure por **"MagicDNS"**
3. Ative a opção **"Use Tailscale DNS"**
4. Salve as configurações

### 2. Configurar o Nome do Servidor

1. No painel do Tailscale, vá em **Machines** (Máquinas)
2. Encontre o servidor onde está rodando o Portainer
3. Clique no nome da máquina (ou nos três pontinhos)
4. Edite o nome para algo fácil de lembrar, como:
   - `petshop`
   - `petshop-server`
   - `meu-petshop`

### 3. Acessar o Sistema

Depois de configurado, você pode acessar de **qualquer dispositivo conectado ao Tailscale** usando:

```
http://petshop
```

ou

```
http://petshop.seu-usuario.ts.net
```

**Exemplo prático:**

- Se você configurou o nome como `petshop`
- E seu usuário no Tailscale é `ericm`
- Você pode acessar por: `http://petshop` ou `http://petshop.ericm.ts.net`

### 4. Testar

1. Certifique-se de que está conectado ao Tailscale no dispositivo
2. Abra o navegador
3. Digite: `http://petshop` (ou o nome que você configurou)
4. Deve abrir o sistema!

## Vantagens

✅ **Nome fixo** - Nunca precisa mudar, mesmo se o IP mudar  
✅ **Funciona em qualquer dispositivo** - Celular, tablet, outro computador  
✅ **Sem configuração manual** - Não precisa editar arquivo hosts  
✅ **Seguro** - Só funciona para dispositivos conectados ao Tailscale

## Troubleshooting

### Não está funcionando?

1. **Verifique se o MagicDNS está ativo:**

   - Vá em https://login.tailscale.com/admin/settings/dns
   - Certifique-se de que "Use Tailscale DNS" está ativado

2. **Verifique o nome da máquina:**

   - No painel do Tailscale > Machines
   - Confirme o nome do servidor

3. **Reinicie o Tailscale no servidor:**

   ```bash
   sudo tailscale down
   sudo tailscale up
   ```

4. **Teste o DNS:**

   - No terminal, digite: `ping petshop` (ou o nome que você configurou)
   - Deve resolver para o IP do Tailscale

5. **Verifique se está conectado:**
   - Certifique-se de que o dispositivo está conectado ao Tailscale
   - Verifique o status na barra de tarefas/notificações

## Dica Extra

Você pode configurar múltiplos nomes para a mesma máquina usando **Tags** ou criando **subdomínios** no Tailscale, mas para uso simples, um nome é suficiente!
