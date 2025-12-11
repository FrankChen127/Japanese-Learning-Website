
import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Globe, Sparkles } from 'lucide-react';
import { toHiragana, toKatakana } from '../services/romajiService';
import { getKanjiSuggestion } from '../services/geminiService';

export const Frame: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`border-4 border-double border-showa-brown p-1 bg-showa-bg shadow-lg ${className}`}>
    <div className="border border-showa-brown/50 h-full p-4 relative overflow-hidden">
        {/* Grain texture overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
        <div className="relative z-10 h-full">
            {children}
        </div>
    </div>
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-white border-2 border-showa-brown/20 p-4 shadow-[2px_2px_0px_0px_rgba(74,59,50,0.1)] hover:shadow-[4px_4px_0px_0px_rgba(74,59,50,0.2)] hover:-translate-y-1 transition-all cursor-pointer ${className}`}
    >
        {children}
    </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyle = "px-6 py-2 font-bold text-lg transition-all active:scale-95 border-2 relative overflow-hidden group";
  const variants = {
    primary: "bg-showa-red text-white border-showa-red hover:bg-[#a02e3b] shadow-[4px_4px_0px_0px_rgba(74,59,50,0.3)]",
    secondary: "bg-showa-bg text-showa-brown border-showa-brown hover:bg-[#e6e2d8] shadow-[4px_4px_0px_0px_rgba(74,59,50,0.1)]"
  };

  return (
    <button 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed shadow-none' : ''} ${className}`}
      {...props}
    >
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props}
    className="w-full bg-showa-paper border-b-2 border-showa-brown/50 focus:border-showa-red outline-none px-2 py-2 text-showa-brown placeholder-showa-brown/40 font-serif transition-colors text-lg"
  />
);

interface JapaneseInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  onEnter?: () => void;
}

export const JapaneseInput: React.FC<JapaneseInputProps> = ({ value, onChange, onEnter, className = '', ...props }) => {
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [kanjiCandidate, setKanjiCandidate] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  
  // Derived values for suggestions
  const hiragana = toHiragana(value);
  const katakana = toKatakana(value);
  
  const showSuggestions = value.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSuggestionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce Kanji fetching
  useEffect(() => {
    setKanjiCandidate(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (value.length > 1 && /^[a-zA-Z\s]+$/.test(value)) {
        timerRef.current = window.setTimeout(async () => {
             const candidate = await getKanjiSuggestion(value);
             if (candidate) setKanjiCandidate(candidate);
        }, 600);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [value]);

  const handleSelect = (newValue: string) => {
    onChange({ target: { value: newValue } });
    setSuggestionOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && (e.key === 'ArrowDown' || e.key === 'Tab')) {
        e.preventDefault();
        setSuggestionOpen(true);
    } else if (e.key === 'Enter') {
        if (suggestionOpen) {
            // If we have a Kanji candidate and the menu is open, select it first if user hits enter
            if (kanjiCandidate) handleSelect(kanjiCandidate);
            else setSuggestionOpen(false);
        } else {
           if (onEnter) onEnter();
        }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
       <div className="relative">
         <Input 
            {...props}
            value={value} 
            onChange={(e) => {
                onChange(e);
                setSuggestionOpen(true);
            }}
            onKeyDown={handleKeyDown}
            className={`${className} pr-8`}
         />
         {showSuggestions && (
            <div className="absolute right-2 top-3 text-showa-brown/30">
                <Globe size={16} />
            </div>
         )}
       </div>

       {showSuggestions && suggestionOpen && (
           <div className="absolute z-50 left-0 right-0 mt-1 bg-white border-2 border-showa-brown/20 shadow-xl rounded-b-lg overflow-hidden animate-fadeIn">
              <div className="text-xs bg-showa-paper p-1 text-showa-brown/60 px-2">変換候補 (Select)</div>
              
              {kanjiCandidate && (
                <button 
                    onClick={() => handleSelect(kanjiCandidate)}
                    className="w-full text-left px-3 py-3 bg-showa-gold/10 hover:bg-showa-gold/20 flex justify-between group border-b border-showa-brown/10"
                >
                    <span className="font-bold text-xl text-showa-brown flex items-center gap-2">
                        {kanjiCandidate} <Sparkles size={14} className="text-showa-gold"/>
                    </span>
                    <span className="text-xs text-showa-brown/60">AI推測 (Kanji)</span>
                </button>
              )}

              <button 
                onClick={() => handleSelect(hiragana)}
                className="w-full text-left px-3 py-2 hover:bg-showa-blue/10 flex justify-between group"
              >
                 <span className="font-bold text-showa-brown">{hiragana}</span>
                 <span className="text-xs text-showa-brown/40 group-hover:text-showa-blue">ひらがな</span>
              </button>
              <button 
                onClick={() => handleSelect(katakana)}
                className="w-full text-left px-3 py-2 hover:bg-showa-blue/10 flex justify-between group"
              >
                 <span className="font-bold text-showa-brown">{katakana}</span>
                 <span className="text-xs text-showa-brown/40 group-hover:text-showa-blue">カタカナ</span>
              </button>
              <button 
                onClick={() => handleSelect(value)}
                className="w-full text-left px-3 py-2 hover:bg-showa-blue/10 flex justify-between group border-t border-dashed border-showa-brown/10"
              >
                 <span className="font-serif text-showa-brown">{value}</span>
                 <span className="text-xs text-showa-brown/40 group-hover:text-showa-blue">英語 (English)</span>
              </button>
           </div>
       )}
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-block bg-showa-blue text-white text-xs px-2 py-0.5 rounded-sm font-serif tracking-wider border border-showa-blue/50">
        {children}
    </span>
);

export const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-8 text-showa-brown">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-3 tracking-widest text-lg">読み込み中...</span>
    </div>
);

export const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; labelOn: string; labelOff: string }> = ({ checked, onChange, labelOn, labelOff }) => (
  <div 
    onClick={onChange} 
    className="flex items-center gap-2 cursor-pointer select-none group"
  >
    <span className={`text-xs font-bold transition-colors ${!checked ? 'text-showa-red' : 'text-showa-brown/50'}`}>{labelOff}</span>
    <div className={`w-12 h-6 rounded-full border-2 border-showa-brown relative transition-colors ${checked ? 'bg-showa-blue/10' : 'bg-showa-red/10'}`}>
       <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-showa-brown shadow-sm transition-transform duration-300 ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
    </div>
    <span className={`text-xs font-bold transition-colors ${checked ? 'text-showa-blue' : 'text-showa-brown/50'}`}>{labelOn}</span>
  </div>
);
