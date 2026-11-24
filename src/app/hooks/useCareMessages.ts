import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface CareMessage {
  id: string;
  senderName: string;
  senderRole: 'care-partner' | 'clinician';
  message: string;
  type: 'encouragement' | 'milestone' | 'reminder' | 'general';
  timestamp: string;
  read: boolean;
}

interface UseCareMessagesReturn {
  messages: CareMessage[];
  addMessage: (message: Omit<CareMessage, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (messageId: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
}

export function useCareMessages(): UseCareMessagesReturn {
  // Initialize with demo messages if localStorage is empty
  const defaultMessages: CareMessage[] = [
    {
      id: 'demo-1',
      senderName: 'Sarah (Care Partner)',
      senderRole: 'care-partner',
      message: "Hi Margaret! I've been following your sleep progress and I'm so proud of how consistent you've been. Keep up the excellent work! 💜",
      type: 'encouragement',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      read: false,
    },
    {
      id: 'demo-2',
      senderName: 'Sarah (Care Partner)',
      senderRole: 'care-partner',
      message: "Congratulations on completing another sleep module! Your dedication to improving your sleep health is inspiring. I'm here cheering you on! 🎉",
      type: 'milestone',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      read: true,
    },
    {
      id: 'demo-3',
      senderName: 'Sarah (Care Partner)',
      senderRole: 'care-partner',
      message: "Just wanted to let you know I'm thinking of you and I'm here to support you in any way I can. How are you feeling today? 💕",
      type: 'general',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      read: true,
    },
  ];

  const [messages, setMessages] = useLocalStorage<CareMessage[]>('care-messages', defaultMessages);
  const [unreadCount, setUnreadCount] = useState(0);

  // Calculate unread count whenever messages change
  useEffect(() => {
    const count = messages.filter((m) => !m.read).length;
    setUnreadCount(count);
  }, [messages]);

  const addMessage = (messageData: Omit<CareMessage, 'id' | 'timestamp' | 'read'>) => {
    const newMessage: CareMessage = {
      ...messageData,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [newMessage, ...prev]);
  };

  const markAsRead = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg))
    );
  };

  const markAllAsRead = () => {
    setMessages((prev) => prev.map((msg) => ({ ...msg, read: true })));
  };

  return {
    messages,
    addMessage,
    markAsRead,
    markAllAsRead,
    unreadCount,
  };
}