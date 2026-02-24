
import React from 'react';
import { X, RotateCcw, History, Trash2 } from 'lucide-react';
import { HistoryItem, Translation } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRevert: (item: HistoryItem) => void;
  onDelete: (item: HistoryItem) => void;
  translations: Translation;
}

const HistoryModal: React.FC<Props> = ({ isOpen, onClose, history, onRevert, onDelete, translations }) => {
  if (!isOpen) return null;

  const handleDelete = (item: HistoryItem) => {
    if (window.confirm(translations.confirm_delete)) {
      onDelete(item);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2 text-indigo-800">
            <History className="w-5 h-5" />
            <h3 className="font-bold text-lg">{translations.history_title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 space-y-3">
          {history.length === 0 && (
            <p className="text-center text-gray-500 py-8">{translations.no_edits}</p>
          )}
          {[...history].reverse().map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors bg-white shadow-sm group">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 line-clamp-2">
                    {item.instruction}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => onRevert(item)}
                    className="flex items-center justify-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {translations.btn_restore}
                  </button>
                  <button 
                    onClick={() => handleDelete(item)}
                    className="flex items-center justify-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {translations.btn_delete}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
