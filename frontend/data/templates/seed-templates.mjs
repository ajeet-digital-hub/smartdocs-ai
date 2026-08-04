/**
 * SmartDocs AI — Template Seed Data
 *
 * 232 realistic templates across all 27 categories.
 * Each template defines metadata + a generated preview via buildLayers().
 * Category values MUST be stable slugs (see frontend/lib/template-categories.ts).
 */

// ─── Category accent palettes ─────────────────────────────────────────────
const CATEGORY_THEME = {
  business: { accent: "#0f766e", light: "#f0fdfa" },
  resume: { accent: "#4f46e5", light: "#eef2ff" },
  "cover-letter": { accent: "#0ea5e9", light: "#f0f9ff" },
  "social-media": { accent: "#ec4899", light: "#fdf2f8" },
  marketing: { accent: "#f97316", light: "#fff7ed" },
  presentation: { accent: "#7c3aed", light: "#f5f3ff" },
  education: { accent: "#0891b2", light: "#ecfeff" },
  invitation: { accent: "#db2777", light: "#fdf2f8" },
  documents: { accent: "#64748b", light: "#f8fafc" },
  certificates: { accent: "#d97706", light: "#fffbeb" },
  "real-estate": { accent: "#059669", light: "#ecfdf5" },
  events: { accent: "#dc2626", light: "#fef2f2" },
  finance: { accent: "#2563eb", light: "#eff6ff" },
  hr: { accent: "#9333ea", light: "#faf5ff" },
  legal: { accent: "#57534e", light: "#f5f5f4" },
  healthcare: { accent: "#16a34a", light: "#f0fdf4" },
  sales: { accent: "#ea580c", light: "#fff7ed" },
  proposals: { accent: "#6d28d9", light: "#f5f3ff" },
  reports: { accent: "#0d9488", light: "#f0fdfa" },
  invoices: { accent: "#1d4ed8", light: "#eff6ff" },
  letters: { accent: "#475569", light: "#f8fafc" },
  forms: { accent: "#7c2d12", light: "#fff7ed" },
  agreements: { accent: "#334155", light: "#f1f5f9" },
  personal: { accent: "#c026d3", light: "#fdf4ff" },
  wedding: { accent: "#e11d48", light: "#fff1f2" },
  travel: { accent: "#0284c7", light: "#f0f9ff" },
  "ai-generated": { accent: "#a855f7", light: "#faf5ff" },
};

const DEFAULT_THEME = { accent: "#0f766e", light: "#f0fdfa" };

function themeFor(category) {
  return CATEGORY_THEME[category] || DEFAULT_THEME;
}

// ─── Dimension presets by file type ───────────────────────────────────────
const DIMENSIONS = {
  PDF: { width: 1200, height: 1600 },
  DOCX: { width: 1200, height: 1600 },
  PPTX: { width: 1600, height: 900 },
  XLSX: { width: 1600, height: 900 },
  IMAGE: { width: 1080, height: 1350 },
  DESIGN: { width: 1200, height: 1600 },
};

function dimsFor(fileType) {
  return DIMENSIONS[fileType] || DIMENSIONS.PDF;
}

// ─── Canonical plan levels ────────────────────────────────────────────────
// One source of truth for template access levels.
// NOTE: "pro_plus" is stored as the canonical DB value (matches PlanId).
export const PLAN_LEVELS = ["free", "basic", "pro", "pro_plus"];

// Deterministic plan distribution pattern (24-position cycle).
// Yields ~ FREE 37.5% / BASIC 25% / PRO 20.8% / PRO+ 16.7%.
// Over 232 templates: ~87 free / 58 basic / 48 pro / 39 pro_plus.
const PLAN_PATTERN = [
  "free", "free", "basic", "free", "pro", "free", "basic", "free",
  "pro_plus", "basic", "free", "pro", "free", "basic", "free", "pro_plus",
  "basic", "free", "pro", "free", "basic", "pro_plus", "free", "pro",
];

// Featured / popular / premium templates are promoted to higher tiers so the
// Premium Collection and Featured/Popular sections always contain paid tiers.
function resolvePlan(opts, seq) {
  if (opts.plan) return opts.plan; // explicit plan wins over everything
  if (opts.featured) return "pro_plus"; // featured templates are top-tier
  if (opts.popular) return "pro"; // popular templates are pro
  if (opts.premium) return "basic"; // legacy premium flag
  return PLAN_PATTERN[seq % PLAN_PATTERN.length];
}

// ─── Layer builder ────────────────────────────────────────────────────────
let layerCounter = 0;
function lid(prefix) {
  layerCounter += 1;
  return `${prefix}-${layerCounter}-${Date.now().toString(36)}`;
}

/**
 * Builds a realistic, previewable layer set for a template.
 */
