export type StoredObject = { key: string; size: number; contentType: string };

export interface StorageProvider {
  upload(key: string, content: Uint8Array, contentType: string): Promise<StoredObject>;
  download(key: string): Promise<Response>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
