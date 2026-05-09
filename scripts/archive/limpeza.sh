#!/bin/bash
# --- PELIMOTION DEVOPS: SCRIPT DE LIMPEZA E REORGANIZAÇÃO ---

echo "🚀 Iniciando reorganização de diretórios..."

# 1. Criar a nova estrutura de pastas
mkdir -p assets/css assets/js contra_pipeline/medias

# 2. Mover arquivos CSS da raiz (se existirem)
mv *.css assets/css/ 2>/dev/null

# 3. Mover arquivos JS da raiz para assets/js (exceto scripts de sistema)
# Nota: admin.js já está em /admin, então não é afetado por mv *.js na raiz.
mv theme.js assets/js/ 2>/dev/null
mv *.js assets/js/ 2>/dev/null

# 4. Mover mídias e imagens da raiz para contra_pipeline/medias
mv *.png contra_pipeline/medias/ 2>/dev/null
mv *.jpg contra_pipeline/medias/ 2>/dev/null
mv *.mp4 contra_pipeline/medias/ 2>/dev/null

# 5. Mover conteúdo da pasta legada 'Medias Portfolio' para a nova estrutura
if [ -d "Medias Portfolio" ]; then
    echo "📦 Migrando conteúdo de 'Medias Portfolio' para 'contra_pipeline/medias'..."
    mv "Medias Portfolio"/* contra_pipeline/medias/ 2>/dev/null
fi

echo "✅ Reorganização concluída. Pastas /assets e /contra_pipeline prontas."
