import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, MessageSquare, Bot, AlertTriangle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ia';
  text: string;
  time: string;
}

type IARole = 'COMERCIO' | 'EMPRENDEDOR' | 'REPARTIDOR';

export const AssistantIAView: React.FC = () => {
  const [activeRole, setActiveRole] = useState<IARole>('COMERCIO');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const speakWithAzure = async (text: string, voiceProfile: 'carlos' | 'agustina' | 'vendedor_bot' = 'carlos') => {
    try {
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceProfile })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        await audio.play();
      } else {
        throw new Error();
      }
    } catch (err) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-AR';
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const initMessages = {
    COMERCIO: "Hola. Soy el Asesor Comercial Profesional de Delivery Plus. ¿En qué te puedo ayudar hoy con respecto a tus turnos, dudas o la creación de un nuevo pedido?",
    EMPRENDEDOR: "¡Hola! Soy tu Asistente de Envíos. Estoy acá para ayudarte a armar tus pedidos y explicarte cómo funciona nuestra logística. ¿Qué necesitas enviar hoy?",
    REPARTIDOR: "¡Buenas! Soy tu Coach de Logística. Estoy acá para asesorarte sobre cómo maximizar tus ganancias, entender el sistema de niveles y organizar tus pagos. ¿En qué te ayudo?"
  };

  useEffect(() => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'ia',
        text: initMessages[activeRole],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [activeRole]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiResponding]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'es-AR';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => setIsRecording(true);
      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText) setInputValue(prev => prev ? prev + ' ' + resultText : resultText);
      };
      rec.onerror = (e: any) => {
        console.error('Speech Recognition Error:', e);
        setIsRecording(false);
      };
      rec.onend = () => setIsRecording(false);

      recognitionRef.current = rec;
    }
  }, []);

  const [isDaytimeState, setIsDaytimeState] = useState(true);
  useEffect(() => {
    const currentHour = new Date().getHours();
    setIsDaytimeState(currentHour >= 6 && currentHour < 22);
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta entrada por voz en esta sección. Te recomendamos usar Google Chrome o Microsoft Edge.');
      return;
    }
    if (isRecording) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

  const handleSendMessage = async () => {
    const finalMsg = inputValue;
    if (!finalMsg.trim() || isAiResponding) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: finalMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsAiResponding(true);

    try {
      const isDaytime = new Date().getHours() >= 6 && new Date().getHours() < 22;
      const horarioInstruccion = isDaytime 
        ? "Horario Diurno Activo. Añade a tu personalidad: Comercial, Cercana, Proactiva." 
        : "Horario Nocturno Activo. Añade a tu personalidad: Operativa, Clara, Directa.";

      let systemInstruction = "";
      if (activeRole === 'COMERCIO') {
        systemInstruction = `
          Eres IA COMERCIO. Tu personalidad es: Asesor comercial profesional.
          ${horarioInstruccion}
          Objetivos: Resolver dudas, recomendar repartidores, recomendar turnos para despachos y ayudar a crear pedidos.
          PROHIBICIONES ESTRICTAS: ¡Nunca tomes decisiones por el usuario! Tienes estrictamente prohibido inventar precios, inventar políticas de la empresa, o prometer descuentos. 
          Hablas en tono profesional, claro y asistiendo al comercio de Misiones, Argentina. Solo recomiendas y guías.
        `;
      } else if (activeRole === 'EMPRENDEDOR') {
        systemInstruction = `
          Eres IA EMPRENDEDOR. Tu personalidad es: Asistente de envíos.
          ${horarioInstruccion}
          Objetivos: Crear pedidos, explicar costos de la plataforma Delivery Plus y recomendar opciones para empaques y destinos.
          PROHIBICIONES ESTRICTAS: ¡Nunca tomes decisiones! La IA no decide, solo recomienda, explica, guía y asiste.
          Hablas en tono amigable, claro y resolutivo para negocios en crecimiento en Misiones.
        `;
      } else if (activeRole === 'REPARTIDOR') {
        systemInstruction = `
          Eres IA REPARTIDOR. Tu personalidad es: Coach profesional de logística.
          ${horarioInstruccion}
          Objetivos: Explicar cómo funcionan los ingresos y métodos de pago, explicar el sistema de niveles (Bronce, Plata, Oro, Diamante) y recomendar estrategias y oportunidades para optimizar tiempos.
          PROHIBICIONES ESTRICTAS: ¡Nunca tomes decisiones! Solo aconsejas y mentoreas al repartidor sobre las reglas logísticas, nunca adjudicas pagos o viajes por ti mismo.
          Hablas como un coach motivador y experimentado.
        `;
      }

      const conversationHistory = [...messages.slice(-6), userMsg];

      // Request to backend instead of local SDK
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          systemInstruction
        })
      });

      if (!res.ok) {
        throw new Error('Error de conexión con el proxy de Gemini');
      }
      
      const data = await res.json();
      const aiText = data.text || 'Ocurrió un error en la red neuronal.';
      
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ia',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      speakWithAzure(aiText, activeRole === 'COMERCIO' ? 'carlos' : (activeRole === 'EMPRENDEDOR' ? 'agustina' : 'vendedor_bot'));
    } catch (error) {
      console.error('Gemini Error in IA Assistant:', error);
      
      const aiMsg: Message = {
        id: `ai-error-${Date.now()}`,
        sender: 'ia',
        text: "Error de conexión temporal. Asegúrate de que el backend de IA esté activo. Solo recomiendo y asisto, pero mi conexión principal falló.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsAiResponding(false);
    }
  };

  return (
    <div className="dp-card p-8 lg:p-12 animate-in slide-in-from-bottom-5 duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="px-3 py-1 bg-dp-surfaceLight text-dp-text font-black text-[8px] uppercase tracking-[0.2em] rounded-md border border-dp-border">
            Capítulo 8 • IA Delivery Plus
          </span>
          <h2 className="text-4xl lg:text-6xl font-poppins font-black tracking-tighter leading-none mt-4 uppercase">
            El poder de <span className="text-dp-primary">recomendar</span>
          </h2>
          <p className="text-dp-textMuted mt-3 text-sm font-bold uppercase tracking-widest">
            La IA guía. La IA asiste. <strong className="text-dp-danger">La IA nunca decide.</strong>
          </p>
        </div>

        {/* Role Selector */}
        <div className="bg-dp-surfaceLight p-2 rounded-2xl flex border border-dp-border shadow-inner">
           {(['COMERCIO', 'EMPRENDEDOR', 'REPARTIDOR'] as IARole[]).map(r => (
             <button 
               key={r}
               onClick={() => setActiveRole(r)}
               className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeRole === r 
                 ? 'bg-dp-primary text-white shadow-md' 
                 : 'text-dp-textMuted hover:text-white'
               }`}
             >
               IA {r}
             </button>
           ))}
        </div>
      </header>

      {/* Constraints Banner */}
      <div className="mb-8 p-5 bg-dp-primary/10 border border-dp-primary/20 rounded-3xl flex gap-4 mt-2">
         <Bot className="text-dp-primary shrink-0 mt-1" size={24} />
         <div>
            <h4 className="text-xs font-black text-dp-text uppercase tracking-widest">
               Personalidad Activa: {
                 activeRole === 'COMERCIO' ? 'Asesor Comercial Profesional' : 
                 activeRole === 'EMPRENDEDOR' ? 'Asistente de Envíos' : 
                 'Coach Profesional de Logística'
               }
            </h4>
            <p className="text-[10px] mt-2 font-bold text-dp-textMuted uppercase leading-relaxed">
               {activeRole === 'COMERCIO' && "Objetivos: Resolver dudas, Recomendar repartidores, Recomendar turnos, Ayudar a crear pedidos. Prohibiciones: Inventar precios o políticas, prometer descuentos."}
               {activeRole === 'EMPRENDEDOR' && "Objetivos: Crear pedidos, Explicar costos, Recomendar opciones."}
               {activeRole === 'REPARTIDOR' && "Objetivos: Explicar ingresos, Explicar niveles, Recomendar oportunidades, Explicar pagos."}
               <br />
               <span className="text-dp-primary font-black tracking-widest mt-1 block">
                 → MODO ACTUAL: {isDaytimeState ? "DIURNO (06:00 a 22:00) | Comercial, Cercana, Proactiva" : "NOCTURNO (22:00 a 06:00) | Operativa, Clara, Directa"}
               </span>
            </p>
         </div>
      </div>

      <div className="bg-dp-background border border-dp-border rounded-[3rem] overflow-hidden flex flex-col h-[600px] shadow-sm">
        
        {/* Chat History */}
        <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-end gap-3 max-w-[85%]">
                {m.sender === 'ia' && (
                   <div className="w-8 h-8 rounded-full bg-dp-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-dp-primary/20">
                      <Bot size={14} />
                   </div>
                )}
                
                <div className={`p-6 rounded-[2.5rem] text-xs font-bold leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-dp-primary text-white rounded-br-none'
                    : 'bg-dp-surfaceLight text-dp-text border border-dp-border rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
              <span className="text-[8px] font-black text-dp-textMuted uppercase tracking-wider mt-2 px-10">
                {m.time}
              </span>
            </div>
          ))}

          {isAiResponding && (
            <div className="flex items-end gap-3 animate-pulse">
              <div className="w-8 h-8 bg-dp-surfaceLight text-dp-primary border border-dp-border rounded-full flex items-center justify-center shrink-0">
                  <Bot size={14} />
              </div>
              <div className="p-4 bg-dp-surfaceLight border border-dp-border rounded-[2rem] rounded-bl-none text-[10px] font-black text-dp-textMuted uppercase tracking-widest">
                Procesando recomendación...
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <footer className="p-4 bg-dp-surface border-t border-dp-border flex gap-3 items-end rounded-b-[3rem]">
          <div className="flex-1 bg-dp-surfaceLight border border-dp-border rounded-3xl flex items-center px-4 py-1">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Mensaje o habla..."
              className="flex-1 bg-transparent text-dp-text py-3 text-sm focus:outline-none placeholder-dp-textMuted/50"
              disabled={isRecording || isAiResponding}
            />
          </div>

          <div className="flex items-center gap-2 mb-1">
            {inputValue.trim().length > 0 ? (
              <button
                onClick={handleSendMessage}
                disabled={isAiResponding}
                className="dp-button w-12 h-12 rounded-full px-0 disabled:opacity-40 flex items-center justify-center shrink-0 shadow-lg shadow-dp-primary/20"
              >
                <Send size={20} className="translate-x-[-2px] translate-y-[1px]" />
              </button>
            ) : (
              <button
                onClick={toggleRecording}
                disabled={isAiResponding}
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-lg ${
                  isRecording 
                    ? 'bg-dp-danger text-white animate-pulse shadow-dp-danger/30' 
                    : 'bg-dp-primary text-white shadow-dp-primary/20 hover:opacity-90'
                }`}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
