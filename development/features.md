# Courtesyfy - Features em Desenvolvimento

## Como usar este arquivo

Liste aqui as features que estão **ativamente em desenvolvimento**.
Quando concluir, mova o item para `releases.md` ou archive.

---

## 🔴 Em Andamento

### Stripe / Cobrança
**Início:** —
**Prioridade:** Alta

**Contexto:**
Integrar Stripe para cobrança recorrente dos lojistas. Sem isso não há receita.

**Progresso:**
- [ ] Definir planos e preços (ESSENCIAL / PROFISSIONAL / EMPRESARIAL)
- [ ] Criar produtos e preços no Stripe Dashboard
- [ ] Checkout via Stripe (novo lojista)
- [ ] Webhook para ativar/bloquear conta após pagamento
- [ ] Portal do cliente (gerenciar assinatura)
- [ ] Bloquear features por plano (limites de campanha, chaves etc.)

---

### API pública `/api/chaves/validar`
**Início:** —
**Prioridade:** Alta

**Contexto:**
Endpoint REST para lojistas que têm totem ou PDV próprio integrarem a validação de chaves sem usar o dashboard.

**Progresso:**
- [ ] `POST /api/chaves/validar` — recebe código, retorna status + benefício
- [ ] Autenticação via API Key da loja
- [ ] Rate limiting por loja
- [ ] Documentação básica

---

## ✅ Concluídas Recentemente

### Email de confirmação ao cliente na ativação
**Concluído:** Maio 2026
**Descrição:** Ao ativar uma chave, se o cliente informou e-mail, dispara email com código, benefício, validade e instruções de resgate. Fire-and-forget — falha não bloqueia ativação.

### Página /c/[codigo] com layout da campanha
**Concluído:** Maio 2026
**Descrição:** A página pública de resgate agora carrega o layout vinculado à campanha (cores, imagem de fundo, estilo, raio dos cards). Fallback: layout padrão da loja → cores da loja.

### Migração de chaves entre campanhas
**Concluído:** Maio 2026
**Descrição:** Lojista pode migrar chaves não resgatadas de campanhas expiradas/encerradas para campanhas ativas. QR Codes físicos continuam funcionando.

### Vigência de campanhas + trava de geração
**Concluído:** Maio 2026
**Descrição:** Indicadores visuais de campanha expirada/expirando nas listas. Bloqueio de geração de chaves para campanhas expiradas.

### Datas de criação e validade nas listas de chaves
**Concluído:** Maio 2026
**Descrição:** Coluna de data de criação e indicador de validade (com cores) nas listas de lotes e chaves.

### Página /resgatar — digitação + scanner QR
**Concluído:** Maio 2026
**Descrição:** Página pública para o cliente digitar ou escanear um QR Code e ser redirecionado para a página da chave.

### Dark mode completo + separação admin vs lojista
**Concluído:** Maio 2026
**Descrição:** Design system com tokens dark mode em todas as páginas. Configurações do admin separadas das configurações da loja.

---

## ⏸️ Pausadas / Em Espera

*Nenhuma no momento*

---

## Padrão para adicionar nova feature

```markdown
### Nome da Feature
**Início:** [data]
**Prioridade:** Alta/Média/Baixa

**Contexto:**
[Descrição do problema que resolve e por que é necessária]

**Progresso:**
- [ ] Item 1
- [ ] Item 2

**Arquivos relevantes:**
- [lista de arquivos]
```

---

*Atualizado em: 2026-05-12*
