# Translation Node Setup Form Implementation Todo List

## 1. Form Structure and UI
- [ ] Create a new setup form component for translation nodes
- [ ] Design a clean, professional UI consistent with existing components
- [ ] Implement form validation for all required fields
- [ ] Add form submission and cancel functionality

## 2. Node Name Field
- [ ] Add input field for node name with appropriate validation
- [ ] Ensure node name is properly saved to node data
- [ ] Update node display to show custom name

## 3. Input Documents URL Array
- [ ] Create a component to handle multiple document URL inputs
- [ ] Implement add/remove functionality for document URLs
- [ ] Add validation for URL format (e.g., "http://localhost:3000/file/coach.txt")
- [ ] Convert between URL format and document IDs for backend processing

## 4. Example Format URL Field
- [ ] Add input field for example format URL (PDF)
- [ ] Implement validation for PDF URL format
- [ ] Convert between URL format and document ID for backend processing

## 5. Instructions Field
- [ ] Integrate existing CustomInstructionEditor component
- [ ] Ensure instructions are properly saved to node data
- [ ] Add validation for minimum instruction length

## 6. Claude AI Integration
- [ ] Update TranslationAPI to handle URL-based document references
- [ ] Implement URL to document ID conversion for Claude processing
- [ ] Ensure proper error handling for Claude API calls
- [ ] Add progress indicators for translation processing

## 7. Node Integration
- [ ] Connect setup form to node creation/editing workflow
- [ ] Update EnhancedTranslationNode to display data from setup form
- [ ] Ensure node data is properly saved in ReactFlow
- [ ] Implement edit functionality for existing nodes

## 8. Testing and Validation
- [ ] Test form submission with various input combinations
- [ ] Verify Claude integration works with URL-based documents
- [ ] Test error handling and validation
- [ ] Ensure existing functionality is not broken
