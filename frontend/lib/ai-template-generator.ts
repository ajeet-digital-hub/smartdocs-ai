/**
 * AI Template Generator — Architecture Placeholder
 *
 * FUTURE: When the AI backend is ready, this module will:
 *   1. Accept a user's natural language prompt describing a template
 *   2. Use the AI provider to generate a structured template JSON
 *   3. Return a previewable, editable template
 *
 * Interface:
 *   generateTemplate(prompt: string, userId: string): Promise<GeneratedTemplateResult>
 *
 * Input:
 *   prompt: string — e.g., "Create a modern business proposal template with blue accents"
 *
 * Output:
 *   {
 *     name: string,
 *     description: string,
 *     category: string,
 *     width: number,
 *     height: number,
 *     layers: ILayer[],
 *     fonts: string[],
 *     thumbnail: string,
 *   }
 *
 * NOT IMPLEMENTED: Requires backend AI integration.
 * Do not use this module until the AI generation pipeline is ready.
 */

export interface GeneratedTemplateResult {
  name: string;
  description: string;
  category: string;
  width: number;
  height: number;
  layers: Array<{
    id: string;
    type: "text" | "image" | "shape" | "background" | "logo" | "icon";
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    visible: boolean;
    zIndex: number;
    props: Record<string, unknown>;
    style: Record<string, unknown>;
  }>;
  fonts: string[];
  thumbnail: string;
}

/**
 * Placeholder: Generates a template from a natural language prompt.
 * @throws {Error} Always throws — not implemented yet
 */
export async function generateTemplateFromPrompt(
  _prompt: string,
  _userId: string
): Promise<GeneratedTemplateResult> {
  throw new Error(
    "AI Template Generator is not yet implemented. " +
    "This feature requires backend AI integration. " +
    "When ready, this function will generate structured templates from natural language prompts."
  );
}
