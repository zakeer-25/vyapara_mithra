
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Translation } from '../types';

interface Props {
  onTranscript: (text: string) => void;
  language: string;
  translations: Translation;
  placeholder?: string;
  multiline?: boolean;
  value: string;
  onChange: (text: string) => void;
}

const VoiceInput: React.FC<Props> = ({ 
  onTranscript, 
  language, 
  translations, 
  placeholder, 
  multiline = false,
  value,
  onChange
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
    }
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      const localeMap: Record<string, string> = {
        'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN',
        'mr': 'mr-IN', 'ta': 'ta-IN', 'gu': 'gu-IN', 'ur': 'ur-IN',
        'kn': 'kn-IN', 'or': 'or-IN', 'ml': 'ml-IN', 'pa': 'pa-IN',
        'as': 'as-IN', 'sa': 'sa-IN', 'ne': 'ne-NP', 'sd': 'sd-IN',
        'ks': 'ks-IN', 'kok': 'kok-IN', 'mai': 'mai-IN', 'mni': 'mni-IN',
        'sat': 'sat-IN', 'brx': 'brx-IN', 'doi': 'doi-IN'
      };
      recognitionRef.current.lang = localeMap[language] || language;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(translations.voice_not_supported);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
      recognitionRef.current.onresult = (event: any) => {
        onTranscript(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full relative px-6">
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-32 text-2xl font-black bg-transparent focus:ring-0 outline-none resize-none placeholder-slate-300 leading-snug text-slate-800 py-4"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full py-6 text-2xl font-black bg-transparent focus:ring-0 outline-none placeholder-slate-300 text-slate-800"
          />
        )}
      </div>

      <div className="flex flex-col items-center gap-4 pb-8">
        <button
          onClick={toggleListening}
          className={`
            relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 shadow-xl
            ${isListening 
              ? 'bg-rose-500 text-white mic-active scale-110' 
              : 'btn-accent text-white hover:brightness-105 active:scale-95'}
          `}
        >
          {isListening ? (
            <MicOff className="w-10 h-10" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
        <div className="flex flex-col items-center">
           <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-300 ${isListening ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`}>
            {isListening ? translations.listening : translations.tap_to_speak}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;
