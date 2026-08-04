/**
 * OCRProvider interface.
 *
 * This abstraction allows different OCR implementations to be swapped
 * without changing consumers.  At runtime exactly one provider is
 * configured – either a native Tesseract provider or a cloud provider.
 *
 * No fake/mock provider is ever returned.
 */

export interface OCRResult {
  text: string;
  pages: OCRPage[];
}

export interface OCRPage {
  pageNumber: number;
  text: string;
}

export interface OCRProviderOptions {
  /** Tesseract language code(s), e.g. "eng", "hin+eng" */
  language?: string;
}

export interface OCRProvider {
  readonly name: string;
  readonly supportedLanguages: string[];
  readonly isAvailable: boolean;

  /**
   * Recognise text from an image buffer.
   *
   * @param imageBuffer  Raw image bytes (PNG, JPEG, WebP, TIFF).
   * @param options      Optional language hint.
   * @returns            Recognised text with page-level structure.
   */
  recognize(imageBuffer: Buffer, options?: OCRProviderOptions): Promise<OCRResult>;
}
