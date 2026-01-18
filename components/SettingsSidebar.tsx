
import React from 'react';
import { ArrowLeft, Bell, Lock, Shield, HelpCircle, Laptop, Image } from 'lucide-react';

interface SettingsSidebarProps {
  isOpen: boolean;
  userProfile: { name: string; about: string; avatar: string };
  onClose: () => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ isOpen, userProfile, onClose }) => {
  const settingsItems = [
    { icon: <Bell size={20} />, title: 'Notifications', subtitle: 'Messages, groups & call tones' },
    { icon: <Lock size={20} />, title: 'Privacy', subtitle: 'Block contacts, disappearing messages' },
    { icon: <Shield size={20} />, title: 'Security', subtitle: 'Security notifications' },
    { icon: <Image size={20} />, title: 'Chat wallpaper', subtitle: 'Set a custom background' },
    { icon: <Laptop size={20} />, title: 'Keyboard shortcuts', subtitle: 'List of shortcuts' },
    { icon: <HelpCircle size={20} />, title: 'Help', subtitle: 'Help center, contact us' },
  ];

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
          <h2 className="text-xl font-medium">Settings</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="flex flex-col bg-white">
          <div className="flex items-center gap-4 p-5 hover:bg-gray-50 cursor-pointer border-b">
            <div className="w-20 h-20 rounded-full overflow-hidden shrink-0">
              <img src={userProfile.avatar} className="w-full h-full object-cover" alt="Me" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium truncate">{userProfile.name}</h3>
              <p className="text-sm text-gray-500 italic truncate">{userProfile.about}</p>
            </div>
          </div>

          <div className="space-y-1 py-2">
            {settingsItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-6 px-6 py-4 hover:bg-gray-50 cursor-pointer group">
                <div className="text-gray-400 shrink-0">{item.icon}</div>
                <div className="flex-1 border-b group-last:border-none pb-4">
                  <h4 className="text-gray-800 font-medium">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;
