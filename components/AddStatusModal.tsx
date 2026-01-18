
import React, { useState } from 'react';
import { X, Send, Smile, Paperclip } from 'lucide-react';

interface AddStatusModalProps {
  image: string;
  onClose: () => void;
  onPost: (caption: string) => void;
}

const AddStatusModal: React.FC<AddStatusModalProps> = ({ image, onClose, onPost }) => {
  const [caption, setCaption] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPost(caption);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="absolute top-4 left-4 z-20 flex items-center gap-4">
        <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#111b21]">
        <img src={image} className="max-w-full max-h-[85vh] object-contain shadow-2xl" alt="Preview" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center gap-4">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl flex items-center gap-4 bg-white/10 backdrop-blur-md p-2 rounded-full px-4 border border-white/20">
          <button type="button" className="text-white/60 hover:text-white">
            <Smile size={24} />
          </button>
          <input 
            type="text" 
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-white/40 text-lg"
            autoFocus
          />
          <button 
            type="submit" 
            className="bg-[#00a884] p-3 rounded-full text-white shadow-lg hover:bg-[#008f72] transition-colors"
          >
            <Send size={24} />
          </button>
        </form>
        
        <div className="flex gap-4 text-white/40 text-xs font-medium pb-4">
          <span>Status (Contacts)</span>
        </div>
      </div>
    </div>
  );
};

export default AddStatusModal;
