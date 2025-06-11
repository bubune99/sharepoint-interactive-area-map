# Personnel CSV Integration Guide

## 📊 Overview

The Personnel CSV system manages employee data, area assignments, and organizational relationships. It serves as the core data source for the AreaMap application, enabling dynamic personnel queries and relationship mapping.

## 📋 CSV Schema Definition

### Required Columns

| Column Name | Type | Required | Description | Example |
|-------------|------|----------|-------------|---------|
| `Title` | String | Yes | Full display name | "John Smith" |
| `UserEmail` | String | Yes | Primary email address | "john.smith@company.com" |
| `UserDisplayName` | String | Yes | Display name for UI | "John Smith" |
| `FirstName` | String | Yes | Given name | "John" |
| `LastName` | String | Yes | Family name | "Smith" |
| `PreferredFirstName` | String | No | Preferred/nickname | "Johnny" |
| `UserDepartment` | String | Yes | Department name | "Sales" |
| `UserJobTitle` | String | Yes | Position title | "Sales Engineer" |
| `PrimaryAreaIDs` | String | Yes | Semicolon-separated area codes | "A1;A2;B1" |
| `SecondaryAreaIDs` | String | No | Secondary coverage areas | "C1;C2" |
| `ManagerDisplayName` | String | No | Manager's full name | "Jane Manager" |
| `ManagerEmail` | String | No | Manager's email | "jane.manager@company.com" |
| `ManagerDepartment` | String | No | Manager's department | "Sales" |
| `ManagerJobTitle` | String | No | Manager's position | "Regional Manager" |

### Sample CSV Structure
```csv
Title,UserEmail,UserDisplayName,FirstName,LastName,PreferredFirstName,UserDepartment,UserJobTitle,PrimaryAreaIDs,SecondaryAreaIDs,ManagerDisplayName,ManagerEmail,ManagerDepartment,ManagerJobTitle
John Smith,john.smith@company.com,John Smith,John,Smith,Johnny,Sales,Sales Engineer,A1;A2,B1,Jane Manager,jane.manager@company.com,Sales,Regional Manager
Jane Manager,jane.manager@company.com,Jane Manager,Jane,Manager,,Sales,Regional Manager,B1;B2;B3,,Tom Director,tom.director@company.com,Executive,Sales Director
Bob Wilson,bob.wilson@company.com,Bob Wilson,Robert,Wilson,Bob,Technical,Support Engineer,C1,A3;A4,Jane Manager,jane.manager@company.com,Sales,Regional Manager
```

## 🗺️ Area Code System

### Geographic Regions
```
East Region: A01-A99 (or A1-A99)
Central Region: B01-B99 (or B1-B99) 
West Region: C01-C99 (or C1-C99)
```

### Supported Area Codes
```javascript
const areaNames = {
    // East Region (A-codes)
    'A1': 'Baltimore Coast',   'A01': 'Baltimore Coast',
    'A2': 'South East',        'A02': 'South East', 
    'A3': 'New England',       'A03': 'New England',
    'A4': 'New York',          'A04': 'New York',
    'A5': 'Philadelphia',      'A05': 'Philadelphia',
    'A6': 'Gulf Coast',        'A06': 'Gulf Coast',
    'A7': 'Florida',           'A07': 'Florida',
    
    // Central Region (B-codes)
    'B1': 'Chicago',           'B01': 'Chicago',
    'B2': 'Michigan',          'B02': 'Michigan',
    'B3': 'Ohio Valley',       'B03': 'Ohio Valley',
    'B4': 'Central Plains',    'B04': 'Central Plains',
    'B5': 'North Central',     'B05': 'North Central',
    'B6': 'Nashville',         'B06': 'Nashville',
    'B7': 'St. Louis',         'B07': 'St. Louis',
    'B8': 'Tulsa',             'B08': 'Tulsa',
    
    // West Region (C-codes)
    'C1': 'Denver',            'C01': 'Denver',
    'C2': 'Dallas',            'C02': 'Dallas',
    'C3': 'Houston',           'C03': 'Houston',
    'C4': 'Phoenix',           'C04': 'Phoenix',
    'C5': 'Northern California', 'C05': 'Northern California',
    'C6': 'Seattle',           'C06': 'Seattle',
    'C7': 'Los Angeles',       'C07': 'Los Angeles'
};
```

## 🔄 Data Processing Logic

### CSV Parsing Function
```javascript
function parseCSV(csvText) {
    const lines = csvText.split('\\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const item = {};
        
        // Map each column to object property
        headers.forEach((header, index) => {
            item[header] = values[index] ? values[index].trim() : '';
        });
        
        // Parse area IDs (semicolon-separated)
        item.PrimaryAreaIDs = item.PrimaryAreaIDs ? 
            item.PrimaryAreaIDs.split(';').filter(id => id.trim()) : [];
        item.SecondaryAreaIDs = item.SecondaryAreaIDs ? 
            item.SecondaryAreaIDs.split(';').filter(id => id.trim()) : [];
        
        // Create manager object for compatibility
        if (item.ManagerDisplayName) {
            item.Manager = {
                DisplayName: item.ManagerDisplayName,
                Email: item.ManagerEmail,
                Department: item.ManagerDepartment,
                JobTitle: item.ManagerJobTitle
            };
        }
        
        data.push(item);
    }
    
    return data;
}
```

