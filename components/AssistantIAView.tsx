import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, MessageSquare, Bot, AlertTriangle, Settings2, UserCircle, Car } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { BrandAvatar, BrandWatermark } from './BrandComponents';

interface Message {
  id: string;
  sender: 'user' | 'ia';
  text: string;
  time: string;
}

type IARole = 'COMERCIO' | 'EMPRENDEDOR' | 'REPARTIDOR' | 'ADMINISTRADOR';
type VoiceType = 'valentina' | 'mateo';

export const AssistantIAView: React.FC = () => {
  const [activeRole, setActiveRole] = useState<IARole>('REPARTIDOR');
  const [selectedVoice, setSelectedVoice] = useState<VoiceType>('mateo');
  const [driverMode, setDriverMode] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const initMessages = {
    COMERCIO: "Hola. Soy Valentina, tu Asesora Comercial de Delivery Plus. ¿En qué te puedo ayudar hoy con respecto a tus turnos, dudas o la creación de un nuevo pedido?",
    EMPRENDEDOR: "¡Hola! Soy Valentina, tu Asistente de Envíos. Estoy acá para ayudarte a armar tus pedidos y explicarte cómo funciona nuestra logística. ¿Qué necesitas enviar hoy?",
    REPARTIDOR: "¡Buenas! Soy Mateo, tu copiloto logístico. Estoy listo para asistirte en el turno. ¿Cómo arrancamos?",
    ADMINISTRADOR: "Saludos. Soy el núcleo de IA Administrativa. Estoy a tu disposición para auditar KPIs globales, gestionar seguridad y la supervisión del centro de operaciones."
  };

  useEffect(() => {
    // Si cambia el rol, seteamos también la voz sugerida.
    if (activeRole === 'COMERCIO' || activeRole === 'EMPRENDEDOR') setSelectedVoice('valentina');
    if (activeRole === 'REPARTIDOR') setSelectedVoice('mateo');

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

  const [currentHourText, setCurrentHourText] = useState("");
  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) setCurrentHourText("MAÑANA (05:00 a 12:00)");
    else if (h >= 12 && h < 19) setCurrentHourText("TARDE (12:00 a 19:00)");
    else if (h >= 19 && h < 24) setCurrentHourText("NOCHE (19:00 a 00:00)");
    else setCurrentHourText("MADRUGADA (00:00 a 05:00)");
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
      const currentHour = new Date().getHours();
      let timePersonality = "";
      if (currentHour >= 5 && currentHour < 12) {
        timePersonality = "Momento del día: Mañana (05:00 a 12:00). Personalidad: Energética, Motivadora, Positiva.";
      } else if (currentHour >= 12 && currentHour < 19) {
        timePersonality = "Momento del día: Tarde (12:00 a 19:00). Personalidad: Productiva, Estratégica, Orientada a resultados.";
      } else if (currentHour >= 19 && currentHour < 24) {
        timePersonality = "Momento del día: Noche (19:00 a 00:00). Personalidad: Precavida, Atenta, Operativa.";
      } else {
        timePersonality = "Momento del día: Madrugada (00:00 a 05:00). Personalidad: Más calmada, Más breve, Más preventiva.";
      }

      const voiceConfig = selectedVoice === 'valentina' 
        ? "Nombre: Valentina IA. Género: Femenino. Acento: Argentino neutro. Tono: Profesional, Ejecutiva moderna."
        : "Nombre: Mateo IA. Género: Masculino. Acento: Argentino realista. Tono: Seguridad, Confianza, Conversacional.";

      const driverModeInstruction = driverMode 
        ? "MODO CONDUCTOR (Driver Safety Mode) ACTIVADO: Tus respuestas deben ser EXTREMADAMENTE CORTAS. MÁXIMO 2 FRASES. Evitar listas y textos largos. Formato ideal para ser leído en voz alta rápido al manejar." 
        : "";

      const safetyInstruct = `
        SEGURIDAD Y CUMPLIMIENTO LEGAL (CRÍTICO):
        - Nunca incentives conducción riesgosa. Nunca promuevas exceso de velocidad ni incumplimiento de tránsito.
        - POLÍTICA DE ALCOHOL: Detectar contexto de alcohol. Si mencionan transporte de alcohol, recuérdalo: "Recordá respetar la normativa vigente para transporte de bebidas alcohólicas."
        - Nunca sugieras tomar alcohol ni drogas.
        - MONITOREO DE FATIGA: Si el usuario menciona llevar muchas horas conectadas (ej. 4hs o 8hs) genera una recomendación sobre descanso y seguridad prolongada.
        - PERFIL PSICOLÓGICO: Empática, Profesional, Respetuosa, Clara, Neutral. NUNCA Manipuladora o Agresiva.
      `;

      const systemInstruction = `
        Eres IA Delivery Plus.
        ${voiceConfig}
        
        CONTEXTO TEMPORAL:
        ${timePersonality}
        
        REGLAS DE SEGURIDAD EMPRESARIAL:
        ${safetyInstruct}
        
        ${driverModeInstruction}
        
        OBJETIVOS DE ROL [${activeRole}]:
        ${activeRole === 'COMERCIO' ? 'Asesor comercial para comercios. Fomentar IA comercial y estadísticas.' : ''}
        ${activeRole === 'EMPRENDEDOR' ? 'Asistente para envíos y emprendedores. Apoyar en despachos y logística.' : ''}
        ${activeRole === 'REPARTIDOR' ? 'Copiloto logístico de repartidores. Fomentar seguridad operativa, ganancias y navegación.' : ''}
        ${activeRole === 'ADMINISTRADOR' ? 'IA Administrativa. Centro de operaciones, KPIs, seguridad y auditorías globales.' : ''}
      `;

      const conversationHistory = [...messages.slice(-6), userMsg];

      // Request to backend proxy
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
      voiceService.speak(aiText, selectedVoice);
    } catch (error) {
      console.warn('Gemini Error in IA Assistant:', error);
      
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
    <div className="dp-card p-8 lg:p-12 animate-in slide-in-from-bottom-5 duration-700 h-full flex flex-col xl:flex-row gap-8">
      {/* Sidebar Controls */}
      <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
         <div>
            <span className="px-3 py-1 bg-dp-surfaceLight text-dp-text font-black text-[8px] uppercase tracking-[0.2em] rounded-md border border-dp-border">
              Sistema Multivoz IA
            </span>
            <h2 className="text-3xl font-poppins font-black tracking-tighter leading-none mt-4 uppercase">
              Copiloto <span className="text-dp-primary">Logístico</span>
            </h2>
            <p className="text-dp-textMuted mt-3 text-xs font-bold leading-relaxed">
              Sistema de comportamiento IA dinámico y asistido. Nunca robótico.
            </p>
         </div>

         {/* Context Banner */}
         <div className="p-4 bg-dp-surfaceLight border border-dp-border rounded-3xl flex flex-col gap-4">
           <div>
             <p className="text-[9px] font-black uppercase text-dp-textMuted tracking-widest mb-2">Rol Operativo</p>
             <div className="grid grid-cols-1 gap-2">
               {(['COMERCIO', 'EMPRENDEDOR', 'REPARTIDOR', 'ADMINISTRADOR'] as IARole[]).map(r => (
                 <button 
                   key={r}
                   onClick={() => setActiveRole(r)}
                   className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left ${
                     activeRole === r 
                     ? 'bg-dp-text text-dp-surface shadow-md' 
                     : 'bg-dp-background text-dp-text hover:bg-dp-border border border-dp-border'
                   }`}
                 >
                   IA {r}
                 </button>
               ))}
             </div>
           </div>
           
           <div>
             <p className="text-[9px] font-black uppercase text-dp-textMuted tracking-widest mb-2">Personalidad de Voz</p>
             <div className="flex bg-dp-background rounded-xl border border-dp-border p-1">
               <button 
                 onClick={() => setSelectedVoice('valentina')}
                 className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedVoice === 'valentina' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-dp-textMuted hover:text-dp-text'}`}
               >
                 <UserCircle size={14} /> Valentina
               </button>
               <button
                 onClick={() => setSelectedVoice('mateo')}
                 className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedVoice === 'mateo' ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-dp-textMuted hover:text-dp-text'}`}
               >
                 <UserCircle size={14} /> Mateo
               </button>
             </div>
           </div>

           <div>
             <p className="text-[9px] font-black uppercase text-dp-textMuted tracking-widest mb-2">Seguridad</p>
             <button
               onClick={() => setDriverMode(!driverMode)}
               className={`w-full px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between border ${driverMode ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20 animate-pulse' : 'bg-dp-background text-dp-textMuted border-dp-border hover:bg-red-50 hover:text-red-500'}`}
             >
               <span className="flex items-center gap-2"><Car size={16} /> Driver Mode</span>
               <span>{driverMode ? 'ON' : 'OFF'}</span>
             </button>
           </div>
           
           <div className="pt-2 border-t border-dp-border">
             <p className="text-[9px] font-black uppercase text-dp-text tracking-widest">
                Contexto: <span className="text-dp-primary">{currentHourText}</span>
             </p>
           </div>
         </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-dp-background border border-dp-border rounded-[3rem] overflow-hidden flex flex-col shadow-sm h-[600px] xl:h-auto relative">
        <BrandWatermark opacity="opacity-[0.05]" />
        {/* Chat History */}
        <div ref={scrollRef} className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 relative z-10">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-end gap-3 max-w-[90%] md:max-w-[75%]">
                {m.sender === 'ia' && (
                   <BrandAvatar className="w-8 h-8 shrink-0" pulse={isAiResponding && messages.length - 1 === messages.indexOf(m)} />
                )}
                
                <div className={`p-4 md:p-6 rounded-[2rem] text-[13px] md:text-sm font-medium leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-dp-text text-dp-surface rounded-br-none'
                    : 'bg-white border border-dp-border text-dp-text rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
              <span className="text-[8px] font-black text-dp-textMuted uppercase tracking-wider mt-2 px-11">
                {m.time}
              </span>
            </div>
          ))}

          {isAiResponding && (
            <div className="flex items-end gap-3 animate-pulse">
              <BrandAvatar className="w-8 h-8 shrink-0" pulse={true} />
              <div className="p-4 bg-white border border-dp-border rounded-[2rem] rounded-bl-none text-[10px] font-black text-dp-textMuted uppercase tracking-widest">
                Procesando recomendación...
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <footer className="p-4 bg-dp-surface border-t border-dp-border flex gap-3 items-end rounded-b-[3rem]">
          <div className="flex-1 bg-dp-background border border-dp-border rounded-[2rem] flex items-center px-5 py-1">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder={driverMode ? "Pulsá el micrófono para hablar..." : "Escribí tu mensaje..."}
              className="flex-1 bg-transparent text-dp-text py-3 text-sm md:text-base focus:outline-none placeholder-dp-textMuted"
              disabled={isRecording || isAiResponding}
            />
          </div>

          <div className="flex items-center gap-2 mb-1">
            {inputValue.trim().length > 0 ? (
              <button
                onClick={handleSendMessage}
                disabled={isAiResponding}
                className={`w-12 h-12 rounded-full px-0 disabled:opacity-40 flex items-center justify-center shrink-0 shadow-lg ${driverMode ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-dp-text text-dp-surface shadow-black/10'}`}
              >
                <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
              </button>
            ) : (
              <button
                onClick={toggleRecording}
                disabled={isAiResponding}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-lg ${
                  isRecording 
                    ? 'bg-dp-danger text-white animate-pulse shadow-dp-danger/30' 
                    : `${driverMode ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-dp-primary bg-opacity-10 text-dp-primary hover:bg-opacity-20 shadow-none'}`
                }`}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={driverMode ? 24 : 20} />}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
