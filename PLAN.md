# Implementation Plan: Family Guardian Enhancements

## Information Gathered

- **Project**: Next.js 16 app with NextAuth auth, MongoDB/Mongoose models, dark theme with purple/cyan gradient design
- **Services**: Defined in `frontend/app/services/data/services.ts` (local) and fetched from backend API; categories in `categories.ts`
- **Family Guardian**: Has dashboard pages under `/dashboard/family-guardian/`, API routes under `/api/family/*`
- **Existing Models**: Only `ActivityLog.ts` exists at `frontend/models/` 
- **Missing Models**: Family, Child, WebsitePolicy, Schedule, UnlockRequest, RewardGoal, Notification (imported by API routes)
- **Theme**: Dark background `#141018`, gradient accents from purple-600 to cyan-500, glass-morphism cards

## Plan

### Step 1: Add Family Guardian to Services Dashboard
**Files to edit:**
- `frontend/app/services/data/categories.ts` - Add "Parental Controls" category
- `frontend/app/services/data/services.ts` - Add Family Guardian service entry linking to `/dashboard/family-guardian`
- `frontend/app/services/components/ServiceCard.tsx` - Add color for new category

### Step 2: Create Missing MongoDB Models
**New files to create:**
- `frontend/models/Family.ts` - Family model with parentId, name
- `frontend/models/Child.ts` - Child model with familyId, name, age, devices[], etc.
- `frontend/models/WebsitePolicy.ts` - Website/app policy model
- `frontend/models/Schedule.ts` - Schedule model for time-based rules
- `frontend/models/UnlockRequest.ts` - Unlock request model
- `frontend/models/RewardGoal.ts` - Reward goal model
- `frontend/models/Notification.ts` - Notification model

### Step 3: Add Common App Names in Blocking UI
**Files to edit:**
- `frontend/app/dashboard/family-guardian/blocking/page.tsx` - Major rewrite to show app cards grid with Block/Allow/Schedule/Daily time limit actions
- Add app cards: YouTube, Instagram, Facebook, WhatsApp, TikTok, Games, Custom App
- Each card supports: Block toggle, Allow toggle, Schedule button, Daily time limit input

### Step 4: Add Pair Device Flow
**Files to create/edit:**
- `frontend/app/api/family-guardian/pair-device/route.ts` - API for pairing code generation
- `frontend/app/api/family-guardian/devices/route.ts` - API for managing child devices
- `frontend/app/dashboard/family-guardian/children/[id]/page.tsx` - Add "Pair Device" button and modal
- New component: `frontend/app/dashboard/family-guardian/components/PairDeviceModal.tsx`

### Step 5: Add Unlock Request UX (Lock Screen for Child)
**Files to create/edit:**
- `frontend/app/dashboard/family-guardian/unlock-requests/page.tsx` - Already exists and works well
- New page: `frontend/app/lock-screen/page.tsx` - Child-facing lock screen with reason, schedule info, next unlock time
- The lock screen shows: reason for lock, current schedule, next unlock time, "Request Unlock" button

### Step 6: Enhance Audit Logs
- Audit logs are already implemented via ActivityLog model and API
- Ensure all parent actions (lock/unlock, approve/deny, pair device) are logged

### Step 7: Verify Everything Works
- Check no broken routes or undefined IDs
- Verify existing app functionality still works
- Ensure responsive design on mobile/desktop

## Files to Edit
1. `frontend/app/services/data/categories.ts` - Add Parental Controls category
2. `frontend/app/services/data/services.ts` - Add Family Guardian service
3. `frontend/app/services/components/ServiceCard.tsx` - Add color for "Parental Controls"
4. `frontend/app/dashboard/family-guardian/blocking/page.tsx` - Major rewrite with app cards

## Files to Create
1. `frontend/models/Family.ts`
2. `frontend/models/Child.ts`
3. `frontend/models/WebsitePolicy.ts`
4. `frontend/models/Schedule.ts`
5. `frontend/models/UnlockRequest.ts`
6. `frontend/models/RewardGoal.ts`
7. `frontend/models/Notification.ts`
8. `frontend/app/api/family-guardian/pair-device/route.ts`
9. `frontend/app/api/family-guardian/devices/route.ts`
10. `frontend/app/dashboard/family-guardian/components/PairDeviceModal.tsx`
11. `frontend/app/lock-screen/page.tsx`

## Dependencies
- All new models need Mongoose (already installed)
- No new npm packages needed
- All existing API routes and dashboard pages must remain untouched

## Follow-up Steps
- After implementation, run `npm run build` to verify no TypeScript errors
- Verify the services page shows Family Guardian
- Verify blocking page shows app cards
- Verify pair device flow works
- Verify unlock request flow works

