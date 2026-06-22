
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Cpu } from 'lucide-react';
import riderImage from '../src/assets/images/futuristic_delivery_rider_1782122077441.jpg';

interface LoginProps {
  onLogin: (user: any) => void;
}

const LoginView: React.FC<LoginProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');

  return (
    <div className="fixed inset-0 bg-[#0B0D14] flex z-[1000] overflow-hidden">
      
      {/* Left Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-20 bg-[#0B0D14]">
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-left duration-700">
          <div className="text-left">
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-3">
              Delivery<span className="text-plus-blue">Plus</span>
            </h1>
            <p className="text-plus-blue font-medium uppercase tracking-widest text-xs">Logistics Solutions</p>
          </div>

          <div className="space-y-6">
             <div className="space-y-3">
               <button 
                 onClick={() => onLogin({ name: 'Admin Google', type: 'GOOGLE' })}
                 className="w-full bg-slate-900 border border-slate-800 text-white py-4 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-sm"
               >
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
                  Ingresar con Google
               </button>
               <button 
                 onClick={() => onLogin({ name: 'Admin FB', type: 'FB' })}
                 className="w-full bg-[#1877F2]/10 border border-[#1877F2]/20 text-[#1877F2] py-4 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-3 hover:bg-[#1877F2]/20 transition-all shadow-sm"
               >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" className="w-4 h-4" alt="F" />
                  Ingresar con Facebook
               </button>
             </div>

             <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-[10px] uppercase font-bold tracking-widest">Ó utilizar teléfono</span>
                <div className="flex-grow border-t border-slate-800"></div>
             </div>

             <div className="space-y-3">
                <input 
                  type="tel"
                  placeholder="+54 9 11 0000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 px-6 py-4 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-plus-blue focus:ring-1 focus:ring-plus-blue transition-all"
                />
                <button 
                  onClick={() => phone.length > 8 && onLogin({ name: phone, type: 'PHONE' })}
                  className="w-full bg-plus-blue hover:bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-wider shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98]"
                >
                   Solicitar Acceso
                </button>
             </div>
          </div>

          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center pt-8">
            Delivery Plus Network • Acceso Autorizado
          </p>
        </div>
      </div>

      {/* Right Column: Corporate Branding Image */}
      <div className="hidden lg:flex w-1/2 relative z-10 bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D14] via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay z-10 animate-pulse" />
        
        <motion.div 
          className="absolute inset-0 z-0 blur-sm scale-105"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 0.6 }}
          transition={{ duration: 2 }}
        >
          <img src={riderImage} alt="" className="w-full h-full object-cover opacity-30" />
        </motion.div>
        
        <motion.div 
          className="relative z-20 w-[80%] h-[80%] rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,150,255,0.2)]"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <img src={riderImage} alt="Delivery Plus AI" className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-black via-black/80 to-transparent">
             <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 text-white/90 text-xs font-semibold bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                  <Cpu className="w-4 h-4 text-plus-blue" /> IA Integrada
                </div>
                <div className="flex items-center gap-2 text-white/90 text-xs font-semibold bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                  <Shield className="w-4 h-4 text-emerald-400" /> Red Segura
                </div>
             </div>
             <h2 className="text-4xl font-black text-white italic tracking-tighter">La evolución<br/>del Delivery.</h2>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default LoginView;
