import type { OCRProvider, OCRProviderOptions, OCRResult, OCRPage } from "./ocr-provider";

const TESSERACT_LANGUAGES: Record<string, string> = {
  eng: "English",
  // hin: "Hindi",          // Hindi pack – uncomment only when installed
  // spa: "Spanish",        // Spanish pack – uncomment only when installed
  // fra: "French",         // French pack – uncomment only when installed
  // deu: "German",         // German pack – uncomment only when installed
};

export class TesseractNotAvailableError extends Error {
  constructor(message = "The OCR service is currently unavailable or not configured.") {
    super(
      message
    );
    this.name = "TesseractNotAvailableError";
  }
}

export class TesseractOCRProvider implements OCRProvider {
  readonly name = "SmartDocs OCR Service";
  readonly supportedLanguages: string[];
  public isAvailable: boolean = false;

  private readonly serviceUrl: string;
  private readonly serviceToken: string;

  constructor() {
    this.serviceUrl = process.env.OCR_SERVICE_URL || "";
    this.serviceToken = process.env.OCR_SERVICE_TOKEN || "";
    this.supportedLanguages = Object.keys(TESSERACT_LANGUAGES);

    if (!this.serviceUrl || !this.serviceToken) {
      console.warn("OCR service is not configured. OCR features will be unavailable.");
      this.isAvailable = false;
    } else {
      // Asynchronously check health on startup, but don't block the constructor.
      // The first `recognize` call will effectively confirm availability.
      this.healthCheck().then(isHealthy => {
        this.isAvailable = isHealthy;
        if (!isHealthy) {
          console.error("OCR service health check failed on startup.");
        }
      });
    }
  }

  async recognize(imageBuffer: Buffer, options?: OCRProviderOptions): Promise<OCRResult> {
    if (!this.serviceUrl || !this.serviceToken) {
      throw new TesseractNotAvailableError();
    }

    const formData = new FormData();
    // Convert Buffer → Uint8Array so BlobPart type-checks under Node/TS runtime.
    formData.append("file", new Blob([new Uint8Array(imageBuffer)]));
    formData.append("language", options?.language || "eng");

    const response = await fetch(`${this.serviceUrl}/ocr`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.serviceToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: "Unknown OCR service error" }));
      throw new Error(`OCR service failed with status ${response.status}: ${errorBody.error}`);
    }

    const result = await response.json();
    const text = result.text || "";
    const pages: OCRPage[] = [{ pageNumber: 1, text }];

    return { text, pages };
  }

  private async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.serviceUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error("OCR service health check failed:", error);
      return false;
    }
  }
}
