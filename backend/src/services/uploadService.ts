import { cloudinary } from '../configs/cloudinary';

export class UploadService {
  Image = (buffer: Buffer, folder = 'ttm'): Promise<string> => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (err, result) => {
        if (err || !result) {
          reject(err);
          return;
        }
        resolve(result.secure_url);
      });
      stream.end(buffer);
    });
  };
}
