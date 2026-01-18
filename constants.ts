
import { Contact, MessageType, StatusUpdate } from './types';

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Gemini AI Assistant',
    avatar: 'https://picsum.photos/seed/gemini/200',
    status: 'online',
    personality: 'A helpful and efficient AI assistant that can generate images, answer complex questions, and chat about anything.'
  },
  {
    id: 'group_1',
    name: 'Tech Enthusiasts',
    avatar: 'https://picsum.photos/seed/techgroup/200',
    status: 'online',
    personality: 'A group of tech lovers. Members: Alex and Sarah.',
    isGroup: true,
    memberIds: ['2', '3']
  },
  {
    id: '2',
    name: 'Alex Rivera',
    avatar: 'https://picsum.photos/seed/alex/200',
    status: 'offline',
    lastSeen: 'last seen today at 10:45 AM',
    personality: 'A creative professional who loves talking about design, tech trends, and coffee.'
  },
  {
    id: '3',
    name: 'Sarah Chen',
    avatar: 'https://picsum.photos/seed/sarah/200',
    status: 'online',
    personality: 'A software engineer who likes solving hard problems and sharing coding tips.'
  }
];

export const INITIAL_MESSAGES = {
  '1': [
    {
      id: 'm1',
      senderId: '1',
      text: "Hello! I'm Gemini. How can I help you today? You can ask me to generate images by saying 'generate image of...'",
      timestamp: Date.now() - 3600000,
      type: MessageType.TEXT,
      status: 'read' as const
    }
  ],
  'group_1': [
    {
      id: 'g1',
      senderId: '2',
      text: "Hey everyone! What's the latest in AI today?",
      timestamp: Date.now() - 7200000,
      type: MessageType.TEXT,
      status: 'read' as const
    }
  ]
};

export const MOCK_STATUSES: StatusUpdate[] = [
  {
    id: 's1',
    contactId: '2',
    imageUrl: 'https://picsum.photos/seed/status1/800/1200',
    caption: 'Loving the new desk setup! 💻',
    timestamp: Date.now() - 1000000,
    isViewed: false
  },
  {
    id: 's2',
    contactId: '3',
    imageUrl: 'https://picsum.photos/seed/status2/800/1200',
    caption: 'Hiking weekend was amazing 🏔️',
    timestamp: Date.now() - 5000000,
    isViewed: false
  }
];
