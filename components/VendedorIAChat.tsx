import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';

interface Message {
  id: string;
  sender: 'client' | 'vendedor';
  text: string;
  time: string;
  audioUrl?: string;
  voiceProfile?: string;
}

const VendedorIAChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'vendedor',
      text: '¡Buenas! ¿Cómo va todo, che? Soy Carlos de Delivery Plus. Contame, ¿qué andás necesitando para la logística de tu negocio en Posadas?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      voiceProfile: 'carlos'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [voiceProfile, setVoiceProfile] = useState<'carlos' | 'agustina' | 'vendedor_bot'>('carlos');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingId, setIsPlayingId] = useState<string | null>(null);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiResponding]);

  // Inicializar Reconocimiento de Voz del Navegador (Speech-to-Text)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'es-AR';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText) {
          setInputValue(prev => prev ? prev + ' ' + resultText : resultText);
        }
      };

      rec.onerror = (e: any) => {
        console.error('Speech Recognition Error:', e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta entrada por voz en esta sección. Te recomendamos usar Google Chrome o Microsoft Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const playVoiceMessage = async (msgId: string, text: string, profile: 'carlos' | 'agustina' | 'vendedor_bot') => {
    setIsPlayingId(msgId);
    try {
      // Llamar al proxy del servidor /api/elevenlabs/tts
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceProfile: profile })
      });

      if (!response.ok) {
        throw new Error('Server TTS proxy response error');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => setIsPlayingId(null);
      await audio.play();
    } catch (err) {
      console.warn('Azure Speech API no cargada o error. Usando síntesis nativa.');
      // Fallback a speech synthesis nativa
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-AR';
        utterance.onend = () => setIsPlayingId(null);
        utterance.onerror = () => setIsPlayingId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingId(null);
      }
    }
  };

  // Enviar mensaje al Vendedor IA (con acento argentino re caricaturesco y simpático)
  const handleSendMessage = async (textToSend?: string) => {
    const finalMsg = textToSend || inputValue;
    if (!finalMsg.trim() || isAiResponding) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'client',
      text: finalMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsAiResponding(true);

    try {
      // Armar historial compatible con Gemini
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `
        Eres el Vendedor Estrella de Delivery Plus en la ciudad de Posadas, Misiones, Argentina.
        Tu nombre depende del perfil activo: Carlos, Agustina o el Vendedor Bot (actúas según el perfil).
        Si el perfil es Carlos o Vendedor Bot, eres un tipo macanudo, conversador, muy simpático y extremadamente vendedor.
        Si el perfil es Agustina, eres una vendedora joven, súper pila, atenta y ejecutiva.
        
        CRÍTICO: Usa un acento y modismo argentino súper marcado (es-AR). Emplea palabras como "che", "viste", "mirá", "re", "posta", "che, escuchá", "para nada", "tenés", "podés", "qué onda", "boludo" (solo si es en confianza sana), "laburo", "flete", "reparto", "comercio", etc.
        
        Ofrece planes logísticos con toda la actitud ganadora misionera de Posadas:
        - Moto Express: un caño, envíos en media hora en todo Posadas por sólo $5000 el viaje.
        - Flota Cargo: ideal para bultos más pesados por $15000.
        - Plan Diamante: una suscripción mensual fija con prioridad absoluta para los negocios más pilas de la provincia.
        
        SÉ CONCISO. Máximo 2 o 3 frases cortas por respuesta para que el audio no sea eterno y suene sumamente natural.
        No hables como un robot ni des explicaciones enciclopédicas. Sé directo, entrador y vende con el corazón misionero.
      `;

      // Formatear mensajes previos
      const conversationHistory = messages.slice(-6).map(m => ({
        role: m.sender === 'client' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      conversationHistory.push({
        role: 'user',
        parts: [{ text: finalMsg }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: conversationHistory as any,
        config: {
          systemInstruction,
          temperature: 0.8
        }
      });

      const aiText = response.text || 'Che, no te escuché bien. ¿Me lo repetís, porfa?';
      
      const newAiMsgId = `ai-${Date.now()}`;
      const aiMsg: Message = {
        id: newAiMsgId,
        sender: 'vendedor',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        voiceProfile: voiceProfile
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsAiResponding(false);

      if (autoPlay) {
        await playVoiceMessage(newAiMsgId, aiText, voiceProfile);
      }
    } catch (error) {
      console.error('Gemini Error in Vendedor Chat:', error);
      
      // Fallback simpático si falla Gemini
      const fallbackReplies = [
        "¡Che, mirá! La red está más cargada que la Costanera en verano, pero te re confirmo que nuestros fletes son lo más rápido de Posadas. ¿Te anoto con el Moto Express?",
        "Posta que me quedé sin señal un segundo, pero decime, ¿querés que un repartidor vaya hoy mismo a tu comercio?",
        "Che, qué viaje, se me cortó un segundo. Pero como te decía, con Delivery Plus tu negocio vuela en Posadas. ¿Laburás con envíos a domicilio?"
      ];
      
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      const newAiMsgId = `ai-fb-${Date.now()}`;

      const aiMsg: Message = {
        id: newAiMsgId,
        sender: 'vendedor',
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        voiceProfile: voiceProfile
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsAiResponding(false);

      if (autoPlay) {
        await playVoiceMessage(newAiMsgId, randomReply, voiceProfile);
      }
    }
  };

  return (
    <div className="bg-white rounded-[3.5rem] border border-black/5 shadow-2xl overflow-hidden flex flex-col h-[600px] w-full max-w-4xl mx-auto mt-6 animate-in fade-in duration-500">
      {/* Header del Chat */}
      <header className="bg-black text-white p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center border-b border-white/5 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
            🎙️
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-tight">Vendedor Digital Pro</h3>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">● Inteligencia Artificial es-AR</p>
          </div>
        </div>

        {/* Configuración de voces / perfiles */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Perfil de voz:</label>
          <div className="bg-white/5 border border-white/10 p-1 rounded-2xl flex gap-1">
            <button
              onClick={() => setVoiceProfile('carlos')}
              className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-xl transition-all ${voiceProfile === 'carlos' ? 'bg-plus-blue text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Carlos 🙋‍♂️
            </button>
            <button
              onClick={() => setVoiceProfile('agustina')}
              className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-xl transition-all ${voiceProfile === 'agustina' ? 'bg-plus-blue text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Agustina 🙋‍♀️
            </button>
            <button
              onClick={() => setVoiceProfile('vendedor_bot')}
              className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-xl transition-all ${voiceProfile === 'vendedor_bot' ? 'bg-plus-blue text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Bot 🤖
            </button>
          </div>

          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${autoPlay ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
            title="Auto-reproducir respuesta al llegar"
          >
            {autoPlay ? '🔊 Voz On' : '🔇 Silencio'}
          </button>
        </div>
      </header>

      {/* Historial de Mensajes */}
      <div 
        ref={scrollRef}
        className="flex-1 bg-slate-50 p-6 md:p-8 overflow-y-auto space-y-6 no-scrollbar"
      >
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.sender === 'client' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-3 max-w-[85%]">
              
              {/* Botón de reproducción en mensajes de la IA */}
              {m.sender === 'vendedor' && (
                <button
                  onClick={() => playVoiceMessage(m.id, m.text, (m.voiceProfile as any) || voiceProfile)}
                  disabled={isPlayingId === m.id}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all pointer-events-auto ${isPlayingId === m.id ? 'bg-amber-100 border-amber-300 text-amber-700 animate-pulse' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 shadow-sm'}`}
                  title="Reproducir con voz argentina"
                >
                  {isPlayingId === m.id ? '⚡' : '🔊'}
                </button>
              )}

              <div className={`p-5 rounded-[2rem] text-xs font-bold leading-relaxed shadow-sm ${
                m.sender === 'client'
                  ? 'bg-plus-blue text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
              }`}>
                {m.text}
              </div>
            </div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mt-2.5 px-2">
              {m.sender === 'client' ? 'Cliente (Vos)' : `${m.voiceProfile?.toUpperCase()} (IA)`} • {m.time}
            </span>
          </div>
        ))}

        {isAiResponding && (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-xs">💬</div>
            <div className="p-4 bg-slate-200 rounded-[2rem] rounded-bl-none text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Che, esperá un toque que estoy pensando...
            </div>
          </div>
        )}
      </div>

      {/* Input de Control */}
      <footer className="p-6 bg-white border-t border-slate-100 flex gap-4 items-center">
        {/* Grabado por voz (Micrófono) */}
        <button
          onClick={toggleRecording}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white shadow-lg animate-pulse scale-105' : 'bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600'}`}
          title={isRecording ? 'Detener grabación de voz' : 'Grabar mensaje por voz (Speech to Text)'}
        >
          <span className="text-xl">{isRecording ? '⏹️' : '🎙️'}</span>
        </button>

        {/* Input de texto */}
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          placeholder={isRecording ? 'Escuchando tu voz, che...' : 'Escribile algo en argentino al vendedor...'}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-6 py-4 text-xs font-bold text-black focus:ring-2 focus:ring-plus-blue/20 focus:outline-none placeholder-slate-400"
          disabled={isRecording}
        />

        {/* Botón de envío */}
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim() || isAiResponding}
          className="bg-black hover:bg-emerald-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:hover:bg-black"
        >
          <span className="text-lg">➔</span>
        </button>
      </footer>
    </div>
  );
};

export default VendedorIAChat;
