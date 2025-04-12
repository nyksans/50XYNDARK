import apiClient from './api-client';

const processBill = async (file: File | Blob) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/api/bills/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // Extended timeout for large files
  });
  return data;
};

const processCameraBill = async (imageBlob: Blob) => {
  const formData = new FormData();
  formData.append('file', imageBlob, 'camera-bill.jpg');
  return processBill(imageBlob);
};

export const billApi = {
  processBill,
  processCameraBill,
};

export default billApi;