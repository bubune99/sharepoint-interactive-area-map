# Troubleshooting Guide

## 🚨 Common Issues and Solutions

This guide provides solutions to frequently encountered problems with the SharePoint Interactive Area Map template system and Power Automate integration.

## 🗺️ Map Display Issues

### SVG Map Not Loading (Template System)

**Symptoms:**
- Blank area where map should display
- Missing SVG content in generated HTML
- Console error: "SVG content not found"

**Solutions:**

1. **Template Placeholder Check**
   ```html
   <!-- Verify {{SVG_CONTENT}} placeholder exists in template -->
   <div class="map-container">
       {{SVG_CONTENT}}
   </div>
   ```

2. **Power Automate SVG Processing**
   ```javascript
   // Check if Power Automate is reading SVG correctly
   // Verify file name is exactly: "Artboard 1-3.svg"
   ```

3. **SVG Content Validation**
   ```javascript
   // In generated HTML, check if SVG is properly embedded
   const svgElement = document.querySelector('.svg-map');
   if (!svgElement) {
       console.error('❌ SVG not embedded in HTML');
   }
   ```

4. **File Name Update**
   - Ensure using correct file: `Artboard 1-3.svg` (not old version)
   - Update Power Automate flow to reference new filename
   - Check template config points to correct SVG file

### Map Areas Not Clickable (Grouped Areas)

**Symptoms:**
- Map displays but clicking does nothing
- Some areas work but grouped areas don't
- New areas (A08, C08) not responding

**Solutions:**

1. **Grouped Area Handler Check**
   ```javascript
   // Verify grouped area click handling
   function handleAreaClick(event) {
       const pathId = event.target.getAttribute('id');
       const areaMatch = pathId.match(/^([A-C]\d{2})/);
       if (!areaMatch) {
           console.error('Invalid area ID format:', pathId);
           return;
       }
       
       const areaCode = areaMatch[1];
       console.log('Clicked area group:', areaCode);
   }
   ```

2. **New Area ID Validation**
   ```javascript
   // Check if new areas are properly mapped
   const newAreas = ['A02', 'A08', 'C08'];
   newAreas.forEach(code => {
       if (!areaNames[code]) {
           console.error('Missing area mapping for:', code);
       }
   });
   ```

3. **Event Listener Setup for Inline SVG**
   ```javascript
   // Different from object-based SVG - events are on inline elements
   document.querySelectorAll('.svg-map path[id]').forEach(path => {
       path.addEventListener('click', handleAreaClick);
   });
   ```

4. **Area ID Format Updates**
   - New format: `A01_BaltimoreCoast`, `A08_Atlanta`, `C08_CentralTexas`
   - Grouped areas: `A04_NewYork-2`, `B05_Minneapolis-2`
   - Verify area codes match new SVG structure

### Visual Display Problems

**Symptoms:**
- Map appears distorted
- Zoom issues
- Styling problems

**Solutions:**

1. **CSS Conflicts**
   ```css
   /* Reset SVG styles */
   #svgObject {
       width: 100%;
       height: auto;
       max-width: none;
       border: none;
   }
   ```

2. **Browser Compatibility**
   ```javascript
   // Check browser support
   if (!document.querySelector || !document.addEventListener) {
       alert('Browser not supported. Please use a modern browser.');
   }
   ```

## 👥 Personnel Data Issues

### CSV File Not Loading

**Symptoms:**
- No personnel results
- "Personnel data not available" message
- Console error: "Failed to fetch"

**Solutions:**

1. **File Accessibility Test**
   ```javascript
   fetch('./personnel_data.csv')
       .then(response => {
           console.log('CSV Response:', response.status);
           return response.text();
       })
       .then(text => {
           console.log('CSV Content length:', text.length);
           console.log('First 100 characters:', text.substring(0, 100));
       });
   ```

2. **File Format Validation**
   ```javascript
   // Check CSV structure
   function validateCSVFormat(csvText) {
       const lines = csvText.split('\n');
       const headers = lines[0].split(',');
       
       const requiredHeaders = [
           'Title', 'UserEmail', 'PrimaryAreaIDs'
       ];
       
       const missing = requiredHeaders.filter(h => !headers.includes(h));
       if (missing.length > 0) {
           console.error('Missing CSV headers:', missing);
       }
   }
   ```

