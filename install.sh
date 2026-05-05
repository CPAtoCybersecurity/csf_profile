#!/usr/bin/env bash
# CSF Profile Assessment Tool — Guided Installer
# Usage: bash install.sh  (or: curl -sSL <url>/install.sh | bash)
# This file is intentionally readable. Inspect it before piping to bash.

set -euo pipefail

INSTALLER_PORT=31338
REPO_URL="https://github.com/CPAtoCybersecurity/csf_profile.git"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"

# ── Colours ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'
BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}▶${RESET} $*"; }
success() { echo -e "${GREEN}✔${RESET} $*"; }
warn()    { echo -e "${YELLOW}⚠${RESET} $*"; }
error()   { echo -e "${RED}✖${RESET} $*" >&2; }
die()     { error "$*"; exit 1; }

# ── 1. Check Git ───────────────────────────────────────────────────────────────
info "Checking prerequisites..."

if ! command -v git &>/dev/null; then
  die "Git is not installed. Install it from https://git-scm.com and re-run this script."
fi
success "Git found: $(git --version)"

# ── 2. Check Node 18+ ─────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  die "Node.js is not installed. Install Node 18 LTS from https://nodejs.org and re-run."
fi

NODE_VERSION=$(node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
if [ "$NODE_VERSION" -lt 18 ]; then
  die "Node.js ${NODE_VERSION} found, but 18+ is required. Upgrade at https://nodejs.org"
fi
success "Node.js v$(node --version | sed 's/v//')"

# ── 3. Clone or use existing repo ─────────────────────────────────────────────
if [ -f "$SCRIPT_DIR/package.json" ]; then
  REPO_DIR="$SCRIPT_DIR"
  info "Using existing repo at: $REPO_DIR"
else
  REPO_DIR="${HOME}/csf_profile"
  if [ ! -d "$REPO_DIR/.git" ]; then
    info "Cloning CSF Profile repository..."
    git clone "$REPO_URL" "$REPO_DIR"
  else
    info "Repo already cloned at $REPO_DIR"
  fi
fi

cd "$REPO_DIR"

# ── 4. Install npm dependencies ───────────────────────────────────────────────
info "Installing dependencies (npm install)..."
npm install --silent
success "Dependencies installed."

# ── 5. Check port availability ────────────────────────────────────────────────
if lsof -iTCP:"$INSTALLER_PORT" -sTCP:LISTEN &>/dev/null 2>&1; then
  warn "Port $INSTALLER_PORT is already in use. The installer may already be running."
  warn "Open http://localhost:$INSTALLER_PORT in your browser, or kill the process and retry."
  exit 0
fi

# ── 6. Start installer server ─────────────────────────────────────────────────
info "Starting installer server on port $INSTALLER_PORT..."
node "$REPO_DIR/installer/server.js" "$REPO_DIR" &
SERVER_PID=$!
sleep 1  # Brief pause to let the server bind

if ! kill -0 "$SERVER_PID" 2>/dev/null; then
  die "Installer server failed to start. Check installer/server.js exists."
fi
success "Installer server running (PID $SERVER_PID)."

# ── 7. Open browser ──────────────────────────────────────────────────────────
WIZARD_URL="http://localhost:$INSTALLER_PORT"
info "Opening wizard at $WIZARD_URL"

if command -v open &>/dev/null; then
  open "$WIZARD_URL"            # macOS
elif command -v xdg-open &>/dev/null; then
  xdg-open "$WIZARD_URL"        # Linux
elif command -v wslview &>/dev/null; then
  wslview "$WIZARD_URL"         # WSL
else
  warn "Could not auto-open browser. Please navigate to: $WIZARD_URL"
fi

echo ""
echo -e "${BOLD}${GREEN}CSF Profile Installer is running.${RESET}"
echo -e "  Wizard: ${CYAN}$WIZARD_URL${RESET}"
echo -e "  The installer will guide you through the remaining setup steps."
echo -e "  Press Ctrl+C here to stop the installer server if needed."
echo ""

# Keep script alive until server exits
wait "$SERVER_PID" 2>/dev/null || true
