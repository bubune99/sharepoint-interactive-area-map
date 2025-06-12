# SPFx Interactive Area Map - Design Document

This document outlines the design for converting the interactive area map into a SharePoint Framework (SPFx) web part with property pane configuration options.

## Web Part Architecture

The SPFx web part will use React as the framework and follow these architectural principles:

1. **Component-Based Structure**: Breaking the UI into reusable React components
2. **Typed Interfaces**: Using TypeScript interfaces for data models
3. **SharePoint API Integration**: Direct API calls using the SPFx context
4. **Property Pane Configuration**: User-friendly settings in the property pane
5. **Power Automate Integration**: Built-in support for Power Automate flows

## Component Hierarchy

```
InteractiveAreaMapWebPart
├── MapContainer
│   ├── BaseMap
│   ├── RegionLayers
│   │   └── AreaLayer (multiple)
│   └── InfoPanel
├── ControlPanel
│   ├── RegionSelector
│   ├── AreaSelector
│   ├── EmployeeSelector
│   └── AssignmentForm
└── ZoomModal
```

## Data Models

```typescript
// Region model
interface IRegion {
  id: string;
  title: string;
  description?: string;
  imagePath?: string;
}

// Area model
interface IArea {
  id: string;
  title: string;
  regionId: string;
  regionTitle: string;
  description?: string;
  imagePath?: string;
}

// Personnel assignment model
interface IPersonnelAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  areaId: string;
  areaTitle: string;
  regionId: string;
  regionTitle: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}

// Map image model
interface IMapImage {
  id: string;
  title: string;
  imageType: string;
  areaNumber?: number;
  imageUrl: string;
  description?: string;
  lastUpdated?: Date;
  updatedBy?: string;
}
```

## Property Pane Configuration

The web part will include the following property pane configuration options:

### Data Source Configuration

1. **Data Source Type**:
   - SharePoint Lists (default)
   - Direct Input
   - Power Automate Flow

2. **SharePoint List Configuration** (when "SharePoint Lists" is selected):
   - Regions List Name
   - Areas List Name
   - Personnel Assignments List Name
   - Map Images List Name
   - Site URL (optional, defaults to current site)

3. **Power Automate Configuration** (when "Power Automate Flow" is selected):
   - Flow Trigger URL
   - Authentication Key (if required)

### Map Appearance

1. **Map Title**: Text field for the map title
2. **Color Scheme**:
   - Default
   - Corporate
   - High Contrast
   - Custom

3. **Custom Colors** (when "Custom" is selected):
   - Region 1 Color
   - Region 2 Color
   - Region 3 Color
   - Highlight Color
   - Selected Color

4. **Map Size**:
   - Small
   - Medium
   - Large
   - Custom

5. **Custom Size** (when "Custom" is selected):
   - Width (px or %)
   - Height (px or %)

### Behavior Settings

1. **Enable Zoom**: Toggle for zoom functionality
2. **Enable Hover Effects**: Toggle for hover effects
3. **Show Region Labels**: Toggle for region labels
4. **Auto Refresh Interval**: Dropdown for refresh interval (None, 1 min, 5 min, 15 min, 30 min, 1 hour)

### Advanced Settings

1. **Cache Data**: Toggle to cache data for better performance
2. **Debug Mode**: Toggle for debug information
3. **Custom CSS**: Text area for custom CSS

## SharePoint List Integration

The web part will use the SharePoint REST API through the SPFx context to interact with the SharePoint lists:

```typescript
// Example of fetching regions
private async getRegions(): Promise<IRegion[]> {
  const web = Web(this.context.pageContext.web.absoluteUrl);
  const items = await web.lists
    .getByTitle(this.properties.regionsListName)
    .items
    .select('Id', 'Title', 'Description', 'ImagePath')
    .get();
    
  return items.map(item => ({
    id: item.Id,
    title: item.Title,
    description: item.Description,
    imagePath: item.ImagePath
  }));
}
```

## Power Automate Integration

The web part will include built-in support for Power Automate integration:

1. **Trigger Flow**: Button to manually trigger a Power Automate flow
2. **Receive Updates**: Event listener for updates from Power Automate
3. **Send Data**: Function to send data to Power Automate

```typescript
// Example of triggering a Power Automate flow
private async triggerPowerAutomateFlow(data: any): Promise<void> {
  const response = await fetch(this.properties.flowTriggerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  console.log('Power Automate flow triggered:', result);
}
```

## Direct Input Mode

When "Direct Input" is selected as the data source, the property pane will include fields for directly entering data:

1. **Regions**: JSON editor for regions data
2. **Areas**: JSON editor for areas data
3. **Personnel Assignments**: JSON editor for personnel assignments data
4. **Map Images**: JSON editor for map images data

This mode is useful for testing or for simple implementations without SharePoint lists.

## Implementation Plan

1. **Phase 1**: Create basic SPFx web part structure
2. **Phase 2**: Implement the map rendering components
3. **Phase 3**: Add SharePoint list integration
4. **Phase 4**: Implement property pane configuration
5. **Phase 5**: Add Power Automate integration
6. **Phase 6**: Implement direct input mode
7. **Phase 7**: Testing and optimization

## Deployment and Distribution

The web part will be packaged as an `.sppkg` file that can be deployed to the SharePoint App Catalog. It will be compatible with SharePoint Online and can be added to any modern SharePoint page.

## Future Enhancements

1. **Multi-language Support**: Localization for different languages
2. **Accessibility Improvements**: WCAG 2.1 compliance
3. **Mobile Optimization**: Responsive design for mobile devices
4. **Analytics Integration**: Track usage and interactions
5. **Additional Map Types**: Support for other map types (world, country-specific, etc.)
6. **Custom Region Support**: Allow users to define custom regions
