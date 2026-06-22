import React from 'react';
import { motion } from 'motion/react';
import { Zap, Shield, Cpu } from 'lucide-react';

// Using Vite's asset import rules (relative to the file, which is in /components)
import riderImage from '../src/assets/images/futuristic_delivery_rider_1782122077441.jpg';

export const BrandHero = () => (
  <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black group">
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
    <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay z-10 group-hover:bg-blue-400/30 transition-all duration-700" />
    <img 
      src={riderImage} 
      alt="Delivery Plus Corporate Isotipo" 
      className="absolute inset-0 w-full h-full object-cover opacity-80"
    />
    <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-3xl font-black text-white tracking-tight mb-2">DELIVERY PLUS</h2>
        <p className="text-plus-blue font-medium tracking-widest text-sm uppercase mb-4">Logistics Solutions</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
            <Cpu className="w-3 h-3 text-plus-blue" />
            <span>IA + Logística</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
            <Zap className="w-3 h-3 text-plus-blue" />
            <span>Velocidad</span>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

export const CorporateBrandPanel = () => {
  return (
    <div className="h-full w-full p-4">
      <BrandHero />
    </div>
  );
};

export const BrandWatermark = ({ className = '', opacity = 'opacity-10' }: { className?: string, opacity?: string }) => (
  <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-transparent z-10" />
    <img 
      src={riderImage} 
      alt="" 
      className={`w-full h-full object-cover object-right-bottom mix-blend-luminosity ${opacity}`}
    />
  </div>
);

export const BrandAvatar = ({ className = 'w-10 h-10', pulse = false }) => (
  <div className={`relative ${className} rounded-full overflow-hidden border-2 border-plus-blue/50 shadow-[0_0_15px_rgba(0,224,255,0.3)] bg-slate-900`}>
    {pulse && <div className="absolute inset-0 bg-plus-blue/20 animate-ping rounded-full" />}
    <img src={riderImage} alt="IA Avatar" className="w-full h-full object-cover" />
  </div>
);

export const BrandIllustration = ({ title, message }: { title: string, message: string }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
    <div className="relative w-48 h-48 mb-6 opacity-30 mix-blend-screen overflow-hidden rounded-full border border-white/5 mask-image-gradient">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
      <img src={riderImage} alt="" className="w-full h-full object-cover" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-sm max-w-sm mx-auto">{message}</p>
  </div>
);

export const BrandBackground = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-full h-full min-h-screen bg-[#0B0D14]">
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0 bg-[#0B0D14]/90 z-10 backdrop-blur-[2px]" />
      <img src={riderImage} alt="" className="w-full h-full object-cover opacity-[0.03] mix-blend-screen" />
    </div>
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

