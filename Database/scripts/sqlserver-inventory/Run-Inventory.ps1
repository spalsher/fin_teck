# Run SQL Server inventory scripts and export results to CSV.
# Usage: .\Run-Inventory.ps1 -ConnectionString "Server=...;Database=ATS_HRMS;User Id=...;Password=...;TrustServerCertificate=true;" -OutputDir ".\output"
param(
    [Parameter(Mandatory=$true)]
    [string]$ConnectionString,
    [string]$OutputDir = ".\output"
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir | Out-Null }

$scripts = @(
    @{ Name = "01-schemas-and-tables"; File = "01-schemas-and-tables.sql" },
    @{ Name = "02-keys-and-constraints"; File = "02-keys-and-constraints.sql" },
    @{ Name = "03-programmability"; File = "03-programmability.sql" }
)

try {
    $conn = New-Object System.Data.SqlClient.SqlConnection($ConnectionString)
    $conn.Open()
} catch {
    Write-Error "Failed to connect: $_"
    exit 1
}

foreach ($s in $scripts) {
    $sqlFile = Join-Path $scriptDir $s.File
    if (-not (Test-Path $sqlFile)) {
        Write-Warning "Skip $($s.File): not found."
        continue
    }
    $sql = Get-Content $sqlFile -Raw
    $outCsv = Join-Path $OutputDir "$($s.Name)-result.csv"
    try {
        $cmd = $conn.CreateCommand()
        $cmd.CommandText = $sql
        $cmd.CommandTimeout = 120
        $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($cmd)
        $dt = New-Object System.Data.DataTable
        [void]$adapter.Fill($dt)
        $dt | Export-Csv -Path $outCsv -NoTypeInformation -Encoding UTF8
        Write-Host "Exported $($dt.Rows.Count) rows to $outCsv"
    } catch {
        Write-Warning "Error running $($s.File): $_"
    }
}

$conn.Close()
Write-Host "Done. Output in $OutputDir"
