export interface FileItem {
  name: string;
  path: string;
}

export interface TransformationNodeData {
  label: string;
  description: string;
  sourceDoc: FileItem | null;
  templateDoc: FileItem | null;
  instruction: string;
  outputTemplate: string;
  model: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  outputDoc: FileItem | null;
} 
