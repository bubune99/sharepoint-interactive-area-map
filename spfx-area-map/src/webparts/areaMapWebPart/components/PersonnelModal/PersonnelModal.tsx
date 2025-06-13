import * as React from 'react';
import { useEffect } from 'react';
import {
  Modal,
  IModalProps,
  IconButton,
  PersonaSize,
  Persona,
  IPersonaProps,
  Text,
  Stack,
  IStackTokens
} from '@fluentui/react';
import { IPersonnelData } from '../../services/PersonnelList.schema';
import styles from './PersonnelModal.module.scss';

export interface IPersonnelModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  title: string;
  subtitle?: string;
  personnel: IPersonnelData[];
  onPersonnelView?: (personnelId: string) => void;
}

const stackTokens: IStackTokens = {
  childrenGap: 16,
  padding: 16
};

export const PersonnelModal: React.FC<IPersonnelModalProps> = ({
  isOpen,
  onDismiss,
  title,
  subtitle,
  personnel,
  onPersonnelView
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onDismiss();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onDismiss]);

  const getPersonaProps = (person: IPersonnelData): IPersonaProps => ({
    imageUrl: person.ProfilePicture,
    text: person.PreferredFirstName ? `${person.PreferredFirstName} ${person.LastName}` : `${person.FirstName} ${person.LastName}`,
    secondaryText: person.JobTitle,
    tertiaryText: person.Email,
    optionalText: `Manager: ${person.Manager}`,
    size: PersonaSize.size72
  });

  const renderPersonnelCard = (person: IPersonnelData) => {
    const primaryAreas = person.PrimaryAreaIDs?.join(', ') || '';
    const secondaryAreas = person.SecondaryAreaIDs?.join(', ') || '';

    return (
      <div 
        key={person.Email}
        className={styles.personnelCard}
        onClick={() => onPersonnelView && onPersonnelView(person.Email)}
      >
        <Persona {...getPersonaProps(person)} />
        
        <Stack tokens={stackTokens}>
          {primaryAreas && (
            <div className={styles.areaSection}>
              <Text variant="smallPlus" className={styles.areaLabel}>Primary Areas:</Text>
              <Text variant="small" className={styles.areaPrimary}>{primaryAreas}</Text>
            </div>
          )}
          
          {secondaryAreas && (
            <div className={styles.areaSection}>
              <Text variant="smallPlus" className={styles.areaLabel}>Secondary Areas:</Text>
              <Text variant="small" className={styles.areaSecondary}>{secondaryAreas}</Text>
            </div>
          )}

          <div className={styles.regionBadge}>
            {person.Region}
          </div>
        </Stack>
      </div>
    );
  };

  const modalProps: IModalProps = {
    isOpen,
    onDismiss,
    isBlocking: false,
    styles: {
      main: {
        minWidth: '600px',
        maxWidth: '800px'
      }
    }
  };

  return (
    <Modal {...modalProps}>
      <div className={styles.header}>
        <div>
          <Text variant="xLarge" className={styles.title}>{title}</Text>
          {subtitle && (
            <Text variant="medium" className={styles.subtitle}>{subtitle}</Text>
          )}
        </div>
        <IconButton
          iconProps={{ iconName: 'Cancel' }}
          onClick={onDismiss}
          className={styles.closeButton}
        />
      </div>

      <div className={styles.content}>
        {personnel.length === 0 ? (
          <div className={styles.noResults}>
            No personnel found for the selected criteria.
          </div>
        ) : (
          <Stack tokens={stackTokens}>
            {personnel.map(renderPersonnelCard)}
          </Stack>
        )}
      </div>
    </Modal>
  );
};
