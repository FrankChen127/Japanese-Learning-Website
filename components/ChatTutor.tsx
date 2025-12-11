import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, RefreshCw, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { getChatResponse, playTextToSpeech, translateChatHistory } from '../services/geminiService';
import { Frame, Button, JapaneseInput, ToggleSwitch } from './RetroComponents';

const ChatTutor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'こんにちは。日本語の勉強はいかがですか？何かお手伝いしましょうか。', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [useJapanese, setUseJapanese] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, translating]);

  // Handle language switch effect with translation
  const toggleLanguage = async () => {
    if (translating || loading) return;

    const targetIsJapanese = !useJapanese;
    setUseJapanese(targetIsJapanese);
    setTranslating(true);

    try {
      // Translate existing history
      const translatedHistory = await translateChatHistory(
        messages, 
        targetIsJapanese ? 'JAPANESE' : 'CHINESE'
      );

      // Add a system message locally to inform user
      const sysMsg: ChatMessage = {
        role: 'model',
        text: targetIsJapanese ? "【システム】日本語モードに切り替えました。" : "【系统】已翻譯並切換為中文模式。",
        timestamp: Date.now(),
        isSystemMessage: true
      };
      
      setMessages([...translatedHistory, sysMsg]);

    } catch (e) {
      console.error("Translation failed", e);
    } finally {
      setTranslating(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || translating) return;

    const newMessage: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setLoading(true);

    const responseText = await getChatResponse(messages, input, useJapanese);
    
    setMessages(prev => [
      ...prev,
      { role: 'model', text: responseText, timestamp: Date.now() }
    ]);
    
    // Auto play short responses (optional, but good for immersion)
    if (useJapanese && responseText.length < 30) {
        playTextToSpeech(responseText);
    }
    
    setLoading(false);
  };

  const handleClear = () => {
      setMessages([{ role: 'model', text: useJapanese ? 'また始めましょう。' : 'また始めましょう。何について話しますか？', timestamp: Date.now() }]);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-between items-center border-b-2 border-showa-red pb-2 pl-16 md:pl-0">
         <div>
            <h2 className="text-2xl font-bold text-showa-brown tracking-widest">個人指導 (AI Tutor)</h2>
            <p className="text-xs text-showa-brown/60">昭和の先生が優しく教えます</p>
         </div>
         <div className="flex items-center gap-4">
             <ToggleSwitch 
                checked={useJapanese} 
                onChange={toggleLanguage}
                labelOff="解説(中)"
                labelOn="日本語のみ"
             />
             <Button variant="secondary" onClick={handleClear} className="text-xs px-3 py-1">
                 <RefreshCw size={14} className="mr-1"/> リセット
             </Button>
         </div>
      </div>

      <Frame className="flex-1 overflow-hidden flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {messages.map((msg, idx) => {
            if (msg.isSystemMessage) {
                return (
                    <div key={idx} className="flex justify-center my-2">
                        <span className="text-xs text-showa-brown/50 bg-showa-brown/5 px-2 py-1 rounded-full">{msg.text}</span>
                    </div>
                );
            }
            return (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full border-2 border-showa-brown flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-showa-blue text-white' : 'bg-showa-red text-white'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 border rounded-lg text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-showa-blue/10 border-showa-blue/30 text-showa-brown rounded-tr-none' 
                    : 'bg-showa-paper border-showa-red/30 text-showa-brown rounded-tl-none'
                }`}>
                  {msg.text}
                  {msg.role === 'model' && (
                      <button onClick={() => playTextToSpeech(msg.text)} className="block mt-2 text-showa-red/50 hover:text-showa-red" title="再生">
                          <span className="text-xs flex items-center gap-1">🔊 聞く</span>
                      </button>
                  )}
                </div>
              </div>
            </div>
          )})}
          
          {translating && (
             <div className="flex justify-center items-center py-4 text-showa-brown/60">
                <Loader2 className="animate-spin mr-2" size={16} />
                <span className="text-xs">翻訳中 (Translating)...</span>
             </div>
          )}

          {loading && !translating && (
            <div className="flex justify-start">
               <div className="bg-showa-paper border border-showa-red/30 p-3 rounded-lg rounded-tl-none ml-11">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-showa-red/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-showa-red/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-showa-red/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </Frame>

      <div className="flex gap-2 pt-2 z-30 relative pb-2">
        <JapaneseInput 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={useJapanese ? "日本語で話しかけてください..." : "質問や練習したい文章を入力..."}
          onEnter={handleSend}
          className="bg-white"
          disabled={translating}
        />
        <Button onClick={handleSend} disabled={loading || translating || !input.trim()}>
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
};

export default ChatTutor;