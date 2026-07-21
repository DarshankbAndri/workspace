param(
    [string]$FrontendUrl = 'http://localhost:3500',
    [string]$BackendUrl = 'http://localhost:4111/api',
    [string]$OutputDirectory = (Join-Path $PSScriptRoot 'screenshots')
)

$ErrorActionPreference = 'Stop'
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if (-not (Test-Path -LiteralPath $edge)) { throw 'Microsoft Edge is not installed.' }
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

# Repository-sanctioned sample user. Never emit credentials or the returned token.
$loginBody = @{ username = 'cmms.superadmin'; password = 'andritz' } | ConvertTo-Json
$loginEnvelope = Invoke-RestMethod -Method Post -Uri "$BackendUrl/auth/login" -ContentType 'application/json' -Body $loginBody
$access = $loginEnvelope.data
if (-not $access.token -or -not $access.user) { throw 'Demo authentication did not return the required access payload.' }

$port = 9444
$profile = Join-Path $env:TEMP 'cmms-screenshot-edge-profile'
$process = Start-Process -FilePath $edge -ArgumentList @(
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-address=127.0.0.1', "--remote-debugging-port=$port",
    "--user-data-dir=$profile", '--window-size=1440,1100', "$FrontendUrl/login"
) -WindowStyle Hidden -PassThru

function Get-CdpTarget {
    for ($attempt = 0; $attempt -lt 50; $attempt++) {
        try {
            $targets = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json" -TimeoutSec 2
            $target = $targets | Where-Object { $_.type -eq 'page' } | Select-Object -First 1
            if ($target) { return $target }
        } catch { Start-Sleep -Milliseconds 200 }
    }
    throw 'Unable to connect to the temporary browser debugging target.'
}

$socket = [System.Net.WebSockets.ClientWebSocket]::new()
$target = Get-CdpTarget
$socket.ConnectAsync([Uri]$target.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
$script:messageId = 0

function Invoke-Cdp([string]$Method, [hashtable]$Params = @{}) {
    $script:messageId++
    $id = $script:messageId
    $payload = @{ id = $id; method = $Method; params = $Params } | ConvertTo-Json -Depth 20 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($payload)
    $segment = [ArraySegment[byte]]::new($bytes)
    $socket.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    while ($true) {
        $buffer = New-Object byte[] 1048576
        $received = $socket.ReceiveAsync([ArraySegment[byte]]::new($buffer), [Threading.CancellationToken]::None).GetAwaiter().GetResult()
        $json = [Text.Encoding]::UTF8.GetString($buffer, 0, $received.Count) | ConvertFrom-Json
        if ($json.id -eq $id) {
            if ($json.error) { throw ("CDP error: " + ($json.error | ConvertTo-Json -Compress)) }
            return $json.result
        }
    }
}

function Js-Literal($Value) {
    return ($Value | ConvertTo-Json -Depth 20 -Compress)
}

try {
    Invoke-Cdp 'Page.enable' | Out-Null
    Invoke-Cdp 'Runtime.enable' | Out-Null
    Invoke-Cdp 'Emulation.setDeviceMetricsOverride' @{ width=1440; height=1100; deviceScaleFactor=1; mobile=$false } | Out-Null
    Invoke-Cdp 'Page.navigate' @{ url="$FrontendUrl/login" } | Out-Null
    Start-Sleep -Seconds 1

    $storageScript = @(
        "localStorage.setItem('user', JSON.stringify($(Js-Literal $access.user)))",
        "localStorage.setItem('token', $(Js-Literal $access.token))",
        "localStorage.setItem('roles', JSON.stringify($(Js-Literal $access.roles)))",
        "localStorage.setItem('permissions', JSON.stringify($(Js-Literal $access.permissions)))",
        "localStorage.setItem('allowedSites', JSON.stringify($(Js-Literal $access.allowedSites)))"
    ) -join ';'
    Invoke-Cdp 'Runtime.evaluate' @{ expression=$storageScript; returnByValue=$true } | Out-Null

    $captures = [ordered]@{
        '01-company-profile.png' = '/admin/company'
        '02-site-create.png' = '/hr/sites/new'
        '03-employee-create.png' = '/hr/employees/new'
        '04-role-create.png' = '/admin/roles/new'
        '05-user-create.png' = '/create-user'
        '06-vendor-create.png' = '/vendors/new'
        '07-vendor-amc-create.png' = '/vendor-amc/create'
        '08-equipment-create.png' = '/equipment/new'
        '09-maintenance-request-create.png' = '/maintenance/requests/new'
        '10-maintenance-assignment-create.png' = '/maintenance/assignments/new'
        '11-downtime-create.png' = '/maintenance/downtime/new'
        '12-preventive-maintenance-create.png' = '/maintenance/preventive/new'
        '13-spare-part-create.png' = '/inventory/spare-parts/new'
        '14-approval-configuration.png' = '/admin/approval-config'
        '15-notification-configuration.png' = '/admin/notification-settings'
        '16-spare-manager-approval.png' = '/inventory/spare-approvals'
        '17-spare-store-processing.png' = '/inventory/spare-requests'
        '18-reorder-management.png' = '/inventory/reorders'
    }

    foreach ($entry in $captures.GetEnumerator()) {
        Invoke-Cdp 'Page.navigate' @{ url=($FrontendUrl + $entry.Value) } | Out-Null
        Start-Sleep -Milliseconds 1800
        $shot = Invoke-Cdp 'Page.captureScreenshot' @{ format='png'; fromSurface=$true; captureBeyondViewport=$false }
        [IO.File]::WriteAllBytes((Join-Path $OutputDirectory $entry.Key), [Convert]::FromBase64String($shot.data))
    }
}
finally {
    if ($socket.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
        $socket.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, 'done', [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    }
    $socket.Dispose()
    if (-not $process.HasExited) { Stop-Process -Id $process.Id -Force }
}

Get-ChildItem -LiteralPath $OutputDirectory -Filter '*.png' | Sort-Object Name | Select-Object Name, Length
