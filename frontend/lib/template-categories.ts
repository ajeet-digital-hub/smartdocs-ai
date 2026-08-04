/**
 * Template category definitions.
 *
 * IMPORTANT:
 * - `slug` is the canonical identifier used in URLs and stored in the database (`category` field).
 * - `name` is the display name shown in the UI.
 * - These MUST stay consistent. Never store display names in the DB.
 *
 * Example:
 *   { name: "Resume & CV", slug: "resume" }
 */

export interface TemplateCategory {
  name: string;
  slug: string;
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { name: "All", slug: "all" },
  { name: "Business", slug: "business" },
  { name: "Resume & CV", slug: "resume" },
  { name: "Cover Letter", slug: "cover-letter" },
  { name: "Social Media", slug: "social-media" },
  { name: "Marketing", slug: "marketing" },
  { name: "Presentation", slug: "presentation" },
  { name: "Education", slug: "education" },
  { name: "Invitation", slug: "invitation" },
  { name: "Documents", slug: "documents" },
  { name: "Certificates", slug: "certificates" },
  { name: "Real Estate", slug: "real-estate" },
  { name: "Events", slug: "events" },
  { name: "Finance", slug: "finance" },
  { name: "HR & Payroll", slug: "hr" },
  { name: "Legal", slug: "legal" },
  { name: "Healthcare", slug: "healthcare" },
  { name: "Sales", slug: "sales" },
  { name: "Proposals", slug: "proposals" },
  { name: "Reports", slug: "reports" },
  { name: "Invoices", slug: "invoices" },
  { name: "Letters", slug: "letters" },
  { name: "Forms", slug: "forms" },
  { name: "Agreements", slug: "agreements" },
  { name: "Personal", slug: "personal" },
  { name: "Wedding", slug: "wedding" },
  { name: "Travel", slug: "travel" },
  { name: "AI Generated", slug: "ai-generated" },
];

/** Map of slug -> display name */
export const CATEGORY_SLUG_TO_NAME: Record<string, string> = Object.fromEntries(
  TEMPLATE_CATEGORIES.map((c) => [c.slug, c.name])
);

/** Map of display name -> slug */
export const CATEGORY_NAME_TO_SLUG: Record<string, string> = Object.fromEntries(
  TEMPLATE_CATEGORIES.map((c) => [c.name, c.slug])
);

/** All slugs (excluding "all") */
export const TEMPLATE_CATEGORY_SLUGS = TEMPLATE_CATEGORIES.filter((c) => c.slug !== "all").map(
  (c) => c.slug
);

/** Display-name aliases that map back to a canonical slug (for legacy/back-compat filtering) */
export const CATEGORY_ALIASES: Record<string, string> = {
  "resume & cv": "resume",
  "resume & cv templates": "resume",
  "cover letter": "cover-letter",
  "cover letters": "cover-letter",
  "social media": "social-media",
  "real estate": "real-estate",
  "hr & payroll": "hr",
  "hr & payroll templates": "hr",
  "ai generated": "ai-generated",
  "ai-generated": "ai-generated",
};

/**
 * Resolve a user-supplied category value to a canonical slug.
 * Accepts both stable slugs ("resume") and legacy display names ("Resume & CV").
 */
export function resolveCategorySlug(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (CATEGORY_SLUG_TO_NAME[lower] !== undefined) return lower;
  if (CATEGORY_NAME_TO_SLUG[trimmed] !== undefined) return CATEGORY_NAME_TO_SLUG[trimmed];
  if (CATEGORY_ALIASES[lower] !== undefined) return CATEGORY_ALIASES[lower];
  return null;
}

/** Get display name for a slug */
export function categoryNameForSlug(slug: string | null | undefined): string {
  if (!slug) return "All";
  return CATEGORY_SLUG_TO_NAME[slug] || slug;
}

/** Get slug for a display name */
export function categorySlugForName(name: string | null | undefined): string | null {
  if (!name) return null;
  return resolveCategorySlug(name);
}

