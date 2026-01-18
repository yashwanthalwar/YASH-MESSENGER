
import React from 'react';
import { ArrowLeft, Star, MessageSquare } from 'lucide-react';
import { Message, Contact } from '../types';

interface StarredSidebarProps {
  isOpen: boolean;
  starredMessages: (Message & { chatId: string })[];
  contacts: Contact[];
  onClose: () => void;
}

const StarredSidebar: React.FC<StarredSidebarProps> = ({ isOpen, starredMessages, contacts, onClose }) => {
  return (
    <div 
      className={`
        absolute inset-0 z-[60] bg-[#f0f2f5] transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="bg-[#008069] h-[108px] flex items-end p-5 text-white">
        <div className="flex items-center gap-6 mb-1">
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-medium">Starred messages</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {starredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-6">
              <Star size={48} fill="currentColor" />
            </div>
            <h3 className="text-lg font-medium text-gray-600">No starred messages</h3>
            <p className="text-sm text-gray-400 mt-2">Tap and hold any message to star it, so you can easily find it later.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {starredMessages.map(msg => {
              const contact = contacts.find(c => c.id === msg.chatId);
              return (
                <div key={msg.id} className="bg-white p-4 border-b hover:bg-gray-50 cursor-pointer">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-[#00a884]">{contact?.name || 'Chat'}</span>
                    <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed truncate">{msg.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StarredSidebar;
