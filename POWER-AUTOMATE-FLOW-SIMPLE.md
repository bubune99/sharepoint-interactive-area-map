# Simple Power Automate Flow with Error Handling

## 1. Trigger
- When an item is created or modified in "CAE List"

## 2. Initialize Variables
```
Action: Initialize variable
Name: "errorCount"
Type: Integer
Value: 0
```

## 3. Get Items with Error Handling
```
Action: Get items
List: "CAE List"

↓ If Get Items Failed:
    → Increment errorCount
    → Send notification (optional)
    → Terminate flow with error message
```

## 4. Check Data Quality
```
Condition: length(body('Get_items')?['value']) is greater than 0

If true:
    → Continue to next step
If false:
    → Increment errorCount
    → Log warning: "No items found in CAE List"
    → Continue with empty data array
```

## 5. Get HTML Template
```
Action: Get file content
File: /SiteAssets/AreaMap/AreaMap.html

↓ If Get Template Failed:
    → Increment errorCount
    → Send notification (optional)
    → Use backup template (optional)
```

## 6. Update HTML File
```
Action: Update file
File: /SiteAssets/AreaMap/AreaMap-Generated.html
Content: Replace placeholders with data

↓ If Update Failed:
    → Increment errorCount
    → Send notification
    → Keep previous version
```

## 7. Final Status Check
```
Condition: errorCount equals 0

If true:
    → Log success message
If false:
    → Send error summary notification
```

## Required Fields Check
The flow will handle these scenarios:

1. **Missing User Info**
   - Uses display name as fallback
   - Shows "Not specified" for empty fields

2. **Missing Manager**
   - Skips manager section if not assigned
   - Shows default placeholder image

3. **Missing Areas**
   - Uses empty arrays for missing area assignments
   - Shows "No areas assigned" message

4. **Invalid Data**
   - Logs errors to console
   - Shows error state in UI
   - Continues processing other items
