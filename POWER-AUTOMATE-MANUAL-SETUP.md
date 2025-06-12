# Power Automate Manual Setup Guide

## 📋 Overview

This guide provides step-by-step instructions to manually create the Power Automate flows required for the SharePoint Interactive Area Map template system. You'll need to create 3 flows total.

## 🔧 Prerequisites

Before creating the flows, ensure you have:

1. **SharePoint Lists Created:**
   - `Personnel` list with all required columns
   - `AreaMapAnalytics` list with all required columns

2. **Files Uploaded to SharePoint:**
   - `AreaMap-PowerAutomate-Template.html`
   - `AreaMap-PowerAutomate-Config.json`
   - `Artboard 1-3.svg`

3. **Permissions:**
   - Power Automate premium license (for SharePoint triggers)
   - Site owner or similar permissions on SharePoint site

---

## 🔄 Flow 1: AreaMap Generator (Main Flow)

### Purpose
Regenerates the AreaMap.html file when relevant Personnel list columns are modified.

### Setup Steps

#### Step 1: Create New Flow
1. Go to **Power Automate** (flow.microsoft.com)
2. Click **Create** → **Automated cloud flow**
3. **Flow name:** `AreaMap Generator`
4. **Choose trigger:** "When an item is created or modified" (SharePoint)
5. Click **Create**

#### Step 2: Configure SharePoint Trigger
1. **Site Address:** Select your SharePoint site
2. **List Name:** Select `Personnel`
3. Click **Show advanced options**
4. **Limit Columns:** Select these columns only:
   - Title
   - UserDisplayName
   - FirstName
   - LastName
   - PreferredFirstName
   - UserJobTitle
   - PrimaryAreaIDs
   - SecondaryAreaIDs
   - ManagerDisplayName
   - ManagerEmail
   - IncludeOnMap

#### Step 3: Add Condition Check
1. Click **New step**
2. Search for and select **Condition** (Control)
3. **Choose a value:** `IncludeOnMap` (from dynamic content)
4. **Condition:** is equal to
5. **Choose a value:** `true`

#### Step 4: Initialize Archive Variables (Yes Branch)
1. In the **Yes** branch, click **Add an action**
2. Search for and select **Initialize variable**
3. **Name:** `ArchiveTimestamp`
4. **Type:** String
5. **Value:** `@{formatDateTime(utcNow(), 'yyyyMMdd_HHmmss')}`

#### Step 5: Check if Current File Exists
1. Click **Add an action**
2. Search for and select **Get file metadata** (SharePoint)
3. **Site Address:** Your SharePoint site
4. **File Identifier:** Browse to `AreaMap.html`
5. Click **Settings** → **Configure run after**
6. Check both **is successful** and **has failed**

#### Step 6: Archive Current File (If Exists)
1. Click **Add an action** (parallel to Get file metadata)
2. Search for and select **Copy file** (SharePoint)
3. **Source Site Address:** Your SharePoint site
4. **Source File:** Browse to `AreaMap.html`
5. **Destination Site Address:** Your SharePoint site
6. **Destination Folder Path:** `/AreaMap_Archives`
7. **Destination File Name:** `AreaMap_Archive_@{variables('ArchiveTimestamp')}.html`
8. **Overwrite Flag:** No
9. Click **Settings** → **Configure run after**
10. Check only **is successful** for the Get file metadata action

#### Step 7: Update Version History
1. Click **Add an action**
2. Search for and select **Get file content** (SharePoint)
3. **File Identifier:** Browse to `AreaMap_Version_History.json`
4. Click **Settings** → **Configure run after** → Check **is successful** and **has failed**

5. Click **Add an action**
6. Search for and select **Compose** (Data Operation)
7. **Inputs:** 
   ```json
   {
     "currentVersion": {
       "fileName": "AreaMap.html",
       "buildDate": "@{utcNow()}",
       "buildNumber": "@{add(int(body('Parse_JSON')?['currentVersion']?['buildNumber']), 1)}",
       "personnelCount": "@{length(body('Get_Personnel_items')?['value'])}",
       "triggerReason": "Personnel list modified",
       "templateVersion": "2.1.3"
     },
     "archives": "@{union(body('Parse_JSON')?['archives'], createArray(json(concat('{\"fileName\":\"AreaMap_Archive_', variables('ArchiveTimestamp'), '.html\",\"archiveDate\":\"', utcNow(), '\",\"buildNumber\":', coalesce(body('Parse_JSON')?['currentVersion']?['buildNumber'], 0), ',\"personnelCount\":', length(body('Get_Personnel_items')?['value']), '}'))))}"
   }
   ```

