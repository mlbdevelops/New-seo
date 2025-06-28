import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationState {
  notification: Notification | null;
  showNotification: (message: string, type: NotificationType) => void;
  hideNotification: () => void;
}

const useNotificationStore = create<NotificationState>((set, get) => ({
  notification: null,

  showNotification: (message: string, type: NotificationType) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification = { id, message, type };
    
    set({ notification });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      const current = get().notification;
      if (current && current.id === id) {
        set({ notification: null });
      }
    }, 5000);
  },

  hideNotification: () => {
    set({ notification: null });
  },
}));

export const useNotification = () => {
  const { notification, showNotification, hideNotification } = useNotificationStore();
  return { notification, showNotification, hideNotification };
};