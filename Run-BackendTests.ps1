<#
.SYNOPSIS
    Runs backend unit tests with code coverage for the DKM project.

.DESCRIPTION
    This script runs all unit tests for the Microsoft.GS.DPS backend project,
    generates code coverage reports, and optionally opens the HTML report in a browser.

.PARAMETER OpenReport
    If specified, opens the HTML coverage report in the default browser after generation.

.PARAMETER Configuration
    Build configuration (Debug or Release). Default is Debug.

.EXAMPLE
    .\Run-BackendTests.ps1
    Runs all tests with coverage and generates reports.

.EXAMPLE
    .\Run-BackendTests.ps1 -OpenReport
    Runs tests and opens the coverage report in a browser.

.EXAMPLE
    .\Run-BackendTests.ps1 -Configuration Release
    Runs tests using Release configuration.
#>

param(
    [switch]$OpenReport,
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Debug'
)

$ErrorActionPreference = 'Stop'

# Script configuration
$BackendDir = Join-Path $PSScriptRoot "App\backend-api"
$TestProject = "Microsoft.GS.DPS.Tests\Microsoft.GS.DPS.Tests.csproj"
$CoverageDir = Join-Path $BackendDir "TestResults"
$ReportDir = Join-Path $CoverageDir "coveragereport"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   DKM Backend Unit Tests with Coverage" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .NET SDK is installed
Write-Host "Checking .NET SDK..." -ForegroundColor Yellow
try {
    $dotnetVersion = dotnet --version
    Write-Host "✓ .NET SDK version: $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Error ".NET SDK is not installed. Please install .NET 8.0 SDK or later."
    exit 1
}

# Navigate to backend directory
Write-Host ""
Write-Host "Navigating to backend directory..." -ForegroundColor Yellow
Set-Location $BackendDir
Write-Host "✓ Directory: $BackendDir" -ForegroundColor Green

# Clean previous test results
if (Test-Path $CoverageDir) {
    Write-Host ""
    Write-Host "Cleaning previous test results..." -ForegroundColor Yellow
    Remove-Item -Path $CoverageDir -Recurse -Force
    Write-Host "✓ Previous results cleaned" -ForegroundColor Green
}

# Restore packages
Write-Host ""
Write-Host "Restoring NuGet packages..." -ForegroundColor Yellow
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to restore packages"
    exit 1
}
Write-Host "✓ Packages restored" -ForegroundColor Green

# Build the test project
Write-Host ""
Write-Host "Building test project..." -ForegroundColor Yellow
dotnet build $TestProject --configuration $Configuration --no-restore
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build test project"
    exit 1
}
Write-Host "✓ Build successful" -ForegroundColor Green

# Run tests with coverage
Write-Host ""
Write-Host "Running unit tests with coverage..." -ForegroundColor Yellow
Write-Host "Configuration: $Configuration" -ForegroundColor Cyan
Write-Host ""

dotnet test $TestProject `
    --configuration $Configuration `
    --no-build `
    --verbosity normal `
    /p:CollectCoverage=true `
    /p:CoverletOutputFormat=cobertura `
    /p:CoverletOutput="$CoverageDir/" `
    /p:Exclude="[xunit.*]*"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Tests failed"
    exit 1
}

Write-Host ""
Write-Host "✓ Tests completed successfully" -ForegroundColor Green

# Check if reportgenerator is installed
Write-Host ""
Write-Host "Checking for ReportGenerator tool..." -ForegroundColor Yellow
$reportGenInstalled = dotnet tool list -g | Select-String "dotnet-reportgenerator-globaltool"

if (-not $reportGenInstalled) {
    Write-Host "ReportGenerator not found. Installing..." -ForegroundColor Yellow
    dotnet tool install -g dotnet-reportgenerator-globaltool
    Write-Host "✓ ReportGenerator installed" -ForegroundColor Green
} else {
    Write-Host "✓ ReportGenerator is installed" -ForegroundColor Green
}

# Generate HTML coverage report
Write-Host ""
Write-Host "Generating HTML coverage report..." -ForegroundColor Yellow

$coverageFile = Get-ChildItem -Path $CoverageDir -Filter "coverage.cobertura.xml" -ErrorAction SilentlyContinue

if ($coverageFile) {
    reportgenerator `
        "-reports:$($coverageFile.FullName)" `
        "-targetdir:$ReportDir" `
        "-reporttypes:Html;TextSummary"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ HTML report generated: $ReportDir\index.html" -ForegroundColor Green
        
        # Display summary
        $summaryFile = Join-Path $ReportDir "Summary.txt"
        if (Test-Path $summaryFile) {
            Write-Host ""
            Write-Host "Coverage Summary:" -ForegroundColor Cyan
            Write-Host "=================" -ForegroundColor Cyan
            Get-Content $summaryFile | Write-Host
        }
    } else {
        Write-Warning "Failed to generate HTML report"
    }
} else {
    Write-Warning "Coverage file not found in $CoverageDir"
}

# Open report in browser if requested
if ($OpenReport -and (Test-Path (Join-Path $ReportDir "index.html"))) {
    Write-Host ""
    Write-Host "Opening coverage report in browser..." -ForegroundColor Yellow
    Start-Process (Join-Path $ReportDir "index.html")
}

# Summary
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Test Execution Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Reports Location:" -ForegroundColor Cyan
Write-Host "  Coverage XML: $CoverageDir\coverage.cobertura.xml" -ForegroundColor White
Write-Host "  HTML Report:  $ReportDir\index.html" -ForegroundColor White
Write-Host ""
Write-Host "To view the report, run:" -ForegroundColor Yellow
Write-Host "  start $ReportDir\index.html" -ForegroundColor White
Write-Host ""

# Return to original directory
Set-Location $PSScriptRoot
