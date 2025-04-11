// This file contains a simplified US map data for the mockup
// In a real implementation, you would use a more detailed SVG map

const usMapData = {
    // Northeast Region
    "ME": { path: "M878,108 L883,105 L885,111 L893,112 L894,116 L890,117 L887,115 L882,117 L880,114 Z", name: "Maine" },
    "NH": { path: "M875,125 L877,118 L879,114 L882,117 L880,123 L876,127 Z", name: "New Hampshire" },
    "VT": { path: "M868,125 L875,125 L876,127 L874,133 L871,133 Z", name: "Vermont" },
    "MA": { path: "M887,132 L876,129 L874,133 L877,135 L886,135 L890,132 Z", name: "Massachusetts" },
    "RI": { path: "M890,136 L887,135 L886,138 Z", name: "Rhode Island" },
    "CT": { path: "M882,139 L877,135 L886,135 L884,140 Z", name: "Connecticut" },
    "NY": { path: "M865,140 L860,135 L855,130 L860,125 L868,125 L871,133 L874,133 L877,135 L882,139 L875,145 Z", name: "New York" },
    "NJ": { path: "M875,145 L882,139 L884,140 L882,148 L877,150 Z", name: "New Jersey" },
    "PA": { path: "M865,140 L875,145 L877,150 L870,155 L855,155 L850,145 Z", name: "Pennsylvania" },
    
    // Southeast Region
    "DE": { path: "M882,148 L884,153 L882,155 Z", name: "Delaware" },
    "MD": { path: "M870,155 L877,150 L882,148 L882,155 L875,160 L865,160 Z", name: "Maryland" },
    "DC": { path: "M875,160 L876,161 L875,162 L874,161 Z", name: "District of Columbia" },
    "VA": { path: "M865,160 L875,160 L874,161 L875,162 L880,165 L865,175 L850,170 L855,160 Z", name: "Virginia" },
    "WV": { path: "M850,145 L855,155 L855,160 L850,170 L840,160 L845,150 Z", name: "West Virginia" },
    "NC": { path: "M865,175 L880,165 L885,170 L880,180 L865,185 L855,180 Z", name: "North Carolina" },
    "SC": { path: "M865,185 L880,180 L885,185 L875,195 Z", name: "South Carolina" },
    "GA": { path: "M865,185 L875,195 L870,210 L855,210 L850,195 Z", name: "Georgia" },
    "FL": { path: "M855,210 L870,210 L875,220 L885,230 L880,245 L865,250 L855,230 L850,215 Z", name: "Florida" },
    
    // Midwest Region
    "OH": { path: "M840,160 L850,145 L845,150 L840,160 L830,165 L825,155 Z", name: "Ohio" },
    "MI": { path: "M825,125 L830,120 L835,125 L830,130 L825,135 L820,140 L825,145 L830,140 L835,135 L840,140 L835,145 L825,155 Z", name: "Michigan" },
    "IN": { path: "M825,155 L830,165 L825,175 L815,170 L810,160 Z", name: "Indiana" },
    "IL": { path: "M810,160 L815,170 L810,180 L805,190 L795,180 L800,165 Z", name: "Illinois" },
    "WI": { path: "M800,135 L810,130 L820,140 L825,145 L810,160 L800,150 Z", name: "Wisconsin" },
    "MN": { path: "M775,125 L785,120 L795,125 L800,135 L795,145 L785,140 L775,135 Z", name: "Minnesota" },
    "IA": { path: "M775,150 L795,145 L800,150 L800,165 L780,165 Z", name: "Iowa" },
    "MO": { path: "M780,165 L800,165 L795,180 L790,190 L775,190 L770,175 Z", name: "Missouri" },
    "ND": { path: "M750,125 L775,125 L775,135 L750,135 Z", name: "North Dakota" },
    "SD": { path: "M750,135 L775,135 L775,150 L750,150 Z", name: "South Dakota" },
    "NE": { path: "M750,150 L775,150 L770,175 L745,175 Z", name: "Nebraska" },
    "KS": { path: "M745,175 L770,175 L775,190 L745,190 Z", name: "Kansas" },
    
    // Southwest Region
    "TX": { path: "M745,190 L775,190 L770,210 L780,230 L775,250 L760,260 L730,255 L725,230 L735,210 Z", name: "Texas" },
    "OK": { path: "M745,190 L775,190 L770,210 L735,210 Z", name: "Oklahoma" },
    "NM": { path: "M700,190 L735,190 L735,210 L725,230 L700,230 Z", name: "New Mexico" },
    "AZ": { path: "M670,190 L700,190 L700,230 L680,240 L665,230 Z", name: "Arizona" },
    "AR": { path: "M775,190 L790,190 L785,210 L780,230 L770,210 Z", name: "Arkansas" },
    "LA": { path: "M770,210 L780,230 L775,250 L760,260 L755,240 L765,230 Z", name: "Louisiana" },
    
    // West Region
    "CO": { path: "M700,170 L735,170 L735,190 L700,190 Z", name: "Colorado" },
    "WY": { path: "M700,150 L735,150 L735,170 L700,170 Z", name: "Wyoming" },
    "MT": { path: "M700,125 L750,125 L750,150 L700,150 Z", name: "Montana" },
    "ID": { path: "M670,125 L700,125 L700,170 L680,175 L675,165 L665,160 Z", name: "Idaho" },
    "WA": { path: "M650,125 L670,125 L665,140 L655,145 L645,135 Z", name: "Washington" },
    "OR": { path: "M645,135 L655,145 L665,140 L665,160 L650,170 L635,160 Z", name: "Oregon" },
    "NV": { path: "M650,170 L665,160 L675,165 L680,175 L680,200 L670,190 L665,180 Z", name: "Nevada" },
    "CA": { path: "M635,160 L650,170 L665,180 L670,190 L665,230 L650,225 L640,215 L630,180 Z", name: "California" },
    "AK": { path: "M600,300 L620,290 L635,295 L625,310 L605,315 Z", name: "Alaska" },
    "HI": { path: "M650,320 L655,315 L665,320 L660,325 Z", name: "Hawaii" },
    "UT": { path: "M680,175 L700,170 L700,190 L680,200 Z", name: "Utah" }
};