3. **Encoding Issues**
   - Save CSV as UTF-8 without BOM
   - Check for special characters
   - Verify comma separation (not semicolon)

### Personnel Query Returns No Results

**Symptoms:**
- Query executes but shows "No personnel found"
- Modal opens but is empty
- Console shows successful data load

**Solutions:**

1. **Area Code Mapping**
   ```javascript
   // Debug area code matching
   function debugAreaCodeMatch(areaCode, personnelData) {
       console.log('Searching for area code:', areaCode);
       
       personnelData.forEach(person => {
           const primaryAreas = person.PrimaryAreaIDs || [];
           const secondaryAreas = person.SecondaryAreaIDs || [];
           
           if (primaryAreas.includes(areaCode) || secondaryAreas.includes(areaCode)) {
               console.log('Found match:', person.Title);
           }
       });
   }
   ```

2. **Data Validation**
   ```javascript
   // Check data integrity
   function validatePersonnelData(data) {
       data.forEach((person, index) => {
           if (!person.PrimaryAreaIDs) {
               console.warn(`Row ${index + 1}: Missing PrimaryAreaIDs for ${person.Title}`);
           }
           if (!person.UserEmail) {
               console.warn(`Row ${index + 1}: Missing email for ${person.Title}`);
           }
       });
   }
   ```

3. **Case Sensitivity**
   ```javascript
   // Normalize area codes for comparison
   function normalizeAreaCode(code) {
       return code.toUpperCase().trim();
   }
   ```

### Manager Information Not Displaying

**Symptoms:**
- Personnel cards show but no manager info
- Manager section appears blank

**Solutions:**

1. **Manager Data Structure**
   ```javascript
   // Check manager data format
   function validateManagerData(person) {
       if (person.ManagerDisplayName) {
           console.log('Manager found for', person.Title, ':', person.ManagerDisplayName);
       } else {
           console.log('No manager data for', person.Title);
       }
   }
   ```

2. **Image Loading Issues**
   ```javascript
   // Fallback for manager pictures
   function getManagerPicture(manager) {
       const sharePointImg = `/_layouts/15/userphoto.aspx?size=M&accountname=${manager.Email}`;
       const fallbackImg = 'https://via.placeholder.com/32';
       
       return new Promise((resolve) => {
           const img = new Image();
           img.onload = () => resolve(sharePointImg);
           img.onerror = () => resolve(fallbackImg);
           img.src = sharePointImg;
       });
   }
   ```

## 🔄 Power Automate Issues

### Template Generation Failing

**Symptoms:**
- Power Automate flow runs but generates empty HTML
- Placeholders not being replaced
- Generated file missing content

**Solutions:**

1. **Placeholder Syntax Check**
   ```javascript
   // Verify placeholder format in template
   const requiredPlaceholders = [
       '{{SVG_CONTENT}}',
       '{{PERSONNEL_DATA}}',
       '{{TITLE}}'
   ];
   
   // Check if all placeholders exist in template
   requiredPlaceholders.forEach(placeholder => {
       if (!templateContent.includes(placeholder)) {
           console.error('Missing placeholder:', placeholder);
       }
   });
   ```

2. **Data Transformation Issues**
   ```javascript
   // Check personnel data format
   const personnelJSON = JSON.stringify(personnelData);
   if (personnelJSON === '[]' || personnelJSON === 'null') {
       console.error('Personnel data is empty or invalid');
   }
   ```

3. **Power Automate Expression Debugging**
   ```javascript
   // Add to Power Automate flow for debugging
   replace(replace(body('Get_Template'), '{{SVG_CONTENT}}', body('Get_SVG')), '{{PERSONNEL_DATA}}', string(body('Get_Personnel')))
   ```

### Flow Trigger Issues

**Symptoms:**
- Flow doesn't run when Personnel list changes
- Manual flow runs work but automatic doesn't
- Delayed execution

**Solutions:**

