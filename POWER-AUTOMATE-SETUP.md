# Power Automate Setup Guide for Interactive Area Map

This guide will help you set up the Power Automate flow to automatically populate user details in your AreaPersonnel SharePoint list.

## Importing the Flow

1. **Prepare the Flow Package**:
   - Create a ZIP file containing the `AreaPersonnel-AutoPopulate-Flow.json` file
   - Name the ZIP file `AreaPersonnel-AutoPopulate-Flow.zip`

2. **Import the Flow**:
   - Go to [Power Automate](https://flow.microsoft.com/)
   - Click on "My flows" in the left navigation
   - Click "Import" at the top of the page
   - Upload the `AreaPersonnel-AutoPopulate-Flow.zip` file
   - Follow the import wizard to configure the connections:
     - SharePoint connection: Select or create a connection to your SharePoint site
     - Office 365 Users connection: Select or create a connection to Office 365

3. **Configure the Flow Parameters**:
   - SharePoint Site URL: Enter the URL of your SharePoint site (e.g., `https://yourcompany.sharepoint.com/sites/YourSite`)
   - AreaPersonnel List Name: Enter the name of your SharePoint list (default is "AreaPersonnel")
   - Flow Name: You can keep the default name or change it to something more specific

4. **Complete the Import**:
   - Click "Import" to finalize the process
   - Once imported, the flow will be available in your "My flows" list

## What the Flow Does

This Power Automate flow automatically:

1. Triggers when an item is created or modified in the AreaPersonnel list
2. Checks if the User field contains a valid user
3. Retrieves the user's profile information from Office 365
4. Updates the following fields in the SharePoint list item:
   - FirstName: Set to the user's given name from Office 365
   - LastName: Set to the user's surname from Office 365
   - Email: Set to the user's email address from Office 365
   - PreferredFirstName: Only sets this if it's currently empty, otherwise preserves the existing value

## Testing the Flow

After importing the flow:

1. Create a new item in your AreaPersonnel SharePoint list
2. Select a user in the User field and save the item
3. Wait a few moments for the flow to run
4. Refresh the list item and verify that the FirstName, LastName, and Email fields have been populated

## Customizing the Flow

You can customize the flow to meet your specific requirements:

1. Open the flow in the Power Automate designer
2. Add additional actions to handle other fields
3. Modify the conditions to change when and how fields are updated
4. Add notifications or other integrations as needed

## Troubleshooting

If the flow is not working as expected:

1. Check the flow run history to see if there are any errors
2. Verify that the SharePoint list has all the required fields
3. Ensure that the connections have the necessary permissions
4. Check that the User field in your SharePoint list is configured as a Person field

For additional help, refer to the [Power Automate documentation](https://docs.microsoft.com/en-us/power-automate/).
