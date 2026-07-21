param([string]$DocumentationRoot = $PSScriptRoot)
$ErrorActionPreference = 'Stop'

$masterPath = Join-Path $DocumentationRoot 'CMMS-Creation-Page-Documentation.md'
$creationPath = Join-Path $DocumentationRoot 'creation-pages'
$fieldMatrixPath = Join-Path $DocumentationRoot 'database-reference\Field-Reference-Matrix.md'
$htmlPath = Join-Path $DocumentationRoot 'CMMS-Creation-Page-Documentation.html'
$docxPath = Join-Path $DocumentationRoot 'CMMS-Creation-Page-Documentation.docx'
$pdfPath = Join-Path $DocumentationRoot 'CMMS-Creation-Page-Documentation.pdf'
New-Item -ItemType Directory -Force -Path $creationPath | Out-Null
$markdown = Get-Content -LiteralPath $masterPath -Raw -Encoding UTF8

$pagePattern = '(?ms)<!-- PAGE:(?<slug>[^ ]+) -->\s*(?<body>.*?)(?=\r?\n---\r?\n\s*<!-- PAGE:|\r?\n## 22\.)'
$pageMatches = [regex]::Matches($markdown, $pagePattern)
foreach ($match in $pageMatches) {
    $slug = $match.Groups['slug'].Value
    $body = $match.Groups['body'].Value.Trim()
    $preamble = '> Extracted from the verified master document. See [CMMS Creation Page Documentation](../CMMS-Creation-Page-Documentation.md).' + [Environment]::NewLine + [Environment]::NewLine
    Set-Content -LiteralPath (Join-Path $creationPath ($slug + '.md')) -Value ($preamble + $body + [Environment]::NewLine) -Encoding UTF8
}

$matrix = [System.Collections.Generic.List[string]]::new()
$matrix.Add('# CMMS Field Reference Matrix')
$matrix.Add('')
$matrix.Add('| Module/Page | Field | Required/UI | Validation and source | Technical mapping |')
$matrix.Add('|---|---|---|---|---|')
$currentPage = ''
$lines = $markdown -split '\r?\n'
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '^## \d+\. (.+)$') { $currentPage = $Matches[1] }
    if ($lines[$i] -match '^\| Field \|' -and $i + 2 -lt $lines.Length) {
        $i += 2
        while ($i -lt $lines.Length -and $lines[$i] -match '^\|') {
            $cells = $lines[$i].Trim('|').Split('|') | ForEach-Object { $_.Trim() }
            if ($cells.Count -ge 3) {
                $field = $cells[0]
                $mapping = $cells[1]
                $required = $cells[2]
                $validation = if ($cells.Count -gt 5) { $cells[5] } elseif ($cells.Count -gt 3) { $cells[$cells.Count - 1] } else { '' }
                $values = @($currentPage, $field, $required, $validation, $mapping) | ForEach-Object { ($_ -replace '\|', '/') -replace '[\r\n]', ' ' }
                $matrix.Add('| ' + ($values -join ' | ') + ' |')
            }
            $i++
        }
        $i--
    }
}
Set-Content -LiteralPath $fieldMatrixPath -Value ($matrix -join [Environment]::NewLine) -Encoding UTF8

function Convert-InlineMarkdown([string]$value) {
    $encoded = [System.Net.WebUtility]::HtmlEncode($value)
    $encoded = [regex]::Replace($encoded, '!\[(.*?)\]\((.*?)\)', '<span class="figure">$1</span>')
    $encoded = [regex]::Replace($encoded, '\[(.*?)\]\((.*?)\)', '<a href="$2">$1</a>')
    $encoded = [regex]::Replace($encoded, '\x60([^\x60]+)\x60', '<code>$1</code>')
    $encoded = [regex]::Replace($encoded, '\*\*(.*?)\*\*', '<strong>$1</strong>')
    return $encoded
}

