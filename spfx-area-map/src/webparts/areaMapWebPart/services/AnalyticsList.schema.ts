import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/fields';

export interface IAnalyticsListSchema {
    Title: string;
    EventType: string;
    UserID: string;
    UserEmail: string;
    AreaCode: string;
    AreaName: string;
    Region: string;
    SearchTerm: string;
    FilterType: string;
    FilterValue: string;
    PersonnelViewed: string;
    SessionID: string;
    Timestamp: string;
}

export async function ensureAnalyticsList(): Promise<void> {
    const listName = "AreaMapAnalytics";
    
    try {
        // Check if list exists
        const lists = await sp.web.lists.select('Title').filter(`Title eq '${listName}'`).get();
        
        if (lists.length === 0) {
            // Create list
            const listAdd = await sp.web.lists.add(listName, "Analytics tracking for Area Map interactions", 100, false);
            
            // Add custom fields
            await listAdd.list.fields.addText("EventType", 50, { Required: true });
            await listAdd.list.fields.addText("UserID", 255, { Required: true });
            await listAdd.list.fields.addText("UserEmail", 255, { Required: true });
            await listAdd.list.fields.addText("AreaCode", 50);
            await listAdd.list.fields.addText("AreaName", 100);
            await listAdd.list.fields.addText("Region", 50);
            await listAdd.list.fields.addText("SearchTerm", 255);
            await listAdd.list.fields.addText("FilterType", 50);
            await listAdd.list.fields.addText("FilterValue", 100);
            await listAdd.list.fields.addText("PersonnelViewed", 255);
            await listAdd.list.fields.addText("SessionID", 50, { Required: true });
            await listAdd.list.fields.addDateTime("Timestamp", { Required: true });

            // Set permissions
            await listAdd.list.breakRoleInheritance(false);
            
            // Only site admins and specified users can view analytics
            const analyticsGroup = await sp.web.associatedVisitorGroup();
            await listAdd.list.roleAssignments.remove(analyticsGroup.Id);
        }
        
        console.log('Analytics list schema verified/created successfully');
    } catch (error) {
        console.error('Error ensuring analytics list:', error);
        throw error;
    }
}
