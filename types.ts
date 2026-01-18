
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video'
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  type: MessageType;
  status: 'sent' | 'delivered' | 'read';
  imageUrl?: string;
  videoUrl?: string;
  replyToId?: string;
  isStarred?: boolean;
  reactions?: Record<string, string[]>; // emoji -> array of senderIds
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'typing...';
  lastSeen?: string;
  personality: string;
  isGroup?: boolean;
  memberIds?: string[];
  isArchived?: boolean;
}

export interface StatusUpdate {
  id: string;
  contactId: string;
  imageUrl: string;
  caption?: string;
  timestamp: number;
  isViewed?: boolean;
}
