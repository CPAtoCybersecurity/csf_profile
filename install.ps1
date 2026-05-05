# CSF Profile Assessment Tool — Guided Installer (Windows PowerShell)
# Usage: .\install.ps1
# If blocked by execution policy, run first:
#   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
#
# This file is intentionally readable. Review before running.

$ErrorActionPreference = "Stop"
$InstallerPort = 31338
$RepoUrl = "https://github.com/CPAtoCybersecurity/csf_profile.git"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Info    { Write-Host "▶ $args" -ForegroundColor Cyan }
function Write-Success { Write-Host "✔ $args" -ForegroundColor Green }
function Write-Warn    { Write-Host "⚠ $args" -ForegroundColor Yellow }
function Write-Err     { Write-Host "✖ $args" -ForegroundColor Red }

# ── 1. Check Git ──────────────────────────────────────────────────────────────
Write-Info "Checking prerequisites…"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Err "Git is not installed. Download from https://git-scm.com and re-run."
    exit 1
}
Write-Success "Git found: $(git --version)"

# ── 2. Check Node 18+ ─────────────────────────────────────────────────────────
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Err "Node.js is not installed. Install Node 18 LTS from https://nodejs.org and re-run."
    exit 1
}

$NodeMajor = [int](node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
if ($NodeMajor -lt 18) {
    Write-Err "Node.js $NodeMajor found, but 18+ is required. Upgrade at https://nodejs.org"
    exit 1
}
Write-Success "Node.js $(node --version)"

# ── 3. Clone or use existing repo ─────────────────────────────────────────────
if (Test-Path (Join-Path $ScriptDir "package.json")) {
    $RepoDir = $ScriptDir
    Write-Info "Using existing repo at: $RepoDir"
} else {
    $RepoDir = Join-Path $HOME "csf_profile"
    if (-not (Test-Path (Join-Path $RepoDir ".git"))) {
        Write-Info "Cloning CSF Profile repository…"
        git clone $RepoUrl $RepoDir
    } else {
        Write-Info "Repo already cloned at $RepoDir"
    }
}

Set-Location $RepoDir

# ── 4. Install npm dependencies ───────────────────────────────────────────────
Write-Info "Installing dependencies (npm install)…"
npm install --silent
Write-Success "Dependencies installed."

# ── 5. Check port availability ────────────────────────────────────────────────
$portInUse = netstat -an | Select-String ":$InstallerPort\s+LISTENING"
if ($portInUse) {
    Write-Warn "Port $InstallerPort is already in use. The installer may already be running."
    Write-Warn "Open http://localhost:$InstallerPort in your browser, or kill the process and retry."
    exit 0
}

# ── 6. Start installer server ─────────────────────────────────────────────────
Write-Info "Starting installer server on port $InstallerPort…"
$serverScript = Join-Path $RepoDir "installer\server.js"
$serverProcess = Start-Process -FilePath "node" -ArgumentList "`"$serverScript`" `"$RepoDir`"" `
    -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 1

if ($serverProcess.HasExited) {
    Write-Err "Installer server failed to start. Check installer\server.js exists."
    exit 1
}
Write-Success "Installer server running (PID $($serverProcess.Id))."

# ── 7. Open browser ──────────────────────────────────────────────────────────
$WizardUrl = "http://localhost:$InstallerPort"
Write-Info "Opening wizard at $WizardUrl"
Start-Process $WizardUrl

Write-Host ""
Write-Host "CSF Profile Installer is running." -ForegroundColor Green -NoNewline
Write-Host ""
Write-Host "  Wizard: $WizardUrl" -ForegroundColor Cyan
Write-Host "  The installer will guide you through the remaining setup steps."
Write-Host "  Close this window or press Ctrl+C to stop the installer server."
Write-Host ""

$serverProcess.WaitForExit()
