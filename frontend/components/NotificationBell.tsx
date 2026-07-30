"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import * as familyGuardianApi from "@/lib/family-guardian-api";
import { markAllNotificationsRead } from "@/lib/family-guardian-api";

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  type: "security" | "general";
  link?: string;
  createdAt: string;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const data = await familyGuardianApi.getNotifications();
      if (data.ok) {
        setNotifications(data.notifications);
        prevCountRef.current = unreadCount;
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session?.user?.id, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (notificationId: string) => {
    try {
      await familyGuardianApi.markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  if (!session?.user?.id) return null;

  const hasNewNotifications = unreadCount > prevCountRef.current;

  return (
    <div style={{ position: "relative" }} ref={bellRef}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        style={{
          position: "relative",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "6px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F0E8")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        aria-label="Notifications"
      >
        <span style={{ fontSize: "18px" }}>
          {hasNewNotifications ? "🔔" : "🔕"}
        </span>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "0px",
              right: "0px",
              background: "#E53E3E",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              minWidth: "16px",
              height: "16px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "44px",
            background: "#fff",
            border: "1px solid #E5DCC8",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 100,
            width: "320px",
            maxHeight: "400px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderBottom: "1px solid #F0EBE0",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#241F1B" }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#8B2E3F",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F0E8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading && notifications.length === 0 && (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#8A7F72",
                }}
              >
                Loading...
              </div>
            )}
            {!loading && notifications.length === 0 && (
              <div
                style={{
                  padding: "32px 24px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔔</div>
                <p style={{ fontSize: "14px", color: "#6E6459", margin: 0 }}>
                  No notifications yet
                </p>
                <p style={{ fontSize: "12px", color: "#8A7F72", margin: "4px 0 0 0" }}>
                  We'll notify you when something arrives.
                </p>
              </div>
            )}
            {notifications.map((notification) => (
              <div
                key={notification._id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "10px 14px",
                  cursor: "pointer",
                  background: notification.read ? "transparent" : "#FFFDF7",
                  borderBottom: "1px solid #F5F0E8",
                  transition: "background 0.15s",
                }}
                onClick={() => {
                  if (!notification.read) handleMarkRead(notification._id);
                  if (notification.link) window.location.href = notification.link;
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#F5F0E8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = notification.read
                    ? "transparent"
                    : "#FFFDF7")
                }
              >
                <div>
                  {notification.type === "security" ? "🛡️" : "📌"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "13px",
                      color: notification.read ? "#6E6459" : "#241F1B",
                      margin: 0,
                      fontWeight: notification.read ? 400 : 600,
                      lineHeight: 1.4,
                    }}
                  >
                    {notification.message}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#8A7F72",
                      margin: "4px 0 0 0",
                    }}
                  >
                    {new Date(notification.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {!notification.read && (
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#8B2E3F",
                      marginTop: "6px",
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
