<#
.SYNOPSIS
    Runs all unit tests (backend and frontend) for the DKM project.

.DESCRIPTION
    This master script runs both backend (.NET) and frontend (React) unit tests
    with code coverage and generates comprehensive reports.

.PARAMETER BackendOnly
    Run only backend tests.

.PARAMETER FrontendOnly
    Run only frontend tests.

.PARAMETER OpenReports
    Open both coverage reports in the browser after tests complete.

.PARAMETER Configuration
    Build configuration for backend tests (Debug or Release). Default is Debug.

.EXAMPLE
    .\Run-AllTests.ps1
    Runs all tests (backend and frontend).

.EXAMPLE
    .\Run-AllTests.ps1 -OpenReports
    Runs all tests and opens coverage reports.

.EXAMPLE
    .\Run-AllTests.ps1 -BackendOnly
    Runs only backend tests.

.EXAMPLE
    .\Run-AllTests.ps1 -FrontendOnly
    Runs only frontend tests.
#>

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$OpenReports,
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Debug'
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   DKM Project - Complete Test Suite           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date
$backendSuccess = $false
$frontendSuccess = $false

# Run backend tests
if (-not $FrontendOnly) {
    Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║   STEP 1: Running Backend Tests (.NET)        ║" -ForegroundColor Yellow
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
    
    try {
        & "$PSScriptRoot\Run-BackendTests.ps1" -Configuration $Configuration
        if ($LASTEXITCODE -eq 0) {
            $backendSuccess = $true
            Write-Host "✓ Backend tests passed" -ForegroundColor Green
        } else {
            Write-Host "✗ Backend tests failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Backend tests failed with error: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Run frontend tests
if (-not $BackendOnly) {
    Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║   STEP 2: Running Frontend Tests (React)      ║" -ForegroundColor Yellow
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
    
    try {
        & "$PSScriptRoot\Run-FrontendTests.ps1"
        if ($LASTEXITCODE -eq 0) {
            $frontendSuccess = $true
            Write-Host "✓ Frontend tests passed" -ForegroundColor Green
        } else {
            Write-Host "✗ Frontend tests failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Frontend tests failed with error: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Calculate execution time
$endTime = Get-Date
$duration = $endTime - $startTime

# Final summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Test Execution Summary                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if (-not $FrontendOnly) {
    $backendStatus = if ($backendSuccess) { "✓ PASSED" } else { "✗ FAILED" }
    $backendColor = if ($backendSuccess) { "Green" } else { "Red" }
    Write-Host "Backend Tests:  " -NoNewline
    Write-Host $backendStatus -ForegroundColor $backendColor
}

if (-not $BackendOnly) {
    $frontendStatus = if ($frontendSuccess) { "✓ PASSED" } else { "✗ FAILED" }
    $frontendColor = if ($frontendSuccess) { "Green" } else { "Red" }
    Write-Host "Frontend Tests: " -NoNewline
    Write-Host $frontendStatus -ForegroundColor $frontendColor
}

Write-Host ""
Write-Host "Total Duration: $($duration.ToString('mm\:ss'))" -ForegroundColor Cyan
Write-Host ""

# Open reports if requested
if ($OpenReports) {
    Write-Host "Opening coverage reports..." -ForegroundColor Yellow
    
    if (-not $FrontendOnly) {
        $backendReport = Join-Path $PSScriptRoot "App\backend-api\TestResults\coveragereport\index.html"
        if (Test-Path $backendReport) {
            Start-Process $backendReport
        }
    }
    
    if (-not $BackendOnly) {
        $frontendReport = Join-Path $PSScriptRoot "App\frontend-app\coverage\lcov-report\index.html"
        if (Test-Path $frontendReport) {
            Start-Process $frontendReport
        }
    }
}

# Report locations
Write-Host "Coverage Reports:" -ForegroundColor Cyan
if (-not $FrontendOnly) {
    Write-Host "  Backend:  App\backend-api\TestResults\coveragereport\index.html" -ForegroundColor White
}
if (-not $BackendOnly) {
    Write-Host "  Frontend: App\frontend-app\coverage\lcov-report\index.html" -ForegroundColor White
}
Write-Host ""

# Exit with error code if any tests failed
$allSuccess = $true
if (-not $FrontendOnly -and -not $backendSuccess) { $allSuccess = $false }
if (-not $BackendOnly -and -not $frontendSuccess) { $allSuccess = $false }

if ($allSuccess) {
    Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║   All Tests Passed! ✓                          ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
    exit 0
} else {
    Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║   Some Tests Failed ✗                          ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Red
    exit 1
}
