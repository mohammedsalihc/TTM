import api from './api';

export const uploadImageRequest = (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  return api
    .post<{ url: string }>('/api/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data.url);
};
