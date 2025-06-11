# Area Map Analytics Documentation

## Overview

The Area Map application includes a comprehensive analytics tracking system that monitors user interactions to provide insights into how users engage with the map over time. This system tracks hovers, clicks, and queries to help understand usage patterns and popular areas.

## Features Tracked

### 1. Area Hovers
- **What it tracks**: Every time a user hovers over an area on the map
- **Data captured**: Area code, area name, and frequency count
- **Purpose**: Understand which areas users are most interested in browsing

### 2. Area Clicks
- **What it tracks**: Every time a user clicks on an area on the map
- **Data captured**: Area code, area name, and frequency count
- **Purpose**: Identify which areas users actively investigate for personnel details

### 3. Query Executions
- **What it tracks**: Every search performed using the query interface
- **Data captured**: 
  - Region selected
  - Specific area selected (if any)
  - Coverage type filter (all, primary, secondary)
  - Total query count
- **Purpose**: Understand search patterns and user preferences

### 4. Session Information
- **What it tracks**: User session metadata
- **Data captured**:
  - Unique session ID
  - Session start time
  - User agent string
  - Page URL
  - Total number of sessions
- **Purpose**: Track unique visits and understand usage frequency

## How to Access Analytics

### In the Application
1. **Analytics Button**: Click the "📊 Analytics" button in the query controls section
2. **Quick View**: The analytics panel shows:
   - Total hovers, clicks, and queries (visual counters)
   - Top 3 most clicked areas
   - Current session information
3. **Detailed View**: Click "View Details" for a comprehensive breakdown
4. **Export Data**: Click "Export Data" to download a JSON file with all analytics

### Analytics Panel Controls
- **Export Data**: Downloads a timestamped JSON file with all analytics data
- **View Details**: Shows detailed analytics in a popup and logs to browser console
- **Clear Data**: Removes all stored analytics data (requires confirmation)
- **Close**: Hides the analytics panel

## Data Storage

### Local Storage
- Analytics data is stored in the browser's localStorage
- Key: `areaMapAnalytics`
- Persists between browser sessions
- Automatically cleared if user clears browser data

### Data Structure
```json
{
  "sessionInfo": {
    "sessionId": "session_1234567890_abc123",
    "startTime": "2024-01-15T10:30:00.000Z",
    "totalSessions": 5
  },
  "interactions": {
    "totalHovers": 25,
    "totalClicks": 12,
    "totalQueries": 8,
    "mostHoveredAreas": [
      {"area": "New York", "count": 5},
      {"area": "Chicago", "count": 4}
    ],
    "mostClickedAreas": [
      {"area": "New York", "count": 3},
      {"area": "Los Angeles", "count": 2}
    ],
    "popularRegions": {
      "East": 5,
      "Central": 2,
      "West": 1
    },
    "coverageTypePreferences": {
      "all": 6,
      "primary": 1,
      "secondary": 1
    }
  },
  "rawData": {
    "areaHovers": {"A04_New York": 5, "B01_Chicago": 4},
    "areaClicks": {"A04_New York": 3, "C07_Los Angeles": 2},
    "queries": {...},
    "sessions": [...]
  }
}
```

## Implementation Details

### Analytics Object
The `analytics` global object provides all tracking functionality:

```javascript
analytics.trackHover(areaCode, areaName)     // Track area hover
analytics.trackClick(areaCode, areaName)     // Track area click
analytics.trackQuery(region, area, coverage) // Track query execution
analytics.getSummary()                       // Get analytics summary
analytics.exportData()                       // Export data as JSON
analytics.clearData()                        // Clear all data
```

### Automatic Tracking
- **Hovers**: Triggered when mouse enters area SVG paths
- **Clicks**: Triggered when area SVG paths are clicked
- **Queries**: Triggered when search is performed (manual or via area click)

### Session Management
- Each page load generates a unique session ID
- Session data includes timestamp and browser information
- Sessions are stored in the analytics data for historical tracking

## Privacy and Security

### Data Privacy
- All data is stored locally in the user's browser
- No data is transmitted to external servers
- Data can be cleared by the user at any time
- Data is automatically cleared if user clears browser data

### Data Anonymization
- No personally identifiable information is collected
- Only interaction patterns and session metadata are stored
- User names, emails, or other personal data are not tracked

## Use Cases and Benefits

### For Administrators
1. **Popular Areas**: Identify which geographical areas are most viewed/searched
2. **User Behavior**: Understand how users navigate and search the map
3. **Feature Usage**: See which search filters are most commonly used
4. **Engagement Metrics**: Track overall application usage over time

### For Content Management
1. **Data Prioritization**: Focus data quality efforts on popular areas
2. **User Experience**: Optimize frequently accessed areas
3. **Training**: Understand what information users seek most

### For Decision Making
1. **Resource Allocation**: Allocate personnel or resources based on area interest
2. **System Optimization**: Improve performance for high-traffic areas
3. **Feature Development**: Enhance features based on usage patterns

## Troubleshooting

### Common Issues

**Analytics not tracking:**
- Check browser console for JavaScript errors
- Ensure localStorage is enabled in browser
- Verify analytics.init() is called on page load

**Data not persisting:**
- Check if browser is in private/incognito mode
- Verify localStorage quota is not exceeded
- Ensure browser allows localStorage for this domain

**Analytics panel not showing:**
- Check that analytics button event handlers are properly attached
- Verify HTML elements exist (analytics-panel, analytics-button, etc.)
- Check browser console for DOM errors

### Console Commands

For developers and administrators, analytics can be accessed via browser console:

```javascript
// View current analytics summary
analytics.getSummary()

// Export data programmatically
analytics.exportData()

// Clear data programmatically
analytics.clearData()

// View raw event data
analytics.events

// Track custom events (for testing)
analytics.trackHover('A01', 'Baltimore Coast')
analytics.trackClick('B01', 'Chicago')
analytics.trackQuery('East', 'New York', 'primary')
```

## Future Enhancements

### Potential Improvements
1. **Server-side Storage**: Aggregate data across all users
2. **Advanced Analytics**: Heat maps, time-based analysis, user journeys
3. **Dashboard Integration**: SharePoint dashboard widgets
4. **Automated Reporting**: Scheduled analytics exports
5. **Real-time Monitoring**: Live usage statistics
6. **Performance Metrics**: Page load times, response times
7. **A/B Testing**: Track different interface versions

### Integration Opportunities
- **Power BI**: Export data for advanced visualization
- **SharePoint Lists**: Store aggregated analytics data
- **Microsoft Graph**: Integrate with organizational analytics
- **Power Automate**: Automated data processing and alerts

## Technical Requirements

### Browser Support
- Modern browsers supporting localStorage (IE11+, Chrome, Firefox, Safari, Edge)
- JavaScript must be enabled
- LocalStorage must be enabled and available

### Dependencies
- No external libraries required
- Pure JavaScript implementation
- Compatible with existing SharePoint integration

### Performance Impact
- Minimal overhead (< 1KB memory per tracked event)
- Asynchronous operations to avoid blocking UI
- Automatic cleanup of old session data (configurable)

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Compatibility**: AreaMap.html v2.0+