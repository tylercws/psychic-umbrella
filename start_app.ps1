# Function to find Python executable
function Get-PythonPath {
    $commands = @("py", "python3", "python")
    foreach ($cmd in $commands) {
        if (Get-Command $cmd -ErrorAction SilentlyContinue) {
            try {
                $version = & $cmd --version 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "Found Python: $cmd ($version)" -ForegroundColor Green
                    return $cmd
                }
            }
            catch {}
        }
    }
    return $null
}

$PythonCmd = Get-PythonPath

if (-not $PythonCmd) {
    Write-Error "Python not found. Please install Python 3.8+."
    exit 1
}

# Directories
$RootDir = Get-Location
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"
$VenvDir = Join-Path $BackendDir ".venv"

# 1. Setup Backend
Write-Host "`n--- Setting up Backend ---" -ForegroundColor Cyan

# Create venv if it doesn't exist
if (-not (Test-Path $VenvDir)) {
    Write-Host "Creating virtual environment using $PythonCmd..."
    & $PythonCmd -m venv $VenvDir
    
    if (-not (Test-Path $VenvDir)) {
        Write-Error "Failed to create virtual environment."
        exit 1
    }
}
else {
    Write-Host "Virtual environment already exists."
}

# Path to pip/python in venv
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Error "Virtual environment seems corrupted (python.exe not found in $VenvPython)"
    exit 1
}

# Install requirements
if (Test-Path "$BackendDir\requirements.txt") {
    Write-Host "Installing backend dependencies..."
    # Use venv python module pip to avoid path issues
    & $VenvPython -m pip install -r "$BackendDir\requirements.txt"
}
else {
    Write-Warning "backend/requirements.txt not found!"
}

# 2. Setup Frontend
Write-Host "`n--- Setting up Frontend ---" -ForegroundColor Cyan
if (Test-Path $FrontendDir) {
    Push-Location $FrontendDir
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing node modules..."
        # Windows fallback for npm
        $npmCmd = "npm"
        if (Get-Command "npm.cmd" -ErrorAction SilentlyContinue) {
            $npmCmd = "npm.cmd" 
        }
        & $npmCmd install
    }
    else {
        Write-Host "Node modules already installed."
    }
    Pop-Location
}
else {
    Write-Error "Frontend directory not found!"
    exit 1
}

# 3. Start Servers
Write-Host "`n--- Starting Servers ---" -ForegroundColor Magenta

# Start Backend
Write-Host "Starting Backend (Flask)..."
$BackendScript = Join-Path $BackendDir "app.py"

# Start Backend Process
Start-Process -FilePath $VenvPython -ArgumentList "$BackendScript" -WorkingDirectory $BackendDir -NoNewWindow:$false

# Start Frontend
Write-Host "Starting Frontend (Vite)..."
Push-Location $FrontendDir
# Use npm.cmd on Windows to avoid issues with Start-Process and shell executables
$npmExec = "npm"
if ($IsWindows) { $npmExec = "npm.cmd" }

Start-Process -FilePath $npmExec -ArgumentList "run dev" -WorkingDirectory $FrontendDir -NoNewWindow:$false
Pop-Location

Write-Host "`nServers launched in separate windows." -ForegroundColor Green
