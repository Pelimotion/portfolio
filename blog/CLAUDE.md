# AGENTE: BLOG / PORTAL PELIMOTION
**Última atualização:** 2026-05-16 | **Status:** ESTÁVEL — não alterar sem sessão dedicada

---

## O Que Este Projeto Faz
Frontend público do Pelimotion.
- **Hoje:** blog de artigos sobre motion design e branding
- **Futuro:** portal completo com vagas, eventos, notícias e recursos

> **REGRA CRÍTICA:** Os arquivos HTML desta pasta são GERADOS pelo `blog-generator/index.js`.
> Nunca edite diretamente. Para mudar o template visual, edite o build engine.

---

## Arquitetura
- Conteúdo: HTML estático gerado pelo `blog-generator/index.js`
- Imagens: servidas pelo Bunny.net CDN
- Zero banco de dados em runtime (100% estático)
- Deploy: Vercel serve os arquivos diretamente

## Estrutura de Pastas
```
blog/
├── index.html          ← lista de artigos (gerado)
├── sitemap.xml         ← sitemap SEO (gerado)
├── [slug].html         ← página de cada artigo (gerado)
└── assets/[slug]/      ← imagens do artigo (via CDN, não commitadas)
```

---

## Seções do Portal (Roadmap)
| Rota | Status | Descrição |
|------|--------|-----------|
| `/blog` | ATIVO | Artigos de motion design e branding |
| `/blog/vagas` | PLACEHOLDER | Oportunidades e editais |
| `/blog/eventos` | PLANEJADO | Agenda motion/design |
| `/blog/noticias` | PLANEJADO | News feed curado |
| `/blog/recursos` | PLANEJADO | Ferramentas e links |

---

## Schema Universal de Conteúdo (para expansão futura)
Todas as seções usarão o mesmo modelo base no Supabase:
```json
{
  "type": "article | job | event | news | resource",
  "slug": "string",
  "title": "string",
  "meta_description": "string",
  "meta_title": "string",
  "category": "string",
  "status": "draft | published | review",
  "content": "markdown",
  "data": {
    "images": "[{ id, url, role, prompt }]",
    "date": "ISO 8601",
    "lang": "pt | en"
  }
}
```

---

## STATUS — Histórico de Sessões
### 2026-05-16 — SEO v6.0 implementado via blog-generator
- Open Graph, Twitter Cards, Canonical, Schema.org JSON-LD em todos os posts
- Sitemap.xml gerado automaticamente
- Próxima sessão: adicionar seção `/vagas` com template dedicado
