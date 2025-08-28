// Simple analytics tracking
export type AnalyticsEvent =
  | "page_view"
  | "order_submitted"
  | "notify_submitted";

interface AnalyticsData {
  event: AnalyticsEvent;
  timestamp: number;
  sessionId: string;
  campaignId?: string;
  serviceType?: string;
  buildingName?: string;
  userAgent?: string;
  referrer?: string;
}

// Generate a simple session ID
function generateSessionId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Get or create session ID
function getSessionId(): string {
  if (typeof window === "undefined") return "server";

  let sessionId = localStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

// Track analytics event
export const trackEvent = async (
  event: AnalyticsEvent,
  additionalData: Partial<AnalyticsData> = {},
): Promise<void> => {
  try {
    const analyticsData: AnalyticsData = {
      event,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      referrer: typeof window !== "undefined" ? document.referrer : undefined,
      ...additionalData,
    };

    // Send to analytics endpoint
    await fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(analyticsData),
    });
  } catch (error) {
    // Silently fail analytics tracking
    console.warn("Analytics tracking failed:", error);
  }
};

// Track page view
export const trackPageView = (
  campaignId?: string,
  serviceType?: string,
  buildingName?: string,
) => {
  trackEvent("page_view", { campaignId, serviceType, buildingName });
};

// Track order submission
export const trackOrderSubmitted = (
  campaignId: string,
  serviceType: string,
  buildingName: string,
) => {
  trackEvent("order_submitted", { campaignId, serviceType, buildingName });
};

// Track notification submission
export const trackNotifySubmitted = (
  campaignId: string,
  serviceType: string,
  buildingName: string,
) => {
  trackEvent("notify_submitted", { campaignId, serviceType, buildingName });
};
