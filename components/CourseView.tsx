
import React from 'react';
import { Book, ScrollText, BrainCircuit, PlayCircle } from 'lucide-react';
import { Unit } from '../types';
import { Card } from './RetroComponents';

interface CourseViewProps {
  onSelectTopic: (type: 'VOCAB' | 'GRAMMAR' | 'QUIZ', topic: string) => void;
  onStartUnit: (unit: Unit) => void;
}

const units: Unit[] = [
  {
    id: 1,
    title: "はじめまして (Nice to meet you)",
    description: "Learn basic greetings and how to introduce yourself.",
    vocabTopic: "Japanese Greetings, Self-Introduction, Yes/No",
    grammarTopic: "Japanese Particle Wa and Desu (A wa B desu)",
  },
  {
    id: 2,
    title: "これ・それ・あれ (This/That)",
    description: "Pointing at things and asking what they are.",
    vocabTopic: "Japanese Demonstratives (Kore/Sore/Are) and Basic Classroom Objects",
    grammarTopic: "Japanese Demonstratives (Kore/Sore/Are) usage",
  },
  {
    id: 3,
    title: "おいしいですね (Adjectives)",
    description: "Describing things using I-Adjectives and Na-Adjectives.",
    vocabTopic: "Japanese Common Adjectives (Oishii, Takai, Genki, Kirei)",
    grammarTopic: "Japanese Adjectives (I-adj and Na-adj) Present Tense",
  },
  {
    id: 4,
    title: "たべます・のみます (Verbs)",
    description: "Daily actions and basic verb conjugation.",
    vocabTopic: "Japanese Basic Verbs (Eat, Drink, Go, See) and Daily Objects",
    grammarTopic: "Japanese Masu-form Verbs and Object Particle O",
  },
  {
    id: 5,
    title: "どこですか (Existence & Location)",
    description: "Asking where things are and stating existence.",
    vocabTopic: "Japanese Locations (Bank, Station, School) and Position words (Ue, Shita)",
    grammarTopic: "Japanese Existence Verbs (Imasu/Arimasu) and Particle Ni",
  },
  {
    id: 6,
    title: "今、何時ですか (Time & Dates)",
    description: "Days of the week, telling time, and making appointments.",
    vocabTopic: "Japanese Days of the Week (Getsuyoubi-Nichiyoubi), Time Hours/Minutes, Today/Tomorrow",
    grammarTopic: "Japanese Time Particle (Ni), From/To (Kara/Made), Asking 'Nanji'",
  },
  {
    id: 7,
    title: "いくらですか (Shopping & Counters)",
    description: "Buying things, asking prices, and counting objects.",
    vocabTopic: "Shopping, Money, Basic Counters (tsu, mai, hon, satsu)",
    grammarTopic: "Japanese Counters usage and Asking Price (Ikura)",
  },
  {
    id: 8,
    title: "日本へ行きます (Movement)",
    description: "Talking about going, coming, and returning to places.",
    vocabTopic: "Vehicles (Train, Bus, Car), Places (Station, Company, Home)",
    grammarTopic: "Movement Verbs (Ikimusu, Kimasu) and Particle 'e' (Direction) / 'de' (Means)",
  },
  {
    id: 9,
    title: "一緒に見ませんか (Invitations)",
    description: "Inviting someone to do something and suggesting activities.",
    vocabTopic: "Entertainment (Movies, Sports, Coffee), Weekend Activities",
    grammarTopic: "Verb Invitations (Masenka) and Suggestions (Mashou)",
  },
  {
    id: 10,
    title: "プレゼントをあげます (Giving)",
    description: "Giving and receiving gifts (simplest polite forms).",
    vocabTopic: "Gifts (Flowers, Chocolate), Occasions (Birthday, Christmas), Family",
    grammarTopic: "Giving and Receiving Verbs (Agemasu, Moraimasu)",
  },
  {
    id: 11,
    title: "日本のほうが暑いです (Comparison)",
    description: "Comparing two items and superlatives.",
    vocabTopic: "Seasons, Weather, World Geography, Popular Sports",
    grammarTopic: "Japanese Comparison (Yori / Hou ga) and Superlative (Ichiban)",
  },
  {
    id: 12,
    title: "日本へ行きたいです (Desire)",
    description: "Expressing what you want to do or want to have.",
    vocabTopic: "Hobbies, Dreams, Travel Destinations, Things you want",
    grammarTopic: "Verb stem + tai (Desire) and Noun + ga hoshii",
  },
  {
    id: 13,
    title: "書いてください (Requests & Te-form)",
    description: "Introduction to the important Te-form and making requests.",
    vocabTopic: "Common Action Verbs (Write, Stand, Sit, Open, Close)",
    grammarTopic: "Japanese Verb Te-form conjugation and 'Te kudasai' (Request)",
  },
  {
    id: 14,
    title: "今、食べています (Progressive)",
    description: "Describing what you are doing right now.",
    vocabTopic: "Daily Routine Actions (Eating, Sleeping, Working, Waiting)",
    grammarTopic: "Te-form + imasu (Present Progressive)",
  },
  {
    id: 15,
    title: "写真を撮ってもいいですか (Permission)",
    description: "Asking for permission and stating rules.",
    vocabTopic: "Public Rules, Forbidden Actions, Places (Museum, Library)",
    grammarTopic: "Permission (Te mo ii desu ka) and Prohibition (Te wa ikemasen)",
  },
  {
    id: 16,
    title: "趣味は読書です (Dictionary Form)",
    description: "Talking about hobbies and things you can do.",
    vocabTopic: "Hobbies (Reading, Swimming, Music), Skills",
    grammarTopic: "Dictionary Form usage: Koto ga dekimasu (Can do) and Shumi wa ~ desu",
  },
  {
    id: 17,
    title: "馬に乗ったことがあります (Experience)",
    description: "Describing things you have done in the past.",
    vocabTopic: "Unusual Experiences (Climbing Fuji, Horse Riding, Eating Natto)",
    grammarTopic: "Ta-form + koto ga arimasu (Past Experience)",
  },
  {
    id: 18,
    title: "ここで写真を撮らないで (Nai Form)",
    description: "Asking someone not to do something and obligations.",
    vocabTopic: "Signs, Rules, Health instructions",
    grammarTopic: "Nai-form conjugation and 'Naide kudasai' (Please don't) / 'Nakereba narimasen' (Must)",
  },
  {
    id: 19,
    title: "明日は雨でしょう (Forecasts)",
    description: "Talking about probability and making guesses.",
    vocabTopic: "Weather Forecast, Future events, Sports results",
    grammarTopic: "Deshou / Kamoshiremasen (Probability)",
  },
  {
    id: 20,
    title: "うん、食べる (Casual Speech)",
    description: "Introduction to Plain Form and casual conversations.",
    vocabTopic: "Casual conversation fillers, Family/Friends dialogue",
    grammarTopic: "Plain Form (Casual Style) vs Polite Style",
  },
  {
    id: 21,
    title: "日本は高いと思います (Opinions)",
    description: "Expressing your thoughts and opinions.",
    vocabTopic: "Social Issues, Prices, Impressions of Japan",
    grammarTopic: "Plain Form + to omoimasu (I think that...)",
  },
  {
    id: 22,
    title: "眼鏡をかけている人 (Relative Clauses)",
    description: "Describing people or things using verb phrases.",
    vocabTopic: "Clothing, Accessories, Physical Descriptions",
    grammarTopic: "Modifying Nouns with Verbs (Relative Clauses)",
  },
  {
    id: 23,
    title: "寝る前に、歯を磨きます (Sequence)",
    description: "Describing the order of actions.",
    vocabTopic: "Night routine, Cooking steps, Usage instructions",
    grammarTopic: "Mae ni (Before), Ato de (After), Toki (When)",
  },
  {
    id: 24,
    title: "お金があったら (Conditionals)",
    description: "Talking about 'If' and hypothetical situations.",
    vocabTopic: "Dreams, Lotto, Travel plans, Trouble",
    grammarTopic: "Tara form (If/When) condition",
  },
  {
    id: 25,
    title: "どうしてですか (Reasons)",
    description: "Explaining reasons and causes.",
    vocabTopic: "Excuses for being late, Sickness, Accidents",
    grammarTopic: "Kara vs Node (Because/So)",
  }
];

