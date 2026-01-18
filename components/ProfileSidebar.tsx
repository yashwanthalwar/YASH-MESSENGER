
import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, Pencil, Check } from 'lucide-react';

interface ProfileSidebarProps {
  isOpen: boolean;
  userProfile: { name: string; about: string; avatar: string };
  onUpdateProfile: (updated: Partial<{ name: string; about: string; avatar: string }>) => void;
  onClose: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ isOpen, userProfile, onUpdateProfile, onClose }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);
  const [tempAbout, setTempAbout] = useState(userProfile.about);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfile({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveName = () => {
    onUpdateProfile({ name: tempName });
    setIsEditingName(false);
  };

  const saveAbout = () => {
    onUpdateProfile({ about: tempAbout });
    setIsEditingAbout(false);
  };

  return (
    <div 
      className={`
        absolute inset-0 z-[60] bg-[#f0f2f5] transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange} 
      />

      {/* Header */}
      <div className="bg-[#008069] h-[108px] flex items-end p-5 text-white">
        <div className="flex items-center gap-6 mb-1">
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-medium">Profile</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center py-8 bg-white md:bg-transparent">
          <div className="relative group cursor-pointer mb-8" onClick={handleAvatarClick}>
            <div className="w-52 h-52 rounded-full overflow-hidden border-4 border-white shadow-md">
              <img src={userProfile.avatar} className="w-full h-full object-cover" alt="Profile" />
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-center p-4">
              <Camera size={32} className="mb-2" />
              <span className="text-xs font-bold uppercase">Change Profile Photo</span>
            </div>
          </div>

          <div className="w-full px-8 space-y-8">
            {/* Name Section */}
            <div className="bg-white p-4 shadow-sm rounded-lg md:shadow-none md:rounded-none">
              <p className="text-[#008069] text-sm mb-4 font-medium">Your name</p>
              <div className="flex items-center justify-between gap-4">
                {isEditingName ? (
                  <input 
                    type="text" 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="flex-1 border-b-2 border-[#00a884] outline-none py-1 text-gray-800"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                  />
                ) : (
                  <span className="flex-1 text-gray-800 text-lg">{userProfile.name}</span>
                )}
                <button 
                  onClick={() => isEditingName ? saveName() : setIsEditingName(true)}
                  className="text-gray-500 hover:text-[#00a884] transition-colors"
                >
                  {isEditingName ? <Check size={20} className="text-[#00a884]" /> : <Pencil size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-6 leading-relaxed">
                This is not your username or pin. This name will be visible to your WhatsApp contacts.
              </p>
            </div>

            {/* About Section */}
            <div className="bg-white p-4 shadow-sm rounded-lg md:shadow-none md:rounded-none">
              <p className="text-[#008069] text-sm mb-4 font-medium">About</p>
              <div className="flex items-center justify-between gap-4">
                {isEditingAbout ? (
                  <input 
                    type="text" 
                    value={tempAbout}
                    onChange={(e) => setTempAbout(e.target.value)}
                    className="flex-1 border-b-2 border-[#00a884] outline-none py-1 text-gray-800"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveAbout()}
                  />
                ) : (
                  <span className="flex-1 text-gray-800 text-lg">{userProfile.about}</span>
                )}
                <button 
                  onClick={() => isEditingAbout ? saveAbout() : setIsEditingAbout(true)}
                  className="text-gray-500 hover:text-[#00a884] transition-colors"
                >
                  {isEditingAbout ? <Check size={20} className="text-[#00a884]" /> : <Pencil size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
