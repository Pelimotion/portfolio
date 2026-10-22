# ARQUITETURA TÉCNICA DO SISTEMA — PELIMOTION
> **Documento de Engenharia e Especificação Técnica Formal**  
> Destinado a Arquitetos de Software, Engenheiros Frontend Sênior e Especialistas em Infraestrutura Edge.

---

## 1. Visão Arquitetural Sistêmica

O ecossistema **Pelimotion** opera sob uma arquitetura de alta performance distribuída globalmente sob o domínio principal (`pelimotion.art`), combinando:
1. **Entrega Estática na Borda (Vercel Global Edge):** Payload HTML/CSS/JS ultraleve (~17 MB total), com tempo de resposta sub-segundo e cabeçalhos de segurança padrão empresarial.
2. **Entrega de Mídia Massiva (Bunny.net CDN Replicada):** Pull Zone dedicada com suporte nativo a streaming de vídeo em loop, áudio master e previews com HTTP 206 (Byte-Range), sem consumir cotas de transferência da origem.
3. **Persistência Relacional em Tempo Real (Supabase Cloud):** Autenticação unificada (Google OAuth + Email/Senha) e banco PostgreSQL com Row Level Security (RLS) e controle de permissões por roles.
4. **Pavilhão 3D Autoral Desacoplado (gigantera.xyz):** Pavilhão tridimensional em WebGL operando sob infraestrutura dedicada com redirecionamento 301 a partir de `pelimotion.art/gigantera`.

```
                              [ INTERNET / CLIENTES ]
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
     [ HTTP / SSL : pelimotion.art ]                 [ CDN : pelimotion-portfolio.b-cdn.net ]
                 │                                               │
        ┌────────┴────────┐                             ┌────────┴────────┐
        ▼                 ▼                             ▼                 ▼
 [ Vercel Edge ]   [ Serverless API ]            [ Bunny Edge BR/DE/NY ] [ Storage Zone ]
  - index.html      - /api/config                 - .mp4 streaming        - High-res Stills
  - /bora (Intake)  - /api/meta-ads               - .mp3 range 206        - Audio Masters
  - /portfolio      - /api/send-briefing          - ffmpeg-core.wasm      - Audio Previews
  - /curriculum     - /api/upload-frame           - 3D textures           - Video Loops
  - /penumbra       - /api/invite-member
        │
        ▼
 [ Supabase PostgreSQL ]
  - Auth (OAuth / JWT)
  - RLS (Projects / Scenes / Logs / Roles)
```

---

## 2. Módulo `/bora`: Intake de Briefing, Black Neumorphism & Escopo Estruturado

O módulo `/bora` (`pelimotion.art/bora`) atua como o ponto de intake qualificado e orçamentação técnica do estúdio, substituindo formulários genéricos por uma experiência tátil imersiva.

### 2.1 Princípios de Design & Engenharia
1. **Desacoplamento de Preço Público:**
   - Evita ancoragens artificiais; o orçamento é formulado pelo diretor criativo após análise técnica do briefing.
2. **Protocolo Criptográfico Único (`BORA-26-XXXX`):**
   - Identificador gerado no início da sessão e embutido no assunto do e-mail do ateliê (`hello@pelimotion.art`) e na mensagem direta do WhatsApp.
3. **Estratégia de Saída Dupla (Dual Exit):**
   - **WhatsApp Instantâneo:** Direciona para conversa direta com Felipe Conceição com o código de protocolo pré-preenchido.
   - **Retorno por E-mail:** Confirmação em tela com cópia do código e garantia de resposta formal.
4. **Black Neumorphism & Zero Color Noise:**
   - Paleta monocromática em obsidiana (`#08080a`, `#0e0e12`, `#131318`).
   - Sombras extrudadas: `box-shadow: 8px 8px 24px rgba(0,0,0,0.75), -6px -6px 20px rgba(255,255,255,0.025)`.
   - Entradas cavadas (debossed): `box-shadow: inset 4px 4px 10px rgba(0,0,0,0.85)`.
   - Padrão de textura da marca em marca d'água (`assets/patterns/pattern01_web.jpg`) a 4% de opacidade com `mix-blend-mode: screen`.
5. **Audio Haptics Nativo:**
   - Síntese harmônica via Web Audio API com osciladores senoidais (380Hz, 440Hz, 520Hz) disparados sutilmente em interações e trocas de aba, com controle mute no cabeçalho.

---

## 3. Módulo `/penumbra`: Web Bridge & Cockpit de Telemetria

O subdiretório `/penumbra` fornece a interface web de monitoramento e controle para a engine áudio-reativa do estúdio (TouchDesigner + NDI Telemetry), permitindo controle em tempo real de:
- Crossfader linear e corte de pulso A/B.
- Opacidade por canal e camadas de composição.
- Ajuste de parâmetros tonais analógicos de pós-processamento.
- Janela flutuante (`popout.html`) desacoplável para operação em segundo monitor durante performances ao vivo.

---

## 4. Política de Segurança & Cabeçalhos HTTP na Borda

O arquivo [`vercel.json`](./vercel.json) injeta cabeçalhos de segurança estritos em todas as rotas do domínio:
- `X-Content-Type-Options: nosniff`: Previne sniffing de MIME types.
- `X-Frame-Options: SAMEORIGIN`: Impede clickjacking externo enquanto permite o popout do `/penumbra`.
- `Referrer-Policy: strict-origin-when-cross-origin`: Protege dados de telemetria e navegação.
- `Cache-Control: public, max-age=31536000, immutable` para ativos versionados em `/assets/`.
- `Cache-Control: public, max-age=2592000, stale-while-revalidate=86400` para favicons e imagens estáticas.

---

## 5. Arquitetura de Mídia & Bunny.net CDN

Para assegurar **Zero Bandwidth Transfer** na origem estática, todas as mídias pesadas operam na CDN:
- **Storage Zone:** `pelimotion-portfolio` (replicação em Nova York, Frankfurt e São Paulo).
- **Pull Zone CDN:** `https://pelimotion-portfolio.b-cdn.net/`.
- **Streaming Byte-Range (HTTP 206):** Suporte nativo para vídeos em loop e áudios master, permitindo busca instantânea (*seeking*) e economia de dados.
- **Isolamento de Backups:** Diretório `_BACKUP_PARA_REMOVER/` listado em `.gitignore` e `.vercelignore`, garantindo deploy limpo de apenas arquivos de produção.

---

## 6. Procedimento de Build & Validação

### Passo 1: Executar Build Local
```bash
npm run build
# scripts/build.js limpa dist/ e copia os 20+ módulos ativos reportando métricas de arquivo e duração
```

### Passo 2: Executar Teste Local
```bash
npx serve dist
```

### Passo 3: CI/CD
Qualquer push na branch `main` ativa o workflow `.github/workflows/ci.yml`, validando a compilação estática antes do deploy de produção no Vercel.

---
*Pelimotion Studio — Creative Direction & Motion Branding. 2026.*
