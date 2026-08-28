[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z0-9_-]{1,20}$')]
    [string]$RunId,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z0-9_-]{1,20}$')]
    [string]$ConfirmRunId,

    [string]$DbHost = 'localhost',
    [ValidateRange(1, 65535)][int]$DbPort = 5432,
    [string]$Database = 'cmms_db',
    [string]$DbUser = 'postgres'
)

$ErrorActionPreference = 'Stop'
if ($RunId -cne $ConfirmRunId) {
    throw 'ConfirmRunId must exactly match RunId. No data was deleted.'
}
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    throw 'psql was not found. Install PostgreSQL command-line tools and reopen PowerShell.'
}

$sqlFile = Join-Path $PSScriptRoot 'sql/cleanup-large-data.sql'
Write-Warning "Deleting only performance data registered for run '$RunId'."
& psql --host $DbHost --port $DbPort --dbname $Database --username $DbUser `
    --file $sqlFile --set "run_id=$RunId"

if ($LASTEXITCODE -ne 0) {
    throw "Cleanup failed with psql exit code $LASTEXITCODE. The cleanup transaction was rolled back."
}

Write-Host "Performance data run '$RunId' was removed."
