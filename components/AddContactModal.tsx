
import React, { useState } from 'react';
import { X, User, Shield, Info } from 'lucide-react';
import { Contact } from '../types';

interface AddContactModalProps {
  onClose: () => void;
  onAdd: (contact: Contact) => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [personality, setPersonality] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !personality) return;

    const newContact: Contact = {
      id: Date.now().toString(),
      name,
      avatar: avatar || `https://picsum.photos/seed/${name}/200`,
      status: 'online',
      personality,
    };

    onAdd(newContact);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-[#00a884] p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <User size={20} />
            <h2 className="text-lg font-semibold">New Contact</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Elon Musk"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#00a884] focus:border-[#00a884] outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL (Optional)</label>
            <input 
              type="url" 
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#00a884] focus:border-[#00a884] outline-none transition-all"
            />
            <p className="text-[10px] text-gray-500 mt-1">Leave blank for a random profile picture.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">AI Personality</label>
            <textarea 
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="e.g. A visionary tech entrepreneur who is obsessed with Mars and always makes jokes about dogecoin."
              className="w-full border border-gray-300 rounded-md px-4 py-2 h-24 focus:ring-2 focus:ring-[#00a884] focus:border-[#00a884] outline-none transition-all resize-none"
              required
            />
            <div className="flex items-start gap-2 mt-2 bg-blue-50 p-2 rounded text-blue-700">
              <Info size={16} className="mt-0.5 shrink-0" />
              <p className="text-[11px]">This description defines how the Gemini AI will behave when chatting as this contact.</p>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-[#00a884] hover:bg-[#008f72] text-white font-medium rounded-md shadow-md transition-colors"
            >
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal;
