import { supabase } from './supabaseClient';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'care_partner' | 'caregiver' | 'clinician';
  recipientId: string;
  recipientName: string;
  recipientRole: 'patient' | 'care_partner' | 'caregiver' | 'clinician';
  subject: string;
  content: string;
  attachments: Attachment[];
  replyToId: string | null;
  timestamp: string;
  read: boolean;
  readAt: string | null;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerRole: 'patient' | 'care_partner' | 'caregiver' | 'clinician';
  messages: Message[];
  unreadCount: number;
  lastMessageAt: string;
}

type MessageRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  attachments: Attachment[] | null;
  reply_to_id: string | null;
  created_at: string;
  read: boolean;
  read_at: string | null;
};

type ProfileMapValue = {
  full_name: string;
  role: 'patient' | 'care_partner' | 'caregiver' | 'clinician';
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Not authenticated');
  }
  return data.user.id;
}

async function getProfilesByIds(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, ProfileMapValue>();
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('id', userIds);

  if (error) {
    console.warn('Unable to load profiles:', error.message);
    return new Map<string, ProfileMapValue>();
  }

  const profiles = new Map<string, ProfileMapValue>();
  for (const row of data ?? []) {
    profiles.set(row.id, {
      full_name: row.full_name,
      role: row.role,
    });
  }

  return profiles;
}

function toMessage(row: MessageRow, profileMap: Map<string, ProfileMapValue>): Message {
  const sender = profileMap.get(row.sender_id);
  const recipient = profileMap.get(row.recipient_id);

  return {
    id: row.id,
    senderId: row.sender_id,
    senderName: sender?.full_name ?? 'Unknown',
    senderRole: sender?.role ?? 'patient',
    recipientId: row.recipient_id,
    recipientName: recipient?.full_name ?? 'Unknown',
    recipientRole: recipient?.role ?? 'patient',
    subject: row.subject,
    content: row.content,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    replyToId: row.reply_to_id,
    timestamp: row.created_at,
    read: row.read,
    readAt: row.read_at,
  };
}

export const messageAPI = {
  async sendMessage(data: {
    recipientId: string;
    subject?: string;
    content: string;
    attachments?: Attachment[];
    replyToId?: string;
  }): Promise<{ success: boolean; message: Message }> {
    const senderId = await getCurrentUserId();

    const { data: inserted, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: data.recipientId,
        subject: data.subject?.trim() || 'No subject',
        content: data.content,
        attachments: data.attachments ?? [],
        reply_to_id: data.replyToId ?? null,
      })
      .select('*')
      .single();

    if (error || !inserted) {
      throw new Error(error?.message ?? 'Failed to send message');
    }

    const profileMap = await getProfilesByIds([inserted.sender_id, inserted.recipient_id]);

    return {
      success: true,
      message: toMessage(inserted as MessageRow, profileMap),
    };
  },

  async getConversations(): Promise<{ conversations: Conversation[] }> {
    const currentUserId = await getCurrentUserId();

    const { data: rows, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const messages = (rows ?? []) as MessageRow[];
    const profileIds = Array.from(
      new Set(messages.flatMap((m) => [m.sender_id, m.recipient_id])),
    );
    const profileMap = await getProfilesByIds(profileIds);

    const conversationMap = new Map<string, Conversation>();

    for (const row of messages) {
      const partnerId = row.sender_id === currentUserId ? row.recipient_id : row.sender_id;
      const partnerProfile = profileMap.get(partnerId);
      const normalized = toMessage(row, profileMap);

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partnerName: partnerProfile?.full_name ?? 'Unknown',
          partnerRole: partnerProfile?.role ?? 'patient',
          messages: [],
          unreadCount: 0,
          lastMessageAt: row.created_at,
        });
      }

      const conversation = conversationMap.get(partnerId)!;
      conversation.messages.push(normalized);

      if (!row.read && row.recipient_id === currentUserId) {
        conversation.unreadCount += 1;
      }
    }

    // Sort messages within each conversation chronologically (oldest first)
    // so the chat thread renders top→bottom and the scroll anchor lands on the newest.
    for (const conv of conversationMap.values()) {
      conv.messages.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
    }

    return {
      conversations: Array.from(conversationMap.values()).sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
      ),
    };
  },

  async getConversation(partnerId: string): Promise<{ messages: Message[] }> {
    const currentUserId = await getCurrentUserId();

    const { data: rows, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${currentUserId})`,
      )
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    const allRows = (rows ?? []) as MessageRow[];
    const profileMap = await getProfilesByIds([currentUserId, partnerId]);

    return {
      messages: allRows.map((row) => toMessage(row, profileMap)),
    };
  },

  async markAsRead(messageId: string): Promise<{ success: boolean; message: Message }> {
    const currentUserId = await getCurrentUserId();

    const { data: updated, error } = await supabase
      .from('messages')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .eq('recipient_id', currentUserId)
      .select('*')
      .single();

    if (error || !updated) {
      throw new Error(error?.message ?? 'Failed to mark message as read');
    }

    const profileMap = await getProfilesByIds([updated.sender_id, updated.recipient_id]);

    return {
      success: true,
      message: toMessage(updated as MessageRow, profileMap),
    };
  },

  async markAllAsRead(partnerId: string): Promise<{ success: boolean; markedCount: number }> {
    const currentUserId = await getCurrentUserId();

    const { count, error: countError } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', currentUserId)
      .eq('sender_id', partnerId)
      .eq('read', false);

    if (countError) {
      throw new Error(countError.message);
    }

    const { error } = await supabase
      .from('messages')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('recipient_id', currentUserId)
      .eq('sender_id', partnerId)
      .eq('read', false);

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      markedCount: count ?? 0,
    };
  },

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const currentUserId = await getCurrentUserId();

    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', currentUserId)
      .eq('read', false);

    if (error) {
      throw new Error(error.message);
    }

    return { unreadCount: count ?? 0 };
  },

  async deleteMessage(messageId: string): Promise<{ success: boolean }> {
    const currentUserId = await getCurrentUserId();

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  },
};
