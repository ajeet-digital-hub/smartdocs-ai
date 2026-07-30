# UI & Product Discoverability Fix - Implementation Plan

## Steps:

### [x] Step 1: Information Gathering & Analysis
- [x] Explored entire codebase structure
- [x] Checked all routes, navigation, components
- [x] Identified root causes

### [ ] Step 2: Fix Plan Configuration
- [ ] Update Basic price from ₹199 → ₹299 in `plan-config.ts`
- [ ] Fix broken imports in PricingCard, FeatureComparison, UpgradeButton

### [ ] Step 3: Create `/pricing` Page
- [ ] Create `frontend/app/pricing/page.tsx`

### [ ] Step 4: Fix UpgradeButton - Add Checkout Navigation
- [ ] Update `UpgradeButton.tsx` with onClick handler

### [ ] Step 5: Create AI Workspace `/ai-tools`
- [ ] Create `frontend/app/ai-tools/page.tsx` with chat interface

### [ ] Step 6: Create Subscription Dashboard `/dashboard/subscription`
- [ ] Create `frontend/app/dashboard/subscription/page.tsx`

### [ ] Step 7: Update Homepage - Add AI Entry Point
- [ ] Add AI section to `frontend/app/page.tsx`

### [ ] Step 8: Update Navigation
- [ ] Navbar already has AI Tools and Pricing links (routes now exist)
- [ ] Add subscription link to dashboard sidebar
- [ ] Add subscription link to profile dropdown

### [ ] Step 9: Update PRODUCTION_CODE_AUDIT.md
- [ ] Add UI & Product Discoverability Audit section

### [ ] Step 10: Validation
- [ ] npm run lint
- [ ] npx tsc --noEmit
- [ ] npm run build
