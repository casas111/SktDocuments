const axios = require('axios');

// Test script for tags functionality
const testTagsFunctionality = async () => {
  console.log('Starting tags functionality test...');
  const API_URL = 'http://localhost:3001/api';
  
  try {
    // Test tag creation
    console.log('--- Testing tag creation ---');
    const testTagName = `Test Tag ${Date.now()}`;
    const testTagColor = '#ff5722';
    
    console.log(`Creating tag: ${testTagName} with color: ${testTagColor}`);
    const createResponse = await axios.post(`${API_URL}/tags`, {
      name: testTagName,
      color: testTagColor
    });
    
    if (createResponse.data.success) {
      console.log('✅ Tag created successfully:', createResponse.data.tag);
      
      // Test tag retrieval
      console.log('--- Testing tag retrieval ---');
      const tagId = createResponse.data.tag.id;
      
      console.log('Getting all tags to verify tag appears in list');
      const tagsResponse = await axios.get(`${API_URL}/tags`);
      
      if (tagsResponse.data.success) {
        const tags = tagsResponse.data.tags;
        const foundTag = tags.find(tag => tag.id === tagId);
        
        if (foundTag) {
          console.log('✅ Tag found in tags list:', foundTag);
        } else {
          console.log('❌ Tag not found in tags list');
        }
        
        // Test tag update
        console.log('--- Testing tag update ---');
        const updatedTagName = `${testTagName} Updated`;
        const updatedTagColor = '#2196f3';
        
        console.log(`Updating tag: ${tagId} with new name: ${updatedTagName} and color: ${updatedTagColor}`);
        const updateResponse = await axios.put(`${API_URL}/tags/${tagId}`, {
          name: updatedTagName,
          color: updatedTagColor
        });
        
        if (updateResponse.data.success) {
          console.log('✅ Tag updated successfully:', updateResponse.data.tag);
        } else {
          console.log('❌ Failed to update tag:', updateResponse.data.error);
        }
        
        // Test adding tag to document
        console.log('--- Testing adding tag to document ---');
        
        // First, get a document to tag
        console.log('Getting documents to find one to tag');
        const documentsResponse = await axios.get(`${API_URL}/documents`);
        
        if (documentsResponse.data.success && documentsResponse.data.documents && documentsResponse.data.documents.length > 0) {
          const document = documentsResponse.data.documents[0];
          console.log(`Found document to tag: ${document.id} - ${document.originalName}`);
          
          console.log(`Adding tag ${tagId} to document ${document.id}`);
          const addTagResponse = await axios.post(`${API_URL}/tags/document/${document.id}/tag/${tagId}`);
          
          if (addTagResponse.data.success) {
            console.log('✅ Tag added to document successfully:', addTagResponse.data.document);
            
            // Test removing tag from document
            console.log('--- Testing removing tag from document ---');
            console.log(`Removing tag ${tagId} from document ${document.id}`);
            const removeTagResponse = await axios.delete(`${API_URL}/tags/document/${document.id}/tag/${tagId}`);
            
            if (removeTagResponse.data.success) {
              console.log('✅ Tag removed from document successfully:', removeTagResponse.data.document);
            } else {
              console.log('❌ Failed to remove tag from document:', removeTagResponse.data.error);
            }
          } else {
            console.log('❌ Failed to add tag to document:', addTagResponse.data.error);
          }
        } else {
          console.log('❌ No documents found to test tagging');
        }
        
        // Test tag deletion
        console.log('--- Testing tag deletion ---');
        console.log(`Deleting tag: ${tagId}`);
        const deleteResponse = await axios.delete(`${API_URL}/tags/${tagId}`);
        
        if (deleteResponse.data.success) {
          console.log('✅ Tag deleted successfully');
          
          // Verify tag is deleted
          console.log('Getting all tags to verify tag is deleted');
          const verifyDeleteResponse = await axios.get(`${API_URL}/tags`);
          
          if (verifyDeleteResponse.data.success) {
            const tagsAfterDelete = verifyDeleteResponse.data.tags;
            const tagStillExists = tagsAfterDelete.some(tag => tag.id === tagId);
            
            if (!tagStillExists) {
              console.log('✅ Tag successfully deleted from tags list');
            } else {
              console.log('❌ Tag still exists in tags list after deletion');
            }
          } else {
            console.log('❌ Failed to verify tag deletion:', verifyDeleteResponse.data.error);
          }
        } else {
          console.log('❌ Failed to delete tag:', deleteResponse.data.error);
        }
      } else {
        console.log('❌ Failed to get tags:', tagsResponse.data.error);
      }
    } else {
      console.log('❌ Failed to create tag:', createResponse.data.error);
    }
  } catch (error) {
    console.error('Error during tags functionality test:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
  
  console.log('Tags functionality test completed');
};

// Execute the test
testTagsFunctionality();
