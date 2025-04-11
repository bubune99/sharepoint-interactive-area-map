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
    
    // Set up assign button
    document.getElementById('assign-button').addEventListener('click', function() {
        const region = document.getElementById('region-select').value;
        const area = document.getElementById('area-select').value;
        const employee = document.getElementById('employee-select').value;
        const areaName = document.getElementById('area-name').value;
        
        if (!region || !employee || !areaName) {
            alert('Please select a region, employee, and enter an area name.');
            return;
        }
        
        // In a real implementation, this would update the SharePoint list
        // For the mockup, we'll just show a confirmation message
        alert(`Assignment created:\nRegion: ${region}\nArea: ${area || 'N/A'}\nEmployee: ${employee}\nArea Name: ${areaName}`);
        
        // Clear form
        document.getElementById('area-name').value = '';
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
    let areaElement = event.target;
    
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
    
    // Add personnel to the list
    if (regionData[regionName]) {
        // Filter personnel for this specific area
        const areaPersonnel = regionData[regionName].personnel.filter(person => person.area === areaName);
        personnelCount.textContent = `${areaPersonnel.length} team members assigned`;
        
        if (areaPersonnel.length > 0) {
            areaPersonnel.forEach(person => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<span class="person-name">${person.name}</span>`;
                personnelList.appendChild(listItem);
            });
        } else {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<em>No team members assigned to this area</em>`;
            personnelList.appendChild(listItem);
        }
    }
    
    // Show the info panel
    infoPanel.style.display = 'block';
    
    // Prevent the event from bubbling up
    if (event.stopPropagation) {
        event.stopPropagation();
    }
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
