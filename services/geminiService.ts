
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VocabularyItem, ChatMessage, QuizQuestion, GrammarExplanation, UnitContent } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Content Cache to speed up the app
const contentCache = new Map<string, any>();

// Audio Cache and Context Singleton
const audioCache = new Map<string, AudioBuffer>();
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return audioContext;
};

// Helper to decode audio
const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const generateVocabularyList = async (topic: string, count: number = 10): Promise<VocabularyItem[]> => {
  const cacheKey = `vocab_${topic}_${count}`;
  if (contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey) as VocabularyItem[];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} Japanese vocabulary words related to the topic: "${topic}". 
      Return the response strictly as a JSON array. 
      Keep example sentences concise to ensure the response fits within the output limit.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              kanji: { type: Type.STRING, description: "The word in Kanji (or Hiragana/Katakana if usually written that way)" },
              furigana: { type: Type.STRING, description: "Reading in Hiragana" },
              romaji: { type: Type.STRING, description: "Romaji pronunciation" },
              meaning: { type: Type.STRING, description: "Meaning in Traditional Chinese" },
              exampleSentence: { type: Type.STRING, description: "A short example sentence in Japanese" }
            },
            required: ["kanji", "furigana", "romaji", "meaning", "exampleSentence"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    const result = JSON.parse(text) as VocabularyItem[];
    contentCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error generating vocabulary:", error);
    return [];
  }
};

export const generateQuiz = async (topic: string, type: 'VOCABULARY' | 'GRAMMAR'): Promise<QuizQuestion[]> => {
  const cacheKey = `quiz_${type}_${topic}`;
  // For quizzes, we might want freshness, but for speed complaint, let's cache for session
  if (contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey) as QuizQuestion[];
  }

  try {
    const prompt = type === 'VOCABULARY' 
      ? `Generate 3 multiple-choice questions to test Japanese vocabulary related to "${topic}". The options should be meanings in Traditional Chinese or readings.`
      : `Generate 3 multiple-choice questions to test the Japanese grammar concept: "${topic}". Focus on usage and particles.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The quiz question text" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "4 possible answers"
              },
              correctAnswerIndex: { type: Type.INTEGER, description: "Index of the correct answer (0-3)" },
              explanation: { type: Type.STRING, description: "Brief explanation of the correct answer in Traditional Chinese" }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    const result = JSON.parse(text) as QuizQuestion[];
    contentCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};

export const generateGrammarExplanation = async (topic: string): Promise<GrammarExplanation | null> => {
  const cacheKey = `grammar_${topic}`;
  if (contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey) as GrammarExplanation;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Explain the Japanese grammar concept "${topic}" for a beginner student. Provide the explanation in Traditional Chinese.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            explanation: { type: Type.STRING, description: "Detailed explanation in Markdown format (Traditional Chinese)" },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  japanese: { type: Type.STRING },
                  reading: { type: Type.STRING },
                  meaning: { type: Type.STRING, description: "Meaning in Traditional Chinese" }
                }
              }
            }
          },
          required: ["title", "explanation", "examples"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    const result = JSON.parse(text) as GrammarExplanation;
    contentCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error generating grammar:", error);
    return null;
  }
};

export const generateUnitContent = async (vocabTopic: string, grammarTopic: string): Promise<UnitContent | null> => {
  const cacheKey = `unit_${vocabTopic}_${grammarTopic}`;
  if (contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey) as UnitContent;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a comprehensive Japanese lesson unit based on Vocab: "${vocabTopic}" and Grammar: "${grammarTopic}".
      1. Create a dialogue (A/B conversation) demonstrating these concepts naturally.
      2. List 4-5 key sentences from the dialogue.
      3. Write a 'Grammar Note' explaining the main grammar point simply in Traditional Chinese.
      Output in Traditional Chinese.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A creative title for this lesson" },
            intro: { type: Type.STRING, description: "A brief intro/summary in Chinese" },
            grammarNote: { type: Type.STRING, description: "A concise explanation of the grammar point in Traditional Chinese" },
            dialogue: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING, enum: ["A", "B"] },
                  japanese: { type: Type.STRING },
                  reading: { type: Type.STRING },
                  meaning: { type: Type.STRING }
                }
              }
            },
            keySentences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  japanese: { type: Type.STRING },
                  reading: { type: Type.STRING },
                  meaning: { type: Type.STRING }
                }
              }
            }
          },
          required: ["title", "intro", "grammarNote", "dialogue", "keySentences"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    const result = JSON.parse(text) as UnitContent;
    contentCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error generating unit content:", error);
    return null;
  }
};

export const getChatResponse = async (history: ChatMessage[], message: string, useJapanese: boolean): Promise<string> => {
  try {
    const languageInstruction = useJapanese
      ? "IMPORTANT: You MUST speak ONLY in Japanese. Do not use Chinese or English. If the user speaks another language, reply in Japanese."
      : "IMPORTANT: You MUST explain in Traditional Chinese (繁體中文). Use Japanese only for examples or specific phrases.";

    const systemInstruction = `You are a Japanese teacher from the Showa era (1926-1989). Your tone is warm, nostalgic, and encouraging.
    ${languageInstruction}
    Respond to the user's latest message.`;

    const validHistory = history.filter(h => !h.isSystemMessage);

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction,
      },
      history: validHistory.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || (useJapanese ? "すみません、もう一度お願いします。" : "抱歉，請再說一次。");
  } catch (error) {
    console.error("Chat error:", error);
    return useJapanese ? "エラーが発生しました。" : "發生錯誤，請稍後再試。";
  }
};

