/**
 * Add deleteFile method to unifiedDocumentService.js
 */
async deleteFile(filePath) {
  try {
    // Try to delete from documents API first
    try {
      const documentsResponse = await axios.delete(`${DOCUMENTS_API}/${encodeURIComponent(filePath)}`);
      
      // Also delete in files API for consistency
      try {
        await axios.delete(`${FILES_API}/${encodeURIComponent(filePath)}`);
        console.log('File also deleted in files API');
      } catch (filesError) {
        console.warn('Error deleting file in files API (continuing anyway):', filesError);
      }
      
      return {
        success: true,
        message: documentsResponse.data?.message || 'File deleted successfully'
      };
    } catch (documentsError) {
      console.warn('Error deleting file in documents API, falling back to files API:', documentsError);
      
      // Fallback to files API
      const filesResponse = await axios.delete(`${FILES_API}/${encodeURIComponent(filePath)}`);
      
      return {
        success: filesResponse.data?.success || true,
        message: filesResponse.data?.message || 'File deleted successfully'
      };
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete file'
    };
  }
}
