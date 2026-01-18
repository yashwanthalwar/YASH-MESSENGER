
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  MessageSquare, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  Mic, 
  Send,
  ArrowLeft,
  UserPlus,
  CircleDashed,
  Reply,
  X,
  Plus,
  Settings,
  LogOut,
  Star,
  Archive,
  Camera,
  Play
} from 'lucide-react';
import { Contact, Message, MessageType, StatusUpdate } from './types';
import { INITIAL_CONTACTS, INITIAL_MESSAGES, MOCK_STATUSES } from './constants';
import { generateResponse, generateImageMessage } from './services/geminiService';
import VoiceCallModal from './components/VoiceCallModal';
import AddContactModal from './components/AddContactModal';
import LinkedDevicesModal from './components/LinkedDevicesModal';
import StatusViewer from './components/StatusViewer';
import NewGroupModal from './components/NewGroupModal';
import AddStatusModal from './components/AddStatusModal';
import ProfileSidebar from './components/ProfileSidebar';
import SettingsSidebar from './components/SettingsSidebar';
import ArchivedSidebar from './components/ArchivedSidebar';
import StarredSidebar from './components/StarredSidebar';
import VideoRecorderModal from './components/VideoRecorderModal';

type NavTab = 'chats' | 'status';
type SecondaryView = 'profile' | 'settings' | 'archived' | 'starred' | null;

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const App: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [statuses, setStatuses] = useState<StatusUpdate[]>(MOCK_STATUSES);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<NavTab>('chats');
  const [secondaryView, setSecondaryView] = useState<SecondaryView>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isLinkedDevicesOpen, setIsLinkedDevicesOpen] = useState(false);
  const [isSidebarMenuOpen, setIsSidebarMenuOpen] = useState(false);
  const [isRailMenuOpen, setIsRailMenuOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusUpdate[] | null>(null);
  const [pendingStatusImage, setPendingStatusImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);
  const [isVideoRecorderOpen, setIsVideoRecorderOpen] = useState(false);

  // User Profile State
  const [userProfile, setUserProfile] = useState({
    name: 'Yash',
    about: 'At work',
    avatar: 'https://picsum.photos/seed/me/200'
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sidebarMenuRef = useRef<HTMLDivElement>(null);
  const railMenuRef = useRef<HTMLDivElement>(null);
  const statusInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const activeContact = contacts.find(c => c.id === activeContactId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarMenuRef.current && !sidebarMenuRef.current.contains(event.target as Node)) {
        setIsSidebarMenuOpen(false);
      }
      if (railMenuRef.current && !railMenuRef.current.contains(event.target as Node)) {
        setIsRailMenuOpen(false);
      }
      if (activeReactionPickerId) {
        setActiveReactionPickerId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeReactionPickerId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeContactId, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent, mediaType: MessageType = MessageType.TEXT, mediaUrl?: string) => {
    e?.preventDefault();
    if ((!inputValue.trim() && !mediaUrl) || !activeContactId || !activeContact) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      text: mediaType === MessageType.TEXT ? inputValue : '',
      timestamp: Date.now(),
      type: mediaType,
      status: 'sent',
      imageUrl: mediaType === MessageType.IMAGE ? mediaUrl : undefined,
      videoUrl: mediaType === MessageType.VIDEO ? mediaUrl : undefined,
      replyToId: replyingTo?.id
    };

    const currentChatId = activeContactId;
    setMessages(prev => ({
      ...prev,
      [currentChatId]: [...(prev[currentChatId] || []), userMsg]
    }));
    const userText = inputValue;
    setInputValue('');
    setReplyingTo(null);

    setIsTyping(true);
    try {
      let aiResponseText = '';
      let aiImageUrl = '';
      let msgType = MessageType.TEXT;

      if (mediaType === MessageType.TEXT && (userText.toLowerCase().includes('generate image') || userText.toLowerCase().includes('show me a'))) {
        const url = await generateImageMessage(userText);
        if (url) {
          aiImageUrl = url;
          msgType = MessageType.IMAGE;
          aiResponseText = "Here is the image you requested!";
        } else {
          aiResponseText = "I couldn't generate that image right now.";
        }
      } else {
        const context = mediaType !== MessageType.TEXT ? `The user sent a ${mediaType}.` : "";
        aiResponseText = await generateResponse(`${context} ${userText}`, [], activeContact.personality);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        senderId: activeContact.isGroup ? (activeContact.memberIds?.[0] || '1') : currentChatId,
        text: aiResponseText,
        imageUrl: aiImageUrl,
        timestamp: Date.now(),
        type: msgType,
        status: 'read'
      };

      setMessages(prev => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || []), aiMsg]
      }));
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const selectContact = (id: string) => {
    setActiveContactId(id);
    setIsMobileMenuOpen(false);
  };

  const toggleStarMessage = (chatId: string, messageId: string) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: prev[chatId].map(m => m.id === messageId ? { ...m, isStarred: !m.isStarred } : m)
    }));
  };

  const toggleReaction = (chatId: string, messageId: string, emoji: string) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: prev[chatId].map(m => {
        if (m.id !== messageId) return m;
        const currentReactions = { ...(m.reactions || {}) };
        const users = [...(currentReactions[emoji] || [])];
        
        if (users.includes('user')) {
          const filtered = users.filter(u => u !== 'user');
          if (filtered.length === 0) {
            delete currentReactions[emoji];
          } else {
            currentReactions[emoji] = filtered;
          }
        } else {
          currentReactions[emoji] = [...users, 'user'];
        }
        
        return { ...m, reactions: currentReactions };
      })
    }));
    setActiveReactionPickerId(null);
  };

  const toggleArchiveContact = (id: string) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, isArchived: !c.isArchived } : c));
    if (activeContactId === id) setActiveContactId(null);
  };

  const handleLogout = () => {
    window.location.reload();
  };

  const handleAddContact = (newContact: Contact) => {
    setContacts(prev => [newContact, ...prev]);
    setActiveContactId(newContact.id);
    setIsMobileMenuOpen(false);
    setIsAddContactModalOpen(false);
  };

  const handleCreateGroup = (name: string, members: string[]) => {
    const newGroup: Contact = {
      id: `group_${Date.now()}`,
      name,
      avatar: `https://picsum.photos/seed/${name}/200`,
      status: 'online',
      personality: `A group chat with ${members.length} members.`,
      isGroup: true,
      memberIds: members
    };
    setContacts(prev => [newGroup, ...prev]);
    setActiveContactId(newGroup.id);
    setIsMobileMenuOpen(false);
    setIsNewGroupModalOpen(false);
  };

  const handleStatusUploadClick = () => {
    statusInputRef.current?.click();
  };

  const handleVideoUploadClick = () => {
    videoInputRef.current?.click();
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSendMessage(undefined, MessageType.VIDEO, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatusFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingStatusImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostStatus = (caption: string) => {
    if (pendingStatusImage) {
      const newStatus: StatusUpdate = {
        id: `s_user_${Date.now()}`,
        contactId: 'user',
        imageUrl: pendingStatusImage,
        caption,
        timestamp: Date.now(),
        isViewed: false
      };
      setStatuses(prev => [newStatus, ...prev]);
      setPendingStatusImage(null);
      setSelectedStatus([newStatus]);
    }
  };

  const handleVideoRecorded = (videoBlob: Blob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleSendMessage(undefined, MessageType.VIDEO, reader.result as string);
    };
    reader.readAsDataURL(videoBlob);
    setIsVideoRecorderOpen(false);
  };

  const openStatusViewer = (statusList: StatusUpdate[]) => {
    setSelectedStatus(statusList);
    // Mark these as viewed in state
    setStatuses(prev => prev.map(s => statusList.some(v => v.id === s.id) ? { ...s, isViewed: true } : s));
  };

  const filteredContacts = contacts.filter(c => 
    !c.isArchived && c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const archivedContacts = contacts.filter(c => c.isArchived);
  
  const starredMessages = Object.entries(messages).flatMap(([chatId, msgs]) => 
    msgs.filter(m => m.isStarred).map(m => ({ ...m, chatId }))
  );

  const otherStatuses = statuses.filter(s => s.contactId !== 'user');
  const recentStatuses = otherStatuses.filter(s => !s.isViewed);
  const viewedStatuses = otherStatuses.filter(s => s.isViewed);

  return (
    <div className="flex h-full w-full bg-[#f0f2f5] md:p-4 overflow-hidden relative">
      {/* Hidden File Inputs */}
      <input type="file" accept="image/*" capture="environment" ref={statusInputRef} onChange={handleStatusFileChange} className="hidden" />
      <input type="file" accept="video/*" ref={videoInputRef} onChange={handleVideoFileChange} className="hidden" />

      {/* App Navigation Rail (Leftmost) */}
      <div className="hidden md:flex flex-col w-16 bg-[#f0f2f5] border-r items-center py-4 gap-4 shrink-0">
        <button onClick={() => { setActiveTab('chats'); setSecondaryView(null); }} className={`p-2 rounded-xl transition-colors ${activeTab === 'chats' && !secondaryView ? 'bg-white text-[#00a884]' : 'text-gray-500 hover:bg-gray-200'}`}>
          <MessageSquare size={24} />
        </button>
        <button onClick={() => { setActiveTab('status'); setSecondaryView(null); }} className={`p-2 rounded-xl transition-colors ${activeTab === 'status' ? 'bg-white text-[#00a884]' : 'text-gray-500 hover:bg-gray-200'}`}>
          <CircleDashed size={24} />
        </button>
        <div className="mt-auto flex flex-col items-center gap-4 relative">
          <div ref={railMenuRef} className="relative">
            <MoreVertical 
              size={20} 
              className={`cursor-pointer hover:bg-gray-200 rounded-full transition-colors ${isRailMenuOpen ? 'text-[#00a884] bg-gray-200' : 'text-gray-500'}`}
              onClick={() => setIsRailMenuOpen(!isRailMenuOpen)}
            />
            {isRailMenuOpen && (
              <div className="absolute left-10 bottom-0 w-52 bg-white shadow-xl border rounded-lg py-2 z-50 animate-in fade-in slide-in-from-left-2 duration-200">
                <button onClick={() => { setSecondaryView('settings'); setIsRailMenuOpen(false); }} className="w-full text-left px-6 py-3 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-3"><Settings size={18}/> Settings</button>
                <button onClick={() => { setSecondaryView('starred'); setIsRailMenuOpen(false); }} className="w-full text-left px-6 py-3 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-3"><Star size={18}/> Starred messages</button>
                <button onClick={() => { setSecondaryView('archived'); setIsRailMenuOpen(false); }} className="w-full text-left px-6 py-3 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-3"><Archive size={18}/> Archived chats</button>
                <div className="border-t my-1"></div>
                <button onClick={() => setShowLogoutConfirm(true)} className="w-full text-left px-6 py-3 hover:bg-gray-100 text-sm text-red-600 flex items-center gap-3 font-medium"><LogOut size={18}/> Log out</button>
              </div>
            )}
          </div>
          <div 
            className={`w-8 h-8 rounded-full bg-gray-300 overflow-hidden cursor-pointer hover:ring-2 ring-[#00a884] transition-all ${secondaryView === 'profile' ? 'ring-2' : ''}`}
            onClick={() => setSecondaryView('profile')}
          >
            <img src={userProfile.avatar} alt="Me" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Sidebar List (Chats/Status/etc) */}
      <div className={`
        ${isMobileMenuOpen ? 'flex' : 'hidden md:flex'} 
        flex-col w-full md:w-[400px] bg-white border-r border-gray-200 h-full relative overflow-hidden
      `}>
        {/* Secondary Views */}
        <ProfileSidebar isOpen={secondaryView === 'profile'} userProfile={userProfile} onUpdateProfile={(updated) => setUserProfile({ ...userProfile, ...updated })} onClose={() => setSecondaryView(null)} />
        <SettingsSidebar isOpen={secondaryView === 'settings'} userProfile={userProfile} onClose={() => setSecondaryView(null)} />
        <ArchivedSidebar isOpen={secondaryView === 'archived'} contacts={archivedContacts} onUnarchive={toggleArchiveContact} onSelectChat={(id) => { selectContact(id); setSecondaryView(null); }} onClose={() => setSecondaryView(null)} />
        <StarredSidebar isOpen={secondaryView === 'starred'} starredMessages={starredMessages} contacts={contacts} onClose={() => setSecondaryView(null)} />

        {/* Mobile Tab bar */}
        <div className="md:hidden flex bg-white border-b justify-around items-center p-2 text-gray-500">
          <button onClick={() => setActiveTab('chats')} className={activeTab === 'chats' ? 'text-[#00a884]' : ''}><MessageSquare size={22}/></button>
          <button onClick={() => setActiveTab('status')} className={activeTab === 'status' ? 'text-[#00a884]' : ''}><CircleDashed size={22}/></button>
        </div>

        {/* List Header */}
        <div className="bg-[#f0f2f5] p-4 flex items-center justify-between border-b relative">
          <h2 className="text-xl font-bold text-gray-800 capitalize">{activeTab}</h2>
          <div className="flex gap-4 text-gray-500 items-center">
            {activeTab === 'chats' && (
              <>
                <span title="Add Contact" className="cursor-pointer hover:text-[#00a884]" onClick={() => setIsAddContactModalOpen(true)}>
                  <UserPlus size={20} />
                </span>
                <div className="relative" ref={sidebarMenuRef}>
                  <MoreVertical 
                    size={20} 
                    className={`cursor-pointer hover:bg-gray-200 rounded-full ${isSidebarMenuOpen ? 'text-[#00a884] bg-gray-200' : ''}`}
                    onClick={() => setIsSidebarMenuOpen(!isSidebarMenuOpen)}
                  />
                  {isSidebarMenuOpen && (
                    <div className="absolute right-0 top-10 w-52 bg-white shadow-xl border rounded py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <button className="w-full text-left px-6 py-3 hover:bg-gray-100 text-sm text-gray-700" onClick={() => { setIsSidebarMenuOpen(false); setIsNewGroupModalOpen(true); }}>New group</button>
                      <button className="w-full text-left px-6 py-3 hover:bg-gray-100 text-sm text-gray-700" onClick={() => { setIsSidebarMenuOpen(false); setIsLinkedDevicesOpen(true); }}>Linked devices</button>
                      <button className="w-full text-left px-6 py-3 hover:bg-gray-100 text-sm text-gray-700" onClick={() => { setIsSidebarMenuOpen(false); setSecondaryView('profile'); }}>Profile</button>
                      <button className="w-full text-left px-6 py-3 hover:bg-gray-100 text-sm text-gray-700" onClick={() => { setIsSidebarMenuOpen(false); setSecondaryView('starred'); }}>Starred messages</button>
                      <button className="w-full text-left px-6 py-3 hover:bg-gray-100 text-sm text-gray-700" onClick={() => { setIsSidebarMenuOpen(false); setSecondaryView('settings'); }}>Settings</button>
                    </div>
                  )}
                </div>
              </>
            )}
            {activeTab === 'status' && (
              <button onClick={handleStatusUploadClick} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <Plus size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="p-2">
          <div className="relative flex items-center bg-[#f0f2f5] rounded-lg px-4 py-2">
            <Search size={18} className="text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm w-full"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {activeTab === 'chats' && filteredContacts.map(contact => {
            const lastMsg = messages[contact.id]?.[messages[contact.id].length - 1];
            return (
              <div 
                key={contact.id}
                onClick={() => selectContact(contact.id)}
                className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-50 group ${activeContactId === contact.id ? 'bg-gray-100' : ''}`}
              >
                <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full mr-4 object-cover border border-gray-100" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-800 truncate">{contact.name}</h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 truncate flex-1">
                      {contact.status === 'typing...' ? <span className="text-[#00a884]">typing...</span> : (lastMsg?.text || (lastMsg?.type === MessageType.VIDEO ? '🎥 Video message' : 'No messages yet'))}
                    </p>
                    <button onClick={(e) => { e.stopPropagation(); toggleArchiveContact(contact.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-full text-gray-400 transition-all ml-2" title="Archive chat"><Archive size={16} /></button>
                  </div>
                </div>
              </div>
            );
          })}

          {activeTab === 'status' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4 cursor-pointer" onClick={handleStatusUploadClick}>
                <div className="relative">
                  <img src={userProfile.avatar} className="w-14 h-14 rounded-full border-2 border-gray-200 p-0.5" />
                  <div className="absolute bottom-0 right-0 bg-[#00a884] text-white rounded-full p-0.5 border-2 border-white"><Plus size={14}/></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">My Status</h4>
                  <p className="text-xs text-gray-500">Tap to add status update</p>
                </div>
              </div>

              {statuses.filter(s => s.contactId === 'user').length > 0 && (
                <>
                  <p className="text-xs font-bold text-gray-400 uppercase pt-4">Your updates</p>
                  <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg" onClick={() => openStatusViewer(statuses.filter(s => s.contactId === 'user'))}>
                    <div className="w-14 h-14 rounded-full border-2 border-[#00a884] p-0.5">
                      <img src={userProfile.avatar} className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">My Status</h4>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                  </div>
                </>
              )}

              {recentStatuses.length > 0 && (
                <>
                  <p className="text-xs font-bold text-gray-400 uppercase pt-4">Recent updates</p>
                  {recentStatuses.map(status => {
                    const contact = contacts.find(c => c.id === status.contactId);
                    return (
                      <div 
                        key={status.id} 
                        className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                        onClick={() => openStatusViewer([status])}
                      >
                        <div className="w-14 h-14 rounded-full border-2 border-[#00a884] p-0.5">
                          <img src={contact?.avatar} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{contact?.name}</h4>
                          <p className="text-xs text-gray-500">{new Date(status.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {viewedStatuses.length > 0 && (
                <>
                  <p className="text-xs font-bold text-gray-400 uppercase pt-4">Viewed updates</p>
                  {viewedStatuses.map(status => {
                    const contact = contacts.find(c => c.id === status.contactId);
                    return (
                      <div 
                        key={status.id} 
                        className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg opacity-80"
                        onClick={() => openStatusViewer([status])}
                      >
                        <div className="w-14 h-14 rounded-full border-2 border-gray-300 p-0.5">
                          <img src={contact?.avatar} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{contact?.name}</h4>
                          <p className="text-xs text-gray-500">{new Date(status.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`
        ${!isMobileMenuOpen ? 'flex' : 'hidden md:flex'} 
        flex-col flex-1 h-full bg-[#efeae2] relative whatsapp-bg
      `}>
        {activeContact ? (
          <>
            <div className="bg-[#f0f2f5] p-3 flex items-center justify-between border-b shadow-sm z-10">
              <div className="flex items-center">
                <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden mr-2 p-1 hover:bg-gray-200 rounded-full"><ArrowLeft size={20} /></button>
                <img src={activeContact.avatar} alt={activeContact.name} className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-200" />
                <div className="cursor-pointer">
                  <h3 className="font-semibold text-gray-800 leading-tight">{activeContact.name}</h3>
                  <p className="text-xs text-gray-500">{isTyping ? 'typing...' : (activeContact.status === 'online' ? 'online' : activeContact.lastSeen)}</p>
                </div>
              </div>
              <div className="flex gap-6 text-gray-500 mr-2 items-center">
                <button onClick={() => setIsCallModalOpen(true)} className="hover:bg-gray-200 p-2 rounded-full transition-colors"><Video size={20} /></button>
                <button onClick={() => setIsCallModalOpen(true)} className="hover:bg-gray-200 p-2 rounded-full transition-colors"><Phone size={20} /></button>
                <div className="relative"><MoreVertical size={20} className="cursor-pointer hover:bg-gray-200 rounded-full p-1 box-content" /></div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:px-12 space-y-4 flex flex-col">
              {(messages[activeContact.id] || []).map((msg, idx) => {
                const isMe = msg.senderId === 'user';
                const sender = isMe ? 'You' : (contacts.find(c => c.id === msg.senderId)?.name || 'AI');
                const replyToMsg = msg.replyToId ? messages[activeContact.id]?.find(m => m.id === msg.replyToId) : null;
                const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0;

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} relative`}>
                    <div className={`
                      max-w-[85%] md:max-w-[65%] px-3 py-1.5 rounded-lg shadow-sm relative group cursor-pointer
                      ${isMe ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}
                    `}
                    onDoubleClick={() => setReplyingTo(msg)}
                    >
                      {activeReactionPickerId === msg.id && (
                        <div className={`absolute -top-12 ${isMe ? 'right-0' : 'left-0'} bg-white shadow-xl border rounded-full px-2 py-1 flex gap-2 z-50 animate-in fade-in zoom-in duration-150`} onMouseDown={e => e.stopPropagation()}>
                          {REACTION_EMOJIS.map(emoji => (
                            <button key={emoji} onClick={() => toggleReaction(activeContact.id, msg.id, emoji)} className="text-xl hover:scale-125 transition-transform p-1">{emoji}</button>
                          ))}
                        </div>
                      )}

                      {activeContact.isGroup && !isMe && (
                        <span className="text-xs font-bold text-[#00a884] block mb-1">{sender}</span>
                      )}

                      {replyToMsg && (
                        <div className="mb-2 bg-black/5 rounded-md border-l-4 border-[#00a884] p-2 text-xs truncate">
                          <span className="font-bold text-[#00a884]">{replyToMsg.senderId === 'user' ? 'You' : (contacts.find(c => c.id === replyToMsg.senderId)?.name || 'AI')}</span>
                          <p className="text-gray-600 italic">{replyToMsg.text}</p>
                        </div>
                      )}

                      {msg.type === MessageType.IMAGE && msg.imageUrl && (
                        <img src={msg.imageUrl} alt="Shared content" className="rounded-md mb-2 max-w-full h-auto" />
                      )}

                      {msg.type === MessageType.VIDEO && msg.videoUrl && (
                        <div className="relative rounded-lg overflow-hidden bg-black aspect-video min-w-[200px] mb-2">
                           <video src={msg.videoUrl} controls className="w-full h-full" />
                        </div>
                      )}
                      
                      {msg.text && (
                        <p className="text-[14.5px] text-gray-800 pr-12 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      )}
                      
                      <div className="flex items-center justify-end mt-1 absolute bottom-1 right-2 gap-1">
                        {msg.isStarred && <Star size={10} className="text-gray-400 fill-gray-400" />}
                        <span className="text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <span className={`text-[10px] ${msg.status === 'read' ? 'text-blue-500' : 'text-gray-400'}`}>{msg.status === 'read' ? '✓✓' : '✓'}</span>}
                      </div>
                      
                      {hasReactions && (
                        <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} bg-white rounded-full px-1.5 py-0.5 shadow-sm border flex items-center gap-0.5 text-[12px] z-10`}>
                          {Object.entries(msg.reactions!).map(([emoji, users]) => <span key={emoji} title={`${users.length} reaction(s)`}>{emoji}</span>)}
                          {Object.values(msg.reactions!).flat().length > 1 && <span className="text-[10px] text-gray-500 font-medium ml-0.5">{Object.values(msg.reactions!).flat().length}</span>}
                        </div>
                      )}
                      
                      <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setReplyingTo(msg)} className="p-1.5 bg-white rounded-full shadow-md text-gray-500 hover:text-[#00a884]"><Reply size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setActiveReactionPickerId(activeReactionPickerId === msg.id ? null : msg.id); }} className="p-1.5 bg-white rounded-full shadow-md text-gray-500 hover:text-[#00a884]"><Smile size={14} /></button>
                        <button onClick={() => toggleStarMessage(activeContact.id, msg.id)} className={`p-1.5 bg-white rounded-full shadow-md ${msg.isStarred ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}><Star size={14} fill={msg.isStarred ? "currentColor" : "none"} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white px-3 py-2 rounded-lg shadow-sm rounded-tl-none flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#f0f2f5] p-2 sticky bottom-0 flex flex-col">
              {replyingTo && (
                <div className="mx-2 mb-2 bg-white rounded-lg p-3 flex justify-between items-center border-l-4 border-[#00a884] animate-in slide-in-from-bottom duration-200">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-[#00a884]">{replyingTo.senderId === 'user' ? 'You' : 'AI'}</span>
                    <p className="text-sm text-gray-500 truncate">{replyingTo.text}</p>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={16} /></button>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 md:gap-4 px-2">
                <div className="flex gap-2 md:gap-4 text-gray-500">
                  <Smile size={24} className="cursor-pointer hover:text-gray-700" />
                  <div className="relative group">
                    <Paperclip size={24} className="cursor-pointer hover:text-gray-700" />
                    <div className="absolute bottom-10 left-0 hidden group-hover:flex flex-col bg-white shadow-xl border rounded-lg overflow-hidden z-20">
                       <button type="button" onClick={handleVideoUploadClick} className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap"><Video size={16}/> Upload Video</button>
                    </div>
                  </div>
                  <Video size={24} className="cursor-pointer hover:text-gray-700" onClick={() => setIsVideoRecorderOpen(true)} />
                </div>
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type a message" className="flex-1 bg-white rounded-lg px-4 py-2.5 focus:outline-none text-sm md:text-base shadow-sm" />
                <div className="flex items-center pr-2">
                  {inputValue.trim() ? (
                    <button type="submit" className="p-2 text-[#00a884] hover:bg-gray-200 rounded-full transition-colors"><Send size={24} /></button>
                  ) : (
                    <button type="button" className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"><Mic size={24} /></button>
                  )}
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f9fa] border-b-[6px] border-[#25d366]">
            <div className="mb-8 opacity-40"><MessageSquare size={120} className="text-gray-400" /></div>
            <h2 className="text-3xl font-light text-gray-600 mb-2 font-['Inter'] tracking-tight">Yash Messenger</h2>
            <p className="text-gray-500 text-center max-w-md px-4 leading-relaxed font-light">Send and receive messages with AI-powered features. <br/> Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
          </div>
        )}
      </div>

      {isCallModalOpen && activeContact && <VoiceCallModal contact={activeContact} onClose={() => setIsCallModalOpen(false)} />}
      {isAddContactModalOpen && <AddContactModal onClose={() => setIsAddContactModalOpen(false)} onAdd={handleAddContact} />}
      {isLinkedDevicesOpen && <LinkedDevicesModal onClose={() => setIsLinkedDevicesOpen(false)} />}
      {isNewGroupModalOpen && <NewGroupModal contacts={contacts.filter(c => !c.isGroup)} onClose={() => setIsNewGroupModalOpen(false)} onCreate={handleCreateGroup} />}
      {selectedStatus && <StatusViewer statuses={selectedStatus} onClose={() => setSelectedStatus(null)} />}
      {pendingStatusImage && <AddStatusModal image={pendingStatusImage} onClose={() => setPendingStatusImage(null)} onPost={handlePostStatus} />}
      {isVideoRecorderOpen && <VideoRecorderModal onClose={() => setIsVideoRecorderOpen(false)} onRecorded={handleVideoRecorded} />}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Log out?</h3>
            <p className="text-gray-600 mb-6 text-sm">Are you sure you want to log out from Yash Messenger?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="px-6 py-2 border rounded-full text-[#00a884] font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleLogout} className="px-6 py-2 bg-[#00a884] text-white rounded-full font-medium shadow-md">Log out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
