/**
 * SharePoint Integration for US Area Map
 * 
 * This file contains the JavaScript code for integrating the interactive map
 * with SharePoint lists. It handles loading images from the SharePoint list,
 * as well as managing area assignments and personnel data.
 */

// Initialize variables
let siteUrl;
let mapImagesLoaded = false;
let areaEventHandlersAttached = false;
let personnelData = [];
let currentUserProfile = null;

// Execute when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map when SharePoint context is available
    if (typeof _spPageContextInfo !== 'undefined') {
        // We're in SharePoint
        siteUrl = _spPageContextInfo.webAbsoluteUrl;
        initializeMap();
    } else {
        // We're in a local/development environment
        console.log('SharePoint context not available. Using mock data.');
        siteUrl = '';
        initializeMap(true);
    }
});

/**
 * Initialize the map and load data from SharePoint
 * @param {boolean} useMockData - Whether to use mock data instead of SharePoint data
 */
function initializeMap(useMockData = false) {
    // Load images from SharePoint or mock data
    loadImagesFromSharePoint(useMockData);
    
    // Load personnel data from SharePoint
    loadPersonnelFromSharePoint(useMockData);
    
    // Set up modal functionality
    setupModalFunctionality();
    
    // Set up form controls
    setupFormControls();
    
    // Add event listener to hide panel when clicking outside the map
    setupOutsideClickHandler();
}

/**
 * Load images from SharePoint list
 * @param {boolean} useMockData - Whether to use mock data instead of SharePoint data
 */
function loadImagesFromSharePoint(useMockData = false) {
    // Get the map container elements
    const backgroundMapImg = document.querySelector('.background-map');
    const baseMapImg = document.querySelector('.base-map');
    
    // Fetch images from the SharePoint list
    getImagesFromSharePoint(useMockData).then(images => {
        // Set the background and base map images
        const backgroundMap = images.find(img => img.Title === 'background-map');
        const baseMap = images.find(img => img.Title === 'base-map');
        
        if (backgroundMap) {
            backgroundMapImg.src = backgroundMap.ImageUrl;
        }
        
        if (baseMap) {
            baseMapImg.src = baseMap.ImageUrl;
        }
        
        // Set the area images
        images.forEach(img => {
            if (img.ImageType && img.ImageType.startsWith('Region') && img.AreaNumber) {
                const regionNumber = img.ImageType.replace('Region', '');
                const areaNumber = img.AreaNumber;
                const areaElement = document.querySelector(`.area-layer[data-region="Region ${regionNumber}"][data-area="Area ${areaNumber}"]`);
                
                if (areaElement) {
                    areaElement.src = img.ImageUrl;
                }
            }
        });
        
        // Mark images as loaded
        mapImagesLoaded = true;
        
        // Attach event handlers to area elements
        if (!areaEventHandlersAttached) {
            attachAreaEventHandlers();
        }
    }).catch(error => {
        console.error('Error loading images from SharePoint:', error);
    });
}

/**
 * Load personnel data from SharePoint list
 * @param {boolean} useMockData - Whether to use mock data instead of SharePoint data
 */
function loadPersonnelFromSharePoint(useMockData = false) {
    // Fetch personnel data from the SharePoint list
    getPersonnelFromSharePoint(useMockData).then(data => {
        // Store the personnel data globally
        personnelData = data;
        
        // Update the UI with the personnel data
        updatePersonnelUI();
    }).catch(error => {
        console.error('Error loading personnel data from SharePoint:', error);
    });
}

/**
 * Get personnel data from SharePoint list
 * @param {boolean} useMockData - Whether to use mock data instead of SharePoint data
 * @returns {Promise} - Promise that resolves with personnel data
 */
