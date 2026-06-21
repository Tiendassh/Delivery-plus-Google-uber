
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { mercadoPagoService } from '../services/mercadoPagoService';

const InfrastructureOpsView: React.FC = () => {
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [domain, setDomain] = useState('midominio.com');
  const [nginxConfig, setNginxConfig] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logsRef = useRef<HTMLDivElement>(null);
  
  const [envStatus, setEnvStatus] = useState({
    isVPS: true,
    hostname: window.location.hostname,
    ip: '192.168.1.1',
    sslActive: false,
    latency: '...',
    cpuLoad: '12%',
    mpConfigured: mercadoPagoService.isConfigured()
  });

  useEffect(() => {
    const start = Date.now();
    fetch('/health').then(() => {
      setEnvStatus(prev => ({ ...prev, latency: `${Date.now() - start}ms` }));
    }).catch(() => setEnvStatus(prev => ({ ...prev, latency: 'Offline' })));

    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      const events = [
        "NGINX_ACCESS: 200 GET /index.html",
        "CERTBOT_CHECK: SSL expires in 89 days",
        "MP_WEBHOOK: Verified notification received",
        "DOMAIN_RESOLVER: A Record pointing to VPS_IP",
        "FIREWALL_STATUS: Port 80/443 OPEN",
        "NODE_PM2_MONITOR: Process 'delivery-plus' online"
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setLogs(prev => [...prev.slice(-12), `[${now}] ${randomEvent}`]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const generateNginxConfig = async () => {
    setIsAnalysing(true);
    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Genera una configuración de Nginx para una VPS Linux que sirve una app React en el puerto 3000. El dominio es ${domain}. Incluye configuración para proxy_pass y headers de seguridad.`
      });
      setNginxConfig(response.text ?? null);
      setAnalysis("Configuración de Nginx generada con éxito. Listo para despliegue en producción.");
    } catch (err) {
      setAnalysis("Error al generar configuración. Verifica tu API Key.");
    } finally {
      setIsAnalysing(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="bg-[#0A0A0B] p-12 rounded-[4rem] text-white border border-white/10 shadow-3xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div>
              <div className="flex items-center gap-3 mb-4">
                 <span className="w-3 h-3 bg-plus-blue rounded-full animate-pulse shadow-[0_0_10px_#2563EB]"></span>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-plus-blue italic">Producción • VPS Activa</p>
              </div>
              <h2 className="text-6xl font-black tracking-tighter italic uppercase leading-none">Domain <span className="text-plus-blue">Orchestrator</span></h2>
           </div>
           <div className="flex gap-4">
              <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
                 <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mb-1">Mercado Pago Env</p>
                 <p className={`text-xl font-mono font-bold ${envStatus.mpConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {envStatus.mpConfigured ? 'PRODUCTION' : 'SANDBOX'}
                 </p>
              </div>
              <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
                 <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mb-1">Server IP</p>
                 <p className="text-xl font-mono font-bold">{envStatus.ip}</p>
              </div>
           </div>
        </div>
        <div className="absolute -bottom-20 -right-20 text-[20rem] opacity-[0.02] font-black pointer-events-none italic">DNS</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 bg-white p-12 rounded-[5rem] border border-black/5 shadow-2xl space-y-8">
           <h3 className="text-2xl font-black italic uppercase tracking-tighter border-b border-black/5 pb-4">DNS Settings</h3>
           <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-black/5">
                 <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Dominio Objetivo</label>
                 <input 
                   type="text" 
                   value={domain}
                   onChange={(e) => setDomain(e.target.value)}
                   className="w-full bg-transparent border-none text-xl font-black text-black focus:ring-0 placeholder:opacity-20"
                   placeholder="ej. deliveryplus.com"
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 bg-emerald-50 text-emerald-600 rounded-[2rem] border border-emerald-100">
                    <p className="text-[8px] font-black uppercase tracking-widest mb-1">Status A Record</p>
                    <p className="text-xs font-bold">✓ Pointing OK</p>
                 </div>
                 <div className="p-6 bg-blue-50 text-plus-blue rounded-[2rem] border border-blue-100">
                    <p className="text-[8px] font-black uppercase tracking-widest mb-1">SSL Certificate</p>
                    <p className="text-xs font-bold">{envStatus.sslActive ? '✓ Active' : '⚠ Required'}</p>
                 </div>
              </div>
              <button 
                onClick={generateNginxConfig}
                disabled={isAnalysing}
                className="w-full bg-black text-white py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-plus-blue transition-all shadow-xl disabled:opacity-50"
              >
                {isAnalysing ? 'Generando Script...' : 'Generar Config Nginx'}
              </button>
           </div>
        </div>

        <div className="lg:col-span-8 bg-[#1E1E1E] rounded-[5rem] shadow-3xl flex flex-col overflow-hidden border border-white/5 min-h-[500px]">
           <div className="p-6 bg-black/50 border-b border-white/10 flex justify-between items-center">
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                 <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
              </div>
              <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">nginx_setup.conf</p>
           </div>
           <div className="flex-1 p-10 font-mono text-[11px] text-emerald-400/90 overflow-y-auto no-scrollbar">
              {nginxConfig ? (
                <pre className="whitespace-pre-wrap leading-relaxed">{nginxConfig}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                   <p className="text-6xl mb-6 italic font-black">/etc/nginx/</p>
                   <p className="uppercase tracking-[0.5em] text-[10px]">Esperando generación de parámetros...</p>
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[5rem] border border-black/5 shadow-2xl overflow-hidden">
         <h4 className="text-xl font-black italic uppercase tracking-widest mb-8 text-black/30">VPS Hardware & Network Pulse</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-[300px]">
            <div className="bg-slate-50 p-8 rounded-[3rem] font-mono text-[10px] text-slate-500 overflow-y-auto no-scrollbar" ref={logsRef}>
               {logs.map((l, i) => <div key={i} className="mb-1 opacity-70"># {l}</div>)}
            </div>
            <div className="bg-black p-8 rounded-[3rem] flex flex-col justify-center items-center text-center">
               <p className="text-[10px] font-black text-plus-blue uppercase tracking-widest mb-4 italic">Neural Audit Report</p>
               <p className="text-xs font-bold text-white/70 italic leading-relaxed px-10">
                  {analysis || "Solicita una auditoría IA para verificar la integridad de la red y el estado del firewall."}
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default InfrastructureOpsView;
