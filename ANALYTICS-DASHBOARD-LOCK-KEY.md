# Analytics Dashboard Lock-and-Key System with CSV Data Management

## 🎯 Overview

This system implements a lock-and-key analytics dashboard that uses CSV as the single source of truth, with Power Automate managing data consolidation, deduplication, and cleanup from both active and archived HTML files.

## 🏗️ Architecture

### Data Flow
```
HTML Files (Active + Archives) → Power Automate → Master CSV → Dashboard Template → Generated Dashboard
```

### Single Source of Truth: Master CSV
- **File:** `AreaMapAnalytics_Master.csv`
- **Purpose:** Consolidated, deduplicated analytics data
- **Management:** Power Automate exclusive access
- **Consumer:** Analytics dashboard template

## 📊 Master CSV Structure

### AreaMapAnalytics_Master.csv Format
```csv
ClickID,Timestamp,Date,Time,Hour,AreaCode,AreaName,Region,SessionID,UserAgent,PageURL,SourceVersion,BuildNumber,ArchiveDate,Processed
click_1701864622_abc123,2024-12-06T14:30:22Z,2024-12-06,14:30:22,14,A08,Atlanta,East,session_1701864622_def456,"Mozilla/5.0 (Windows NT 10.0; Win64; x64)",https://site.sharepoint.com/AreaMap.html,AreaMap.html,47,,true
click_1701850200_xyz789,2024-12-06T10:15:00Z,2024-12-06,10:15:00,10,C08,Central Texas,West,session_1701850200_ghi789,"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",https://site.sharepoint.com/AreaMap.html,AreaMap_Archive_20241206_143022.html,46,2024-12-06T14:30:22Z,true
```

### Field Definitions
| Field | Description | Source | Example |
|-------|-------------|---------|---------|
| `ClickID` | Unique click identifier | HTML localStorage | click_1701864622_abc123 |
| `Timestamp` | Full ISO timestamp | HTML analytics | 2024-12-06T14:30:22Z |
| `Date` | Date portion | Derived | 2024-12-06 |
| `Time` | Time portion | Derived | 14:30:22 |
| `Hour` | Hour (0-23) | Derived | 14 |
| `AreaCode` | Area identifier | HTML analytics | A08 |
| `AreaName` | Area display name | HTML analytics | Atlanta |
| `Region` | Geographic region | HTML analytics | East |
| `SessionID` | Browser session ID | HTML analytics | session_1701864622_def456 |
| `UserAgent` | Browser information | HTML analytics | Mozilla/5.0... |
| `PageURL` | Source page URL | HTML analytics | https://site.sharepoint.com... |
| `SourceVersion` | Source file name | Power Automate | AreaMap.html |
| `BuildNumber` | Version build number | Version history | 47 |
| `ArchiveDate` | Archive timestamp | Version history | 2024-12-06T14:30:22Z |
| `Processed` | Cleanup status | Power Automate | true |

## 🔄 Power Automate Data Management Flows

### Flow 1: Analytics Data Consolidation (Hourly)

#### Purpose
Extracts analytics data from localStorage buffers and archived HTML files, consolidates into master CSV.

#### Flow Configuration
```json
{
  "flowName": "AreaMap Analytics Consolidation",
  "trigger": {
    "type": "Recurrence",
    "frequency": "Hour",
    "interval": 1
  },
  "description": "Consolidate analytics from all sources into master CSV"
}
```

#### Step-by-Step Implementation

**Step 1: Get Version History**
```javascript
// Get current version and archive information
GET AreaMap_Version_History.json
```

**Step 2: Extract from Current Version**
```javascript
// Read current AreaMap.html and extract localStorage analytics
// This simulates reading the pending analytics from the current version
```

**Step 3: Extract from Recent Archives**
```javascript
// Process archives created since last consolidation run
// Extract any remaining analytics data from archived HTML files
```

**Step 4: Deduplicate Data**
```javascript
// Remove duplicates based on ClickID
// Merge with existing master CSV data
```

**Step 5: Update Master CSV**
```javascript
// Write consolidated, deduplicated data to AreaMapAnalytics_Master.csv
```