1. **Trigger Configuration**
   - Verify "When an item is created or modified" trigger
   - Check if trigger is on correct SharePoint list
   - Ensure flow has proper permissions

2. **List Column Changes**
   - Verify trigger responds to all necessary columns
   - Check if computed columns are causing issues
   - Test with simple field changes first

## 📊 Analytics Issues (Inline System)

### Analytics Not Logging in Generated HTML

**Symptoms:**
- Clicks detected but no analytics captured
- Template has analytics but generated HTML doesn't
- Console shows analytics disabled

**Solutions:**

1. **Template Analytics Placeholder**
   ```javascript
   // Check if {{ANALYTICS_FUNCTION}} is being filled
   function logAreaClick(areaCode, areaName, region) {
       {{ANALYTICS_FUNCTION}}  // Should be replaced with actual code
       
       if (typeof {{ANALYTICS_FUNCTION}} === 'string') {
           console.error('Analytics placeholder not replaced');
       }
   }
   ```

2. **File Write Permissions**
   ```javascript
   // Test CSV write capability
   function testCSVWrite() {
       const testData = 'test,data,write';
       appendToMasterCSV(testData)
           .then(() => console.log('✅ CSV write successful'))
           .catch(error => console.error('❌ CSV write failed:', error));
   }
   ```

3. **Request Digest Issues**
   ```javascript
   // Refresh request digest
   function refreshRequestDigest() {
       const digestElement = document.getElementById('__REQUESTDIGEST');
       if (!digestElement || !digestElement.value) {
           console.error('Request digest not available');
           return false;
       }
       return true;
   }
   ```

### Analytics Dashboard Not Loading

**Symptoms:**
- Dashboard page loads but shows no data
- "Unable to load analytics data" message
- Charts don't render

**Solutions:**

1. **CSV File Validation**
   ```javascript
   // Check CSV file structure
   function validateAnalyticsCSV(csvText) {
       const lines = csvText.split('\n').filter(line => line.trim());
       
       if (lines.length < 2) {
           console.error('Analytics CSV appears empty or has no data rows');
           return false;
       }
       
       const headers = lines[0].split(',');
       const expectedHeaders = ['Timestamp', 'AreaCode', 'AreaName', 'Region'];
       
       const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
       if (missingHeaders.length > 0) {
           console.error('Missing analytics headers:', missingHeaders);
           return false;
       }
       
       return true;
   }
   ```

2. **Chart.js Loading**
   ```javascript
   // Verify Chart.js availability
   if (typeof Chart === 'undefined') {
       console.error('Chart.js not loaded');
       // Load from CDN as fallback
       const script = document.createElement('script');
       script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
       document.head.appendChild(script);
   }
   ```

## 🔐 Permission and Access Issues

### "Access Denied" Errors

**Symptoms:**
- HTTP 403 errors
- "Access denied" messages
- Files not loading

**Solutions:**

1. **Permission Verification**
   ```powershell
   # Check user permissions
   Get-PnPUserEffectivePermissions -Identity "user@domain.com" -List "Documents"
   ```

2. **File-Level Permissions**
   ```powershell
   # Check specific file permissions
   Get-PnPFileVersion -Url "Documents/AreaMap.html"
   ```

3. **Group Membership**
   ```powershell
   # Verify user group membership
   Get-PnPGroupMember -Identity "Site Members"
   ```

### SharePoint Context Issues

**Symptoms:**
- "_spPageContextInfo is not defined" error
- Features work locally but not in SharePoint

**Solutions:**

1. **Context Detection**
   ```javascript
   // Detect environment and adjust behavior
   function detectEnvironment() {
       if (typeof _spPageContextInfo !== 'undefined') {
           return 'sharepoint';
       } else if (window.location.protocol === 'file:') {
           return 'local';
       } else {
           return 'web';
       }
   }
   ```

2. **Graceful Degradation**
   ```javascript
   // Provide fallbacks for missing context
   const config = {
       sharepoint: {
           enableFileWrites: true,
           useRestAPI: true
       },
       local: {
           enableFileWrites: false,
           useRestAPI: false
       }
   };
   ```

