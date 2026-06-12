import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronLeft,
  MessageSquare,
  Send,
  Mail,
  MailOpen,
  Search,
  Paperclip,
  X,
  Check,
  CheckCheck,
  User,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useAuth } from '../contexts/useAuth';
import { useMessaging } from '../hooks/useMessaging';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface MessagesCenterProps {
  dashboardPath: string;
  layoutComponent: React.ComponentType<{ children: React.ReactNode }>;
  viewMode?: 'messages' | 'notifications';
  pageTitle?: string;
  hint?: string;
  embedded?: boolean;
}

export default function MessagesCenter({
  dashboardPath,
  layoutComponent: Layout,
  viewMode = 'messages',
  pageTitle,
  hint,
  embedded = false,
}: MessagesCenterProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    conversations,
    loading,
    unreadCount,
    sendMessage,
    markAsRead,
    markAllAsRead,
    refreshConversations,
  } = useMessaging();

  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get selected conversation
  const selectedConversation = useMemo(() => {
    return conversations.find(conv => conv.partnerId === selectedPartnerId);
  }, [conversations, selectedPartnerId]);

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv =>
      conv.partnerName.toLowerCase().includes(query) ||
      conv.messages.some(msg => msg.content.toLowerCase().includes(query))
    );
  }, [conversations, searchQuery]);

  const notificationItems = useMemo(() => {
    return filteredConversations
      .map((conv) => {
        const latestMessage = conv.messages[conv.messages.length - 1];
        if (!latestMessage) return null;

        return {
          partnerId: conv.partnerId,
          partnerName: conv.partnerName,
          partnerRole: conv.partnerRole,
          unreadCount: conv.unreadCount,
          content: latestMessage.content,
          timestamp: latestMessage.timestamp,
          senderName: latestMessage.senderName,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [filteredConversations]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation?.messages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (selectedPartnerId && selectedConversation && selectedConversation.unreadCount > 0) {
      markAllAsRead(selectedPartnerId);
    }
  }, [selectedPartnerId, selectedConversation, markAllAsRead]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedPartnerId || !user) return;

    try {
      setSending(true);
      await sendMessage(selectedPartnerId, messageText.trim());
      setMessageText('');
      toast.success('Message sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'patient':
        return 'bg-blue-100 text-blue-700';
      case 'care_partner':
      case 'caregiver':
        return 'bg-pink-100 text-pink-700';
      case 'clinician':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'patient':
        return 'Patient';
      case 'care_partner':
      case 'caregiver':
        return 'Care Partner';
      case 'clinician':
        return 'Clinician';
      default:
        return role;
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-600 mb-4" />
            <p className="text-lg text-gray-600">
              {'Loading messages...'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (viewMode === 'notifications') {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-[700] text-[#1A1A2E] mb-1">
                {pageTitle || 'Messages'}
              </h1>
              <p className="text-[14px] text-[#6B7280] font-[400]">
                {unreadCount > 0
                  ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`
                  : 'All caught up!'}
              </p>
            </div>

            {unreadCount > 0 && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl">
                <Mail className="w-5 h-5" />
                <span className="text-base font-medium">{unreadCount} New</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col min-h-[420px]">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-gray-200"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {notificationItems.length > 0 ? (
                <div className="space-y-2">
                  {notificationItems.map((item) => (
                    <button
                      key={item.partnerId}
                      onClick={() => {
                        if (item.unreadCount > 0) {
                          markAllAsRead(item.partnerId);
                        }
                      }}
                      className="w-full text-left p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{item.partnerName}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(item.partnerRole)}`}>
                            {getRoleLabel(item.partnerRole)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.unreadCount > 0 && (
                            <span className="bg-purple-600 text-white text-xs font-bold rounded-full min-w-[22px] h-6 px-2 flex items-center justify-center">
                              {item.unreadCount}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{item.content}</p>
                      <p className="text-xs text-gray-500 mt-1">From: {item.senderName}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <MailOpen className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">
                    {searchQuery ? 'No messages found' : 'No messages yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back to Dashboard — only shown when not embedded in a dashboard shell */}
        {!embedded && (
          <button
            onClick={() => navigate(dashboardPath)}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white transition-colors"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={18} color="#7200CA" />
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>Back to Dashboard</span>
          </button>
        )}

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[22px] font-[700] text-[#1A1A2E] mb-1">Messages</h1>
            <p className="text-[14px] text-[#6B7280] font-[400]">
              {unreadCount > 0
                ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`
                : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl">
              <Mail className="w-5 h-5" />
              <span className="text-base font-medium">{unreadCount} New</span>
            </div>
          )}
        </div>

        {hint && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-100">
            <MessageSquare className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <p className="text-sm text-purple-700">{hint}</p>
          </div>
        )}

        {/* Messages Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col h-[calc(100vh-280px)]">
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-gray-200"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.partnerId}
                      onClick={() => setSelectedPartnerId(conv.partnerId)}
                      className={`w-full text-left p-4 rounded-xl transition-all ${
                        selectedPartnerId === conv.partnerId
                          ? 'bg-purple-50 border-2 border-purple-200'
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{conv.partnerName}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(conv.partnerRole)}`}>
                              {getRoleLabel(conv.partnerRole)}
                            </span>
                          </div>
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.messages[conv.messages.length - 1]?.content || 'No messages yet'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">
                    {searchQuery ? 'No conversations found' : 'No messages yet'}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    {searchQuery ? 'Try a different search' : 'Start a conversation to get started'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col h-[calc(100vh-280px)]">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedConversation.partnerName}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(selectedConversation.partnerRole)}`}>
                        {getRoleLabel(selectedConversation.partnerRole)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {selectedConversation.messages.map((message) => {
                    const isSender = message.senderId === user?.id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isSender ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`p-4 rounded-2xl ${
                              isSender
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {!isSender && (
                              <p className="text-xs font-semibold mb-1 opacity-70">
                                {message.senderName}
                              </p>
                            )}
                            <p className="text-base whitespace-pre-wrap">{message.content}</p>
                            <div className={`flex items-center justify-end space-x-2 mt-2 text-xs ${
                              isSender ? 'text-white/80' : 'text-gray-500'
                            }`}>
                              <span>
                                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                              </span>
                              {isSender && (
                                message.read ? (
                                  <CheckCheck className="w-4 h-4" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-gray-100">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <Textarea
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="min-h-[60px] max-h-[120px] resize-none rounded-xl border-gray-200 text-base p-4"
                        disabled={sending}
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sending}
                      className="h-[60px] px-6 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageSquare className="w-20 h-20 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