**Step 6: Cleanup Source Data**
```javascript
// Clear localStorage buffers in HTML files
// Mark data as processed in archives
```

### Flow 2: Analytics Data Extraction (Manual)

#### Purpose
Extracts analytics data from specific HTML files (current or archived versions).

#### Manual Setup Steps

**Step 1: Create Manual Flow**
1. Go to **Power Automate**
2. Click **Create** → **Instant cloud flow**
3. **Flow name:** `AreaMap Analytics Extraction`
4. **Trigger:** Manually trigger a flow
5. Add input parameters:
   - `SourceFile` (Text): HTML file to extract from
   - `ArchiveDate` (Text): Archive date if applicable

**Step 2: Read Source HTML File**
1. **Action:** Get file content (SharePoint)
2. **File:** Dynamic content from `SourceFile` parameter
3. **Parse HTML:** Extract JavaScript variables and localStorage data

**Step 3: Parse Analytics Data**
1. **Action:** Compose (Data Operation)
2. **Extract localStorage data:** Parse JSON from HTML content
3. **Extract inline analytics:** Parse any embedded analytics data

**Step 4: Transform Data**
1. **Action:** Apply to each (Control)
2. **Transform each click record:** Add metadata fields
3. **Add source information:** SourceVersion, BuildNumber, ArchiveDate

**Step 5: Append to Master CSV**
1. **Action:** Get file content (SharePoint) - Get current master CSV
2. **Action:** Compose - Merge new data with existing
3. **Action:** Update file (SharePoint) - Write updated master CSV

**Step 6: Cleanup Source**
1. **Action:** Conditional - If source is current AreaMap.html
2. **Action:** Update HTML file - Clear localStorage references
3. **Action:** Log completion - Record extraction in audit log

## 📈 Analytics Dashboard Template

### Lock-and-Key Dashboard Structure

