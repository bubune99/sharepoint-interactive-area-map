# Simple Power Automate Flow: Update CSV

## 1. Trigger
When an item is created or modified in "CAE List"

## 2. Get All Items
```
Action: Get items
List: "CAE List"
Advanced Options:
☑ Filter Query: (leave empty)
☑ Order By: Title asc
```

## 3. Update File
```
Action: Update file content
Input Parameters:
- Site Address: [Your SharePoint Site]
- File Path: /SiteAssets/AreaMap/personnel_data.csv
- Content: body('Get_items')?['value']
```

That's it! The flow is much simpler because:
1. The CSV already exists with correct headers
2. SharePoint will handle the file update
3. No need to parse or format data

## Setup Steps:
1. Upload `personnel_data.csv` to `/SiteAssets/AreaMap/` in SharePoint
2. Create the flow with just these three steps
3. Test by modifying an item in the CAE List

## Benefits:
- Much simpler flow
- Less chance of errors
- Faster execution
- Easier to maintain
