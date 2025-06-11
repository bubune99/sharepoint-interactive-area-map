# AreaMap Application Guide

## 📍 Overview

The AreaMap application (`AreaMap.html`) is the main user-facing interface that provides an interactive geographic map for personnel queries. Users can click on geographic areas to find personnel assignments and coverage information.

## 🎯 Core Features

### Interactive Map Navigation
- **Click Areas**: Click any geographic region to see personnel
- **Visual Feedback**: Hover effects and selection highlighting
- **Region-based Organization**: Areas grouped by East, Central, West regions

### Personnel Query System
- **Dynamic Search**: Find personnel by region, area, or coverage type
- **Coverage Filtering**: Primary, Secondary, or All coverage types
- **Real-time Results**: Instant query results in modal dialog

### Enhanced Modal Interface
- **Slide-in Animation**: Smooth modal transitions from right side
- **Detailed Personnel Cards**: Complete information with manager details
- **Professional Styling**: SharePoint-compatible design theme

## 🗺️ Geographic Structure

### Regional Organization
```
East Region (A-codes)
├── A1: Baltimore Coast
├── A2: South East  
├── A3: New England
├── A4: New York
├── A5: Philadelphia
├── A6: Gulf Coast
└── A7: Florida

Central Region (B-codes)
├── B1: Chicago
├── B2: Michigan
├── B3: Ohio Valley
├── B4: Central Plains
├── B5: North Central
├── B6: Nashville
├── B7: St. Louis
└── B8: Tulsa

West Region (C-codes)
├── C1: Denver
├── C2: Dallas
├── C3: Houston
├── C4: Phoenix
├── C5: Northern California
├── C6: Seattle
└── C7: Los Angeles
```

### Area Code Mapping
The system supports both formats:
- **Short Format**: A1, B2, C3
- **Long Format**: A01, B02, C03

## 🔍 Query Interface

### Region Selection
```html
<select id="region-select">
  <option value="">-- Select Region --</option>
  <option value="East">East</option>
  <option value="Central">Central</option>
  <option value="West">West</option>
</select>
```

### Area Selection
- **Dynamic Population**: Areas populate based on selected region
- **Hierarchical Structure**: Region → Area relationship
- **Real-time Updates**: Immediate query execution on selection

### Coverage Type Filtering
- **All Coverage**: Shows both primary and secondary assignments
- **Primary Only**: Personnel with primary responsibility
- **Secondary Only**: Personnel with backup/secondary coverage

## 👥 Personnel Display

### Personnel Card Structure
```
┌─────────────────────────────────────────┐
│ [PRIMARY/SECONDARY] [Profile Image]    │
│                                         │
│ John Smith                              │
│ john.smith@company.com                  │
│ Sales Engineer                          │
│                                         │
│ Manager:                                │
│ [Mgr Image] Jane Manager                │
│            Regional Manager             │
│            jane.manager@company.com     │
│                                         │
│ Areas: Primary: Baltimore Coast         │
│        Secondary: Chicago               │
└─────────────────────────────────────────┘
```

### Data Display Logic
```javascript
function createPersonCard(person, isModal) {
    // Profile image with fallback
    const profileImg = person.ProfilePicture || 
        `/_layouts/15/userphoto.aspx?size=M&accountname=${person.UserEmail}` ||
        'https://via.placeholder.com/50';
    
    // Display preferred name or first name
    const displayName = person.PreferredFirstName || person.FirstName;
    
    // Manager information if available
    if (person.Manager && person.Manager.DisplayName) {
        // Show manager card
    }
}
```

## 🔄 Application Logic Flow