### Area Assignment Logic
```javascript
function findMatchingPersonnel(region, area, coverageType) {
    return personnelData.filter(person => {
        const primaryAreas = person.PrimaryAreaIDs || [];
        const secondaryAreas = person.SecondaryAreaIDs || [];
        
        // Check region match
        const regionPrefix = getRegionPrefix(region); // A, B, or C
        
        let primaryMatch = false;
        let secondaryMatch = false;
        
        if (area) {
            // Specific area search
            const matchingAreaIds = getAreaIdsForName(area, regionPrefix);
            primaryMatch = primaryAreas.some(id => matchingAreaIds.includes(id));
            secondaryMatch = secondaryAreas.some(id => matchingAreaIds.includes(id));
        } else {
            // Region-wide search
            primaryMatch = primaryAreas.some(id => id.startsWith(regionPrefix));
            secondaryMatch = secondaryAreas.some(id => id.startsWith(regionPrefix));
        }
        
        // Filter by coverage type
        switch(coverageType) {
            case 'primary': return primaryMatch;
            case 'secondary': return secondaryMatch;
            case 'all': return primaryMatch || secondaryMatch;
            default: return false;
        }
    });
}
```

## 👥 Manager Relationship Handling

### Manager Data Structure
```javascript
const person = {
    // Employee data
    Title: "John Smith",
    UserEmail: "john.smith@company.com",
    
    // Manager relationship
    Manager: {
        DisplayName: "Jane Manager",
        Email: "jane.manager@company.com", 
        Department: "Sales",
        JobTitle: "Regional Manager",
        Picture: "/_layouts/15/userphoto.aspx?size=M&accountname=jane.manager@company.com"
    }
};
```

### Manager Display Logic
```javascript
function createManagerCard(manager) {
    return `
        <div class="manager-info">
            <img src="${getManagerPicture(manager)}" class="manager-picture">
            <div class="manager-details">
                <div class="manager-name">${manager.DisplayName}</div>
                <div class="manager-title">${manager.JobTitle}</div>
                <div class="manager-email">${manager.Email}</div>
            </div>
        </div>
    `;
}

function getManagerPicture(manager) {
    return manager.Picture || 
           `/_layouts/15/userphoto.aspx?size=M&accountname=${manager.Email}` ||
           'https://via.placeholder.com/32';
}
```

## 🔍 Query Optimization

### Area Code Matching
```javascript
function getAreaIdsForName(areaName, regionPrefix) {
    const matchingIds = [];
    
    // Find all area codes that match the name
    for (const [code, name] of Object.entries(areaNames)) {
        if (code.startsWith(regionPrefix) && name === areaName) {
            matchingIds.push(code);
            
            // Add alternate format (A1 ↔ A01)
            if (code.length === 3) {
                const shortFormat = code.replace(/^([ABC])0/, '$1');
                matchingIds.push(shortFormat);
            } else if (code.length === 2) {
                const longFormat = code.replace(/^([ABC])/, '$10');
                matchingIds.push(longFormat);
            }
        }
    }
    
    return matchingIds;
}
```

### Performance Optimizations
1. **Indexed Lookups**: Pre-build area code indexes
2. **Cached Results**: Store frequent queries
3. **Lazy Loading**: Load data on-demand
4. **Memory Management**: Clear unused data

## 📊 Data Validation

### Required Field Validation
```javascript
function validatePersonnelRecord(person) {
    const required = ['Title', 'UserEmail', 'FirstName', 'LastName', 'UserDepartment', 'UserJobTitle'];
    const missing = required.filter(field => !person[field]);
    
    if (missing.length > 0) {
        console.warn(`Missing required fields for ${person.UserEmail}: ${missing.join(', ')}`);
        return false;
    }
    
    return true;
}
```

### Area Code Validation
```javascript
function validateAreaCodes(areaCodes) {
    return areaCodes.filter(code => {
        const isValid = /^[ABC]\d{1,2}$/.test(code) && areaNames[code];
        if (!isValid) {
            console.warn(`Invalid area code: ${code}`);
        }
        return isValid;
    });
}
```

### Email Format Validation
```javascript
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
```

## 🔄 Data Synchronization

### SharePoint Integration
```javascript
// For SharePoint environments
function loadFromSharePoint() {
    if (typeof _spPageContextInfo !== 'undefined') {
        // Use SharePoint REST API
        const listUrl = _spPageContextInfo.webAbsoluteUrl + 
            "/_api/web/lists/getbytitle('Personnel')/items";
        
        return fetch(listUrl, {
            headers: {
                'Accept': 'application/json;odata=verbose'
            }
        }).then(response => response.json())
          .then(data => transformSharePointData(data.d.results));
    }
}
```

### CSV File Updates
1. **Manual Upload**: Replace `personnel_data.csv` file
2. **Automated Sync**: PowerAutomate flow integration
3. **Version Control**: Backup previous versions
4. **Change Detection**: Compare timestamps

## 🎯 Best Practices

### Data Management
1. **Consistent Formatting**: Use standard naming conventions
2. **Regular Updates**: Keep personnel data current
3. **Backup Strategy**: Maintain historical versions
4. **Access Control**: Limit edit permissions

### Performance Guidelines
1. **File Size**: Keep CSV under 5MB for optimal performance
2. **Record Count**: Recommended maximum 2000 personnel records
3. **Area Assignments**: Limit to 10 areas per person
4. **Update Frequency**: Batch updates rather than real-time changes

### Error Prevention
1. **Template Usage**: Provide CSV template with examples
2. **Validation Scripts**: Pre-validate data before upload
3. **Testing Environment**: Test changes before production
4. **Rollback Plan**: Keep previous working version available

---

*The Personnel CSV system provides flexible, scalable personnel management with robust area assignment capabilities and organizational relationship tracking.*