function getPersonnelFromSharePoint(useMockData = false) {
    return new Promise((resolve, reject) => {
        if (useMockData) {
            // Return mock data for local development
            setTimeout(() => {
                const mockPersonnel = [
                    {
                        Title: "Assignment1",
                        User: {
                            Title: "John Smith",
                            EMail: "john.smith@example.com"
                        },
                        FirstName: "John",
                        LastName: "Smith",
                        PreferredFirstName: "Johnny",
                        Email: "john.smith@example.com",
                        ProfilePicture: "images/profile-placeholder.png",
                        PrimaryAreaIDs: ["A01_BaltimoreCoast", "A02_SouthEast"],
                        SecondaryAreaIDs: ["A06_GulfCoast"],
                        Manager: {
                            Title: "Jane Doe",
                            EMail: "jane.doe@example.com"
                        },
                        JobTitle: "Regional Sales Manager",
                        StartDate: "2025-01-15T00:00:00Z",
                        Notes: "Primary contact for East region"
                    },
                    {
                        Title: "Assignment2",
                        User: {
                            Title: "Sarah Johnson",
                            EMail: "sarah.johnson@example.com"
                        },
                        FirstName: "Sarah",
                        LastName: "Johnson",
                        PreferredFirstName: "",
                        Email: "sarah.johnson@example.com",
                        ProfilePicture: "images/profile-placeholder.png",
                        PrimaryAreaIDs: ["B01_Chicago", "B02_Michigan"],
                        SecondaryAreaIDs: [],
                        Manager: {
                            Title: "Robert Taylor",
                            EMail: "robert.taylor@example.com"
                        },
                        JobTitle: "Territory Manager",
                        StartDate: "2025-02-01T00:00:00Z",
                        Notes: "Specializes in automotive industry"
                    },
                    {
                        Title: "Assignment3",
                        User: {
                            Title: "Michael Brown",
                            EMail: "michael.brown@example.com"
                        },
                        FirstName: "Michael",
                        LastName: "Brown",
                        PreferredFirstName: "Mike",
                        Email: "michael.brown@example.com",
                        ProfilePicture: "images/profile-placeholder.png",
                        PrimaryAreaIDs: ["C01_Denver", "C02_Dallas"],
                        SecondaryAreaIDs: ["C03_Houston", "C05_NorthernCalifornia"],
                        Manager: {
                            Title: "Jennifer Lee",
                            EMail: "jennifer.lee@example.com"
                        },
                        JobTitle: "Western Regional Director",
                        StartDate: "2024-11-15T00:00:00Z",
                        Notes: "Handles multiple territories in the West region"
                    }
                ];
                
                resolve(mockPersonnel);
            }, 500);
        } else {
            // Use SharePoint REST API to get real data
            const endpoint = `${siteUrl}/_api/web/lists/getbytitle('AreaPersonnel')/items?$select=Title,FirstName,LastName,PreferredFirstName,Email,ProfilePicture,PrimaryAreaIDs,SecondaryAreaIDs,StartDate,Notes,JobTitle&$expand=User,Manager&$orderby=User/LastName asc`;
            
            fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose'
                }
            })
            .then(response => response.json())
            .then(data => {
                const personnel = data.d.results.map(item => {
                    // Process the primary area IDs
                    let primaryAreaIDs = item.PrimaryAreaIDs;
                    if (typeof primaryAreaIDs === 'string') {
                        try {
                            primaryAreaIDs = JSON.parse(primaryAreaIDs);
                        } catch (e) {
                            // If it's not valid JSON, split by commas or semicolons
                            primaryAreaIDs = primaryAreaIDs.split(/[,;]/).map(id => id.trim());
                        }
                    }
                    
                    // Process the secondary area IDs
                    let secondaryAreaIDs = item.SecondaryAreaIDs;
                    if (typeof secondaryAreaIDs === 'string') {
                        try {
                            secondaryAreaIDs = JSON.parse(secondaryAreaIDs);
                        } catch (e) {
                            // If it's not valid JSON, split by commas or semicolons
                            secondaryAreaIDs = secondaryAreaIDs.split(/[,;]/).map(id => id.trim());
                        }
                    } else if (!secondaryAreaIDs) {
                        secondaryAreaIDs = [];
                    }
                    
                    return {
                        Title: item.Title,
                        User: {
                            Title: item.User ? item.User.Title : '',
                            EMail: item.User ? item.User.EMail : ''
                        },
                        FirstName: item.FirstName || (item.User ? item.User.FirstName : ''),
                        LastName: item.LastName || (item.User ? item.User.LastName : ''),
                        PreferredFirstName: item.PreferredFirstName || '',
                        Email: item.Email || (item.User ? item.User.EMail : ''),
                        ProfilePicture: item.ProfilePicture ? item.ProfilePicture.Url : (item.User && item.User.Picture ? item.User.Picture.Url : 'images/profile-placeholder.png'),
                        PrimaryAreaIDs: primaryAreaIDs || [],
                        SecondaryAreaIDs: secondaryAreaIDs || [],
                        Manager: item.Manager ? {
                            Title: item.Manager.Title,
                            EMail: item.Manager.EMail
                        } : null,
                        JobTitle: item.JobTitle || '',
                        StartDate: item.StartDate || '',
                        Notes: item.Notes || ''
                    };
                });
                resolve(personnel);
            })
            .catch(error => reject(error));
        }
    });
}

/**
 * Update UI elements with personnel data
 */
function updatePersonnelUI() {
    // Update the employee select dropdown
    updateEmployeeDropdown();
    
    // If an area is already selected, update its info
    const selectedArea = document.querySelector('.area-layer.selected');
    if (selectedArea) {
        const event = { target: selectedArea };
        showAreaInfo(event);
    }
}

/**
 * Update the employee dropdown with personnel data
 */
function updateEmployeeDropdown() {
    const employeeSelect = document.getElementById('employee-select');
    if (!employeeSelect) return;
    
    // Clear existing options except the first one
    while (employeeSelect.options.length > 1) {
        employeeSelect.remove(1);
    }
    
    // Add unique employees from personnel data
    const uniqueEmployees = [];
    personnelData.forEach(person => {
        if (!uniqueEmployees.some(emp => emp.email === person.User.EMail)) {
            uniqueEmployees.push({
                name: person.User.Title,
                email: person.User.EMail
            });
        }
    });
    
    // Sort employees by name
    uniqueEmployees.sort((a, b) => a.name.localeCompare(b.name));
    
    // Add options to dropdown
    uniqueEmployees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.email;
        option.textContent = employee.name;
        employeeSelect.appendChild(option);
    });
}

