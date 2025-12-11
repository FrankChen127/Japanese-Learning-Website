
import React, { useState, useEffect, useRef } from 'react';
import { Book, CheckCircle2, XCircle, Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { GrammarExplanation, QuizQuestion } from '../types';
import { generateGrammarExplanation, generateQuiz, playTextToSpeech } from '../services/geminiService';
import { Frame, Button, JapaneseInput, LoadingSpinner } from './RetroComponents';

interface GrammarViewProps {
  initialTopic?: string;
  autoMode?: 'STUDY' | 'QUIZ';
}

const GrammarView: React.FC<GrammarViewProps> = ({ initialTopic = '', autoMode }) => {
    const [topic, setTopic] = useState(initialTopic);
    const [loading, setLoading] = useState(false);
    const [explanation, setExplanation] = useState<GrammarExplanation | null>(null);
    const [mode, setMode] = useState<'STUDY' | 'QUIZ'>('STUDY');
    
    // Quiz State
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
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
                handleLearn(initialTopic);
            }
        }
    }, [initialTopic, autoMode]);

    // Cleanup timer on unmount
    useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    const handleLearn = async (searchTopic: string = topic) => {
        if (!searchTopic.trim()) return;
        setLoading(true);
        setMode('STUDY');
        const result = await generateGrammarExplanation(searchTopic);
        setExplanation(result);
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
        
        const questions = await generateQuiz(searchTopic, 'GRAMMAR');
        setQuizQuestions(questions);
        setLoading(false);
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
            <div className="flex flex-col space-y-1 border-b-2 border-showa-red pb-2 pl-16 md:pl-0">
                <h2 className="text-3xl font-bold text-showa-brown tracking-widest">文法教室</h2>
                <p className="text-showa-brown/70 text-xs">
                    {initialTopic ? `学習中: ${initialTopic}` : "文法を入力して学習、または小テストを行います"}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto w-full items-start z-30 relative">
                <JapaneseInput
                    placeholder="例：～てはいけない、受身形、助詞「に」..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onEnter={() => handleLearn(topic)}
                />
                <div className="flex gap-2 shrink-0">
                    <Button onClick={() => handleLearn(topic)} disabled={loading || !topic} className="px-4 text-sm">
                        {loading && mode === 'STUDY' ? <Loader2 className="animate-spin" size={16} /> : <span className="flex items-center gap-1"><Book size={16} /> 解説</span>}
                    </Button>
                    <Button onClick={() => handleStartQuiz(topic)} disabled={loading || !topic} variant="secondary" className="px-4 text-sm">
                        {loading && mode === 'QUIZ' ? <Loader2 className="animate-spin" size={16} /> : <span className="flex items-center gap-1"><BrainCircuit size={16} /> テスト</span>}
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-20">
                {loading ? (
                    <LoadingSpinner />
                ) : mode === 'STUDY' ? (
                    explanation ? (
                        <Frame className="bg-white">
                            <h3 className="text-2xl font-black text-showa-brown mb-4 border-b border-dashed border-showa-brown/30 pb-2">{explanation.title}</h3>
                            <div className="prose prose-stone prose-sm text-showa-brown mb-6 font-serif">
                                <div className="whitespace-pre-wrap leading-relaxed">
                                   {explanation.explanation}
                                </div>
                            </div>
                            
                            <div className="bg-showa-paper p-4 rounded border border-showa-brown/20">
                                <h4 className="font-bold text-showa-red mb-3 flex items-center gap-2"><Sparkles size={16}/> 例文</h4>
                                <div className="space-y-4">
                                    {explanation.examples.map((ex, i) => (
                                        <div key={i} className="group">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-lg font-bold text-showa-brown">{ex.japanese}</p>
                                                    <p className="text-xs text-showa-brown/60">{ex.reading}</p>
                                                    <p className="text-sm text-showa-brown mt-1">「{ex.meaning}」</p>
                                                </div>
                                                <button onClick={() => playTextToSpeech(ex.japanese)} className="opacity-0 group-hover:opacity-100 transition-opacity text-showa-blue">
                                                    🔊
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Frame>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 opacity-40 text-showa-brown border-2 border-dashed border-showa-brown rounded-lg">
                            <Book size={48} className="mb-2" />
                            <p>文法トピックを入力して「解説」ボタンを押してください</p>
                        </div>
                    )
                ) : (
                    // QUIZ MODE
                    quizQuestions.length > 0 ? (
                        quizCompleted ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <h3 className="text-2xl font-bold text-showa-brown">テスト終了</h3>
                                <div className="text-5xl font-black text-showa-red border-4 border-double border-showa-red p-6 rounded-full transform -rotate-12">
                                    {quizScore} / {quizQuestions.length}
                                </div>
                                <Button onClick={() => handleStartQuiz(topic)}>再挑戦</Button>
                                <Button variant="secondary" onClick={() => setMode('STUDY')}>解説に戻る</Button>
                            </div>
                        ) : (
                            <div className="max-w-xl mx-auto w-full">
                                <div className="flex justify-between items-center mb-4 text-showa-brown/60 text-sm font-bold">
                                    <span>問 {quizIndex + 1} / {quizQuestions.length}</span>
                                    <span>正解数: {quizScore}</span>
                                </div>
                                <Frame className="bg-white relative">
                                    <h3 className="text-xl font-bold text-showa-brown mb-6 text-center leading-relaxed">
                                        {quizQuestions[quizIndex].question}
                                    </h3>
                                    <div className="space-y-3">
                                        {quizQuestions[quizIndex].options.map((option, idx) => {
                                            const isSelected = selectedOption === idx;
                                            const isCorrect = idx === quizQuestions[quizIndex].correctAnswerIndex;
                                            const showResult = selectedOption !== null;

                                            let buttonStyle = "w-full text-left p-3 border-2 rounded transition-all ";
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
                                                        {showResult && isCorrect && <CheckCircle2 size={20} className="text-green-600" />}
                                                        {showResult && isSelected && !isCorrect && <XCircle size={20} className="text-red-600" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {selectedOption !== null && (
                                        <div className="mt-6 p-3 bg-showa-paper border border-showa-brown/20 rounded animate-fadeIn">
                                            <p className="font-bold text-showa-red mb-1">解説:</p>
                                            <p className="text-sm text-showa-brown">{quizQuestions[quizIndex].explanation}</p>
                                            <div className="mt-4 text-center">
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
                            <p>文法トピックを入力して「テスト」ボタンを押してください</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default GrammarView;