// Region definitions - which states belong to which regions
const regionDefinitions = {
    "Northeast": ["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA"],
    "Southeast": ["DE", "MD", "DC", "VA", "WV", "NC", "SC", "GA", "FL"],
    "Midwest": ["OH", "MI", "IN", "IL", "WI", "MN", "IA", "MO", "ND", "SD", "NE", "KS"],
    "Southwest": ["TX", "OK", "NM", "AZ", "AR", "LA"],
    "West": ["CO", "WY", "MT", "ID", "WA", "OR", "NV", "CA", "AK", "HI", "UT"]
};

// Function to initialize the map
function initializeMap(containerId) {
    const container = document.getElementById(containerId);
    
    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "600 100 300 200");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "auto");
    svg.setAttribute("class", "us-map");
    
    // Create a group for each region
    const regions = {};
    
    for (const [regionName, stateList] of Object.entries(regionDefinitions)) {
        const regionGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        regionGroup.setAttribute("id", `region-${regionName}`);
        regionGroup.setAttribute("class", "region");
        regionGroup.setAttribute("data-region", regionName);
        
        // Add event listeners to the region group
        regionGroup.addEventListener('mouseover', showRegionInfo);
        regionGroup.addEventListener('mouseout', hideRegionInfo);
        
        regions[regionName] = regionGroup;
        svg.appendChild(regionGroup);
    }
    
    // Add states to their respective regions
    for (const [stateCode, stateData] of Object.entries(usMapData)) {
        // Find which region this state belongs to
        let regionName = null;
        for (const [region, states] of Object.entries(regionDefinitions)) {
            if (states.includes(stateCode)) {
                regionName = region;
                break;
            }
        }
        
        if (regionName) {
            const statePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            statePath.setAttribute("d", stateData.path);
            statePath.setAttribute("id", `state-${stateCode}`);
            statePath.setAttribute("class", "state");
            statePath.setAttribute("data-state", stateCode);
            statePath.setAttribute("data-name", stateData.name);
            
            // Add state to its region group
            regions[regionName].appendChild(statePath);
            
            // Add state label
            const centroid = calculateCentroid(stateData.path);
            const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textElement.setAttribute("x", centroid.x);
            textElement.setAttribute("y", centroid.y);
            textElement.setAttribute("class", "state-label");
            textElement.textContent = stateCode;
            regions[regionName].appendChild(textElement);
        }
    }
    
    container.appendChild(svg);
}

// Function to calculate rough centroid of a path for label placement
function calculateCentroid(pathData) {
    const coordinates = pathData.split(/[ML,\s]/).filter(Boolean).map(Number);
    let sumX = 0, sumY = 0, count = 0;
    
    for (let i = 0; i < coordinates.length; i += 2) {
        sumX += coordinates[i];
        sumY += coordinates[i + 1];
        count++;
    }
    
    return { x: sumX / count, y: sumY / count };
}
