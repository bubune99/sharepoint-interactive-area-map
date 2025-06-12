#!/bin/bash

# Build AreaMap - Bash Script Version
# This script simulates what Power Automate would do to generate the final HTML

echo "🚀 AreaMap Build Process Starting..."
echo "=================================="

# Set default values
TEMPLATE_FILE="AreaMap-PowerAutomate-Template.html"
SVG_FILE="Artboard 1-3.svg"
OUTPUT_FILE="AreaMap-Generated.html"
SITE_URL="https://yourtenant.sharepoint.com/sites/yoursite"
ENABLE_ANALYTICS=true
C08_AREA_NAME="Central Texas"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --template)
            TEMPLATE_FILE="$2"
            shift 2
            ;;
        --svg)
            SVG_FILE="$2"
            shift 2
            ;;
        --output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        --site-url)
            SITE_URL="$2"
            shift 2
            ;;
        --disable-analytics)
            ENABLE_ANALYTICS=false
            shift
            ;;
        --c08-name)
            C08_AREA_NAME="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --template FILE      Template HTML file (default: $TEMPLATE_FILE)"
            echo "  --svg FILE          SVG map file (default: $SVG_FILE)"
            echo "  --output FILE       Output HTML file (default: $OUTPUT_FILE)"
            echo "  --site-url URL      SharePoint site URL"
            echo "  --disable-analytics Disable analytics features"
            echo "  --c08-name NAME     Name for C08 area (default: $C08_AREA_NAME)"
            echo "  -h, --help          Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "📋 Build Configuration:"
echo "- Template: $TEMPLATE_FILE"
echo "- SVG: $SVG_FILE"
echo "- Output: $OUTPUT_FILE"
echo "- Site URL: $SITE_URL"
echo "- Analytics: $ENABLE_ANALYTICS"
echo "- C08 Area: $C08_AREA_NAME"
echo ""

# Step 1: Check if files exist
echo "🔍 Step 1: Checking files..."
if [[ ! -f "$TEMPLATE_FILE" ]]; then
    echo "❌ Template file not found: $TEMPLATE_FILE"
    exit 1
fi

if [[ ! -f "$SVG_FILE" ]]; then
    echo "❌ SVG file not found: $SVG_FILE"
    exit 1
fi

echo "✅ All required files found"

# Step 2: Process SVG content
echo "🎨 Step 2: Processing SVG content..."
SVG_CONTENT=$(cat "$SVG_FILE" | sed 's/<?xml[^>]*?>//g' | sed 's/<svg/<svg class="svg-map"/g')
echo "✅ SVG processed (removed XML declaration, added CSS class)"

