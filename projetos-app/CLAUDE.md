@../AI_AGENT_BRIEFING.md
@STATUS.md

# AGENTE: PROJETOS-APP (Gerenciador Interno)
**Última atualização:** 2026-05-17 | **Status:** BETA / TESTES

---

## O Que Este Projeto Faz
Gerenciador de projetos interno da Pelimotion.
- **Hoje:** Kanban de projetos com cenas e daily log
- **Futuro:** hub operacional e administrativo completo (ERP leve)

> **IMPORTANTE:** Este é o único projeto React do ecossistema.
> Não importar lógica daqui para projetos Vanilla. Manter isolado.

---

## Stack
| Camada | Tecnologia |
|--------|-----------|
| Framework | React + Vite |
| Estilização | Tailwind CSS + Shadcn/ui |
| DB/Auth | Supabase (Email/Senha) |
| Deploy | Vercel (subpasta `projetos-app/dist`) |

## Comandos
```bash
cd projetos-app
npm run dev     # desenvolvimento local (porta 5173)
npm run build   # build de produção → dist/
```

---

## Banco de Dados (Schema)
```sql
projects  (id, title, description, status, drive_folder_url, created_at)
scenes    (id, project_id, title, status, position, drive_url, created_at)
daily_log (id, scene_id, user_email, note, created_at)
```

## Status de Kanban
- **Projetos:** `briefing | producao | revisao | entregue`
- **Cenas:** `a_fazer | em_progresso | revisao | concluido`

---

## Módulos Planejados
- [x] Gerenciamento básico de projetos (Kanban)
- [x] Detalhe de cenas
- [x] Daily log por cena
- [ ] Dashboard financeiro / faturamento
- [ ] Integração com calendário editorial do blog-generator
- [ ] Aprovação de conteúdo (vagas, editais)
- [ ] Avatar Engine (PS2-era, idle behaviors)

---

## STATUS — Histórico de Sessões
### 2026-05-16 — Build e runtime errors corrigidos
- JSX syntax errors em UniversalEntityPage corrigidos
- ReferenceErrors de variáveis undefined resolvidos
- Kanban e dashboard views funcionais
- Próxima sessão: integrar dashboard com calendário editorial
