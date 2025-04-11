# Translate Node Implementation Todo List

## Overview
Implement the "translate" node in the workflows section that:
- Takes 2 files from the "documents" section and 1 template file (PDF) as inputs
- Allows users to add custom instructions to Claude
- Outputs a file with the format of the template populated with data from the input files
- Saves the output file in a new "translations" folder in the "documents" section
- Has a professional, world-class UI like a top SaaS company

## Tasks

### 1. Backend Integration
- [ ] Examine existing Claude integration in the backend
- [ ] Extend claudeController.js to handle document translation with template
- [ ] Add endpoint for processing multiple files with a template
- [ ] Implement functionality to create "translations" folder if it doesn't exist
- [ ] Add file saving logic to store output in the "translations" folder

### 2. TranslationNode Component Updates
- [ ] Update TranslationNode.tsx to support 2 document inputs + 1 template input
- [ ] Add UI for selecting the 2 input documents
- [ ] Add UI for selecting the template PDF
- [ ] Implement custom instruction input field with proper styling
- [ ] Update node appearance to match professional SaaS design standards
- [ ] Add proper validation for inputs (2 docs + 1 template required)

### 3. File Selection and Management
- [ ] Implement document selector component for the 2 input files
- [ ] Implement template selector component for the PDF template
- [ ] Add preview functionality for selected files
- [ ] Ensure proper error handling for file selection
- [ ] Add file type validation (ensure template is PDF)

### 4. Custom Instruction Functionality
- [ ] Design and implement UI for custom instruction input
- [ ] Add instruction validation and character limits if needed
- [ ] Implement instruction preview/confirmation
- [ ] Ensure instructions are properly sent to Claude

### 5. Translation Processing
- [ ] Implement the translation process flow
- [ ] Connect node inputs to Claude API call
- [ ] Handle Claude API responses
- [ ] Implement error handling for API failures
- [ ] Add progress indicators during translation

### 6. Output Handling
- [ ] Create "translations" folder in documents section if it doesn't exist
- [ ] Implement file saving logic for translated output
- [ ] Add output file preview functionality
- [ ] Implement download option for translated file
- [ ] Add notification for successful translation

### 7. UI/UX Improvements
- [ ] Enhance node styling for professional appearance
- [ ] Add tooltips and help text for better usability
- [ ] Implement loading states and animations
- [ ] Add success/error feedback mechanisms
- [ ] Ensure responsive design for all components

### 8. Testing
- [ ] Test with various document types and templates
- [ ] Test custom instruction variations
- [ ] Verify output file format matches template
- [ ] Test error scenarios and recovery
- [ ] Ensure existing workflow functionality is preserved

### 9. Documentation
- [ ] Document the translate node functionality
- [ ] Add inline code comments
- [ ] Create usage examples
- [ ] Document API endpoints and parameters

## Important Notes
- DO NOT modify the "documents" section functionality
- DO NOT break existing canvas functionality
- Preserve the memory/state of the canvas
- Ensure professional, world-class UI design
