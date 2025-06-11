# API Reference

## 📖 Overview

This document provides comprehensive technical specifications for the SharePoint Interactive Area Map system APIs, functions, and integration points.

## 🗺️ Core Map Functions

### `initializeMap()`
Initializes the interactive SVG map and sets up event listeners.

```javascript
function initializeMap() {
    const svgObject = document.getElementById('svgObject');
    svgObject.addEventListener('load', function() {
        setupAreaClickHandlers();
        setupHoverEffects();
    });
}
```

**Parameters:** None  
**Returns:** `void`  
**Dependencies:** SVG object element with ID 'svgObject'

### `handleAreaClick(event)`
Processes clicks on map areas and triggers personnel queries.

```javascript
function handleAreaClick(event) {
    const pathId = event.target.getAttribute('id');
    const [areaCode, areaName] = parseAreaId(pathId);
    
    logAreaClick(areaCode, areaName, getRegionFromAreaCode(areaCode));
    performQuery();
    showPersonnelModal(title, summary, results);
}
```

**Parameters:**
- `event` (Event): Mouse click event object

**Returns:** `void`  
**Side Effects:** Updates UI, logs analytics, shows modal

### `parseAreaId(pathId)`
Extracts area code and name from SVG path ID.

```javascript
function parseAreaId(pathId) {
    // Format: "A1_Baltimore Coast" or "A1"
    const parts = pathId.split('_');
    const areaCode = parts[0];
    const areaName = parts.length > 1 ? parts.slice(1).join('_') : getAreaName(areaCode);
    
    return [areaCode, areaName];
}
```

**Parameters:**
- `pathId` (string): SVG path element ID

**Returns:** `[string, string]` - Array containing [areaCode, areaName]

### `getRegionFromAreaCode(areaCode)`
Determines geographic region from area code.

```javascript
function getRegionFromAreaCode(areaCode) {
    const prefix = areaCode.charAt(0).toUpperCase();
    const regionMap = { 'A': 'East', 'B': 'Central', 'C': 'West' };
    return regionMap[prefix] || 'Unknown';
}
```

**Parameters:**
- `areaCode` (string): Area identifier (e.g., "A1", "B2", "C3")

**Returns:** `string` - Region name ("East", "Central", "West", or "Unknown")

## 👥 Personnel Management Functions

### `loadPersonnelData()`
Loads and parses personnel data from CSV file or SharePoint.

```javascript
async function loadPersonnelData() {
    try {
        const response = await fetch('./personnel_data.csv');
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error loading personnel data:', error);
        return getTestData();
    }
}
```

**Parameters:** None  
**Returns:** `Promise<Array>` - Array of personnel objects  
**Throws:** Network errors, parsing errors

### `parseCSV(csvText)`
Converts CSV text to structured personnel data.

```javascript
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const item = {};
        
        headers.forEach((header, index) => {
            item[header] = values[index] ? values[index].trim() : '';
        });
        
        // Parse area IDs
        item.PrimaryAreaIDs = parseAreaIDs(item.PrimaryAreaIDs);
        item.SecondaryAreaIDs = parseAreaIDs(item.SecondaryAreaIDs);
        
        data.push(item);
    }
    
    return data;
}
```

**Parameters:**
- `csvText` (string): Raw CSV file content

**Returns:** `Array<Object>` - Parsed personnel data
- `Title` (string): Full name
- `UserEmail` (string): Email address
- `PrimaryAreaIDs` (Array): Primary area assignments
- `SecondaryAreaIDs` (Array): Secondary area assignments
- `Manager` (Object): Manager information

### `findMatchingPersonnel(region, area, coverageType)`
Queries personnel data based on search criteria.

```javascript
function findMatchingPersonnel(region, area, coverageType) {
    return personnelData.filter(person => {
        const primaryMatch = checkAreaMatch(person.PrimaryAreaIDs, region, area);
        const secondaryMatch = checkAreaMatch(person.SecondaryAreaIDs, region, area);
        
        switch(coverageType) {
            case 'primary': return primaryMatch;
            case 'secondary': return secondaryMatch;
            case 'all': return primaryMatch || secondaryMatch;
            default: return false;
        }
    });
}
```

