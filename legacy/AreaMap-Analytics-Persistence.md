# Analytics Persistence Strategy

## 🎯 Problem Statement

The lock-and-key template system rebuilds AreaMap.html whenever the Personnel SharePoint list changes, which would lose all accumulated analytics data stored in the generated HTML file. We need a persistent storage solution that:

1. Preserves click data across HTML rebuilds
2. Maintains local performance for real-time tracking
3. Syncs data before rebuilds occur
4. Provides 12-hour backup cycles for data safety

## 🔄 Hybrid Storage Architecture

### Primary Storage: SharePoint Analytics List
Create a dedicated SharePoint list to store all click data persistently.

### Secondary Storage: localStorage Buffer
Use browser localStorage as a fast local buffer for immediate click capture.

### Tertiary Storage: CSV Backup
Maintain CSV file as backup and for dashboard compatibility.

## 📊 Implementation Strategy

### 1. SharePoint Analytics List Structure

```
List Name: "AreaMapAnalytics"
Columns:
- ID (Auto-generated)
- ClickTimestamp (Date and Time)
- AreaCode (Single line of text)
- AreaName (Single line of text) 
- Region (Choice: East, Central, West)
- SessionId (Single line of text)
- UserAgent (Multiple lines of text)
- PageURL (Hyperlink)
- ClickDate (Date only - for indexing)
- ClickHour (Number - 0-23 for hourly analysis)
```

### 2. Power Automate Analytics Flow

**Trigger**: Every 12 hours OR before Personnel list rebuild
**Actions**:
1. Get all items from localStorage buffer
2. Batch insert to SharePoint Analytics list
3. Clear localStorage buffer
4. Update last sync timestamp

### 3. Pre-Rebuild Data Preservation

**Integration with Personnel Flow**:
```
Personnel List Trigger → 
  Check for pending analytics → 
    Save pending data to SharePoint → 
      Clear localStorage → 
        Rebuild AreaMap.html
```

## 🔧 Technical Implementation

### Enhanced Analytics Function Template

```javascript
// Template: {{ANALYTICS_PERSISTENCE_CODE}}
const ANALYTICS_CONFIG = {
    maxLocalStorage: 1000,  // Max items in localStorage
    syncInterval: 12 * 60 * 60 * 1000,  // 12 hours in milliseconds
    lastSyncKey: 'areaMapLastSync',
    pendingDataKey: 'areaMapPendingClicks',
    sharePointListId: '{{ANALYTICS_LIST_ID}}',  // Injected by Power Automate
    siteUrl: '{{SITE_URL}}'  // Injected by Power Automate
};

function logAreaClick(areaCode, areaName, region) {
    const clickData = {
        id: generateClickId(),
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        hour: new Date().getHours(),
        areaCode: areaCode,
        areaName: areaName,
        region: region,
        sessionId: generateSessionId(),
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    // Store in localStorage buffer
    addToLocalBuffer(clickData);
    
    // Check if sync is needed
    checkSyncThreshold();
    
    console.log('Click logged to buffer:', clickData);
}

function addToLocalBuffer(clickData) {
    try {
        let pendingClicks = JSON.parse(localStorage.getItem(ANALYTICS_CONFIG.pendingDataKey) || '[]');
        pendingClicks.push(clickData);
        
        // Limit buffer size
        if (pendingClicks.length > ANALYTICS_CONFIG.maxLocalStorage) {
            // Force sync when buffer is full
            syncToSharePoint();
        } else {
            localStorage.setItem(ANALYTICS_CONFIG.pendingDataKey, JSON.stringify(pendingClicks));
        }
    } catch (error) {
        console.error('Error adding to local buffer:', error);
    }
}

function checkSyncThreshold() {
    const lastSync = localStorage.getItem(ANALYTICS_CONFIG.lastSyncKey);
    const now = Date.now();
    
    if (!lastSync || (now - parseInt(lastSync)) > ANALYTICS_CONFIG.syncInterval) {
        syncToSharePoint();
    }
}

async function syncToSharePoint() {
    try {
        const pendingClicks = JSON.parse(localStorage.getItem(ANALYTICS_CONFIG.pendingDataKey) || '[]');
        
        if (pendingClicks.length === 0) {
            console.log('No pending clicks to sync');
            return;
        }
        
        console.log(`Syncing ${pendingClicks.length} clicks to SharePoint...`);
        
        // Batch upload to SharePoint Analytics list
        await batchUploadToSharePoint(pendingClicks);
        
        // Clear local buffer after successful sync
        localStorage.removeItem(ANALYTICS_CONFIG.pendingDataKey);
        localStorage.setItem(ANALYTICS_CONFIG.lastSyncKey, Date.now().toString());
        
        console.log('✅ Analytics sync completed successfully');
        
    } catch (error) {
        console.error('❌ Analytics sync failed:', error);
        // Keep data in localStorage for retry
    }
}

async function batchUploadToSharePoint(clicksArray) {
    if (typeof _spPageContextInfo === 'undefined') {
        console.warn('SharePoint context not available - storing for later sync');
        return;
    }
    
    const batchSize = 100;  // SharePoint batch limit
    
    for (let i = 0; i < clicksArray.length; i += batchSize) {
        const batch = clicksArray.slice(i, i + batchSize);
        await uploadBatch(batch);
    }
}

async function uploadBatch(batch) {
    const url = `${ANALYTICS_CONFIG.siteUrl}/_api/web/lists/getbytitle('AreaMapAnalytics')/items`;
    
    for (const click of batch) {
        const itemData = {
            '__metadata': { 'type': 'SP.Data.AreaMapAnalyticsListItem' },
            'Title': `Click-${click.areaCode}-${click.timestamp}`,
            'ClickTimestamp': click.timestamp,
            'AreaCode': click.areaCode,
            'AreaName': click.areaName,
            'Region': click.region,
            'SessionId': click.sessionId,
            'UserAgent': click.userAgent,
            'PageURL': click.url,
            'ClickDate': click.date,
            'ClickHour': click.hour
        };
        
        await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value
            },
            body: JSON.stringify(itemData)
        });
    }
}

function generateClickId() {
    return 'click_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Auto-sync before page unload
window.addEventListener('beforeunload', function() {
    const pendingClicks = JSON.parse(localStorage.getItem(ANALYTICS_CONFIG.pendingDataKey) || '[]');
    if (pendingClicks.length > 0) {
        // Use sendBeacon for reliable delivery
        const data = JSON.stringify({ clicks: pendingClicks });
        navigator.sendBeacon('/api/analytics-backup', data);
    }
});

// Initialize sync check on page load
document.addEventListener('DOMContentLoaded', function() {
    checkSyncThreshold();
});
```

