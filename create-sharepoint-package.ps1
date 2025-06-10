# PowerShell script to create a SharePoint package for the Interactive Area Map
# This script creates two ZIP files:
# 1. A package for the SharePoint web part
# 2. A package for the Power Automate flow

# Create output directory if it doesn't exist
$outputDir = ".\SharePoint-Package"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "Created output directory: $outputDir"
}

# Create web part package
$webPartFiles = @(
    ".\index.html",
    ".\sharepoint-integration.js",
    ".\power-automate-integration.js",
    ".\styles.css",
    ".\images\Artboard 1.svg"
)

$webPartZipPath = "$outputDir\InteractiveAreaMap-WebPart.zip"
Compress-Archive -Path $webPartFiles -DestinationPath $webPartZipPath -Force
Write-Host "Created web part package: $webPartZipPath"

# Create Power Automate flow package
$flowZipPath = "$outputDir\AreaPersonnel-AutoPopulate-Flow.zip"
Compress-Archive -Path ".\AreaPersonnel-AutoPopulate-Flow.json" -DestinationPath $flowZipPath -Force
Write-Host "Created Power Automate flow package: $flowZipPath"

# Create documentation package
$docsFiles = @(
    ".\POWER-AUTOMATE-SETUP.md",
    ".\sharepoint-personnel-schema.json",
    ".\MVP\personnel.csv",
    ".\MVP\personnel_assignments.csv",
    ".\MVP\regions.csv",
    ".\MVP\areas.csv"
)

$docsZipPath = "$outputDir\InteractiveAreaMap-Documentation.zip"
Compress-Archive -Path $docsFiles -DestinationPath $docsZipPath -Force
Write-Host "Created documentation package: $docsZipPath"

Write-Host "`nAll packages created successfully in the $outputDir directory."
Write-Host "You can now upload these packages to your SharePoint site."
