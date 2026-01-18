
import React, { useState } from 'react';
import { X, Check, Users } from 'lucide-react';
import { Contact } from '../types';

interface NewGroupModalProps {
  contacts: Contact[];
  onClose: () => void;
  onCreate: (name: string, members: string[]) => void;
}

const NewGroupModal: React.FC<NewGroupModalProps> = ({ contacts, onClose, onCreate }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleMember = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    if (groupName && selectedIds.length > 0) {
      onCreate(groupName, selectedIds);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden flex flex-col h-[600px]">
        <div className="bg-[#008069] p-4 flex items-center gap-4 text-white">
          <button onClick={onClose}><X size={24}/></button>
          <h2 className="text-lg font-semibold">New Group</h2>
        </div>

        <div className="p-4 border-b">
          <input 
            type="text" 
            placeholder="Group name" 
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full border-b-2 border-transparent focus:border-[#00a884] outline-none py-2 text-lg"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <p className="p-4 text-xs font-bold text-gray-400 uppercase">Select members</p>
          {contacts.map(contact => (
            <div 
              key={contact.id} 
              onClick={() => toggleMember(contact.id)}
              className="flex items-center gap-4 p-3 hover:bg-gray-100 cursor-pointer"
            >
              <div className="relative">
                <img src={contact.avatar} className="w-10 h-10 rounded-full object-cover" />
                {selectedIds.includes(contact.id) && (
                  <div className="absolute -bottom-1 -right-1 bg-[#00a884] text-white rounded-full p-0.5 border-2 border-white">
                    <Check size={10}/>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{contact.name}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gray-50 flex justify-end">
          <button 
            onClick={handleCreate}
            disabled={!groupName || selectedIds.length === 0}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-colors ${
              groupName && selectedIds.length > 0 ? 'bg-[#00a884] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Users size={18}/> Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewGroupModal;
