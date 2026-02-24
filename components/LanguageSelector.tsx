import React from 'react';
import { LANGUAGES } from '../constants';
import { LanguageCode } from '../types';
import { Globe, X, Check, Languages } from 'lucide-react';

interface Props {
  isOpen: boolean;           // Added to accept state from App
  onClose: () => void;       // Added to allow App to close it
  selected: LanguageCode;
  onChange: (code: LanguageCode) => void;
}

const LanguageSelector: React.FC<Props> = ({ isOpen, onClose, selected, onChange }) => {
  const currentLang = LANGUAGES.find(l => l.code === selected);

  // If App hasn't triggered it open, don't show anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-[#0f172a] animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-white/5 shrink-0 bg-[#0f172a]">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-600 rounded-[1.5rem] text-white shadow-lg shadow-emerald-900/20">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">Choose Language</h3>
            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">अपनी भाषा चुनें</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-4 bg-white/5 text-slate-400 rounded-full hover:bg-white/10 hover:text-white transition-all active:scale-90"
        >
          <X className="w-7 h-7" />
        </button>
      </div>

      {/* Grid Area */}
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-32 bg-[#0f172a]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onChange(lang.code);
                onClose(); // Automatically close after picking
              }}
              className={`
                relative flex items-center justify-between p-8 rounded-[2.5rem] transition-all duration-300 border-4
                ${selected === lang.code 
                  ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_40px_rgba(16,185,129,0.1)]' 
                  : 'bg-white/5 border-white/5 text-slate-300 hover:border-emerald-500/30 hover:bg-white/10'}
              `}
            >
              <div className="flex flex-col items-start text-left">
                <span className={`text-3xl font-black mb-1 ${selected === lang.code ? 'text-emerald-400' : 'text-white'}`}>
                  {lang.nativeName}
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  {lang.name}
                </span>
              </div>
              
              {selected === lang.code ? (
                <div className="bg-emerald-500 rounded-full p-2 text-white shadow-lg shadow-emerald-500/20">
                  <Check className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-white/10 flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-white/10"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-[#0f172a] border-t border-white/5 shadow-[0_-20px_40px_rgba(0,0,0,0.3)] z-10">
        <div className="max-w-xs mx-auto text-center">
          <button 
            onClick={onClose}
            className="w-full h-20 bg-emerald-600 text-white text-xl font-black rounded-[2rem] shadow-2xl active:scale-95 transition-all hover:bg-emerald-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;