# Deployment Guide

## 🚀 Overview

This guide provides step-by-step instructions for deploying the SharePoint Interactive Area Map system in a SharePoint environment. The deployment includes all necessary files, permissions, and configuration settings.

## 📋 Prerequisites

### System Requirements
- **SharePoint Online** or **SharePoint Server 2019/2022**
- **Modern Experience** enabled (Classic mode supported with limitations)
- **Site Collection Administrator** or **Site Owner** permissions
- **Document Library** or **Site Pages** library for file hosting

### Browser Compatibility
- **Microsoft Edge** (Recommended)
- **Google Chrome** 88+
- **Mozilla Firefox** 85+
- **Safari** 14+ (macOS/iOS)

### File Dependencies
All files must be uploaded to the same SharePoint location:
```
AreaMap.html                    (Required)
Artboard 1.svg                  (Required) 
analytics-dashboard.html        (Required)
personnel_data.csv              (Required)
AreaMapAnalytics.csv           (Auto-created)
```

## 📁 File Upload Process

### Step 1: Prepare Document Library

1. **Navigate to SharePoint Site**
   ```
   https://[tenant].sharepoint.com/sites/[sitename]
   ```

2. **Create or Select Document Library**
   - Use existing **Documents** library, or
   - Create new library named **"AreaMap"**

3. **Configure Library Settings**
   - **Versioning**: Enable major versions
   - **Check-out**: Optional (recommended for editing)
   - **Content Approval**: Disabled

### Step 2: Upload Core Files

#### Upload HTML Files
```powershell
# Option 1: Web Interface
1. Go to Document Library
2. Click "Upload" → "Files"
3. Select: AreaMap.html, analytics-dashboard.html
4. Click "OK"

# Option 2: SharePoint PowerShell
Add-PnPFile -Path ".\AreaMap.html" -Folder "Documents"
Add-PnPFile -Path ".\analytics-dashboard.html" -Folder "Documents"
```

#### Upload SVG Map
```powershell
Add-PnPFile -Path ".\Artboard 1.svg" -Folder "Documents"
```

#### Upload Personnel Data
```powershell
Add-PnPFile -Path ".\personnel_data.csv" -Folder "Documents"
```

### Step 3: Create Analytics File

The analytics file is auto-created, but you can pre-create it:

```csv
Timestamp,Date,Time,AreaCode,AreaName,Region,SessionId,UserAgent,URL
```

Save as `AreaMapAnalytics.csv` and upload to the same location.

## 🔐 Permissions Configuration

### File-Level Permissions

#### AreaMap.html
- **Read Access**: All authenticated users
- **Edit Access**: Site administrators only

#### analytics-dashboard.html  
- **Read Access**: Site administrators only
- **Edit Access**: Site administrators only

#### Personnel CSV Files
- **Read Access**: AreaMap application only
- **Edit Access**: HR administrators + designated personnel managers

#### AreaMapAnalytics.csv
- **Read Access**: Analytics dashboard + site administrators
- **Write Access**: AreaMap application (automatic)

### SharePoint Permission Setup

```powershell
# Grant permissions using PowerShell
$web = Get-PnPWeb
$list = Get-PnPList -Identity "Documents"

# Set AreaMap.html permissions
Set-PnPFileCheckedIn -Url "Documents/AreaMap.html"
Set-PnPListItemPermission -List $list -Identity "AreaMap.html" -User "All Users" -AccessRights Read

# Restrict analytics dashboard  
Set-PnPListItemPermission -List $list -Identity "analytics-dashboard.html" -Group "Site Owners" -AccessRights FullControl
```

## 🔧 Configuration Settings

### Update File Paths

If deploying to a subfolder, update file references:

```javascript
// In AreaMap.html, update SVG path
const svgPath = './subfolder/Artboard 1.svg';

// Update CSV paths
const personnelCsvPath = './subfolder/personnel_data.csv';
const analyticsCsvPath = './subfolder/AreaMapAnalytics.csv';
```

### SharePoint Context Configuration

```javascript
// Verify SharePoint context availability
if (typeof _spPageContextInfo !== 'undefined') {
    const webUrl = _spPageContextInfo.webAbsoluteUrl;
    const siteUrl = _spPageContextInfo.siteAbsoluteUrl;
    
    console.log('SharePoint context detected:', webUrl);
} else {
    console.warn('SharePoint context not available - running in standalone mode');
}
```

### Environment-Specific Settings

```javascript
const config = {
    production: {
        baseUrl: _spPageContextInfo.webAbsoluteUrl,
        enableAnalytics: true,
        debugMode: false
    },
    development: {
        baseUrl: 'http://localhost',
        enableAnalytics: false,
        debugMode: true
    }
};
```

## 🔄 Testing Procedures

### Pre-Deployment Testing

1. **Local File Testing**
   ```bash
   # Serve files locally for testing
   python -m http.server 8000
   # Navigate to http://localhost:8000/AreaMap.html
   ```

