import { config } from '@app/config';
import { v2 } from 'cloudinary';

const CLOUDINARY = 'Cloudinary';
export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: () => {
    return v2.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    });
  },
};
