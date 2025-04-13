export const API_BASE_URL = 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  DOCUMENTS: {
    UPLOAD: '/documents/upload',
    GET_ALL: '/documents',
    GET_BY_ID: (id: string) => `/documents/${id}`,
    DOWNLOAD: (id: string) => `/documents/${id}/download`,
    DELETE: (id: string) => `/documents/${id}`,
  },
  WORKFLOW: {
    TRANSFORM: '/workflow/transform',
    COMMUNICATE: '/workflow/communicate',
    COMPARE: '/workflow/compare',
    SIMETRIK: '/workflow/simetrik',
    STATUS: (id: string) => `/workflow/status/${id}`,
    ALL_STATUSES: '/workflow/status',
  },
};
