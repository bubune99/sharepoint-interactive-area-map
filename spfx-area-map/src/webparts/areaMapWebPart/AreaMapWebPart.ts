import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  PropertyPaneToggle,
  PropertyPaneButton,
  PropertyPaneDatePicker
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { sp } from '@pnp/sp';

import { AnalyticsService, IAnalyticsEvent } from './services/AnalyticsService';
import { ensureAnalyticsList } from './services/AnalyticsList.schema';
import { ensurePersonnelList } from './services/PersonnelList.schema';
import { AreaMapApp } from './components/AreaMapApp';

export interface IAreaMapWebPartProps {
  listName: string;
  analyticsListName: string;
  exportStartDate: Date;
  exportEndDate: Date;
  enableAnalytics: boolean;
  
  // Column mapping properties
  userColumn: string;
  firstNameColumn: string;
  lastNameColumn: string;
  preferredFirstNameColumn: string;
  emailColumn: string;
  profilePictureColumn: string;
  primaryAreasColumn: string;
  secondaryAreasColumn: string;
  managerColumn: string;
  regionColumn: string;
  jobTitleColumn: string;
  includeOnMapColumn: string;
}

export default class AreaMapWebPart extends BaseClientSideWebPart<IAreaMapWebPartProps> {
  private analyticsService: AnalyticsService;

  protected async onInit(): Promise<void> {
    await super.onInit();

    // Initialize PnPjs
    sp.setup({
      spfxContext: this.context
    });

    // Initialize analytics
    this.analyticsService = new AnalyticsService();

    // Ensure required lists exist
    if (this.properties.enableAnalytics) {
      await ensureAnalyticsList();
    }
    
    await ensurePersonnelList();
    
    return Promise.resolve();
  }

  public render(): void {
    const element: React.ReactElement = React.createElement(
      AreaMapApp,
      {
        listName: this.properties.listName || 'CAE Personnel',
        analyticsService: this.analyticsService,
        enableAnalytics: this.properties.enableAnalytics
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Area Map Configuration"
          },
          groups: [
            {
              groupName: "List Configuration",
              groupFields: [
                PropertyPaneTextField('listName', {
                  label: "Personnel List Name"
                })
              ]
            },
            {
              groupName: "Analytics Settings",
              groupFields: [
                PropertyPaneToggle('enableAnalytics', {
                  label: "Enable Analytics Tracking",
                  onText: "On",
                  offText: "Off"
                }),
                PropertyPaneDatePicker('exportStartDate', {
                  label: "Export Start Date",
                  disabled: !this.properties.enableAnalytics
                }),
                PropertyPaneDatePicker('exportEndDate', {
                  label: "Export End Date",
                  disabled: !this.properties.enableAnalytics
                }),
                PropertyPaneButton('exportAnalytics', {
                  text: "Export Analytics to CSV",
                  onClick: this.handleAnalyticsExport.bind(this),
                  disabled: !this.properties.enableAnalytics
                })
              ]
            }
          ]
        },
        {
          header: {
            description: "Column Mapping"
          },
          groups: [
            {
              groupName: "Basic Columns",
              groupFields: [
                PropertyPaneTextField('userColumn', {
                  label: "User Column",
                  value: "User"
                }),
                PropertyPaneTextField('firstNameColumn', {
                  label: "First Name Column",
                  value: "FirstName"
                }),
                PropertyPaneTextField('lastNameColumn', {
                  label: "Last Name Column",
                  value: "LastName"
                }),
                PropertyPaneTextField('emailColumn', {
                  label: "Email Column",
                  value: "Email"
                }),
                PropertyPaneTextField('jobTitleColumn', {
                  label: "Job Title Column",
                  value: "JobTitle"
                })
              ]
            },
            {
              groupName: "Area Mapping Columns",
              groupFields: [
                PropertyPaneTextField('primaryAreasColumn', {
                  label: "Primary Areas Column",
                  value: "PrimaryAreaIDs"
                }),
                PropertyPaneTextField('secondaryAreasColumn', {
                  label: "Secondary Areas Column",
                  value: "SecondaryAreaIDs"
                }),
                PropertyPaneTextField('regionColumn', {
                  label: "Region Column",
                  value: "Region"
                })
              ]
            },
            {
              groupName: "Advanced Columns",
              groupFields: [
                PropertyPaneTextField('preferredFirstNameColumn', {
                  label: "Preferred First Name Column",
                  value: "PreferredFirstName"
                }),
                PropertyPaneTextField('profilePictureColumn', {
                  label: "Profile Picture Column",
                  value: "ProfilePicture"
                }),
                PropertyPaneTextField('managerColumn', {
                  label: "Manager Column",
                  value: "Manager"
                }),
                PropertyPaneTextField('includeOnMapColumn', {
                  label: "Include On Map Column",
                  value: "IncludeOnMap"
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private async handleAnalyticsExport(): Promise<void> {
    try {
      const startDate = this.properties.exportStartDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
      const endDate = this.properties.exportEndDate || new Date();
      await this.analyticsService.exportToCSV(startDate, endDate);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  }

  private async logInteraction(event: Partial<IAnalyticsEvent>): Promise<void> {
    if (!this.properties.enableAnalytics) return;

    try {
      await this.analyticsService.logInteraction({
        ...event,
        timestamp: new Date().toISOString(),
        userId: this.context.pageContext.user.loginName,
        userEmail: this.context.pageContext.user.email,
        sessionId: this.analyticsService.getSessionId()
      } as IAnalyticsEvent);
    } catch (error) {
      console.error('Failed to log interaction:', error);
    }
  }
}
