# Roadmap: Pelimotion Portfolio Refactor

## Milestone: v1.0 — Professionalization & Security

**Goal:** Transform the codebase into a secure, organized, and optimized professional project.

### Phase 1: Structural Cleanup & Script Consolidation
**Goal:** Clean the root directory and organize all automation tools.
- [ ] **Plan 1.1:** Create `/scripts` and move all `*.py` and `*.sh` files.
- [ ] **Plan 1.2:** Update all internal script references and `vercel.json` paths.
- [ ] **Plan 1.3:** Set up `requirements.txt` for Python dependencies.

### Phase 2: Security Hardening
**Goal:** Remove hardcoded secrets and implement proper environment configuration.
- [ ] **Plan 2.1:** Implement `.env` support in Python scripts and move Bunny.net keys.
- [ ] **Plan 2.2:** Update `.gitignore` and audit for any leaked secrets in history.
- [ ] **Plan 2.3:** Review admin panel authentication logic.

### Phase 3: Version Unification
**Goal:** Resolve the fragmentation between `V1/`, `v2/`, and the root application.
- [ ] **Plan 3.1:** Map differences between `V1/` and current root.
- [ ] **Plan 3.2:** Consolidate into a single stable production structure.
- [ ] **Plan 3.3:** Clean up redundant JSON files (`content.json` vs `site-content.json`).

### Phase 4: Optimization & Verification
**Goal:** Final polish and performance checks.
- [ ] **Plan 4.1:** Optimize JSON data loading in `portfolio.js`.
- [ ] **Plan 4.2:** Final audit of media delivery paths.
- [ ] **Plan 4.3:** Create project documentation (README.md).

---
## Milestone: v2.0 — Google Drive Integration & Automation

**Goal:** Implement automated asset management and cloud storage integration.

### Phase 5: GDrive Infrastructure
**Goal:** Setup secure API communication and directory caching.
- [ ] **Plan 5.1:** Configure Google OAuth 2.0 flow for project-level access.
- [ ] **Plan 5.2:** Implement `storageProvider.js` with directory crawling logic.
- [ ] **Plan 5.3:** Create `storage_folders` sync mechanism in Supabase.

### Phase 6: Automated Explorer UI
**Goal:** Replace manual link pasting with a visual file explorer.
- [ ] **Plan 6.1:** Build `DirectoryExplorer` component with tree navigation.
- [ ] **Plan 6.2:** Integrate explorer into `AssetsPanel` for role-based linking.
- [ ] **Plan 6.3:** Implement "Breadcrumb" and "Search" for fast folder locating.

### Phase 7: Intelligent Linking
**Goal:** Automate the association between scenes and folders.
- [ ] **Plan 7.1:** Implement fuzzy-match logic for scene name -> folder name.
- [ ] **Plan 7.2:** Create "Bulk Link" tool for importing entire project structures.
- [ ] **Plan 7.3:** Validate link integrity and broken path detection.

---
## Milestone: v3.0 — Automated Motion Branding Hub

**Goal:** Transform the blog into an automated hub of authority and inspiration, minimizing manual intervention using integrations, Webhooks, and RSS.

### Phase 8: Fundação do Hub & CMS Setup
**Goal:** Criar a estrutura base de coleções de dados, categorias automáticas e design.
- [ ] **Plan 8.1:** Configurar coleções principais de dados no gerador (Posts, Vagas, Eventos, Recursos, Estúdios).
- [ ] **Plan 8.2:** Implementar geração automática de páginas de Coleções Temáticas/Tags.
- [ ] **Plan 8.3:** Instalar e configurar módulo de Newsletter nativo (ex: RSS-to-email Mailchimp).
- [ ] **Plan 8.4:** Adaptar a página "Sobre" e "Contato".

### Phase 9: Automação Inicial de Conteúdo
**Goal:** Povoar o hub com os primeiros cases e automatizar a série semanal "Motion da Semana".
- [ ] **Plan 9.1:** Criar 3 posts iniciais (Case, Tutorial e Motion da Semana manual).
- [ ] **Plan 9.2:** Configurar automação primária no Make.com/Zapier para a série "Motion da Semana" usando API do Vimeo/YouTube.
- [ ] **Plan 9.3:** Integrar IA (OpenAI API) na geração automática da descrição e metadados dos posts semanais.

### Phase 10: Automação de Vagas e Eventos
**Goal:** Implementar o fluxo zero-toque para Vagas de Emprego e Agenda de Eventos.
- [ ] **Plan 10.1:** Integrar widget ou scraper de vagas (Jooble, Indeed ou LinkedIn via SerpApi) com filtro de palavras-chave.
- [ ] **Plan 10.2:** Configurar sistema de geolocalização por IP (ipapi.co) para filtrar vagas e eventos automaticamente por país/cidade.
- [ ] **Plan 10.3:** Integrar API do Eventbrite/Meetup para popular a agenda de eventos, rodando via webhook diário.

### Phase 11: Recursos, Diretório & SEO
**Goal:** Implementar o diretório de parceiros e a página de recursos alimentada externamente.
- [ ] **Plan 11.1:** Criar formulário de submissão para o Diretório de Estúdios (auto-publicação).
- [ ] **Plan 11.2:** Configurar feed RSS (via Pocket/Raindrop/Google Sheets) para a página dinâmica de Recursos e Ferramentas.
- [ ] **Plan 11.3:** Otimização técnica: sitemap.xml automático, otimização de imagens, e prompts de SEO gerados via IA.

### Phase 12: Testes Zero-Toque & Lançamento
**Goal:** Validar o ciclo completo de automação e garantir robustez do sistema em ambiente de produção.
- [ ] **Plan 12.1:** Simular navegação end-to-end com múltiplas localizações (VPNs) para testar vagas e eventos.
- [ ] **Plan 12.2:** Validar disparo de automação da Newsletter a partir do feed RSS.
- [ ] **Plan 12.3:** Ajustar frequências e rate limits das APIs externas para não exceder limites de uso.

---
*Roadmap updated: 2026-05-16*
