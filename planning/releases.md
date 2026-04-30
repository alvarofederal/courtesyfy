# Basemedical - Histórico de Releases

## Versão Atual: 1.0.2

---

## v1.0.2 (Março 2026)
**Branch:** develop → main
**Status:** Em produção

### Mudanças
- Correção no tempo de explosão do confeti (UX)
- Atualizações do perfil para acordion sem valor padrão
- Atualização para acordion no perfil
- Correções nos services
- Melhorias em scripts de email
- Melhorias no onboarding

---

## v1.0.1 (Data estimada: Fev/Mar 2026)
**Status:** Produção

### Mudanças (estimadas a partir do histórico git)
- Iterações de onboarding
- Correções de serviços
- Melhorias gerais de UX

---

## v1.0.0 (Lançamento inicial)
**Status:** Produção

### Funcionalidades do MVP
- Sistema de autenticação completo
- Perfil do profissional
- Agendamento básico
- Página pública do profissional
- Sistema de planos (FREE/PROFESSIONAL)
- Integração Stripe
- Reviews e avaliações
- Busca de profissionais
- Waitlist
- Editor de landing page
- Painel administrativo

---

## Processo de Release

```bash
# 1. Criar branch de release
git checkout develop
git checkout -b release/x.x.x

# 2. Atualizar versão (automático no build)
# scripts/update-version.js cuida disso

# 3. Testar em staging

# 4. Merge para main e develop
git checkout main
git merge release/x.x.x
git tag vx.x.x

git checkout develop
git merge release/x.x.x

# 5. Deletar branch de release
git branch -d release/x.x.x
```

---

## Próximas Releases Planejadas

| Versão | Foco | Status |
|--------|------|--------|
| v1.1.0 | Relatórios completos | Em desenvolvimento |
| v1.2.0 | Lembretes automáticos | Backlog |
| v1.3.0 | Notificações push | Backlog |
| v2.0.0 | Multi-profissional (clínicas) | Planejado |

---

*Atualizado em: 2026-03-10*
