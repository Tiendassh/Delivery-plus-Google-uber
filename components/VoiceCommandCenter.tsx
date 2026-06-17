
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const VoiceCommandCenter: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'LISTENING' | 'SPEAKING' | 'ERROR_QUOTA'>('IDLE');
  
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const outputNodeRef = useRef<GainNode | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Utilería de Codificación/Decodificación Manual para Gemini Live
  function encode(bytes: Uint8Array) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
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
  }

  const startSession = async () => {
    if (isActive) return;
    setStatus('CONNECTING');
    setIsActive(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `
        Sos el Agente de Ventas de Delivery Plus. Tu objetivo es vender planes de logística a dueños de comercios.
        Hablá de forma natural, humana y profesional. No menciones que sos una IA a menos que te pregunten.
        
        Tus productos:
        - Moto Express: Envíos en 30min por $5000.
        - Flota Cargo: Para bultos grandes por $15000.
        - Plan Diamante: Suscripción mensual con prioridad y seguro de carga.
        
        Si el cliente parece interesado, decile que el contrato inteligente se generará automáticamente.
      `;

      audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNodeRef.current = audioContextOutRef.current.createGain();
      outputNodeRef.current.connect(audioContextOutRef.current.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('LISTENING');
            const source = audioContextInRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInRef.current!.destination);
            sessionRef.current = { stopMic: () => { 
              source.disconnect(); 
              scriptProcessor.disconnect(); 
              stream.getTracks().forEach(t => t.stop());
            }};
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + ' ' + message.serverContent?.outputTranscription?.text);
            }
            
            const parts = message.serverContent?.modelTurn?.parts;
            const audioBase64 = parts && parts.length > 0 ? parts[0].inlineData?.data : undefined;
            if (audioBase64) {
              setStatus('SPEAKING');
              const ctx = audioContextOutRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputNodeRef.current!);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setStatus('LISTENING');
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onerror: (e: any) => {
            console.error("Live Error:", e);
            if (e.message?.includes('429')) setStatus('ERROR_QUOTA');
            stopSession();
          },
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
    } catch (err: any) {
      if (err.message?.includes('429')) setStatus('ERROR_QUOTA');
      stopSession();
    }
  };

  const stopSession = () => {
    setIsActive(false);
    if (status !== 'ERROR_QUOTA') setStatus('IDLE');
    if (sessionRef.current) sessionRef.current.stopMic();
    if (audioContextInRef.current) audioContextInRef.current.close();
    if (audioContextOutRef.current) audioContextOutRef.current.close();
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto flex flex-col">
      <header className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h2 className="text-5xl font-black tracking-tighter italic uppercase text-black leading-none">Ventas por <span className="text-plus-blue">Call Center</span></h2>
          <p className="text-slate-400 mt-2 text-lg font-medium italic">Asistente de Ventas IA</p>
        </div>
        
        <div className="flex gap-4 mt-6 md:mt-0">
           {status === 'ERROR_QUOTA' && (
             <button onClick={() => (window as any).aistudio.openSelectKey()} className="bg-red-50 text-red-600 px-6 py-3 rounded-full font-black text-[10px] uppercase border border-red-100 animate-pulse">
                Saturación - Cambiar Token
             </button>
           )}
           <div className={`px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest border transition-all ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
              Status: {status}
           </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#050505] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center items-center h-[400px]">
           <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--plus-blue)_0%,_transparent_70%)]"></div>
           
           <div className="relative z-10 flex flex-col items-center gap-10">
              <div className="relative">
                 <button 
                  onMouseDown={startSession}
                  onMouseUp={stopSession}
                  onTouchStart={startSession}
                  onTouchEnd={stopSession}
                  className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 z-10 relative active:scale-90 shadow-2xl ${isActive ? 'bg-plus-blue shadow-[0_0_80px_rgba(37,99,235,0.8)]' : 'bg-white/5 border border-white/10 hover:border-plus-blue/50'}`}
                 >
                    <span className="text-6xl">{isActive ? '🎙️' : '🔘'}</span>
                 </button>
                 {isActive && <div className="absolute -inset-6 bg-plus-blue rounded-full animate-ping opacity-20"></div>}
              </div>

              <div className="text-center space-y-2">
                 <h4 className="text-2xl font-black italic uppercase tracking-tighter">
                   {isActive ? (status === 'SPEAKING' ? 'IA HABLANDO...' : 'MANTENÉ PARA HABLAR') : 'TERMINAL DISPONIBLE'}
                 </h4>
                 <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">Ventas Automatizadas</p>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10 flex flex-col overflow-hidden h-[400px]">
           <div className="flex items-center gap-4 mb-6 border-b border-slate-50 pb-6">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-xl">📝</div>
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Transcripción en Tiempo Real</h4>
                <p className="text-base font-black italic uppercase">Vínculo de Negociación</p>
              </div>
           </div>
           
           <div className="flex-1 bg-slate-50 rounded-3xl p-8 overflow-y-auto font-sans font-medium text-xl text-slate-800 leading-relaxed shadow-inner">
              {transcription ? (
                <div className="animate-in fade-in">{transcription}</div>
              ) : (
                <div className="text-slate-400 italic">Iniciá el enlace para comenzar la venta logística...</div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCommandCenter;
