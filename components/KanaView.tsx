
import React, { useState } from 'react';
import { playTextToSpeech } from '../services/geminiService';
import { Frame, Button } from './RetroComponents';

const gojuon = [
  ['あ', 'い', 'う', 'え', 'お'],
  ['か', 'き', 'く', 'け', 'こ'],
  ['さ', 'し', 'す', 'せ', 'そ'],
  ['た', 'ち', 'つ', 'て', 'と'],
  ['な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  ['ま', 'み', 'む', 'め', 'も'],
  ['や', '', 'ゆ', '', 'よ'],
  ['ら', 'り', 'る', 'れ', 'ろ'],
  ['わ', '', 'を', '', 'ん'],
];

const KanaView: React.FC = () => {
  const [type, setType] = useState<'HIRAGANA' | 'KATAKANA'>('HIRAGANA');

  const toKatakana = (str: string) => {
    return str.replace(/[\u3041-\u3096]/g, function(match) {
        return String.fromCharCode(match.charCodeAt(0) + 0x60);
    });
  };

  const handleClick = (char: string) => {
    if (!char) return;
    playTextToSpeech(char);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-between items-center border-b-2 border-showa-red pb-4">
        <div>
          <h2 className="text-3xl font-bold text-showa-brown tracking-widest">五十音図</h2>
          <p className="text-xs text-showa-brown/60">文字をクリックして発音を確認</p>
        </div>
        <div className="flex gap-4">
            <button
                onClick={() => setType('HIRAGANA')}
                className={`px-6 py-3 rounded-lg font-bold text-lg shadow-md transition-all border-2 ${
                   type === 'HIRAGANA' 
                   ? 'bg-showa-blue text-white border-showa-blue scale-105' 
                   : 'bg-white text-showa-brown border-showa-brown/20 hover:bg-showa-blue/10'
                }`}
            >
                あ ひらがな
            </button>
            <button
                onClick={() => setType('KATAKANA')}
                className={`px-6 py-3 rounded-lg font-bold text-lg shadow-md transition-all border-2 ${
                   type === 'KATAKANA' 
                   ? 'bg-showa-red text-white border-showa-red scale-105' 
                   : 'bg-white text-showa-brown border-showa-brown/20 hover:bg-showa-red/10'
                }`}
            >
                ア カタカナ
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
          <Frame className="bg-white min-h-[500px] flex items-center justify-center p-8">
              {/* Wide Grid Layout: 10 Columns, right-to-left */}
              <div className="flex flex-row-reverse justify-center gap-4 flex-wrap max-w-6xl">
                  {gojuon.map((col, colIdx) => (
                     <div key={colIdx} className="flex flex-col gap-3">
                         {/* Header for column (optional, could add 'a', 'ka', 'sa' labels here) */}
                        {col.map((char, rowIdx) => {
                            const displayChar = type === 'KATAKANA' && char ? toKatakana(char) : char;
                            return (
                                <button
                                    key={`${colIdx}-${rowIdx}`}
                                    onClick={() => handleClick(char)}
                                    disabled={!char}
                                    className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl md:text-3xl font-serif rounded-lg border-2 transition-all shadow-sm
                                        ${!char 
                                            ? 'border-transparent cursor-default opacity-0' 
                                            : type === 'HIRAGANA' 
                                                ? 'border-showa-blue/20 text-showa-brown bg-showa-paper hover:border-showa-blue hover:text-showa-blue hover:scale-110 active:scale-95'
                                                : 'border-showa-red/20 text-showa-brown bg-showa-paper hover:border-showa-red hover:text-showa-red hover:scale-110 active:scale-95'
                                        }`}
                                >
                                    {displayChar}
                                </button>
                            );
                        })}
                     </div>
                  ))}
              </div>
          </Frame>
      </div>
    </div>
  );
};

export default KanaView;
