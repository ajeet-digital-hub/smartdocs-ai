/**
 * Safe JSON parser for AI model responses.
 *
 * AI providers frequently wrap structured output in markdown code fences or
 * include surrounding explanatory text. This helper strips those wrappers and
 * returns a typed value, throwing if the payload cannot be parsed as JSON.
 *
 * Handles:
 * - Plain JSON:            {"a": 1}
 * - ```json ... ``` block
 * - ``` ... ``` block
 * - Leading/trailing whitespace and non-JSON prose (best-effort)
 */

export function parseAiJson<T>(payload: string): T {
  if (typeof payload !== "string" || payload.trim().length === 0) {
    throw new Error("AI response was empty; expected JSON.");
  }

  let text = payload.trim();

  // Strip a single markdown code fence (with or without "json" language tag).
  const fenced = text.match(/^```(?:json)?\s*\n([\s\S]*?)\n```\s*$/);
  if (fenced) {
    text = fenced[1].trim();
  }

  // Locate the outermost JSON object or array if extraneous prose remains.
  if (!text.startsWith("{") && !text.startsWith("[")) {
    const objectStart = text.indexOf("{");
    const arrayStart = text.indexOf("[");
    let start = -1;
    if (objectStart === -1 && arrayStart === -1) {
      throw new Error("AI response did not contain a JSON object or array.");
    }
    if (objectStart === -1) start = arrayStart;
    else if (arrayStart === -1) start = objectStart;
    else start = Math.min(objectStart, arrayStart);

    const opening = text[start];
    const closing = opening === "{" ? "}" : "]";
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') {
        inString = true;
        continue;
      }
      if (ch === opening) depth++;
      else if (ch === closing) {
        depth--;
        if (depth === 0) {
          text = text.slice(start, i + 1);
          break;
        }
      }
    }
    if (depth !== 0) {
      throw new Error("AI response contained an unbalanced JSON object/array.");
    }
  }

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    throw new Error(
      `AI response could not be parsed as JSON: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