## 📱 Mobile and Browser Issues

### Mobile Display Problems

**Symptoms:**
- Map not responsive on mobile
- Touch events not working
- Modal doesn't display properly

**Solutions:**

1. **Viewport Configuration**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
   ```

2. **Touch Event Handling**
   ```javascript
   // Add touch support
   element.addEventListener('touchstart', handleTouch, { passive: false });
   element.addEventListener('click', handleClick);
   
   function handleTouch(event) {
       event.preventDefault(); // Prevent double-tap zoom
       handleClick(event);
   }
   ```

3. **Responsive CSS**
   ```css
   @media (max-width: 768px) {
       .modal-overlay {
           width: 95vw;
           max-height: 90vh;
           overflow-y: auto;
       }
   }
   ```

### Browser Compatibility

**Symptoms:**
- Features work in some browsers but not others
- JavaScript errors in older browsers

**Solutions:**

1. **Feature Detection**
   ```javascript
   // Check for required features
   const features = {
       fetch: typeof fetch !== 'undefined',
       localStorage: typeof localStorage !== 'undefined',
       querySelector: typeof document.querySelector !== 'undefined'
   };
   
   const unsupported = Object.keys(features).filter(key => !features[key]);
   if (unsupported.length > 0) {
       console.warn('Unsupported features:', unsupported);
   }
   ```

2. **Polyfills**
   ```javascript
   // Fetch polyfill for older browsers
   if (!window.fetch) {
       const script = document.createElement('script');
       script.src = 'https://polyfill.io/v3/polyfill.min.js?features=fetch';
       document.head.appendChild(script);
   }
   ```

## 🔧 Performance Issues

### Slow Loading

**Symptoms:**
- Long delays before map appears
- Sluggish click responses
- Memory usage warnings

**Solutions:**

1. **File Size Optimization**
   ```bash
   # Compress SVG file
   svgo Artboard\ 1.svg -o Artboard\ 1.optimized.svg
   ```

2. **Data Loading Optimization**
   ```javascript
   // Lazy load personnel data
   let personnelData = null;
   
   function getPersonnelData() {
       if (!personnelData) {
           return loadPersonnelData().then(data => {
               personnelData = data;
               return data;
           });
       }
       return Promise.resolve(personnelData);
   }
   ```

3. **Memory Management**
   ```javascript
   // Clean up chart instances
   function destroyCharts() {
       Object.values(chartInstances).forEach(chart => {
           if (chart && typeof chart.destroy === 'function') {
               chart.destroy();
           }
       });
       chartInstances = {};
   }
   ```

## 🔍 Debugging Tools

### Console Debugging

```javascript
// Enable debug mode
window.DEBUG_MODE = true;

function debugLog(message, data = null) {
    if (window.DEBUG_MODE) {
        console.log(`[AreaMap Debug] ${message}`, data);
    }
}

// Track function performance
function timeFunction(name, fn) {
    return function(...args) {
        console.time(name);
        const result = fn.apply(this, args);
        console.timeEnd(name);
        return result;
    };
}
```

### Network Debugging

```javascript
// Monitor network requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
    console.log('Fetch request:', args[0]);
    return originalFetch.apply(this, args)
        .then(response => {
            console.log('Fetch response:', response.status, args[0]);
            return response;
        });
};
```

### Error Reporting

```javascript
// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

// Promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});
```

## 📞 Getting Help

### Internal Troubleshooting Steps

1. **Check Browser Console** - Look for JavaScript errors
2. **Verify File Paths** - Ensure all files are in correct location
3. **Test Individual Components** - Isolate the problem area
4. **Check Permissions** - Verify user has necessary access
5. **Clear Browser Cache** - Force reload of all resources

### Escalation Checklist

When contacting support, provide:
- [ ] Browser and version information
- [ ] SharePoint version and environment
- [ ] Complete error messages from console
- [ ] Steps to reproduce the issue
- [ ] Screenshots of the problem
- [ ] Network tab information (if applicable)

---

*This troubleshooting guide covers the most common issues encountered with the SharePoint Interactive Area Map system and provides systematic approaches to resolution.*