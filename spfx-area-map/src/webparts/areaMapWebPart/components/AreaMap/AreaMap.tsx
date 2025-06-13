import * as React from 'react';
import { useEffect, useState } from 'react';
import { IPersonnelData } from '../../services/PersonnelList.schema';
import styles from './AreaMap.module.scss';

export interface IAreaMapProps {
  onAreaClick: (areaCode: string, areaName: string, region: string) => void;
  selectedArea?: string;
  personnel: IPersonnelData[];
}

export const AreaMap: React.FC<IAreaMapProps> = ({ onAreaClick, selectedArea, personnel }) => {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  useEffect(() => {
    // Initialize map interactions
    const paths = document.querySelectorAll('path');
    paths.forEach(path => {
      path.classList.remove('selected');
      if (path.id === selectedArea) {
        path.classList.add('selected');
      }
    });
  }, [selectedArea]);

  const handleAreaClick = (e: React.MouseEvent<SVGPathElement>) => {
    const path = e.currentTarget;
    const areaCode = path.id;
    const areaName = path.getAttribute('data-name') || areaCode;
    let region = 'East';
    
    if (areaCode.startsWith('B')) {
      region = 'Central';
    } else if (areaCode.startsWith('C')) {
      region = 'West';
    }

    onAreaClick(areaCode, areaName, region);
  };

  const handleAreaHover = (e: React.MouseEvent<SVGPathElement>, isEnter: boolean) => {
    const path = e.currentTarget;
    if (!path.classList.contains('selected')) {
      if (isEnter) {
        setHoveredArea(path.id);
        path.style.opacity = '0.9';
        path.style.filter = 'brightness(1.3) saturate(1.2)';
      } else {
        setHoveredArea(null);
        path.style.opacity = '0.7';
        path.style.filter = 'none';
      }
    }
  };

  const getAreaPersonnelCount = (areaCode: string): number => {
    return personnel.filter(person => 
      (person.PrimaryAreaIDs && person.PrimaryAreaIDs.includes(areaCode)) ||
      (person.SecondaryAreaIDs && person.SecondaryAreaIDs.includes(areaCode))
    ).length;
  };

  return (
    <div className={styles.mapContainer}>
      <svg className={styles.svgMap} viewBox="0 0 800 500">
        {/* We'll add the SVG paths here based on your existing map */}
        {/* Each path will have event handlers */}
        <path
          id="A01"
          data-name="Baltimore Coast"
          d="..."
          onClick={handleAreaClick}
          onMouseEnter={(e) => handleAreaHover(e, true)}
          onMouseLeave={(e) => handleAreaHover(e, false)}
          className={hoveredArea === 'A01' ? styles.hovered : ''}
        />
        {/* Add other paths here */}
      </svg>
      
      {hoveredArea && (
        <div className={styles.areaTooltip}>
          Personnel: {getAreaPersonnelCount(hoveredArea)}
        </div>
      )}
    </div>
  );
};
