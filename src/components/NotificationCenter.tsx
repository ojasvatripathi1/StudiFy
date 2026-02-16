"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Notification } from '@/lib/types';
import { getNotifications, markNotificationAsRead } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Award, TrendingUp, AlertTriangle, Calendar, Check, Sparkles, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const iconMap = {
  leaderboard: TrendingUp,
  penalty: AlertTriangle,
  achievement: Award,
  reminder: Calendar
};

export function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        const notificationData = await getNotifications(user.uid);
        setNotifications(notificationData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      await markNotificationAsRead(user.uid, notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.3em] text-primary animate-pulse">
          Fetching Signals...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-3xl font-black uppercase tracking-tight flex items-center gap-4 text-foreground">
            <Bell className="h-8 w-8 text-primary" />
            Inbox
          </h3>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Stay synchronized with your progress
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="px-6 py-2 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 animate-pulse">
            {unreadCount} New
          </div>
        )}
      </div>

      <div className="group relative overflow-hidden rounded-[3rem] p-1 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-50" />
        <div className="relative bg-card/80 backdrop-blur-3xl rounded-[2.9rem] p-8 md:p-12 border border-white/10 shadow-2xl">
          <ScrollArea className="h-[600px] pr-6">
            {notifications.length > 0 ? (
              <div className="space-y-6">
                {notifications.map(notification => {
                  const IconComponent = iconMap[notification.type] || Bell;
                  
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "group/item relative overflow-hidden rounded-[2rem] p-0.5 transition-all duration-500 hover:scale-[1.01]",
                        !notification.read && "bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 bg-[length:200%_auto] animate-gradient"
                      )}
                    >
                      <div className={cn(
                        "relative bg-card/50 backdrop-blur-xl rounded-[1.9rem] p-6 flex flex-col md:flex-row items-center gap-6 transition-all",
                        !notification.read ? "border-transparent" : "border-border/50"
                      )}>
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover/item:scale-110 duration-500",
                          notification.type === 'achievement' ? 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20' :
                          notification.type === 'leaderboard' ? 'bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20' :
                          notification.type === 'penalty' ? 'bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20' :
                          'bg-primary/10 text-primary ring-1 ring-primary/20'
                        )}>
                          <IconComponent className="h-8 w-8" />
                        </div>

                        <div className="flex-1 space-y-2 text-center md:text-left">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h4 className="text-lg font-black uppercase tracking-tight text-foreground group-hover/item:text-primary transition-colors">
                              {notification.title}
                            </h4>
                            <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          {!notification.read && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300"
                            >
                              <Check className="h-6 w-6" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-8">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] rotate-12" />
                  <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] -rotate-12" />
                  <div className="relative w-full h-full bg-card rounded-[2.5rem] shadow-xl border border-white/10 flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-foreground">
                    Silence is Golden
                  </h4>
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/40 max-w-xs mx-auto">
                    You&apos;re all caught up. No new signals detected at this time.
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

