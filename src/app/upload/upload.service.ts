//eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';
import toStream = require('buffer-to-stream');
import { Injectable } from '@nestjs/common';
import { v2, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadService {
  async uploadFile(
    profileImg: Express.Multer.File
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });

      toStream(profileImg.buffer).pipe(upload);
    });
  }
}
