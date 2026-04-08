#!/usr/bin/env bash
# check-patterns.sh — Validação rápida de padrões no pre-commit (lint-staged)
#
# Recebe lista de arquivos staged como argumentos.
# Bloqueia commit se encontrar violações.
# Cada check imprime a linha ofensora para fácil correção.

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

errors=0

# Filtra arquivos que existem (lint-staged pode passar arquivos deletados)
files=()
for f in "$@"; do
  [ -f "$f" ] && files+=("$f")
done

[ ${#files[@]} -eq 0 ] && exit 0

# ============================================================================
# CHECK 1: imports absolutos proibidos (~/layers/)
# ============================================================================
for f in "${files[@]}"; do
  case "$f" in *.ts|*.vue|*.js) ;; *) continue ;; esac
  # Testes unitários precisam de imports diretos (Node puro, sem auto-imports)
  case "$f" in */tests/*) continue ;; esac
  if grep -nE "from ['\"]~/layers/" "$f" 2>/dev/null; then
    echo -e "${RED}✗ CHECK 1: import absoluto ~/layers/ proibido${NC} → $f"
    echo "  Use auto-imports ou alias #shared"
    errors=$((errors + 1))
  fi
done

# ============================================================================
# CHECK 2: cores hardcoded em .vue (bg-white, bg-black, text-white, text-black)
# ============================================================================
for f in "${files[@]}"; do
  case "$f" in *.vue) ;; *) continue ;; esac
  # Exclui componentes base/ui/ (shadcn-vue) e variantes com opacidade (bg-white/20)
  case "$f" in */base/app/components/ui/*) continue ;; esac
  if grep -nE '\b(bg-white|bg-black|text-white|text-black)\b' "$f" 2>/dev/null | grep -vE '(bg-white|bg-black|text-white|text-black)/[0-9]' | grep -v '//.*\b(bg-white|bg-black)' | grep -qv 'dark:'; then
    grep -nE '\b(bg-white|bg-black|text-white|text-black)\b' "$f" 2>/dev/null | grep -vE '(bg-white|bg-black|text-white|text-black)/[0-9]'
    echo -e "${RED}✗ CHECK 2: cor hardcoded proibida${NC} → $f"
    echo "  Use bg-base-0/bg-base-950/text-base-0/text-base-950"
    errors=$((errors + 1))
  fi
done

# ============================================================================
# CHECK 3: useFetch em arquivos de service (use*Api.ts)
# ============================================================================
for f in "${files[@]}"; do
  case "$f" in *use*Api.ts) ;; *) continue ;; esac
  if grep -nE '\buseFetch\b' "$f" 2>/dev/null; then
    echo -e "${RED}✗ CHECK 3: useFetch proibido em service${NC} → $f"
    echo "  Use \$fetch direto em services"
    errors=$((errors + 1))
  fi
done

# ============================================================================
# CHECK 4: console.log (reforço do ESLint)
# ============================================================================
for f in "${files[@]}"; do
  case "$f" in *.ts|*.vue|*.js) ;; *) continue ;; esac
  if grep -nE '\bconsole\.log\b' "$f" 2>/dev/null | grep -qv '//'; then
    grep -nE '\bconsole\.log\b' "$f" 2>/dev/null | grep -v '//'
    echo -e "${YELLOW}✗ CHECK 4: console.log detectado${NC} → $f"
    echo "  Use logger.info/warn/error no server, remova no client"
    errors=$((errors + 1))
  fi
done

# ============================================================================
# CHECK 5: v-html sem sanitização
# ============================================================================
for f in "${files[@]}"; do
  case "$f" in *.vue) ;; *) continue ;; esac
  if grep -nE 'v-html' "$f" 2>/dev/null; then
    echo -e "${YELLOW}✗ CHECK 5: v-html detectado — verificar sanitização${NC} → $f"
    echo "  Certifique-se de que o valor é sanitizado (DOMPurify ou equivalente)"
    errors=$((errors + 1))
  fi
done

# ============================================================================
# Resultado
# ============================================================================
if [ $errors -gt 0 ]; then
  echo ""
  echo -e "${RED}✗ $errors violação(ões) de padrão encontrada(s). Commit bloqueado.${NC}"
  exit 1
fi

exit 0
