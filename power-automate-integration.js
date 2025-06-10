/**
 * Power Fx Integration for US Area Map
 * 
 * This file contains the JavaScript code for integrating the interactive map
 * with Power Automate flows using Power Fx expressions. It provides functions
 * to update the map data from Power Automate and to trigger Power Automate flows.
 */

// Global variables to store map data
let mapData = {
    regions: [],
    areas: [],
    personnelAssignments: [],
    mapImages: []
};

/**
 * Initialize the map with data from Power Automate
 * This function can be called from Power Automate via the HTML interface
 * @param {string} dataJson - JSON string containing the data from Power Automate
 */
function initializeMapWithPowerFxData(dataJson) {
    try {
        // Parse the JSON data from Power Fx
        const data = JSON.parse(dataJson);
        console.log('Initializing map with Power Fx data:', data);
        
        // Store the data
        if (data.regions) mapData.regions = data.regions;
        if (data.areas) mapData.areas = data.areas;
        if (data.personnelAssignments) mapData.personnelAssignments = data.personnelAssignments;
        if (data.mapImages) mapData.mapImages = data.mapImages;
        
        // Update the map
        updateMapWithData();
        
        // Return success message for Power Automate
        return JSON.stringify({
            status: 'success',
            message: 'Map initialized successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error initializing map with Power Fx data:', error);
        
        // Return error message for Power Automate
        return JSON.stringify({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * Update a specific area with data from Power Automate
 * @param {string} regionName - The name of the region
 * @param {string} areaName - The name of the area
 * @param {string} personnelJson - JSON string containing personnel data
 */
function updateAreaWithPowerFx(regionName, areaName, personnelJson) {
    try {
        // Parse the personnel data
        const personnel = JSON.parse(personnelJson);
        console.log(`Updating ${regionName} - ${areaName} with personnel:`, personnel);
        
        // Find the region in the data
        if (!window.regionData || !window.regionData[regionName]) {
            throw new Error(`Region ${regionName} not found`);
        }
        
        // Update personnel for this area
        // First remove existing personnel for this area
        window.regionData[regionName].personnel = 
            window.regionData[regionName].personnel.filter(p => p.area !== areaName);
        
        // Add new personnel
        personnel.forEach(person => {
            window.regionData[regionName].personnel.push({
                name: person.name,
                area: areaName,
                startDate: person.startDate || '',
                endDate: person.endDate || '',
                notes: person.notes || ''
            });
        });
        
        // Update the display if this area is currently selected
        const regionTitle = document.getElementById('region-title');
        const areaTitle = document.getElementById('area-title');
        
        if (regionTitle.textContent === regionName && areaTitle.textContent === areaName) {
            displayAreaInfo(regionName, areaName);
        }
        
        // Return success message for Power Automate
        return JSON.stringify({
            status: 'success',
            message: `Updated ${regionName} - ${areaName} with ${personnel.length} personnel`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating area with Power Fx data:', error);
        
        // Return error message for Power Automate
        return JSON.stringify({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * Update the map with the current data
 */
function updateMapWithData() {
    // Update images
    updateMapImages();
    
    // Update info panel data
    updateInfoPanelData();
    
    // Update form controls
    updateFormControls();
    
    // Make sure event handlers are attached
    if (!window.areaEventHandlersAttached) {
        attachAreaEventHandlers();
        window.areaEventHandlersAttached = true;
    }
}

/**
 * Update map images based on the mapImages data
 */
function updateMapImages() {
    const backgroundMapImg = document.querySelector('.background-map');
    const baseMapImg = document.querySelector('.base-map');
    
    // Find background and base map images
    const backgroundMap = mapData.mapImages.find(img => img.Title === 'background-map');
    const baseMap = mapData.mapImages.find(img => img.Title === 'base-map');
    
    // Set background and base map images
    if (backgroundMap && backgroundMap.ImageUrl) {
        backgroundMapImg.src = backgroundMap.ImageUrl;
        // Add data attribute for Power Fx to target
        backgroundMapImg.setAttribute('data-power-fx-id', 'background-map');
    }
    
    if (baseMap && baseMap.ImageUrl) {
        baseMapImg.src = baseMap.ImageUrl;
        // Add data attribute for Power Fx to target
        baseMapImg.setAttribute('data-power-fx-id', 'base-map');
    }
    
    // Set area images
    mapData.mapImages.forEach(img => {
        if (img.ImageType && img.ImageType.startsWith('Region') && img.AreaNumber) {
            const regionNumber = img.ImageType.replace('Region', '');
            const areaNumber = img.AreaNumber;
            const areaElement = document.querySelector(`.area-layer[data-region="Region ${regionNumber}"][data-area="Area ${areaNumber}"]`);
            
            if (areaElement && img.ImageUrl) {
                areaElement.src = img.ImageUrl;
                // Add data attributes for Power Fx to target
                areaElement.setAttribute('data-power-fx-region', regionNumber);
                areaElement.setAttribute('data-power-fx-area', areaNumber);
            }
        }
    });
}

/**
 * Update the info panel data
 */
function updateInfoPanelData() {
    // Create a structured object for regions and their personnel
    window.regionData = {};
    
    // Process regions
    mapData.regions.forEach(region => {
        const regionName = region.Title;
        window.regionData[regionName] = {
            description: region.Description || '',
            areas: [],
            personnel: []
        };
    });
    
    // Process areas
    mapData.areas.forEach(area => {
        const regionName = area.Region.Title;
        const areaName = area.Title;
        
        if (window.regionData[regionName]) {
            window.regionData[regionName].areas.push(areaName);
        }
    });
    
    // Process personnel assignments
    mapData.personnelAssignments.forEach(assignment => {
        const areaName = assignment.Area.Title;
        const regionName = assignment.Area.Region.Title;
        const employeeName = assignment.Employee.Title;
        
        if (window.regionData[regionName]) {
            window.regionData[regionName].personnel.push({
                name: employeeName,
                area: areaName,
                startDate: assignment.StartDate || '',
                endDate: assignment.EndDate || '',
                notes: assignment.Notes || ''
            });
        }
    });
}

/**
 * Update form controls with data
 */
function updateFormControls() {
    const regionSelect = document.getElementById('region-select');
    const employeeSelect = document.getElementById('employee-select');
    
    // Clear existing options
    regionSelect.innerHTML = '';
    employeeSelect.innerHTML = '';
    
    // Add default options
    regionSelect.innerHTML = '<option value="">-- Select Region --</option>';
    employeeSelect.innerHTML = '<option value="">-- Select Employee --</option>';
    
    // Add regions to dropdown
    Object.keys(window.regionData).forEach(regionName => {
        const option = document.createElement('option');
        option.value = regionName;
        option.textContent = regionName;
        regionSelect.appendChild(option);
    });
    
    // Add employees to dropdown (unique list from personnel assignments)
    const employees = new Set();
    mapData.personnelAssignments.forEach(assignment => {
        employees.add(assignment.Employee.Title);
    });
    
    Array.from(employees).sort().forEach(employeeName => {
        const option = document.createElement('option');
        option.value = employeeName;
        option.textContent = employeeName;
        employeeSelect.appendChild(option);
    });
}

/**
 * Attach event handlers to area elements
 */
function attachAreaEventHandlers() {
    // Get all area elements
    const areaElements = document.querySelectorAll('.area-layer');
    
    // Add click event to each area
    areaElements.forEach(area => {
        area.addEventListener('click', showAreaInfo);
        area.addEventListener('dblclick', showZoomedArea);
    });
    
    // Add event listeners to region elements
    const regionElements = document.querySelectorAll('.region');
    regionElements.forEach(region => {
        const regionName = region.getAttribute('data-region');
        region.addEventListener('mouseover', () => {
            document.getElementById('hover-region').textContent = regionName;
        });
        region.addEventListener('mouseout', () => {
            document.getElementById('hover-region').textContent = '';
        });
    });
}

/**
 * Show area information on click
 * @param {Event} event - The click event
 */
function showAreaInfo(event) {
    // Remove 'selected' class from all areas
    document.querySelectorAll('.area-layer').forEach(area => {
        area.classList.remove('selected');
    });
    
    // Add 'selected' class to clicked area
    event.target.classList.add('selected');
    
    // Get the region and area names
    const regionName = event.target.getAttribute('data-region');
    const areaName = event.target.getAttribute('data-area');
    
    // Update form selections
    const regionSelect = document.getElementById('region-select');
    regionSelect.value = regionName;
    
    // Trigger area dropdown update
    updateAreaDropdown(regionName, areaName);
    
    // Show info in the panel
    displayAreaInfo(regionName, areaName, event);
    
    // Add data attributes for Power Fx to target
    const infoPanel = document.getElementById('info-panel');
    infoPanel.setAttribute('data-power-fx-selected-region', regionName);
    infoPanel.setAttribute('data-power-fx-selected-area', areaName);
}

/**
 * Display area information in the info panel
 * @param {string} regionName - The name of the region
 * @param {string} areaName - The name of the area
 * @param {Event} event - The original event (optional)
 */
function displayAreaInfo(regionName, areaName, event) {
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
    if (window.regionData && window.regionData[regionName]) {
        // Filter personnel for this specific area
        const areaPersonnel = window.regionData[regionName].personnel.filter(person => person.area === areaName);
        personnelCount.textContent = `${areaPersonnel.length} team members assigned`;
        
        if (areaPersonnel.length > 0) {
            areaPersonnel.forEach(person => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<span class="person-name">${person.name}</span>`;
                // Add data attributes for Power Fx to target
                listItem.setAttribute('data-power-fx-employee', person.name);
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
    if (event && event.stopPropagation) {
        event.stopPropagation();
    }
}

/**
 * Show zoomed area on double-click
 * @param {Event} event - The double-click event
 */
function showZoomedArea(event) {
    const modal = document.getElementById('zoom-modal');
    const enlargedArea = document.getElementById('enlarged-area');
    const areaElement = event.target;
    
    // Set the enlarged area image
    enlargedArea.src = areaElement.src;
    enlargedArea.alt = areaElement.alt;
    
    // Add data attributes for Power Fx to target
    const regionName = areaElement.getAttribute('data-region');
    const areaName = areaElement.getAttribute('data-area');
    modal.setAttribute('data-power-fx-zoomed-region', regionName);
    modal.setAttribute('data-power-fx-zoomed-area', areaName);
    
    // Show the modal
    modal.style.display = 'flex';
    
    // Prevent the event from bubbling up
    if (event.stopPropagation) {
        event.stopPropagation();
    }
}

/**
 * Update area dropdown based on selected region
 * @param {string} regionName - The name of the region
 * @param {string} selectedArea - The area to select (optional)
 */
function updateAreaDropdown(regionName, selectedArea = '') {
    const areaSelect = document.getElementById('area-select');
    areaSelect.innerHTML = '';
    
    if (regionName && window.regionData && window.regionData[regionName]) {
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select Area --';
        areaSelect.appendChild(defaultOption);
        
        // Add areas for the selected region
        window.regionData[regionName].areas.forEach(areaName => {
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

/**
 * Submit assignment form data to Power Automate
 * This function will be called when the form is submitted
 */
function submitAssignmentToPowerFx() {
    const regionSelect = document.getElementById('region-select');
    const areaSelect = document.getElementById('area-select');
    const employeeSelect = document.getElementById('employee-select');
    const startDateInput = document.getElementById('start-date');
    const notesInput = document.getElementById('notes');
    
    // Validate form
    if (!regionSelect.value || !areaSelect.value || !employeeSelect.value) {
        alert('Please select a region, area, and employee.');
        return;
    }
    
    // Create assignment data
    const assignmentData = {
        region: regionSelect.value,
        area: areaSelect.value,
        employee: employeeSelect.value,
        startDate: startDateInput.value,
        notes: notesInput.value
    };
    
    console.log('Submitting assignment to Power Fx:', assignmentData);
    
    // Create a hidden form field with the data for Power Fx to read
    let powerFxDataField = document.getElementById('power-fx-data');
    if (!powerFxDataField) {
        powerFxDataField = document.createElement('input');
        powerFxDataField.type = 'hidden';
        powerFxDataField.id = 'power-fx-data';
        document.body.appendChild(powerFxDataField);
    }
    
    // Set the data as a JSON string
    powerFxDataField.value = JSON.stringify(assignmentData);
    
    // Add a data attribute to indicate new data is available
    powerFxDataField.setAttribute('data-power-fx-updated', new Date().toISOString());
    
    // Create a message to display
    const message = document.createElement('div');
    message.className = 'success-message';
    message.textContent = `Assignment submitted: ${employeeSelect.value} assigned to ${regionSelect.value} - ${areaSelect.value}`;
    
    // Add message to the page
    const controlsContainer = document.querySelector('.controls-container');
    controlsContainer.appendChild(message);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        message.remove();
    }, 5000);
    
    // Clear form
    areaSelect.value = '';
    employeeSelect.value = '';
    startDateInput.value = '';
    notesInput.value = '';
    
    // Return the data for Power Fx to read
    return JSON.stringify({
        status: 'success',
        data: assignmentData,
        timestamp: new Date().toISOString()
    });
}

/**
 * Get current map state as JSON for Power Fx
 * @returns {string} JSON string with current map state
 */
function getMapStateForPowerFx() {
    // Get currently selected region and area
    const infoPanel = document.getElementById('info-panel');
    const selectedRegion = infoPanel.getAttribute('data-power-fx-selected-region') || '';
    const selectedArea = infoPanel.getAttribute('data-power-fx-selected-area') || '';
    
    // Get personnel for selected area
    let personnel = [];
    if (selectedRegion && selectedArea && window.regionData && window.regionData[selectedRegion]) {
        personnel = window.regionData[selectedRegion].personnel.filter(p => p.area === selectedArea);
    }
    
    // Create state object
    const state = {
        selectedRegion,
        selectedArea,
        personnel,
        timestamp: new Date().toISOString()
    };
    
    // Return as JSON string
    return JSON.stringify(state);
}

// Export functions to be accessible from Power Fx
window.PowerFxMap = {
    initializeMapWithPowerFxData,
    updateAreaWithPowerFx,
    submitAssignmentToPowerFx,
    getMapStateForPowerFx
};
