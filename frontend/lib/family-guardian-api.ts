/**
 * Family Guardian API client
 * Communicates with the Next.js API routes under /api/family-guardian/*
 */

import { apiFetch } from "./api"

// ─── Family ───

export async function getFamily() {
  return apiFetch<{ ok: boolean; family: any }>("/family-guardian/family")
}

export async function updateFamily(data: { familyName?: string }) {
  return apiFetch<{ ok: boolean; family: any }>("/family-guardian/family", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// ─── Children ───

export async function getChildren() {
  return apiFetch<{ ok: boolean; children: any[] }>("/family-guardian/children")
}

export async function createChild(data: {
  name: string
  age: number
  dateOfBirth?: string
  avatar?: string
}) {
  return apiFetch<{ ok: boolean; child: any }>("/family-guardian/children", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateChild(childId: string, data: any) {
  return apiFetch<{ ok: boolean; child: any }>(`/family-guardian/children/${childId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteChild(childId: string) {
  return apiFetch<{ ok: boolean; message: string }>(`/family-guardian/children/${childId}`, {
    method: "DELETE",
  })
}

// ─── Devices ───

export async function getDevices() {
  return apiFetch<{ ok: boolean; devices: any[] }>("/family-guardian/devices")
}

export async function getDevice(deviceId: string) {
  return apiFetch<{ ok: boolean; device: any }>(`/family-guardian/devices/${deviceId}`)
}

export async function initiatePairing(data: {
  childId?: string
  deviceType: string
  deviceName: string
}) {
  return apiFetch<{ ok: boolean; pairingCode: string; pairingToken: string; expiresAt: string }>(
    "/family-guardian/devices/pair",
    { method: "POST", body: JSON.stringify(data) }
  )
}

export async function completePairing(pairingCode: string, deviceToken: string) {
  return apiFetch<{ ok: boolean; device: any }>("/family-guardian/devices/pair/complete", {
    method: "POST",
    body: JSON.stringify({ pairingCode, deviceToken }),
  })
}

export async function renameDevice(deviceId: string, name: string) {
  return apiFetch<{ ok: boolean; device: any }>(`/family-guardian/devices/${deviceId}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  })
}

export async function assignChildToDevice(deviceId: string, childId: string) {
  return apiFetch<{ ok: boolean; device: any }>(`/family-guardian/devices/${deviceId}/assign`, {
    method: "POST",
    body: JSON.stringify({ childId }),
  })
}

export async function syncDevicePolicies(deviceId: string) {
  return apiFetch<{ ok: boolean; message: string }>(
    `/family-guardian/devices/${deviceId}/sync`,
    { method: "POST" }
  )
}

export async function revokeDevice(deviceId: string) {
  return apiFetch<{ ok: boolean; message: string }>(
    `/family-guardian/devices/${deviceId}/revoke`,
    { method: "POST" }
  )
}

// ─── Policies ───

export async function getWebsitePolicies(params?: { childId?: string }) {
  return apiFetch<{ ok: boolean; policies: any[] }>("/family-guardian/policies/websites", {
    params,
  })
}

export async function createWebsitePolicy(data: any) {
  return apiFetch<{ ok: boolean; policy: any }>("/family-guardian/policies/websites", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateWebsitePolicy(policyId: string, data: any) {
  return apiFetch<{ ok: boolean; policy: any }>(`/family-guardian/policies/websites/${policyId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteWebsitePolicy(policyId: string) {
  return apiFetch<{ ok: boolean; message: string }>(
    `/family-guardian/policies/websites/${policyId}`,
    { method: "DELETE" }
  )
}

export async function getAppPolicies(params?: { childId?: string }) {
  return apiFetch<{ ok: boolean; policies: any[] }>("/family-guardian/policies/apps", { params })
}

export async function createAppPolicy(data: any) {
  return apiFetch<{ ok: boolean; policy: any }>("/family-guardian/policies/apps", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateAppPolicy(policyId: string, data: any) {
  return apiFetch<{ ok: boolean; policy: any }>(`/family-guardian/policies/apps/${policyId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteAppPolicy(policyId: string) {
  return apiFetch<{ ok: boolean; message: string }>(
    `/family-guardian/policies/apps/${policyId}`,
    { method: "DELETE" }
  )
}

// ─── Schedules ───

export async function getSchedules(params?: { childId?: string }) {
  return apiFetch<{ ok: boolean; schedules: any[] }>("/family-guardian/schedules", { params })
}

export async function createSchedule(data: any) {
  return apiFetch<{ ok: boolean; schedule: any }>("/family-guardian/schedules", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateSchedule(scheduleId: string, data: any) {
  return apiFetch<{ ok: boolean; schedule: any }>(`/family-guardian/schedules/${scheduleId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteSchedule(scheduleId: string) {
  return apiFetch<{ ok: boolean; message: string }>(
    `/family-guardian/schedules/${scheduleId}`,
    { method: "DELETE" }
  )
}

// ─── Screen Time ───

export async function getScreenTimeLimits(params?: { childId?: string }) {
  return apiFetch<{ ok: boolean; limits: any[] }>("/family-guardian/screen-time", { params })
}

export async function updateScreenTimeLimit(childId: string, data: { dailyLimitMinutes: number }) {
  return apiFetch<{ ok: boolean; limit: any }>(`/family-guardian/screen-time/${childId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// ─── Study Goals ───

export async function getStudyGoals(params?: { childId?: string }) {
  return apiFetch<{ ok: boolean; goals: any[] }>("/family-guardian/study-goals", { params })
}

export async function createStudyGoal(data: any) {
  return apiFetch<{ ok: boolean; goal: any }>("/family-guardian/study-goals", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateStudyGoal(goalId: string, data: any) {
  return apiFetch<{ ok: boolean; goal: any }>(`/family-guardian/study-goals/${goalId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// ─── Rewards ───

export async function getRewards(params?: { childId?: string }) {
  return apiFetch<{ ok: boolean; rewards: any[] }>("/family-guardian/rewards", { params })
}

export async function createReward(data: any) {
  return apiFetch<{ ok: boolean; reward: any }>("/family-guardian/rewards", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function redeemReward(rewardId: string) {
  return apiFetch<{ ok: boolean; reward: any }>(`/family-guardian/rewards/${rewardId}/redeem`, {
    method: "POST",
  })
}

// ─── Unlock Requests ───

export async function getUnlockRequests(params?: { status?: string }) {
  return apiFetch<{ ok: boolean; requests: any[] }>("/family-guardian/unlock-requests", {
    params,
  })
}

export async function respondToUnlockRequest(
  requestId: string,
  action: "approve" | "deny",
  durationMinutes?: number
) {
  return apiFetch<{ ok: boolean; request: any }>(
    `/family-guardian/unlock-requests/${requestId}`,
    {
      method: "POST",
      body: JSON.stringify({ action, durationMinutes }),
    }
  )
}

// ─── Emergency Access ───

export async function getEmergencyRequests() {
  return apiFetch<{ ok: boolean; requests: any[] }>("/family-guardian/emergency-access")
}

export async function respondToEmergencyRequest(
  requestId: string,
  action: "approve" | "deny",
  durationMinutes?: number
) {
  return apiFetch<{ ok: boolean; request: any }>(
    `/family-guardian/emergency-access/${requestId}`,
    {
      method: "POST",
      body: JSON.stringify({ action, durationMinutes }),
    }
  )
}

// ─── Activity Logs ───

export async function getActivityLogs(params?: {
  childId?: string
  limit?: string
  offset?: string
}) {
  return apiFetch<{ ok: boolean; logs: any[]; total: number }>(
    "/family-guardian/activity-logs",
    { params }
  )
}

// ─── Analytics ───

export async function getAnalytics(params?: { childId?: string; period?: string }) {
  return apiFetch<{ ok: boolean; analytics: any }>("/family-guardian/analytics", { params })
}

// ─── Notifications ───

export async function getNotifications(params?: { unreadOnly?: string }) {
  return apiFetch<{ ok: boolean; notifications: any[] }>("/family-guardian/notifications", {
    params,
  })
}

export async function markNotificationRead(notificationId: string) {
  return apiFetch<{ ok: boolean; notification: any }>(
    `/family-guardian/notifications/${notificationId}`,
    { method: "PUT" }
  )
}

export async function markAllNotificationsRead() {
  return apiFetch<{ ok: boolean; message: string }>("/family-guardian/notifications/read-all", {
    method: "POST",
  })
}