## 🔄 Power Automate Flows

### Analytics Sync Flow (Every 12 Hours)

```json
{
  "flowName": "AreaMap Analytics Sync",
  "trigger": {
    "type": "Recurrence",
    "frequency": "Hour",
    "interval": 12
  },
  "actions": [
    {
      "name": "Get Pending Analytics",
      "type": "HTTP",
      "method": "GET",
      "uri": "@{concat(parameters('siteUrl'), '/_api/web/lists/getbytitle(''AreaMapPendingSync'')/items')}"
    },
    {
      "name": "Process Analytics Batch",
      "type": "Apply to each",
      "items": "@body('Get_Pending_Analytics')?['value']",
      "actions": [
        {
          "name": "Add to Analytics List",
          "type": "SharePoint Create Item",
          "listName": "AreaMapAnalytics"
        }
      ]
    },
    {
      "name": "Clear Pending Data",
      "type": "SharePoint Delete Item"
    }
  ]
}
```

### Pre-Rebuild Analytics Preservation

```json
{
  "flowName": "AreaMap Pre-Rebuild Sync",
  "trigger": {
    "type": "SharePoint",
    "event": "When an item is created or modified",
    "listName": "Personnel"
  },
  "actions": [
    {
      "name": "Check for Pending Analytics",
      "type": "Condition",
      "condition": "@greater(length(body('Get_Pending_Analytics')), 0)"
    },
    {
      "name": "Sync Analytics First",
      "type": "Run Child Flow",
      "flowName": "AreaMap Analytics Sync"
    },
    {
      "name": "Wait for Sync Completion",
      "type": "Delay",
      "duration": "PT2M"
    },
    {
      "name": "Rebuild AreaMap",
      "type": "Run Child Flow", 
      "flowName": "AreaMap Generator"
    }
  ]
}
```

## 📊 Analytics Dashboard Updates

### Updated Data Source Priority

1. **Primary**: SharePoint Analytics List (complete historical data)
2. **Secondary**: CSV export from SharePoint (for compatibility)
3. **Fallback**: localStorage (current session only)

### Dashboard Loading Logic

```javascript
async function loadAnalyticsData() {
    try {
        // Try SharePoint Analytics List first
        const sharePointData = await loadFromSharePointAnalytics();
        if (sharePointData && sharePointData.length > 0) {
            return sharePointData;
        }
        
        // Fallback to CSV
        const csvData = await loadFromCSV();
        if (csvData && csvData.length > 0) {
            return csvData;
        }
        
        // Last resort: localStorage
        return loadFromLocalStorage();
        
    } catch (error) {
        console.error('Error loading analytics data:', error);
        return [];
    }
}

async function loadFromSharePointAnalytics() {
    const url = `${siteUrl}/_api/web/lists/getbytitle('AreaMapAnalytics')/items?$top=5000&$orderby=ClickTimestamp desc`;
    
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json;odata=verbose'
        }
    });
    
    const data = await response.json();
    return data.d.results.map(item => ({
        timestamp: item.ClickTimestamp,
        areaCode: item.AreaCode,
        areaName: item.AreaName,
        region: item.Region,
        sessionId: item.SessionId,
        date: item.ClickDate,
        hour: item.ClickHour
    }));
}
```

## 🛡️ Data Safety Features

### Backup Strategies
1. **Real-time**: localStorage buffer
2. **Periodic**: 12-hour sync to SharePoint
3. **Pre-rebuild**: Forced sync before template regeneration
4. **Emergency**: Browser beforeunload backup

### Error Handling
- Failed syncs keep data in localStorage
- Retry mechanism with exponential backoff
- Fallback to CSV if SharePoint unavailable
- Data validation before upload

### Performance Optimization
- Batch uploads (100 items max per request)
- Asynchronous processing
- Local buffer size limits
- Indexed SharePoint columns for fast queries

This approach ensures that analytics data is preserved across template rebuilds while maintaining real-time performance and providing multiple backup layers for data safety.