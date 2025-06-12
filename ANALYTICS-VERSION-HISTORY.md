# Analytics Version History & File Archival System

## 🎯 Overview

This system implements automated archival of AreaMap.html files before regeneration, preserving historical analytics data for comprehensive dashboard reporting across multiple versions and time periods.

## 🏗️ Architecture

### File Naming Convention
```
Current File:    AreaMap.html
Archived Files:  AreaMap_Archive_YYYYMMDD_HHMMSS.html
                 AreaMap_Archive_20241206_143022.html
                 AreaMap_Archive_20241205_091534.html
```

### Storage Strategy
- **Current File:** `AreaMap.html` (active version)
- **Archive Folder:** `AreaMap_Archives/` (version history)
- **Metadata:** `AreaMap_Version_History.json` (version tracking)

## 🔄 Enhanced Power Automate Flow

### Updated AreaMap Generator Flow

#### Step 1: Pre-Rebuild Archive Process
```json
{
  "step": 1,
  "action": "checkIfFileExists",
  "fileName": "AreaMap.html",
  "condition": "if file exists, proceed to archive"
}
```

#### Step 2: Create Archive Copy
```json
{
  "step": 2,
  "action": "copyFile",
  "sourceFile": "AreaMap.html",
  "targetFile": "AreaMap_Archives/AreaMap_Archive_@{formatDateTime(utcNow(), 'yyyyMMdd_HHmmss')}.html",
  "description": "Archive current version before rebuilding"
}
```

#### Step 3: Update Version History
```json
{
  "step": 3,
  "action": "updateVersionHistory",
  "metadata": {
    "archiveFileName": "AreaMap_Archive_@{formatDateTime(utcNow(), 'yyyyMMdd_HHmmss')}.html",
    "archiveDate": "@{utcNow()}",
    "triggerReason": "@{triggerOutputs()?['body/triggerReason']}",
    "modifiedBy": "@{triggerOutputs()?['body/modifiedBy']}",
    "personnelCount": "@{length(body('Get_Personnel_Items')?['value'])}",
    "buildVersion": "@{add(variables('lastBuildNumber'), 1)}"
  }
}
```

#### Step 4: Sync Analytics Before Archive
```json
{
  "step": 4,
  "action": "syncPendingAnalytics",
  "description": "Ensure all analytics data is saved before archiving"
}
```

#### Step 5: Standard Template Processing
```json
{
  "step": 5,
  "action": "processTemplate",
  "description": "Continue with normal template generation process"
}
```

## 📊 Version History Metadata

### AreaMap_Version_History.json Structure
```json
{
  "currentVersion": {
    "fileName": "AreaMap.html",
    "buildDate": "2024-12-06T14:30:22Z",
    "buildNumber": 47,
    "personnelCount": 156,
    "triggerReason": "Personnel Update - John Smith IncludeOnMap changed",
    "templateVersion": "2.1.3"
  },
  "archives": [
    {
      "fileName": "AreaMap_Archive_20241206_143022.html",
      "originalFileName": "AreaMap.html",
      "archiveDate": "2024-12-06T14:30:22Z",
      "buildNumber": 46,
      "personnelCount": 155,
      "triggerReason": "Personnel Update - Sarah Johnson PrimaryAreaIDs changed",
      "analyticsDataPeriod": {
        "startDate": "2024-12-05T09:15:00Z",
        "endDate": "2024-12-06T14:30:22Z",
        "totalClicks": 1247,
        "uniqueSessions": 89
      },
      "templateVersion": "2.1.3",
      "retentionDate": "2025-12-06T14:30:22Z"
    },
    {
      "fileName": "AreaMap_Archive_20241205_091534.html",
      "originalFileName": "AreaMap.html", 
      "archiveDate": "2024-12-05T09:15:34Z",
      "buildNumber": 45,
      "personnelCount": 154,
      "triggerReason": "Daily Rebuild",
      "analyticsDataPeriod": {
        "startDate": "2024-12-04T09:15:00Z",
        "endDate": "2024-12-05T09:15:34Z",
        "totalClicks": 892,
        "uniqueSessions": 67
      },
      "templateVersion": "2.1.2"
    }
  ],
  "retentionPolicy": {
    "maxArchives": 50,
    "retentionDays": 365,
    "compressionAfterDays": 90
  }
}
```