# Step 3: Generate sample personnel data with EPC clients
echo "👥 Step 3: Generating sample personnel data with EPC clients..."
PERSONNEL_DATA='[
    {
        "Title": "John Smith",
        "UserEmail": "john.smith@company.com",
        "UserDisplayName": "John Smith",
        "FirstName": "John",
        "LastName": "Smith",
        "PreferredFirstName": "Johnny",
        "UserDepartment": "Sales",
        "UserJobTitle": "Sales Engineer",
        "PrimaryAreaIDs": ["A01", "A02"],
        "SecondaryAreaIDs": ["B01"],
        "ManagerDisplayName": "Jane Manager",
        "ManagerEmail": "jane.manager@company.com",
        "ManagerDepartment": "Sales",
        "ManagerJobTitle": "Regional Manager"
    },
    {
        "Title": "Sarah Johnson",
        "UserEmail": "sarah.johnson@company.com",
        "UserDisplayName": "Sarah Johnson",
        "FirstName": "Sarah",
        "LastName": "Johnson",
        "PreferredFirstName": "",
        "UserDepartment": "Engineering",
        "UserJobTitle": "Senior Engineer",
        "PrimaryAreaIDs": ["C01", "C02", "C08"],
        "SecondaryAreaIDs": ["C03"],
        "ManagerDisplayName": "Bob Director",
        "ManagerEmail": "bob.director@company.com",
        "ManagerDepartment": "Engineering",
        "ManagerJobTitle": "Engineering Director"
    },
    {
        "Title": "Mike Wilson",
        "UserEmail": "mike.wilson@company.com",
        "UserDisplayName": "Mike Wilson",
        "FirstName": "Mike",
        "LastName": "Wilson",
        "PreferredFirstName": "Michael",
        "UserDepartment": "Operations",
        "UserJobTitle": "Operations Specialist",
        "PrimaryAreaIDs": ["A08"],
        "SecondaryAreaIDs": ["A07", "A06"],
        "ManagerDisplayName": "Lisa Supervisor",
        "ManagerEmail": "lisa.supervisor@company.com",
        "ManagerDepartment": "Operations",
        "ManagerJobTitle": "Operations Manager"
    },
    {
        "Title": "Emily Davis",
        "UserEmail": "emily.davis@company.com",
        "UserDisplayName": "Emily Davis",
        "FirstName": "Emily",
        "LastName": "Davis",
        "PreferredFirstName": "",
        "UserDepartment": "Support",
        "UserJobTitle": "Customer Success Manager",
        "PrimaryAreaIDs": ["B05", "B06"],
        "SecondaryAreaIDs": ["B04"],
        "ManagerDisplayName": "Tom Lead",
        "ManagerEmail": "tom.lead@company.com",
        "ManagerDepartment": "Support",
        "ManagerJobTitle": "Support Director"
    },
    {
        "Title": "David Rodriguez",
        "UserEmail": "david.rodriguez@company.com",
        "UserDisplayName": "David Rodriguez",
        "FirstName": "David",
        "LastName": "Rodriguez",
        "PreferredFirstName": "Dave",
        "UserDepartment": "Marketing",
        "UserJobTitle": "Regional Marketing Manager",
        "PrimaryAreaIDs": ["C05", "C06", "C07"],
        "SecondaryAreaIDs": ["C04"],
        "ManagerDisplayName": "Anna Chief",
        "ManagerEmail": "anna.chief@company.com",
        "ManagerDepartment": "Marketing",
        "ManagerJobTitle": "CMO"
    },
    {
        "Title": "Jennifer Chen",
        "UserEmail": "jennifer.chen@company.com",
        "UserDisplayName": "Jennifer Chen",
        "FirstName": "Jennifer",
        "LastName": "Chen",
        "PreferredFirstName": "Jen",
        "UserDepartment": "EPC Division",
        "UserJobTitle": "EPC Project Manager",
        "PrimaryAreaIDs": ["EPC-Microsoft", "EPC-Amazon"],
        "SecondaryAreaIDs": ["CLIENT-Google"],
        "ManagerDisplayName": "Robert EPC Director",
        "ManagerEmail": "robert.director@company.com",
        "ManagerDepartment": "EPC Division",
        "ManagerJobTitle": "EPC Operations Director"
    },
    {
        "Title": "Thomas Anderson",
        "UserEmail": "thomas.anderson@company.com",
        "UserDisplayName": "Thomas Anderson",
        "FirstName": "Thomas",
        "LastName": "Anderson",
        "PreferredFirstName": "Tom",
        "UserDepartment": "EPC Division",
        "UserJobTitle": "Senior EPC Consultant",
        "PrimaryAreaIDs": ["PROJ-Tesla", "B03"],
        "SecondaryAreaIDs": ["EPC-Microsoft"],
        "ManagerDisplayName": "Jennifer Chen",
        "ManagerEmail": "jennifer.chen@company.com",
        "ManagerDepartment": "EPC Division",
        "ManagerJobTitle": "EPC Project Manager"
    },
    {
        "Title": "Maria Garcia",
        "UserEmail": "maria.garcia@company.com",
        "UserDisplayName": "Maria Garcia",
        "FirstName": "Maria",
        "LastName": "Garcia",
        "PreferredFirstName": "",
        "UserDepartment": "EPC Division",
        "UserJobTitle": "EPC Technical Lead",
        "PrimaryAreaIDs": ["CLIENT-IBM", "CLIENT-Oracle"],
        "SecondaryAreaIDs": ["A05"],
        "ManagerDisplayName": "Robert EPC Director",
        "ManagerEmail": "robert.director@company.com",
        "ManagerDepartment": "EPC Division",
        "ManagerJobTitle": "EPC Operations Director"
    },
    {
        "Title": "Alex Kumar",
        "UserEmail": "alex.kumar@company.com",
        "UserDisplayName": "Alex Kumar",
        "FirstName": "Alex",
        "LastName": "Kumar",
        "PreferredFirstName": "",
        "UserDepartment": "Special Projects",
        "UserJobTitle": "Project Coordinator",
        "PrimaryAreaIDs": ["SPECIAL-Government", "C01"],
        "SecondaryAreaIDs": ["EPC-Amazon", "PROJ-Tesla"],
        "ManagerDisplayName": "David Rodriguez",
        "ManagerEmail": "david.rodriguez@company.com",
        "ManagerDepartment": "Marketing",
        "ManagerJobTitle": "CMO"
    },
    {
        "Title": "Lisa Wang",
        "UserEmail": "lisa.wang@company.com",
        "UserDisplayName": "Lisa Wang",
        "FirstName": "Lisa",
        "LastName": "Wang",
        "PreferredFirstName": "",
        "UserDepartment": "EPC Division",
        "UserJobTitle": "EPC Account Manager",
        "PrimaryAreaIDs": ["CLIENT-Google"],
        "SecondaryAreaIDs": ["CLIENT-IBM", "B07"],
        "ManagerDisplayName": "Jennifer Chen",
        "ManagerEmail": "jennifer.chen@company.com",
        "ManagerDepartment": "EPC Division",
        "ManagerJobTitle": "EPC Project Manager"
    }
]'

