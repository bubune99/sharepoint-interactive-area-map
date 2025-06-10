# Power Automate Flow: Update Personnel CSV

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

## 3. Create CSV Content
```
Action: Initialize variable
Name: "csvContent"
Type: String
Value: "Title,UserEmail,UserDisplayName,FirstName,LastName,PreferredFirstName,UserDepartment,UserJobTitle,PrimaryAreaIDs,SecondaryAreaIDs,ManagerDisplayName,ManagerEmail,ManagerDepartment,ManagerJobTitle\n"
```

## 4. Add Data Rows
```
Action: Apply to each
Input: body('Get_items')?['value']
Actions inside loop:
    Append to string variable
    Name: "csvContent"
    Value: concat(
        items('Apply_to_each')?['Title'], ',',
        items('Apply_to_each')?['UserEmail'], ',',
        items('Apply_to_each')?['UserDisplayName'], ',',
        items('Apply_to_each')?['FirstName'], ',',
        items('Apply_to_each')?['LastName'], ',',
        items('Apply_to_each')?['PreferredFirstName'], ',',
        items('Apply_to_each')?['UserDepartment'], ',',
        items('Apply_to_each')?['UserJobTitle'], ',',
        replace(join(items('Apply_to_each')?['PrimaryAreaIDs'], ';'), ',', ''), ',',
        replace(join(items('Apply_to_each')?['SecondaryAreaIDs'], ';'), ',', ''), ',',
        items('Apply_to_each')?['ManagerDisplayName'], ',',
        items('Apply_to_each')?['ManagerEmail'], ',',
        items('Apply_to_each')?['ManagerDepartment'], ',',
        items('Apply_to_each')?['ManagerJobTitle'], '\n'
    )
```

## 5. Update CSV File
```
Action: Create file
Site Address: [Your SharePoint Site]
Folder Path: /SiteAssets/AreaMap
File Name: personnel_data.csv
File Content: variables('csvContent')
```

## Benefits of this Approach:
1. Simpler HTML code
2. Easier to debug data issues
3. Can view/edit data directly in Excel
4. Better performance (smaller file size)
5. Cleaner separation of data and presentation

## CSV Format Example:
```csv
Title,UserEmail,UserDisplayName,FirstName,LastName,PreferredFirstName,UserDepartment,UserJobTitle,PrimaryAreaIDs,SecondaryAreaIDs,ManagerDisplayName,ManagerEmail,ManagerDepartment,ManagerJobTitle
John Doe,john.doe@company.com,John Doe,John,Doe,Johnny,Sales,Sales Rep,A1;A2,B1;B2,Jane Smith,jane.smith@company.com,Sales,Sales Manager
```