/**
 * Get images from SharePoint list
 * @param {boolean} useMockData - Whether to use mock data instead of SharePoint data
 * @returns {Promise} - Promise that resolves with image data
 */
function getImagesFromSharePoint(useMockData = false) {
    return new Promise((resolve, reject) => {
        if (useMockData) {
            // Return mock data for local development
            setTimeout(() => {
                const mockImages = [
                    { 
                        Title: 'background-map', 
                        ImageType: 'Background', 
                        AreaNumber: null, 
                        ImageUrl: 'images/background-map.png' 
                    },
                    { 
                        Title: 'base-map', 
                        ImageType: 'Base', 
                        AreaNumber: null, 
                        ImageUrl: 'images/base-map.png' 
                    }
                ];
                
                // Add region 1 areas
                for (let i = 1; i <= 7; i++) {
                    mockImages.push({
                        Title: `region1-area${i}`,
                        ImageType: 'Region1',
                        AreaNumber: i,
                        ImageUrl: `images/region1-area${i}.png`
                    });
                }
                
                // Add region 2 areas
                for (let i = 1; i <= 8; i++) {
                    mockImages.push({
                        Title: `region2-area${i}`,
                        ImageType: 'Region2',
                        AreaNumber: i,
                        ImageUrl: `images/region2-area${i}.png`
                    });
                }
                
                // Add region 3 areas
                for (let i = 1; i <= 7; i++) {
                    mockImages.push({
                        Title: `region3-area${i}`,
                        ImageType: 'Region3',
                        AreaNumber: i,
                        ImageUrl: `images/region3-area${i}.png`
                    });
                }
                
                resolve(mockImages);
            }, 500);
        } else {
            // Use SharePoint REST API to get real data
            const endpoint = `${siteUrl}/_api/web/lists/getbytitle('MapImages')/items?$select=Title,ImageType,AreaNumber,Image`;
            
            fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose'
                }
            })
            .then(response => response.json())
            .then(data => {
                const images = data.d.results.map(item => {
                    return {
                        Title: item.Title,
                        ImageType: item.ImageType,
                        AreaNumber: item.AreaNumber,
                        ImageUrl: item.Image ? item.Image.Url : ''
                    };
                });
                resolve(images);
            })
            .catch(error => reject(error));
        }
    });
}

/**
 * Attach event handlers to area elements
 */
function attachAreaEventHandlers() {
    // Add click event for persistent selection
    const areaLayers = document.querySelectorAll('.area-layer');
    areaLayers.forEach(area => {
        // Single click to select
        area.addEventListener('click', function(event) {
            // Remove selected class from all areas
            document.querySelectorAll('.area-layer').forEach(a => {
                a.classList.remove('selected');
            });
            
            // Add selected class to clicked area
            this.classList.add('selected');
            
            // Show area info
            showAreaInfo(event);
            
            // Update region and area select dropdowns
            const regionName = this.getAttribute('data-region');
            const areaName = this.getAttribute('data-area');
            document.getElementById('region-select').value = regionName;
            
            // Update area dropdown
            updateAreaDropdown(regionName, areaName);
        });
        
        // Double click to zoom
        area.addEventListener('dblclick', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            // Get area information
            const regionName = this.getAttribute('data-region');
            const areaName = this.getAttribute('data-area');
            
            // Set the enlarged image
            const enlargedArea = document.getElementById('enlarged-area');
            enlargedArea.src = this.src;
            enlargedArea.alt = `${regionName} - ${areaName}`;
            
            // Create info content for the modal
            let infoHTML = `<h3>${regionName} - ${areaName}</h3>`;
            
            // Add personnel info
            if (regionData[regionName]) {
                const areaPersonnel = regionData[regionName].personnel.filter(person => person.area === areaName);
                infoHTML += `<div class="modal-personnel-count">${areaPersonnel.length} team members assigned</div>`;
                
                if (areaPersonnel.length > 0) {
                    infoHTML += '<ul>';
                    areaPersonnel.forEach(person => {
                        infoHTML += `<li><span class="person-name">${person.name}</span></li>`;
                    });
                    infoHTML += '</ul>';
                } else {
                    infoHTML += '<p><em>No team members assigned to this area</em></p>';
                }
            }
            
            // Set modal info content
            document.getElementById('modal-info').innerHTML = infoHTML;
            
            // Show the modal
            document.getElementById('zoom-modal').style.display = 'flex';
        });
        
        // Add hover event
        area.addEventListener('mouseover', function(event) {
            this.classList.add('hover');
        });
        
        area.addEventListener('mouseout', function(event) {
            this.classList.remove('hover');
        });
    });
    
    // Mark event handlers as attached
    areaEventHandlersAttached = true;
}

/**
 * Set up modal functionality
 */
function setupModalFunctionality() {
    // Get modal elements
    const zoomModal = document.getElementById('zoom-modal');
    const closeModal = document.getElementById('close-modal');
    
    // Close modal when clicking the close button
    closeModal.addEventListener('click', function() {
        zoomModal.style.display = 'none';
    });
    
    // Close modal when clicking outside the image
    zoomModal.addEventListener('click', function(event) {
        if (event.target === zoomModal) {
            zoomModal.style.display = 'none';
        }
    });
    
    // Add keyboard support for closing modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && zoomModal.style.display === 'flex') {
            zoomModal.style.display = 'none';
        }
    });
}

