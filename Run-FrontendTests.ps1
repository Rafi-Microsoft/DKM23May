<#
.SYNOPSIS
    Runs frontend unit tests with code coverage for the DKM project.

.DESCRIPTION
    This script runs all Jest unit tests for the React frontend application
    and generates code coverage reports.

.PARAMETER Watch
    If specified, runs tests in watch mode for development.

.PARAMETER OpenReport
    If specified, opens the HTML coverage report in the default browser after tests complete.

.EXAMPLE
    .\Run-FrontendTests.ps1
    Runs all frontend tests with coverage.

.EXAMPLE
    .\Run-FrontendTests.ps1 -OpenReport
    Runs tests and opens the coverage report in a browser.

.EXAMPLE
    .\Run-FrontendTests.ps1 -Watch
    Runs tests in watch mode for development.
#>

param(
    [switch]$Watch,
    [switch]$OpenReport
)

$ErrorActionPreference = 'Stop'

# Script configuration
$FrontendDir = Join-Path $PSScriptRoot "App\frontend-app"
$CoverageReportPath = Join-Path $FrontendDir "coverage\lcov-report\index.html"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   DKM Frontend Unit Tests with Coverage" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Error "Node.js is not installed. Please install Node.js 18 or later."
    exit 1
}

# Check if npm/yarn is installed
Write-Host "Checking package manager..." -ForegroundColor Yellow
$useYarn = $false
try {
    $yarnVersion = yarn --version 2>$null
    $useYarn = $true
    Write-Host "✓ Using Yarn version: $yarnVersion" -ForegroundColor Green
} catch {
    try {
        $npmVersion = npm --version
        Write-Host "✓ Using npm version: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Error "Neither npm nor yarn is installed."
        exit 1
    }
}

# Navigate to frontend directory
Write-Host ""
Write-Host "Navigating to frontend directory..." -ForegroundColor Yellow
Set-Location $FrontendDir
Write-Host "✓ Directory: $FrontendDir" -ForegroundColor Green

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    if ($useYarn) {
        yarn install
    } else {
        npm install
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
}

# Run tests
Write-Host ""
if ($Watch) {
    Write-Host "Running tests in watch mode..." -ForegroundColor Yellow
    Write-Host "(Press Ctrl+C to exit)" -ForegroundColor Gray
    Write-Host ""
    if ($useYarn) {
        yarn test --watch
    } else {
        npm test -- --watch
    }
} else {
    Write-Host "Running unit tests with coverage..." -ForegroundColor Yellow
    Write-Host ""
    
    if ($useYarn) {
        yarn test
    } else {
        npm test
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Tests failed"
        exit 1
    }
    
    Write-Host ""
    Write-Host "✓ Tests completed successfully" -ForegroundColor Green
}

# Open coverage report if requested
if ($OpenReport -and -not $Watch) {
    if (Test-Path $CoverageReportPath) {
        Write-Host ""
        Write-Host "Opening coverage report in browser..." -ForegroundColor Yellow
        Start-Process $CoverageReportPath
    } else {
        Write-Warning "Coverage report not found at: $CoverageReportPath"
    }
}

# Summary
if (-not $Watch) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "   Test Execution Complete!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Reports Location:" -ForegroundColor Cyan
    Write-Host "  Coverage HTML: $CoverageReportPath" -ForegroundColor White
    Write-Host "  Coverage LCOV: $(Join-Path $FrontendDir 'coverage\lcov.info')" -ForegroundColor White
    Write-Host ""
    Write-Host "To view the report, run:" -ForegroundColor Yellow
    Write-Host "  start $CoverageReportPath" -ForegroundColor White
    Write-Host ""
}

# Return to original directory
Set-Location $PSScriptRoot
