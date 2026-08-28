param(
    [ValidateSet('smoke', 'baseline', 'load', 'stress', 'custom')]
    [string]$Profile = 'smoke',
    [string]$BaseUrl = 'http://localhost:6200/api',
    [string]$Username = 'superadmin',
    [int]$Vus = 10,
    [string]$Duration = '2m',
    [switch]$AllowInsecureHttp
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command k6 -ErrorAction SilentlyContinue)) {
    throw 'k6 is not installed. Run: winget install k6.k6'
}

$securePassword = Read-Host 'CMMS password' -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

try {
    $env:BASE_URL = $BaseUrl.TrimEnd('/')
    $env:CMMS_USERNAME = $Username
    $env:CMMS_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    $env:PROFILE = $Profile
    $env:VUS = [string]$Vus
    $env:DURATION = $Duration
    $env:ALLOW_INSECURE_HTTP = if ($AllowInsecureHttp) { 'true' } else { 'false' }

    New-Item -ItemType Directory -Force -Path "$PSScriptRoot/reports" | Out-Null
    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $env:REPORT_PATH = "reports/$Profile-$timestamp-summary.json"

    Push-Location $PSScriptRoot
    try {
        k6 run cmms-load-test.js
    }
    finally {
        Pop-Location
    }
}
finally {
    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
    Remove-Item Env:CMMS_PASSWORD -ErrorAction SilentlyContinue
}

