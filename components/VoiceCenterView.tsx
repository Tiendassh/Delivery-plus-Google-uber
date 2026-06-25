import React, { useState } from 'react';
import { UserRole } from '../types';
import { Bot, Volume2, Settings2, ShieldCheck, PlayCircle, Mic2, Smartphone, CheckCircle } from 'lucide-react';
import { voiceService } from '../services/voiceService';

interface VoiceCenterProps {
  activeRole: UserRole;
}

export const VoiceCenterView: React.FC<VoiceCenterProps> = ({ activeRole }) => {
  const getDefaultVoice = () => {
    switch (activeRole) {
      case 'REPARTIDOR':
        return 'mateo';
      case 'COMERCIO':
      case 'EMPRENDEDOR':
        return 'valentina';
      default:
        return 'mateo';
    }
  };

  const [selectedVoice, setSelectedVoice] = useState<'mateo' | 'valentina'>(getDefaultVoice());
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [speed, setSpeed] = useState(1);

  const testVoice = async () => {
    setIsPlaying(true);
    try {
      const sampleText = selectedVoice === 'mateo' 
        ? "Hola, soy Mateo, tu copiloto logístico. Nuevo pedido disponible a 700 metros. Ganancia estimada dos mil cuatrocientos pesos."
        : "Hola, soy Valentina, tu asistente operativa. Detecto una zona con alta demanda a menos de tres kilómetros.";
      
      await voiceService.speak(sampleText, selectedVoice);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-dp-primary/10 to-transparent p-8 rounded-3xl border border-dp-border relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bot className="w-8 h-8 text-dp-primary" />
              <h1 className="text-3xl font-poppins font-bold text-dp-text tracking-tight">Voice Center</h1>
            </div>
            <p className="text-dp-textMuted max-w-lg">
              Plataforma de síntesis de voz inteligente. Configura tu copiloto logístico impulsado por Kokoro TTS y Piper (Fallback).
            </p>
          </div>
          
          <div className="shrink-0 flex items-center gap-2 bg-dp-surfaceLight px-4 py-2 rounded-xl border border-dp-border">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dp-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-dp-success"></span>
            </span>
            <span className="text-sm font-bold text-dp-textMuted uppercase tracking-wider">Motor Activo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Voice Selection and Testing */}
        <div className="md:col-span-8 space-y-8">
          
          <div className="bg-dp-surface p-8 rounded-3xl border border-dp-border shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Mic2 className="w-5 h-5 text-dp-textMuted" />
              <h2 className="text-xl font-bold font-poppins tracking-tight">Perfiles de Voz</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setSelectedVoice('mateo')}
                className={`p-6 rounded-2xl border text-left transition-all ${
                  selectedVoice === 'mateo' 
                  ? 'border-dp-primary bg-dp-primary/5 ring-1 ring-dp-primary' 
                  : 'border-dp-border bg-dp-surfaceLight hover:border-dp-textMuted'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl overflow-hidden border border-slate-700">
                    👨🏻
                  </div>
                  {selectedVoice === 'mateo' && <CheckCircle className="w-5 h-5 text-dp-primary" />}
                </div>
                <h3 className="text-lg font-bold">Mateo IA</h3>
                <p className="text-xs text-dp-textMuted mt-1 mb-3">Voz Operativa • Navegación</p>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md uppercase font-bold tracking-wider">Masculino</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md uppercase font-bold tracking-wider">Directo</span>
                </div>
              </button>

              <button 
                onClick={() => setSelectedVoice('valentina')}
                className={`p-6 rounded-2xl border text-left transition-all ${
                  selectedVoice === 'valentina' 
                  ? 'border-dp-primary bg-dp-primary/5 ring-1 ring-dp-primary' 
                  : 'border-dp-border bg-dp-surfaceLight hover:border-dp-textMuted'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl overflow-hidden border border-slate-700">
                    👩🏻‍💼
                  </div>
                  {selectedVoice === 'valentina' && <CheckCircle className="w-5 h-5 text-dp-primary" />}
                </div>
                <h3 className="text-lg font-bold">Valentina IA</h3>
                <p className="text-xs text-dp-textMuted mt-1 mb-3">Voz Corporativa • Empatía</p>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md uppercase font-bold tracking-wider">Femenino</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md uppercase font-bold tracking-wider">Elegante</span>
                </div>
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-dp-border">
              <button 
                onClick={testVoice}
                disabled={isPlaying}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-dp-primary hover:bg-dp-primary/90 text-white rounded-xl font-bold transition-all disabled:opacity-50"
              >
                <PlayCircle className={isPlaying ? "animate-spin" : ""} />
                {isPlaying ? "Reproduciendo muestra..." : "Escuchar muestra de voz"}
              </button>
            </div>
          </div>

          <div className="bg-dp-surface p-8 rounded-3xl border border-dp-border shadow-sm space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <Settings2 className="w-5 h-5 text-dp-textMuted" />
              <h2 className="text-xl font-bold font-poppins tracking-tight">Ajustes Acústicos</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-dp-textMuted">Volumen de Síntesis</label>
                  <span className="text-sm font-bold">{volume}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-2 bg-dp-surfaceLight rounded-lg appearance-none cursor-pointer accent-dp-primary border border-dp-border" 
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-dp-textMuted">Velocidad de Lectura</label>
                  <span className="text-sm font-bold">{speed}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" max="2" step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-dp-surfaceLight rounded-lg appearance-none cursor-pointer accent-dp-primary border border-dp-border" 
                />
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column: Engine settings and features */}
        <div className="md:col-span-4 space-y-6">
          
          <div className="bg-dp-surface p-6 rounded-3xl border border-dp-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Smartphone className="w-5 h-5 text-dp-textMuted" />
              <h3 className="font-bold">Modo Conductor</h3>
            </div>
            
            <label className="flex items-start gap-4 cursor-pointer p-4 rounded-xl hover:bg-dp-surfaceLight transition-colors border border-transparent hover:border-dp-border">
              <div className="relative inline-flex items-center mt-1">
                <input 
                  type="checkbox" 
                  checked={autoPlayEnabled}
                  onChange={() => setAutoPlayEnabled(!autoPlayEnabled)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-dp-surfaceLight rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-dp-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-dp-border"></div>
              </div>
              <div>
                <span className="block font-bold">Lectura Automática</span>
                <span className="block text-xs text-dp-textMuted mt-1">Anuncia nuevos pedidos, entregas y clima sin tocar la pantalla.</span>
              </div>
            </label>
          </div>

          <div className="bg-dp-surface p-6 rounded-3xl border border-dp-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-5 h-5 text-dp-textMuted" />
              <h3 className="font-bold">Eventos Sonoros</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { title: "Nuevos pedidos y reasignaciones", level: "Alta Prioridad" },
                { title: "Alertas climáticas en ruta", level: "Alta Prioridad" },
                { title: "Cambios en ganancias", level: "Media Prioridad" },
                { title: "Mensajes de chat", level: "Media Prioridad" }
              ].map((evt, idx) => (
                <div key={idx} className="flex flex-col gap-1 pb-4 border-b border-dp-surfaceLight last:border-0 last:pb-0">
                  <span className="text-sm font-medium">{evt.title}</span>
                  <span className="text-[10px] text-dp-textMuted uppercase font-bold tracking-wider">{evt.level}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
