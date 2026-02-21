# Export HR_Employees from SQL Server to CSV (UTF-8) for PostgreSQL COPY.
# Usage: .\export-hr-employees-sqlserver.ps1 -ConnectionString "Server=192.168.20.166;Database=ATS_HRMS;User Id=tech;Password=tech;TrustServerCertificate=true;" -OutputPath ".\hr_employees.csv"
param(
    [Parameter(Mandatory=$true)]
    [string]$ConnectionString,
    [string]$OutputPath = ".\hr_employees.csv"
)

$ErrorActionPreference = "Stop"
$sql = @"
SELECT
    EmployeeID, EmpCode, FirstName, LastName, FullName, Email, Phone, Mobile,
    DepartmentID, DesignationID, JoinDate, HireDate, TerminationDate, DOB, DateOfBirth,
    Gender, MaritalStatus, CNIC, Nationality, BloodGroup, Address, City,
    ManagerID, IsActive, Status, Photo, ProfilePicture, CreatedAt, ModifiedDate
FROM dbo.HR_Employees
"@
# Adjust column names to match your actual SQL Server table (run 01-schemas-and-tables.sql to confirm).

try {
    $conn = New-Object System.Data.SqlClient.SqlConnection($ConnectionString)
    $conn.Open()
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = $sql
    $reader = $cmd.ExecuteReader()
    $columns = @()
    for ($i = 0; $i -lt $reader.FieldCount; $i++) { $columns += $reader.GetName($i) }
    $lines = New-Object System.Collections.ArrayList
    [void]$lines.Add(($columns -join ","))
    while ($reader.Read()) {
        $row = for ($i = 0; $i -lt $reader.FieldCount; $i++) {
            $v = $reader.GetValue($i)
            if ($null -eq $v -or [DBNull]::Value.Equals($v)) { "" }
            else {
                $s = $v.ToString()
                if ($s -match '[,"\r\n]') { '"' + $s.Replace('"','""') + '"' } else { $s }
            }
        }
        [void]$lines.Add(($row -join ","))
    }
    $reader.Close()
    $conn.Close()
    [System.IO.File]::WriteAllLines((Resolve-Path $OutputPath -ErrorAction SilentlyContinue).Path ?? $OutputPath, $lines, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Exported to $OutputPath"
} catch {
    Write-Error $_
    exit 1
}