2. **SVG Loading Test**
   - Verify map displays correctly
   - Test area click functionality
   - Confirm hover effects work

3. **Personnel Data Test**
   - Upload sample personnel CSV
   - Test personnel queries
   - Verify modal displays

### Post-Deployment Validation

#### Functional Testing Checklist
- [ ] AreaMap.html loads without errors
- [ ] SVG map displays and is interactive
- [ ] Personnel queries return correct results  
- [ ] Analytics logging works (check console)
- [ ] Dashboard loads analytics data
- [ ] Permissions prevent unauthorized access

#### Performance Testing
```javascript
// Browser console tests
console.time('SVG Load');
// Measure SVG loading time

console.time('Personnel Query');
// Measure query performance

console.time('Analytics Write');
// Measure analytics logging speed
```

## 📊 SharePoint Integration

### REST API Configuration

```javascript
// Configure REST API calls
const restConfig = {
    baseUrl: _spPageContextInfo.webAbsoluteUrl + "/_api",
    headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose',
        'X-RequestDigest': document.getElementById('__REQUESTDIGEST').value
    }
};
```

### List Integration (Optional)

For advanced scenarios, integrate with SharePoint lists:

```javascript
// Create Personnel list
const listCreationConfig = {
    Title: 'Personnel',
    BaseTemplate: 100, // Generic List
    Fields: [
        { Name: 'UserEmail', Type: 'Text' },
        { Name: 'PrimaryAreaIDs', Type: 'Note' },
        { Name: 'UserDepartment', Type: 'Text' }
    ]
};
```

## 🔒 Security Hardening

### Content Security Policy

Add to SharePoint master page or site settings:

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https:;
">
```

### File Upload Restrictions

```powershell
# Configure allowed file extensions
Set-PnPTenantSettings -AllowedFileExtensions @("html","svg","csv","js","css")
```

### Access Auditing

Enable auditing for analytics files:

```powershell
Set-PnPList -Identity "Documents" -EnableAttachments $false
Set-PnPList -Identity "Documents" -EnableVersioning $true
Set-PnPList -Identity "Documents" -MajorVersionLimit 50
```

## 📱 Mobile Deployment

### Responsive Design Verification

Test on multiple screen sizes:
- **Desktop**: 1920x1080, 1366x768
- **Tablet**: 1024x768, 768x1024  
- **Mobile**: 375x667, 414x896

### Touch Interface Testing

```javascript
// Test touch events
document.addEventListener('touchstart', function(e) {
    console.log('Touch detected:', e.touches.length);
});
```

## 🔄 Maintenance Procedures

### Regular Updates

#### Weekly Tasks
- Check analytics file size
- Verify personnel data accuracy
- Test key functionality

#### Monthly Tasks  
- Review performance metrics
- Update personnel CSV if needed
- Archive old analytics data

#### Quarterly Tasks
- Full security review
- Permission audit
- Performance optimization

### Backup Strategy

```powershell
# Automated backup script
$backupFolder = "\\server\backups\areamap\"
$date = Get-Date -Format "yyyy-MM-dd"

# Backup all files
Copy-Item "AreaMap.html" "$backupFolder\AreaMap_$date.html"
Copy-Item "personnel_data.csv" "$backupFolder\personnel_$date.csv"
Copy-Item "AreaMapAnalytics.csv" "$backupFolder\analytics_$date.csv"
```

## 🚨 Troubleshooting Deployment

### Common Issues

#### File Not Found Errors
```javascript
// Debug file path issues
fetch('./personnel_data.csv')
    .then(response => {
        if (!response.ok) {
            console.error('File not found:', response.status);
        }
        return response.text();
    })
    .catch(error => console.error('Fetch error:', error));
```

#### Permission Denied
- Verify user has read access to document library
- Check file-level permissions
- Confirm SharePoint context is available

#### SVG Not Loading
- Verify SVG file is in same directory
- Check file name matches exactly: "Artboard 1.svg"
- Test SVG opens directly in browser

### Deployment Rollback

```powershell
# Quick rollback procedure
1. Navigate to Document Library
2. Select problematic files
3. Go to Version History
4. Restore previous working version
5. Test functionality
```

## 📋 Go-Live Checklist

### Pre-Launch
- [ ] All files uploaded successfully
- [ ] Permissions configured correctly
- [ ] Personnel data validated and current
- [ ] Analytics system tested
- [ ] Mobile responsiveness verified
- [ ] Security settings applied

### Launch Day
- [ ] Communicate to end users
- [ ] Monitor for errors in first hour
- [ ] Check analytics data generation
- [ ] Verify performance metrics
- [ ] Document any issues

### Post-Launch
- [ ] Collect user feedback
- [ ] Monitor usage patterns  
- [ ] Schedule regular maintenance
- [ ] Plan future enhancements

---

*This deployment guide ensures a successful, secure, and maintainable installation of the SharePoint Interactive Area Map system.*