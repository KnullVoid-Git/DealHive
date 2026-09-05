import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  DollarSign, 
  CheckCircle, 
  Inbox as InboxIcon, 
  FileCheck, 
  AlertCircle,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';

import { convexClient as supabaseClient } from '../services/convex';
import { DealHiveNotification } from '../types/supabase.types';
import { ShimmerSkeleton } from '../components';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<DealHiveNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'deals' | 'payments'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const logs = await supabaseClient.notifications.list();
      setNotifications(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      // Mark all read in database
      const logs = await supabaseClient.notifications.list();
      for (const log of logs) {
        if (!log.is_read) {
          await supabaseClient.notifications.markAsRead(log.id);
        }
      }
      toast.success('All notifications marked as read!');
      loadNotifications();
      // Dispatch event to update bell icon in sidebar
      window.dispatchEvent(new Event('notifications-read'));
    } catch (e) {
      toast.error('Operation failed.');
    }
  };

  const handleRowClick = async (notif: DealHiveNotification) => {
    try {
      await supabaseClient.notifications.markAsRead(notif.id);
      window.dispatchEvent(new Event('notifications-read'));
      navigate(notif.link);
    } catch (e) {
      console.error(e);
    }
  };

  const getNotificationIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('message') || t.includes('chat')) {
      return {
        icon: <MessageSquare className="w-4 h-4 text-brand" />,
        bgColor: 'rgba(108, 99, 255, 0.10)',
        border: '1px solid rgba(108, 99, 255, 0.20)'
      };
    }
    if (t.includes('payment') || t.includes('invoice') || t.includes('payout')) {
      return {
        icon: <DollarSign className="w-4 h-4 text-[#16A34A]" />,
        bgColor: 'rgba(22, 163, 74, 0.10)',
        border: '1px solid rgba(22, 163, 74, 0.20)'
      };
    }
    if (t.includes('approve') || t.includes('draft') || t.includes('complete')) {
      return {
        icon: <CheckCircle className="w-4 h-4 text-[#059669]" />,
        bgColor: 'rgba(5, 150, 105, 0.10)',
        border: '1px solid rgba(5, 150, 105, 0.20)'
      };
    }
    if (t.includes('pitch') || t.includes('inbox') || t.includes('receive')) {
      return {
        icon: <InboxIcon className="w-4 h-4 text-[#2563EB]" />,
        bgColor: 'rgba(37, 99, 235, 0.10)',
        border: '1px solid rgba(37, 99, 235, 0.20)'
      };
    }
    if (t.includes('contract') || t.includes('sign') || t.includes('agree')) {
      return {
        icon: <FileCheck className="w-4 h-4 text-[#7C3AED]" />,
        bgColor: 'rgba(124, 58, 237, 0.10)',
        border: '1px solid rgba(124, 58, 237, 0.20)'
      };
    }
    return {
      icon: <AlertCircle className="w-4 h-4 text-[#DC2626]" />,
      bgColor: 'rgba(220, 38, 38, 0.10)',
      border: '1px solid rgba(220, 38, 38, 0.20)'
    };
  };

  // Filter logic
  const filtered = notifications.filter(notif => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'deals') return notif.link.includes('/deals');
    if (filter === 'payments') return notif.link.includes('/payments');
    return true;
  });

  // Render highlights
  const renderBoldedText = (txt: string) => {
    const regex = /(Samsung|NordVPN|Adobe|Lumen Health|approved|signed|paid|received|pitch|overdue)/gi;
    const parts = txt.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) 
            ? <strong key={i} className="font-semibold text-text-primary">{part}</strong> 
            : part
        )}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 w-full max-w-[1140px] mx-auto py-7 px-8">
        <ShimmerSkeleton width="220px" height="32px" />
        <ShimmerSkeleton height="280px" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1140px] mx-auto py-7 px-8 space-y-6 animate-stagger-item select-none">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border pb-4 select-none">
        <div className="flex flex-col leading-none">
          <h2 className="text-xl font-bold text-text-primary sora-heading leading-tight">
            Notifications
          </h2>
          <span className="text-xs text-text-muted mt-1 leading-none">Manage platform activity alerts and communications logs.</span>
        </div>

        <button 
          onClick={handleMarkAllRead}
          className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors flex items-center space-x-1"
        >
          <span>Mark all read</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-1.5 border-b border-border pb-2.5 leading-none select-none">
        {([
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: 'Unread Only' },
          { id: 'deals', label: 'Deals & Contracts' },
          { id: 'payments', label: 'Payments' }
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded transition-all ${
              filter === tab.id 
                ? 'bg-brand text-white shadow-sm' 
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-2'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications rows stack */}
      {filtered.length > 0 ? (
        <div className="divide-y divide-border border border-border rounded-xl bg-surface overflow-hidden shadow-sm">
          {filtered.map(notif => {
            const styleMeta = getNotificationIcon(notif.title + ' ' + notif.message);
            return (
              <div 
                key={notif.id}
                onClick={() => handleRowClick(notif)}
                className={`flex items-center justify-between p-4 cursor-pointer transition-all duration-100 select-none ${
                  !notif.is_read 
                    ? 'bg-brand-light/30 hover:bg-brand-light/45 border-l-4 border-l-brand' 
                    : 'bg-surface hover:bg-surface-2/20 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-center space-x-4 min-w-0">
                  {/* Styled icon circle */}
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: styleMeta.bgColor, border: styleMeta.border }}
                  >
                    {styleMeta.icon}
                  </div>

                  <div className="flex flex-col space-y-1 min-w-0">
                    <span className="text-[13.5px] font-sans font-normal text-text-secondary leading-tight truncate">
                      {renderBoldedText(notif.message)}
                    </span>
                    <span data-type="number" className="font-mono text-[10px] text-text-muted mt-1 leading-none">
                      {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Right unread indicator */}
                {!notif.is_read && (
                  <div className="w-2 h-2 rounded-full bg-[var(--color-brand)] mr-1 flex-shrink-0" />
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-16 bg-surface border border-dashed border-border rounded-2xl select-none text-text-muted space-y-4">
          <Bell className="w-10 h-10 text-text-faint animate-swing mx-auto" />
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-bold text-text-primary sora-heading">All caught up</span>
            <p className="text-xs text-text-muted max-w-[280px] leading-relaxed">
              No new alerts or notifications. We'll ping you as soon as brand actions occur.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Notifications;