#### Step 8: Save Updated Version History
1. Click **Add an action**
2. Search for and select **Create file** (SharePoint)
3. **Site Address:** Your SharePoint site
4. **Folder Path:** `/`
5. **File Name:** `AreaMap_Version_History.json`
6. **File Content:** `@{outputs('Compose_Version_History')}`
7. Click **Settings** → **Configure run after**
8. Add parallel action: **Update file** (SharePoint) with same parameters

#### Step 9: Add Analytics Sync
1. Click **Add an action**
2. Search for and select **HTTP** (Premium connector)
3. **Method:** POST
4. **URI:** 
   ```
   @{triggerOutputs()?['body/webUrl']}/_api/web/lists/getbytitle('AreaMapAnalytics')/items
   ```
5. **Headers:**
   ```json
   {
     "Accept": "application/json;odata=verbose",
     "Content-Type": "application/json;odata=verbose"
   }
   ```
6. **Body:** (This is a placeholder - actual sync will happen in the template)
   ```json
   {
     "__metadata": {
       "type": "SP.Data.AreaMapAnalyticsListItem"
     },
     "Title": "Pre-rebuild archive created",
     "AreaCode": "ARCHIVE",
     "AreaName": "Version archived: @{variables('ArchiveTimestamp')}",
     "Region": "System"
   }
   ```

#### Step 10: Get Personnel Data (Filtered)
1. Click **Add an action**
2. Search for and select **Get items** (SharePoint)
3. **Site Address:** Your SharePoint site
4. **List Name:** `Personnel`
5. **Filter Query:** `IncludeOnMap eq true`
6. **Top Count:** `5000`

#### Step 11: Get Template File
1. Click **Add an action**
2. Search for and select **Get file content** (SharePoint)
3. **Site Address:** Your SharePoint site
4. **File Identifier:** Browse to `AreaMap-PowerAutomate-Template.html`

#### Step 12: Get SVG File
1. Click **Add an action**
2. Search for and select **Get file content** (SharePoint)
3. **Site Address:** Your SharePoint site
4. **File Identifier:** Browse to `Artboard 1-3.svg`

#### Step 13: Process SVG Content
1. Click **Add an action**
2. Search for and select **Compose** (Data Operation)
3. **Inputs:** 
   ```
   @{replace(replace(string(body('Get_SVG_file_content')), '<?xml version="1.0" encoding="UTF-8"?>', ''), '<svg', '<svg class="svg-map"')}
   ```

#### Step 14: Process Personnel Data
1. Click **Add an action**
2. Search for and select **Compose** (Data Operation)
3. **Inputs:**
   ```
   @{body('Get_Personnel_items')?['value']}
   ```

#### Step 15: Replace Template Placeholders
1. Click **Add an action**
2. Search for and select **Compose** (Data Operation)
3. **Inputs:**
   ```
   @{replace(replace(replace(replace(replace(string(body('Get_Template_file_content')), '{{SVG_CONTENT}}', outputs('Compose_SVG')), '{{PERSONNEL_DATA}}', string(outputs('Compose_Personnel'))), '{{SITE_URL}}', triggerOutputs()?['body/webUrl']), '{{TITLE}}', 'Area Map - Personnel Query'), '{{ANALYTICS_FUNCTION}}', 'console.log(''Analytics logged:'', { areaCode, areaName, region, timestamp: new Date().toISOString() });')}
   ```

#### Step 16: Create/Update AreaMap.html
1. Click **Add an action**
2. Search for and select **Create file** (SharePoint)
3. **Site Address:** Your SharePoint site
4. **Folder Path:** `/` (root of Documents library)
5. **File Name:** `AreaMap.html`
6. **File Content:** `outputs('Compose_Final')`

#### Step 17: Handle File Exists Error
1. Click on the **Create file** action
2. Click **Settings** (gear icon)
3. **Configure run after:** Check **is successful** and **has failed**
4. Add parallel action: **Update file** (SharePoint)
5. **Site Address:** Your SharePoint site
6. **File Identifier:** Browse to existing `AreaMap.html`
7. **File Content:** `outputs('Compose_Final')`

