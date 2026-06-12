import { useState, useEffect, useCallback, useRef } from 'react';
import { messageAPI, Conversation, Attachment } from '../utils/messageAPI';
import { useAuth } from '../contexts/useAuth';
import { supabase } from '../utils/supabaseClient';

export function useMessaging() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchConversations = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const data = await messageAPI.getConversations();
      setConversations(data.conversations);
      setUnreadCount(data.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0));
    } catch (err: any) {
      console.error('Failed to fetch conversations:', err);
      setError(err.message);
      setConversations([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Stable ref so the real-time callback always calls the latest version of
  // fetchConversations without needing it in the subscription effect's dep array.
  // This prevents the channel from being torn down and rebuilt on every render.
  const fetchRef = useRef(fetchConversations);
  useEffect(() => { fetchRef.current = fetchConversations; }, [fetchConversations]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const data = await messageAPI.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch {}
  }, [user]);

  const sendMessage = useCallback(async (
    recipientId: string,
    content: string,
    subject?: string,
    attachments?: Attachment[],
    replyToId?: string
  ) => {
    try {
      const result = await messageAPI.sendMessage({ recipientId, subject, content, attachments, replyToId });
      await fetchConversations();
      return result.message;
    } catch (err: any) {
      console.error('Failed to send message:', err);
      throw err;
    }
  }, [fetchConversations]);

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await messageAPI.markAsRead(messageId);
      setConversations(prev =>
        prev.map(conv => ({
          ...conv,
          messages: conv.messages.map(msg => msg.id === messageId ? { ...msg, read: true } : msg),
          unreadCount: conv.messages.filter(
            msg => !msg.read && msg.id !== messageId && msg.recipientId === user?.id
          ).length,
        }))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Failed to mark message as read:', err);
    }
  }, [user]);

  const markAllAsRead = useCallback(async (partnerId: string) => {
    try {
      const result = await messageAPI.markAllAsRead(partnerId);
      setConversations(prev =>
        prev.map(conv =>
          conv.partnerId === partnerId
            ? { ...conv, messages: conv.messages.map(msg => ({ ...msg, read: true })), unreadCount: 0 }
            : conv
        )
      );
      setUnreadCount(prev => Math.max(0, prev - result.markedCount));
    } catch (err: any) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await messageAPI.deleteMessage(messageId);
      await fetchConversations();
    } catch (err: any) {
      console.error('Failed to delete message:', err);
      throw err;
    }
  }, [fetchConversations]);

  const getConversation = useCallback((partnerId: string) =>
    conversations.find(conv => conv.partnerId === partnerId),
    [conversations]
  );

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Real-time subscription — keyed only on the user ID (a stable primitive) so
  // the channel is created exactly once per session and never rebuilt due to
  // unrelated re-renders or useCallback reference changes.
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!userId) return;

    // Unique suffix per effect run prevents "after subscribe()" errors when
    // StrictMode double-invokes effects or multiple hook instances coexist.
    const channel = supabase
      .channel(`messages:${userId}:${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${userId}` },
        () => { fetchRef.current(); }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `sender_id=eq.${userId}` },
        (payload) => {
          const updated = payload.new as { id: string; read: boolean; read_at: string | null };
          setConversations(prev =>
            prev.map(conv => ({
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === updated.id
                  ? { ...msg, read: updated.read, readAt: updated.read_at }
                  : msg
              ),
            }))
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // 60-second fallback poll in case the WebSocket connection drops
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  return {
    conversations,
    loading,
    error,
    unreadCount,
    sendMessage,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    getConversation,
    refreshConversations: fetchConversations,
  };
}