#### AnalyticsDashboard-Template.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{DASHBOARD_TITLE}}</title>
    <style>
        /* Dashboard-specific styles */
        .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .analytics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .chart-container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .metric-card {
            text-align: center;
            padding: 30px;
            background: linear-gradient(135deg, #0078d4 0%, #106ebe 100%);
            color: white;
            border-radius: 8px;
        }
        .metric-value {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .metric-label {
            font-size: 1.2em;
            opacity: 0.9;
        }
    </style>
    <!-- Chart.js for visualizations -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="dashboard-container">
        <header class="dashboard-header">
            <h1>{{DASHBOARD_TITLE}}</h1>
            <div class="date-range">
                <label>Date Range:</label>
                <input type="date" id="startDate" />
                <input type="date" id="endDate" />
                <button onclick="updateDashboard()">Update</button>
            </div>
        </header>

        <div class="analytics-grid">
            <!-- Key Metrics Cards -->
            <div class="metric-card">
                <div class="metric-value" id="totalClicks">{{TOTAL_CLICKS}}</div>
                <div class="metric-label">Total Clicks</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" id="uniqueSessions">{{UNIQUE_SESSIONS}}</div>
                <div class="metric-label">Unique Sessions</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" id="topArea">{{TOP_AREA}}</div>
                <div class="metric-label">Most Popular Area</div>
            </div>
        </div>

        <div class="analytics-grid">
            <!-- Charts -->
            <div class="chart-container">
                <h3>Daily Activity</h3>
                <canvas id="dailyChart"></canvas>
            </div>
            <div class="chart-container">
                <h3>Regional Distribution</h3>
                <canvas id="regionalChart"></canvas>
            </div>
            <div class="chart-container">
                <h3>Hourly Patterns</h3>
                <canvas id="hourlyChart"></canvas>
            </div>
            <div class="chart-container">
                <h3>Version History</h3>
                <canvas id="versionChart"></canvas>
            </div>
        </div>
    </div>

    <script>
        // Analytics data injected by Power Automate
        const analyticsData = {{ANALYTICS_DATA}};
        const versionHistory = {{VERSION_HISTORY}};
        
        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            initializeDashboard();
        });

        function initializeDashboard() {
            createDailyChart();
            createRegionalChart();
            createHourlyChart();
            createVersionChart();
        }

        function createDailyChart() {
            const ctx = document.getElementById('dailyChart').getContext('2d');
            const dailyData = groupByDay(analyticsData);
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Object.keys(dailyData),
                    datasets: [{
                        label: 'Daily Clicks',
                        data: Object.values(dailyData),
                        borderColor: '#0078d4',
                        backgroundColor: 'rgba(0, 120, 212, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        function createRegionalChart() {
            const ctx = document.getElementById('regionalChart').getContext('2d');
            const regionalData = groupByRegion(analyticsData);
            
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(regionalData),
                    datasets: [{
                        data: Object.values(regionalData),
                        backgroundColor: ['#0078d4', '#107c41', '#d83b01']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        function createHourlyChart() {
            const ctx = document.getElementById('hourlyChart').getContext('2d');
            const hourlyData = groupByHour(analyticsData);
            
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(hourlyData),
                    datasets: [{
                        label: 'Clicks by Hour',
                        data: Object.values(hourlyData),
                        backgroundColor: '#0078d4'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        function createVersionChart() {
            const ctx = document.getElementById('versionChart').getContext('2d');
            const versionData = groupByVersion(analyticsData);
            
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: versionHistory.map(v => `Build ${v.buildNumber}`),
                    datasets: [{
                        label: 'Clicks per Version',
                        data: versionHistory.map(v => versionData[v.buildNumber] || 0),
                        backgroundColor: '#107c41'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        // Data grouping functions
        function groupByDay(data) {
            return data.reduce((acc, item) => {
                const date = item.Date;
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});
        }

        function groupByRegion(data) {
            return data.reduce((acc, item) => {
                const region = item.Region;
                acc[region] = (acc[region] || 0) + 1;
                return acc;
            }, {});
        }

        function groupByHour(data) {
            return data.reduce((acc, item) => {
                const hour = item.Hour;
                acc[hour] = (acc[hour] || 0) + 1;
                return acc;
            }, {});
        }

        function groupByVersion(data) {
            return data.reduce((acc, item) => {
                const version = item.BuildNumber;
                acc[version] = (acc[version] || 0) + 1;
                return acc;
            }, {});
        }

        function updateDashboard() {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            // Filter data by date range
            const filteredData = analyticsData.filter(item => {
                const itemDate = new Date(item.Date);
                return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
            });
            
            // Update metrics
            document.getElementById('totalClicks').textContent = filteredData.length;
            document.getElementById('uniqueSessions').textContent = 
                new Set(filteredData.map(item => item.SessionID)).size;
            
            // Recreate charts with filtered data
            // Implementation would recreate all charts with filteredData
        }
    </script>
</body>
</html>
```

### Dashboard Template Placeholders

| Placeholder | Description | Power Automate Source |
|-------------|-------------|----------------------|
| `{{DASHBOARD_TITLE}}` | Dashboard page title | Static: "Area Map Analytics Dashboard" |
| `{{ANALYTICS_DATA}}` | Complete analytics dataset | Processed CSV data as JSON |
| `{{VERSION_HISTORY}}` | Version metadata | AreaMap_Version_History.json |
| `{{TOTAL_CLICKS}}` | Total click count | Calculated from CSV |
| `{{UNIQUE_SESSIONS}}` | Unique session count | Calculated from CSV |
| `{{TOP_AREA}}` | Most clicked area | Calculated from CSV |

## 🔧 Power Automate Dashboard Generation Flow

### Flow 3: Analytics Dashboard Generator

#### Purpose
Reads master CSV, processes analytics data, generates dashboard HTML using lock-and-key template.

#### Manual Setup Steps

**Step 1: Create Scheduled Flow**
1. **Flow name:** `AreaMap Analytics Dashboard Generator`
2. **Trigger:** Recurrence - Daily at 6:00 AM
3. **Purpose:** Generate updated analytics dashboard daily

**Step 2: Read Master CSV**
1. **Action:** Get file content (SharePoint)
2. **File:** `AreaMapAnalytics_Master.csv`
3. **Action:** Compose - Parse CSV to JSON array

**Step 3: Calculate Summary Metrics**
1. **Action:** Compose - Total clicks count
2. **Action:** Compose - Unique sessions count  
3. **Action:** Compose - Most popular area
4. **Action:** Compose - Date range summary

**Step 4: Read Dashboard Template**
1. **Action:** Get file content (SharePoint)
2. **File:** `AnalyticsDashboard-Template.html`

**Step 5: Read Version History**
1. **Action:** Get file content (SharePoint)
2. **File:** `AreaMap_Version_History.json`

**Step 6: Replace Template Placeholders**
1. **Action:** Compose (Data Operation)
2. **Replace {{ANALYTICS_DATA}}:** Full CSV data as JSON
3. **Replace {{VERSION_HISTORY}}:** Version history JSON
4. **Replace {{TOTAL_CLICKS}}:** Calculated total
5. **Replace {{UNIQUE_SESSIONS}}:** Calculated unique sessions
6. **Replace {{TOP_AREA}}:** Most popular area name

**Step 7: Generate Dashboard File**
1. **Action:** Create file (SharePoint)
2. **File Name:** `AreaMapAnalytics_Dashboard.html`
3. **Content:** Processed template with data
4. **Action:** Update file (SharePoint) - Handle existing file

## 🧹 Data Cleanup Strategy

### localStorage Cleanup Process

#### After Consolidation to CSV
```javascript
// Power Automate expression to clear localStorage data
// This would be implemented as an HTTP action to update the HTML file

// Clear the pending clicks buffer
localStorage.removeItem('areaMapPendingClicks');

// Update last sync timestamp
localStorage.setItem('areaMapLastSync', Date.now().toString());

// Mark as processed
localStorage.setItem('areaMapDataProcessed', 'true');
```

#### Archive Data Cleanup
```javascript
// When archiving, mark all analytics data as processed
// Add metadata to archived HTML indicating data extraction status
// Remove analytics JavaScript from archived files to save space
```

### Deduplication Logic
```javascript
// Power Automate expression for deduplication
const existingClickIDs = new Set(existingCSVData.map(row => row.ClickID));
const newData = incomingData.filter(item => !existingClickIDs.has(item.ClickID));
```

## 📊 Benefits of Lock-and-Key Analytics

### Data Integrity
- ✅ **Single Source of Truth:** Master CSV contains all analytics data
- ✅ **No Duplications:** Deduplication ensures clean dataset
- ✅ **Version Tracking:** Each click tied to specific HTML version
- ✅ **Audit Trail:** Complete history of data processing

### Performance
- ✅ **Fast Dashboard Loading:** CSV data loads quickly
- ✅ **Reduced HTML Size:** No embedded analytics data in files
- ✅ **Efficient Queries:** Direct CSV parsing vs. HTML scraping
- ✅ **Scalable Storage:** CSV grows linearly with usage

### Maintenance
- ✅ **Automated Cleanup:** Power Automate manages data lifecycle
- ✅ **Consolidated Management:** Single flow for all analytics processing
- ✅ **Template Updates:** Dashboard template can be updated independently
- ✅ **Historical Analysis:** Complete analytics history preserved

## 🚀 Implementation Timeline

### Phase 1: CSV Consolidation (Week 1)
- Create master CSV structure
- Build analytics consolidation flow
- Test data extraction and deduplication

### Phase 2: Dashboard Template (Week 2)
- Create analytics dashboard template
- Implement data visualization components
- Test template with sample data

### Phase 3: Dashboard Generation (Week 3)
- Build dashboard generation flow
- Integrate CSV data processing
- Test end-to-end analytics pipeline

### Phase 4: Cleanup & Optimization (Week 4)
- Implement data cleanup flows
- Optimize performance and storage
- Document procedures and troubleshooting

This lock-and-key analytics system provides a robust, scalable solution for analytics data management with Power Automate handling all data consolidation, deduplication, and cleanup automatically.