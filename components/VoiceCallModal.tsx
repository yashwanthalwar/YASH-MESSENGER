
import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, PhoneOff, User, Volume2 } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Contact } from '../types';
import { decodeBase64Audio, decodeAudioData, encodeAudio } from '../services/geminiService';

interface VoiceCallModalProps {
  contact: Contact;
  onClose: () => void;
}

const VoiceCallModal: React.FC<VoiceCallModalProps> = ({ contact, onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const timerRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    startCall();
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      endCall();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async () => {
    try {
      // Use process.env.API_KEY directly as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('connected');
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encodeAudio(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              // Rely on sessionPromise to send data
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const audioBuffer = await decodeAudioData(
                decodeBase64Audio(base64Audio),
                outputAudioContext,
                24000,
                1
              );
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle interruption
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                try { source.stop(); } catch(e) {}
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error("Live API Error:", e),
          onclose: () => setStatus('ended'),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are on a voice call. You are simulating ${contact.name}. Personality: ${contact.personality}. Keep your verbal responses natural, and friendly. Since it's a voice call, avoid saying long sentences unless necessary.`,
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Call initialization failed:", err);
      setStatus('ended');
    }
  };

  const endCall = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    // Stop any playing audio
    for (const source of sourcesRef.current.values()) {
      try { source.stop(); } catch(e) {}
    }
    sourcesRef.current.clear();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111b21] w-full max-w-md h-[500px] rounded-2xl flex flex-col items-center justify-between p-8 text-white relative">
        <button 
          onClick={endCall}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mt-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 mb-6 animate-pulse">
            <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold">{contact.name}</h2>
          <p className="text-[#00a884] font-medium mt-1">
            {status === 'connecting' ? 'Ringing...' : formatTime(callDuration)}
          </p>
        </div>

        <div className="flex flex-col items-center w-full gap-8">
          <div className="flex items-center justify-center gap-12">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full ${isMuted ? 'bg-white text-black' : 'bg-white/10 text-white'} transition-colors`}
            >
              {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
            </button>
            <button className="p-4 rounded-full bg-white/10 text-white transition-colors">
              <Volume2 size={28} />
            </button>
          </div>
          
          <button 
            onClick={endCall}
            className="w-full py-4 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center gap-3 font-semibold transition-colors"
          >
            <PhoneOff size={24} />
            End Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCallModal;
