// This file serves as a centralized export point for all document-related components
// It helps clean up imports in other files and makes it clear which components should be used

// Export the enhanced/improved components that should be used in the application
export { default as DocumentExplorer } from './EnhancedDocumentExplorer';
export { default as FileViewer } from './EnhancedFileViewer';
export { default as FolderTree } from './ImprovedFolderTree';
export { default as FolderManager } from './EnhancedFolderManager';

// Note: The following components are kept for reference but should not be used directly
// They are being phased out in favor of the enhanced versions above
// export { default as LegacyDocumentExplorer } from './DocumentExplorer';
// export { default as LegacyDocumentsDrive } from './DocumentsDrive';
// export { default as LegacyEnhancedFolderTree } from './EnhancedFolderTree';
// export { default as LegacyFolderManager } from './FolderManager';
