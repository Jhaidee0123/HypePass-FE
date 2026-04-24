import axios from 'axios';
import { UploadImage, UploadImageResult } from '@/domain/usecases';

export class RemoteUploadImage implements UploadImage {
  constructor(private readonly apiEndpoint: string) {}

  async upload(file: File): Promise<UploadImageResult> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await axios.post<UploadImageResult>(
      `${this.apiEndpoint}/upload/image`,
      form,
      {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return data;
  }
}
