export type ThreadType =
  | 'customer-chat'
  | 'internal-chat'
  | 'customer-call'
  | 'internal-call';

export type ThreadStatus =
  | 'unread'
  | 'ringing'
  | 'waiting'
  | 'active'
  | 'idle'
  | 'idle-declared'
  | 'escalated'
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
  // context layer
  slaDeadlineAt?: number;      // epoch ms — when SLA expires
  sentiment?: 'positive' | 'neutral' | 'negative' | 'escalating';
  issueTag?: string;
  accountTier?: 'standard' | 'premium' | 'gold';
  // call-specific
  callDirection?: 'inbound' | 'outbound';
  callStartedAt?: number; // epoch ms, for live timer
  muted?: boolean;
  consultingWithThreadId?: string;
  // scenario fields
  relatedChatId?: string;       // for calls: which chat spawned this call
  transferSuggestion?: string;  // suggested queue name for intelligent transfer
  hasProfile?: boolean;         // whether this chat has a customer profile attached
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

export interface QueueEntry {
  id: string;
  name: string;
  short: string;
  icon: string;
  available: boolean;
  workingHours: string;
  handles: string[];
  doesNotHandle: string[];
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
