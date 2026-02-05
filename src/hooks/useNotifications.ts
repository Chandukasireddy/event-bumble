import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UnreadCounts {
  pendingRequests: number;
  unreadMessages: number;
}

// Request browser notification permission
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  
  const permission = await Notification.requestPermission();
  return permission === "granted";
};

// Send a browser push notification
const sendBrowserNotification = (title: string, body: string) => {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  
  // Only send if page is not focused
  if (document.visibilityState === "visible") return;
  
  const notification = new Notification(title, {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: "meetspark-notification",
    renotify: true,
  } as NotificationOptions);
  
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
};

export function useNotifications(eventId: string, currentUserId?: string) {
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
    pendingRequests: 0,
    unreadMessages: 0,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  // Request permission on mount
  useEffect(() => {
    requestNotificationPermission().then(setNotificationsEnabled);
  }, []);

  const fetchUnreadCounts = useCallback(async () => {
    if (!currentUserId || !eventId) return;

    // Count unseen pending requests where I am the target
    const { count: pendingCount } = await supabase
      .from("meeting_requests")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("target_id", currentUserId)
      .eq("status", "pending")
      .eq("seen_by_target", false);

    // Count unread messages in accepted meetings
    const { data: myMeetings } = await supabase
      .from("meeting_requests")
      .select("id, requester_id, target_id")
      .eq("event_id", eventId)
      .eq("status", "accepted")
      .or(`requester_id.eq.${currentUserId},target_id.eq.${currentUserId}`);

    let unreadMessagesCount = 0;
    if (myMeetings && myMeetings.length > 0) {
      const meetingIds = myMeetings.map((m) => m.id);
      const { count } = await supabase
        .from("meeting_messages")
        .select("*", { count: "exact", head: true })
        .in("meeting_request_id", meetingIds)
        .neq("sender_id", currentUserId)
        .is("read_at", null);
      unreadMessagesCount = count || 0;
    }

    setUnreadCounts({
      pendingRequests: pendingCount || 0,
      unreadMessages: unreadMessagesCount,
    });
  }, [currentUserId, eventId]);

  // Mark meeting request as seen
  const markRequestSeen = useCallback(async (requestId: string) => {
    await supabase
      .from("meeting_requests")
      .update({ seen_by_target: true })
      .eq("id", requestId);
    fetchUnreadCounts();
  }, [fetchUnreadCounts]);

  // Mark messages as read for a specific meeting
  const markMessagesRead = useCallback(async (meetingRequestId: string) => {
    if (!currentUserId) return;
    await supabase
      .from("meeting_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("meeting_request_id", meetingRequestId)
      .neq("sender_id", currentUserId)
      .is("read_at", null);
    fetchUnreadCounts();
  }, [currentUserId, fetchUnreadCounts]);

  useEffect(() => {
    fetchUnreadCounts();

    if (!currentUserId || !eventId) return;

    // Listen for new meeting requests
    const requestChannel = supabase
      .channel(`notifications-requests-${eventId}-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "meeting_requests",
          filter: `target_id=eq.${currentUserId}`,
        },
        async (payload) => {
          const { data: requester } = await supabase
            .from("registrations")
            .select("name")
            .eq("id", payload.new.requester_id)
            .maybeSingle();

          const name = requester?.name || "Someone";
          
          // In-app toast
          toast({
            title: "New Meeting Request! 🎉",
            description: `${name} wants to meet you`,
          });
          
          // Browser push notification
          sendBrowserNotification(
            "New Meeting Request! 🎉",
            `${name} wants to meet you`
          );
          
          fetchUnreadCounts();
        }
      )
      .subscribe();

    // Listen for new messages in my accepted meetings
    const messageChannel = supabase
      .channel(`notifications-messages-${eventId}-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "meeting_messages",
        },
        async (payload) => {
          // Check if this message is in a meeting I'm part of and not from me
          if (payload.new.sender_id === currentUserId) return;

          const { data: meeting } = await supabase
            .from("meeting_requests")
            .select("requester_id, target_id")
            .eq("id", payload.new.meeting_request_id)
            .maybeSingle();

          if (
            meeting &&
            (meeting.requester_id === currentUserId || meeting.target_id === currentUserId)
          ) {
            const { data: sender } = await supabase
              .from("registrations")
              .select("name")
              .eq("id", payload.new.sender_id)
              .maybeSingle();

            const name = sender?.name || "Someone";
            const messagePreview = (payload.new.message as string).slice(0, 50);
            const truncated = (payload.new.message as string).length > 50 ? "..." : "";

            // In-app toast
            toast({
              title: "New Message 💬",
              description: `${name}: ${messagePreview}${truncated}`,
            });
            
            // Browser push notification
            sendBrowserNotification(
              `New Message from ${name}`,
              `${messagePreview}${truncated}`
            );
            
            fetchUnreadCounts();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [eventId, currentUserId, toast, fetchUnreadCounts]);

  return {
    unreadCounts,
    totalUnread: unreadCounts.pendingRequests + unreadCounts.unreadMessages,
    markRequestSeen,
    markMessagesRead,
    refreshCounts: fetchUnreadCounts,
    notificationsEnabled,
    requestPermission: requestNotificationPermission,
  };
}