/**
 * Set up form controls
 */
function setupFormControls() {
    // Set up region select change event
    document.getElementById('region-select').addEventListener('change', function() {
        const regionName = this.value;
        
        // Update area dropdown
        updateAreaDropdown(regionName);
        
        // Update map selection - deselect all areas
        document.querySelectorAll('.area-layer').forEach(a => {
            a.classList.remove('selected');
        });
        
        if (regionName) {
            // Show region info without selecting a specific area
            showRegionInfo(regionName);
        } else {
            // Hide info panel if no region selected
            document.getElementById('info-panel').style.display = 'none';
        }
    });
    
    // Set up area select change event
    document.getElementById('area-select').addEventListener('change', function() {
        const regionName = document.getElementById('region-select').value;
        const areaName = this.value;
        
        // Update map selection
        document.querySelectorAll('.area-layer').forEach(a => {
            a.classList.remove('selected');
        });
        
        if (areaName) {
            const areaElement = document.querySelector(`.area-layer[data-region="${regionName}"][data-area="${areaName}"]`);
            if (areaElement) {
                areaElement.classList.add('selected');
                
                // Show area info
                const event = { target: areaElement };
                showAreaInfo(event);
            }
        } else if (regionName) {
            // Show region info without selecting a specific area
            showRegionInfo(regionName);
        } else {
            // Hide info panel if no region or area selected
            document.getElementById('info-panel').style.display = 'none';
        }
    });
    
    // Set up remove button
    document.getElementById('remove-button').addEventListener('click', function() {
        const region = document.getElementById('region-select').value;
        const employee = document.getElementById('employee-select').value;
        
        if (!region || !employee) {
            alert('Please select a region and employee to remove.');
            return;
        }
        
        // In a real implementation, this would update the SharePoint list
        // For the mockup, we'll just show a confirmation message
        alert(`Assignment removed:\nRegion: ${region}\nEmployee: ${employee}`);
    });
    
    // Add query button event handler
    document.getElementById('query-button').addEventListener('click', function() {
        performQuery();
    });
    
    // Add reset button event handler
    document.getElementById('reset-button').addEventListener('click', function() {
        resetQuery();
    });
}

/**
 * Submit assignment to Power Fx/Power Automate
 */
window.PowerFxMap = {
    submitAssignmentToPowerFx: function() {
        // Get form values
        const region = document.getElementById('region-select').value;
        const area = document.getElementById('area-select').value;
        const employee = document.getElementById('employee-select').value;
        const startDate = document.getElementById('start-date').value;
        const notes = document.getElementById('notes').value;
        
        // Get the area ID based on region and area name
        const areaID = getAreaIDFromNames(region, area);
        
        // Determine if this is a primary or secondary area assignment
        const coverageType = document.querySelector('input[name="coverage-type"]:checked')?.value || 'primary';
        
        // Create data object
        const data = {
            region: region,
            area: area,
            areaID: areaID,
            coverageType: coverageType,
            employee: employee,
            startDate: startDate,
            notes: notes
        };
        
        // Set the hidden field value for Power Fx/Power Automate to read
        document.getElementById('power-fx-data').value = JSON.stringify(data);
        
        // Trigger Power Fx/Power Automate event
        if (window.powerFxTriggerEvent) {
            window.powerFxTriggerEvent();
        }
        
        // Show confirmation
        alert(`Assignment submitted:\nRegion: ${region}\nArea: ${area}\nEmployee: ${employee}`);
        
        // Note: Power Automate flow will automatically populate FirstName, LastName, and Email fields
        // from the selected user's profile information
    }
};

/**
 * Perform a query based on the selected region, area, and coverage type
 */
function performQuery() {
    // Get form values
    const region = document.getElementById('region-select').value;
    const area = document.getElementById('area-select').value;
    const coverageType = document.querySelector('input[name="coverage-type"]:checked')?.value || 'all';
    
    // Validate that at least a region is selected
    if (!region) {
        alert('Please select a region to search.');
        return;
    }
    
    // Clear any previous highlights
    clearAllHighlights();
    
    // Highlight the selected region or area
    if (area) {
        // Highlight specific area
        highlightArea(region, area);
    } else {
        // Highlight all areas in the region
        highlightRegion(region);
    }
    
    // Find and display personnel based on the query
    displayQueryResults(region, area, coverageType);
    
    // Create data object for Power Fx integration if needed
    const data = {
        action: 'query',
        region: region,
        area: area,
        coverageType: coverageType
    };
    
    // Set the hidden field value for Power Fx to read
    document.getElementById('power-fx-data').value = JSON.stringify(data);
    
    // Trigger Power Fx event if available
    if (window.powerFxTriggerEvent) {
        window.powerFxTriggerEvent();
    }
}

/**
 * Reset the query form and clear all highlights
 */
function resetQuery() {
    // Reset form fields
    document.getElementById('region-select').value = '';
    document.getElementById('area-select').value = '';
    document.getElementById('area-select').disabled = true;
    document.querySelector('input[name="coverage-type"][value="all"]').checked = true;
    
    // Clear all highlights
    clearAllHighlights();
    
    // Hide results container
    document.querySelector('.results-container').style.display = 'none';
    
    // Hide info panel
    document.getElementById('info-panel').style.display = 'none';
}

