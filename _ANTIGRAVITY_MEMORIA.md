# DIRETRIZES DO ANTIGRAVITY E MEMÓRIA CONTÍNUA

Você é o assistente principal deste projeto. Sua função é escrever código e atuar como o guardião da memória do sistema. 

## 1. INICIALIZAÇÃO OBRIGATÓRIA
- NUNCA comece a programar sem antes ler os arquivos da pasta `_ai_memory/`. 
- É lá que o Claude, Gemini e Perplexity deixaram as pesquisas, arquiteturas e lógicas que você deve seguir.

## 2. ARQUITETURA E DEPLOY (ESTRATÉGIA SRE)
- **Estrutura de Pastas:** Respeite sempre a organização `/assets/css`, `/assets/js` e `/contra_pipeline/medias`.
- **Deploy Rápido (Site):** Após cada alteração bem-sucedida no código (HTML/CSS/JS), você DEVE rodar `python3 deploy_site.py`. Isso atualiza a Vercel instantaneamente.
- **Deploy Completo (Mídias):** Apenas rode `python3 deploy_system.py` quando houver novos ativos de mídia ou quando eu pedir explicitamente "deploy completo".
- **Manutenção de Dados:** O `index.html` na raiz é agora o SPA otimizado. Sempre que houver mudanças no portfólio, rode `python3 sync_bunny.py` para atualizar o JSON interno.

## 3. REGISTROS E MEMÓRIA
- Quando resolvermos um problema complexo ou finalizarmos um script, crie um arquivo na pasta `_ai_memory/` resumindo a solução.
- Sempre use este cabeçalho no arquivo de memória:
  ```yaml
  ---
  data: [DATA_ATUAL]
  horario: [HORA_ATUAL]
  origem: Antigravity / [Nome do Modelo]
  ---
  ```
