
import React, { useState, useEffect, useRef } from 'react';
import { Pedido, MensajeChat, ChatRoom, EstadoPedido } from '../types';
import { firebaseService } from '../services/firebaseService';
import { GoogleGenAI } from "@google/genai";

interface SeccionVentasProps {
  activeOrders: Pedido[];
}

const SeccionVentasView: React.FC<SeccionVentasProps> = ({ activeOrders }) => {
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | number | null>(null);
  const [currentChat, setCurrentChat] = useState<ChatRoom | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPedidoId) {
      const unsubscribe = firebaseService.subscribe(selectedPedidoId, (chat) => {
        setCurrentChat(chat);
        setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 50);
      });
      return unsubscribe;
    }
  }, [selectedPedidoId]);

  const handleSend = () => {
    if (!selectedPedidoId || !inputText.trim()) return;
    firebaseService.sendMessage(selectedPedidoId, 'ADMIN', 'Callcenter Plus', inputText, 'ADMIN');
    setInputText('');
  };

  const summarizeConversation = async () => {
    if (!currentChat || currentChat.mensajes.length === 0) return;
    setIsSummarizing(true);
    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      const conversation = currentChat.mensajes.map(m => `${m.emisorNombre}: ${m.texto}`).join('\n');
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Resume esta conversación de logística en 3 puntos clave: \n${conversation}`
      });
      setSummary(response.text || null);
    } catch (err) {
      setSummary("Error al procesar resumen.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6 animate-in fade-in duration-500 text-white">
      
      {/* Panel Izquierdo: Lista de Chats Activos (Callcenter Style) */}
      <div className="w-80 flex flex-col gap-4 bg-black/40 backdrop-blur-xl p-6 rounded-[3rem] border border-white/5 shadow-2xl">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-plus-blue mb-4">Terminal de Red</h3>
        <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
          {activeOrders.map(p => (
            <button 
              key={p.id}
              onClick={() => { setSelectedPedidoId(p.id); setSummary(null); }}
              className={`w-full p-5 rounded-2xl text-left border transition-all relative group ${selectedPedidoId === p.id ? 'bg-plus-blue border-plus-blue shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[8px] font-black uppercase opacity-40">Pedido #{p.id}</span>
                {(p.estado === EstadoPedido.EN_CAMINO || p.estado === (EstadoPedido as any).EN_CAMINO) && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10B981]"></span>}
              </div>
              <p className="text-[11px] font-black uppercase truncate tracking-tight">{p.nombreCliente}</p>
              <p className="text-[8px] opacity-40 mt-1 uppercase truncate italic">{p.detalles}</p>
            </button>
          ))}
          {activeOrders.length === 0 && <p className="text-center py-10 text-[9px] font-black opacity-10 uppercase tracking-widest">Sin actividad de red</p>}
        </div>
      </div>

      {/* Panel Central: Consola de Mensajería Live */}
      <div className="flex-1 flex flex-col bg-black rounded-[4rem] border border-white/5 shadow-3xl overflow-hidden">
        {selectedPedidoId ? (
          <>
            <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-plus-blue rounded-full flex items-center justify-center text-xl shadow-lg shadow-plus-blue/20">📡</div>
                <div>
                  <h4 className="text-lg font-black tracking-tighter italic uppercase">Intervención de Red</h4>
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Enlace Directo • Pedido #{selectedPedidoId}</p>
                </div>
              </div>
              <button 
                onClick={summarizeConversation}
                className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
              >
                {isSummarizing ? 'Escaneando...' : 'Resumen IA'}
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-6 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
              {summary && (
                <div className="bg-plus-blue/10 border border-plus-blue/20 p-8 rounded-[2rem] mb-8 animate-in slide-in-from-top duration-500">
                  <p className="text-[9px] font-black text-plus-blue uppercase tracking-widest mb-3 italic">Análisis Estratégico Gemini:</p>
                  <p className="text-xs font-bold text-white/80 leading-relaxed italic">"{summary}"</p>
                </div>
              )}

              {currentChat?.mensajes.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.tipo === 'ADMIN' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[70%] p-6 rounded-[2.2rem] shadow-xl text-xs font-bold leading-relaxed ${m.tipo === 'ADMIN' ? 'bg-plus-blue text-white' : 'bg-white/10 text-white border border-white/5'}`}>
                    {m.texto}
                  </div>
                  <span className="text-[7px] font-black text-white/20 uppercase mt-3 px-4 tracking-widest">
                    {m.emisorNombre} • {m.fechaHora}
                  </span>
                </div>
              ))}
              
              {currentChat?.estaEscribiendo && (
                <div className="flex items-center gap-2 opacity-30 px-4">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest">Alguien está escribiendo...</span>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-white/5 bg-white/5 flex gap-4">
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe comando de red..."
                className="flex-1 bg-white/5 border border-white/10 px-8 py-5 rounded-[2rem] font-black text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-plus-blue uppercase tracking-widest"
              />
              <button 
                onClick={handleSend}
                className="w-16 h-16 bg-plus-blue text-white rounded-full flex items-center justify-center text-xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-90 transition-all"
              >
                🚀
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-5 text-center p-20 grayscale">
            <div className="text-[15rem] mb-10">🏢</div>
            <p className="text-4xl font-black uppercase tracking-[0.4em] italic leading-tight">Terminal de <br/> Soporte Central</p>
          </div>
        )}
      </div>

      {/* Panel Derecho: Métricas de Conversión y Salud */}
      <div className="w-80 space-y-6">
        <div className="bg-white p-10 rounded-[4rem] text-black shadow-3xl overflow-hidden relative group">
          <p className="text-[9px] font-black text-black/20 uppercase tracking-[0.3em] mb-4 italic">Salud de Red</p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black italic tracking-tighter">99.2</span>
            <span className="text-plus-blue font-black text-xl">%</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-40">Tasa de resolución</p>
          <div className="absolute -bottom-6 -right-6 text-[10rem] opacity-5 pointer-events-none group-hover:scale-110 transition-transform">📉</div>
        </div>

        <div className="bg-black p-10 rounded-[4rem] border border-white/5 shadow-2xl">
          <p className="text-[9px] font-black text-plus-blue uppercase tracking-[0.3em] mb-6 underline">Operadores Online</p>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10B981]"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 italic">Admin Node Posadas</p>
            </div>
            <div className="flex items-center gap-4 opacity-30">
              <div className="w-2 h-2 bg-white/20 rounded-full"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 italic">Admin Node Garupá</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeccionVentasView;
