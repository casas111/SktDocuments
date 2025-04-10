export type AccessLevel = 'public' | 'private' | 'restricted';
export type DocumentType = 'input' | 'output' | 'template';

export interface DocumentMetadata {
  nodeId: string | null;
  nodeType: string | null;
  inputId: string | null;
  description: string;
  [key: string]: any;
}

export interface Document {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  type: DocumentType;
  uploadDate: Date;
  folderId: string;
  tags: string[];
  starred: boolean;
  locked: boolean;
  accessLevel: AccessLevel;
  url: string;
  content?: string;
  metadata: DocumentMetadata;
  sharedWith: string[];
}

export interface ApiDocument extends Omit<Document, 'uploadDate' | 'metadata'> {
  uploadDate: string | Date;
  metadata?: Partial<DocumentMetadata> & Record<string, any>;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
} 