/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Mail, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { AppNotification } from '../../types';
import { TranslatableText } from './TranslatableText';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  show: boolean;
  onClose: () => void;
  onNotificationClick: (notification: AppNotification) => void;
  onMarkAsRead?: (id: number) => void;
  onMarkAllAsRead?: () => void;
}

export function NotificationDropdown({
  notifications,
  show,
  onClose,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const iconStyle = {
    success: 'bg-emerald-100 text-emerald-500',
    warning: 'bg-amber-100 text-amber-500',
    critical: 'bg-red-100 text-red-500',
    default: 'bg-blue-100 text-blue-500'
  };

  useEffect(() => {
    setUnreadCount(notifications.filter(n => n.unread).length);
  }, [notifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show, onClose]);

  if (!show) return null;

  const renderNotification = (notification: AppNotification) => {
    const iconStyleValue = iconStyle[notification.type] || iconStyle.default;

    return (
      <li key={notification.id}>
        <button
          onClick={() => {
            onNotificationClick(notification);
            if (notification.unread && onMarkAsRead) {
              onMarkAsRead(notification.id);
            }
          }}
          className={`w-full p-3 text-left hover:bg-slate-50 transition-colors flex items-start gap-3 ${notification.unread ? 'bg-blue-50/50' : ''}`}
        >
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconStyle[notification.type] || iconStyle.default}`}>
            {notification.type === 'success' && <CheckCircle size={16} className="text-emerald-500" />}
            {notification.type === 'warning' && <AlertCircle size={16} className="text-amber-500" />}
            {notification.type === 'critical' && <AlertCircle size={16} className="text-red-500" />}
            {notification.type !== 'success' && notification.type !== 'warning' && notification.type !== 'critical' && <Mail size={16} className="text-blue-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className={`font-semibold text-sm ${notification.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                {notification.title}
              </h4>
              <span className="flex-shrink-0 text-[10px] text-slate-400 whitespace-nowrap">
                {notification.time}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
              {notification.message}
            </p>
            {notification.targetTab && (
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-primary-600 hover:underline cursor-pointer">
                <ExternalLink size={10} />
                <TranslatableText key="notifications.view">Ver detalhes</TranslatableText>
              </span>
            )}
          </div>
        </button>
      </li>
    );
  };

  if (!show) return null;

  const emptyState = (
    <div className="p-6 text-center">
      <Mail size={32} className="mx-auto text-slate-300 mb-2" />
      <p className="text-slate-500 text-sm font-medium">
        <TranslatableText key="notifications.empty">Nenhuma notificação</TranslatableText>
      </p>
      <p className="text-slate-400 text-[11px] mt-1">
        <TranslatableText key="notifications.empty_hint">Quando houver novidades, aparecerão aqui</TranslatableText>
      </p>
    </div>
  );

  const showMarkAllRead = notifications.length > 0 && unreadCount > 0;

  const markAllReadButton = showMarkAllRead ? (
    <div className="p-3 border-t border-slate-100">
      <button
        onClick={() => onMarkAllAsRead?.()}
        className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5"
      >
        <CheckCircle size={14} />
        <TranslatableText key="notifications.mark_all_read">Marcar todas como lidas</TranslatableText>
      </button>
    </div>
  ) : null;

  const notificationList = (
    <div>
      <ul className="divide-y divide-slate-100">
        {notifications.map(renderNotification)}
      </ul>
      {markAllReadButton}
    </div>
  );

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="fixed right-4 top-full mt-2 z-[200] w-[380px] bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
        ref={dropdownRef}
      >
        <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-slate-600" />
            <h3 className="font-semibold text-slate-900 text-sm">
              <TranslatableText key="notifications.title">Notificações</TranslatableText>
            </h3>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} <TranslatableText key="notifications.unread">não lidas</TranslatableText>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
            aria-label="Fechar notificações"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? emptyState : notificationList}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default NotificationDropdown;