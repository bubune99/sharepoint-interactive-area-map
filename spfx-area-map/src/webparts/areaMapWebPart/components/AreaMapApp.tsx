import * as React from 'react';
import { useState, useEffect } from 'react';
import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { AreaMap } from './AreaMap/AreaMap';
import { PersonnelModal } from './PersonnelModal/PersonnelModal';
import { SearchControls } from './SearchControls/SearchControls';
import { IPersonnelData } from '../services/PersonnelList.schema';
import { AnalyticsService } from '../services/AnalyticsService';
import styles from './AreaMapApp.module.scss';

export interface IAreaMapAppProps {
  listName: string;
  analyticsService: AnalyticsService;
  enableAnalytics: boolean;
}

export const AreaMapApp: React.FC<IAreaMapAppProps> = ({
  listName,
  analyticsService,
  enableAnalytics
}) => {
  const [personnel, setPersonnel] = useState<IPersonnelData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalSubtitle, setModalSubtitle] = useState<string>('');
  const [filteredPersonnel, setFilteredPersonnel] = useState<IPersonnelData[]>([]);

  // Load personnel data
  useEffect(() => {
    const loadPersonnel = async () => {
      try {
        setLoading(true);
        
        // Get personnel from SharePoint list
        const items = await sp.web.lists.getByTitle(listName).items.getAll();
        
        // Transform to our data model
        const personnelData: IPersonnelData[] = items.map(item => ({
          User: item.User,
          FirstName: item.FirstName,
          LastName: item.LastName,
          PreferredFirstName: item.PreferredFirstName,
          Email: item.Email,
          ProfilePicture: item.ProfilePicture?.Url,
          // Parse JSON strings for area IDs
          PrimaryAreaIDs: item.PrimaryAreaIDs ? JSON.parse(item.PrimaryAreaIDs) : [],
          SecondaryAreaIDs: item.SecondaryAreaIDs ? JSON.parse(item.SecondaryAreaIDs) : [],
          Manager: item.Manager,
          Region: item.Region,
          JobTitle: item.JobTitle,
          Notes: item.Notes,
          LastUpdated: item.LastUpdated,
          PELicense: item.PELicense,
          IncludeOnMap: item.IncludeOnMap
        }));
        
        // Filter out personnel not included on map
        const filteredData = personnelData.filter(person => person.IncludeOnMap);
        
        setPersonnel(filteredData);
        setError(null);
      } catch (err) {
        console.error('Error loading personnel data:', err);
        setError('Failed to load personnel data. Please check your list configuration.');
      } finally {
        setLoading(false);
      }
    };

    loadPersonnel();
  }, [listName]);

  // Handle area click
  const handleAreaClick = (areaCode: string, areaName: string, region: string) => {
    setSelectedArea(areaCode);
    
    // Log analytics if enabled
    if (enableAnalytics) {
      analyticsService.logInteraction({
        timestamp: new Date().toISOString(),
        userId: '',  // Will be populated in the service
        userEmail: '',  // Will be populated in the service
        eventType: 'map_click',
        areaCode,
        areaName,
        region,
        sessionId: analyticsService.getSessionId()
      });
    }
    
    // Find matching personnel
    const results = findMatchingPersonnel(region, areaName, 'all');
    
    // Show in modal
    showPersonnelModal(areaName || region, results);
  };

  // Handle search
  const handleSearch = (region: string, area: string, coverageType: string) => {
    // Log analytics if enabled
    if (enableAnalytics) {
      analyticsService.logInteraction({
        timestamp: new Date().toISOString(),
        userId: '',  // Will be populated in the service
        userEmail: '',  // Will be populated in the service
        eventType: 'search',
        region,
        searchTerm: area,
        filterType: 'coverage',
        filterValue: coverageType,
        sessionId: analyticsService.getSessionId()
      });
    }
    
    // Find matching personnel
    const results = findMatchingPersonnel(region, area, coverageType);
    
    // Show in modal
    const title = area || region || 'All Areas';
    showPersonnelModal(title, results);
  };

  // Handle user search
  const handleUserSearch = (user: IPersonnelData) => {
    // Log analytics if enabled
    if (enableAnalytics) {
      analyticsService.logInteraction({
        timestamp: new Date().toISOString(),
        userId: '',  // Will be populated in the service
        userEmail: '',  // Will be populated in the service
        eventType: 'search',
        searchTerm: user.Email,
        filterType: 'user',
        filterValue: `${user.FirstName} ${user.LastName}`,
        sessionId: analyticsService.getSessionId()
      });
    }
    
    // Show user in modal
    showPersonnelModal(`User: ${user.PreferredFirstName || user.FirstName} ${user.LastName}`, [user]);
  };

  // Handle personnel view
  const handlePersonnelView = (personnelId: string) => {
    // Log analytics if enabled
    if (enableAnalytics) {
      analyticsService.logInteraction({
        timestamp: new Date().toISOString(),
        userId: '',  // Will be populated in the service
        userEmail: '',  // Will be populated in the service
        eventType: 'personnel_view',
        personnelViewed: personnelId,
        sessionId: analyticsService.getSessionId()
      });
    }
  };

  // Find matching personnel based on criteria
  const findMatchingPersonnel = (region: string, area: string, coverageType: string): IPersonnelData[] => {
    return personnel.filter(person => {
      const primaryAreas = person.PrimaryAreaIDs || [];
      const secondaryAreas = person.SecondaryAreaIDs || [];
      
      // Get region prefix
      const regionPrefixes: { [key: string]: string } = { 
        'East': 'A', 
        'Central': 'B', 
        'West': 'C' 
      };
      const regionPrefix = region ? regionPrefixes[region] : null;
      
      // Check matches
      let primaryMatch = false;
      let secondaryMatch = false;
      
      if (area) {
        // Specific area search - look for area name in IDs
        primaryMatch = primaryAreas.some(id => id.includes(area));
        secondaryMatch = secondaryAreas.some(id => id.includes(area));
      } else if (regionPrefix) {
        // Region-wide search
        primaryMatch = primaryAreas.some(id => id.startsWith(regionPrefix));
        secondaryMatch = secondaryAreas.some(id => id.startsWith(regionPrefix));
      } else {
        // All areas
        primaryMatch = primaryAreas.length > 0;
        secondaryMatch = secondaryAreas.length > 0;
      }
      
      // Filter based on coverage type
      if (coverageType === 'all') {
        return primaryMatch || secondaryMatch;
      } else if (coverageType === 'primary') {
        return primaryMatch;
      } else if (coverageType === 'secondary') {
        return secondaryMatch;
      }
      
      return false;
    });
  };

  // Show personnel modal
  const showPersonnelModal = (title: string, results: IPersonnelData[]) => {
    setModalTitle(title);
    setModalSubtitle(`${results.length} personnel found`);
    setFilteredPersonnel(results);
    setModalOpen(true);
  };

  // Handle filter change
  const handleFilterChange = (filterType: string, filterValue: string) => {
    // Log analytics if enabled
    if (enableAnalytics) {
      analyticsService.logInteraction({
        timestamp: new Date().toISOString(),
        userId: '',  // Will be populated in the service
        userEmail: '',  // Will be populated in the service
        eventType: 'filter_change',
        filterType,
        filterValue,
        sessionId: analyticsService.getSessionId()
      });
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading personnel data...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.areaMapApp}>
      <h1 className={styles.title}>Interactive Area Map - Personnel Directory</h1>
      
      <SearchControls
        personnel={personnel}
        onSearch={handleSearch}
        onUserSearch={handleUserSearch}
        onFilterChange={handleFilterChange}
      />
      
      <AreaMap
        onAreaClick={handleAreaClick}
        selectedArea={selectedArea || undefined}
        personnel={personnel}
      />
      
      <PersonnelModal
        isOpen={modalOpen}
        onDismiss={() => setModalOpen(false)}
        title={modalTitle}
        subtitle={modalSubtitle}
        personnel={filteredPersonnel}
        onPersonnelView={handlePersonnelView}
      />
    </div>
  );
};
