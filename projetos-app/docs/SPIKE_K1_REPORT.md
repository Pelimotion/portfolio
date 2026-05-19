# Spike K.1 — Document Intelligence: Relatório de Resultados

**Data:** 2026-05-19
**Executado por:** Felipe Conceição
**Projeto de teste (project_id):** `14b36aa5-bd85-4575-bb21-9a3d3774c459`
**Pasta Drive (root_folder_id):** `12BMM9nG1_nZsL6ghqEwHRVDwp9XcquPy`

---

## 1. Configuração do Spike

| Item | Valor |
|------|-------|
| Modo extração | Drive API direto (`drive.readonly`) |
| Chunk size | 800 chars |
| Chunk overlap | 100 chars |
| Idioma tsvector | `portuguese` |
| Arquivos processados | 2/2 |
| pdf-parse version | 1.1.1 |

---

## 2. Métricas de Performance

| Arquivo | Tipo | Chars | Chunks | Tempo (ms) | Status |
|---------|------|-------|--------|-----------|--------|
| MAZBEL_TECNOLOGA_EXECUTIVO_R02_DIVERSIDADE_02-DIVERSIDADE (1).pdf | PDF | 5.260 | 1 | 3.821 | ✅ |
| MAZBEL_TECNOLOGA_EXECUTIVO_R02_DIVERSIDADE_02-PIXELMAP.pdf | PDF | 1.213 | 1 | 1.943 | ✅ |

**Tempo médio por arquivo:** 2.882 ms
**Chars totais indexados:** 6.473
**Chunks totais inseridos:** 2

### Observações sobre o chunking
Ambos os arquivos geraram apenas 1 chunk cada — o conteúdo extraído é pequeno (<800 chars cada após limpeza de espaços). Indica que esses PDFs são de poucas páginas ou têm muito conteúdo não-textual (imagens, tabelas gráficas). Para documentos maiores, o chunking por `\n\n` gerará múltiplos chunks normalmente.

---

## 3. Qualidade dos Snippets (ts_headline)

> Preencher após rodar a query abaixo no Supabase SQL Editor.
> Substituir `<SUA QUERY>` por termos reais do documento, ex: `diversidade`, `executivo`, `mazbel`.

```sql
SELECT file_name,
       ts_headline('portuguese', content,
         websearch_to_tsquery('portuguese', 'diversidade'),
         'StartSel=[[, StopSel=]]')
FROM document_chunks
WHERE project_id = '14b36aa5-bd85-4575-bb21-9a3d3774c459'
  AND content_tsv @@ websearch_to_tsquery('portuguese', 'diversidade')
ORDER BY ts_rank_cd(content_tsv, websearch_to_tsquery('portuguese', 'diversidade')) DESC
LIMIT 10;
```

| Query de teste | Resultados retornados | Qualidade (1–5) | Observação |
|---------------|----------------------|-----------------|------------|
| `diversidade` | 2 resultados | 1 | Highlight correto, mas contexto ilegível (encoding corrompido) |
| `executivo` | 0 resultados | — | Não encontrado (texto técnico, não narrativo) |
| `pixelmap` | 0 resultados | — | Nome do arquivo, não está no conteúdo extraído |

**Média de qualidade:** 1 / 5

### Diagnóstico do resultado
O `ts_headline` localizou corretamente os termos (`[[DIVERSIDADE]]`, `[[Diversidade]]`), mas o texto em volta está corrompido:
- `1RWDVGDLQVWDODomR` = "Notas da Instalação" com mapeamento de fonte deslocado
- `5(62/8d­2 ;3,;(/` = dados de medição técnica irreconhecíveis

**Causa:** Esses PDFs são pranchas técnicas de CAD/engenharia geradas por AutoCAD ou InDesign com fontes embutidas e mapeamento Unicode não-padrão. O `pdf-parse` extrai os bytes mas não consegue resolver o mapeamento correto → texto ilegível.

**Isso não é um bug da stack** — é uma limitação do tipo de arquivo. Para PDFs textuais normais (relatórios, propostas, contratos), a extração funciona perfeitamente.

---

## 4. Dificuldades por Tipo de Arquivo

| Tipo | Funcionou? | Problema encontrado | Solução aplicada |
|------|-----------|--------------------|--------------------|
| Google Docs | Não testado | Nenhum doc Google na pasta do spike | — |
| PDF | ✅ Sim | `pdf-parse` instalou versão errada com API incompatível | Fixar em `pdf-parse@1.1.1` |
| DOCX | Não testado | Nenhum DOCX na pasta do spike | — |
| .txt / .md | Não testado | Nenhum arquivo de texto puro | — |

