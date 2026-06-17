
import React, { useState, useRef, useEffect } from 'react';

const HybridSupportView: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hola, soy el agente de soporte premium. ¿En qué puedo ayudarte hoy?', sender: 'agent', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [playingId, setPlayingId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const playVoice = async (id: number, text: string) => {
    setPlayingId(id);
    try {
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('ElevenLabs failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => setPlayingId(null);
      await audio.play();
    } catch (err) {
      console.warn('ElevenLabs API can/is not configured yet. Falling back to native SpeechSynthesis.');
      // Native SpeechSynthesis fallback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-AR';
        utterance.onend = () => setPlayingId(null);
        utterance.onerror = () => setPlayingId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingId(null);
      }
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newUserMsg = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');

    // Simulate agent response
    const agentMsgId = Date.now() + 1;
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: agentMsgId,
        text: 'Entendido. Estamos revisando tu caso con prioridad y coordinando con la flota de reparto. Un momento por favor.',
        sender: 'agent',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-180px)] max-w-4xl mx-auto flex flex-col animate-in fade-in duration-700">
      <header className="bg-black text-white p-8 rounded-t-[3rem] flex justify-between items-center shadow-lg z-10 w-full shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-plus-blue rounded-full flex items-center justify-center text-2xl font-black shadow-lg shadow-plus-blue/20">
            🎧
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter italic uppercase leading-none">Soporte <span className="text-plus-blue">Real</span></h2>
            <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mt-1">Comunicación Premium - Casos Urgentes</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-widest">Agente Online</span>
        </div>
      </header>

      <div className="flex-1 bg-white border-x border-slate-100 flex flex-col overflow-hidden min-h-0">
        <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-50/50 no-scrollbar">
          {messages.map(m => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-3 max-w-[80%] group">
                {m.sender === 'agent' && (
                  <button 
                    onClick={() => playVoice(m.id, m.text)}
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs border transition-all ${playingId === m.id ? 'bg-amber-100 border-amber-300 text-amber-700 animate-pulse' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500'}`}
                    title="Escuchar respuesta"
                  >
                    {playingId === m.id ? '⚡' : '🔊'}
                  </button>
                )}
                <div className={`p-5 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm ${
                  m.sender === 'user' 
                    ? 'bg-plus-blue text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase mt-2 px-2">{m.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-b-[3rem] border border-t-0 border-slate-100 shadow-sm flex gap-4">
        <input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escribe tu mensaje urgente aquí..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-[2rem] py-4 px-8 text-sm font-medium focus:outline-none focus:border-plus-blue focus:ring-1 focus:ring-plus-blue transition-all"
        />
        <button 
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="w-14 h-14 bg-black disabled:bg-slate-300 text-white rounded-full flex items-center justify-center text-xl shadow-lg hover:scale-105 transition-all"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default HybridSupportView;
