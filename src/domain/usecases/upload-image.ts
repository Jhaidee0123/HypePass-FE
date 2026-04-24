export type UploadImageResult = {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
};

export interface UploadImage {
  upload(file: File): Promise<UploadImageResult>;
}
