export type ThreadType =
  | 'customer-chat'
  | 'internal-chat'
  | 'customer-call'
  | 'internal-call';

export type ThreadStatus =
  | 'unread'
  | 'waiting'
  | 'active'
  | 'on-hold'
  | 'consulting'
  | 'transferring'
  | 'transferred'
  | 'ended'
  | 'wrap-up';

export type PresenceStatus =
  | 'available'
  | 'busy'
  | 'lunch'
  | 'break'
  | 'away'
  | 'wrap-up'
  | 'offline';

export type PanelType = 'directory' | 'responseassist' | 'chat-transfer' | null;

export interface Message {
  id: string;
  sender: 'agent' | 'customer' | 'internal' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  automated?: boolean; // true for bot-sent agent messages
  status?: 'sending' | 'sent' | 'failed'; // delivery state for agent messages
}

export interface Thread {
  id: string;
  type: ThreadType;
  status: ThreadStatus;
  participantName: string;
  participantRole?: string;
  caseId?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: Message[];
  chatMode?: 'live' | 'async'; // live = both parties actively engaged; async = no urgency
  // call-specific
  callDirection?: 'inbound' | 'outbound';
  callStartedAt?: number; // epoch ms, for live timer
  muted?: boolean;
  consultingWithThreadId?: string;
}

export interface DirectoryEntry {
  id: string;
  name: string;
  role: string;
  department: string;
  extension: string;
  available: boolean;
  initials: string;
}

export interface QuickResponse {
  id: string;
  category: string;
  title: string;
  body: string;
}

export interface AISuggestion {
  id: string;
  label: string;
  text: string;
}
