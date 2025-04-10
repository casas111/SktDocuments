# Windows Installation Guide for Enterprise Workflow UI

This guide will walk you through the process of setting up and running the Enterprise Workflow UI application on a Windows machine.

## Prerequisites

Before you begin, ensure you have the following installed on your Windows machine:

1. **Node.js** (version 16.x or later)
   - Download from: https://nodejs.org/en/download/
   - During installation, make sure to check the option to install necessary tools

2. **Git** (optional, for version control)
   - Download from: https://git-scm.com/download/win

3. **Visual Studio Code** (recommended, but any code editor will work)
   - Download from: https://code.visualstudio.com/download

## Installation Steps

### 1. Extract the Project Files

1. Locate the `workflow-ui-export.zip` file you received
2. Right-click the file and select "Extract All..."
3. Choose a destination folder (e.g., `C:\Projects\workflow-ui`)
4. Click "Extract"

### 2. Install Dependencies

1. Open Command Prompt or PowerShell
   - Press `Win + R`, type `cmd` or `powershell`, and press Enter

2. Navigate to the project directory:
   ```
   cd C:\Projects\workflow-ui
   ```
   (Replace with your actual path)

3. Install the required dependencies:
   ```
   npm install
   ```
   This may take several minutes as it downloads all necessary packages.

### 3. Start the Development Server

1. In the same Command Prompt or PowerShell window, run:
   ```
   npm start
   ```

2. The application should automatically open in your default web browser at `http://localhost:3000`
   - If it doesn't open automatically, manually navigate to this URL

## Troubleshooting

### If you encounter "node-gyp" related errors:

1. Install Windows Build Tools by running as Administrator:
   ```
   npm install --global --production windows-build-tools
   ```

### If you see "ENOENT: no such file or directory":

1. Make sure you're in the correct directory
2. Try deleting the `node_modules` folder and running `npm install` again

### If you get "Error: EPERM: operation not permitted":

1. Close any applications that might be using the project files
2. Try running Command Prompt or PowerShell as Administrator

## Building for Production

If you want to create a production build:

1. Run the following command:
   ```
   npm run build
   ```

2. The optimized files will be created in the `build` folder

3. To serve the production build locally, you can use:
   ```
   npx serve -s build
   ```

4. Access the production version at `http://localhost:5000`

## Deploying to a Web Server

To deploy the application to a web server:

1. Create a production build as described above
2. Copy all files from the `build` folder to your web server's public directory
3. Configure your web server to serve the `index.html` file for all routes

For IIS (Internet Information Services):
1. Create a new website in IIS Manager
2. Set the physical path to your build folder
3. Add a URL Rewrite rule to redirect all requests to index.html
