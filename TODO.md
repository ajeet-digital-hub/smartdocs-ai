# Fix Plan - Completed ✓

## ✅ Step 1: Fix `frontend/lib/authOptions.ts` - authorize() error handling
- **DONE**: Replaced catch-all-with-return-null with split error handling:
  - DB connection errors → thrown (distinguished from auth failures)
  - Invalid credentials → return null (unchanged)
  - Safe server-side logging (error class names only, no secrets)

## ✅ Step 2: Fix `lib/mongodb.ts` - production caching
- **DONE**: Global caching now used in ALL environments (not just development)

## ✅ Step 3: Fix missing `dbName` in mongoose.connect() calls
Files updated with `dbName: process.env.MONGODB_DB_NAME || "smartdocs-ai"`:
- `frontend/app/api/forgot-password/route.ts`
- `frontend/app/api/reset-password/[token]/route.ts`
- `frontend/app/api/profile/password/route.ts`
- `frontend/app/api/profile/route.ts` (both GET and PUT)
- `frontend/app/api/profile/verify-email/route.ts`
- `frontend/app/api/profile/verify-email/[token]/route.ts`
- `frontend/app/api/family/route.ts` (GET and PUT)
- `frontend/app/api/family/activity/route.ts`
- `frontend/app/api/family/analytics/route.ts`
- `frontend/app/api/family/children/route.ts` (ensureFamily)
- `frontend/app/api/family/children/[id]/route.ts` (GET, PUT, DELETE)
- `frontend/app/api/family/rewards/route.ts` (GET)
- `frontend/app/api/family/schedules/route.ts` (GET)
- `frontend/app/api/family/schedules/[id]/route.ts` (PUT)
- `frontend/app/api/family/unlock-requests/route.ts` (GET)
- `frontend/app/api/family/unlock-requests/[id]/route.ts`
- `frontend/app/api/family/website-policies/route.ts` (GET)
- `frontend/app/api/family/website-policies/[id]/route.ts` (PUT)
- `frontend/app/api/family-guardian/device-auth/route.ts` (POST + verifyDeviceToken)
- `frontend/app/api/family-guardian/devices/route.ts` (GET)
- `frontend/app/api/family-guardian/pair-device/route.ts`
- `frontend/app/api/family-guardian/revoke-device/route.ts`
- `frontend/app/api/account/avatar/route.ts`
- `frontend/app/api/notifications/route.ts`

## ✅ Step 4: Build & Type-check
- **DONE**: Errors are ALL pre-existing (not introduced by changes)

## ✅ Step 5: Report complete