**Parameters:**
- `region` (string): Geographic region ("East", "Central", "West", or "")
- `area` (string): Specific area name (or "" for region-wide)
- `coverageType` (string): Coverage filter ("primary", "secondary", "all")

**Returns:** `Array<Object>` - Filtered personnel records

### `createPersonCard(person, isModal)`
Generates HTML for personnel display card.

```javascript
function createPersonCard(person, isModal = false) {
    const displayName = person.PreferredFirstName || person.FirstName;
    const profileImg = getProfileImage(person);
    const managerCard = person.Manager ? createManagerCard(person.Manager) : '';
    
    return `
        <div class="person-card ${isModal ? 'modal-card' : ''}">
            <div class="person-header">
                <img src="${profileImg}" class="profile-image" alt="${person.Title}">
                <div class="person-info">
                    <div class="person-name">${person.Title}</div>
                    <div class="person-email">${person.UserEmail}</div>
                    <div class="person-title">${person.UserJobTitle}</div>
                </div>
            </div>
            ${managerCard}
        </div>
    `;
}
```

**Parameters:**
- `person` (Object): Personnel record
- `isModal` (boolean): Whether card is for modal display

**Returns:** `string` - HTML string for personnel card

## 📊 Analytics Functions

### `logAreaClick(areaCode, areaName, region)`
Records area click for analytics tracking.

```javascript
function logAreaClick(areaCode, areaName, region) {
    const clickData = {
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        areaCode: areaCode,
        areaName: areaName,
        region: region,
        sessionId: generateSessionId(),
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    appendToLocalStorage(clickData);
    writeToCSVFile(clickData);
    
    console.log('Click logged:', clickData);
}
```

**Parameters:**
- `areaCode` (string): Area identifier
- `areaName` (string): Human-readable area name
- `region` (string): Geographic region

**Returns:** `void`  
**Side Effects:** Updates localStorage and CSV file

### `generateSessionId()`
Creates unique session identifier for analytics.

```javascript
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
```

**Parameters:** None  
**Returns:** `string` - Unique session ID  
**Format:** "session_{timestamp}_{randomString}"

### `writeToCSVFile(clickData)`
Appends analytics data to master CSV file.

```javascript
function writeToCSVFile(clickData) {
    const csvRow = [
        clickData.timestamp,
        clickData.date,
        clickData.time,
        clickData.areaCode,
        escapeCSVValue(clickData.areaName),
        clickData.region,
        clickData.sessionId,
        escapeCSVValue(clickData.userAgent),
        clickData.url
    ].join(',');
    
    appendToMasterCSV(csvRow);
}
```

**Parameters:**
- `clickData` (Object): Analytics data object

**Returns:** `void`  
**Dependencies:** SharePoint context for file operations

### `appendToLocalStorage(clickData)`
Stores analytics data in browser localStorage as backup.

```javascript
function appendToLocalStorage(clickData) {
    try {
        let clickLog = JSON.parse(localStorage.getItem('areaMapClickLog') || '[]');
        clickLog.push(clickData);
        
        // Rotate data to prevent overflow
        if (clickLog.length > 1000) {
            clickLog = clickLog.slice(-1000);
        }
        
        localStorage.setItem('areaMapClickLog', JSON.stringify(clickLog));
    } catch (e) {
        console.log('Could not save to localStorage:', e);
    }
}
```

**Parameters:**
- `clickData` (Object): Analytics data object

**Returns:** `void`  
**Error Handling:** Silently fails if localStorage unavailable

## 🔄 SharePoint Integration

### `appendToMasterCSV(csvRow)`
Writes data to SharePoint CSV file using REST API.

