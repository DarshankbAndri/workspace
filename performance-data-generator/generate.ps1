[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z0-9_-]{1,20}$')]
    [string]$RunId,

    [string]$DbHost = 'localhost',
    [ValidateRange(1, 65535)][int]$DbPort = 5432,
    [string]$Database = 'cmms_db',
    [string]$DbUser = 'postgres',

    [ValidateRange(1, 1000000)][long]$Sites = 100,
    [ValidateRange(1, 10000000)][long]$Employees = 5000,
    [ValidateRange(1, 10000000)][long]$Equipment = 50000,
    [ValidateRange(1, 10000000)][long]$Requests = 100000,
    [ValidateRange(1, 10000000)][long]$Assignments = 100000,
    [ValidateRange(1, 50000000)][long]$WorkLogs = 500000,
    [ValidateRange(1, 10000000)][long]$DowntimeRecords = 100000,
    [ValidateRange(1, 50000000)][long]$SpareTransactions = 100000,
    [ValidateRange(1, 10000)][long]$SpareParts = 100
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    throw 'psql was not found. Install PostgreSQL command-line tools and reopen PowerShell.'
}

$sqlFile = Join-Path $PSScriptRoot 'sql/generate-large-data.sql'
$arguments = @(
    '--host', $DbHost,
    '--port', $DbPort,
    '--dbname', $Database,
    '--username', $DbUser,
    '--file', $sqlFile,
    '--set', "run_id=$RunId",
    '--set', "site_count=$Sites",
    '--set', "employee_count=$Employees",
    '--set', "equipment_count=$Equipment",
    '--set', "request_count=$Requests",
    '--set', "assignment_count=$Assignments",
    '--set', "work_log_count=$WorkLogs",
    '--set', "downtime_count=$DowntimeRecords",
    '--set', "spare_transaction_count=$SpareTransactions",
    '--set', "spare_part_count=$SpareParts"
)

Write-Host "Generating CMMS performance data for run '$RunId'..."
Write-Host 'The PostgreSQL password will be requested by psql if it is not already configured.'
& psql @arguments
if ($LASTEXITCODE -ne 0) {
    throw "Generation failed with psql exit code $LASTEXITCODE. The data transaction was rolled back."
}

Write-Host 'Generation and exact-count verification completed.'
Write-Host "Next: .\verify.ps1 -RunId '$RunId' -DbHost '$DbHost' -DbPort $DbPort -Database '$Database' -DbUser '$DbUser'"