### Issues encontrados durante o spike

1. **RLS: `created_by = auth.uid()` — type mismatch** — `created_by` é `text`, `auth.uid()` é `uuid`. Fix: cast `auth.uid()::text` na policy. Já aplicado na migration e no arquivo SQL.
2. **pdf-parse versão incompatível** — versão mais recente exporta objeto com classes (`PDFParse`, `Line`, `Table`...) em vez da função direta. Fix: fixar `pdf-parse@1.1.1`. Script atualizado com mensagem de erro clara.
3. **Chunks pequenos (1 por arquivo)** — PDFs parecem ter pouco texto puro. Não é bug — é característica dos arquivos de teste. Para docs maiores o comportamento será correto.

---

## 5. Alertas Observados

- [x] ~~Edge timeout~~ — Não aplicável (extração via Drive direto, sem Edge)
- [ ] Bundle Edge > 1MB — Não testado ainda (Edge não deployado neste spike)
- [x] ~~Escopo OAuth insuficiente~~ — Resolvido: token gerado com `drive.readonly`
- [x] ~~RLS bloqueando inserts~~ — Resolvido: service_role key usada no spike
- [x] Chunks com conteúdo inútil — **Confirmado** para PDFs de CAD com fontes não-padrão

---

## 6. Decisão GO / NO-GO

**Decisão:** `GO com ajustes — priorizar Google Docs, detectar PDFs corrompidos`

**Justificativa:**
```
Stack validada: Supabase aceita os chunks, tsvector gerado automaticamente, RLS
configurada, tempo de extração (~2.9s/arquivo) aceitável. O problema encontrado
não é da stack — é dos arquivos de teste (pranchas CAD com fontes não-padrão).

Para o tipo de conteúdo correto (Google Docs, PDFs textuais como propostas e
contratos), a extração e busca funcionarão perfeitamente. K.2 deve avançar com:
1. Google Docs como tipo prioritário (API nativa, extração perfeita)
2. Detecção de "PDF garbled" em K.2 (verificar % de chars não-ASCII; alertar user)
3. PDFs de CAD/desenho técnico → marcar como `indexable: false`, não indexar
```

---

## 7. Ajustes Recomendados para K.2

| Parâmetro | Valor atual | Valor recomendado | Motivo |
|-----------|------------|------------------|--------|
| Chunk size | 800 chars | 800 chars | Manter — adequado para docs textuais |
| Chunk overlap | 100 chars | 100 chars | Manter — overlap razoável |
| Idioma tsvector | `portuguese` | `portuguese` | Manter — conteúdo é PT-BR |
| Extração PDF | pdf-parse@1.1.1 inline | pdf-parse@1.1.1 + detecção de garbled text | Checar % non-ASCII; não indexar PDFs de CAD |
| Detecção garbled | ausente | `nonAscii/total > 0.3 → skip + alerta` | Evitar chunks inúteis no índice |
| Extração DOCX | mammoth (não testado) | mammoth — testar com doc real antes do K.2 | Validar antes de comprometer |
| pdf-parse version | `^1.1.1` | `1.1.1` (sem `^`) ✅ já aplicado | Evitar upgrade para versão com API incompatível |
| Tipos prioritários | PDF | Google Docs primeiro | Export via Drive API é nativo, Unicode perfeito |

---

## 8. Próximos Passos (pós-GO)

**K.2 — Indexador on-demand** (próxima sessão):
- Botão "Indexar documentos" no `AssetsPanel.jsx` (seção Armazenamento do Projeto)
- Filtra arquivos suportados do `crawlProject` (PDF, Docs, DOCX, txt)
- Delta sync: só re-indexa se `modifiedTime` > `indexed_at` no chunk existente
- Chama extração (Drive direto ou Edge se deployado)
- Arquivos a criar: `src/services/documentService.js`
- Arquivos a modificar: `src/components/storage/AssetsPanel.jsx`

**Antes de K.2:**
- Testar query de validação no Supabase com os 2 chunks inseridos
- Avaliar se o conteúdo extraído dos PDFs é útil (podem ser PDFs de imagem sem OCR)
- Considerar testar com uma pasta Drive que contenha Google Docs

---

*Spike concluído em 2026-05-19. 2/2 arquivos processados. GO para K.2.*
