# SmartDocs Family Guardian - Implementation Plan

## Project Architecture Inspection

| Component | Status | Details |
|-----------|--------|---------|
| Auth System | NextAuth v4 (JWT) | Credentials + Google + Apple |
| Database | MongoDB + Mongoose | Models in `frontend/models/` |
| UI Framework | Tailwind CSS v4 | Custom animations, dark theme |
| Navigation | `frontend/app/components/Navbar.tsx` | navLinks array, profile dropdown |
| Dashboard Header | `frontend/components/Header.tsx` | Used inside dashboard layout |
| Notifications | `frontend/models/Notification.ts` | userId, message, read, type, link |
| AI Infrastructure | None | Will create service abstraction with mock mode |

## Plan

### PHASE 1: Database Models + API Routes (Backend)

**New Models (6):**
1. `frontend/models/Family.ts` - Family group linked to parent user
2. `frontend/models/Child.ts` - Child profiles with ref to Family
3. `frontend/models/Schedule.ts` - Schedule rules per child (study, sleep, school, free)
4. `frontend/models/WebsitePolicy.ts` - Website/app blocking policies per child
5. `frontend/models/UnlockRequest.ts` - Unlock requests from child to parent
6. `frontend/models/RewardGoal.ts` - Study goals → screen time rewards
7. `frontend/models/ActivityLog.ts` - Activity/audit logs

**New API Routes (10):**
- `GET/POST /api/family/child` - List children / Create child
- `GET/PUT/DELETE /api/family/child/[id]` - Manage specific child
- `GET/POST /api/family/schedule` - Manage schedules
- `PUT/DELETE /api/family/schedule/[id]`
- `GET/POST /api/family/website-policy` - Website blocking policies
- `PUT /api/family/website-policy/[id]`
- `GET/POST /api/family/unlock-request` - Unlock requests
- `PUT /api/family/unlock-request/[id]` - Approve/deny
- `GET /api/family/activity` - Activity logs
- `GET /api/family/analytics` - Analytics data

### PHASE 1 continued: Frontend Pages (10 new pages)

1. `frontend/app/dashboard/family-guardian/page.tsx` - Parent Dashboard
2. `frontend/app/dashboard/family-guardian/children/page.tsx` - List children
3. `frontend/app/dashboard/family-guardian/children/[id]/page.tsx` - Child detail
4. `frontend/app/dashboard/family-guardian/schedules/page.tsx` - Schedule manager
5. `frontend/app/dashboard/family-guardian/blocking/page.tsx` - Website/App blocking
6. `frontend/app/dashboard/family-guardian/unlock-requests/page.tsx` - Unlock requests
7. `frontend/app/dashboard/family-guardian/rewards/page.tsx` - Reward goals
8. `frontend/app/dashboard/family-guardian/analytics/page.tsx` - Analytics
9. `frontend/app/dashboard/family-guardian/settings/page.tsx` - Family settings

### PHASE 2: Navigation Integration
- Add "Family Guardian" to `navLinks` in Navbar (shown only when authenticated)
- Add "Family Guardian" to dashboard sidebar/header dropdown

### PHASE 3: Gamification + Study Assistant
- Study streaks, points, achievements
- AI Study Assistant service abstraction with mock mode

## Files to Modify
1. `frontend/app/components/Navbar.tsx` - Add Family Guardian nav link
2. `frontend/components/Header.tsx` - Add Family Guardian link in dropdown

## Files to Create
See above - approximately 7 models + 10 API routes + 10 pages + components