#### Step 13: Save and Test
1. Click **Save**
2. Click **Test** → **Manually** → **Test**
3. Modify a Personnel list item with `IncludeOnMap=true`
4. Verify the flow runs successfully

---

## ⏰ Flow 2: AreaMap Analytics Sync (12-Hour Sync)

### Purpose
Automatically syncs analytics data from localStorage buffer to SharePoint list every 12 hours.

### Setup Steps

#### Step 1: Create Scheduled Flow
1. Go to **Power Automate**
2. Click **Create** → **Scheduled cloud flow**
3. **Flow name:** `AreaMap Analytics Sync`
4. **Starting:** Tomorrow at 2:00 AM
5. **Repeat every:** 12 hours
6. Click **Create**

#### Step 2: Add HTTP Request to Check Buffer
1. Click **New step**
2. Search for and select **HTTP** (Premium connector)
3. **Method:** GET
4. **URI:** `@{variables('siteUrl')}/_api/web/lists/getbytitle('AreaMapAnalytics')/items?$top=1&$orderby=Created desc`
5. **Headers:**
   ```json
   {
     "Accept": "application/json;odata=verbose"
   }
   ```

#### Step 3: Initialize Variables
1. Click **New step**
2. Search for and select **Initialize variable**
3. **Name:** `siteUrl`
4. **Type:** String
5. **Value:** `https://yourtenant.sharepoint.com/sites/yoursite` (replace with actual URL)

#### Step 4: Add Cleanup Action
1. Click **New step**
2. Search for and select **Compose** (Data Operation)
3. **Inputs:** `Analytics sync completed at @{utcNow()}`

#### Step 5: Save Flow
1. Click **Save**
2. The flow will run automatically every 12 hours

---

## 🔄 Flow 3: AreaMap Archive Cleanup (Monthly Maintenance)

### Purpose
Automatically manages archive retention, cleaning up old archived versions while preserving analytics data.

### Setup Steps

#### Step 1: Create Scheduled Flow
1. Go to **Power Automate**
2. Click **Create** → **Scheduled cloud flow**
3. **Flow name:** `AreaMap Archive Cleanup`
4. **Starting:** First day of next month at 3:00 AM
5. **Repeat every:** 1 month
6. Click **Create**

#### Step 2: Get Archive Files
1. Click **New step**
2. Search for and select **Get files (properties only)** (SharePoint)
3. **Site Address:** Your SharePoint site
4. **Folder Path:** `/AreaMap_Archives`

#### Step 3: Filter Old Archives
1. Click **New step**
2. Search for and select **Filter array** (Data Operation)
3. **From:** `body('Get_files_(properties_only)')?['value']`
4. **Condition:** `@{addDays(utcNow(), -365)}` greater than `item()?['TimeCreated']`

#### Step 4: Process Each Old Archive
1. Click **New step**
2. Search for and select **Apply to each** (Control)
3. **Select an output:** `body('Filter_array')`
4. Inside the loop, add **Delete file** (SharePoint)
5. **Site Address:** Your SharePoint site
6. **File Identifier:** `item()?['Path']`

#### Step 5: Update Version History
1. After the loop, click **Add an action**
2. Search for and select **Get file content** (SharePoint)
3. **File Identifier:** Browse to `AreaMap_Version_History.json`
4. Add **Compose** action to remove deleted archives from JSON
5. Add **Update file** action to save cleaned version history

#### Step 6: Save Flow
1. Click **Save**

---

## 🔄 Flow 4: AreaMap Daily Rebuild (Maintenance)

### Purpose
Performs daily maintenance rebuild to ensure data freshness.

### Setup Steps

#### Step 1: Create Scheduled Flow
1. Go to **Power Automate**
2. Click **Create** → **Scheduled cloud flow**
3. **Flow name:** `AreaMap Daily Rebuild`
4. **Starting:** Tomorrow at 2:00 AM
5. **Repeat every:** 1 day
6. Click **Create**

