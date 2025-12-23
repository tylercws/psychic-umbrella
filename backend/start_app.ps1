# Function to print colorful messages
function Log-Info ($Message) { Write-Host "INFO: $Message" -ForegroundColor Cyan }
function Log-Success ($Message) { Write-Host "SUCCESS: $Message" -ForegroundColor Green }
function Log-Error ($Message) { Write-Host "ERROR: $Message" -ForegroundColor Red }
function Log-Step ($Message) { Write-Host "`n=== $Message ===" -ForegroundColor Magenta }

# 1. Find Python
Log-Step "Initializing DJ Audio Webtool"
$PythonCmd = $null
$PossibleCmds = @("py", "python3", "python")

foreach ($cmd in $PossibleCmds) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        try {
            # Try getting version to map sure it's runnable
            $ver = & $cmd --version 2>&1
            if ($LASTEXITCODE -eq 0) {
                $PythonCmd = $cmd
                Log-Success "Found Python: $ver"
                break
            }
        }
        catch {}
    }
}

if (-not $PythonCmd) {
    Log-Error "Python not found! Please install Python 3.10+ from python.org or the Microsoft Store."
    exit 1
}

# 2. Setup Paths
$BackendDir = $PSScriptRoot
$RootDir = Split-Path -Parent $BackendDir
$FrontendDir = Join-Path $RootDir "frontend"
$VenvDir = Join-Path $BackendDir ".venv"
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"

# 3. Backend Setup
Log-Step "Setting up Backend"

if (Test-Path $VenvDir) {
    if (-not (Test-Path (Join-Path $VenvDir "pyvenv.cfg"))) {
        Log-Info "Virtual environment seems corrupted (missing pyvenv.cfg). Recreating..."
        Remove-Item -Recurse -Force $VenvDir
    }
}

if (-not (Test-Path $VenvDir)) {
    Log-Info "Creating virtual environment..."
    & $PythonCmd -m venv $VenvDir
}

if (-not (Test-Path $VenvPython)) {
    Log-Error "Virtual environment creation failed or is corrupted."
    exit 1
}

if (Test-Path "$BackendDir\requirements.txt") {
    Log-Info "Checking/Installing backend dependencies..."
    & $VenvPython -m pip install -r "$BackendDir\requirements.txt"
}

# 4. Frontend Setup
Log-Step "Setting up Frontend"

if (Test-Path $FrontendDir) {
    Push-Location $FrontendDir
    Log-Info "Checking/Installing frontend dependencies (this may take a moment)..."
    
    $npmCmd = "npm"
    if ($IsWindows) { $npmCmd = "npm.cmd" }
    
    # Always run install to ensure sync, npm is usually smart enough to skip if up to date
    & $npmCmd install | Out-Null
    
    Pop-Location
}
else {
    Log-Error "Frontend directory missing!"
    exit 1
}

# 5. Launch Services
Log-Step "Launching Application"

# Start Backend
Log-Info "Starting Backend Server (Flask :5000)..."
$BackendScript = Join-Path $BackendDir "app.py"
Start-Process -FilePath $VenvPython -ArgumentList "$BackendScript" -WorkingDirectory $BackendDir -NoNewWindow:$false

# Start Frontend
Log-Info "Starting Frontend Interface (Vite :5173)..."
Push-Location $FrontendDir
Start-Process -FilePath $npmCmd -ArgumentList "run dev" -WorkingDirectory $FrontendDir -NoNewWindow:$false
Pop-Location

Log-Success "System Online. Windows have been opened."
Write-Host "Press any key to close this launcher (servers will keep running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
