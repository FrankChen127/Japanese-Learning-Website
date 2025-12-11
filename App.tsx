
import React, { useState } from 'react';
import { Book, MessageCircle, Home, Grid3X3, ScrollText, GraduationCap, ArrowLeft, Menu, X } from 'lucide-react';
import { AppView, Unit } from './types';
import VocabularyView from './components/VocabularyView';
import ChatTutor from './components/ChatTutor';
import KanaView from './components/KanaView';
import GrammarView from './components/GrammarView';
import CourseView from './components/CourseView';
import UnitStudyView from './components/UnitStudyView';
import { Button } from './components/RetroComponents';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [initialTopic, setInitialTopic] = useState<string>('');
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const [autoMode, setAutoMode] = useState<'LIST' | 'QUIZ' | 'STUDY' | undefined>(undefined);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Navigation History Stack
  const [navHistory, setNavHistory] = useState<AppView[]>([]);

  const addToHistory = (view: AppView) => {
    setNavHistory(prev => [...prev, view]);
  };

  const handleNavClick = (view: AppView) => {
    if (view === currentView) {
      setIsMenuOpen(false);
      return;
    }
    addToHistory(currentView);
    setCurrentView(view);
    setInitialTopic('');
    setActiveUnit(null);
    setAutoMode(undefined);
    setIsMenuOpen(false);
  };

  const handleBack = () => {
    if (navHistory.length === 0) return;
    const newHistory = [...navHistory];
    const previousView = newHistory.pop();
    setNavHistory(newHistory);
    if (previousView) {
      setCurrentView(previousView);
    }
  };

  const handleCourseSelection = (type: 'VOCAB' | 'GRAMMAR' | 'QUIZ', topic: string) => {
    addToHistory(currentView); 
    setInitialTopic(topic);
    if (type === 'VOCAB') {
        setAutoMode('LIST');
        setCurrentView(AppView.VOCABULARY);
    } else if (type === 'GRAMMAR') {
        setAutoMode('STUDY');
        setCurrentView(AppView.GRAMMAR);
    } else if (type === 'QUIZ') {
        setAutoMode('QUIZ');
        setCurrentView(AppView.VOCABULARY);
    }
  };

  const handleStartUnit = (unit: Unit) => {
    addToHistory(AppView.COURSE);
    setActiveUnit(unit);
    setCurrentView(AppView.UNIT_STUDY);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.COURSE:
        return <CourseView onSelectTopic={handleCourseSelection} onStartUnit={handleStartUnit} />;
      case AppView.UNIT_STUDY:
        return activeUnit ? (
          <UnitStudyView unit={activeUnit} onNavigate={handleCourseSelection} />
        ) : (
           <CourseView onSelectTopic={handleCourseSelection} onStartUnit={handleStartUnit} />
        );
      case AppView.VOCABULARY:
        return <VocabularyView initialTopic={initialTopic} autoMode={autoMode as any} />;
      case AppView.CHAT:
        return <ChatTutor />;
      case AppView.KANA:
        return <KanaView />;
      case AppView.GRAMMAR:
        return <GrammarView initialTopic={initialTopic} autoMode={autoMode as any} />;
      case AppView.HOME:
      default:
        return (
          <div className="flex flex-col items-center justify-start min-h-full text-center space-y-6 animate-fadeIn pb-12 pt-4">
            <div className="border-4 border-double border-showa-red p-6 bg-white/80 shadow-2xl">
              <h1 className="text-4xl md:text-6xl font-black text-showa-brown tracking-widest mb-2 font-serif">
                日文學習
              </h1>
              <p className="text-showa-brown text-base md:text-lg font-bold border-t border-b border-showa-brown py-1 inline-block">
                懐かしい雰囲気で学ぶ
              </p>
            </div>
            
            {/* Rearranged Grid: Symmetrical 2-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
               
               {/* 1. Curriculum - Full Width */}
               <button 
                onClick={() => handleNavClick(AppView.COURSE)}
                className="group relative h-36 col-span-1 md:col-span-2 bg-showa-brown text-white p-1 shadow-[4px_4px_0px_0px_rgba(74,59,50,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(74,59,50,0.2)] hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                 <div className="border-2 border-white/30 h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-showa-brown to-[#3e2b24]">
                    <GraduationCap size={40} className="mb-1 opacity-90 group-hover:scale-110 transition-transform text-showa-gold" />
                    <span className="text-2xl font-bold tracking-widest z-10">カリキュラム</span>
                    <span className="text-sm opacity-80 mt-1">Beginner Course - Start Here</span>
                    <div className="absolute -bottom-6 -right-6 text-9xl text-white/5 font-serif select-none">学</div>
                 </div>
              </button>

              {/* 2. Kana */}
              <button 
                onClick={() => handleNavClick(AppView.KANA)}
                className="group relative h-32 bg-white text-showa-brown p-1 shadow-[4px_4px_0px_0px_rgba(74,59,50,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(74,59,50,0.2)] hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                 <div className="border-2 border-showa-brown/20 h-full flex flex-col items-center justify-center relative overflow-hidden">
                    <Grid3X3 size={28} className="mb-1 opacity-80 group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-bold tracking-widest z-10">五十音</span>
                    <span className="text-xs opacity-60 mt-1">Kana Chart</span>
                    <div className="absolute -bottom-4 -right-4 text-8xl text-showa-brown/5 font-serif select-none">あ</div>
                 </div>
              </button>

              {/* 3. Vocabulary */}
              <button 
                onClick={() => handleNavClick(AppView.VOCABULARY)}
                className="group relative h-32 bg-showa-blue text-white p-1 shadow-[4px_4px_0px_0px_rgba(74,59,50,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(74,59,50,0.2)] hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                 <div className="border-2 border-white/30 h-full flex flex-col items-center justify-center relative overflow-hidden">
                    <Book size={28} className="mb-1 opacity-80 group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-bold tracking-widest z-10">単語帳</span>
                    <span className="text-xs opacity-60 mt-1">Vocabulary & Quiz</span>
                    <div className="absolute -bottom-4 -right-4 text-8xl text-white/10 font-serif select-none">単</div>
                 </div>
              </button>

              {/* 4. Grammar */}
              <button 
                onClick={() => handleNavClick(AppView.GRAMMAR)}
                className="group relative h-32 bg-showa-gold text-showa-brown p-1 shadow-[4px_4px_0px_0px_rgba(74,59,50,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(74,59,50,0.2)] hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                 <div className="border-2 border-showa-brown/30 h-full flex flex-col items-center justify-center relative overflow-hidden">
                    <ScrollText size={28} className="mb-1 opacity-80 group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-bold tracking-widest z-10">文法</span>
                    <span className="text-xs opacity-60 mt-1">Grammar & Quiz</span>
                    <div className="absolute -bottom-4 -right-4 text-8xl text-showa-brown/5 font-serif select-none">文</div>
                 </div>
              </button>

              {/* 5. Chat Tutor */}
              <button 
                onClick={() => handleNavClick(AppView.CHAT)}
                className="group relative h-32 bg-showa-red text-white p-1 shadow-[4px_4px_0px_0px_rgba(74,59,50,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(74,59,50,0.2)] hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                 <div className="border-2 border-white/30 h-full flex flex-col items-center justify-center relative overflow-hidden">
                    <MessageCircle size={28} className="mb-1 opacity-80 group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-bold tracking-widest z-10">個人指導</span>
                    <span className="text-xs opacity-60 mt-1">AI Tutor Chat</span>
                    <div className="absolute -bottom-4 -right-4 text-8xl text-white/10 font-serif select-none">話</div>
                 </div>
              </button>
            </div>
          </div>
        );
    }
  };

  const NavItem = ({ icon: Icon, label, view }: { icon: any, label: string, view: AppView }) => (
    <button 
      onClick={() => handleNavClick(view)}
      className={`w-full text-left px-4 py-3 flex items-center gap-4 transition-colors border-b border-showa-brown/10 ${
        currentView === view 
        ? 'bg-showa-brown text-white' 
        : 'text-showa-brown hover:bg-showa-brown/10'
      }`}
    >
      <Icon size={24} className={currentView === view ? 'text-showa-gold' : 'text-showa-brown/60'} />
      <span className="font-bold text-lg">{label}</span>
    </button>
  );

  return (
    <div className="h-screen flex flex-col bg-showa-bg bg-paper-pattern text-showa-brown font-serif overflow-hidden">
      
      {/* Top Navigation Bar */}
      <header className="h-16 bg-showa-brown text-showa-bg flex items-center justify-between px-4 shadow-lg z-50 shrink-0 border-b-4 border-double border-[#3e2b24]">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
              <Menu size={28} />
          </button>
          
          <div 
             className="flex items-center gap-2 cursor-pointer" 
             onClick={() => handleNavClick(AppView.HOME)}
          >
              <div className="border border-showa-gold rounded-full w-8 h-8 flex items-center justify-center bg-showa-bg text-showa-brown font-bold text-xs">
                昭
              </div>
              <span className="text-xl font-bold tracking-widest text-showa-gold">昭和日本語</span>
          </div>
          
          <div className="w-10"></div> {/* Spacer to center title */}
      </header>

      {/* Slide-out Menu Drawer */}
      {isMenuOpen && (
          <div className="fixed inset-0 z-[100] flex">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsMenuOpen(false)}
              ></div>
              
              {/* Drawer Content */}
              <nav className="relative w-72 h-full bg-showa-bg bg-paper-pattern border-r-4 border-double border-showa-brown flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
                  <div className="p-4 bg-showa-brown text-white flex justify-between items-center mb-2">
                      <span className="text-xl font-bold tracking-widest">メニュー</span>
                      <button onClick={() => setIsMenuOpen(false)} className="hover:text-showa-gold transition-colors">
                          <X size={24}/>
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto py-2">
                      <NavItem icon={Home} label="ホーム" view={AppView.HOME} />
                      <NavItem icon={GraduationCap} label="カリキュラム" view={AppView.COURSE} />
                      <NavItem icon={Grid3X3} label="五十音図" view={AppView.KANA} />
                      <NavItem icon={Book} label="単語帳" view={AppView.VOCABULARY} />
                      <NavItem icon={ScrollText} label="文法教室" view={AppView.GRAMMAR} />
                      <NavItem icon={MessageCircle} label="個人指導" view={AppView.CHAT} />
                  </div>

                  <div className="p-4 text-center text-xs text-showa-brown/40 border-t border-showa-brown/10">
                      昭和日本語 v1.0
                  </div>
              </nav>
          </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-2 md:p-6 h-full overflow-hidden relative flex flex-col">
        {/* Decorative corner patterns */}
        <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-showa-brown/10 pointer-events-none rounded-tl-2xl m-2 z-0"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-showa-brown/10 pointer-events-none rounded-br-2xl m-2 z-0"></div>
        
        {/* Content Container */}
        <div className="flex-1 w-full max-w-5xl mx-auto bg-white/60 backdrop-blur-md border border-showa-brown/10 shadow-xl rounded-lg p-3 md:p-8 relative overflow-hidden flex flex-col z-10">
             
             {/* Back Button */}
             {navHistory.length > 0 && currentView !== AppView.HOME && (
                 <div className="absolute bottom-6 right-6 z-50 animate-fadeIn pointer-events-auto">
                     <Button 
                        variant="secondary" 
                        onClick={handleBack}
                        className="!px-4 !py-3 text-lg shadow-xl bg-showa-paper border-showa-brown/50 hover:bg-white"
                     >
                         <ArrowLeft size={20} className="mr-2"/> 戻る
                     </Button>
                 </div>
             )}
             
             {/* Actual View Content */}
             <div className="flex-1 h-full overflow-hidden">
                {renderContent()}
             </div>
        </div>
      </main>
    </div>
  );
};

export default App;
