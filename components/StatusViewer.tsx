
import React, { useState, useEffect } from 'react';
import { X, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusUpdate, Contact } from '../types';
import { INITIAL_CONTACTS } from '../constants';

interface StatusViewerProps {
  statuses: StatusUpdate[];
  onClose: () => void;
}

const StatusViewer: React.FC<StatusViewerProps> = ({ statuses, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const currentStatus = statuses[currentIndex];
  const contact = INITIAL_CONTACTS.find(c => c.id === currentStatus?.contactId) || {
    name: 'You',
    avatar: 'https://picsum.photos/seed/me/200'
  };

  useEffect(() => {
    setProgress(0);
    const duration = 5000; // 5 seconds per status
    const interval = 50; // Update progress every 50ms
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!currentStatus) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black flex items-center justify-center animate-in fade-in duration-300">
      {/* Progress Bars */}
      <div className="absolute top-4 left-0 right-0 flex gap-1 px-4 z-30">
        {statuses.map((_, idx) => (
          <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-75"
              style={{ 
                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-0 right-0 px-6 py-2 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <img src={contact.avatar} className="w-10 h-10 rounded-full border border-white/20" alt="" />
          <div>
            <h3 className="text-white font-semibold leading-tight">{contact.name}</h3>
            <p className="text-white/60 text-xs">{new Date(currentStatus.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white">
          <MoreVertical size={20} className="cursor-pointer" />
          <button onClick={onClose}><X size={24} /></button>
        </div>
      </div>

      {/* Main Image */}
      <div className="w-full h-full flex items-center justify-center relative bg-[#111b21]">
        <img 
          src={currentStatus.imageUrl} 
          className="max-w-full max-h-screen object-contain" 
          alt="Status"
        />
        
        {/* Navigation Areas */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={handlePrev} />
        <div className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer" onClick={handleNext} />
      </div>

      {/* Caption */}
      {currentStatus.caption && (
        <div className="absolute bottom-12 left-0 right-0 px-8 py-4 text-center z-30">
          <p className="text-white text-lg bg-black/40 backdrop-blur-sm inline-block px-4 py-2 rounded-xl">
            {currentStatus.caption}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatusViewer;
