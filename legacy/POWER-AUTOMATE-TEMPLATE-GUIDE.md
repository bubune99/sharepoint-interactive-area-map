# Power Automate Template Integration Guide

## 🔧 Overview

This guide explains how to use the new lock-and-key template system with Power Automate to dynamically generate the AreaMap HTML file whenever SharePoint data changes.

## 📋 Architecture

### Lock-and-Key System
- **Lock (Template)**: `AreaMap-PowerAutomate-Template.html` - Contains placeholders
- **Keys (Data)**: 
  - SVG map file (`Artboard 1.svg`)
  - Personnel data from SharePoint list
  - Configuration values
- **Output**: `AreaMap.html` - Fully assembled interactive map

### Key Components

1. **Template File** (`AreaMap-PowerAutomate-Template.html`)
   - Self-contained HTML with placeholders
   - All CSS and JavaScript inline
   - No external dependencies

2. **Configuration** (`AreaMap-PowerAutomate-Config.json`)
   - Defines all placeholders
   - Specifies data sources
   - Controls transformations

3. **Build Script** (`Build-AreaMap.ps1`)
   - PowerShell demonstration of the process
   - Can be adapted for Power Automate

## 🔄 Power Automate Flow Setup

### Step 1: Create the Flow

1. **Trigger**: When an item is created or modified
   - List: Personnel
   - Site Address: Your SharePoint site

2. **Get Items**: Get all Personnel list items
   ```
   Site Address: [Your Site]
   List Name: Personnel
   Top Count: 5000
   ```

### Step 2: Read Template Files

1. **Get file content** - Template
   ```
   Site Address: [Your Site]
   File Identifier: /sites/yoursite/Documents/AreaMap-PowerAutomate-Template.html
   ```

2. **Get file content** - SVG
   ```
   Site Address: [Your Site]
   File Identifier: /sites/yoursite/Documents/Artboard 1.svg
   ```

### Step 3: Process SVG Content

**Compose** - Clean SVG
```json
{
  "CleanedSVG": "@{replace(replace(body('Get_file_content_-_SVG'), '<?xml version=\"1.0\" encoding=\"UTF-8\"?>', ''), '<svg', '<svg class=\"svg-map\"')}"
}
```

### Step 4: Transform Personnel Data

**Select** - Transform Personnel Records
```
From: @{body('Get_items')?['value']}
Map:
{
  "Title": "@{item()?['Title']}",
  "UserEmail": "@{item()?['UserEmail']}",
  "UserDisplayName": "@{item()?['UserDisplayName']}",
  "FirstName": "@{item()?['FirstName']}",
  "LastName": "@{item()?['LastName']}",
  "PreferredFirstName": "@{item()?['PreferredFirstName']}",
  "UserDepartment": "@{item()?['UserDepartment']}",
  "UserJobTitle": "@{item()?['UserJobTitle']}",
  "PrimaryAreaIDs": "@{split(coalesce(item()?['PrimaryAreaIDs'], ''), ';')}",
  "SecondaryAreaIDs": "@{split(coalesce(item()?['SecondaryAreaIDs'], ''), ';')}",
  "ManagerDisplayName": "@{item()?['ManagerDisplayName']}",
  "ManagerEmail": "@{item()?['ManagerEmail']}",
  "ManagerDepartment": "@{item()?['ManagerDepartment']}",
  "ManagerJobTitle": "@{item()?['ManagerJobTitle']}"
}
```

### Step 5: Replace Placeholders

**Compose** - Final HTML
```
@{
  replace(
    replace(
      replace(
        replace(
          replace(
            replace(
              body('Get_file_content_-_Template'),
              '{{TITLE}}',
              'Area Map - Personnel Query'
            ),
            '{{HEADER_TITLE}}',
            'Interactive Area Map - Personnel Directory'
          ),
          '{{SVG_CONTENT}}',
          outputs('Compose_-_Clean_SVG')?['CleanedSVG']
        ),
        '{{PERSONNEL_DATA}}',
        string(body('Select_-_Transform_Personnel_Records'))
      ),
      '{{C08_AREA_NAME}}',
      'Pacific Northwest'
    ),
    '{{ANALYTICS_FUNCTION}}',
    'console.log(''Analytics:'', { areaCode, areaName, region, timestamp: new Date().toISOString() });'
  )
}
```

