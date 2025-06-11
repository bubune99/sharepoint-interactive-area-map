# SharePoint CSV Integration Guide

## Overview
The Area Map automatically logs all area clicks to **AreaMapAnalytics.csv** for admin tracking. This master CSV file is located in the same SharePoint directory as AreaMap.html and data is automatically appended with each click.

## Current Implementation

### Area Map (AreaMap.html)
- **Automatic Logging**: Every area click is automatically logged with timestamp
- **No Export Button**: No user-facing export functionality
- **Data Structure**: Captures timestamp, area details, session info, and user agent
- **LocalStorage**: Also saves to browser storage for analytics dashboard

### Analytics Dashboard (analytics-dashboard.html)  
- **Admin Only**: Separate dashboard for viewing analytics
- **Browser Storage**: Loads data automatically from localStorage
- **Real-time Charts**: Shows clicks over time, popular regions, hourly patterns
- **No CSV Upload**: Removed all CSV file upload functionality

## SharePoint Integration Options

### Option 1: SharePoint List Integration
```javascript
// Replace writeToCSVFile function with SharePoint REST API calls
function writeToSharePointList(clickData) {
    const listUrl = _spPageContextInfo.webAbsoluteUrl + 
        "/_api/web/lists/getbytitle('AreaMapClicks')/items";
    
    $.ajax({
        url: listUrl,
        type: 'POST',
        headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
            'X-RequestDigest': $('#__REQUESTDIGEST').val()
        },
        data: JSON.stringify({
            '__metadata': { 'type': 'SP.Data.AreaMapClicksListItem' },
            'Title': clickData.areaName,
            'AreaCode': clickData.areaCode,
            'Region': clickData.region,
            'ClickTimestamp': clickData.timestamp,
            'SessionId': clickData.sessionId,
            'UserAgent': clickData.userAgent
        }),
        success: function(data) {
            console.log('Click logged to SharePoint list');
        }
    });
}
```

### Option 2: Power Automate Flow
```javascript
// Replace writeToCSVFile function with Power Automate HTTP trigger
function triggerPowerAutomate(clickData) {
    const flowUrl = 'https://prod-xx.westus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke';
    
    fetch(flowUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(clickData)
    }).then(response => {
        console.log('Click data sent to Power Automate');
    });
}
```

### Option 3: Azure Function
```javascript
// Replace writeToCSVFile function with Azure Function call
function sendToAzureFunction(clickData) {
    const functionUrl = 'https://yourfunction.azurewebsites.net/api/logclick';
    
    fetch(functionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-functions-key': 'your-function-key'
        },
        body: JSON.stringify(clickData)
    }).then(response => {
        console.log('Click logged via Azure Function');
    });
}
```

## CSV File Structure

The system generates CSV data with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| Timestamp | Full ISO timestamp | 2024-01-15T10:30:00.000Z |
| Date | Date only | 2024-01-15 |
| Time | Time only | 10:30:00 |
| AreaCode | Area identifier | A1 |
| AreaName | Human-readable area name | Baltimore Coast |
| Region | Geographic region | East |
| SessionId | Unique session identifier | session_1705317000_abc123 |
| UserAgent | Browser information | Mozilla/5.0... |
| URL | Page URL | https://site.sharepoint.com/... |

## File Structure

```
SharePoint Document Library/
├── AreaMap.html                 (Main application - user-facing)
├── AreaMapAnalytics.csv        (Master analytics file - auto-updated)  
├── analytics-dashboard.html     (Analytics dashboard - admin-only)
├── Artboard 1.svg              (Interactive map SVG file)
└── personnel_data.csv          (Personnel data for map)
```

**Note**: All files are in the same SharePoint location for easy deployment and management.

## Implementation Steps

1. **Upload All Files**: Upload all files to the same SharePoint document library:
   - AreaMap.html (main application)
   - AreaMapAnalytics.csv (master data file)
   - analytics-dashboard.html (admin dashboard)
   - Artboard 1.svg (map file)
   - personnel_data.csv (personnel data)

2. **Set Permissions**: 
   - AreaMapAnalytics.csv: Read/Write for application, Read-only for users
   - analytics-dashboard.html: Admin access only
   - AreaMap.html: User access

3. **Test**: Click areas in AreaMap.html and verify data appears in AreaMapAnalytics.csv

4. **Monitor**: Access analytics-dashboard.html to view click patterns and trends

5. **Backup**: Regularly backup AreaMapAnalytics.csv for data safety

## Security Considerations

- **Admin Access**: Only admins should have access to the CSV file/data store
- **User Privacy**: Consider data retention policies for user tracking
- **Authentication**: Ensure proper authentication for API calls
- **Rate Limiting**: Implement rate limiting for high-traffic scenarios

## Sample Power Automate Flow

1. **Trigger**: HTTP Request (POST)
2. **Parse JSON**: Parse the click data
3. **Append to File**: Add row to CSV file in SharePoint document library
4. **Response**: Return success status

## Analytics Dashboard Usage

1. **Access**: Open analytics-dashboard.html (admin only)
2. **Auto-Load**: Data loads automatically from browser storage
3. **Refresh**: Click "🔄 Refresh Data" to update charts
4. **Analysis**: View click patterns, popular regions, and usage trends

## Files Overview

- `AreaMap.html` - Main application (user-facing)
- `analytics-dashboard.html` - Analytics dashboard (admin-facing)  
- `area-map-clicks.csv` - Sample CSV structure
- `SHAREPOINT-CSV-INTEGRATION.md` - This documentation