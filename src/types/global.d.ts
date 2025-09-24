import { debugNotification } from "@/utils/notificationHelper";

declare global {
  interface Window {
    debugNotification: typeof debugNotification;
  }
}
