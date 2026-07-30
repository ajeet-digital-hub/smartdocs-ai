/**
 * Language & Translation API client
 * Communicates with the Next.js API routes under /api/language/*
 */

import { apiFetch } from "./api";
import { FileType } from "@/models/TranslationJob";

// ─── Translation ───

export interface StartTranslationResponse {
  jobId: string;
  status: string;
}

/**
 * Kicks off a document translation job.
 * @param data - The details of the file to be translated.
 */
export async function startFileTranslation(data: {
  fileName: string;
  fileType: FileType;
  fileSize: number;
  sourceLang: string;
  targetLang: string;
  fileUrl: string; // This would be a URL from a blob storage like S3
}) {
  return apiFetch<{ ok: boolean; data: StartTranslationResponse }>("/language/translate/file", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Fetches the status of a specific translation job.
 * @param jobId - The ID of the translation job.
 */
export async function getTranslationJobStatus(jobId: string) {
  return apiFetch<{ ok: boolean; data: any }>(`/language/translate/file/${jobId}`);
}

/**
 * Fetches the user's translation history.
 */
export async function getTranslationHistory() {
  return apiFetch<{ ok: boolean; data: any[] }>("/language/translate/history");
}