# Legacy Files Archive

This folder contains files that were part of the SharePoint Interactive Area Map project but are no longer used in the current **lock-and-key template system** implemented with Power Automate.

## 📁 Archived Content

### HTML Files (Legacy Implementations)
- `AreaMap.html` - Original standalone implementation
- `areamap2.html` - Second iteration 
- `AreaMap-Clean.html` - Cleaned version
- `AreaMap-Fixed.html` - Bug fix version
- `AreaMap-with-analytics-backup.html` - Version with backup analytics
- `AreaMap-PowerAutomate.html` - Early Power Automate attempt
- `index.html` - Original index page

### SVG Map Files (Superseded Versions)
- `Artboard 1.svg` - Original map (22 areas)
- `Artboard 1-2.svg` - Second iteration (23 areas)
- `cleaned-area-map.svg` - Cleaned version

**Current Version:** `Artboard 1-3.svg` (24 areas, includes A08 Atlanta & C08 Central Texas)

### Power Automate Flow Files (Deprecated)
- `AreaMap-Flow.json` - Original flow definition
- `AreaMap-Flow-Updated.json` - Updated flow
- `AreaMap-Template-Flow.json` - Template flow attempt
- `AreaPersonnel-AutoPopulate-Flow.json` - Personnel population flow
- `AreaPersonnelFlow.json` - Personnel flow
- `*.zip` files - Exported flow packages

**Current Version:** Configuration managed through `AreaMap-PowerAutomate-Config.json`

### Documentation (Replaced)
- `ANALYTICS-DOCUMENTATION.md` - Old analytics docs
- `AreaMap-Analytics-Persistence.md` - Early persistence strategy
- `POWER-AUTOMATE-*.md` files - Various Power Automate guides
- `SHAREPOINT-CSV-INTEGRATION.md` - CSV integration docs
- `SPFX-*.md` files - SPFx implementation docs

**Current Documentation:** Located in `/documentation/` folder with structured guides

### Code Files (No Longer Used)
- `styles.css` / `styles-addition.css` - External stylesheets
- `us-map.js` - Legacy map JavaScript
- `sharepoint-integration.js` - Old SharePoint integration
- `power-automate-integration.js` - Legacy PA integration
- `InteractiveAreaMap.tsx.example` - SPFx example
- `InteractiveAreaMapWebPart.ts.example` - SPFx web part example

### Configuration Files (Deprecated)
- `manifest.json` - Old manifest
- `package.json` - Package configuration
- `sharepoint-personnel-schema.json` - Personnel schema
- `power-fx-template.txt` - Power FX template
- `cleaned-svg.txt` - SVG processing notes

### Data Files (Legacy Format)
- `area-map-clicks.csv` - Old analytics format

**Current Analytics:** Managed through SharePoint AreaMapAnalytics list

## 🔄 Migration to Current System

The current implementation uses:

### Template System
- **Template:** `AreaMap-PowerAutomate-Template.html`
- **Configuration:** `AreaMap-PowerAutomate-Config.json`
- **Map:** `Artboard 1-3.svg` (24 areas)
- **Build Script:** `Build-AreaMap.ps1`

### Generated Files
- **Output:** `AreaMap-Generated.html` (created by Power Automate)
- **Analytics:** SharePoint AreaMapAnalytics list
- **Personnel:** SharePoint Personnel list

### Documentation
- **Location:** `/documentation/` folder
- **Structure:** 8 organized guides covering all aspects

## 🗂️ Why These Files Were Archived

1. **Template System**: Replaced standalone HTML with Power Automate template generation
2. **Analytics Persistence**: Moved from CSV files to SharePoint list storage
3. **SVG Updates**: New map version with additional areas (A08, C08)
4. **Documentation**: Consolidated scattered docs into structured guides
5. **Configuration**: Simplified to single JSON config file
6. **Dependencies**: Eliminated external dependencies for SharePoint compatibility

## 📅 Archive Date
December 6, 2024

## ⚠️ Important Notes
- These files are preserved for reference but should not be used in production
- The current system in the parent directory is the active implementation
- Contact the development team before using any archived files
- Some archived flows may not be compatible with current SharePoint/Power Automate versions

---

*These files represent the evolution of the SharePoint Interactive Area Map project and are maintained for historical reference and potential future insights.*