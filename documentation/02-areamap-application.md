# AreaMap Application Guide

## 📍 Overview

The AreaMap application is generated from a template system using Power Automate. The template (`AreaMap-PowerAutomate-Template.html`) contains placeholders that are filled with SVG content and personnel data to create a self-contained HTML file that works within SharePoint's restrictions.

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

## 🗺️ Geographic Structure (Updated)

### Regional Organization
```
East Region (A-codes) - 8 Areas
├── A01: Baltimore Coast
├── A02: Raleigh (NEW - was South East)
├── A03: New England
├── A04: New York (Has grouped paths: A04_NewYork + A04_NewYork-2)
├── A05: Philadelphia
├── A06: Gulf Coast
├── A07: Florida
└── A08: Atlanta (NEW)

Central Region (B-codes) - 8 Areas
├── B01: Chicago
├── B02: Michigan
├── B03: Ohio Valley
├── B04: Central Plains
├── B05: Minneapolis (RENAMED - was North Central, has grouped paths)
├── B06: Nashville
├── B07: St. Louis
└── B08: Tulsa

West Region (C-codes) - 8 Areas
├── C01: Denver
├── C02: Dallas
├── C03: Houston
├── C04: Phoenix
├── C05: Northern California
├── C06: Seattle (May have grouped paths with NorthernCalifornia)
├── C07: Los Angeles
└── C08: Central Texas (NEW)
```

### Grouped Areas Feature
Some areas have multiple SVG paths that work as a single unit:
- **A04 New York**: Includes A04_NewYork and A04_NewYork-2
- **B05 Minneapolis**: Includes B05_Minneapolis and B05_Minneapolis-2
- **C06 Seattle**: May include multiple paths

When any path in a group is clicked:
1. All paths in the group highlight together
2. Personnel data shows for the entire area
3. Analytics log the area code (not individual paths)

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

### 1. Template System
```javascript
// Power Automate fills these placeholders:
const personnelData = {{PERSONNEL_DATA}};  // From SharePoint list
// SVG content is embedded directly in HTML: {{SVG_CONTENT}}
```

### 2. Map Interaction with Grouped Areas
```javascript
// Enhanced area click handling for grouped paths
function handleAreaClick(event) {
    const pathId = event.target.getAttribute('id');
    
    // Extract area code (handles A04_NewYork-2 format)
    const areaMatch = pathId.match(/^([A-C]\d{2})/);
    if (!areaMatch) return;
    
    const areaCode = areaMatch[1];
    
    // Clear all selections
    document.querySelectorAll('.svg-map path.selected').forEach(p => {
        p.classList.remove('selected');
    });
    
    // Select all paths with same area code (grouped areas)
    document.querySelectorAll(`.svg-map path[id^="${areaCode}_"]`).forEach(p => {
        p.classList.add('selected');
    });
    
    // Continue with query and display
    performQuery();
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