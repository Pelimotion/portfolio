#!/bin/bash

# Este script ficará rodando no seu terminal e monitorando seu repositório Git.
# A cada 5 segundos ele verifica se há alguma alteração não salva.
# Se houver, a atualização instantânea para a Vercel é disparada!

echo "🚀 Iniciando o Autopilot de Deploy da Pelimotion..."
echo "👀 O script está agora vigiando a pasta:" $(pwd)
echo "--------------------------------------------------------"

while true; do
  # O comando abaixo verifica se existe algum arquivo modificado ou novo
  if [[ -n $(git status --porcelain) ]]; then
    echo ""
    echo "⚡ Alteração detectada no código!"
    echo "📦 Preparando pacote..."
    
    git add .
    git commit -m "Auto-update: $(date +'%Y-%m-%d %H:%M:%S')"
    
    echo "🚀 Lançando para a Vercel (Push)..."
    git push origin main
    
    echo "✅ Deploy disparado com sucesso! Voltando a patrulhar..."
    echo "--------------------------------------------------------"
  fi
  
  # Espera 5 segundos antes de checar de novo (para não sobrecarregar sua máquina)
  sleep 5
done
