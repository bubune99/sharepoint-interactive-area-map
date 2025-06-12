# PowerShell script to demonstrate the AreaMap building process
# This simulates what Power Automate would do

param(
    [string]$TemplateFile = "AreaMap-PowerAutomate-Template.html",
    [string]$SVGFile = "Artboard 1-3.svg",
    [string]$OutputFile = "AreaMap-Generated.html",
    [string]$PersonnelCSV = "personnel_data.csv",
    [string]$C08AreaName = "Central Texas",
    [string]$SiteUrl = "https://tenant.sharepoint.com/sites/sitename",
    [switch]$EnableAnalytics = $true
)

# Function to process SVG content
function Process-SVGContent {
    param([string]$svgPath)
    
    Write-Host "Processing SVG file: $svgPath" -ForegroundColor Green
    
    # Read SVG content
    $svgContent = Get-Content $svgPath -Raw
    
    # Remove XML declaration
    $svgContent = $svgContent -replace '<\?xml[^>]*\?>', ''
    
    # Add CSS class to SVG element
    if ($svgContent -match '<svg[^>]*>') {
        $svgTag = $matches[0]
        if ($svgTag -notmatch 'class=') {
            $newSvgTag = $svgTag -replace '>', ' class="svg-map">'
            $svgContent = $svgContent -replace [regex]::Escape($svgTag), $newSvgTag
        }
    }
    
    # Ensure all paths have IDs (for new C08 area)
    # This is where you'd add the new C08 path if needed
    
    return $svgContent.Trim()
}

# Function to convert personnel CSV to JSON
function Convert-PersonnelToJSON {
    param([string]$csvPath)
    
    Write-Host "Converting personnel data from: $csvPath" -ForegroundColor Green
    
    if (Test-Path $csvPath) {
        $personnel = Import-Csv $csvPath
        
        # Process each person
        $processedPersonnel = @()
        foreach ($person in $personnel) {
            $processedPerson = @{
                Title = $person.Title
                UserEmail = $person.UserEmail
                UserDisplayName = $person.UserDisplayName
                FirstName = $person.FirstName
                LastName = $person.LastName
                PreferredFirstName = $person.PreferredFirstName
                UserDepartment = $person.UserDepartment
                UserJobTitle = $person.UserJobTitle
                PrimaryAreaIDs = if ($person.PrimaryAreaIDs) { $person.PrimaryAreaIDs -split ';' | ForEach-Object { $_.Trim() } } else { @() }
                SecondaryAreaIDs = if ($person.SecondaryAreaIDs) { $person.SecondaryAreaIDs -split ';' | ForEach-Object { $_.Trim() } } else { @() }
                ManagerDisplayName = $person.ManagerDisplayName
                ManagerEmail = $person.ManagerEmail
                ManagerDepartment = $person.ManagerDepartment
                ManagerJobTitle = $person.ManagerJobTitle
            }
            $processedPersonnel += $processedPerson
        }
        
        return ($processedPersonnel | ConvertTo-Json -Compress)
    } else {
        Write-Host "Personnel CSV not found, using sample data" -ForegroundColor Yellow
        
        # Return sample data
        $sampleData = @(
            @{
                Title = "John Smith"
                UserEmail = "john.smith@company.com"
                UserDisplayName = "John Smith"
                FirstName = "John"
                LastName = "Smith"
                PreferredFirstName = "Johnny"
                UserDepartment = "Sales"
                UserJobTitle = "Sales Engineer"
                PrimaryAreaIDs = @("A01", "A02")
                SecondaryAreaIDs = @("B01")
                ManagerDisplayName = "Jane Manager"
                ManagerEmail = "jane.manager@company.com"
                ManagerDepartment = "Sales"
                ManagerJobTitle = "Regional Manager"
            },
            @{
                Title = "Sarah Johnson"
                UserEmail = "sarah.johnson@company.com"
                UserDisplayName = "Sarah Johnson"
                FirstName = "Sarah"
                LastName = "Johnson"
                PreferredFirstName = ""
                UserDepartment = "Engineering"
                UserJobTitle = "Senior Engineer"
                PrimaryAreaIDs = @("C01", "C02", "C08")
                SecondaryAreaIDs = @("C03")
                ManagerDisplayName = "Bob Director"
                ManagerEmail = "bob.director@company.com"
                ManagerDepartment = "Engineering"
                ManagerJobTitle = "Engineering Director"
            }
        )
        
        return ($sampleData | ConvertTo-Json -Compress)
    }
}

# Main process
Write-Host "`nAreaMap Build Process Starting..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Step 1: Read template
Write-Host "`nStep 1: Reading template file" -ForegroundColor Yellow
$template = Get-Content $TemplateFile -Raw

# Step 2: Process SVG
Write-Host "`nStep 2: Processing SVG content" -ForegroundColor Yellow
$svgContent = Process-SVGContent -svgPath $SVGFile

# Step 3: Convert personnel data
Write-Host "`nStep 3: Converting personnel data" -ForegroundColor Yellow
$personnelJSON = Convert-PersonnelToJSON -csvPath $PersonnelCSV

# Step 4: Replace placeholders
Write-Host "`nStep 4: Replacing placeholders" -ForegroundColor Yellow

$output = $template
$output = $output -replace '{{TITLE}}', 'Area Map - Personnel Query (Generated)'
$output = $output -replace '{{HEADER_TITLE}}', 'Interactive Area Map - Personnel Directory'
$output = $output -replace '{{SVG_CONTENT}}', $svgContent
$output = $output -replace '{{PERSONNEL_DATA}}', $personnelJSON
$output = $output -replace '{{C08_AREA_NAME}}', $C08AreaName
$output = $output -replace '{{SITE_URL}}', $SiteUrl

# Add analytics function based on EnableAnalytics switch
if ($EnableAnalytics) {
    $analyticsFunction = @'
            console.log('Local testing - Enhanced analytics system built into template');
            // For local testing, just log to console
            // The enhanced persistence system will work in SharePoint environment
'@
} else {
    $analyticsFunction = @'
            console.log('Analytics disabled for local testing');
'@
}

$output = $output -replace '{{ANALYTICS_FUNCTION}}', $analyticsFunction

# Step 5: Write output file
Write-Host "`nStep 5: Writing output file" -ForegroundColor Yellow
$output | Out-File -FilePath $OutputFile -Encoding UTF8

Write-Host "`nBuild Complete!" -ForegroundColor Green
Write-Host "Output file: $OutputFile" -ForegroundColor Green

# Display summary
Write-Host "`nBuild Summary:" -ForegroundColor Cyan
Write-Host "- Template: $TemplateFile"
Write-Host "- SVG: $SVGFile"
Write-Host "- Personnel Data: $PersonnelCSV"
Write-Host "- C08 Area Name: $C08AreaName"
Write-Host "- Site URL: $SiteUrl"
Write-Host "- Analytics Enabled: $EnableAnalytics"
Write-Host "- Output: $OutputFile"

Write-Host "`nAnalytics Features:" -ForegroundColor Cyan
Write-Host "- Local Buffer: localStorage with 1000 item limit"
Write-Host "- Sync Interval: Every 12 hours"
Write-Host "- SharePoint List: AreaMapAnalytics"
Write-Host "- Grouped Areas: A04, B05, C06 tracked as single units"
Write-Host "- New Areas: A08 (Atlanta), C08 (Central Texas)"

# Validate output
if (Test-Path $OutputFile) {
    $fileSize = (Get-Item $OutputFile).Length / 1KB
    Write-Host "`nOutput file size: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Green
} else {
    Write-Host "`nError: Output file was not created!" -ForegroundColor Red
}