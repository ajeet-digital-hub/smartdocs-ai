/**
 * Family Guardian API client
 * Communicates with the Next.js API routes under /api/family-guardian/*
 */

import { apiFetch } from "./api"
import { ActivityAction, ActivitySeverity } from "@/models/ActivityLog";
import { IFamily } from "@/models/Family";
import { IChild } from "@/models/Child";
import { IDevice } from "@/models/Device";
import { IInstalledApp } from "@/models/Device";
import { IAppPolicy, IScheduleBlock } from "@/models/AppPolicy";
import { IWebsitePolicy } from "@/models/WebsitePolicy";
import { ISchedule } from "@/models/Schedule";
import { IUnlockRequest } from "@/models/UnlockRequest";
import { INotification } from "@/models/Notification";

// ─── Family ───

export async function getFamily(): Promise<{ ok: boolean; family: IFamily; error?: string }> {
  return apiFetch<{ ok: boolean; family: IFamily; error?: string }>("/api/family-guardian/family", { params: { populateSubscription: 'true' } })
}

export async function updateFamily(data: { familyName?: string }): Promise<{ ok: boolean; family: IFamily; error?: string }> {
  return apiFetch<{ ok: boolean; family: IFamily; error?: string }>("/api/family-guardian/family", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// ─── Children ───

export async function getChildren() {
  return apiFetch<{ ok: boolean; children: IChild[]; error?: string }>("/api/family-guardian/children");
}

export async function getChild(childId: string) {
  return apiFetch<{ ok: boolean; child: IChild }>(`/api/family-guardian/children/${childId}`);
}

export async function createChild(data: {
  name: string
  age: number
  dateOfBirth?: string
  avatar?: string
}) : Promise<{ ok: boolean; child: IChild; error?: string }> {
  return apiFetch<{ ok: boolean; child: IChild; error?: string }>("/api/family-guardian/children", {
    method: "POST", 
    body: JSON.stringify(data),
  })
}

export async function updateChild(childId: string, data: any) {
  return apiFetch<{ ok: boolean; child: IChild }>(`/api/family-guardian/children/${childId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteChild(childId: string) {
  return apiFetch<{ ok: boolean; message: string }>(`/api/family-guardian/children/${childId}`, {
    method: "DELETE",
  })
}

// ─── Devices ───

export async function getDevices(params?: { childId?: string }) {
  return apiFetch<{ ok: boolean; devices: IDevice[]; error?: string }>("/api/family-guardian/devices", { params })
}

export async function getDevice(deviceId: string) {
  return apiFetch<{ ok: boolean; device: IDevice }>(`/api/family-guardian/devices/${deviceId}`)
}

export async function initiatePairing(data: {
  childId?: string
  deviceType: string
  deviceName: string
}) {
  return apiFetch<{ ok: boolean; pairingCode: string; pairingToken: string; expiresAt: string; error?: string }>(
    "/api/family-guardian/devices/pair",
    { method: "POST", body: JSON.stringify(data) }
  )
}

export async function completePairing(pairingCode: string, deviceToken: string) {
  return apiFetch<{ ok: boolean; device: IDevice }>("/api/family-guardian/devices/pair/complete", {
    method: "POST",
    body: JSON.stringify({ pairingCode, deviceToken }),
  })
}

export async function renameDevice(deviceId: string, name: string) {
  return apiFetch<{ ok: boolean; device: IDevice; error?: string }>(`/api/family-guardian/devices/${deviceId}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  })
}

export async function assignChildToDevice(deviceId: string, childId: string) {
  return apiFetch<{ ok: boolean; device: IDevice; error?: string }>(`/api/family-guardian/devices/${deviceId}/assign`, {
    method: "POST",
    body: JSON.stringify({ childId }),
  })
}

export async function syncDevicePolicies(deviceId: string) {
  return apiFetch<{ ok: boolean; message: string; error?: string }>(
    `/api/family-guardian/devices/${deviceId}/sync`,
    { method: "POST" }
  )
}

export async function revokeDevice(deviceId: string) {
  return apiFetch<{ ok: boolean; message: string; error?: string }>(
    `/api/family-guardian/devices/${deviceId}/revoke`,
    { method: "POST" }
  )
}

export async function registerDevice(data: {
  childId: string
  deviceName: string
  platform: "android" | "ios" | "web" | "browser-extension"
  osVersion?: string
  deviceInfo?: string
}) {
  return apiFetch<{ success: boolean; deviceId: string; deviceToken: string; status: string }>(
    "/api/family-guardian/devices/register",
    { method: "POST", body: JSON.stringify(data) }
  )
}

export async function reportActivity(data: {
  appName?: string;
  appId?: string;
  domain?: string;
  usageDuration?: number; // in seconds
  action: ActivityAction;
  details?: string;
  timestamp?: Date;
  severity?: ActivitySeverity;
}) {
  return apiFetch<{ success: boolean; message: string }>("/api/family-guardian/activity", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function reportInstalledApps(data: {
  installedApps: IInstalledApp[];
}) {
  return apiFetch<{ ok: boolean; message: string }>("/api/family-guardian/device/apps/sync", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function sendHeartbeat(data: {
  status: "online" | "offline";
  batteryLevel: number;
  screenOn: boolean;
  foregroundApp?: string;
  lastSyncedPolicyVersion: number;
  installedApps: IInstalledApp[]; // Full list of installed apps
}) {
  return apiFetch<{ ok: boolean; status: string; lastSeen: string; policyUpdatesRequired: boolean; latestPolicyVersion: number; serverTime: string; deviceId: string; }>(
    "/api/family-guardian/device-heartbeat", { method: "POST", body: JSON.stringify(data) });
}

// ─── Policies ───

export async function getAppPolicies(params?: { childId?: string }): Promise<{ ok: boolean; policies: IAppPolicy[]; error?: string }> {
  return apiFetch<{ ok: boolean; policies: IAppPolicy[]; error?: string }>("/api/family-guardian/policies", {
    params,
  })
}

type AppPolicyInput = Omit<Partial<IAppPolicy>, "_id" | "childId" | "familyId"> & {
  childId?: string
  familyId?: string
}

export async function createAppPolicy(data: AppPolicyInput): Promise<{ ok: boolean; policy: IAppPolicy; error?: string }> {
  return apiFetch<{ ok: boolean; policy: IAppPolicy; error?: string }>("/api/family-guardian/policies", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateAppPolicy(policyId: string, data: AppPolicyInput): Promise<{ ok: boolean; policy: IAppPolicy }> {
  return apiFetch<{ ok: boolean; policy: IAppPolicy }>(`/api/family-guardian/policies/${policyId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteAppPolicy(policyId: string) {
  return apiFetch<{ ok: boolean; message: string }>(
    `/api/family-guardian/policies/${policyId}`,
    { method: "DELETE" }
  )
}

// ─── Website Policies ───

export async function getWebsitePolicies(params?: { childId?: string }): Promise<{ ok: boolean; policies: IWebsitePolicy[]; error?: string }> {
  return apiFetch<{ ok: boolean; policies: IWebsitePolicy[]; error?: string }>("/api/family-guardian/policies/websites", {
    params,
  })
}

export async function createWebsitePolicy(data: Partial<IWebsitePolicy>): Promise<{ ok: boolean; policy: IWebsitePolicy; error?: string }> {
  return apiFetch<{ ok: boolean; policy: IWebsitePolicy; error?: string }>("/api/family-guardian/policies/websites", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateWebsitePolicy(policyId: string, data: Partial<IWebsitePolicy>): Promise<{ ok: boolean; policy: IWebsitePolicy }> {
  return apiFetch<{ ok: boolean; policy: IWebsitePolicy }>(`/api/family-guardian/policies/websites/${policyId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteWebsitePolicy(policyId: string) {
  return apiFetch<{ ok: boolean; message: string; error?: string }>(
    `/api/family-guardian/policies/websites/${policyId}`,
    { method: "DELETE" }
  )
}

// --- Application Catalog ---
export async function getAppCatalog(): Promise<{ success: boolean; apps: { appId: string; name: string; packageName: string | null; category: string; icon: string; defaultBlocked: boolean; }[] }> {
  return apiFetch<{ success: boolean; apps: any[] }>("/api/family-guardian/apps"); // apps are AppCatalogEntry
}

// ─── Schedules ───

export async function getSchedules(params?: { childId?: string }): Promise<{ ok: boolean; schedules: ISchedule[] }> {
  return apiFetch<{ ok: boolean; schedules: ISchedule[] }>("/api/family-guardian/schedules", { params })
}

export async function createSchedule(data: Partial<ISchedule>): Promise<{ ok: boolean; schedule: ISchedule; error?: string }> {
  return apiFetch<{ ok: boolean; schedule: ISchedule; error?: string }>("/api/family-guardian/schedules", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateSchedule(scheduleId: string, data: Partial<ISchedule>): Promise<{ ok: boolean; schedule: ISchedule; error?: string }> {
  return apiFetch<{ ok: boolean; schedule: ISchedule; error?: string }>(`/api/family-guardian/schedules/${scheduleId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteSchedule(scheduleId: string) {
  return apiFetch<{ ok: boolean; message: string }>(
    `/api/family-guardian/schedules/${scheduleId}`,
    { method: "DELETE" }
  )
}

// ─── Screen Time ───

export async function getScreenTimeLimits(params?: { childId?: string }): Promise<{ ok: boolean; limits: any[] }> { // TODO: Type limits
  return apiFetch<{ ok: boolean; limits: any[] }>("/api/family-guardian/screen-time", { params }) // TODO: Type limits
}

export async function updateScreenTimeLimit(childId: string, data: { dailyLimitMinutes: number }) {
  return apiFetch<{ ok: boolean; limit: any }>(`/api/family-guardian/screen-time/${childId}`, { // TODO: Type limit
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// ─── Study Goals ───

export async function getStudyGoals(params?: { childId?: string }): Promise<{ ok: boolean; goals: any[] }> { // TODO: Type goals
  return apiFetch<{ ok: boolean; goals: any[] }>("/family-guardian/study-goals", { params }) // TODO: Type goals
}

export async function createStudyGoal(data: any): Promise<{ ok: boolean; goal: any }> { // TODO: Type goal
  return apiFetch<{ ok: boolean; goal: any }>("/family-guardian/study-goals", { // TODO: Type goal
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateStudyGoal(goalId: string, data: any): Promise<{ ok: boolean; goal: any }> { // TODO: Type goal
  return apiFetch<{ ok: boolean; goal: any }>(`/family-guardian/study-goals/${goalId}`, { // TODO: Type goal
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// ─── Rewards ───

export async function getRewards(params?: { childId?: string }): Promise<{ ok: boolean; rewards: any[] }> { // TODO: Type rewards
  return apiFetch<{ ok: boolean; rewards: any[] }>("/family-guardian/rewards", { params }) // TODO: Type rewards
}

export async function createReward(data: any): Promise<{ ok: boolean; reward: any }> { // TODO: Type reward
  return apiFetch<{ ok: boolean; reward: any }>("/family-guardian/rewards", { // TODO: Type reward
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function redeemReward(rewardId: string) {
  return apiFetch<{ ok: boolean; reward: any }>(`/api/family-guardian/rewards/${rewardId}/redeem`, { // TODO: Type reward
    method: "POST",
  })
}

// ─── Unlock Requests ───

export async function getUnlockRequests(params?: { status?: string }): Promise<{ ok: boolean; requests: IUnlockRequest[]; error?: string }> {
  return apiFetch<{ ok: boolean; requests: IUnlockRequest[]; error?: string }>("/api/family-guardian/unlock-requests", {
    params,
  })
}

export async function respondToUnlockRequest(
  requestId: string,
  action: "approve" | "deny",
  durationMinutes?: number
) : Promise<{ success: boolean; request: IUnlockRequest; error?: string }> {
  return apiFetch<{ success: boolean; request: IUnlockRequest; error?: string }>(
    `/api/family-guardian/unlock-requests/${requestId}`,
    {
      method: "POST",
      body: JSON.stringify({ action, durationMinutes }),
    }
  )
}

// ─── Emergency Access ───

export async function getEmergencyRequests(): Promise<{ ok: boolean; requests: any[]; error?: string }> { // TODO: Type requests
  return apiFetch<{ ok: boolean; requests: any[]; error?: string }>("/api/family-guardian/emergency-access") // TODO: Type requests
}

export async function respondToEmergencyRequest(
  requestId: string,
  action: "approve" | "deny",
  durationMinutes?: number
) : Promise<{ ok: boolean; request: any; error?: string }> { // TODO: Type request
  return apiFetch<{ ok: boolean; request: any; error?: string }>(`/api/family-guardian/emergency-access/${requestId}`,
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
}) : Promise<{ ok: boolean; logs: any[]; total: number; error?: string }> { // TODO: Type logs
  return apiFetch<{ ok: boolean; logs: any[]; total: number; error?: string }>( // TODO: Type logs
    "/api/family-guardian/activity-logs",
    { params }
  )
}

// ─── Analytics ───

export async function getAnalytics(childId?: string, params?: { period?: string }): Promise<{ ok: boolean; analytics: any; error?: string }> { // TODO: Type analytics
  const endpoint = childId ? `/api/family-guardian/analytics/${childId}` : "/api/family-guardian/analytics"
  return apiFetch<{ ok: boolean; analytics: any; error?: string }>(endpoint, { params }) // TODO: Type analytics
}

// ─── Notifications ───

export async function getNotifications(params?: { unreadOnly?: string; limit?: number }): Promise<{ ok: boolean; notifications: INotification[]; unreadCount: number }> {
  return apiFetch<{ ok: boolean; notifications: INotification[]; unreadCount: number }>("/api/family-guardian/notifications", {
    params: params as Record<string, string>,
  })
}

export async function markNotificationRead(notificationId: string) {
  return apiFetch<{ ok: boolean; notification: INotification }>(
    `/api/family-guardian/notifications/${notificationId}`,
    { method: "PUT" }
  )
}

export async function markAllNotificationsRead() {
  return apiFetch<{ ok: boolean; message: string }>("/api/family-guardian/notifications/read-all", {
    method: "POST",
  })
}

// ─── AI Insight ───

export async function generateFamilyInsight(): Promise<{
  ok: boolean;
  insight?: string;
  summary?: any;
  error?: string;
}> {
  return apiFetch<{ ok: boolean; insight?: string; summary?: any; error?: string }>(
    "/api/family-guardian/insight"
  )
}
