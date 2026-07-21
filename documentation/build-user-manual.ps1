param([string]$DocumentationRoot = $PSScriptRoot)
$ErrorActionPreference = 'Stop'

$master = Join-Path $DocumentationRoot 'CMMS-End-User-Manual.md'
$markdown = Get-Content -LiteralPath $master -Raw -Encoding UTF8
$userDir = Join-Path $DocumentationRoot 'user-manual'
$roleDir = Join-Path $DocumentationRoot 'role-guides'
$workflowDir = Join-Path $DocumentationRoot 'workflows'
$permissionDir = Join-Path $DocumentationRoot 'permissions'
New-Item -ItemType Directory -Force -Path $userDir,$roleDir,$workflowDir,$permissionDir | Out-Null

$matches = [regex]::Matches($markdown, '(?ms)<!-- USERFILE:(?<name>[^ ]+) -->\s*(?<body>.*?)(?=\r?\n---\r?\n\s*(?:<!-- USERFILE:|## \d+\.|$))')
foreach ($match in $matches) {
    $intro = '> Extracted from [CMMS End-User Manual](../CMMS-End-User-Manual.md). The consolidated manual is the controlled copy.' + [Environment]::NewLine + [Environment]::NewLine
    Set-Content -LiteralPath (Join-Path $userDir $match.Groups['name'].Value) -Value ($intro + $match.Groups['body'].Value.Trim() + [Environment]::NewLine) -Encoding UTF8
}

function Write-Section([string]$Path, [string]$Title, [string]$Start, [string]$End) {
    $pattern = '(?ms)^' + [regex]::Escape($Start) + '.*?(?=^' + [regex]::Escape($End) + '|\z)'
    $section = [regex]::Match($markdown, $pattern).Value.Trim()
    Set-Content -LiteralPath $Path -Value ("# $Title`r`n`r`n> Extracted from the source-verified consolidated manual.`r`n`r`n" + $section + "`r`n") -Encoding UTF8
}

Write-Section (Join-Path $roleDir 'Admin-and-Super-Admin-Guide.md') 'Admin and Super Admin User Guide' '### Admin / Super Admin' '### Plant Manager'
Write-Section (Join-Path $roleDir 'Plant-Manager-Guide.md') 'Plant Manager User Guide' '### Plant Manager' '### Maintenance Manager / Engineer'
Write-Section (Join-Path $roleDir 'Maintenance-Manager-and-Engineer-Guide.md') 'Maintenance Manager and Engineer User Guide' '### Maintenance Manager / Engineer' '### Technician'
Write-Section (Join-Path $roleDir 'Technician-Guide.md') 'Technician User Guide' '### Technician' '### Store Manager / Inventory Executive'
Write-Section (Join-Path $roleDir 'Store-and-Inventory-Guide.md') 'Store Manager and Inventory User Guide' '### Store Manager / Inventory Executive' '### HR / Administrator'
Write-Section (Join-Path $roleDir 'HR-and-Administrator-Guide.md') 'HR and Administrator User Guide' '### HR / Administrator' '### Viewer / Demo User'
Write-Section (Join-Path $roleDir 'Viewer-and-Demo-Guide.md') 'Viewer and Demo User Guide' '### Viewer / Demo User' '---'

Write-Section (Join-Path $workflowDir 'Equipment-Onboarding.md') 'Equipment Onboarding Workflow' '### Equipment onboarding' '### Breakdown maintenance'
Write-Section (Join-Path $workflowDir 'Breakdown-Maintenance.md') 'Breakdown Maintenance Workflow' '### Breakdown maintenance' '### Preventive maintenance'
Write-Section (Join-Path $workflowDir 'Preventive-Maintenance.md') 'Preventive Maintenance Workflow' '### Preventive maintenance' '### Spare and inventory'
Write-Section (Join-Path $workflowDir 'Spare-and-Inventory.md') 'Spare and Inventory Workflow' '### Spare and inventory' '### AMC maintenance'
Write-Section (Join-Path $workflowDir 'AMC-Maintenance.md') 'AMC Maintenance Workflow' '### AMC maintenance' '### Meter-based maintenance'
Write-Section (Join-Path $workflowDir 'Meter-Based-Maintenance.md') 'Meter-Based Maintenance Workflow' '### Meter-based maintenance' '---'

Write-Section (Join-Path $permissionDir 'End-User-Permission-Matrix.md') 'End-User Permission Matrix' '## 13. Permission Guide' '### Feature availability matrix'
Write-Section (Join-Path $DocumentationRoot 'Feature-Availability-Matrix.md') 'Feature Availability Matrix' '### Feature availability matrix' '---'

# Reuse the already validated Markdown-to-Word/PDF build implementation with
# output names and paths redirected to the end-user package.
$builderSource = Get-Content -LiteralPath (Join-Path $DocumentationRoot 'build-documentation.ps1') -Raw -Encoding UTF8
$builderSource = $builderSource.Replace("CMMS-Creation-Page-Documentation.md", "CMMS-End-User-Manual.md")
$builderSource = $builderSource.Replace("CMMS-Creation-Page-Documentation.html", "CMMS-End-User-Manual.html")
$builderSource = $builderSource.Replace("CMMS-Creation-Page-Documentation.docx", "CMMS-End-User-Manual.docx")
$builderSource = $builderSource.Replace("CMMS-Creation-Page-Documentation.pdf", "CMMS-End-User-Manual.pdf")
$builderSource = $builderSource.Replace("'creation-pages'", "'user-manual-derived'")
$builderSource = $builderSource.Replace("'database-reference\Field-Reference-Matrix.md'", "'user-manual\Generated-Table-Index.md'")
$builderSource = $builderSource.Replace('Solar CMMS - Creation and Configuration Documentation', 'Solar CMMS - End-User Manual')
$builderSource = $builderSource.Replace('<title>CMMS Creation Page Documentation</title>', '<title>CMMS End-User Manual</title>')
$temporaryBuilder = Join-Path $env:TEMP 'cmms-build-end-user-manual.ps1'
Set-Content -LiteralPath $temporaryBuilder -Value $builderSource -Encoding UTF8
try { & $temporaryBuilder -DocumentationRoot $DocumentationRoot | Out-Null } finally { Remove-Item -LiteralPath $temporaryBuilder -Force -ErrorAction SilentlyContinue }

[pscustomobject]@{
    UserManualFiles = (Get-ChildItem -LiteralPath $userDir -Filter '*.md').Count
    RoleGuides = (Get-ChildItem -LiteralPath $roleDir -Filter '*.md').Count
    Workflows = (Get-ChildItem -LiteralPath $workflowDir -Filter '*.md').Count
    Markdown = $master
    Word = Join-Path $DocumentationRoot 'CMMS-End-User-Manual.docx'
    Pdf = Join-Path $DocumentationRoot 'CMMS-End-User-Manual.pdf'
}