## 🔍 Enhanced Analytics Dashboard

### Historical Data Access
```javascript
// Enhanced analytics loading with version history
async function loadAnalyticsWithVersionHistory(startDate, endDate) {
    const versionHistory = await loadVersionHistory();
    const relevantVersions = findVersionsInDateRange(versionHistory, startDate, endDate);
    
    let combinedAnalytics = [];
    
    for (const version of relevantVersions) {
        const versionAnalytics = await loadAnalyticsFromVersion(version);
        combinedAnalytics = combinedAnalytics.concat(versionAnalytics);
    }
    
    return combinedAnalytics;
}

async function loadVersionHistory() {
    try {
        const response = await fetch('./AreaMap_Version_History.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading version history:', error);
        return { archives: [] };
    }
}

function findVersionsInDateRange(versionHistory, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return versionHistory.archives.filter(version => {
        const archiveDate = new Date(version.archiveDate);
        return archiveDate >= start && archiveDate <= end;
    });
}

async function loadAnalyticsFromVersion(version) {
    // Load analytics data from archived version
    // This could read from the archived HTML file or associated analytics data
    try {
        const url = `./AreaMap_Archives/${version.fileName}`;
        const response = await fetch(url);
        const htmlContent = await response.text();
        
        // Extract analytics data from archived HTML
        return extractAnalyticsFromArchivedHTML(htmlContent, version);
    } catch (error) {
        console.error(`Error loading analytics from ${version.fileName}:`, error);
        return [];
    }
}
```

### Version-Aware Dashboard Features

#### 1. Time Range Selector with Version Awareness
```html
<div class="version-selector">
    <label>Analytics Time Range:</label>
    <select id="time-range-select">
        <option value="current">Current Version Only</option>
        <option value="last-7-days">Last 7 Days (All Versions)</option>
        <option value="last-30-days">Last 30 Days (All Versions)</option>
        <option value="custom">Custom Range (All Versions)</option>
    </select>
</div>

<div class="version-info" id="version-info">
    <h4>Versions in Selected Range:</h4>
    <ul id="versions-list"></ul>
</div>
```

#### 2. Version Timeline Visualization
```javascript
function createVersionTimeline(versionHistory) {
    const timeline = versionHistory.archives.map(version => ({
        date: version.archiveDate,
        buildNumber: version.buildNumber,
        reason: version.triggerReason,
        personnelCount: version.personnelCount,
        clicks: version.analyticsDataPeriod?.totalClicks || 0
    }));
    
    // Create Chart.js timeline showing version releases and analytics
    return new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Personnel Count',
                data: timeline.map(v => ({ x: v.date, y: v.personnelCount })),
                borderColor: '#0078d4',
                yAxisID: 'y'
            }, {
                label: 'Clicks per Version',
                data: timeline.map(v => ({ x: v.date, y: v.clicks })),
                borderColor: '#107c41',
                yAxisID: 'y1'
            }]
        },
        options: {
            scales: {
                x: { type: 'time' },
                y: { type: 'linear', display: true, position: 'left' },
                y1: { type: 'linear', display: true, position: 'right' }
            }
        }
    });
}
```

## 🔧 Power Automate Implementation Details

### Complete Enhanced Flow Steps

#### Archive Management Actions
```json
{
  "flowName": "AreaMap Generator with Archive",
  "trigger": {
    "type": "SharePoint",
    "event": "When an item is created or modified",
    "listName": "Personnel",
    "triggerColumns": ["Title", "UserDisplayName", "PrimaryAreaIDs", "IncludeOnMap"]
  },
  "actions": [
    {
      "step": 1,
      "action": "Initialize variable",
      "name": "ArchiveTimestamp",
      "type": "String",
      "value": "@{formatDateTime(utcNow(), 'yyyyMMdd_HHmmss')}"
    },
    {
      "step": 2,
      "action": "Get file metadata",
      "fileName": "AreaMap.html",
      "condition": "if file exists"
    },
    {
      "step": 3,
      "action": "Create archive folder",
      "folderName": "AreaMap_Archives",
      "condition": "if folder doesn't exist"
    },
    {
      "step": 4,
      "action": "Copy file",
      "sourceFile": "AreaMap.html",
      "destinationFile": "AreaMap_Archives/AreaMap_Archive_@{variables('ArchiveTimestamp')}.html",
      "condition": "if source file exists"
    },
    {
      "step": 5,
      "action": "Sync pending analytics",
      "description": "Emergency sync before archiving"
    },
    {
      "step": 6,
      "action": "Update version history",
      "fileName": "AreaMap_Version_History.json"
    },
    {
      "step": 7,
      "action": "Continue with template processing",
      "description": "Standard AreaMap generation"
    }
  ]
}
```

