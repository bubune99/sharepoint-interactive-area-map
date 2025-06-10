# Power Automate Integration Guide for SharePoint Interactive Area Map

This guide explains how to integrate the interactive area map with Power Automate using Power Fx expressions. The integration allows you to:

1. Update the map data from SharePoint lists
2. Process form submissions from the map
3. Update specific areas with new personnel assignments
4. Get the current state of the map (selected region, area, etc.)

## Prerequisites

- SharePoint site with the interactive area map web part added
- Power Automate access
- SharePoint lists created according to the schema (see `sharepoint-list-schema.json` and `sharepoint-image-list-schema.json`)

## Setup Instructions

### 1. Add the Files to SharePoint

1. Upload the following files to a document library in your SharePoint site:
   - `index.html`
   - `styles.css`
   - `us-map.js`
   - `sharepoint-integration.js`
   - `power-automate-integration.js`

2. Add a Script Editor web part to a SharePoint page and reference these files.

### 2. Create the SharePoint Lists

Create the following SharePoint lists according to the schemas:

- **Regions List**: Contains the main regions for the map
- **Areas List**: Contains the areas within each region
- **PersonnelAssignments List**: Contains the assignments of personnel to areas
- **MapImages List**: Contains all images used in the map

The detailed schema for each list is available in the JSON schema files.

### 3. Create Power Automate Flows

#### Flow 1: Initialize Map with SharePoint Data

This flow retrieves data from all SharePoint lists and initializes the map.

1. Create a new automated flow that triggers when the page loads or on a schedule
2. Add a "Get items" action for each SharePoint list:
   - Regions
   - Areas (expand the Region field)
   - PersonnelAssignments (expand the Area, Employee, and Area/Region fields)
   - MapImages

3. Add a "Compose" action to format the data as JSON:
```
{
  "regions": @{outputs('Get_items_-_Regions')},
  "areas": @{outputs('Get_items_-_Areas')},
  "personnelAssignments": @{outputs('Get_items_-_PersonnelAssignments')},
  "mapImages": @{outputs('Get_items_-_MapImages')}
}
```

4. Add a "Run JavaScript" action in the SharePoint page to initialize the map:
```javascript
var mapData = @{outputs('Compose')};
return window.PowerFxMap.initializeMapWithPowerFxData(JSON.stringify(mapData));
```

#### Flow 2: Process Form Submissions

This flow handles form submissions from the map interface.

1. Create a new automated flow that triggers when a form is submitted
2. Add a "Run JavaScript" action to get the form data:
```javascript
var powerFxData = document.getElementById('power-fx-data');
if (powerFxData) {
    return powerFxData.value;
}
return "{}";
```

3. Add a "Parse JSON" action to parse the form data
4. Add a "Create item" action to create a new personnel assignment in SharePoint:
   - List: PersonnelAssignments
   - Title: Concatenate(outputs('Parse_JSON').employee, ' - ', outputs('Parse_JSON').region, ' - ', outputs('Parse_JSON').area)
   - Employee: outputs('Parse_JSON').employee
   - Area: outputs('Parse_JSON').area
   - StartDate: outputs('Parse_JSON').startDate
   - Notes: outputs('Parse_JSON').notes

#### Flow 3: Update Specific Area

This flow updates a specific area with new personnel assignments.

1. Create a new automated flow that triggers on a schedule or manually
2. Add a "Get items" action to get personnel assignments for a specific area:
   - List: PersonnelAssignments
   - Filter Query: Area/Title eq 'Area 1' and Area/Region/Title eq 'Region 1'

3. Add a "Select" action to format the personnel data:
```
Select(outputs('Get_items'), {
    "name": Employee.Title,
    "startDate": StartDate,
    "endDate": EndDate,
    "notes": Notes
})
```

4. Add a "Run JavaScript" action to update the area:
```javascript
var regionName = "Region 1";
var areaName = "Area 1";
var personnelJson = @{outputs('Select')};
return window.PowerFxMap.updateAreaWithPowerFx(regionName, areaName, JSON.stringify(personnelJson));
```

## Power Fx Expressions

The `power-fx-template.txt` file contains sample Power Fx expressions that you can copy and paste into your Power Automate flows. These expressions show how to:

1. Initialize the map with data from SharePoint lists
2. Update specific areas with new personnel assignments
3. Get the current state of the map
4. Handle form submissions from the map

## JavaScript Functions for Power Automate

The `power-automate-integration.js` file provides the following functions that can be called from Power Automate:

- `window.PowerFxMap.initializeMapWithPowerFxData(dataJson)`: Initialize the map with data from SharePoint
- `window.PowerFxMap.updateAreaWithPowerFx(regionName, areaName, personnelJson)`: Update a specific area with new personnel
- `window.PowerFxMap.getMapStateForPowerFx()`: Get the current state of the map
- `window.PowerFxMap.submitAssignmentToPowerFx()`: Submit a form assignment

## Troubleshooting

- **Map not updating**: Check the browser console for errors. Make sure the data format from Power Automate matches what the map expects.
- **Form submissions not working**: Verify that the `power-fx-data` hidden field is present in the HTML and being populated correctly.
- **Power Automate flow failing**: Check that all SharePoint list fields are correctly referenced in your flow.

## Advanced Customization

You can extend the Power Automate integration by:

1. Adding more data attributes to HTML elements for Power Fx to target
2. Creating additional JavaScript functions in `power-automate-integration.js`
3. Building more complex Power Automate flows that combine multiple actions

For more information, refer to the Power Automate and Power Fx documentation.
