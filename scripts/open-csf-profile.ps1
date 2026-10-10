param(
  [switch]$OpenWhenReady,
  [int]$Port
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

function Test-CsfProfile([int]$candidatePort) {
  try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$candidatePort/" -UseBasicParsing -TimeoutSec 2
    return $response.StatusCode -eq 200 -and $response.Content -match '<title>CSF Profile Assessment</title>'
  } catch {
    return $false
  }
}

function Test-PortAvailable([int]$candidatePort) {
  $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $candidatePort)
  try {
    $listener.Start()
    return $true
  } catch {
    return $false
  } finally {
    $listener.Stop()
  }
}

if ($OpenWhenReady) {
  for ($attempt = 0; $attempt -lt 120; $attempt++) {
    if (Test-CsfProfile $Port) {
      Start-Process "http://127.0.0.1:$Port/"
      exit 0
    }
    Start-Sleep -Seconds 1
  }
  exit 1
}

Set-Location -LiteralPath $projectRoot

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
  Write-Error 'Node.js/npm is missing. Install Node.js, then run this launcher again.'
  exit 1
}
if (-not (Test-Path -LiteralPath (Join-Path $projectRoot 'node_modules\.bin\react-scripts.cmd'))) {
  Write-Error 'App dependencies are missing. Open a terminal in this folder, run npm install, then double-click the launcher again.'
  exit 1
}

$chosenPort = $null
foreach ($candidatePort in 3000..3010) {
  if (Test-CsfProfile $candidatePort) {
    Write-Host "CSF Profile is already running at http://127.0.0.1:$candidatePort/"
    Start-Process "http://127.0.0.1:$candidatePort/"
    exit 0
  }
  if ($null -eq $chosenPort -and (Test-PortAvailable $candidatePort)) {
    $chosenPort = $candidatePort
  }
}

if ($null -eq $chosenPort) {
  Write-Error 'Ports 3000 through 3010 are in use. Close another local development server and try again.'
  exit 1
}

$env:PORT = [string]$chosenPort
$env:HOST = '127.0.0.1'
$env:BROWSER = 'none'
$watcherArguments = "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -OpenWhenReady -Port $chosenPort"
Start-Process -FilePath (Join-Path $PSHOME 'powershell.exe') -ArgumentList $watcherArguments -WorkingDirectory $projectRoot -WindowStyle Hidden | Out-Null

Write-Host "Starting CSF Profile at http://127.0.0.1:$chosenPort/"
Write-Host 'Your browser will open when the app is ready. Close this window to stop the app.'
& npm.cmd start
exit $LASTEXITCODE
