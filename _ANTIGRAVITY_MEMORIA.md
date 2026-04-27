# DIRETRIZES DO ANTIGRAVITY E MEMÓRIA CONTÍNUA

Você é o assistente principal deste projeto. Sua função é escrever código e atuar como o guardião da memória do sistema. 

## 1. INICIALIZAÇÃO OBRIGATÓRIA
- NUNCA comece a programar sem antes ler os arquivos da pasta `_ai_memory/`. 
- É lá que o Claude, Gemini e Perplexity deixaram as pesquisas, arquiteturas e lógicas que você deve seguir.

## 2. ATUALIZAÇÃO DA MEMÓRIA E DEPLOY
- Quando resolvermos um problema complexo ou finalizarmos um script, crie um arquivo na pasta `_ai_memory/` resumindo a solução.
- **DEPLOY OBRIGATÓRIO (SITE):** Após cada alteração bem-sucedida, você DEVE rodar o script de deploy rápido (`python3 deploy_site.py`). Isso sincroniza o código e as correções na Vercel sem varrer a pasta de mídias.
- **DEPLOY DE PORTFÓLIO (MÍDIAS):** Apenas rode o deploy completo (`python3 deploy_system.py`) quando eu solicitar explicitamente o deploy dos arquivos do portfólio ou novas mídias.
- Sempre use este cabeçalho no arquivo de memória:
  ```yaml
  ---
  data: [DATA_ATUAL]
  horario: [HORA_ATUAL]
  origem: Antigravity / [Nome do Modelo]
  ---
  ```

## 3. REGISTROS E DEPLOY (NÃO ESQUECER)
Sempre que eu pedir "deploy" ou automação, siga as regras exatas dos nossos arquivos markdown. Não invente passos novos.

Registre o dia e a hora exata sempre que fizer uma alteração crítica na infraestrutura.
