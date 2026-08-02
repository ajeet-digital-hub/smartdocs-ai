import { franc, francAll } from "franc";

const languageMap: Record<string, string> = {
  eng: "English",
  spa: "Spanish",
  hin: "Hindi",
  fra: "French",
  // Add other languages as needed
};

/**
 * Detects the language of a given text.
 * @param text The input text.
 * @returns The detected language name (e.g., "English") or "Unknown".
 */
export function detectLanguage(text: string): string {
  // Use franc to get the three-letter ISO 639-3 code
  const langCode = franc(text);

  return languageMap[langCode] || "Unknown";
}