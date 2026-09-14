export type NotificationType = "info" | "warning" | "error" | "success";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface NotificationCreateData {
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string;
}

export interface NotificationListParams {
  is_read?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
}
