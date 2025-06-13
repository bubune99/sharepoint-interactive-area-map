import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Dropdown,
  IDropdownOption,
  ChoiceGroup,
  IChoiceGroupOption,
  PrimaryButton,
  Stack,
  IStackTokens,
  Label,
  SearchBox
} from '@fluentui/react';
import { IPersonnelData } from '../../services/PersonnelList.schema';
import styles from './SearchControls.module.scss';

export interface ISearchControlsProps {
  personnel: IPersonnelData[];
  onSearch: (region: string, area: string, coverageType: string) => void;
  onUserSearch: (user: IPersonnelData) => void;
  onFilterChange?: (filterType: string, filterValue: string) => void;
}

export const SearchControls: React.FC<ISearchControlsProps> = ({
  personnel,
  onSearch,
  onUserSearch,
  onFilterChange
}) => {
  const [searchType, setSearchType] = useState<string>('regional');
  const [region, setRegion] = useState<string>('');
  const [area, setArea] = useState<string>('');
  const [coverageType, setCoverageType] = useState<string>('all');
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<IPersonnelData[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  
  // Region options
  const regionOptions: IDropdownOption[] = [
    { key: '', text: '-- Select Region --' },
    { key: 'East', text: 'East' },
    { key: 'Central', text: 'Central' },
    { key: 'West', text: 'West' },
    { key: 'All (Inside)', text: 'All (Inside)' }
  ];

  // Area options based on selected region
  const [areaOptions, setAreaOptions] = useState<IDropdownOption[]>([
    { key: '', text: '-- Select Area --' }
  ]);

  // Coverage type options
  const coverageOptions: IChoiceGroupOption[] = [
    { key: 'all', text: 'All Coverage' },
    { key: 'primary', text: 'Primary Only' },
    { key: 'secondary', text: 'Secondary Only' }
  ];

  // Search type options
  const searchTypeOptions: IChoiceGroupOption[] = [
    { key: 'regional', text: 'Regional Search' },
    { key: 'user', text: 'User Search' }
  ];

  // Update area options when region changes
  useEffect(() => {
    if (!region) {
      setAreaOptions([{ key: '', text: '-- Select Area --' }]);
      return;
    }

    // Get region prefix
    const regionPrefixes: { [key: string]: string } = { 
      'East': 'A', 
      'Central': 'B', 
      'West': 'C' 
    };
    const prefix = regionPrefixes[region];
    
    // Extract unique area names for the region
    const areas: string[] = [];
    
    personnel.forEach(person => {
      // Check primary areas
      if (person.PrimaryAreaIDs) {
        person.PrimaryAreaIDs.forEach(areaId => {
          if (areaId.startsWith(prefix)) {
            // Extract area name from ID (format: "A01_ AreaName")
            const areaName = areaId.split('_')[1]?.trim();
            if (areaName) areas.push(areaName);
          }
        });
      }
      
      // Check secondary areas
      if (person.SecondaryAreaIDs) {
        person.SecondaryAreaIDs.forEach(areaId => {
          if (areaId.startsWith(prefix)) {
            const areaName = areaId.split('_')[1]?.trim();
            if (areaName) areas.push(areaName);
          }
        });
      }
    });
    
    // Remove duplicates and sort
    const uniqueAreas = [...new Set(areas)].sort();
    
    // Create dropdown options
    const newAreaOptions = [
      { key: '', text: '-- Select Area --' },
      ...uniqueAreas.map(area => ({ key: area, text: area }))
    ];
    
    setAreaOptions(newAreaOptions);
  }, [region, personnel]);

  // Filter users when search term changes
  useEffect(() => {
    if (!userSearchTerm || userSearchTerm.length < 2) {
      setFilteredUsers(personnel);
      return;
    }
    
    const searchTermLower = userSearchTerm.toLowerCase();
    
    const matches = personnel.filter(person => {
      const searchFields = [
        person.FirstName,
        person.LastName,
        person.PreferredFirstName,
        person.JobTitle,
        person.Email
      ];
      
      return searchFields.some(field => 
        field && field.toLowerCase().includes(searchTermLower)
      );
    });
    
    setFilteredUsers(matches.slice(0, 20)); // Limit to 20 results
  }, [userSearchTerm, personnel]);

  // Handle search type change
  const handleSearchTypeChange = (ev?: React.FormEvent<HTMLElement>, option?: IChoiceGroupOption) => {
    if (option) {
      setSearchType(option.key);
      if (onFilterChange) onFilterChange('searchType', option.key);
    }
  };

  // Handle region change
  const handleRegionChange = (ev?: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    const newRegion = option ? String(option.key) : '';
    setRegion(newRegion);
    setArea(''); // Reset area when region changes
    if (onFilterChange) onFilterChange('region', newRegion);
  };

  // Handle area change
  const handleAreaChange = (ev?: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    const newArea = option ? String(option.key) : '';
    setArea(newArea);
    if (onFilterChange) onFilterChange('area', newArea);
  };

  // Handle coverage type change
  const handleCoverageChange = (ev?: React.FormEvent<HTMLElement>, option?: IChoiceGroupOption) => {
    if (option) {
      setCoverageType(option.key);
      if (onFilterChange) onFilterChange('coverageType', option.key);
    }
  };

  // Handle user search
  const handleUserSearch = (newValue?: string) => {
    setUserSearchTerm(newValue || '');
    if (onFilterChange) onFilterChange('userSearch', newValue || '');
  };

  // Handle user selection
  const handleUserSelection = (ev?: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    const userId = option ? String(option.key) : '';
    setSelectedUser(userId);
    if (onFilterChange) onFilterChange('selectedUser', userId);
  };

  // Handle search button click
  const handleSearch = () => {
    if (searchType === 'regional') {
      onSearch(region, area, coverageType);
    } else if (searchType === 'user' && selectedUser) {
      const user = personnel.find(p => p.Email === selectedUser);
      if (user) {
        onUserSearch(user);
      }
    }
  };

  const stackTokens: IStackTokens = { childrenGap: 16 };

  return (
    <div className={styles.searchControls}>
      <Stack tokens={stackTokens}>
        <ChoiceGroup
          selectedKey={searchType}
          options={searchTypeOptions}
          onChange={handleSearchTypeChange}
          label="Search Type"
        />

        {searchType === 'regional' ? (
          <Stack tokens={stackTokens}>
            <Dropdown
              label="Region"
              selectedKey={region}
              options={regionOptions}
              onChange={handleRegionChange}
            />

            <Dropdown
              label="Area"
              selectedKey={area}
              options={areaOptions}
              onChange={handleAreaChange}
              disabled={!region}
            />

            <ChoiceGroup
              label="Coverage Type"
              selectedKey={coverageType}
              options={coverageOptions}
              onChange={handleCoverageChange}
            />
          </Stack>
        ) : (
          <Stack tokens={stackTokens}>
            <SearchBox
              placeholder="Search by name, email, or job title"
              onChange={(_, newValue) => handleUserSearch(newValue)}
              value={userSearchTerm}
            />

            <Dropdown
              label="Select User"
              selectedKey={selectedUser}
              onChange={handleUserSelection}
              options={filteredUsers.map(user => ({
                key: user.Email,
                text: `${user.PreferredFirstName || user.FirstName} ${user.LastName} (${user.JobTitle})`
              }))}
              disabled={filteredUsers.length === 0}
            />
          </Stack>
        )}

        <PrimaryButton
          text="Search"
          onClick={handleSearch}
          disabled={(searchType === 'regional' && !region) || 
                   (searchType === 'user' && !selectedUser)}
        />
      </Stack>
    </div>
  );
};
