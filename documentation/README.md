# SharePoint Interactive Area Map - Documentation

## 📁 Documentation Overview

This documentation folder contains comprehensive guides for the SharePoint Interactive Area Map system, including the new **lock-and-key template system** designed to work within SharePoint's dependency restrictions using Power Automate integration.

## 🔐 Lock-and-Key Template System

The system now uses a template-based approach where:
- **Lock (Template)**: `AreaMap-PowerAutomate-Template.html` contains placeholders
- **Key (Data)**: Power Automate injects SVG content and personnel data
- **Result**: Self-contained HTML file with all functionality inline

## 📚 Documentation Files

1. **[System Architecture](./01-system-architecture.md)** - Lock-and-key design and Power Automate flow
2. **[AreaMap Application](./02-areamap-application.md)** - Interactive map with updated areas (A08, C08, etc.)
3. **[Personnel CSV Integration](./03-personnel-csv.md)** - Personnel data structure and management
4. **[Analytics System](./04-analytics-system.md)** - Inline analytics tracking
5. **[Analytics Dashboard](./05-analytics-dashboard.md)** - Data visualization and insights
6. **[Deployment Guide](./06-deployment-guide.md)** - Power Automate template setup
7. **[Troubleshooting](./07-troubleshooting.md)** - Template and flow issues
8. **[API Reference](./08-api-reference.md)** - Template placeholders and transformations

## 🚀 Quick Start Guide

### For Administrators:
1. Read **System Architecture** to understand the lock-and-key design
2. Follow **Deployment Guide** for Power Automate template setup
3. Configure **Personnel CSV** data structure in SharePoint list
4. Set up Power Automate flow triggers and actions

### For End Users:
1. Review **AreaMap Application** for usage instructions
2. Understand new areas (A08-Atlanta, C08-Central Texas)
3. Access **Analytics Dashboard** for insights

### For Developers:
1. Study **System Architecture** and template placeholders
2. Review **API Reference** for Power Automate integration
3. Understand grouped area handling (A04, B05, C06)
4. Check **Troubleshooting** for template issues

## 🔄 System Flow Summary

```
SharePoint List → Power Automate → Template Processing → Generated HTML
      ↓                ↓                ↓                    ↓
Personnel Data → Read Template → Inject SVG/Data → Self-Contained App
```

## 📋 File Structure

```
sharepoint-interactive-area-map/
├── AreaMap-PowerAutomate-Template.html    (Lock template with placeholders)
├── AreaMap-PowerAutomate-Config.json      (Configuration for Power Automate)
├── Build-AreaMap.ps1                      (Local testing script)
├── AreaMap.html                           (Generated application)
├── AreaMapAnalytics.csv                   (Auto-generated analytics)
├── analytics-dashboard.html               (Admin dashboard)
├── personnel_data.csv                     (Personnel information)
├── Artboard 1-3.svg                       (Updated map with A08, C08)
├── documentation/                         (This folder)
│   ├── README.md                          (This file)
│   ├── 01-system-architecture.md
│   ├── 02-areamap-application.md
│   ├── 03-personnel-csv.md
│   ├── 04-analytics-system.md
│   ├── 05-analytics-dashboard.md
│   ├── 06-deployment-guide.md
│   ├── 07-troubleshooting.md
│   └── 08-api-reference.md
├── POWER-AUTOMATE-TEMPLATE-GUIDE.md       (Power Automate setup guide)
└── SVG-UPDATE-SUMMARY.md                  (New areas and changes)
```

## 🎯 Key Features

- **Lock-and-Key Template System** - Works within SharePoint restrictions
- **Power Automate Integration** - Automatic HTML generation
- **Grouped Area Support** - Multiple paths work as single regions
- **Updated Map Areas** - Includes A08 (Atlanta), C08 (Central Texas)
- **Inline Everything** - No external dependencies required
- **Automatic Analytics** - Transparent usage tracking
- **Real-time Dashboard** - Visual insights and trends

## ⚠️ Important Notes

- Template and config files required for Power Automate
- SVG content is embedded directly (no external file references)
- Personnel data injected from SharePoint list
- All JavaScript and CSS inline for SharePoint compatibility
- Analytics CSV appended automatically
- Grouped areas (A04, B05, C06) highlight together

## 🆘 Need Help?

1. **Check Troubleshooting Guide** - Common issues and solutions
2. **Review System Architecture** - Understand data flow
3. **Verify Deployment** - Ensure proper SharePoint setup
4. **Test with Sample Data** - Use provided examples

---

*This documentation covers the complete SharePoint Interactive Area Map system including architecture, implementation, and operational procedures.*