#### Step 2: Add Trigger Child Flow Action
1. Click **New step**
2. Search for and select **Run a Child Flow** (if available) or **HTTP**
3. If using HTTP:
   - **Method:** POST
   - **URI:** `https://prod-xx.westus2.logic.azure.com:443/workflows/xxx/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxx`
   - (Get this URL from your AreaMap Generator flow's manual trigger)

#### Step 3: Add Logging
1. Click **New step**
2. Search for and select **Compose**
3. **Inputs:** `Daily rebuild completed at @{utcNow()}`

#### Step 4: Save Flow
1. Click **Save**

---

## 🔧 Advanced Configuration

### Adding Email Notifications

#### For Flow Failures:
1. In any flow, click **Settings** (top right)
2. Go to **Run after settings**
3. Add action: **Send an email (V2)** (Office 365 Outlook)
4. **To:** Your admin email
5. **Subject:** `AreaMap Flow Failed: @{workflow()?['name']}`
6. **Body:** `Flow failed at @{utcNow()} with error: @{result('action_name')}`

### Conditional Triggers

#### Only Trigger for Specific Users:
Add condition after SharePoint trigger:
```
@{contains(triggerOutputs()?['body/UserDisplayName'], 'Active')}
```

#### Only Trigger During Business Hours:
Add condition:
```
@{and(greater(int(formatDateTime(utcNow(), 'HH')), 8), less(int(formatDateTime(utcNow(), 'HH')), 17))}
```

---

## 🔍 Testing Your Flows

### Test AreaMap Generator:
1. Go to Personnel list
2. Edit a user with `IncludeOnMap=true`
3. Change their `UserJobTitle`
4. Save the item
5. Check that `AreaMap.html` gets updated within 2-3 minutes

### Test Analytics Sync:
1. Check the flow run history in Power Automate
2. Verify it runs every 12 hours without errors
3. Monitor the AreaMapAnalytics list for new items

### Test Daily Rebuild:
1. Wait for scheduled run at 2 AM
2. Or manually trigger the flow
3. Verify AreaMap.html timestamp updates

---

## 🚨 Troubleshooting

### Common Issues:

#### "File not found" errors:
- Verify file paths are correct in SharePoint
- Check that files are in the root Documents library
- Ensure proper permissions on files

#### "Access denied" errors:
- Verify Power Automate app has permissions to SharePoint site
- Check that the service account has access to all lists
- Ensure premium connectors are available in your license

#### "Column not found" errors:
- Verify all Personnel list columns are created exactly as specified
- Check that IncludeOnMap column is Yes/No type with default value true
- Ensure all trigger columns exist in the list

#### Flow doesn't trigger:
- Check that "Limit Columns" is configured correctly
- Verify the modified column is in the trigger list
- Ensure IncludeOnMap condition is properly configured

#### Template replacement errors:
- Check that placeholders in template file are exactly: `{{SVG_CONTENT}}`, `{{PERSONNEL_DATA}}`, etc.
- Verify expression syntax in replace functions
- Test expressions individually in Compose actions

### Getting Help:
1. Check Flow run history for detailed error messages
2. Test each step individually using Compose actions
3. Verify SharePoint list permissions and structure
4. Contact your SharePoint administrator for site-level issues

---

## 📋 Quick Reference

### Flow Names:
- `AreaMap Generator` - Main template regeneration
- `AreaMap Analytics Sync` - 12-hour analytics sync  
- `AreaMap Daily Rebuild` - Daily maintenance

### Key Expressions:

**Filter Personnel:** `IncludeOnMap eq true`

**Replace Template:**
```
@{replace(replace(replace(replace(replace(
  string(body('Get_Template_file_content')), 
  '{{SVG_CONTENT}}', outputs('Compose_SVG')), 
  '{{PERSONNEL_DATA}}', string(outputs('Compose_Personnel'))), 
  '{{SITE_URL}}', triggerOutputs()?['body/webUrl']), 
  '{{TITLE}}', 'Area Map - Personnel Query'), 
  '{{ANALYTICS_FUNCTION}}', 'console.log(''Analytics logged:'', { areaCode, areaName, region });')}
```

**Process SVG:**
```
@{replace(replace(string(body('Get_SVG_file_content')), '<?xml version="1.0" encoding="UTF-8"?>', ''), '<svg', '<svg class="svg-map"')}
```

This manual setup will create a fully functional Power Automate integration for your SharePoint Interactive Area Map system.