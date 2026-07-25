# Check for non-Microsoft root CAs that could indicate TLS inspection
Write-Host "=== Non-Microsoft Root CAs in CurrentUser store ==="
$certs = Get-ChildItem -Path Cert:\CurrentUser\Root | Where-Object { $_.Issuer -notmatch "Microsoft" }
if ($certs) {
    $certs | Select-Object Subject, Issuer, Thumbprint | Format-Table -AutoSize
} else {
    Write-Host "(none found)"
}

Write-Host ""
Write-Host "=== Non-Microsoft Root CAs in LocalMachine store ==="
$certs2 = Get-ChildItem -Path Cert:\LocalMachine\Root | Where-Object { $_.Issuer -notmatch "Microsoft" }
if ($certs2) {
    $certs2 | Select-Object Subject, Issuer, Thumbprint | Format-Table -AutoSize
} else {
    Write-Host "(none found)"
}

Write-Host ""
Write-Host "=== All Root CAs in CurrentUser store (summary) ==="
Get-ChildItem -Path Cert:\CurrentUser\Root | Select-Object Subject, Issuer | Format-Table -AutoSize

Write-Host ""
Write-Host "=== Checking for common TLS inspection software ==="
$inspectionKeywords = @("Zscaler", "Symantec", "McAfee", "Norton", "Kaspersky", "Bitdefender", "ESET", "Avast", "AVG", "Fortinet", "Palo Alto", "Cisco", "Blue Coat", "Forcepoint", "Trustwave", "Digicert", "Entrust")
$allCerts = Get-ChildItem -Path Cert:\CurrentUser\Root -Recurse
$allCerts2 = Get-ChildItem -Path Cert:\LocalMachine\Root -Recurse
$combined = $allCerts + $allCerts2
foreach ($keyword in $inspectionKeywords) {
    $matches = $combined | Where-Object { $_.Subject -match $keyword -or $_.Issuer -match $keyword }
    if ($matches) {
        Write-Host "FOUND: $keyword"
        $matches | Select-Object Subject, Issuer, Thumbprint | Format-Table -AutoSize
    }
}
