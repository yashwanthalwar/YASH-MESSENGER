
import React, { useState, useRef, useEffect } from 'react';
import { X, Video, Square, Send, RefreshCw } from 'lucide-react';

interface VideoRecorderModalProps {
  onClose: () => void;
  onRecorded: (blob: Blob) => void;
}

const VideoRecorderModal: React.FC<VideoRecorderModalProps> = ({ onClose, onRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      onClose();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;
    
    const stream = videoRef.current.srcObject as MediaStream;
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm';
    }
    
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSend = () => {
    if (recordedBlob) {
      onRecorded(recordedBlob);
    }
  };

  const handleReset = () => {
    setRecordedBlob(null);
    setPreviewUrl(null);
    setRecordingTime(0);
    startCamera();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">
      <div className="bg-[#111b21] w-full max-w-md rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full z-10 hover:bg-black/60 transition-colors">
          <X size={20} />
        </button>

        <div className="relative aspect-square bg-black">
          {previewUrl ? (
            <video src={previewUrl} controls className="w-full h-full object-cover" />
          ) : (
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          )}

          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              {formatTime(recordingTime)}
            </div>
          )}
        </div>

        <div className="p-8 flex flex-col items-center gap-6">
          {!previewUrl ? (
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                isRecording ? 'border-red-500 bg-red-500/10' : 'border-[#00a884] bg-[#00a884]/10'
              }`}
            >
              {isRecording ? (
                <Square size={32} className="text-red-500 fill-current" />
              ) : (
                <div className="w-16 h-16 bg-[#00a884] rounded-full flex items-center justify-center text-white">
                  <Video size={32} />
                </div>
              )}
            </button>
          ) : (
            <div className="flex gap-4 w-full">
              <button 
                onClick={handleReset}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
              >
                <RefreshCw size={20} /> Retake
              </button>
              <button 
                onClick={handleSend}
                className="flex-1 py-3 bg-[#00a884] text-white rounded-xl flex items-center justify-center gap-2 hover:bg-[#008f72] transition-colors font-bold shadow-lg"
              >
                <Send size={20} /> Send
              </button>
            </div>
          )}
          <p className="text-white/60 text-sm font-medium">
            {!previewUrl ? (isRecording ? "Tap to stop" : "Tap to record video message") : "Preview your message"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoRecorderModal;
