# SVG Update Summary - Artboard 1-3.svg

## 🗺️ Overview
The updated SVG (Artboard 1-3.svg) includes significant changes to the area structure, with new regions added and some areas having multiple paths that should be grouped together.

## 📍 Area Structure

### East Region (A-prefix)
- **A01_BaltimoreCoast** - Baltimore Coast area
- **A02_Raleigh** - Raleigh area (NEW - was previously "South East")
- **A03_NewEngland** - New England area
- **A04_NewYork** - New York area (has 2 paths: main + A04_NewYork-2)
- **A05_Philadelphia** - Philadelphia area
- **A06_GulfCoast** - Gulf Coast area
- **A07_Florida** - Florida area
- **A08_Atlanta** - Atlanta area (NEW)

### Central Region (B-prefix)
- **B01_Chicago** - Chicago area
- **B02_Michigan** - Michigan area
- **B03_OhioValley** - Ohio Valley area
- **B04_CentralPlains** - Central Plains area
- **B05_Minneapolis** - Minneapolis area (has 2 paths: main + B05_Minneapolis-2) (RENAMED from "North Central")
- **B06_Nashville** - Nashville area
- **B07_StLouis** - St. Louis area
- **B08_Tulsa** - Tulsa area

### West Region (C-prefix)
- **C01_Denver** - Denver area
- **C02_Dallas** - Dallas area
- **C03_Houston** - Houston area
- **C04_Phoenix** - Phoenix area
- **C05_NorthernCalifornia** - Northern California area
- **C06_Seattle** - Seattle area (Note: also has C06_NorthernCalifornia paths that should be handled)
- **C07_LosAngeles** - Los Angeles area
- **C08_CentralTexas** - Central Texas area (NEW)

## 🔗 Grouped Areas
Some areas have multiple paths that represent the same region and should be treated as a single clickable area:

1. **New York (A04)**
   - Primary: A04_NewYork
   - Secondary: A04_NewYork-2

2. **Minneapolis (B05)**
   - Primary: B05_Minneapolis
   - Secondary: B05_Minneapolis-2

3. **Northern California/Seattle (C06)**
   - Multiple paths with C06 prefix that may need special handling

## 🔧 Implementation Notes

### Handling Grouped Paths
When implementing click handlers, all paths with the same area code should:
1. Highlight together when any part is clicked
2. Show the same personnel data
3. Be treated as a single logical area

### JavaScript Example
```javascript
// Handle grouped areas
function getAreaGroup(pathId) {
    // Extract base area code (e.g., "A04" from "A04_NewYork-2")
    const match = pathId.match(/^([A-C]\d{2})/);
    return match ? match[1] : null;
}

// When clicking, highlight all paths in the group
function highlightAreaGroup(areaCode) {
    const paths = svgDoc.querySelectorAll(`path[id^="${areaCode}_"]`);
    paths.forEach(path => path.classList.add('selected'));
}
```

### Power Automate Considerations
The template system should:
1. Recognize grouped areas automatically
2. Apply consistent styling to all paths in a group
3. Ensure click events work on any path in the group

## 📊 Summary of Changes
- **New Areas Added**: A02_Raleigh, A08_Atlanta, C08_CentralTexas
- **Areas Renamed**: B05 changed from "North Central" to "Minneapolis"
- **Grouped Areas**: A04, B05, and potentially C06 have multiple paths
- **Total Areas**: 8 in East, 8 in Central, 8 in West (24 total)