/**
 * Clear all highlights from the map
 */
function clearAllHighlights() {
    // Get SVG document
    const svgDoc = document.querySelector('object[data="images/Artboard 1.svg"]').contentDocument;
    if (!svgDoc) return;
    
    // Remove selected class from all paths
    const paths = svgDoc.querySelectorAll('path');
    paths.forEach(path => {
        path.classList.remove('selected');
        path.classList.remove('hover');
    });
}

/**
 * Highlight all areas in a specific region
 * @param {string} region - The region name (East, Central, West)
 */
function highlightRegion(region) {
    // Get SVG document
    const svgDoc = document.querySelector('object[data="images/Artboard 1.svg"]').contentDocument;
    if (!svgDoc) return;
    
    // Find the region group
    let regionGroup;
    switch(region) {
        case 'East': regionGroup = svgDoc.querySelector('#East'); break;
        case 'Central': regionGroup = svgDoc.querySelector('#Central'); break;
        case 'West': regionGroup = svgDoc.querySelector('#West'); break;
        default: return;
    }
    
    if (!regionGroup) return;
    
    // Highlight all paths in the region
    const paths = regionGroup.querySelectorAll('path');
    paths.forEach(path => {
        path.classList.add('selected');
    });
}

/**
 * Highlight a specific area
 * @param {string} region - The region name (East, Central, West)
 * @param {string} area - The area name
 */
function highlightArea(region, area) {
    // Get SVG document
    const svgDoc = document.querySelector('object[data="images/Artboard 1.svg"]').contentDocument;
    if (!svgDoc) return;
    
    // Find the region group
    let regionGroup;
    switch(region) {
        case 'East': regionGroup = svgDoc.querySelector('#East'); break;
        case 'Central': regionGroup = svgDoc.querySelector('#Central'); break;
        case 'West': regionGroup = svgDoc.querySelector('#West'); break;
        default: return;
    }
    
    if (!regionGroup) return;
    
    // Format the area name to match ID format (remove spaces)
    const formattedAreaName = area.replace(/\s+/g, '');
    
    // Find and highlight the specific area path
    const paths = regionGroup.querySelectorAll('path');
    for (const path of paths) {
        const pathId = path.getAttribute('id');
        if (!pathId) continue;
        
        // Extract the name part from the path ID
        const nameParts = pathId.split('_');
        if (nameParts.length < 2) continue;
        
        // Check if the name part matches
        if (nameParts[1].toLowerCase() === formattedAreaName.toLowerCase()) {
            path.classList.add('selected');
            break;
        }
    }
}

/**
 * Display query results based on region, area, and coverage type
 * @param {string} region - The region name (East, Central, West)
 * @param {string} area - The area name (optional)
 * @param {string} coverageType - The coverage type (all, primary, secondary)
 */
