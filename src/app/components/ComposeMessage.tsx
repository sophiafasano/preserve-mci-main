import { useState } from 'react';
import { X, Send, Loader2, User } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useMessaging } from '../hooks/useMessaging';
import { toast } from 'sonner';

interface ComposeMessageProps {
  recipientId: string;
  recipientName: string;
  recipientRole: 'patient' | 'care_partner' | 'clinician';
  onClose: () => void;
  onSent?: () => void;
}

export default function ComposeMessage({
  recipientId,
  recipientName,
  recipientRole,
  onClose,
  onSent,
}: ComposeMessageProps) {
  const { sendMessage } = useMessaging();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!messageText.trim()) return;

    try {
      setSending(true);
      await sendMessage(recipientId, messageText.trim());
      toast.success('Message sent!');
      setMessageText('');
      onSent?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'patient':
        return 'bg-blue-100 text-blue-700';
      case 'care_partner':
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
        return 'Care Partner';
      case 'clinician':
        return 'Clinician';
      default:
        return role;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">New Message</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-600">To: {recipientName}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(recipientRole)}`}>
                  {getRoleLabel(recipientRole)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Message Body */}
        <div className="p-6">
          <Textarea
            placeholder="Type your message here..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="min-h-[200px] resize-none rounded-xl border-gray-200 text-base p-4"
            autoFocus
            disabled={sending}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={sending}
            className="px-6 py-3 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || sending}
            className="px-6 py-3 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl"
          >
            {sending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