```javascript
function appendToMasterCSV(csvRow) {
    if (typeof _spPageContextInfo === 'undefined') {
        console.warn('SharePoint context not available - skipping CSV write');
        return;
    }
    
    const csvUrl = './AreaMapAnalytics.csv';
    
    // Get current file content
    fetch(csvUrl, { method: 'GET', headers: { 'Accept': 'text/plain' } })
        .then(response => response.text())
        .then(currentContent => {
            const updatedContent = currentContent.trim() + '\n' + csvRow;
            return updateSharePointFile(csvUrl, updatedContent);
        })
        .catch(error => {
            console.error('Error appending to CSV:', error);
            storeForRetry(csvRow);
        });
}
```

**Parameters:**
- `csvRow` (string): Comma-separated values to append

**Returns:** `void`  
**Dependencies:** SharePoint REST API, request digest

### `updateSharePointFile(fileUrl, content)`
Updates SharePoint file content via REST API.

```javascript
function updateSharePointFile(fileUrl, content) {
    const apiUrl = _spPageContextInfo.webAbsoluteUrl + 
        "/_api/web/getfilebyserverrelativeurl('" + 
        fileUrl.replace(_spPageContextInfo.webAbsoluteUrl, '') + 
        "')/$value";
    
    return fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json;odata=verbose',
            'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value,
            'X-HTTP-Method': 'PUT',
            'Content-Type': 'text/plain'
        },
        body: content
    });
}
```

**Parameters:**
- `fileUrl` (string): Relative URL to SharePoint file
- `content` (string): New file content

**Returns:** `Promise<Response>` - Fetch response promise

## 📈 Dashboard Functions

### `loadAnalyticsData()`
Loads analytics data for dashboard display.

```javascript
function loadAnalyticsData() {
    const csvUrl = './AreaMapAnalytics.csv';
    
    return fetch(csvUrl, {
        method: 'GET',
        headers: { 'Accept': 'text/plain' },
        cache: 'no-cache'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(csvText => parseCSV(csvText))
    .catch(error => {
        console.error('Error loading analytics:', error);
        return getLocalStorageData();
    });
}
```

**Parameters:** None  
**Returns:** `Promise<Array>` - Analytics data array  
**Fallback:** Uses localStorage if CSV unavailable

### `createTimeChart(data, period, chartType)`
Generates time-based analytics chart.

```javascript
function createTimeChart(data, period = 'daily', chartType = 'line') {
    const groupedData = groupDataByPeriod(data, period);
    const labels = Object.keys(groupedData).sort();
    const values = labels.map(label => groupedData[label]);
    
    const config = {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Clicks',
                data: values,
                borderColor: '#0078d4',
                backgroundColor: 'rgba(0, 120, 212, 0.1)',
                tension: chartType === 'line' ? 0.4 : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    };
    
    return new Chart(ctx, config);
}
```

**Parameters:**
- `data` (Array): Analytics data
- `period` (string): Time grouping ("hourly", "daily", "weekly", "monthly", "yearly")
- `chartType` (string): Chart type ("line" or "bar")

**Returns:** `Chart` - Chart.js instance

### `groupDataByPeriod(data, period)`
Groups analytics data by specified time period.

```javascript
function groupDataByPeriod(data, period) {
    const grouped = {};
    
    data.forEach(record => {
        const date = new Date(record.Timestamp);
        let key;
        
        switch(period) {
            case 'hourly':
                key = date.getHours().toString().padStart(2, '0') + ':00';
                break;
            case 'daily':
                key = date.toISOString().split('T')[0];
                break;
            case 'weekly':
                key = `Week ${getWeekNumber(date)}`;
                break;
            case 'monthly':
                key = date.toISOString().slice(0, 7);
                break;
            case 'yearly':
                key = date.getFullYear().toString();
                break;
            default:
                key = date.toISOString().split('T')[0];
        }
        
        grouped[key] = (grouped[key] || 0) + 1;
    });
    
    return grouped;
}
```

**Parameters:**
- `data` (Array): Analytics records
- `period` (string): Grouping period

