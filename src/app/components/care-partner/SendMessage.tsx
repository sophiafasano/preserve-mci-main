import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronLeft,
  Send,
  Heart,
  Star,
  TrendingUp,
  Award,
  MessageCircle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { usePatientConnection } from '../../hooks/usePatientConnection';
import { useCareMessages } from '../../hooks/useCareMessages';
import { toast } from 'sonner';

export default function SendMessage() {
  const navigate = useNavigate();
  const { connection, sendMessage } = usePatientConnection();
  const { addMessage } = useCareMessages();
  const [messageType, setMessageType] = useState<'encouragement' | 'reminder' | 'general'>('encouragement');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const messageTemplates = {
    encouragement: [
      {
        icon: Heart,
        title: 'Great Progress!',
        message: `Hi ${connection?.patientName || 'there'}! I've been following your sleep progress and I'm so proud of how consistent you've been. Keep up the excellent work! 💜`,
      },
      {
        icon: Star,
        title: 'Sleep Streak',
        message: `Wow, ${connection?.patientName || 'you'}! Your sleep logging streak is amazing! Every night you track is helping you understand your sleep better. You're doing great! ⭐`,
      },
      {
        icon: TrendingUp,
        title: 'Quality Improvement',
        message: `I noticed your sleep quality has been improving! The effort you're putting into the sleep modules is really paying off. Keep it up! 📈`,
      },
      {
        icon: Award,
        title: 'Module Milestone',
        message: `Congratulations on completing another sleep module! Your dedication to improving your sleep health is inspiring. I'm here cheering you on! 🎉`,
      },
    ],
    reminder: [
      {
        icon: MessageCircle,
        title: 'Gentle Check-In',
        message: `Hi ${connection?.patientName || 'there'}, just wanted to check in and see how you're doing. Don't forget to log your sleep when you get a chance! I'm here if you need anything. ❤️`,
      },
      {
        icon: CheckCircle,
        title: 'Module Reminder',
        message: `Hope you're having a good day! Just a friendly reminder that there's a new sleep module waiting for you. No pressure - whenever you're ready! 😊`,
      },
      {
        icon: Sparkles,
        title: 'Weekly Check-In',
        message: `It's been a few days since we last connected. How has your sleep been? Remember, I'm here to support you on this journey! 💙`,
      },
    ],
    general: [
      {
        icon: Heart,
        title: 'Thinking of You',
        message: `Just wanted to let you know I'm thinking of you and I'm here to support you in any way I can. How are you feeling today? 💕`,
      },
      {
        icon: MessageCircle,
        title: 'Open Message',
        message: `Hi ${connection?.patientName || 'there'}! I wanted to reach out and see how everything is going. Let me know if there's anything I can help with! ☺️`,
      },
    ],
  };

  const handleSendMessage = () => {
    const messageText = selectedTemplate || customMessage.trim();

    if (!messageText) {
      toast.error('Please select a template or write a custom message');
      return;
    }

    if (!connection) {
      toast.error('No patient connected');
      return;
    }

    // Send through patient connection system (for care partner's records)
    sendMessage({
      fromCarePartner: 'Care Partner', // In real app, would be current user
      toPatient: connection.patientId,
      message: messageText,
      messageType,
    });

    // Add to messages system (for patient to see)
    addMessage({
      senderName: 'Sarah (Care Partner)',
      senderRole: 'care-partner',
      message: messageText,
      type: messageType === 'encouragement' ? 'encouragement' : messageType === 'reminder' ? 'reminder' : 'general',
    });

    toast.success('Message sent successfully!', {
      description: `Your ${messageType} message has been delivered.`,
    });

    // Reset form
    setCustomMessage('');
    setSelectedTemplate(null);

    // Navigate back after a short delay
    setTimeout(() => {
      navigate('/caregiver');
    }, 1500);
  };

  const currentTemplates = messageTemplates[messageType];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/caregiver')}
          className="p-2 hover:bg-gray-100 rounded-xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-3xl mb-1" style={{ color: '#1f1f3d' }}>
            Send Message
          </h1>
          <p className="text-lg text-gray-600">
            Send encouragement and reminders to {connection?.patientName || 'your loved one'}
          </p>
        </div>
      </div>

      {/* Message Type Selector */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="text-xl mb-4" style={{ color: '#1f1f3d' }}>
          Message Type
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setMessageType('encouragement');
              setSelectedTemplate(null);
            }}
            className={`p-5 rounded-xl border-2 transition-all text-left ${
              messageType === 'encouragement'
                ? 'border-purple-400 bg-purple-50'
                : 'border-gray-200 bg-gray-50 hover:border-purple-200 hover:bg-purple-50'
            }`}
          >
            <Heart
              className={`w-8 h-8 mb-3 ${
                messageType === 'encouragement' ? 'text-purple-600' : 'text-gray-600'
              }`}
            />
            <h3 className="text-lg mb-1" style={{ color: '#1f1f3d' }}>
              Encouragement
            </h3>
            <p className="text-sm text-gray-600">
              Celebrate progress and achievements
            </p>
          </button>

          <button
            onClick={() => {
              setMessageType('reminder');
              setSelectedTemplate(null);
            }}
            className={`p-5 rounded-xl border-2 transition-all text-left ${
              messageType === 'reminder'
                ? 'border-teal-400 bg-teal-50'
                : 'border-gray-200 bg-gray-50 hover:border-teal-200 hover:bg-teal-50'
            }`}
          >
            <MessageCircle
              className={`w-8 h-8 mb-3 ${
                messageType === 'reminder' ? 'text-teal-600' : 'text-gray-600'
              }`}
            />
            <h3 className="text-lg mb-1" style={{ color: '#1f1f3d' }}>
              Reminder
            </h3>
            <p className="text-sm text-gray-600">
              Gentle nudges for logging or modules
            </p>
          </button>

          <button
            onClick={() => {
              setMessageType('general');
              setSelectedTemplate(null);
            }}
            className={`p-5 rounded-xl border-2 transition-all text-left ${
              messageType === 'general'
                ? 'border-purple-400 bg-purple-50'
                : 'border-gray-200 bg-gray-50 hover:border-purple-200 hover:bg-purple-50'
            }`}
          >
            <MessageCircle
              className={`w-8 h-8 mb-3 ${
                messageType === 'general' ? 'text-purple-600' : 'text-gray-600'
              }`}
            />
            <h3 className="text-lg mb-1" style={{ color: '#1f1f3d' }}>
              General
            </h3>
            <p className="text-sm text-gray-600">
              Check-in or open message
            </p>
          </button>
        </div>
      </div>

      {/* Message Templates */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="text-xl mb-4" style={{ color: '#1f1f3d' }}>
          Message Templates
        </h2>
        <p className="text-base text-gray-600 mb-6">
          Select a pre-written message or write your own below
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentTemplates.map((template, index) => {
            const Icon = template.icon;
            const isSelected = selectedTemplate === template.message;
            return (
              <button
                key={index}
                onClick={() => {
                  setSelectedTemplate(template.message);
                  setCustomMessage('');
                }}
                className={`p-5 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-200 bg-gray-50 hover:border-purple-200 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-start space-x-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-purple-200'
                        : 'bg-gray-200'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isSelected ? 'text-purple-700' : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <h3 className="text-lg" style={{ color: '#1f1f3d' }}>
                    {template.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {template.message}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Message */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="text-xl mb-4" style={{ color: '#1f1f3d' }}>
          Custom Message
        </h2>
        <p className="text-base text-gray-600 mb-4">
          Or write your own personalized message
        </p>
        <Textarea
          value={customMessage}
          onChange={(e) => {
            setCustomMessage(e.target.value);
            setSelectedTemplate(null);
          }}
          placeholder={`Write a personal message to ${connection?.patientName || 'your loved one'}...`}
          className="min-h-[150px] text-base p-4 rounded-xl border-gray-300 focus:border-purple-400 focus:ring-purple-400"
        />
      </div>

      {/* Send Button */}
      <div className="flex items-center justify-between bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
        <div>
          <p className="text-base text-gray-700 mb-1">
            {selectedTemplate
              ? 'Template selected'
              : customMessage.trim()
              ? 'Custom message ready'
              : 'Select a template or write a message to send'}
          </p>
          <p className="text-sm text-gray-600">
            Message will be visible in {connection?.patientName || "patient's"} dashboard
          </p>
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={!selectedTemplate && !customMessage.trim()}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-14 px-8 rounded-xl text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5 mr-2" />
          Send Message
        </Button>
      </div>
    </div>
  );
}