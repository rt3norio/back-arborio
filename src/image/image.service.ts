import { Injectable, NotFoundException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageService {
  private s3: S3;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
    this.bucket = this.configService.get('AWS_S3_BUCKET');
  }

  async getPresignedUrl(fileName: string, fileType: string, userId: string) {
    const key = `${userId}/${Date.now()}-${fileName}`;
    const params = {
      Bucket: this.bucket,
      Key: key,
      ContentType: fileType,
      Expires: 300,
    };

    try {
      const uploadUrl = await this.s3.getSignedUrlPromise('putObject', params);
      const imageUrl = `https://${this.bucket}.s3.amazonaws.com/${key}`;

      return {
        uploadUrl,
        imageUrl,
      };
    } catch (error) {
      throw new Error('Failed to generate presigned URL');
    }
  }

  async getCustomerImages(userId: string) {
    try {
      const params = {
        Bucket: this.bucket,
        Prefix: `${userId}/`,
      };

      const response = await this.s3.listObjectsV2(params).promise();
      return (response.Contents || []).map(
        (obj) => `https://${this.bucket}.s3.amazonaws.com/${obj.Key}`,
      );
    } catch (error) {
      console.error('Error listing customer images:', error);
      return [];
    }
  }

  async deleteImage(key: string, userId: string) {
    try {
      // List all objects with the user's prefix
      const params = {
        Bucket: this.bucket,
        Prefix: `${userId}/`,
      };

      const response = await this.s3.listObjectsV2(params).promise();

      const userObjects = response.Contents || [];

      // Find the object that ends with the provided key
      const objectToDelete = userObjects.find((obj) => obj.Key.endsWith(key));

      if (!objectToDelete) {
        throw new NotFoundException('Image not found or access denied');
      }

      await this.s3
        .deleteObject({
          Bucket: this.bucket,
          Key: objectToDelete.Key,
        })
        .promise();

      return { success: true };
    } catch (error) {
      console.error('Error deleting image:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to delete image');
    }
  }
}