export const translateChatHistory = async (history: ChatMessage[], targetLang: 'JAPANESE' | 'CHINESE'): Promise<ChatMessage[]> => {
  if (history.length === 0) return [];

  try {
    const messagesToTranslate = history.filter(h => !h.isSystemMessage);

    if (messagesToTranslate.length === 0) return history;

    const prompt = `Translate the following conversation history to ${targetLang === 'JAPANESE' ? 'natural Japanese' : 'Traditional Chinese (繁體中文)'}.
    Keep the meaning intact but adapt the tone to be appropriate (polite/teacher-student).
    
    Input JSON: ${JSON.stringify(messagesToTranslate)}
    
    Return ONLY a JSON array of objects with 'role', 'text', and 'timestamp' properties. Do not change the role or timestamp. Only translate the 'text'.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.ARRAY,
           items: {
             type: Type.OBJECT,
             properties: {
               role: { type: Type.STRING },
               text: { type: Type.STRING },
               timestamp: { type: Type.NUMBER }
             }
           }
        }
      }
    });

    const translatedMessages = JSON.parse(response.text || '[]') as ChatMessage[];
    return translatedMessages;

  } catch (error) {
    console.error("Translation error:", error);
    return history;
  }
};

export const playTextToSpeech = async (text: string): Promise<void> => {
  if (!text) return;
  
  // 1. Check Cache
  const outputAudioContext = getAudioContext();
  
  // Resume context if suspended (browser autoplay policy)
  if (outputAudioContext.state === 'suspended') {
    await outputAudioContext.resume();
  }

  // Use a simplified key for caching (trim and lowercase)
  const cacheKey = text.trim();
  
  if (audioCache.has(cacheKey)) {
    const cachedBuffer = audioCache.get(cacheKey)!;
    const source = outputAudioContext.createBufferSource();
    source.buffer = cachedBuffer;
    source.connect(outputAudioContext.destination);
    source.start();
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );
    
    // 2. Save to Cache
    audioCache.set(cacheKey, audioBuffer);

    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    source.start();

  } catch (error) {
    console.error("TTS Error:", error);
  }
};

export const getKanjiSuggestion = async (input: string): Promise<string | null> => {
  if (!input || input.length < 2) return null;
  const cacheKey = `kanji_conv_${input.toLowerCase()}`;
  if (contentCache.has(cacheKey)) return contentCache.get(cacheKey);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Convert the English/Romaji text "${input}" to the most likely Japanese Word (Kanji/Kana). 
      Return strictly just the word as a string. No explanation.`,
    });
    const text = response.text?.trim();
    if (text) contentCache.set(cacheKey, text);
    return text || null;
  } catch (e) {
    return null;
  }
};
