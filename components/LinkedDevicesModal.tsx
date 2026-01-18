
import React from 'react';
import { X, Laptop, Smartphone, Monitor, Info, ShieldCheck } from 'lucide-react';

interface LinkedDevicesModalProps {
  onClose: () => void;
}

const LinkedDevicesModal: React.FC<LinkedDevicesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="bg-[#008069] p-4 flex items-center gap-6 text-white shrink-0">
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
            <X size={24} />
          </button>
          <h2 className="text-xl font-medium">Linked devices</h2>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="flex flex-col items-center p-8 text-center border-b bg-[#f8f9fa]">
            <div className="w-32 h-32 mb-6 bg-[#00a884]/10 rounded-full flex items-center justify-center text-[#00a884]">
              <Monitor size={64} />
            </div>
            <h3 className="text-2xl font-light text-gray-700 mb-4">Use WhatsApp on other devices</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              Linked devices are kept in sync. Use them to send and receive messages without keeping your phone online.
            </p>
            <button className="bg-[#00a884] hover:bg-[#008f72] text-white px-8 py-2.5 rounded-full font-medium transition-colors shadow-md">
              Link a device
            </button>
          </div>

          <div className="p-6">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Your devices</h4>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <Laptop size={20} />
                </div>
                <div className="flex-1">
                  <h5 className="text-gray-800 font-medium">Mac OS (Chrome)</h5>
                  <p className="text-xs text-gray-500">Last active today at 11:30 AM</p>
                </div>
                <div className="text-xs text-gray-400">Active</div>
              </div>

              <div className="flex items-center gap-4 p-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <Monitor size={20} />
                </div>
                <div className="flex-1">
                  <h5 className="text-gray-800 font-medium">Windows (Edge)</h5>
                  <p className="text-xs text-gray-500">Last active yesterday at 9:15 PM</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-start gap-3 bg-[#f0f2f5] p-4 rounded-lg">
              <ShieldCheck size={20} className="text-gray-500 mt-0.5 shrink-0" />
              <p className="text-[12px] text-gray-600 leading-tight">
                Your personal messages are <span className="text-[#00a884] font-medium">end-to-end encrypted</span> on all your devices.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#f0f2f5] border-t flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-[#00a884] font-medium rounded-full hover:bg-gray-50 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkedDevicesModal;