const CourseView: React.FC<CourseViewProps> = ({ onSelectTopic, onStartUnit }) => {
  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-end border-b-2 border-showa-red pb-2 pl-16 md:pl-0">
        <div>
          <h2 className="text-3xl font-bold text-showa-brown tracking-widest">初級カリキュラム</h2>
          <p className="text-xs text-showa-brown/60">ゼロから始める日本語学習コース (JLPT N5/N4 Start)</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-20 pr-2">
        {units.map((unit) => (
          <div key={unit.id} className="relative">
             {/* Timeline line */}
             <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-showa-brown/20 -z-10 last:bottom-auto last:h-full"></div>
             
             <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-showa-red text-white flex items-center justify-center font-bold shrink-0 border-2 border-white shadow-sm mt-4">
                    {unit.id}
                </div>
                
                <Card className="flex-1 flex flex-col gap-4">
                   <div className="flex justify-between items-start">
                       <div>
                           <h3 className="text-xl font-bold text-showa-brown">{unit.title}</h3>
                           <p className="text-sm text-showa-brown/70">{unit.description}</p>
                       </div>
                   </div>

                   {/* Primary Action: Start Unit (Skit/Overview) */}
                   <button 
                      onClick={() => onStartUnit(unit)}
                      className="w-full flex items-center justify-center gap-2 bg-showa-brown text-white py-2 rounded shadow hover:bg-showa-red transition-colors text-sm font-bold"
                   >
                      <PlayCircle size={18} /> 授業開始 (Start Lesson)
                   </button>

                   <div className="border-t border-dashed border-showa-brown/20 pt-2 flex flex-wrap gap-2 justify-between">
                       <button 
                         onClick={() => onSelectTopic('VOCAB', unit.vocabTopic)}
                         className="flex items-center gap-1 text-xs text-showa-blue hover:underline"
                       >
                           <Book size={12} /> 単語帳
                       </button>
                       <button 
                         onClick={() => onSelectTopic('GRAMMAR', unit.grammarTopic)}
                         className="flex items-center gap-1 text-xs text-showa-brown hover:underline"
                       >
                           <ScrollText size={12} /> 文法解説
                       </button>
                       <button 
                         onClick={() => onSelectTopic('QUIZ', unit.vocabTopic)}
                         className="flex items-center gap-1 text-xs text-showa-red hover:underline"
                       >
                           <BrainCircuit size={12} /> テスト
                       </button>
                   </div>
                </Card>
             </div>
          </div>
        ))}
        
        <div className="flex gap-4 opacity-50 pb-8">
             <div className="w-8 h-8 rounded-full bg-showa-brown/20 text-white flex items-center justify-center font-bold shrink-0 border-2 border-white mt-4">
                 <span className="text-xs">N4</span>
             </div>
             <div className="p-4 border-2 border-dashed border-showa-brown/20 rounded w-full flex items-center justify-center text-showa-brown/50">
                 <span className="text-sm">End of Basic Course. Intermediate lessons coming soon...</span>
             </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;
