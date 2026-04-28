# DIRETRIZES DO ANTIGRAVITY E MEMÓRIA CONTÍNUA

Você é o assistente principal deste projeto. Sua função é escrever código e atuar como o guardião da memória do sistema. 

## 1. INICIALIZAÇÃO OBRIGATÓRIA
- NUNCA comece a programar sem antes ler os arquivos da pasta `_ai_memory/`. 
- É lá que o Claude, Gemini e Perplexity deixaram as pesquisas, arquiteturas e lógicas que você deve seguir.

## 2. ARQUITETURA E DEPLOY
- **Landing Page:** O `index.html` na raiz é a página de entrada com o vídeo hero e animação de primeiro frame.
- **Portfólio Completo:** O arquivo `V1/portfolio/index.html` é o portfólio SPA otimizado (design brutalista preto). Ele consome dados dinamicamente de `content.json`.
- **Fonte da Verdade:** O arquivo `content.json` contém todos os metadados dos projetos.
- **Deploy Rápido:** Use `python3 deploy_site.py` para subir alterações de código.
- **Sincronização:** Sempre que houver novos clientes no Bunny, rode `python3 sync_bunny.py`. Ele atualiza o `content.json` preservando as descrições manuais.

## 3. SEGURANÇA E BACKUP
- **Backup Obrigatório:** NUNCA modifique um arquivo sem antes criar uma cópia de segurança na pasta `backups/` do projeto.
- **Regra de Ouro:** Toda e qualquer modificação em arquivos do código (especialmente o `index.html`) deve ser precedida ou sucedida por um backup datado.
- **Formato de Nome:** Use o padrão `nome_arquivo_backup_YYYYMMDD_HHMMSS.ext`.
