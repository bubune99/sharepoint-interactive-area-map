import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/fields';

export interface IPersonnelData {
    User: string;              // People Picker
    FirstName: string;
    LastName: string;
    PreferredFirstName?: string;
    Email: string;
    ProfilePicture?: string;
    PrimaryAreaIDs: string[];  // Multi-value
    SecondaryAreaIDs?: string[]; // Multi-value
    Manager: string;           // People Picker
    Region: string;           // Choice: East, Central, West, All (Inside)
    JobTitle: string;
    Notes?: string;
    LastUpdated?: string;
    PELicense: boolean;
    IncludeOnMap: boolean;
}

export async function ensurePersonnelList(): Promise<void> {
    const listName = "CAE Personnel";
    
    try {
        // Check if list exists
        const lists = await sp.web.lists.select('Title').filter(`Title eq '${listName}'`).get();
        
        if (lists.length === 0) {
            // Create list
            const listAdd = await sp.web.lists.add(listName, "CAE Personnel Directory", 100, false);
            
            // Add custom fields
            await listAdd.list.fields.addUser("User", { Required: true });
            await listAdd.list.fields.addText("FirstName", 100);
            await listAdd.list.fields.addText("LastName", 100);
            await listAdd.list.fields.addText("PreferredFirstName", 100);
            await listAdd.list.fields.addText("Email", 255, { Required: true });
            await listAdd.list.fields.addUrl("ProfilePicture");
            
            // Multi-value text fields for area IDs
            await listAdd.list.fields.addMultilineText("PrimaryAreaIDs", 6, true, false, false, false);
            await listAdd.list.fields.addMultilineText("SecondaryAreaIDs", 6, true, false, false, false);
            
            await listAdd.list.fields.addUser("Manager", { Required: true });
            
            // Choice field for Region
            await listAdd.list.fields.addChoice("Region", [
                "East",
                "Central",
                "West",
                "All (Inside)"
            ], 0);
            
            await listAdd.list.fields.addText("JobTitle", 100, { Required: true });
            await listAdd.list.fields.addMultilineText("Notes", 6, false, false, false, false);
            await listAdd.list.fields.addDateTime("LastUpdated");
            await listAdd.list.fields.addBoolean("PELicense");
            await listAdd.list.fields.addBoolean("IncludeOnMap", { Required: true });
            
            console.log('Personnel list schema created successfully');
        }
    } catch (error) {
        console.error('Error ensuring personnel list:', error);
        throw error;
    }
}
