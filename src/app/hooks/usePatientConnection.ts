import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';

/**
 * Patient-Care Partner Connection Data
 */
export interface PatientConnection {
  patientId: string;
  patientName: string;
  patientEmail: string;
  dateConnected: string;
  relationshipType: 'spouse' | 'child' | 'sibling' | 'friend' | 'other';
}

/**
 * Care Partner Messages
 */
export interface CarePartnerMessage {
  id: string;
  fromCarePartner: string;
  toPatient: string;
  message: string;
  messageType: 'encouragement' | 'reminder' | 'question' | 'general';
  timestamp: string;
  read: boolean;
}

/**
 * Messages Storage
 */
export interface MessagesStorage {
  messages: CarePartnerMessage[];
}

/**
 * Hook for managing patient-care partner connections
 */
export function usePatientConnection() {
  const [connection, setConnection] = useLocalStorage<PatientConnection | null>(
    STORAGE_KEYS.PATIENT_CONNECTION,
    null
  );

  const [messagesStorage, setMessagesStorage] = useLocalStorage<MessagesStorage>(
    STORAGE_KEYS.CARE_MESSAGES,
    { messages: [] }
  );

  /**
   * Connect to a patient
   */
  const connectToPatient = useCallback(
    (connectionData: Omit<PatientConnection, 'dateConnected'>) => {
      const newConnection: PatientConnection = {
        ...connectionData,
        dateConnected: new Date().toISOString(),
      };
      setConnection(newConnection);
      return newConnection;
    },
    [setConnection]
  );

  /**
   * Disconnect from patient
   */
  const disconnectFromPatient = useCallback(() => {
    setConnection(null);
  }, [setConnection]);

  /**
   * Send message to patient
   */
  const sendMessage = useCallback(
    (message: Omit<CarePartnerMessage, 'id' | 'timestamp' | 'read'>) => {
      const newMessage: CarePartnerMessage = {
        ...message,
        id: generateMessageId(),
        timestamp: new Date().toISOString(),
        read: false,
      };

      setMessagesStorage((prev) => ({
        messages: [newMessage, ...prev.messages],
      }));

      return newMessage;
    },
    [setMessagesStorage]
  );

  /**
   * Get all messages for current patient
   */
  const getMessages = useCallback(() => {
    if (!connection) return [];
    return messagesStorage.messages.filter(
      (msg) => msg.toPatient === connection.patientId
    );
  }, [connection, messagesStorage.messages]);

  /**
   * Mark message as read
   */
  const markMessageAsRead = useCallback(
    (messageId: string) => {
      setMessagesStorage((prev) => ({
        messages: prev.messages.map((msg) =>
          msg.id === messageId ? { ...msg, read: true } : msg
        ),
      }));
    },
    [setMessagesStorage]
  );

  return {
    // Connection data
    connection,
    isConnected: !!connection,

    // Connection actions
    connectToPatient,
    disconnectFromPatient,

    // Messaging
    sendMessage,
    getMessages,
    markMessageAsRead,
    messages: getMessages(),
  };
}

/**
 * Generate unique ID for messages
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
