import { createHash } from "crypto";
import type { StorageProvider, StoredObject } from "./storage-provider";

type Authorization = { authorizationToken: string; apiInfo: { storageApi: { apiUrl: string; downloadUrl: string; recommendedPartSize: number } } };
type UploadUrl = { uploadUrl: string; authorizationToken: string };
type ListedFile = { fileId: string; fileName: string };
type DownloadAuthorization = { authorizationToken: string };
type ListFiles = { files: ListedFile[] };

export class StorageConfigurationError extends Error {}

export class BackblazeProvider implements StorageProvider {
  private readonly keyId = process.env.B2_KEY_ID;
  private readonly applicationKey = process.env.B2_APPLICATION_KEY;
  private readonly bucketId = process.env.B2_BUCKET_ID;
  private readonly bucketName = process.env.B2_BUCKET_NAME;

  async upload(key: string, content: Uint8Array, contentType: string): Promise<StoredObject> {
    const authorization = await this.authorize();
    const uploadUrl = await this.request<UploadUrl>(`${authorization.apiInfo.storageApi.apiUrl}/b2api/v3/b2_get_upload_url`, authorization.authorizationToken, { bucketId: this.required(this.bucketId, "B2_BUCKET_ID") });
    const response = await fetch(uploadUrl.uploadUrl, { method: "POST", headers: { Authorization: uploadUrl.authorizationToken, "X-Bz-File-Name": encodeURIComponent(key), "Content-Type": contentType, "X-Bz-Content-Sha1": createHash("sha1").update(content).digest("hex") }, body: new Uint8Array(content).buffer });
    if (!response.ok) throw new Error("Object storage upload failed.");
    return { key, size: content.byteLength, contentType };
  }

  async download(key: string): Promise<Response> {
    const authorization = await this.authorize();
    const bucketName = this.required(this.bucketName, "B2_BUCKET_NAME");
    const response = await fetch(`${authorization.apiInfo.storageApi.downloadUrl}/file/${encodeURIComponent(bucketName)}/${encodeURIComponent(key)}`, { headers: { Authorization: authorization.authorizationToken } });
    if (!response.ok) throw new Error("Object storage download failed.");
    return response;
  }

  async delete(key: string): Promise<void> {
    const authorization = await this.authorize();
    const file = await this.findFile(authorization, key);
    if (!file) return;
    await this.request(`${authorization.apiInfo.storageApi.apiUrl}/b2api/v3/b2_delete_file_version`, authorization.authorizationToken, { fileName: file.fileName, fileId: file.fileId });
  }

  async exists(key: string): Promise<boolean> { return Boolean(await this.findFile(await this.authorize(), key)); }

  async getSignedDownloadUrl(key: string, expiresInSeconds: number = 900): Promise<string> {
    const authorization = await this.authorize();
    const bucketName = this.required(this.bucketName, "B2_BUCKET_NAME");
    const downloadAuth = await this.request<DownloadAuthorization>(`${authorization.apiInfo.storageApi.apiUrl}/b2api/v3/b2_get_download_authorization`, authorization.authorizationToken, {
      bucketId: this.required(this.bucketId, "B2_BUCKET_ID"),
      fileNamePrefix: key,
      validDurationInSeconds: expiresInSeconds,
    });
    return `${authorization.apiInfo.storageApi.downloadUrl}/file/${encodeURIComponent(bucketName)}/${encodeURIComponent(key)}?Authorization=${downloadAuth.authorizationToken}`;
  }

  private async findFile(authorization: Authorization, key: string): Promise<ListedFile | undefined> {
    const result = await this.request<ListFiles>(`${authorization.apiInfo.storageApi.apiUrl}/b2api/v3/b2_list_file_names`, authorization.authorizationToken, { bucketId: this.required(this.bucketId, "B2_BUCKET_ID"), startFileName: key, maxFileCount: 1 });
    return result.files[0]?.fileName === key ? result.files[0] : undefined;
  }

  private async authorize(): Promise<Authorization> {
    const response = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", { headers: { Authorization: `Basic ${Buffer.from(`${this.required(this.keyId, "B2_KEY_ID")}:${this.required(this.applicationKey, "B2_APPLICATION_KEY")}`).toString("base64")}` } });
    if (!response.ok) throw new Error("Object storage authorization failed.");
    return response.json() as Promise<Authorization>;
  }

  private async request<T = undefined>(url: string, token: string, body: object): Promise<T> {
    const response = await fetch(url, { method: "POST", headers: { Authorization: token, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error("Object storage request failed.");
    return response.json() as Promise<T>;
  }

  private required(value: string | undefined, name: string): string { if (!value) throw new StorageConfigurationError(`${name} is not configured.`); return value; }
}
