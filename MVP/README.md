# Interactive Area Map - MVP Version

This folder contains a Minimum Viable Product (MVP) version of the Interactive Area Map that can be quickly imported into SharePoint for immediate demonstration and testing.

## Contents

1. **interactive-map-mvp.html**: The main HTML file containing all the necessary code (HTML, CSS, and JavaScript) for the interactive map. This file is self-contained and can be directly embedded in a SharePoint page.

2. **images/**: Folder containing all the map images:
   - `base-map.png`: The outline of the entire US map
   - Region 1 area images (7 files)
   - Region 2 area images (8 files)
   - Region 3 area images (7 files)

3. **CSV Files for SharePoint Lists**:
   - `regions.csv`: Data for the Regions list
   - `areas.csv`: Data for the Areas list
   - `personnel_assignments.csv`: Data for the Personnel Assignments list
   - `map_images.csv`: Data for the Map Images list

## Quick Implementation Steps

### Option 1: Using the Script Editor Web Part

1. Upload the entire `MVP` folder to a document library in your SharePoint site
2. Create a new page in SharePoint
3. Add a Script Editor web part to the page
4. Edit the web part and paste the following code:

```html
<div id="interactive-area-map-container"></div>
<script>
    // Load the interactive map from the document library
    fetch('/sites/YourSite/DocumentLibrary/MVP/interactive-map-mvp.html')
        .then(response => response.text())
        .then(html => {
            // Fix image paths to point to the document library
            const fixedHtml = html.replace(/images\//g, '/sites/YourSite/DocumentLibrary/MVP/images/');
            
            // Insert the HTML into the container
            document.getElementById('interactive-area-map-container').innerHTML = fixedHtml;
            
            // Execute any scripts in the HTML
            const scripts = document.getElementById('interactive-area-map-container').getElementsByTagName('script');
            for (let i = 0; i < scripts.length; i++) {
                eval(scripts[i].innerText);
            }
        });
</script>
```

Replace `/sites/YourSite/DocumentLibrary` with the actual path to your document library.

### Option 2: Using the Content Editor Web Part

1. Upload the entire `MVP` folder to a document library in your SharePoint site
2. Create a new page in SharePoint
3. Add a Content Editor web part to the page
4. Set the Content Link to the path of the `interactive-map-mvp.html` file in your document library

## Setting Up SharePoint Lists (For Full Integration)

The CSV files included in this folder can be used to create and populate the SharePoint lists needed for the full solution:

1. Create the following lists in SharePoint:
   - Regions
   - Areas
   - PersonnelAssignments
   - MapImages

2. Import the corresponding CSV files into each list:
   - Import `regions.csv` into the Regions list
   - Import `areas.csv` into the Areas list
   - Import `personnel_assignments.csv` into the PersonnelAssignments list
   - Import `map_images.csv` into the MapImages list

3. For the full integration, you'll need to update the paths in the `map_images.csv` file to point to the actual location of your images in SharePoint.

## Features of the MVP Version

The MVP version includes:

- Interactive US map with 3 regions and their areas
- Hover effects to highlight areas
- Click to select an area and view personnel assignments
- Double-click to zoom in on an area
- Form controls to filter by region, area, or employee
- Hardcoded data for demonstration purposes

## Next Steps

After implementing the MVP, you can proceed with:

1. Integrating with SharePoint lists for dynamic data
2. Implementing the Power Automate flows for data updates
3. Developing the full SPFx web part for a more native SharePoint experience

## Notes

- The MVP version uses hardcoded data for demonstration purposes
- All styling is contained within the HTML file for easy embedding
- The map images are the same as those in the main project
- The CSV files match the schema defined in the main project's JSON schema files