export function buildLayers({ category, fileType, title, accent, sub }) {
  const theme = themeFor(category);
  const color = accent || theme.accent;
  const { width: W, height: H } = dimsFor(fileType);
  const isLandscape = H < W;

  const layers = [];
  layers.push({ id: lid("bg"), type: "background", x: 0, y: 0, width: W, height: H, rotation: 0, opacity: 1, visible: true, locked: true, zIndex: 0, props: { color: theme.light }, style: {} });

  if (isLandscape) {
    layers.push({ id: lid("hdr"), type: "shape", x: 0, y: 0, width: W, height: 90, rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 1, props: { shapeType: "rectangle", color, borderRadius: 0 }, style: {} });
    layers.push({ id: lid("title"), type: "text", x: 60, y: 24, width: W - 120, height: 50, rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 2, props: { text: title, fontFamily: "Inter", fontSize: 34, fontWeight: "bold", color: "#ffffff", textAlign: "left" }, style: {} });
    layers.push({ id: lid("div"), type: "shape", x: 60, y: 130, width: 120, height: 5, rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 3, props: { shapeType: "rectangle", color, borderRadius: 3 }, style: {} });
    layers.push({ id: lid("body"), type: "text", x: 60, y: 170, width: W - 120, height: 300, rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 4, props: { text: sub || `Professional ${title} template. Edit text, colors and layout in the SmartDocs AI editor.`, fontFamily: "Inter", fontSize: 18, fontWeight: "normal", color: "#475569", textAlign: "left", lineHeight: 1.8 }, style: {} });
    layers.push({ id: lid("box1"), type: "shape", x: 60, y: 520, width: (W - 200) / 2, height: 180, rotation: 0, opacity: 0.9, visible: true, locked: false, zIndex: 5, props: { shapeType: "rectangle", color, borderRadius: 12 }, style: {} });
    layers.push({ id: lid("box2"), type: "shape", x: (W - 200) / 2 + 140, y: 520, width: (W - 200) / 2, height: 180, rotation: 0, opacity: 0.15, visible: true, locked: false, zIndex: 6, props: { shapeType: "rectangle", color, borderRadius: 12 }, style: {} });
    layers.push({ id: lid("box1t"), type: "text", x: 90, y: 580, width: (W - 200) / 2 - 60, height: 60, rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 7, props: { text: "Section One", fontFamily: "Inter", fontSize: 20, fontWeight: "bold", color: "#ffffff", textAlign: "left" }, style: {} });
    layers.push({ id: lid("foot"), type: "shape", x: 0, y: H - 60, width: W, height: 60, rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 8, props: { shapeType: "rectangle", color: "#e2e8f0", borderRadius: 0 }, style: {} });
    layers.push({ id: lid("foott"), type: "text", x: 60, y: H - 48, width: W - 120, height: 30, rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 9, props: { text: "SmartDocs AI | Confidential", fontFamily: "Inter", fontSize: 13, fontWeight: "normal", color: "#64748b", textAlign: "center" }, style: {} });
  } else {
    layers.push({ id: lid("bar"), type: "shape", x: 0, y: 0, width: 14, height: H, rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 1, props: { shapeType: "rectangle", color, borderRadius: 0 }, style: {} });
    layers.push({ id: lid("hdr"), type: "shape", x: 14, y: 0, width: W - 14, height: 100, rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 2, props: { shapeType: "rectangle", color, borderRadius: 0 }, style: {} });
    layers.push({ id: lid("title"), type: "text", x: 60, y: 28, width: W - 100, height: 50, rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 3, props: { text: title, fontFamily: "Inter", fontSize: 36, fontWeight: "bold", color: "#ffffff", textAlign: "left" }, style: {} });
    layers.push({ id: lid("div"), type: "shape", x: 60, y: 140, width: 120, height: 5, rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 4, props: { shapeType: "rectangle", color, borderRadius: 3 }, style: {} });
    layers.push({ id: lid("body"), type: "text", x: 60, y: 180, width: W - 120, height: 220, rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 5, props: { text: sub || `Professional ${title} template. Edit text, colors and layout in the SmartDocs AI editor.`, fontFamily: "Inter", fontSize: 16, fontWeight: "normal", color: "#475569", textAlign: "left", lineHeight: 1.8 }, style: {} });
    layers.push({ id: lid("box1"), type: "shape", x: 60, y: 440, width: (W - 160) / 2, height: 200, rotation: 0, opacity: 0.9, visible: true, locked: false, zIndex: 6, props: { shapeType: "rectangle", color, borderRadius: 12 }, style: {} });
    layers.push({ id: lid("box2"), type: "shape", x: (W - 160) / 2 + 100, y: 440, width: (W - 160) / 2, height: 200, rotation: 0, opacity: 0.12, visible: true, locked: false, zIndex: 7, props: { shapeType: "rectangle", color, borderRadius: 12 }, style: {} });
    layers.push({ id: lid("foot"), type: "shape", x: 14, y: H - 80, width: W - 14, height: 80, rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 8, props: { shapeType: "rectangle", color: "#e2e8f0", borderRadius: 0 }, style: {} });
    layers.push({ id: lid("foott"), type: "text", x: 60, y: H - 62, width: W - 120, height: 30, rotation: 0, opacity: 1, visible: true, locked: false, zIndex: 9, props: { text: "SmartDocs AI | Confidential", fontFamily: "Inter", fontSize: 13, fontWeight: "normal", color: "#64748b", textAlign: "center" }, style: {} });
  }
  return layers;
}

// ─── Helper to declare a template ─────────────────────────────────────────
let seq = 0;
const usedSlugs = new Set();
function T(name, category, fileType, opts = {}) {
  seq += 1;
  let slug = (opts.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))
    .replace(/[^a-z0-9-]/g, "");
  // Ensure slugs are globally unique (a template's slug is a unique DB key).
  // If the same name appears in multiple categories, disambiguate with the category.
  if (usedSlugs.has(slug)) {
    slug = `${slug}-${category}`;
  }
  usedSlugs.add(slug);
const { width: w, height: h } = dimsFor(fileType);
  const theme = themeFor(category);
  const requiredPlan = resolvePlan(opts, seq);
  const isPremium = requiredPlan !== "free";
  return {
    templateId: `tpl_${slug}`,
    name,
    slug,
    description: opts.description || `${name} — a professional, ready-to-use ${category.replace(/-/g, " ")} template.`,
    category,
    tags: opts.tags || [category, fileType.toLowerCase(), name.toLowerCase().split(" ")[0]],
    fileType,
    isPremium,
    isFeatured: !!opts.featured,
    isPopular: !!opts.popular,
    isNewArrival: !!opts.isNew,
    thumbnail: opts.thumbnail || "",
    preview: opts.preview || "",
    width: w,
    height: h,
    layers: buildLayers({ category, fileType, title: name, accent: opts.accent, sub: opts.description }),
    fonts: opts.fonts || ["Inter", "Arial"],
    defaultData: {},
    requiredPlan,
    status: "PUBLISHED",
    featured: !!opts.featured,
    author: opts.author || "SmartDocs AI",
    usageCount: opts.usageCount ?? Math.floor(Math.random() * 9000) + 100,
    favoriteCount: opts.favoriteCount ?? Math.floor(Math.random() * 400) + 5,
    useCount: opts.usageCount ?? Math.floor(Math.random() * 9000) + 100,
    createdAt: opts.createdAt || new Date().toISOString(),
  };
}

