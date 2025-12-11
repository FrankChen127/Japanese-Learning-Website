
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, BookOpen, Loader2, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';
import { VocabularyItem, QuizQuestion } from '../types';
import { generateVocabularyList, playTextToSpeech, generateQuiz } from '../services/geminiService';
import { Frame, Button, JapaneseInput, LoadingSpinner, Badge } from './RetroComponents';

interface VocabularyViewProps {
  initialTopic?: string;
  autoMode?: 'LIST' | 'QUIZ';
}

const VocabularyView: React.FC<VocabularyViewProps> = ({ initialTopic = '', autoMode }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [loading, setLoading] = useState(false);
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [mode, setMode] = useState<'LIST' | 'QUIZ'>('LIST');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  
  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  const timerRef = useRef<number | null>(null);

  // Auto-trigger if initialTopic is provided
  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      if (autoMode === 'QUIZ') {
        handleStartQuiz(initialTopic);
      } else {
        handleGenerate(initialTopic);
      }
    }
  }, [initialTopic, autoMode]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleGenerate = async (searchTopic: string = topic) => {
    if (!searchTopic.trim()) return;
    setLoading(true);
    setMode('LIST');
    
    const isCurriculumContext = initialTopic && searchTopic === initialTopic;
    const count = isCurriculumContext ? 50 : 10;
    
    const list = await generateVocabularyList(searchTopic, count);
    setVocabList(list);
    setLoading(false);
  };

  const handleStartQuiz = async (searchTopic: string = topic) => {
    if (!searchTopic.trim()) return;
    setLoading(true);
    setMode('QUIZ');
    setQuizIndex(0);
    setQuizScore(0);
    setQuizCompleted(false);
    setSelectedOption(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    const questions = await generateQuiz(searchTopic, 'VOCABULARY');
    setQuizQuestions(questions);
    setLoading(false);
  };

  const playAudio = (text: string) => {
    playTextToSpeech(text);
  };

  const nextQuestion = () => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(i => i + 1);
      setSelectedOption(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    
    const isCorrect = index === quizQuestions[quizIndex].correctAnswerIndex;
    
    if (isCorrect) {
      setQuizScore(s => s + 1);
      playTextToSpeech("正解");
      // Auto advance if correct
      timerRef.current = window.setTimeout(() => {
          nextQuestion();
      }, 1200);
    } else {
      playTextToSpeech("残念");
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between items-end border-b-2 border-showa-red pb-1 pl-16 md:pl-0">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-showa-brown tracking-[0.2em]">単語帳</h2>
          <p className="text-showa-brown/70 text-xs">
            {initialTopic ? `学習中: ${initialTopic}` : "テーマを入力して、学習またはテストを行います"}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto w-full items-start z-30 relative">
        <JapaneseInput 
          placeholder="例：喫茶店、Onsen..." 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onEnter={() => handleGenerate(topic)}
        />
        <div className="flex gap-2 shrink-0">
            <Button onClick={() => handleGenerate(topic)} disabled={loading || !topic} className="px-4 text-sm">
            {loading && mode === 'LIST' ? <Loader2 className="animate-spin" size={16}/> : <span className="flex items-center gap-1"><BookOpen size={16}/> 学習</span>}
            </Button>
            <Button onClick={() => handleStartQuiz(topic)} disabled={loading || !topic} variant="secondary" className="px-4 text-sm">
            {loading && mode === 'QUIZ' ? <Loader2 className="animate-spin" size={16}/> : <span className="flex items-center gap-1"><BrainCircuit size={16}/> テスト</span>}
            </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-20">
        {loading ? (
          <LoadingSpinner />
        ) : mode === 'LIST' ? (
           vocabList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vocabList.map((item, idx) => (
                <Frame key={idx} className="bg-white hover:shadow-xl transition-shadow duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-showa-red font-bold">{item.furigana}</span>
                      <span className="text-3xl font-black text-showa-brown">{item.kanji}</span>
                    </div>
                    <button 
                      onClick={() => playAudio(item.kanji)}
                      className="text-showa-blue hover:text-showa-red transition-colors p-1"
                      title="発音を聞く"
                    >
                      <Volume2 size={28} />
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <Badge>{item.meaning}</Badge>
                  </div>

                  <div className="mt-2 pt-2 border-t border-dashed border-showa-brown/30">
                    <p className="text-lg text-showa-brown/80 italic leading-relaxed">
                      {item.exampleSentence}
                    </p>
                    <button 
                      onClick={() => playAudio(item.exampleSentence)}
                      className="text-sm text-showa-blue/60 hover:text-showa-blue mt-2 flex items-center gap-1"
                    >
                       <Volume2 size={16} /> 例文を再生
                    </button>
                  </div>
                </Frame>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 opacity-40 text-showa-brown border-2 border-dashed border-showa-brown rounded-lg">
              <BookOpen size={48} className="mb-2" />
              <p className="text-xl">テーマを入力して「学習」ボタンを押してください</p>
            </div>
          )
        ) : (
          // QUIZ MODE
          quizQuestions.length > 0 ? (
             quizCompleted ? (
               <div className="flex flex-col items-center justify-center h-full space-y-4">
                 <h3 className="text-3xl font-bold text-showa-brown">テスト終了</h3>
                 <div className="text-6xl font-black text-showa-red border-4 border-double border-showa-red p-8 rounded-full transform -rotate-12">
                   {quizScore} / {quizQuestions.length}
                 </div>
                 <Button onClick={() => handleStartQuiz(topic)}>再挑戦</Button>
                 <Button variant="secondary" onClick={() => setMode('LIST')}>単語帳に戻る</Button>
               </div>
             ) : (
               <div className="max-w-2xl mx-auto w-full">
                  <div className="flex justify-between items-center mb-4 text-showa-brown/60 text-lg font-bold">
                    <span>問 {quizIndex + 1} / {quizQuestions.length}</span>
                    <span>正解数: {quizScore}</span>
                  </div>
                  <Frame className="bg-white relative p-6">
                     <h3 className="text-2xl font-bold text-showa-brown mb-8 text-center leading-relaxed">
                       {quizQuestions[quizIndex].question}
                     </h3>
                     <div className="space-y-4">
                       {quizQuestions[quizIndex].options.map((option, idx) => {
                         const isSelected = selectedOption === idx;
                         const isCorrect = idx === quizQuestions[quizIndex].correctAnswerIndex;
                         const showResult = selectedOption !== null;

                         let buttonStyle = "w-full text-left p-4 border-2 rounded transition-all text-lg ";
                         if (showResult) {
                            if (isCorrect) buttonStyle += "bg-green-100 border-green-500 text-green-900";
                            else if (isSelected) buttonStyle += "bg-red-100 border-red-500 text-red-900";
                            else buttonStyle += "bg-white border-gray-200 opacity-50";
                         } else {
                            buttonStyle += "bg-white border-showa-brown/20 hover:border-showa-blue hover:bg-showa-blue/5 text-showa-brown";
                         }

                         return (
                           <button 
                             key={idx}
                             onClick={() => handleOptionClick(idx)}
                             disabled={showResult}
                             className={buttonStyle}
                           >
                             <div className="flex items-center justify-between">
                               <span>{option}</span>
                               {showResult && isCorrect && <CheckCircle2 size={24} className="text-green-600"/>}
                               {showResult && isSelected && !isCorrect && <XCircle size={24} className="text-red-600"/>}
                             </div>
                           </button>
                         );
                       })}
                     </div>
                     
                     {selectedOption !== null && (
                       <div className="mt-8 p-4 bg-showa-paper border border-showa-brown/20 rounded animate-fadeIn">
                         <p className="font-bold text-showa-red mb-1 text-lg">解説:</p>
                         <p className="text-base text-showa-brown">{quizQuestions[quizIndex].explanation}</p>
                         <div className="mt-6 text-center">
                            <Button onClick={nextQuestion} className="w-full">
                              {quizIndex < quizQuestions.length - 1 ? '次へ' : '結果を見る'}
                            </Button>
                         </div>
                       </div>
                     )}
                  </Frame>
               </div>
             )
          ) : (
            <div className="flex flex-col items-center justify-center h-48 opacity-40 text-showa-brown border-2 border-dashed border-showa-brown rounded-lg">
              <BrainCircuit size={48} className="mb-2" />
              <p className="text-xl">テーマを入力して「テスト」ボタンを押してください</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default VocabularyView;
