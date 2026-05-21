#!/usr/bin/env bash
# wide-image-studio/scripts/verify-setup.sh
# Valida que todo o setup local está OK para começar a desenvolver.

set -uo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
CHECK="${GREEN}✓${NC}"
FAIL="${RED}✗${NC}"
WARN="${YELLOW}⚠${NC}"

cd "$(dirname "$0")/.."

EXIT_CODE=0
echo "=== wide-image-studio :: verify-setup ==="
echo

# Higgsfield CLI
if command -v hf &> /dev/null; then
  echo -e "$CHECK Higgsfield CLI: $(hf --version 2>/dev/null || echo 'instalado')"

  if hf whoami &> /dev/null; then
    USER=$(hf whoami 2>/dev/null)
    echo -e "$CHECK Autenticado como: $USER"

    CREDITS_JSON=$(hf credits --json 2>/dev/null || echo '{}')
    AVAILABLE=$(echo "$CREDITS_JSON" | jq -r '.available_usd // "unknown"' 2>/dev/null || echo "unknown")

    if [ "$AVAILABLE" = "unknown" ]; then
      echo -e "$WARN Não foi possível ler saldo (jq instalado?)"
    elif (( $(echo "$AVAILABLE < 5" | bc -l 2>/dev/null || echo 0) )); then
      echo -e "$WARN Créditos baixos: \$${AVAILABLE} (recomendado >\$5)"
    else
      echo -e "$CHECK Créditos disponíveis: \$${AVAILABLE}"
    fi

    # Verifica modelos críticos
    MODELS=$(hf models 2>/dev/null || echo "")
    for model in "seedream-5-lite" "nano-banana-pro" "soul"; do
      if echo "$MODELS" | grep -qi "$model"; then
        echo -e "$CHECK Modelo disponível: $model"
      else
        echo -e "$WARN Modelo não detectado no plano: $model (verifique seu pricing tier)"
      fi
    done
  else
    echo -e "$FAIL Não autenticado. Rodar: hf login"
    EXIT_CODE=1
  fi
else
  echo -e "$FAIL Higgsfield CLI não instalado. Rodar: ./scripts/install-hf-skills.sh"
  EXIT_CODE=1
fi

echo

# Skills
if [ -f ".claude/skills/higgsfield/SKILL.md" ]; then
  echo -e "$CHECK Skill oficial Higgsfield instalada"
else
  echo -e "$FAIL Skill oficial Higgsfield ausente. Rodar: ./scripts/install-hf-skills.sh"
  EXIT_CODE=1
fi

if [ -f ".claude/skills/wide-image/SKILL.md" ]; then
  echo -e "$CHECK Skill custom wide-image presente"
else
  echo -e "$FAIL Skill custom wide-image ausente. Restaurar do git: git checkout .claude/skills/wide-image/SKILL.md"
  EXIT_CODE=1
fi

echo

# Slash commands
for cmd in "verify-setup" "deploy-edge"; do
  if [ -f ".claude/commands/$cmd.md" ]; then
    echo -e "$CHECK Slash command /$cmd"
  else
    echo -e "$WARN Slash command /$cmd ausente"
  fi
done

echo

# Presets
if [ -f "presets/displays.json" ] && jq empty presets/displays.json 2>/dev/null; then
  PRESETS_COUNT=$(jq -r '.presets | length' presets/displays.json)
  echo -e "$CHECK presets/displays.json válido ($PRESETS_COUNT presets)"
else
  echo -e "$FAIL presets/displays.json inválido ou ausente"
  EXIT_CODE=1
fi

if [ -f "presets/styles.json" ] && jq empty presets/styles.json 2>/dev/null; then
  echo -e "$CHECK presets/styles.json válido"
else
  echo -e "$FAIL presets/styles.json inválido ou ausente"
  EXIT_CODE=1
fi

echo

# Auxiliares
command -v jq &> /dev/null \
  && echo -e "$CHECK jq instalado" \
  || echo -e "$WARN jq não instalado (recomendado: brew install jq)"

command -v supabase &> /dev/null \
  && echo -e "$CHECK Supabase CLI instalado" \
  || echo -e "$WARN Supabase CLI não instalado (necessário pra PR 3: brew install supabase/tap/supabase)"

command -v bunny &> /dev/null \
  && echo -e "$CHECK Bunny CLI instalado" \
  || echo -e "$WARN Bunny CLI não instalado (necessário pra PR 4 em diante: npm install -g @bunny.net/cli)"

command -v pnpm &> /dev/null \
  && echo -e "$CHECK pnpm instalado" \
  || echo -e "$WARN pnpm não instalado (recomendado pra PR 4: npm install -g pnpm)"

echo

# Env
if [ -f ".env" ]; then
  echo -e "$CHECK .env local presente"
elif [ -f ".env.example" ]; then
  echo -e "$WARN .env local ausente (copiar de .env.example quando precisar rodar local)"
fi

echo
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}=== Setup OK — pronto para desenvolver ===${NC}"
else
  echo -e "${RED}=== Setup com problemas — resolver itens marcados ✗ ===${NC}"
fi

exit $EXIT_CODE
