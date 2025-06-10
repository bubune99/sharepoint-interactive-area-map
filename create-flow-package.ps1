# Create a directory for the package
$packageDir = ".\FlowPackage"
New-Item -ItemType Directory -Force -Path $packageDir

# Copy the flow definition and manifest
Copy-Item -Path ".\AreaPersonnelFlow.json" -Destination "$packageDir\definition.json"
Copy-Item -Path ".\manifest.json" -Destination "$packageDir\manifest.json"

# Create the zip file
$zipPath = ".\AreaPersonnel-Flow.zip"
Compress-Archive -Path "$packageDir\*" -DestinationPath $zipPath -Force

# Clean up the temporary directory
Remove-Item -Path $packageDir -Recurse -Force

Write-Host "Created Power Automate flow package at: $zipPath"
