/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_API_URL: string;
  VITE_API_KEY: string;
  VITE_AUTH0_DOMAIN: string;
  VITE_AUTH0_CLIENT_ID: string;
  VITE_AUTH0_AUDIENCE: string;
  VITE_APP_NAME: string;
  VITE_APP_VERSION: string;
  VITE_APP_ENV: string;
  VITE_MAX_FILE_SIZE: string;
  VITE_ALLOWED_FILE_TYPES: string;
  VITE_STORAGE_TYPE: string;
  VITE_S3_BUCKET: string;
  VITE_S3_REGION: string;
  VITE_ENABLE_ANALYTICS: string;
  VITE_ENABLE_LOGGING: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 