echo "✅ Sample personnel data generated (10 records: 5 regional + 5 EPC)"

# Step 4: Set up analytics function
echo "📊 Step 4: Configuring analytics..."
if [[ "$ENABLE_ANALYTICS" == true ]]; then
    ANALYTICS_FUNCTION="console.log('Enhanced analytics system active - data will persist across rebuilds');"
    echo "✅ Analytics enabled with persistence"
else
    ANALYTICS_FUNCTION="console.log('Analytics disabled for this build');"
    echo "ℹ️ Analytics disabled"
fi

# Step 5: Replace template placeholders
echo "🔄 Step 5: Replacing template placeholders..."

# Read template content
TEMPLATE_CONTENT=$(cat "$TEMPLATE_FILE")

# Escape special characters for sed
SVG_CONTENT_ESCAPED=$(echo "$SVG_CONTENT" | sed 's/[[\.*^$()+?{|]/\\&/g')
PERSONNEL_DATA_ESCAPED=$(echo "$PERSONNEL_DATA" | sed 's/[[\.*^$()+?{|]/\\&/g')
SITE_URL_ESCAPED=$(echo "$SITE_URL" | sed 's/[[\.*^$()+?{|]/\\&/g')
ANALYTICS_FUNCTION_ESCAPED=$(echo "$ANALYTICS_FUNCTION" | sed 's/[[\.*^$()+?{|]/\\&/g')

# Create temporary file for processing
TEMP_FILE=$(mktemp)
echo "$TEMPLATE_CONTENT" > "$TEMP_FILE"

# Replace placeholders one by one
echo "  🔄 Replacing {{TITLE}}..."
sed -i.bak 's/{{TITLE}}/Area Map - Personnel Query (Generated)/g' "$TEMP_FILE"

echo "  🔄 Replacing {{HEADER_TITLE}}..."
sed -i.bak 's/{{HEADER_TITLE}}/Interactive Area Map - Personnel Directory/g' "$TEMP_FILE"

echo "  🔄 Replacing {{SVG_CONTENT}}..."
# For SVG content, we need to use a different approach due to special characters
python3 -c "
import sys
content = open('$TEMP_FILE', 'r').read()
svg_content = '''$SVG_CONTENT'''
content = content.replace('{{SVG_CONTENT}}', svg_content)
open('$TEMP_FILE', 'w').write(content)
"

