import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Initialize S3 client
export const s3 = new AWS.S3();

// Create S3 bucket if it doesn't exist
export const initializeS3 = async (): Promise<void> => {
  const bucketName = process.env.S3_BUCKET_NAME || 'simetrik-documents';
  
  try {
    // Check if bucket exists
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log(`S3 bucket '${bucketName}' already exists`);
  } catch (error: any) {
    if (error.code === 'NotFound' || error.code === 'NoSuchBucket') {
      // Create bucket if it doesn't exist
      try {
        await s3.createBucket({ Bucket: bucketName }).promise();
        console.log(`Created S3 bucket '${bucketName}'`);
        
        // Create folder structure
        const folders = [
          'documents/',
          'transformations/',
          'comparisons/',
          'integrations/',
          'communications/'
        ];
        
        for (const folder of folders) {
          await s3.putObject({
            Bucket: bucketName,
            Key: folder,
            Body: ''
          }).promise();
        }
        
        console.log('Created folder structure in S3 bucket');
      } catch (createError) {
        console.error('Error creating S3 bucket:', createError);
        throw createError;
      }
    } else {
      console.error('Error checking S3 bucket:', error);
      throw error;
    }
  }
};

// Helper function to upload file to S3
export const uploadToS3 = async (
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'documents'
): Promise<string> => {
  const bucketName = process.env.S3_BUCKET_NAME || 'simetrik-documents';
  const key = `${folder}/${fileName}`;
  
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: contentType
  };
  
  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

// Helper function to get file from S3
export const getFromS3 = async (key: string): Promise<AWS.S3.GetObjectOutput> => {
  const bucketName = process.env.S3_BUCKET_NAME || 'simetrik-documents';
  
  const params = {
    Bucket: bucketName,
    Key: key
  };
  
  try {
    return await s3.getObject(params).promise();
  } catch (error) {
    console.error('Error getting file from S3:', error);
    throw error;
  }
};

// Helper function to delete file from S3
export const deleteFromS3 = async (key: string): Promise<void> => {
  const bucketName = process.env.S3_BUCKET_NAME || 'simetrik-documents';
  
  const params = {
    Bucket: bucketName,
    Key: key
  };
  
  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};
