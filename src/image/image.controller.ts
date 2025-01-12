import { Controller, Post, Get, Body, Delete, Param } from '@nestjs/common';
import { ImageService } from './image.service';
import { Authentication, CognitoUser } from '@nestjs-cognito/auth';

interface PresignedUrlDto {
  fileName: string;
  fileType: string;
}

@Controller('images')
@Authentication()
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('presigned-url')
  async getPresignedUrl(
    @Body() dto: PresignedUrlDto,
    @CognitoUser('sub') userId: string,
  ) {
    return this.imageService.getPresignedUrl(
      dto.fileName,
      dto.fileType,
      userId,
    );
  }

  @Get()
  async getCustomerImages(@CognitoUser('sub') userId: string) {
    return this.imageService.getCustomerImages(userId);
  }

  @Delete(':key')
  async deleteImage(
    @Param('key') key: string,
    @CognitoUser('sub') userId: string,
  ) {
    return this.imageService.deleteImage(key, userId);
  }
}
