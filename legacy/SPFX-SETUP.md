# Setting Up SPFx Development Environment

Follow these steps to set up your SharePoint Framework development environment:

## Prerequisites

1. **Node.js**: Install Node.js LTS version (currently 16.x)
   - Download from: https://nodejs.org/

2. **npm**: Ensure npm is installed (comes with Node.js)
   - Recommended version: 8.x or higher

3. **Yeoman and Gulp**: Install globally
   ```bash
   npm install -g yo gulp
   ```

4. **SharePoint Framework Generator**: Install globally
   ```bash
   npm install -g @microsoft/generator-sharepoint
   ```

5. **Visual Studio Code**: Recommended code editor
   - Download from: https://code.visualstudio.com/

## Create a New SPFx Web Part Project

1. Create a new directory for your project
   ```bash
   mkdir spfx-interactive-area-map
   cd spfx-interactive-area-map
   ```

2. Generate a new SPFx web part project
   ```bash
   yo @microsoft/sharepoint
   ```

3. Follow the prompts:
   - **Solution Name**: InteractiveAreaMap
   - **Baseline packages**: SharePoint Online only (latest)
   - **Target location**: SharePoint Online only
   - **Place files**: Create a subfolder with solution name
   - **Deployment option**: Tenant-scoped
   - **Permission access**: WebAPI permission requests
   - **Type of client-side component**: WebPart
   - **Web part name**: InteractiveAreaMap
   - **Description**: Interactive US area map with SharePoint list integration
   - **Framework**: React

4. Wait for the project to be generated and dependencies to be installed

## Project Structure

After generation, your project will have the following structure:

```
spfx-interactive-area-map/
├── config/                  # Configuration files
├── node_modules/            # Node.js dependencies
├── src/                     # Source code
│   ├── webparts/            # Web part code
│   │   └── interactiveAreaMap/  # Your web part
│   │       ├── components/  # React components
│   │       ├── loc/         # Localization
│   │       └── InteractiveAreaMapWebPart.ts  # Main web part file
├── .gitignore               # Git ignore file
├── gulpfile.js              # Gulp tasks
├── package.json             # npm package configuration
└── tsconfig.json            # TypeScript configuration
```

## Serve the Web Part for Testing

1. Run the following command to start the local development server:
   ```bash
   gulp serve
   ```

2. This will open a workbench page where you can test your web part

## Build and Package the Web Part

1. Build the web part:
   ```bash
   gulp build
   ```

2. Bundle and package the web part:
   ```bash
   gulp bundle --ship
   gulp package-solution --ship
   ```

3. The packaged solution will be in the `sharepoint/solution` folder with a `.sppkg` extension

## Deploy the Web Part

1. Upload the `.sppkg` file to your SharePoint App Catalog
2. Deploy the web part to your site
3. Add the web part to a page

For more detailed information, refer to the [official SharePoint Framework documentation](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/build-a-hello-world-web-part).