echo "  🔄 Replacing {{PERSONNEL_DATA}}..."
python3 -c "
import sys
content = open('$TEMP_FILE', 'r').read()
personnel_data = '''$PERSONNEL_DATA'''
content = content.replace('{{PERSONNEL_DATA}}', personnel_data)
open('$TEMP_FILE', 'w').write(content)
"

echo "  🔄 Replacing {{SITE_URL}}..."
sed -i.bak "s|{{SITE_URL}}|$SITE_URL_ESCAPED|g" "$TEMP_FILE"

echo "  🔄 Replacing {{ANALYTICS_FUNCTION}}..."
sed -i.bak "s/{{ANALYTICS_FUNCTION}}/$ANALYTICS_FUNCTION_ESCAPED/g" "$TEMP_FILE"

echo "✅ All placeholders replaced"

# Step 6: Write output file
echo "📝 Step 6: Writing output file..."
cp "$TEMP_FILE" "$OUTPUT_FILE"
rm "$TEMP_FILE" "$TEMP_FILE.bak" 2>/dev/null

echo "✅ Output written to: $OUTPUT_FILE"

# Step 7: Validate output
echo "🔍 Step 7: Validating output..."
OUTPUT_SIZE=$(wc -c < "$OUTPUT_FILE")
OUTPUT_SIZE_KB=$((OUTPUT_SIZE / 1024))

if [[ $OUTPUT_SIZE -gt 0 ]]; then
    echo "✅ Output file created successfully"
    echo "📊 File size: ${OUTPUT_SIZE_KB} KB"
    
    # Check for placeholder remnants
    REMAINING_PLACEHOLDERS=$(grep -o "{{[^}]*}}" "$OUTPUT_FILE" | wc -l)
    if [[ $REMAINING_PLACEHOLDERS -gt 0 ]]; then
        echo "⚠️  Warning: $REMAINING_PLACEHOLDERS unreplaced placeholders found"
        grep -o "{{[^}]*}}" "$OUTPUT_FILE" | sort | uniq
    else
        echo "✅ All placeholders successfully replaced"
    fi
    
    # Count personnel records
    PERSONNEL_COUNT=$(grep -o '"Title"' "$OUTPUT_FILE" | wc -l)
    echo "👥 Personnel records included: $PERSONNEL_COUNT"
    
    # Check for new areas
    if grep -q "A08" "$OUTPUT_FILE" && grep -q "C08" "$OUTPUT_FILE"; then
        echo "🗺️  New areas confirmed: A08 (Atlanta), C08 ($C08_AREA_NAME)"
    fi
    
else
    echo "❌ Error: Output file is empty or not created"
    exit 1
fi

# Step 8: Display summary
echo ""
echo "🎉 Build Complete!"
echo "================="
echo "📄 Template: $TEMPLATE_FILE"
echo "🗺️  SVG Map: $SVG_FILE (24 areas including A08, C08)"
echo "👥 Personnel: 10 sample records (5 regional + 5 EPC clients)"
echo "📊 Analytics: $([ "$ENABLE_ANALYTICS" == true ] && echo "Enabled with SharePoint persistence" || echo "Disabled")"
echo "🌐 Site URL: $SITE_URL"
echo "📁 Output: $OUTPUT_FILE ($OUTPUT_SIZE_KB KB)"
echo ""
echo "🚀 Ready for SharePoint deployment!"
echo ""
echo "📋 Next Steps:"
echo "1. Upload $OUTPUT_FILE to SharePoint Documents library"
echo "2. Create Personnel and AreaMapAnalytics SharePoint lists"
echo "3. Set up Power Automate flows using POWER-AUTOMATE-MANUAL-SETUP.md"
echo "4. Test the interactive map functionality"
echo "5. Configure permissions and analytics dashboard"
echo ""
echo "📖 For detailed deployment instructions, see:"
echo "   - documentation/06-deployment-guide.md"
echo "   - POWER-AUTOMATE-MANUAL-SETUP.md"

# Optional: Open the file in browser if on macOS
if [[ "$OSTYPE" == "darwin"* ]] && command -v open &> /dev/null; then
    echo ""
    read -p "🌐 Open the generated file in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "$OUTPUT_FILE"
        echo "🌐 Opened $OUTPUT_FILE in default browser"
    fi
fi