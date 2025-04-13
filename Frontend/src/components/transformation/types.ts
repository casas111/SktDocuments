export interface FileItem {
  name: string;
  path: string;
}

export interface TransformationNodeData {
  label: string;
  description: string;
  sourceDoc1: FileItem | null;
  sourceDoc2: FileItem | null;
  templateDoc: FileItem | null;
  instruction: string;
  model: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  outputDoc: FileItem | null;
} 
