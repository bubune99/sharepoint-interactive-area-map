# Power Automate Flow: Area Map Personnel Update

## Flow Overview
This flow automatically updates the Area Map HTML file when changes are made to the CAE List in SharePoint.

## Trigger
- **Name**: When an item is created or modified
- **List**: CAE List
- **Site**: [Your SharePoint Site URL]

## Actions

### 1. Get Items (SharePoint)
```
Action: Get items
Input Parameters:
- Site Address: [Your SharePoint Site]
- List Name: "CAE List"
- Select Fields:
  - Title
  - User/EMail
  - User/FirstName
  - User/LastName
  - PreferredFirstName
  - JobTitle
  - Manager/Title
  - Manager/EMail
  - PrimaryAreaIDs
  - SecondaryAreaIDs
- Expand: User, Manager
```

### 2. Initialize Variables
```
Action: Initialize variable
Name: "htmlContent"
Type: String
Value: Empty
```

### 3. Get HTML Template
```
Action: Get file content
Input Parameters:
- Site Address: [Your SharePoint Site]
- File Path: /SiteAssets/AreaMap/AreaMap.html
```

### 4. Process Template
```
Action: Set variable
Name: "htmlContent"
Value: outputs('Get_file_content')?['$content']
```

### 5. Replace Data Placeholders
```
Action: Set variable
Name: "htmlContent"
Value: replace(
    replace(
        replace(
            variables('htmlContent'),
            '{{PERSONNEL_DATA}}',
            string(body('Get_items')?['value'])
        ),
        '{{LAST_UPDATED}}',
        utcNow()
    ),
    '{{TOTAL_PERSONNEL}}',
    string(length(body('Get_items')?['value']))
)
```

### 6. Update HTML File
```
Action: Update file
Input Parameters:
- Site Address: [Your SharePoint Site]
- File Path: /SiteAssets/AreaMap/AreaMap-Generated.html
- File Content: variables('htmlContent')
```

## Error Handling

### 7. Add Condition for File Update
```
Condition: length(body('Get_items')?['value']) is greater than 0
If true:
    → Proceed with file update
If false:
    → Create notification (optional)
    → Log error (optional)
```

## Flow Configuration

### Required Connections
1. SharePoint
   - Permission: Read and write all items
   - Lists: CAE List
   - Libraries: SiteAssets

### Environment Variables
```
- Site URL: [Your SharePoint Site URL]
- List Name: "CAE List"
- Template Path: "/SiteAssets/AreaMap/AreaMap.html"
- Output Path: "/SiteAssets/AreaMap/AreaMap-Generated.html"
```

## SharePoint List Requirements

### CAE List Columns
1. **Title** (Single line of text)
   - Required: Yes
   - Default: None

2. **User** (Person or Group)
   - Required: Yes
   - Allow multiple: No
   - Show field: Name with presence

3. **PreferredFirstName** (Single line of text)
   - Required: No
   - Default: None

4. **JobTitle** (Single line of text)
   - Required: No
   - Default: None

5. **Manager** (Person or Group)
   - Required: No
   - Allow multiple: No
   - Show field: Name with presence

6. **PrimaryAreaIDs** (Choice)
   - Required: No
   - Allow multiple: Yes
   - Choices: [Your area IDs]

7. **SecondaryAreaIDs** (Choice)
   - Required: No
   - Allow multiple: Yes
   - Choices: [Your area IDs]

## Testing the Flow

### Test Cases
1. Create new item in CAE List
   - Expected: HTML file updates with new data
   - Check: Profile picture URLs are correct

2. Modify existing item
   - Expected: HTML file updates with modified data
   - Check: All placeholders are replaced

3. Multiple simultaneous updates
   - Expected: All changes are reflected
   - Check: No data corruption

### Monitoring
- Check Flow run history
- Verify HTML file updates
- Monitor error logs

## Troubleshooting

### Common Issues
1. **File Access Errors**
   - Check SharePoint permissions
   - Verify file paths

2. **Data Format Issues**
   - Verify JSON structure
   - Check for special characters

3. **Performance Issues**
   - Monitor flow run time
   - Check data volume

### Debug Steps
1. Enable flow diagnostics
2. Check run history
3. Verify SharePoint permissions
4. Test file paths manually

## Maintenance

### Regular Tasks
1. Monitor flow runs
2. Check error logs
3. Verify SharePoint permissions
4. Update area IDs as needed

### Updates
1. Review flow monthly
2. Update connections if needed
3. Verify SharePoint list structure
4. Test with sample data
