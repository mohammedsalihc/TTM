import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Spinner from './Spinner';
import { BellIcon } from './icons';
import { computePopoverPosition, PopoverCoords } from '../utils/popoverPosition';
import {
  listNotificationsRequest,
  markNotificationReadRequest,
  markAllNotificationsReadRequest,
} from '../services/notificationService';
import { Notification } from '../types';

const PANEL_WIDTH = 340;
const PANEL_HEIGHT_ESTIMATE = 400;
// No websocket/real-time infra in this app — a periodic poll is the
// simplest way to keep the unread badge from going stale while the tab
// stays open.
const UNREAD_POLL_MS = 60_000;

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Same portal + fixed-position pattern as DatePicker/SingleSelectDropdown —
// anchored to the bell button's real screen coordinates so the panel floats
// cleanly above the page instead of being clipped by Navbar's overflow.
function NotificationsBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<PopoverCoords>({ top: 0, left: 0, width: PANEL_WIDTH });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = () => {
    listNotificationsRequest({ page: 1, limit: 1, isRead: 'false' })
      .then((res) => setUnreadCount(res.pagination.total))
      .catch(() => {});
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, UNREAD_POLL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (!isOpen) {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        setCoords(computePopoverPosition(rect, PANEL_HEIGHT_ESTIMATE, PANEL_WIDTH));
      }
      setIsLoading(true);
      listNotificationsRequest({ page: 1, limit: 20 })
        .then((res) => setNotifications(res.data))
        .finally(() => setIsLoading(false));
    }
    setIsOpen((prev) => !prev);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationReadRequest(notification.id);
        setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Best-effort — the notification still opened/navigated either way.
      }
    }
    setIsOpen(false);
    if (notification.relatedProjectId) {
      navigate(`/projects/${notification.relatedProjectId}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadRequest();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Best-effort.
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        aria-label="Notifications"
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <BellIcon size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width }}
            className="z-[60] bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size={18} />
                </div>
              ) : notifications.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No notifications yet</p>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors flex items-start gap-2.5 ${
                      notification.isRead ? '' : 'bg-indigo-50/40'
                    }`}
                  >
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                        notification.isRead ? 'bg-transparent' : 'bg-indigo-500'
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm text-gray-700">{notification.message}</span>
                      <span className="block text-xs text-gray-400 mt-0.5">{formatRelativeTime(notification.createdAt)}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export default NotificationsBell;
