#!/usr/bin/env bash
# wide-image-studio/scripts/install-hf-skills.sh
# Instala Higgsfield CLI + Skills oficiais para uso DEV-time no Claude Code.
# Roda 1 vez por máquina. Idempotente (skip silencioso se já instalado).

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}→${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $1"; }
fail()  { echo -e "${RED}✗${NC} $1" >&2; exit 1; }

cd "$(dirname "$0")/.."

info "Verificando Higgsfield CLI..."
if ! command -v hf &> /dev/null; then
  info "Instalando Higgsfield CLI..."
  if command -v brew &> /dev/null; then
    brew install higgsfield/tap/hf
  elif command -v npm &> /dev/null; then
    npm install -g @higgsfield/cli
  else
    fail "Nem brew nem npm disponíveis. Instale um deles primeiro."
  fi
else
  info "Higgsfield CLI já instalado: $(hf --version)"
fi

info "Verificando login..."
if ! hf whoami &> /dev/null; then
  warn "Não autenticado. Abrindo OAuth no browser..."
  hf login
else
  info "Logado como: $(hf whoami)"
fi

info "Verificando saldo de créditos..."
CREDITS=$(hf credits --json 2>/dev/null | jq -r '.available_usd // "?"' || echo "?")
info "Créditos disponíveis: \$${CREDITS}"

info "Instalando Skills oficiais Higgsfield..."
if [ ! -d ".claude/skills/higgsfield" ]; then
  hf skills install --target ./.claude/skills/
  info "Skill oficial instalada em .claude/skills/higgsfield/"
else
  info "Skill oficial já presente. Atualizando..."
  hf skills update --target ./.claude/skills/higgsfield || warn "Update opcional falhou; OK continuar."
fi

info "Verificando Skill custom 'wide-image'..."
if [ ! -f ".claude/skills/wide-image/SKILL.md" ]; then
  fail "Skill custom não encontrada. Algo deletou .claude/skills/wide-image/SKILL.md — restaurar do git."
fi

info "Verificando dependências auxiliares..."
command -v jq &> /dev/null || warn "jq não instalado (recomendado): brew install jq"
command -v supabase &> /dev/null || warn "supabase CLI não instalado: brew install supabase/tap/supabase"
command -v bunny &> /dev/null || warn "bunny CLI não instalado: npm install -g @bunny.net/cli"

echo
info "Setup concluído. Próximo passo: rodar ./scripts/verify-setup.sh"