function Convert-MarkdownToHtml([string]$source) {
    $sourceLines = $source -split '\r?\n'
    $html = [System.Collections.Generic.List[string]]::new()
    $inCode = $false
    $inList = $false
    for ($i = 0; $i -lt $sourceLines.Length; $i++) {
        $line = $sourceLines[$i]
        if ($line -match '^```') {
            if ($inCode) { $html.Add('</code></pre>'); $inCode = $false } else { $html.Add('<pre><code>'); $inCode = $true }
            continue
        }
        if ($inCode) { $html.Add([System.Net.WebUtility]::HtmlEncode($line)); continue }
        if ($line -match '^<!--') { continue }
        if ($line -match '^\|.*\|$' -and $i + 1 -lt $sourceLines.Length -and $sourceLines[$i + 1] -match '^\|[-: |]+\|$') {
            if ($inList) { $html.Add('</ul>'); $inList = $false }
            $headers = $line.Trim('|').Split('|') | ForEach-Object { $_.Trim() }
            $headCells = ($headers | ForEach-Object { '<th>' + (Convert-InlineMarkdown $_) + '</th>' }) -join ''
            $html.Add('<table><thead><tr>' + $headCells + '</tr></thead><tbody>')
            $i += 2
            while ($i -lt $sourceLines.Length -and $sourceLines[$i] -match '^\|.*\|$') {
                $cells = $sourceLines[$i].Trim('|').Split('|') | ForEach-Object { $_.Trim() }
                $bodyCells = ($cells | ForEach-Object { '<td>' + (Convert-InlineMarkdown $_) + '</td>' }) -join ''
                $html.Add('<tr>' + $bodyCells + '</tr>')
                $i++
            }
            $html.Add('</tbody></table>')
            $i--
            continue
        }
        if ($line -match '^(#{1,6})\s+(.+)$') {
            if ($inList) { $html.Add('</ul>'); $inList = $false }
            $level = $Matches[1].Length
            $html.Add('<h' + $level + '>' + (Convert-InlineMarkdown $Matches[2]) + '</h' + $level + '>')
            continue
        }
        if ($line -match '^---+$') { if ($inList) { $html.Add('</ul>'); $inList = $false }; $html.Add('<hr>'); continue }
        if ($line -match '^[-*]\s+(.+)$') {
            if (-not $inList) { $html.Add('<ul>'); $inList = $true }
            $html.Add('<li>' + (Convert-InlineMarkdown $Matches[1]) + '</li>')
            continue
        }
        if ([string]::IsNullOrWhiteSpace($line)) { if ($inList) { $html.Add('</ul>'); $inList = $false }; continue }
        if ($inList) { $html.Add('</ul>'); $inList = $false }
        $html.Add('<p>' + (Convert-InlineMarkdown $line) + '</p>')
    }
    if ($inList) { $html.Add('</ul>') }
    return $html -join [Environment]::NewLine
}

$body = Convert-MarkdownToHtml $markdown
$css = '@page { size:A4; margin:20mm 16mm; } body{font-family:Calibri,Arial;font-size:10pt;color:#1f2937;line-height:1.35} h1{color:#003da5;font-size:25pt;text-align:center;margin-top:80pt;page-break-after:always} h2{color:#003da5;font-size:17pt;border-bottom:2px solid #003da5;padding-bottom:4pt;page-break-before:always} h3{color:#2457a7;font-size:13pt} table{border-collapse:collapse;width:100%;margin:8pt 0 14pt;font-size:8pt} th{background:#003da5;color:white} th,td{border:1px solid #9ca3af;padding:4pt;vertical-align:top} tr:nth-child(even) td{background:#f3f6fb} code{font-family:Consolas;background:#eef2f7;padding:1pt 2pt} pre{background:#eef2f7;border-left:4px solid #003da5;padding:8pt;white-space:pre-wrap} a{color:#003da5}'
$htmlDocument = '<!doctype html><html><head><meta charset="utf-8"><title>CMMS Creation Page Documentation</title><style>' + $css + '</style></head><body>' + $body + '</body></html>'
Set-Content -LiteralPath $htmlPath -Value $htmlDocument -Encoding UTF8

$word = $null
$document = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $document = $word.Documents.Open($htmlPath)
    $document.PageSetup.TopMargin = $word.CentimetersToPoints(1.8)
    $document.PageSetup.BottomMargin = $word.CentimetersToPoints(1.8)
    $document.PageSetup.LeftMargin = $word.CentimetersToPoints(1.6)
    $document.PageSetup.RightMargin = $word.CentimetersToPoints(1.6)
    foreach ($section in $document.Sections) {
        $section.Headers.Item(1).Range.Text = 'Solar CMMS - Creation and Configuration Documentation'
        $footer = $section.Footers.Item(1).Range
        $footer.Text = 'Controlled documentation | Page '
        $footer.Collapse(0)
        $footer.Fields.Add($footer, -1, 'PAGE') | Out-Null
    }
    $document.SaveAs($docxPath, 16)
}
finally {
    if ($document) { $document.Close($false) | Out-Null; [System.Runtime.InteropServices.Marshal]::ReleaseComObject($document) | Out-Null }
    if ($word) { $word.Quit() | Out-Null; [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null }
    [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}

$edgePath = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if (-not (Test-Path -LiteralPath $edgePath)) { throw 'Microsoft Edge is required for PDF export on this workstation.' }
$htmlUri = 'file:///' + (($htmlPath -replace '\\', '/') -replace ' ', '%20')
$edgeProfile = Join-Path $env:TEMP 'cmms-documentation-edge-profile'
& $edgePath '--headless' '--disable-gpu' '--no-pdf-header-footer' ("--user-data-dir=$edgeProfile") ("--print-to-pdf=$pdfPath") $htmlUri | Out-Null
if (-not (Test-Path -LiteralPath $pdfPath)) { throw 'PDF export did not produce the expected file.' }

[pscustomobject]@{ Pages=$pageMatches.Count; Master=$masterPath; FieldMatrix=$fieldMatrixPath; Word=$docxPath; Pdf=$pdfPath }