function displayQueryResults(region, area, coverageType) {
    // Get results container elements
    const resultsContainer = document.querySelector('.results-container');
    const resultsSummary = document.getElementById('results-summary');
    const resultsList = document.getElementById('results-list');
    
    // Clear previous results
    resultsList.innerHTML = '';
    
    // Find matching personnel
    const matchingPersonnel = findMatchingPersonnel(region, area, coverageType);
    
    // Create summary text
    let summaryText = '';
    if (area) {
        summaryText = `Found ${matchingPersonnel.length} personnel for ${region} - ${area}`;
    } else {
        summaryText = `Found ${matchingPersonnel.length} personnel for ${region} region`;
    }
    
    if (coverageType !== 'all') {
        summaryText += ` (${coverageType} coverage only)`;
    }
    
    resultsSummary.textContent = summaryText;
    
    // Add personnel to the results list
    if (matchingPersonnel.length > 0) {
        matchingPersonnel.forEach(person => {
            const listItem = document.createElement('li');
            
            // Create profile container with image and details
            const profileContainer = document.createElement('div');
            profileContainer.className = 'profile-container';
            
            // Add coverage badge if filtering by all (to distinguish between primary/secondary)
            if (coverageType === 'all') {
                const coverageBadge = document.createElement('div');
                coverageBadge.className = `coverage-badge ${person.coverageType}`;
                coverageBadge.textContent = person.coverageType === 'primary' ? 'Primary' : 'Secondary';
                profileContainer.appendChild(coverageBadge);
            }
            
            // Add profile image
            const profileImg = document.createElement('img');
            profileImg.className = 'profile-image';
            profileImg.src = person.ProfilePicture || 'images/profile-placeholder.png';
            profileImg.alt = 'Profile';
            profileContainer.appendChild(profileImg);
            
            // Add user details
            const userDetails = document.createElement('div');
            userDetails.className = 'user-details';
            
            // Add name with email - use preferred name if available
            const nameElement = document.createElement('div');
            nameElement.className = 'person-name';
            const displayFirstName = person.PreferredFirstName || person.FirstName;
            nameElement.textContent = `${displayFirstName} ${person.LastName}`;
            userDetails.appendChild(nameElement);
            
            // Add email
            const emailElement = document.createElement('div');
            emailElement.className = 'person-email';
            emailElement.textContent = person.Email;
            userDetails.appendChild(emailElement);
            
            // Add job title if available
            if (person.JobTitle) {
                const jobElement = document.createElement('div');
                jobElement.className = 'person-job';
                jobElement.textContent = person.JobTitle;
                userDetails.appendChild(jobElement);
            }
            
            // Add manager if available
            if (person.Manager) {
                const managerElement = document.createElement('div');
                managerElement.className = 'person-manager';
                managerElement.textContent = `Manager: ${person.Manager.Title}`;
                userDetails.appendChild(managerElement);
            }
            
            // Add areas covered
            const areasElement = document.createElement('div');
            areasElement.className = 'person-areas';
            
            // Determine which areas to show based on coverage type
            let areasToShow = [];
            if (coverageType === 'all' || coverageType === 'primary') {
                const primaryAreas = formatAreasList(person.PrimaryAreaIDs);
                if (primaryAreas) {
                    areasToShow.push(`Primary: ${primaryAreas}`);
                }
            }
            
            if (coverageType === 'all' || coverageType === 'secondary') {
                const secondaryAreas = formatAreasList(person.SecondaryAreaIDs);
                if (secondaryAreas) {
                    areasToShow.push(`Secondary: ${secondaryAreas}`);
                }
            }
            
            areasElement.textContent = areasToShow.join(' | ');
            userDetails.appendChild(areasElement);
            
            profileContainer.appendChild(userDetails);
            listItem.appendChild(profileContainer);
            resultsList.appendChild(listItem);
        });
    } else {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<em>No personnel found matching the selected criteria</em>`;
        resultsList.appendChild(listItem);
    }
    
    // Show results container
    resultsContainer.style.display = 'block';
}

/**
 * Find personnel matching the query criteria
 * @param {string} region - The region name (East, Central, West)
 * @param {string} area - The area name (optional)
 * @param {string} coverageType - The coverage type (all, primary, secondary)
 * @returns {Array} - Array of matching personnel objects
 */
function findMatchingPersonnel(region, area, coverageType) {
    const results = [];
    const regionPrefix = getRegionPrefix(region);
    
    // Format area name if provided
    const formattedAreaName = area ? area.replace(/\s+/g, '').toLowerCase() : null;
    
    personnelData.forEach(person => {
        let isPrimary = false;
        let isSecondary = false;
        
        // Check if person has primary coverage for the region/area
        if (Array.isArray(person.PrimaryAreaIDs) && person.PrimaryAreaIDs.length > 0) {
            if (area) {
                // Looking for specific area
                isPrimary = person.PrimaryAreaIDs.some(areaId => {
                    const parts = areaId.split('_');
                    return areaId.startsWith(regionPrefix) && 
                           parts.length > 1 && 
                           parts[1].toLowerCase() === formattedAreaName;
                });
            } else {
                // Looking for any area in the region
                isPrimary = person.PrimaryAreaIDs.some(areaId => areaId.startsWith(regionPrefix));
            }
        }
        
        // Check if person has secondary coverage for the region/area
        if (Array.isArray(person.SecondaryAreaIDs) && person.SecondaryAreaIDs.length > 0) {
            if (area) {
                // Looking for specific area
                isSecondary = person.SecondaryAreaIDs.some(areaId => {
                    const parts = areaId.split('_');
                    return areaId.startsWith(regionPrefix) && 
                           parts.length > 1 && 
                           parts[1].toLowerCase() === formattedAreaName;
                });
            } else {
                // Looking for any area in the region
                isSecondary = person.SecondaryAreaIDs.some(areaId => areaId.startsWith(regionPrefix));
            }
        }
        
        // Add person to results based on coverage type filter
        if ((coverageType === 'all' && (isPrimary || isSecondary)) ||
            (coverageType === 'primary' && isPrimary) ||
            (coverageType === 'secondary' && isSecondary)) {
            
            // Add coverage type to person object
            const personWithCoverage = { ...person, coverageType: isPrimary ? 'primary' : 'secondary' };
            results.push(personWithCoverage);
        }
    });
    
    // Sort results - primary first, then by last name
    results.sort((a, b) => {
        if (a.coverageType === 'primary' && b.coverageType === 'secondary') return -1;
        if (a.coverageType === 'secondary' && b.coverageType === 'primary') return 1;
        return a.LastName.localeCompare(b.LastName);
    });
    
    return results;
}

/**
 * Format a list of area IDs into a readable string
 * @param {Array} areaIDs - Array of area IDs
 * @returns {string} - Formatted string of area names
 */
function formatAreasList(areaIDs) {
    if (!Array.isArray(areaIDs) || areaIDs.length === 0) return '';
    
    const areaNames = areaIDs.map(areaId => {
        const parts = areaId.split('_');
        if (parts.length < 2) return '';
        
        // Format the area name with spaces before capital letters
        return parts[1].replace(/([A-Z])/g, ' $1').trim();
    }).filter(name => name !== '');
    
    return areaNames.join(', ');
}

/**
 * Get the region prefix letter based on region name
 * @param {string} region - The region name (East, Central, West)
 * @returns {string} - The region prefix letter (A, B, C)
 */
function getRegionPrefix(region) {
    switch(region) {
        case 'East': return 'A';
        case 'Central': return 'B';
        case 'West': return 'C';
        default: return '';
    }
}

/**
 * Get the area ID based on region and area name
 * @param {string} region - The region name (East, Central, West)
 * @param {string} areaName - The formatted area name (e.g., "Gulf Coast")
 * @returns {string} - The area ID (e.g., "A06_GulfCoast")
 */
function getAreaIDFromNames(region, areaName) {
    // Convert region to letter prefix
    let prefix = '';
    switch(region) {
        case 'East': prefix = 'A'; break;
        case 'Central': prefix = 'B'; break;
        case 'West': prefix = 'C'; break;
        default: return '';
    }
    
    // Convert area name to ID format (remove spaces)
    const formattedName = areaName.replace(/\s+/g, '');
    
    // Look through SVG paths to find matching area number
    const svgDoc = document.querySelector('object[data="images/Artboard 1.svg"]').contentDocument;
    if (!svgDoc) return '';
    
    // Find all paths in the region group
    let regionGroup;
    switch(region) {
        case 'East': regionGroup = svgDoc.querySelector('#East'); break;
        case 'Central': regionGroup = svgDoc.querySelector('#Central'); break;
        case 'West': regionGroup = svgDoc.querySelector('#West'); break;
        default: return '';
    }
    
    if (!regionGroup) return '';
    
    // Look for a path with a matching name part
    const paths = regionGroup.querySelectorAll('path');
    for (const path of paths) {
        const pathId = path.getAttribute('id');
        if (!pathId) continue;
        
        // Extract the area name part from the path ID
        const nameParts = pathId.split('_');
        if (nameParts.length < 2) continue;
        
        // Get the number part and the name part
        const numberPart = nameParts[0].substring(1); // Remove the letter prefix
        const namePart = nameParts[1];
        
        // Check if the name part matches (ignoring spaces)
        if (namePart.toLowerCase() === formattedName.toLowerCase()) {
            return `${prefix}${numberPart}_${namePart}`;
        }
    }
    
    // If no match found, return empty string
    return '';
}

/**
 * Set up outside click handler
 */
function setupOutsideClickHandler() {
    // Add event listener to hide panel when clicking outside the map
    document.addEventListener('click', function(event) {
        const mapContainer = document.querySelector('.map-container');
        const infoPanel = document.getElementById('info-panel');
        
        if (!mapContainer.contains(event.target)) {
            document.querySelectorAll('.area-layer').forEach(area => {
                area.classList.remove('selected');
            });
            infoPanel.style.display = 'none';
        }
    });
}

/**
 * Show area information on click
 * @param {Event} event - The click event
 */
function showAreaInfo(event) {
    const areaElement = event.target;
    
    // Get the region and area names
    const regionName = areaElement.getAttribute('data-region');
    const areaName = areaElement.getAttribute('data-area');
    const infoPanel = document.getElementById('info-panel');
    const regionTitle = document.getElementById('region-title');
    const areaTitle = document.getElementById('area-title');
    const personnelList = document.getElementById('personnel-list');
    const personnelCount = document.getElementById('personnel-count');
    
    // Update info panel content
    regionTitle.textContent = regionName;
    areaTitle.textContent = areaName;
    personnelList.innerHTML = '';
    
    // Find personnel assigned to this area
    const areaPersonnel = [];
    
    // Get the area ID pattern to match
    let areaIdPrefix = '';
    switch(regionName) {
        case 'East': areaIdPrefix = 'A'; break;
        case 'Central': areaIdPrefix = 'B'; break;
        case 'West': areaIdPrefix = 'C'; break;
        default: areaIdPrefix = '';
    }
    
    // Format the area name to match ID format (remove spaces)
    const formattedAreaName = areaName.replace(/\s+/g, '');
    
    // Look for personnel with matching area IDs (both primary and secondary)
    personnelData.forEach(person => {
        // Check primary areas
        let isPrimary = false;
        let isSecondary = false;
        
        if (Array.isArray(person.PrimaryAreaIDs)) {
            // Check if any of the person's primary assigned areas match this area
            const matchingPrimaryArea = person.PrimaryAreaIDs.find(areaId => {
                // Extract the name part from the area ID
                const parts = areaId.split('_');
                if (parts.length < 2) return false;
                
                // Check if the region letter matches and the name part is similar
                return areaId.startsWith(areaIdPrefix) && 
                       parts[1].toLowerCase() === formattedAreaName.toLowerCase();
            });
            
            if (matchingPrimaryArea) {
                isPrimary = true;
            }
        }
        
        // Check secondary areas
        if (Array.isArray(person.SecondaryAreaIDs)) {
            // Check if any of the person's secondary assigned areas match this area
            const matchingSecondaryArea = person.SecondaryAreaIDs.find(areaId => {
                // Extract the name part from the area ID
                const parts = areaId.split('_');
                if (parts.length < 2) return false;
                
                // Check if the region letter matches and the name part is similar
                return areaId.startsWith(areaIdPrefix) && 
                       parts[1].toLowerCase() === formattedAreaName.toLowerCase();
            });
            
            if (matchingSecondaryArea) {
                isSecondary = true;
            }
        }
        
        // Add the person to the list if they have either primary or secondary coverage
        if (isPrimary || isSecondary) {
            // Add coverage type to the person object
            const personWithCoverage = { ...person, coverageType: isPrimary ? 'primary' : 'secondary' };
            areaPersonnel.push(personWithCoverage);
        }
    });
    
    // Sort personnel - primary coverage first, then secondary
    areaPersonnel.sort((a, b) => {
        if (a.coverageType === 'primary' && b.coverageType === 'secondary') return -1;
        if (a.coverageType === 'secondary' && b.coverageType === 'primary') return 1;
        return a.LastName.localeCompare(b.LastName);
    });
    
    // Update personnel count
    personnelCount.textContent = `${areaPersonnel.length} team members assigned`;
    
    // Add personnel to the list
    if (areaPersonnel.length > 0) {
        areaPersonnel.forEach(person => {
            const listItem = document.createElement('li');
            
            // Create profile container with image and details
            const profileContainer = document.createElement('div');
            profileContainer.className = 'profile-container';
            
            // Add coverage badge (primary or secondary)
            const coverageBadge = document.createElement('div');
            coverageBadge.className = `coverage-badge ${person.coverageType}`;
            coverageBadge.textContent = person.coverageType === 'primary' ? 'Primary' : 'Secondary';
            profileContainer.appendChild(coverageBadge);
            
            // Add profile image
            const profileImg = document.createElement('img');
            profileImg.className = 'profile-image';
            profileImg.src = person.ProfilePicture || 'images/profile-placeholder.png';
            profileImg.alt = 'Profile';
            profileContainer.appendChild(profileImg);
            
            // Add user details
            const userDetails = document.createElement('div');
            userDetails.className = 'user-details';
            
            // Add name with email - use preferred name if available
            const nameElement = document.createElement('div');
            nameElement.className = 'person-name';
            const displayFirstName = person.PreferredFirstName || person.FirstName;
            nameElement.textContent = `${displayFirstName} ${person.LastName}`;
            userDetails.appendChild(nameElement);
            
            // Add email
            const emailElement = document.createElement('div');
            emailElement.className = 'person-email';
            emailElement.textContent = person.Email;
            userDetails.appendChild(emailElement);
            
            // Add job title if available
            if (person.JobTitle) {
                const jobElement = document.createElement('div');
                jobElement.className = 'person-job';
                jobElement.textContent = person.JobTitle;
                userDetails.appendChild(jobElement);
            }
            
            // Add manager if available
            if (person.Manager) {
                const managerElement = document.createElement('div');
                managerElement.className = 'person-manager';
                managerElement.textContent = `Manager: ${person.Manager.Title}`;
                userDetails.appendChild(managerElement);
            }
            
            profileContainer.appendChild(userDetails);
            listItem.appendChild(profileContainer);
            personnelList.appendChild(listItem);
        });
    } else {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<em>No team members assigned to this area</em>`;
        personnelList.appendChild(listItem);
    }
    
    // Show the info panel
    infoPanel.style.display = 'block';
    
    // Update form controls
    document.getElementById('region-select').value = regionName;
    updateAreaDropdown(regionName, areaName);
}

