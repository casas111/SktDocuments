// Update app.js to include the new file metadata routes
const fileMetadataRoutes = require('./routes/fileMetadataRoutes');

// Add this line after the existing routes
app.use('/api/files', fileMetadataRoutes);
