import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';

export interface IAnalyticsEvent {
    timestamp: string;
    userId: string;
    userEmail: string;
    eventType: 'map_click' | 'search' | 'personnel_view' | 'filter_change';
    areaCode?: string;
    areaName?: string;
    region?: string;
    searchTerm?: string;
    filterType?: string;
    filterValue?: string;
    personnelViewed?: string;
    sessionId: string;
}

export class AnalyticsService {
    private readonly listName: string = "AreaMapAnalytics";
    private readonly csvFileName: string = "area-map-analytics.csv";
    private readonly sessionId: string;

    constructor() {
        this.sessionId = `session_${new Date().getTime()}`;
    }

    /**
     * Log an interaction event to the analytics list
     */
    public async logInteraction(event: IAnalyticsEvent): Promise<void> {
        try {
            const list = sp.web.lists.getByTitle(this.listName);
            await list.items.add({
                Title: `${event.eventType}_${new Date().toISOString()}`,
                EventType: event.eventType,
                UserID: event.userId,
                UserEmail: event.userEmail,
                AreaCode: event.areaCode || '',
                AreaName: event.areaName || '',
                Region: event.region || '',
                SearchTerm: event.searchTerm || '',
                FilterType: event.filterType || '',
                FilterValue: event.filterValue || '',
                PersonnelViewed: event.personnelViewed || '',
                SessionID: event.sessionId,
                Timestamp: new Date()
            });
        } catch (error) {
            console.error('Analytics logging failed:', error);
        }
    }

    /**
     * Export analytics data to CSV within a date range
     */
    public async exportToCSV(startDate: Date, endDate: Date): Promise<string> {
        try {
            // Query analytics within date range
            const items = await sp.web.lists
                .getByTitle(this.listName)
                .items
                .filter(`Timestamp ge '${startDate.toISOString()}' and Timestamp le '${endDate.toISOString()}'`)
                .get();

            // Convert to CSV format
            const headers = [
                'Timestamp',
                'UserEmail',
                'EventType',
                'AreaCode',
                'AreaName',
                'Region',
                'SearchTerm',
                'FilterType',
                'FilterValue',
                'PersonnelViewed',
                'SessionID'
            ];
            const csvRows = [headers];

            items.forEach(item => {
                csvRows.push([
                    item.Timestamp,
                    item.UserEmail,
                    item.EventType,
                    item.AreaCode,
                    item.AreaName,
                    item.Region,
                    item.SearchTerm,
                    item.FilterType,
                    item.FilterValue,
                    item.PersonnelViewed,
                    item.SessionID
                ]);
            });

            // Generate CSV content
            const csvContent = csvRows.map(row => row.join(',')).join('\n');
            
            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${this.csvFileName}_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            
            return csvContent;
        } catch (error) {
            console.error('CSV export failed:', error);
            throw error;
        }
    }

    /**
     * Get the current session ID
     */
    public getSessionId(): string {
        return this.sessionId;
    }
}