### Step 6: Write Output File

**Create file** - Final AreaMap
```
Site Address: [Your Site]
Folder Path: /sites/yoursite/Documents
File Name: AreaMap.html
File Content: @{outputs('Compose_-_Final_HTML')}
```

## 🎯 Placeholders Reference

| Placeholder | Purpose | Source |
|------------|---------|--------|
| `{{TITLE}}` | Page title | Static value |
| `{{HEADER_TITLE}}` | Header bar text | Static value |
| `{{SVG_CONTENT}}` | Complete SVG map | Artboard 1.svg file |
| `{{PERSONNEL_DATA}}` | JSON array of personnel | SharePoint list |
| `{{C08_AREA_NAME}}` | Name for new C08 area | Variable/Config |
| `{{ANALYTICS_FUNCTION}}` | Analytics code | Conditional |

## 🔧 Advanced Configuration

### Adding New Areas

1. Update SVG file with new path element:
   ```svg
   <path id="C08_PacificNorthwest" class="cls-10" d="...path data..."/>
   ```

2. Update template or config with new area name:
   ```json
   "C08": "Pacific Northwest"
   ```

3. Flow will automatically include in next build

### Custom Analytics

Replace `{{ANALYTICS_FUNCTION}}` with your analytics code:
```javascript
// SharePoint REST API call
fetch(_spPageContextInfo.webAbsoluteUrl + '/_api/lists/...', {
    method: 'POST',
    headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose',
        'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value
    },
    body: JSON.stringify({
        '__metadata': { 'type': 'SP.Data.AnalyticsListItem' },
        'AreaCode': areaCode,
        'AreaName': areaName,
        'Region': region,
        'ClickTime': new Date().toISOString()
    })
});
```

## 📊 Testing

### Local Testing with PowerShell
```powershell
.\Build-AreaMap.ps1 -C08AreaName "Pacific Northwest"
```

### Validation Checklist
- [ ] SVG embeds correctly
- [ ] All paths are clickable
- [ ] Personnel data loads
- [ ] Modal displays on click
- [ ] Area dropdowns populate
- [ ] Search functionality works

## 🚀 Benefits

1. **No Dependencies**: Everything inline, works in restricted SharePoint
2. **Dynamic Updates**: Rebuilds when data changes
3. **Version Control**: Each build is complete and standalone
4. **Maintainable**: Clear separation of template and data
5. **Extensible**: Easy to add new areas or features

## 🔍 Troubleshooting

### Common Issues

1. **SVG not displaying**
   - Check SVG content is properly embedded
   - Verify no XML declaration remains
   - Ensure viewBox attribute present

2. **Personnel data not loading**
   - Verify JSON format is valid
   - Check array fields are properly split
   - Ensure no special characters break JSON

3. **Placeholders not replaced**
   - Check exact placeholder syntax
   - Verify Power Automate expressions
   - Test with simple values first

### Debug Mode

Add to template for debugging:
```javascript
console.log('Template loaded');
console.log('Personnel data:', personnelData);
console.log('SVG elements:', document.querySelectorAll('.svg-map path').length);
```

## 📝 Next Steps

1. **Implement in Power Automate**
   - Create flow following steps above
   - Test with sample data
   - Schedule regular rebuilds

2. **Enhance Template**
   - Add more placeholders as needed
   - Include conditional sections
   - Support multiple languages

3. **Monitor Performance**
   - Track build times
   - Monitor file sizes
   - Optimize as needed

---

*This template system provides a robust, maintainable solution for SharePoint's restricted environment while enabling dynamic content updates.*