/**
 * Show region information without a specific area
 * @param {string} regionName - The name of the region
 */
function showRegionInfo(regionName) {
    const infoPanel = document.getElementById('info-panel');
    const regionTitle = document.getElementById('region-title');
    const areaTitle = document.getElementById('area-title');
    const personnelList = document.getElementById('personnel-list');
    const personnelCount = document.getElementById('personnel-count');
    
    // Update info panel content
    regionTitle.textContent = regionName;
    areaTitle.textContent = "All Areas";
    personnelList.innerHTML = '';
    
    // Add personnel to the list
    if (regionData[regionName]) {
        const personnel = regionData[regionName].personnel;
        personnelCount.textContent = `${personnel.length} team members assigned`;
        
        personnel.forEach(person => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span class="area-name">${person.area}:</span> <span class="person-name">${person.name}</span>`;
            personnelList.appendChild(listItem);
        });
    }
    
    // Show the info panel
    infoPanel.style.display = 'block';
}

/**
 * Update area dropdown based on selected region
 * @param {string} regionName - The name of the region
 * @param {string} selectedArea - The area to select (optional)
 */
function updateAreaDropdown(regionName, selectedArea = '') {
    const areaSelect = document.getElementById('area-select');
    areaSelect.innerHTML = '';
    
    if (regionName && regionData[regionName]) {
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select Area --';
        areaSelect.appendChild(defaultOption);
        
        // Add areas for the selected region
        regionData[regionName].areas.forEach(areaName => {
            const option = document.createElement('option');
            option.value = areaName;
            option.textContent = areaName;
            areaSelect.appendChild(option);
        });
        
        areaSelect.disabled = false;
        
        // Set the selected area if provided
        if (selectedArea) {
            areaSelect.value = selectedArea;
        }
    } else {
        // No region selected, disable area dropdown
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- First Select Region --';
        areaSelect.appendChild(defaultOption);
        areaSelect.disabled = true;
    }
}
