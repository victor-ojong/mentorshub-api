import { CloudinaryProvider } from '@app/gateway/file-upload/providers/cloudinary.provider';
import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';

@Module({
  providers: [CloudinaryProvider, UploadService],
  exports: [CloudinaryProvider, UploadService],
})
export class UploadModule {}