// ─── Template catalog (232) ───────────────────────────────────────────────
export const TEMPLATES = [
  // ── Business (12) ──
  T("Business Proposal", "business", "PDF", { featured: true, popular: true, tags: ["business", "proposal", "corporate"], description: "A clean, persuasive business proposal template for winning new clients and partners." }),
  T("Business Plan", "business", "PDF", { featured: true, tags: ["business", "plan", "startup"], description: "Comprehensive business plan template covering vision, strategy, market analysis and financials." }),
  T("Company Profile", "business", "PDF", { popular: true, tags: ["company", "profile", "corporate"], description: "Professional company profile template to showcase your business and services." }),
  T("Project Proposal", "business", "PDF", { tags: ["project", "proposal", "plan"], description: "Structured project proposal template with scope, timeline, budget and deliverables." }),
  T("Startup Pitch", "business", "PPTX", { featured: true, tags: ["startup", "pitch", "investor"], description: "Investor-ready startup pitch deck template with modern slide layouts." }),
  T("Executive Business Report", "business", "PDF", { popular: true, tags: ["report", "executive", "business"], description: "Executive business report template for board-level summaries and KPIs." }),
  T("Business Strategy Plan", "business", "DOCX", { tags: ["strategy", "plan", "business"], description: "Strategic planning template to define goals, initiatives and success metrics." }),
  T("Partnership Proposal", "business", "PDF", { tags: ["partnership", "proposal", "collaboration"], description: "Elegant partnership proposal template for joint ventures and collaborations." }),
  T("Business Card", "business", "DESIGN", { popular: true, tags: ["business card", "contact", "design"], description: "Modern double-sided business card design template." }),
  T("Corporate Letterhead", "business", "DOCX", { tags: ["letterhead", "corporate", "letter"], description: "Professional corporate letterhead template for official correspondence." }),
  T("Meeting Agenda", "business", "DOCX", { tags: ["meeting", "agenda", "minutes"], description: "Structured meeting agenda template with time slots and action items." }),
  T("SWOT Analysis", "business", "PPTX", { tags: ["swot", "analysis", "strategy"], description: "SWOT analysis presentation template for strategic business reviews." }),

  // ── Resume & CV (10) ──
  T("Modern Professional Resume", "resume", "PDF", { featured: true, popular: true, tags: ["resume", "professional", "cv"], description: "Modern, clean resume template designed for professionals across industries." }),
  T("Executive Resume", "resume", "PDF", { featured: true, tags: ["resume", "executive", "c-level"], description: "Executive resume template tailored for senior leadership and C-level roles." }),
  T("Software Developer Resume", "resume", "PDF", { popular: true, tags: ["resume", "developer", "software"], description: "Developer-focused resume template highlighting skills, projects and experience." }),
  T("Marketing Manager Resume", "resume", "PDF", { tags: ["resume", "marketing", "manager"], description: "Marketing resume template with metrics-focused achievement sections." }),
  T("Fresh Graduate Resume", "resume", "PDF", { popular: true, tags: ["resume", "fresher", "graduate"], description: "Entry-level resume template perfect for fresh graduates and interns." }),
  T("ATS Friendly Resume", "resume", "PDF", { tags: ["resume", "ats", "applicant tracking"], description: "ATS-optimized resume template that passes automated screening systems." }),
  T("Creative Resume", "resume", "PDF", { isNew: true, tags: ["resume", "creative", "design"], description: "Bold creative resume template for designers, artists and innovators." }),
  T("Corporate CV", "resume", "PDF", { tags: ["cv", "corporate", "formal"], description: "Formal corporate CV template with classic professional styling." }),
  T("Academic CV", "resume", "PDF", { tags: ["cv", "academic", "research"], description: "Academic CV template with publications, research and teaching sections." }),
  T("Minimal Resume", "resume", "PDF", { isNew: true, tags: ["resume", "minimal", "clean"], description: "Minimalist one-page resume template with generous whitespace." }),

  // ── Cover Letter (6) ──
  T("Professional Cover Letter", "cover-letter", "DOCX", { popular: true, tags: ["cover letter", "professional", "job"], description: "Professional cover letter template for job applications." }),
  T("Executive Cover Letter", "cover-letter", "DOCX", { tags: ["cover letter", "executive", "leadership"], description: "Executive cover letter template for senior positions." }),
  T("Entry Level Cover Letter", "cover-letter", "DOCX", { tags: ["cover letter", "entry", "graduate"], description: "Entry-level cover letter template for first-time job seekers." }),
  T("Career Change Cover Letter", "cover-letter", "DOCX", { tags: ["cover letter", "career change"], description: "Cover letter template designed for career transitions." }),
  T("Internship Cover Letter", "cover-letter", "DOCX", { tags: ["cover letter", "internship", "student"], description: "Internship cover letter template for students." }),
  T("Short Cover Letter", "cover-letter", "DOCX", { isNew: true, tags: ["cover letter", "short", "concise"], description: "Concise one-page cover letter template." }),

  // ── Social Media (12) ──
  T("Instagram Post", "social-media", "IMAGE", { popular: true, tags: ["instagram", "post", "social"], description: "Eye-catching Instagram post template for brand content." }),
  T("Instagram Story", "social-media", "IMAGE", { popular: true, tags: ["instagram", "story", "social"], description: "Full-screen Instagram story template with bold typography." }),
  T("LinkedIn Post", "social-media", "IMAGE", { tags: ["linkedin", "post", "professional"], description: "Professional LinkedIn post template for thought leadership." }),
  T("YouTube Thumbnail", "social-media", "IMAGE", { featured: true, tags: ["youtube", "thumbnail", "video"], description: "Click-optimized YouTube thumbnail template." }),
  T("Facebook Campaign", "social-media", "IMAGE", { tags: ["facebook", "campaign", "ads"], description: "Facebook ad campaign image template for promotions." }),
  T("Social Media Calendar", "social-media", "XLSX", { tags: ["calendar", "content", "planning"], description: "Monthly social media content calendar template." }),
  T("X (Twitter) Post", "social-media", "IMAGE", { isNew: true, tags: ["twitter", "x", "post"], description: "Twitter/X post template for announcements and updates." }),
  T("WhatsApp Status", "social-media", "IMAGE", { tags: ["whatsapp", "status", "social"], description: "WhatsApp status design template for business updates." }),
  T("Pinterest Pin", "social-media", "IMAGE", { tags: ["pinterest", "pin", "design"], description: "Vertical Pinterest pin template for traffic generation." }),
  T("TikTok Cover", "social-media", "IMAGE", { isNew: true, tags: ["tiktok", "cover", "video"], description: "TikTok profile cover template with vibrant styling." }),
  T("Email Campaign Graphic", "social-media", "IMAGE", { tags: ["email", "campaign", "graphic"], description: "Email campaign hero graphic template." }),
  T("Social Media Banner", "social-media", "IMAGE", { tags: ["banner", "social", "header"], description: "Social media profile banner template." }),

  // ── Marketing (10) ──
  T("Marketing Plan", "marketing", "DOCX", { featured: true, popular: true, tags: ["marketing", "plan", "strategy"], description: "Comprehensive marketing plan template with goals, channels and budgets." }),
  T("Marketing Campaign Brief", "marketing", "DOCX", { tags: ["campaign", "brief", "marketing"], description: "Campaign brief template to align teams on goals and deliverables." }),
  T("Product Launch Plan", "marketing", "PPTX", { featured: true, tags: ["product", "launch", "plan"], description: "Product launch plan presentation template." }),
  T("Social Media Campaign", "marketing", "DOCX", { popular: true, tags: ["social media", "campaign", "content"], description: "Social media campaign planning template." }),
  T("Brand Strategy", "marketing", "PPTX", { tags: ["brand", "strategy", "identity"], description: "Brand strategy deck template with positioning and messaging." }),
  T("Marketing Report", "marketing", "PDF", { tags: ["marketing", "report", "analytics"], description: "Marketing performance report template with KPIs." }),
  T("Content Strategy", "marketing", "DOCX", { tags: ["content", "strategy", "editorial"], description: "Content strategy and editorial calendar template." }),
  T("SEO Strategy", "marketing", "DOCX", { isNew: true, tags: ["seo", "strategy", "organic"], description: "SEO strategy template with keyword and ranking plans." }),
  T("Email Newsletter", "marketing", "DESIGN", { tags: ["newsletter", "email", "design"], description: "Newsletter design template for subscriber engagement." }),
  T("Ad Campaign Copy", "marketing", "DOCX", { tags: ["ads", "copy", "campaign"], description: "Ad campaign copy template for multi-channel ads." }),

  // ── Presentation (8) ──
  T("Business Presentation", "presentation", "PPTX", { featured: true, popular: true, tags: ["presentation", "business", "slides"], description: "Professional business presentation template with modern slide layouts." }),
  T("Pitch Deck", "presentation", "PPTX", { featured: true, tags: ["pitch", "deck", "startup"], description: "Startup pitch deck template for investor presentations." }),
  T("Training Presentation", "presentation", "PPTX", { tags: ["training", "workshop", "slides"], description: "Training and workshop presentation template." }),
  T("Sales Presentation", "presentation", "PPTX", { popular: true, tags: ["sales", "presentation", "deck"], description: "Sales deck template to close deals effectively." }),
  T("Project Status Deck", "presentation", "PPTX", { tags: ["project", "status", "update"], description: "Project status presentation template for stakeholders." }),
  T("University Lecture", "presentation", "PPTX", { tags: ["lecture", "university", "academic"], description: "Academic lecture presentation template." }),
  T("Marketing Deck", "presentation", "PPTX", { tags: ["marketing", "deck", "strategy"], description: "Marketing strategy presentation template." }),
  T("Product Demo Deck", "presentation", "PPTX", { isNew: true, tags: ["product", "demo", "slides"], description: "Product demo presentation template." }),

  // ── Education (10) ──
  T("Student Resume", "education", "PDF", { tags: ["student", "resume", "academic"], description: "Student resume template for part-time jobs and internships." }),
  T("Assignment Cover", "education", "DOCX", { popular: true, tags: ["assignment", "cover", "school"], description: "Assignment cover page template for schools and universities." }),
  T("Research Report", "education", "PDF", { featured: true, tags: ["research", "report", "academic"], description: "Academic research report template with structured sections." }),
  T("Project Report", "education", "DOCX", { tags: ["project", "report", "student"], description: "Student project report template with methodology and findings." }),
  T("Course Certificate", "education", "PDF", { tags: ["certificate", "course", "completion"], description: "Course completion certificate template for educators." }),
  T("Study Planner", "education", "PDF", { popular: true, tags: ["study", "planner", "schedule"], description: "Weekly study planner template for effective revision." }),
  T("Lesson Plan", "education", "DOCX", { tags: ["lesson", "plan", "teacher"], description: "Lesson plan template for teachers and tutors." }),
  T("Quiz Paper", "education", "DOCX", { tags: ["quiz", "exam", "questions"], description: "Quiz paper template with question and answer sections." }),
  T("Lab Report", "education", "DOCX", { tags: ["lab", "report", "science"], description: "Science lab report template with hypothesis and results." }),
  T("Graduation Invitation", "education", "IMAGE", { isNew: true, tags: ["graduation", "invitation", "event"], description: "Graduation ceremony invitation design template." }),

  // ── Invitation (8) ──
  T("Event Invitation", "invitation", "IMAGE", { popular: true, tags: ["event", "invitation", "card"], description: "Elegant event invitation card template." }),
  T("Conference Invitation", "invitation", "IMAGE", { tags: ["conference", "invitation", "corporate"], description: "Corporate conference invitation template." }),
  T("Party Invitation", "invitation", "IMAGE", { tags: ["party", "invitation", "celebration"], description: "Birthday party invitation template with vibrant colors." }),
  T("Grand Opening Invitation", "invitation", "IMAGE", { tags: ["grand opening", "invitation", "business"], description: "Grand opening invitation template for businesses." }),
  T("Baby Shower Invitation", "invitation", "IMAGE", { isNew: true, tags: ["baby shower", "invitation"], description: "Baby shower invitation template with soft pastel design." }),
  T("Housewarming Invitation", "invitation", "IMAGE", { tags: ["housewarming", "invitation", "home"], description: "Housewarming party invitation template." }),
  T("Anniversary Invitation", "invitation", "IMAGE", { tags: ["anniversary", "invitation", "celebration"], description: "Anniversary celebration invitation template." }),
  T("Award Ceremony Invitation", "invitation", "IMAGE", { tags: ["award", "ceremony", "formal"], description: "Formal award ceremony invitation template." }),

  // ── Documents (10) ──
  T("Executive Summary", "documents", "PDF", { featured: true, tags: ["executive", "summary", "report"], description: "Executive summary document template." }),
  T("Company Policy", "documents", "DOCX", { tags: ["policy", "company", "hr"], description: "Company policy document template." }),
  T("Standard Operating Procedure", "documents", "DOCX", { popular: true, tags: ["sop", "procedure", "operations"], description: "Standard operating procedure (SOP) template." }),
  T("Business Memo", "documents", "DOCX", { tags: ["memo", "internal", "business"], description: "Internal business memo template." }),
  T("Minutes of Meeting", "documents", "DOCX", { tags: ["minutes", "meeting", "notes"], description: "Meeting minutes template with action items." }),
  T("Press Release", "documents", "DOCX", { tags: ["press", "release", "media"], description: "Press release template for announcements." }),
  T("FAQ Document", "documents", "DOCX", { tags: ["faq", "help", "support"], description: "FAQ document template for product support." }),
  T("White Paper", "documents", "PDF", { isNew: true, tags: ["white paper", "research", "insight"], description: "Professional white paper template." }),
  T("Case Study", "documents", "PDF", { tags: ["case study", "success", "story"], description: "Customer success case study template." }),
  T("Onboarding Guide", "documents", "DOCX", { tags: ["onboarding", "guide", "welcome"], description: "Employee onboarding guide template." }),

  // ── Certificates (8) ──
  T("Certificate of Achievement", "certificates", "PDF", { featured: true, popular: true, tags: ["certificate", "achievement", "award"], description: "Certificate of achievement template with elegant borders." }),
  T("Certificate of Completion", "certificates", "PDF", { popular: true, tags: ["certificate", "completion", "course"], description: "Certificate of completion template." }),
  T("Certificate of Participation", "certificates", "PDF", { tags: ["certificate", "participation", "event"], description: "Certificate of participation template." }),
  T("Certificate of Appreciation", "certificates", "PDF", { tags: ["certificate", "appreciation", "thank you"], description: "Certificate of appreciation template." }),
  T("Certificate of Excellence", "certificates", "PDF", { tags: ["certificate", "excellence", "award"], description: "Certificate of excellence template." }),
  T("Training Certificate", "certificates", "PDF", { tags: ["certificate", "training", "skills"], description: "Training completion certificate template." }),
  T("Certificate of Merit", "certificates", "PDF", { isNew: true, tags: ["certificate", "merit", "recognition"], description: "Certificate of merit template." }),
  T("Lifetime Achievement Award", "certificates", "PDF", { tags: ["certificate", "lifetime", "award"], description: "Lifetime achievement award certificate template." }),

  // ── Real Estate (8) ──
  T("Property Listing", "real-estate", "PDF", { featured: true, popular: true, tags: ["property", "listing", "real estate"], description: "Property listing template with photo and spec sections." }),
  T("Rental Agreement", "real-estate", "DOCX", { popular: true, tags: ["rental", "agreement", "lease"], description: "Residential rental agreement template." }),
  T("Property Brochure", "real-estate", "PDF", { tags: ["brochure", "property", "marketing"], description: "Property brochure template for listings and open houses." }),
  T("Real Estate Proposal", "real-estate", "PDF", { tags: ["real estate", "proposal", "sales"], description: "Real estate proposal template for agencies." }),
  T("Property Inspection Report", "real-estate", "PDF", { tags: ["inspection", "report", "property"], description: "Property inspection report template." }),
  T("Home Evaluation", "real-estate", "PDF", { tags: ["home", "evaluation", "value"], description: "Home valuation report template." }),
  T("Real Estate Flyer", "real-estate", "IMAGE", { isNew: true, tags: ["flyer", "real estate", "listing"], description: "Real estate flyer design template." }),
  T("Lease Agreement", "real-estate", "DOCX", { tags: ["lease", "agreement", "commercial"], description: "Commercial lease agreement template." }),

  // ── Events (8) ──
  T("Event Invitation", "events", "IMAGE", { popular: true, tags: ["event", "invitation", "card"], description: "Event invitation template for conferences and seminars." }),
  T("Conference Invitation", "events", "IMAGE", { tags: ["conference", "invitation", "seminar"], description: "Conference invitation and registration template." }),
  T("Event Poster", "events", "IMAGE", { featured: true, tags: ["poster", "event", "promo"], description: "Event poster template with bold visuals." }),
  T("Event Schedule", "events", "PDF", { tags: ["schedule", "event", "agenda"], description: "Event schedule template with time slots." }),
  T("Event Flyer", "events", "IMAGE", { tags: ["flyer", "event", "promotion"], description: "Event flyer template for promotions." }),
  T("Event Program", "events", "PDF", { tags: ["program", "event", "brochure"], description: "Event program booklet template." }),
  T("Registration Form", "events", "DOCX", { tags: ["registration", "form", "event"], description: "Event registration form template." }),
  T("Charity Gala Invitation", "events", "IMAGE", { isNew: true, tags: ["charity", "gala", "fundraiser"], description: "Charity gala invitation template." }),

  // ── Finance (10) ──
  T("Professional Invoice", "finance", "PDF", { featured: true, popular: true, tags: ["invoice", "billing", "payment"], description: "Professional invoice template with itemized billing." }),
  T("Sales Invoice", "finance", "PDF", { tags: ["sales", "invoice", "billing"], description: "Sales invoice template for goods and services." }),
  T("Expense Report", "finance", "XLSX", { popular: true, tags: ["expense", "report", "reimbursement"], description: "Expense report template for tracking and reimbursement." }),
  T("Monthly Budget", "finance", "XLSX", { popular: true, tags: ["budget", "monthly", "planning"], description: "Monthly budget planner template." }),
  T("Financial Report", "finance", "PDF", { featured: true, tags: ["financial", "report", "statement"], description: "Financial report template with income and balance sections." }),
  T("Payment Receipt", "finance", "PDF", { tags: ["receipt", "payment", "confirmation"], description: "Payment receipt template with transaction details." }),
  T("Quotation", "finance", "PDF", { tags: ["quotation", "quote", "estimate"], description: "Quotation template for pricing products and services." }),
  T("Balance Sheet", "finance", "XLSX", { tags: ["balance sheet", "accounting", "finance"], description: "Balance sheet template for accounting." }),
  T("Cash Flow Statement", "finance", "XLSX", { tags: ["cash flow", "statement", "finance"], description: "Cash flow statement template." }),
  T("Loan Application", "finance", "DOCX", { isNew: true, tags: ["loan", "application", "finance"], description: "Loan application form template." }),

  // ── HR & Payroll (10) ──
  T("Offer Letter", "hr", "DOCX", { featured: true, popular: true, tags: ["offer letter", "hiring", "job"], description: "Job offer letter template for new hires." }),
  T("Appointment Letter", "hr", "DOCX", { tags: ["appointment", "letter", "employment"], description: "Appointment letter template for formal roles." }),
  T("Experience Letter", "hr", "DOCX", { popular: true, tags: ["experience", "letter", "certificate"], description: "Work experience letter template for ex-employees." }),
  T("Relieving Letter", "hr", "DOCX", { tags: ["relieving", "letter", "resignation"], description: "Relieving letter template upon employee departure." }),
  T("Salary Certificate", "hr", "PDF", { tags: ["salary", "certificate", "income"], description: "Salary certificate template for employees." }),
  T("Employee Appraisal", "hr", "DOCX", { tags: ["appraisal", "review", "performance"], description: "Employee performance appraisal template." }),
  T("Joining Letter", "hr", "DOCX", { tags: ["joining", "letter", "onboarding"], description: "Employee joining letter template." }),
  T("HR Policy", "hr", "DOCX", { tags: ["hr", "policy", "handbook"], description: "HR policy document template." }),
  T("Leave Application", "hr", "DOCX", { tags: ["leave", "application", "form"], description: "Leave application form template." }),
  T("Resignation Letter", "hr", "DOCX", { isNew: true, tags: ["resignation", "letter", "exit"], description: "Professional resignation letter template." }),

  // ── Legal (10) ──
  T("NDA Agreement", "legal", "PDF", { featured: true, popular: true, tags: ["nda", "non-disclosure", "legal"], description: "Non-disclosure agreement template." }),
  T("Service Agreement", "legal", "PDF", { tags: ["service", "agreement", "contract"], description: "Service agreement template for contractors." }),
  T("Employment Agreement", "legal", "PDF", { popular: true, tags: ["employment", "agreement", "contract"], description: "Employment agreement template." }),
  T("Partnership Agreement", "legal", "PDF", { tags: ["partnership", "agreement", "business"], description: "Business partnership agreement template." }),
  T("Authorization Letter", "legal", "DOCX", { tags: ["authorization", "letter", "power"], description: "Authorization letter template." }),
  T("Terms Agreement", "legal", "PDF", { tags: ["terms", "agreement", "conditions"], description: "Terms and conditions template." }),
  T("Power of Attorney", "legal", "PDF", { tags: ["power of attorney", "legal", "authority"], description: "Power of attorney template." }),
  T("Legal Notice", "legal", "DOCX", { tags: ["legal", "notice", "demand"], description: "Legal notice and demand letter template." }),
  T("Rental Agreement", "legal", "PDF", { tags: ["rental", "lease", "agreement"], description: "Legal rental agreement template." }),
  T("Liability Waiver", "legal", "PDF", { isNew: true, tags: ["waiver", "liability", "consent"], description: "Liability waiver template." }),

  // ── Healthcare (8) ──
  T("Medical Report", "healthcare", "PDF", { featured: true, tags: ["medical", "report", "healthcare"], description: "Medical report template for clinics and hospitals." }),
  T("Prescription Template", "healthcare", "PDF", { popular: true, tags: ["prescription", "medical", "doctor"], description: "Prescription pad template for healthcare providers." }),
  T("Patient Intake Form", "healthcare", "DOCX", { tags: ["patient", "intake", "form"], description: "Patient intake form template." }),
  T("Medical History Form", "healthcare", "DOCX", { tags: ["medical history", "form", "patient"], description: "Medical history questionnaire template." }),
  T("Lab Report", "healthcare", "PDF", { tags: ["lab", "report", "diagnostics"], description: "Laboratory test report template." }),
  T("Health Insurance Form", "healthcare", "DOCX", { tags: ["insurance", "health", "claim"], description: "Health insurance claim form template." }),
  T("Fitness Certificate", "healthcare", "PDF", { tags: ["fitness", "certificate", "medical"], description: "Medical fitness certificate template." }),
  T("Diet Plan", "healthcare", "PDF", { isNew: true, tags: ["diet", "nutrition", "plan"], description: "Diet and nutrition plan template." }),

  // ── Sales (8) ──
  T("Sales Proposal", "sales", "PDF", { featured: true, popular: true, tags: ["sales", "proposal", "closing"], description: "Sales proposal template to win deals." }),
  T("Sales Report", "sales", "XLSX", { tags: ["sales", "report", "analytics"], description: "Sales report template with revenue metrics." }),
  T("Order Form", "sales", "DOCX", { tags: ["order", "form", "purchase"], description: "Sales order form template." }),
  T("Price List", "sales", "XLSX", { tags: ["price", "list", "catalog"], description: "Product price list template." }),
  T("Sales Pitch Deck", "sales", "PPTX", { tags: ["sales", "pitch", "deck"], description: "Sales pitch presentation template." }),
  T("Lead Qualification Form", "sales", "DOCX", { tags: ["lead", "qualification", "crm"], description: "Lead qualification form template." }),
  T("Customer Feedback Form", "sales", "DOCX", { tags: ["feedback", "customer", "survey"], description: "Customer feedback form template." }),
  T("Deal Tracker", "sales", "XLSX", { isNew: true, tags: ["deal", "tracker", "pipeline"], description: "Sales pipeline and deal tracking template." }),

  // ── Proposals (8) ──
  T("Project Proposal", "proposals", "PDF", { popular: true, tags: ["project", "proposal", "plan"], description: "Project proposal template with timelines and budgets." }),
  T("Research Proposal", "proposals", "PDF", { tags: ["research", "proposal", "academic"], description: "Research proposal template for grants and studies." }),
  T("Design Proposal", "proposals", "PDF", { tags: ["design", "proposal", "creative"], description: "Design services proposal template." }),
  T("Marketing Proposal", "proposals", "PDF", { tags: ["marketing", "proposal", "campaign"], description: "Marketing services proposal template." }),
  T("IT Services Proposal", "proposals", "PDF", { tags: ["it", "services", "proposal"], description: "IT services proposal template." }),
  T("Consulting Proposal", "proposals", "PDF", { featured: true, tags: ["consulting", "proposal", "advisory"], description: "Consulting engagement proposal template." }),
  T("Sponsorship Proposal", "proposals", "PDF", { tags: ["sponsorship", "proposal", "event"], description: "Sponsorship proposal template." }),
  T("Grant Proposal", "proposals", "PDF", { isNew: true, tags: ["grant", "proposal", "funding"], description: "Grant proposal template for nonprofits." }),

  // ── Reports (8) ──
  T("Annual Report", "reports", "PDF", { featured: true, popular: true, tags: ["annual", "report", "corporate"], description: "Annual corporate report template." }),
  T("Weekly Status Report", "reports", "DOCX", { tags: ["weekly", "status", "report"], description: "Weekly status report template for team updates." }),
  T("Monthly Performance Report", "reports", "PDF", { tags: ["monthly", "performance", "metrics"], description: "Monthly performance report template." }),
  T("Project Completion Report", "reports", "PDF", { tags: ["project", "completion", "summary"], description: "Project completion report template." }),
  T("Financial Report", "reports", "PDF", { tags: ["financial", "report", "statement"], description: "Financial report and statement template." }),
  T("Quarterly Review", "reports", "PPTX", { tags: ["quarterly", "review", "business"], description: "Quarterly business review presentation template." }),
  T("Incident Report", "reports", "DOCX", { tags: ["incident", "report", "compliance"], description: "Incident report template for compliance." }),
  T("Audit Report", "reports", "PDF", { isNew: true, tags: ["audit", "report", "compliance"], description: "Audit report template with findings and recommendations." }),

  // ── Invoices (8) ──
  T("Standard Invoice", "invoices", "PDF", { featured: true, popular: true, tags: ["invoice", "standard", "billing"], description: "Standard invoice template for general business billing." }),
  T("Service Invoice", "invoices", "PDF", { tags: ["invoice", "service", "billing"], description: "Service invoice template for consulting and professional services." }),
  T("Recurring Invoice", "invoices", "PDF", { tags: ["invoice", "recurring", "subscription"], description: "Recurring invoice template for subscription billing." }),
  T("Proforma Invoice", "invoices", "PDF", { tags: ["proforma", "invoice", "estimate"], description: "Proforma invoice template for advance billing." }),
  T("Credit Note", "invoices", "PDF", { tags: ["credit", "note", "refund"], description: "Credit note template for refunds and adjustments." }),
  T("Debit Note", "invoices", "PDF", { tags: ["debit", "note", "adjustment"], description: "Debit note template for billing adjustments." }),
  T("Timesheet Invoice", "invoices", "XLSX", { tags: ["timesheet", "invoice", "hourly"], description: "Timesheet-based invoice template for hourly billing." }),
  T("Tax Invoice", "invoices", "PDF", { isNew: true, tags: ["tax", "invoice", "gst"], description: "Tax invoice template with GST and tax breakdown." }),

  // ── Letters (8) ──
  T("Business Letter", "letters", "DOCX", { popular: true, tags: ["letter", "business", "formal"], description: "Formal business letter template for professional correspondence." }),
  T("Cover Letter", "letters", "DOCX", { tags: ["letter", "cover", "job"], description: "Job application cover letter template." }),
  T("Recommendation Letter", "letters", "DOCX", { tags: ["letter", "recommendation", "reference"], description: "Letter of recommendation template." }),
  T("Complaint Letter", "letters", "DOCX", { tags: ["letter", "complaint", "feedback"], description: "Formal complaint letter template." }),
  T("Resignation Letter", "letters", "DOCX", { tags: ["letter", "resignation", "job"], description: "Professional resignation letter template." }),
  T("Thank You Letter", "letters", "DOCX", { tags: ["letter", "thank you", "appreciation"], description: "Thank you letter template for clients and colleagues." }),
  T("Reference Letter", "letters", "DOCX", { tags: ["letter", "reference", "character"], description: "Character reference letter template." }),
  T("Apology Letter", "letters", "DOCX", { isNew: true, tags: ["letter", "apology", "customer"], description: "Professional apology letter template." }),

  // ── Forms (8) ──
  T("Employee Information Form", "forms", "DOCX", { tags: ["form", "employee", "information"], description: "Employee information form template." }),
  T("Customer Feedback Form", "forms", "DOCX", { tags: ["form", "feedback", "customer"], description: "Customer feedback questionnaire template." }),
  T("Registration Form", "forms", "DOCX", { popular: true, tags: ["form", "registration", "event"], description: "Event registration form template." }),
  T("Order Form", "forms", "DOCX", { tags: ["form", "order", "purchase"], description: "Purchase order form template." }),
  T("Application Form", "forms", "DOCX", { tags: ["form", "application", "job"], description: "Job application form template." }),
  T("Consent Form", "forms", "DOCX", { tags: ["form", "consent", "agreement"], description: "Consent form template for permissions." }),
  T("Evaluation Form", "forms", "DOCX", { tags: ["form", "evaluation", "assessment"], description: "Employee evaluation form template." }),
  T("Survey Form", "forms", "DOCX", { isNew: true, tags: ["form", "survey", "questionnaire"], description: "Customer satisfaction survey form template." }),

  // ── Agreements (8) ──
  T("Service Agreement", "agreements", "PDF", { popular: true, tags: ["agreement", "service", "contract"], description: "Service agreement template for client engagements." }),
  T("Consulting Agreement", "agreements", "PDF", { tags: ["agreement", "consulting", "contract"], description: "Consulting agreement template for advisors." }),
  T("Freelance Agreement", "agreements", "PDF", { tags: ["agreement", "freelance", "contract"], description: "Freelance contract agreement template." }),
  T("Vendor Agreement", "agreements", "PDF", { tags: ["agreement", "vendor", "supplier"], description: "Vendor agreement template for suppliers." }),
  T("Partnership Agreement", "agreements", "PDF", { featured: true, tags: ["agreement", "partnership", "business"], description: "Business partnership agreement template." }),
  T("Non-Compete Agreement", "agreements", "PDF", { tags: ["agreement", "non-compete", "legal"], description: "Non-compete agreement template." }),
  T("Confidentiality Agreement", "agreements", "PDF", { tags: ["agreement", "confidentiality", "nda"], description: "Confidentiality agreement template." }),
  T("Indemnity Agreement", "agreements", "PDF", { isNew: true, tags: ["agreement", "indemnity", "legal"], description: "Indemnity agreement template." }),

  // ── Personal (8) ──
  T("Personal Budget", "personal", "XLSX", { popular: true, tags: ["personal", "budget", "finance"], description: "Personal budget planner template." }),
  T("Daily Planner", "personal", "PDF", { tags: ["planner", "daily", "productivity"], description: "Daily planner template for personal organization." }),
  T("Fitness Tracker", "personal", "XLSX", { tags: ["fitness", "tracker", "health"], description: "Fitness and workout tracker template." }),
  T("Goal Setting Worksheet", "personal", "PDF", { tags: ["goals", "worksheet", "personal"], description: "Personal goal setting worksheet template." }),
  T("Meal Planner", "personal", "PDF", { tags: ["meal", "planning", "nutrition"], description: "Weekly meal planner template." }),
  T("Travel Checklist", "personal", "PDF", { tags: ["travel", "checklist", "packing"], description: "Travel packing checklist template." }),
  T("Reading Log", "personal", "PDF", { tags: ["reading", "log", "books"], description: "Reading list and journal template." }),
  T("Gratitude Journal", "personal", "PDF", { isNew: true, tags: ["journal", "gratitude", "wellness"], description: "Daily gratitude journal template." }),

  // ── Wedding (8) ──
  T("Wedding Invitation", "wedding", "IMAGE", { featured: true, popular: true, tags: ["wedding", "invitation", "card"], description: "Elegant wedding invitation card template." }),
  T("Wedding Reception Invitation", "wedding", "IMAGE", { tags: ["wedding", "reception", "invitation"], description: "Wedding reception invitation template." }),
  T("Engagement Invitation", "wedding", "IMAGE", { tags: ["engagement", "invitation", "celebration"], description: "Engagement party invitation template." }),
  T("Save The Date", "wedding", "IMAGE", { popular: true, tags: ["save the date", "wedding", "card"], description: "Save the date card template." }),
  T("Wedding Program", "wedding", "PDF", { tags: ["wedding", "program", "ceremony"], description: "Wedding ceremony program template." }),
  T("Wedding Thank You Card", "wedding", "IMAGE", { tags: ["thank you", "wedding", "card"], description: "Wedding thank you card template." }),
  T("Bridal Shower Invitation", "wedding", "IMAGE", { isNew: true, tags: ["bridal", "shower", "invitation"], description: "Bridal shower invitation template." }),
  T("Wedding Menu Card", "wedding", "IMAGE", { tags: ["wedding", "menu", "card"], description: "Wedding reception menu card template." }),

  // ── Travel (8) ──
  T("Travel Itinerary", "travel", "PDF", { popular: true, tags: ["travel", "itinerary", "trip"], description: "Travel itinerary template with daily schedules." }),
  T("Trip Planner", "travel", "PDF", { tags: ["trip", "planner", "vacation"], description: "Complete trip planner template." }),
  T("Packing List", "travel", "PDF", { tags: ["packing", "list", "travel"], description: "Printable packing checklist template." }),
  T("Travel Budget", "travel", "XLSX", { tags: ["budget", "travel", "expenses"], description: "Travel budget and expense tracker template." }),
  T("Visa Application", "travel", "DOCX", { tags: ["visa", "application", "travel"], description: "Visa application form template." }),
  T("Hotel Booking Confirmation", "travel", "PDF", { tags: ["hotel", "booking", "confirmation"], description: "Hotel booking confirmation template." }),
  T("Travel Journal", "travel", "PDF", { isNew: true, tags: ["journal", "travel", "diary"], description: "Travel journal and diary template." }),
  T("Passport Photo Template", "travel", "IMAGE", { tags: ["passport", "photo", "template"], description: "Passport photo template with guidelines." }),

  // ── AI Generated (8) ──
  T("AI Prompt Template", "ai-generated", "PDF", { featured: true, tags: ["ai", "prompt", "chatgpt"], description: "AI prompt engineering template for ChatGPT and other LLMs." }),
  T("AI Art Prompt", "ai-generated", "PDF", { tags: ["ai", "art", "prompt"], description: "AI art generation prompt template for Midjourney and DALL-E." }),
  T("AI Workflow", "ai-generated", "PDF", { tags: ["ai", "workflow", "automation"], description: "AI workflow automation template." }),
  T("AI Chatbot Script", "ai-generated", "DOCX", { tags: ["ai", "chatbot", "script"], description: "AI chatbot conversation script template." }),
  T("AI Content Generator", "ai-generated", "DOCX", { tags: ["ai", "content", "generator"], description: "AI content generation prompt template." }),
  T("AI Data Analysis", "ai-generated", "XLSX", { tags: ["ai", "data", "analysis"], description: "AI-powered data analysis template." }),
  T("AI Learning Path", "ai-generated", "PDF", { isNew: true, tags: ["ai", "learning", "education"], description: "AI learning path and curriculum template." }),
  T("AI Ethics Checklist", "ai-generated", "PDF", { tags: ["ai", "ethics", "compliance"], description: "AI ethics and compliance checklist template." }),
];