#### Version History Update Expression
```javascript
// Power Automate expression for updating version history
{
  "currentVersion": {
    "fileName": "AreaMap.html",
    "buildDate": "@{utcNow()}",
    "buildNumber": "@{add(int(body('Parse_Version_History')?['currentVersion']?['buildNumber']), 1)}",
    "personnelCount": "@{length(body('Get_Personnel_Items')?['value'])}",
    "triggerReason": "@{triggerOutputs()?['body/triggerReason']}",
    "templateVersion": "2.1.3"
  },
  "archives": "@{union(body('Parse_Version_History')?['archives'], createArray(json(concat('{\"fileName\":\"AreaMap_Archive_', variables('ArchiveTimestamp'), '.html\",\"archiveDate\":\"', utcNow(), '\",\"buildNumber\":', body('Parse_Version_History')?['currentVersion']?['buildNumber'], '}')))}"
}
```

## 📈 Analytics Benefits

### Comprehensive Historical Reporting
1. **Version Comparison:** Compare analytics across different personnel configurations
2. **Trend Analysis:** Track usage patterns over time and organizational changes
3. **Impact Assessment:** Measure how personnel changes affect map usage
4. **Retention Analysis:** Understand long-term user engagement patterns

### Dashboard Enhancements
1. **Multi-Version Charts:** Show analytics across archived versions
2. **Version Timeline:** Visual representation of builds and their analytics
3. **Comparative Analytics:** Side-by-side version comparisons
4. **Historical Drill-Down:** Deep dive into specific time periods and versions

### Data Integrity
1. **No Data Loss:** Analytics preserved across all rebuilds
2. **Version Traceability:** Every analytics data point tied to specific version
3. **Audit Trail:** Complete history of changes and their triggers
4. **Recovery Capability:** Ability to restore previous versions if needed

## 🗄️ Archive Management

### Retention Policy
```json
{
  "retentionPolicy": {
    "maxArchives": 50,
    "retentionDays": 365,
    "compressionAfterDays": 90,
    "cleanupFrequency": "monthly"
  }
}
```

### Cleanup Flow (Monthly)
```json
{
  "flowName": "AreaMap Archive Cleanup",
  "trigger": {
    "type": "Recurrence",
    "frequency": "Month",
    "interval": 1
  },
  "actions": [
    {
      "step": 1,
      "action": "Get archive files older than retention period"
    },
    {
      "step": 2,
      "action": "Extract final analytics from files before deletion"
    },
    {
      "step": 3,
      "action": "Update consolidated analytics summary"
    },
    {
      "step": 4,
      "action": "Delete expired archive files"
    },
    {
      "step": 5,
      "action": "Update version history metadata"
    }
  ]
}
```

## 🚀 Implementation Steps

### 1. Update Power Automate Flow
- Add archive steps before template generation
- Implement version history tracking
- Add cleanup flow for retention management

### 2. Create Archive Infrastructure
- Create `AreaMap_Archives` folder in SharePoint
- Initialize `AreaMap_Version_History.json`
- Set up proper permissions for archive folder

### 3. Enhance Analytics Dashboard
- Add version-aware data loading
- Implement historical analytics visualization
- Create version timeline and comparison features

### 4. Testing & Validation
- Test archive creation on personnel changes
- Verify analytics data preservation
- Validate historical reporting functionality

This version history system ensures comprehensive analytics preservation while providing powerful historical reporting capabilities for better insights into map usage patterns over time.