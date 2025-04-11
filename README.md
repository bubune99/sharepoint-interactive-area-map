# US Area Map for SharePoint

This project provides an interactive US area map that can be integrated with SharePoint. The map displays custom regions with hover functionality to highlight areas and display personnel assignments.

## Features

- Interactive US map divided into 3 regions with multiple areas in each:
  - Region 1: 7 areas
  - Region 2: 8 areas
  - Region 3: 7 areas
- Hover effects to highlight areas
- Click to select an area and view detailed information
- Double-click to zoom in on an area
- Display of personnel assigned to each area
- Area management interface for assigning employees to areas
- SharePoint list integration for easy data management

## Mockup Usage

This HTML mockup demonstrates the functionality that will be implemented in SharePoint:

1. Open `index.html` in a web browser to view the interactive map
2. Hover over areas to see them highlight
3. Click on an area to view the personnel assigned to that area
4. Double-click on an area to see an enlarged view
5. Use the form controls to simulate assigning employees to areas

## Image Placeholders

The mockup uses placeholder images that need to be replaced with your actual region/area images:

### Required Images (in the `images` folder)

- `base-map.png` - The outline of the entire US map

#### Region 1 (7 areas)
- `region1-area1.png`
- `region1-area2.png`
- `region1-area3.png`
- `region1-area4.png`
- `region1-area5.png`
- `region1-area6.png`
- `region1-area7.png`

#### Region 2 (8 areas)
- `region2-area1.png`
- `region2-area2.png`
- `region2-area3.png`
- `region2-area4.png`
- `region2-area5.png`
- `region2-area6.png`
- `region2-area7.png`
- `region2-area8.png`

#### Region 3 (7 areas)
- `region3-area1.png`
- `region3-area2.png`
- `region3-area3.png`
- `region3-area4.png`
- `region3-area5.png`
- `region3-area6.png`
- `region3-area7.png`

All images should have the same dimensions and positioning to ensure proper overlay.

## Implementation Plan for SharePoint

### 1. SharePoint List Structure

Create the following SharePoint lists:

#### Regions List
- Title (Region Name): Single line of text
- Description: Multiple lines of text

#### Areas List
- Title (Area Name): Single line of text
- Region: Lookup to Regions list
- Description: Multiple lines of text

#### Personnel Assignments List
- Employee: Person or Group
- Area: Lookup to Areas list
- StartDate: Date
- Notes: Multiple lines of text

### 2. SharePoint Implementation

1. **Create a SharePoint Page**
   - Add a Script Editor web part
   - Insert the HTML/CSS/JavaScript code from this mockup
   - Update the code to use SharePoint REST API for data

2. **Create the Images Folder**
   - Upload all region/area images to a SharePoint library
   - Update image paths in the code to point to the SharePoint library

3. **Connect to SharePoint Lists**
   - Use the SharePoint REST API to fetch data from the lists
   - Update the JavaScript to populate the map with data from SharePoint

4. **Set Up Permissions**
   - Configure appropriate permissions for the page and lists

### 3. Power Automate Integration (Optional)

You can enhance the solution with Power Automate flows:

1. **Notification Flow**: Send notifications when assignments change
2. **Approval Flow**: Create an approval process for new assignments
3. **Reporting Flow**: Generate reports of area assignments

## SharePoint REST API Integration

Here's a sample code snippet showing how to fetch data from SharePoint lists:

```javascript
// Function to get data from SharePoint lists
function getSharePointData() {
    // Get regions
    fetch("/_api/web/lists/getbytitle('Regions')/items", {
        method: 'GET',
        headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose'
        }
    })
    .then(response => response.json())
    .then(data => {
        const regions = data.d.results;
        
        // Get areas
        return fetch("/_api/web/lists/getbytitle('Areas')/items?$expand=Region", {
            method: 'GET',
            headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose'
            }
        })
        .then(response => response.json())
        .then(areaData => {
            const areas = areaData.d.results;
            
            // Get personnel assignments
            return fetch("/_api/web/lists/getbytitle('PersonnelAssignments')/items?$expand=Area,Employee", {
                method: 'GET',
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose'
                }
            })
            .then(response => response.json())
            .then(personnelData => {
                const personnel = personnelData.d.results;
                
                // Process and combine the data
                return processSharePointData(regions, areas, personnel);
            });
        });
    })
    .then(processedData => {
        // Update the map with the processed data
        updateMapWithData(processedData);
    })
    .catch(error => {
        console.error('Error fetching SharePoint data:', error);
    });
}
```

## Customization Options

- **Color Scheme**: Modify the CSS to match your organization's branding
- **Regions/Areas**: Adjust the region and area definitions to match your specific structure
- **Additional Fields**: Add more fields to the SharePoint lists for additional data points
- **Integration**: Connect with other systems like CRM or ERP for enhanced functionality

## Support

For questions or assistance with implementation, please contact your SharePoint administrator or web developer.
