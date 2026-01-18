
import React from 'react';
import { ArrowLeft, Archive, MoreVertical, ArchiveRestore } from 'lucide-react';
import { Contact } from '../types';

interface ArchivedSidebarProps {
  isOpen: boolean;
  contacts: Contact[];
  onUnarchive: (id: string) => void;
  onSelectChat: (id: string) => void;
  onClose: () => void;
}

const ArchivedSidebar: React.FC<ArchivedSidebarProps> = ({ isOpen, contacts, onUnarchive, onSelectChat, onClose }) => {
  return (
    <div 
      className={`
        absolute inset-0 z-[60] bg-white transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="bg-[#008069] h-[108px] flex items-end p-5 text-white">
        <div className="flex items-center gap-6 mb-1">
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-medium">Archived</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#f0f2f5]">
            <Archive size={120} className="text-gray-300 mb-6" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No archived chats</h3>
            <p className="text-sm text-gray-400">Archived chats are hidden from your main chat list.</p>
          </div>
        ) : (
          <div className="divide-y">
            {contacts.map(contact => (
              <div 
                key={contact.id}
                onClick={() => onSelectChat(contact.id)}
                className="flex items-center p-3 cursor-pointer hover:bg-gray-100 transition-colors group"
              >
                <img src={contact.avatar} className="w-12 h-12 rounded-full mr-4 object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-800 truncate">{contact.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{contact.status}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onUnarchive(contact.id); }}
                  className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-full text-[#00a884] transition-all"
                  title="Unarchive"
                >
                  <ArchiveRestore size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivedSidebar;
