
import React, { useState, useEffect } from 'react';
import { Volume2, BookOpen, ScrollText, BrainCircuit, Lightbulb } from 'lucide-react';
import { Unit, UnitContent } from '../types';
import { generateUnitContent, playTextToSpeech } from '../services/geminiService';
import { Frame, Button, LoadingSpinner } from './RetroComponents';

interface UnitStudyViewProps {
  unit: Unit;
  onNavigate: (type: 'VOCAB' | 'GRAMMAR' | 'QUIZ', topic: string) => void;
}

const UnitStudyView: React.FC<UnitStudyViewProps> = ({ unit, onNavigate }) => {
  const [content, setContent] = useState<UnitContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const data = await generateUnitContent(unit.vocabTopic, unit.grammarTopic);
      setContent(data);
      setLoading(false);
    };
    loadContent();
  }, [unit]);

  const playAudio = (text: string) => {
    playTextToSpeech(text);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full justify-center items-center">
        <LoadingSpinner />
        <p className="mt-4 text-showa-brown/60 animate-pulse">教材を作成中 (Generating Lesson Content)...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col h-full justify-center items-center text-showa-brown">
        <p>コンテンツの読み込みに失敗しました。</p>
        <Button onClick={() => window.location.reload()} className="mt-4">再読み込み</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6 pb-20 overflow-y-auto">
      <div className="flex flex-col border-b-2 border-showa-red pb-2 pl-16 md:pl-0">
        <h2 className="text-3xl font-bold text-showa-brown tracking-widest">{content.title}</h2>
        <p className="text-sm text-showa-brown/70 mt-1">{content.intro}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dialogue Section */}
        <div className="space-y-6">
            <Frame className="bg-white">
                <h3 className="text-xl font-bold text-showa-brown mb-4 border-b border-dashed border-showa-brown/20 pb-2">
                    会話 (Dialogue)
                </h3>
                <div className="space-y-4">
                    {content.dialogue.map((line, idx) => (
                    <div key={idx} className={`flex gap-3 ${line.speaker === 'B' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${line.speaker === 'A' ? 'bg-showa-blue' : 'bg-showa-red'}`}>
                            {line.speaker}
                        </div>
                        <div className={`flex-1 p-3 rounded-lg ${line.speaker === 'A' ? 'bg-showa-blue/5 rounded-tl-none' : 'bg-showa-red/5 rounded-tr-none'}`}>
                            <p className="font-bold text-showa-brown text-lg">{line.japanese}</p>
                            <p className="text-xs text-showa-brown/50 mb-1">{line.reading}</p>
                            <p className="text-sm text-showa-brown/80">{line.meaning}</p>
                            <button 
                            onClick={() => playAudio(line.japanese)}
                            className="mt-2 text-xs text-showa-blue flex items-center gap-1 hover:underline"
                            >
                                <Volume2 size={14} /> 再生
                            </button>
                        </div>
                    </div>
                    ))}
                </div>
            </Frame>
            
            {/* Grammar Note - NEW */}
            <Frame className="bg-showa-paper border-showa-brown/20">
               <h3 className="text-lg font-bold text-showa-red mb-3 flex items-center gap-2">
                  <Lightbulb size={20} /> ワンポイント文法 (Grammar Note)
               </h3>
               <p className="text-showa-brown text-sm leading-relaxed whitespace-pre-wrap">
                   {content.grammarNote}
               </p>
            </Frame>
        </div>

        {/* Key Sentences & Actions */}
        <div className="flex flex-col gap-6">
           <Frame className="bg-white">
              <h3 className="text-xl font-bold text-showa-brown mb-4 border-b border-dashed border-showa-brown/20 pb-2">
                重要表現 (Key Sentences)
              </h3>
              <ul className="space-y-4">
                 {content.keySentences.map((sent, idx) => (
                   <li key={idx} className="p-2 border-l-4 border-showa-gold bg-showa-gold/5">
                      <div className="flex justify-between items-start">
                         <div>
                            <p className="font-bold text-showa-brown">{sent.japanese}</p>
                            <p className="text-xs text-showa-brown/50">{sent.reading}</p>
                            <p className="text-sm text-showa-brown/80 mt-1">{sent.meaning}</p>
                         </div>
                         <button onClick={() => playAudio(sent.japanese)} className="text-showa-brown/40 hover:text-showa-brown">
                            <Volume2 size={18} />
                         </button>
                      </div>
                   </li>
                 ))}
              </ul>
           </Frame>

           {/* Action Buttons */}
           <div className="bg-showa-paper p-4 border border-showa-brown/20 rounded shadow-md">
              <h3 className="text-sm font-bold text-showa-brown mb-3 text-center">この単元の学習を進める</h3>
              <div className="grid grid-cols-1 gap-2">
                 <Button onClick={() => onNavigate('VOCAB', unit.vocabTopic)} className="w-full text-sm justify-center">
                    <BookOpen size={16} className="mr-2"/> 単語リストを見る (50語)
                 </Button>
                 <Button onClick={() => onNavigate('GRAMMAR', unit.grammarTopic)} variant="secondary" className="w-full text-sm justify-center">
                    <ScrollText size={16} className="mr-2"/> 詳細な文法解説を読む
                 </Button>
                 <Button onClick={() => onNavigate('QUIZ', unit.vocabTopic)} variant="secondary" className="w-full text-sm justify-center">
                    <BrainCircuit size={16} className="mr-2"/> 理解度チェックテスト
                 </Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UnitStudyView;
