#!/bin/bash

# Este script ficará rodando no seu terminal e monitorando seu repositório Git.
# A cada 5 segundos ele verifica se há alguma alteração não salva.
# Se houver, a atualização instantânea para a Vercel é disparada!

echo "🚀 Iniciando o Autopilot de Deploy da Pelimotion..."
echo "👀 O script está agora vigiando a pasta:" $(pwd)
echo "--------------------------------------------------------"

LAST_MEDIA_COUNT=$(find "Medias Portfolio" -type f 2>/dev/null | wc -l)

while true; do
  # O comando abaixo verifica se existe algum arquivo modificado no git
  GIT_CHANGES=$(git status --porcelain)
  
  # Verifica se foram adicionados/removidos arquivos de mídia (ignorados pelo git)
  CURRENT_MEDIA_COUNT=$(find "Medias Portfolio" -type f 2>/dev/null | wc -l)
  
  if [[ -n "$GIT_CHANGES" ]] || [[ "$CURRENT_MEDIA_COUNT" != "$LAST_MEDIA_COUNT" ]]; then
    echo ""
    echo "⚡ Alteração detectada no repositório ou na pasta de Mídias!"
    echo "📦 Iniciando pipeline de deploy completo (Bunny -> GitHub -> Vercel)..."
    
    LAST_MEDIA_COUNT=$CURRENT_MEDIA_COUNT
    
    # Executa o sistema de deploy que já faz a otimização, sync e git push
    python3 deploy_system.py
    
    echo "✅ Pipeline executado! Voltando a patrulhar..."
    echo "--------------------------------------------------------"
  fi
  
  # Espera 5 segundos antes de checar de novo (para não sobrecarregar sua máquina)
  sleep 5
done
