#!/bin/bash

# Quick Build Script for CAE Area Map
# Converts CAE List.csv to working HTML with real personnel data

set -e

echo "🚀 CAE Area Map Quick Build Starting..."
echo "=================================="

# Configuration
TEMPLATE_FILE="AreaMap-Generated.html"
CSV_FILE="CAE List.csv"
OUTPUT_FILE="AreaMap-CAE-Data.html"
TEMP_JS_FILE="temp_personnel_data.js"

echo "📋 Build Configuration:"
echo "- Template: $TEMPLATE_FILE"
echo "- CSV Data: $CSV_FILE"
echo "- Output: $OUTPUT_FILE"

# Step 1: Check files exist
echo ""
echo "🔍 Step 1: Checking files..."
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "❌ Template file not found: $TEMPLATE_FILE"
    exit 1
fi

if [ ! -f "$CSV_FILE" ]; then
    echo "❌ CSV file not found: $CSV_FILE"
    exit 1
fi

echo "✅ All required files found"

# Step 2: Convert CSV to JavaScript
echo ""
echo "🔄 Step 2: Converting CSV to JavaScript..."

# Create JavaScript conversion using Node.js
cat > convert_csv.js << 'EOF'
const fs = require('fs');

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

function parseAreaIDs(areaString) {
    if (!areaString) return [];
    
    return areaString
        .replace(/[\[\]"]/g, '')
        .split(',')
        .map(area => area.trim())
        .map(area => area.replace(/_ /g, '_')) // Fix spaces after underscores
        .filter(area => area.length > 0);
}

function convertCSVToJS(csvFile, outputFile) {
    const csvContent = fs.readFileSync(csvFile, 'utf8');
    const lines = csvContent.split('\n');
    // Remove BOM and clean headers
    const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, '').replace(/﻿/g, '').trim());
    
    console.log('CSV Headers found:', headers);
    
    const personnel = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = parseCSVLine(lines[i]);
            if (values.length >= headers.length) {
                const person = {};
                headers.forEach((header, index) => {
                    let value = values[index] ? values[index].replace(/"/g, '').trim() : '';
                    person[header] = value;
                });
                
                console.log(`Processing person: ${person.User}, IncludeOnMap: ${person.IncludeOnMap}`);
                
                // Parse area IDs
                if (person.PrimaryAreaIDs) {
                    person.PrimaryAreaIDs = parseAreaIDs(person.PrimaryAreaIDs);
                }
                if (person.SecondaryAreaIDs) {
                    person.SecondaryAreaIDs = parseAreaIDs(person.SecondaryAreaIDs);
                }
                
                // Only include if IncludeOnMap is True
                if (person.IncludeOnMap === 'True') {
                    // Keep original CSV structure - don't convert field names
                    personnel.push(person);
                    console.log(`Added person: ${person.User}`);
                }
            }
        }
    }
    
    const jsContent = `const personnelData = ${JSON.stringify(personnel, null, 4)};`;
    fs.writeFileSync(outputFile, jsContent);
    
    console.log(`✅ Converted ${personnel.length} personnel records to JavaScript`);
    return personnel.length;
}

// Run conversion
const csvFile = process.argv[2];
const outputFile = process.argv[3];
convertCSVToJS(csvFile, outputFile);
EOF

# Run the conversion
node convert_csv.js "$CSV_FILE" "$TEMP_JS_FILE"
PERSONNEL_COUNT=$(grep -o '"Title"' "$TEMP_JS_FILE" | wc -l | tr -d ' ')

echo "✅ Personnel data converted ($PERSONNEL_COUNT records)"

# Step 3: Copy template and replace data
echo ""
echo "🔄 Step 3: Building HTML file..."

# Copy template to output
cp "$TEMPLATE_FILE" "$OUTPUT_FILE"

# Find the personnel data section and replace it
echo "🔄 Replacing personnel data in HTML..."

# Create a temporary file with the new personnel data
PERSONNEL_DATA=$(cat "$TEMP_JS_FILE")

# Use sed to replace the personnel data section
# Find the line with "const personnelData = [" and replace until the matching "];
python3 << EOF
import re

# Read the HTML file
with open('$OUTPUT_FILE', 'r') as f:
    content = f.read()

# Read the new personnel data
with open('$TEMP_JS_FILE', 'r') as f:
    new_data = f.read()

# Replace the personnel data section
# Pattern to match: const personnelData = [ ... ];
pattern = r'const personnelData = \[[\s\S]*?\];'
new_content = re.sub(pattern, new_data, content)

# Write back to file
with open('$OUTPUT_FILE', 'w') as f:
    f.write(new_content)

print("✅ Personnel data replaced in HTML")
EOF

# Step 4: Update title and metadata
echo ""
echo "🔄 Step 4: Updating HTML metadata..."

# Update the title
sed -i '' 's/<title>.*<\/title>/<title>Area Map - CAE Personnel Query (Live Data)<\/title>/' "$OUTPUT_FILE"

# Update header title
sed -i '' 's/Area Map - Personnel Query (Generated)/Area Map - CAE Personnel Query (Live Data)/' "$OUTPUT_FILE"

echo "✅ HTML metadata updated"

# Step 5: Cleanup
echo ""
echo "🧹 Step 5: Cleaning up..."
rm -f convert_csv.js "$TEMP_JS_FILE"
echo "✅ Temporary files cleaned up"

# Step 6: Validation
echo ""
echo "🔍 Step 6: Validating output..."
if [ -f "$OUTPUT_FILE" ]; then
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "✅ Output file created successfully"
    echo "📊 File size: $FILE_SIZE"
    echo "👥 Personnel records: $PERSONNEL_COUNT"
else
    echo "❌ Output file creation failed"
    exit 1
fi

echo ""
echo "🎉 CAE Area Map Build Complete!"
echo "================================"
echo "📄 Template: $TEMPLATE_FILE"
echo "📊 CSV Data: $CSV_FILE (updated automatically)"
echo "👥 Personnel: $PERSONNEL_COUNT live records"
echo "📁 Output: $OUTPUT_FILE"
echo ""
echo "🚀 Ready for testing!"
echo ""
echo "📋 Next Steps:"
echo "1. Open $OUTPUT_FILE in browser to test"
echo "2. Click areas on map to see live personnel data"
echo "3. Use search controls to filter by region/area"
echo "4. Re-run this script anytime 'CAE List.csv' is updated"
echo ""
echo "💡 Quick Updates:"
echo "   ./build-cae-areamap.sh    # Rebuild with latest CSV data"