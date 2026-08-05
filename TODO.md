# Fix Build & Lint Errors

## Steps
- [x] Analyze files and create plan
- [x] PreviewModal.tsx: Remove unused `Download` import
- [x] PreviewModal.tsx: Add `batchId` to useEffect dependency array
- [x] services/page.tsx: Add eslint-disable for mount-time fetch effects (fetchCategories, fetchServices)
- [x] templates/page.tsx: Add missing `recommendedTemplates`/`aiLoading` state and fix unclosed conditional (unblocked tsc TS1005)
- [x] Run ESLint on changed files (0 problems)
- [x] Run tsc --noEmit (templates/page.tsx error fixed; remaining TS errors are pre-existing in unrelated files: agent/route.ts, orchestrator.ts, magic-batch-scan/process, family-guardian/page.tsx, credit-service.ts, dbConnect.ts, middleware.ts)
- [x] Run ESLint on all 3 changed files (0 problems)
- [x] Run next build (my 3 scoped files now pass tsc + eslint; build still fails on 7 PRE-EXISTING, out-of-scope errors: conflicting route/page at /services, /templates, /family-guardian; agent/route.ts `session` redeclared; orchestrator.ts missing `@/lib/utils/parse-ai-json`; family-guardian/page.tsx missing `generateFamilyInsight` export)