### 1. Initialization Sequence
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // 1. Load personnel data (CSV or SharePoint)
    loadPersonnelData();
    
    // 2. Initialize map interactions
    initializeMap();
    
    // 3. Setup event listeners
    setupEventListeners();
    
    // 4. Perform initial query (show all)
    performQuery();
});
```

### 2. Map Interaction Flow
```javascript
// Area click handling
function handleAreaClick(event) {
    const pathId = event.target.getAttribute('id');
    const [areaCode, areaName] = pathId.split('_');
    
    // 1. Extract region from area code
    const region = getRegionFromAreaCode(areaCode);
    
    // 2. Update UI selections
    updateDropdowns(region, areaName);
    
    // 3. Log analytics (automatic)
    logAreaClick(areaCode, areaName, region);
    
    // 4. Execute query
    performQuery();
    
    // 5. Show results modal
    showPersonnelModal(title, summary, results);
}
```

### 3. Personnel Query Logic
```javascript
function findMatchingPersonnel(region, area, coverageType) {
    return personnelData.filter(person => {
        // Check primary areas
        const primaryMatch = person.PrimaryAreaIDs.some(id => 
            matchesSelection(id, region, area));
        
        // Check secondary areas  
        const secondaryMatch = person.SecondaryAreaIDs.some(id => 
            matchesSelection(id, region, area));
        
        // Return based on coverage type
        switch(coverageType) {
            case 'primary': return primaryMatch;
            case 'secondary': return secondaryMatch;
            case 'all': return primaryMatch || secondaryMatch;
        }
    });
}
```

## 📊 Analytics Integration

### Automatic Click Tracking
Every area click automatically logs:
```javascript
{
    timestamp: "2024-01-15T10:30:00.000Z",
    date: "2024-01-15", 
    time: "10:30:00",
    areaCode: "A1",
    areaName: "Baltimore Coast",
    region: "East",
    sessionId: "session_1705317000_abc123",
    userAgent: "Mozilla/5.0...",
    url: "https://site.sharepoint.com/areamap.html"
}
```

### Data Storage Strategy
1. **Primary**: Write to `AreaMapAnalytics.csv`
2. **Backup**: Store in `localStorage`
3. **Retry Logic**: Queue failed writes for retry

## 🎨 Visual Enhancements

### SVG Map Styling
```css
path {
    cursor: pointer;
    transition: all 0.3s ease;
    opacity: 0.7;
}

path:hover {
    opacity: 0.9;
    filter: brightness(1.3) saturate(1.2);
    transform: scale(1.02);
}

path.selected {
    opacity: 1;
    filter: brightness(1.4) saturate(1.5);
    stroke: #0078d4;
    stroke-width: 2px;
    transform: scale(1.05);
}
```

### Modal Animations
```css
.modal-overlay {
    transform: translateX(120%);
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.modal-overlay.show {
    transform: translateX(0) scale(1);
}
```

## 🔧 Configuration Options

### Personnel Data Sources
1. **SharePoint Integration**: `/*@SHAREPOINT_DATA@*/`
2. **CSV File**: `personnel_data.csv`
3. **Embedded Test Data**: Fallback sample data

### Map Customization
- **Area Definitions**: Update `areaNames` object
- **Region Mapping**: Modify region prefix logic
- **Visual Styling**: CSS customization in `<style>` section

### Query Behavior
- **Auto-query**: Executes on dropdown changes
- **Modal Display**: Automatic for area clicks
- **Result Formatting**: Customizable card layouts

## 🚨 Error Handling

### SVG Loading Errors
```javascript
svgObject.addEventListener('error', function(error) {
    console.error('Error loading SVG:', error);
    alert('Error loading the map. Please ensure the SVG file is available.');
});
```

### Data Loading Errors
```javascript
try {
    const response = await fetch('personnel_data.csv');
    const csvText = await response.text();
    personnelData = parseCSV(csvText);
} catch (error) {
    console.error('Error loading CSV:', error);
    // Fall back to embedded test data
    personnelData = getTestData();
}
```

### Query Execution Errors
- **Graceful Degradation**: Show partial results if available
- **User Feedback**: Clear error messages
- **Retry Logic**: Automatic retry for transient failures

## 📱 Responsive Design

### Mobile Optimization
```css
@media (max-width: 768px) {
    .modal-overlay {
        width: 95%;
        right: 10px;
        max-height: calc(100vh - 20px);
    }
    
    .radio-group {
        flex-direction: column;
        gap: 10px;
    }
}
```

### Touch Interface
- **Touch-friendly Buttons**: Larger click targets
- **Swipe Gestures**: Modal close on swipe
- **Zoom Support**: SVG scaling for mobile

---

*The AreaMap application provides an intuitive, responsive interface for personnel management with automatic analytics tracking and professional SharePoint integration.*