**Returns:** `Object` - Key-value pairs of {period: count}

## 🛠️ Utility Functions

### `escapeCSVValue(value)`
Escapes special characters for CSV format.

```javascript
function escapeCSVValue(value) {
    if (typeof value !== 'string') {
        value = String(value);
    }
    
    // Escape quotes and wrap in quotes if contains comma or quote
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return '"' + value.replace(/"/g, '""') + '"';
    }
    
    return value;
}
```

**Parameters:**
- `value` (any): Value to escape

**Returns:** `string` - CSV-safe value

### `parseCSVLine(line)`
Parses a single CSV line handling quoted values.

```javascript
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current);
    return values;
}
```

**Parameters:**
- `line` (string): CSV line to parse

**Returns:** `Array<string>` - Array of field values

### `getWeekNumber(date)`
Calculates ISO week number for given date.

```javascript
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
```

**Parameters:**
- `date` (Date): Date object

**Returns:** `number` - ISO week number (1-53)

## 🔧 Configuration Objects

### Area Names Mapping
```javascript
const areaNames = {
    // East Region
    'A1': 'Baltimore Coast', 'A01': 'Baltimore Coast',
    'A2': 'South East', 'A02': 'South East',
    'A3': 'New England', 'A03': 'New England',
    'A4': 'New York', 'A04': 'New York',
    'A5': 'Philadelphia', 'A05': 'Philadelphia',
    'A6': 'Gulf Coast', 'A06': 'Gulf Coast',
    'A7': 'Florida', 'A07': 'Florida',
    
    // Central Region
    'B1': 'Chicago', 'B01': 'Chicago',
    'B2': 'Michigan', 'B02': 'Michigan',
    'B3': 'Ohio Valley', 'B03': 'Ohio Valley',
    'B4': 'Central Plains', 'B04': 'Central Plains',
    'B5': 'North Central', 'B05': 'North Central',
    'B6': 'Nashville', 'B06': 'Nashville',
    'B7': 'St. Louis', 'B07': 'St. Louis',
    'B8': 'Tulsa', 'B08': 'Tulsa',
    
    // West Region
    'C1': 'Denver', 'C01': 'Denver',
    'C2': 'Dallas', 'C02': 'Dallas',
    'C3': 'Houston', 'C03': 'Houston',
    'C4': 'Phoenix', 'C04': 'Phoenix',
    'C5': 'Northern California', 'C05': 'Northern California',
    'C6': 'Seattle', 'C06': 'Seattle',
    'C7': 'Los Angeles', 'C07': 'Los Angeles'
};
```

### Analytics Configuration
```javascript
const analyticsConfig = {
    maxLocalStorageRecords: 1000,
    csvRetentionDays: 365,
    enableAnalytics: true,
    logUserAgent: true,
    logPageURL: true,
    batchSize: 100,
    retryAttempts: 3,
    retryDelay: 5000
};
```

## 📋 Data Schemas

### Personnel Record Schema
```typescript
interface PersonnelRecord {
    Title: string;
    UserEmail: string;
    UserDisplayName: string;
    FirstName: string;
    LastName: string;
    PreferredFirstName?: string;
    UserDepartment: string;
    UserJobTitle: string;
    PrimaryAreaIDs: string[];
    SecondaryAreaIDs?: string[];
    Manager?: {
        DisplayName: string;
        Email: string;
        Department: string;
        JobTitle: string;
        Picture?: string;
    };
}
```

### Analytics Record Schema
```typescript
interface AnalyticsRecord {
    timestamp: string;     // ISO 8601 format
    date: string;         // YYYY-MM-DD
    time: string;         // HH:MM:SS
    areaCode: string;     // A1, B2, C3, etc.
    areaName: string;     // Human-readable name
    region: string;       // East, Central, West
    sessionId: string;    // Unique session identifier
    userAgent: string;    // Browser information
    url: string;          // Page URL
}
```

---

*This API reference provides complete technical documentation for integrating with and extending the SharePoint Interactive Area Map system.*