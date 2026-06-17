
import React, { useState, useRef, useEffect } from 'react';

const HybridSupportView: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hola, soy el agente de soporte premium. ¿En qué puedo ayudarte hoy?', sender: 'agent', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: 'Entendido. Estamos revisando tu caso con prioridad. Un momento por favor.',
        sender: 'agent',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-180px)] max-w-4xl mx-auto flex flex-col animate-in fade-in duration-700">
      <header className="bg-black text-white p-8 rounded-t-[3rem] flex justify-between items-center shadow-lg z-10">
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

      <div className="flex-1 bg-white border-x border-slate-100 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-50/50 no-scrollbar">
          {messages.map(m => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] p-5 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm ${
                m.sender === 'user' 
                  ? 'bg-plus-blue text-white rounded-br-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
              }`}>
                {m.text}
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
