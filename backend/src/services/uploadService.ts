import { cloudinary } from '../configs/cloudinary';

type ResourceType = 'image' | 'auto';

export class UploadService {
  // Shared by both named methods below — only the Cloudinary resource_type
  // differs between an image-only upload and a mixed image/PDF one.
  private upload = (buffer: Buffer, folder: string, resourceType: ResourceType): Promise<string> => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType }, (err, result) => {
        if (err || !result) {
          reject(err);
          return;
        }
        resolve(result.secure_url);
      });
      stream.end(buffer);
    });
  };

  Image = (buffer: Buffer, folder = 'ttm'): Promise<string> => {
    return this.upload(buffer, folder, 'image');
  };

  // Task attachments can be images or PDFs — 'auto' lets Cloudinary detect
  // which resource type to store it as.
  File = (buffer: Buffer, folder = 'ttm/attachments'): Promise<string> => {
    return this.upload(buffer, folder, 'auto');
  };
}
