
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (user: any) => void;
}

const LoginView: React.FC<LoginProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-6 z-[1000]">
      <div className="w-full max-w-md space-y-12 animate-in fade-in zoom-in duration-700">
        <div className="text-center">
          <h1 className="text-[60px] font-black italic text-white tracking-tighter leading-none">
            Delivery<span className="text-plus-blue">Plus</span>
          </h1>
          <p className="text-plus-blue font-black uppercase tracking-[0.6em] text-[10px] mt-4 italic">Neural Logistics Network</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] space-y-8 shadow-2xl">
          <div className="space-y-4">
             <button 
               onClick={() => onLogin({ name: 'Admin Google', type: 'GOOGLE' })}
               className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-4 hover:scale-105 transition-all"
             >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
                Ingresar con Google
             </button>
             <button 
               onClick={() => onLogin({ name: 'Admin FB', type: 'FB' })}
               className="w-full bg-[#1877F2] text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-4 hover:scale-105 transition-all"
             >
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" className="w-4 h-4" alt="F" />
                Ingresar con Facebook
             </button>
          </div>

          <div className="relative">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
             <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0A0A0B] px-4 text-white/30 font-black tracking-widest">Ó acceso telefónico</span></div>
          </div>

          <div className="space-y-4">
             <input 
               type="tel"
               placeholder="+54 9 11 0000-0000"
               value={phone}
               onChange={(e) => setPhone(e.target.value)}
               className="w-full bg-white/5 border border-white/10 px-8 py-5 rounded-2xl text-white font-bold focus:outline-none focus:border-plus-blue"
             />
             <button 
               onClick={() => phone.length > 8 && onLogin({ name: phone, type: 'PHONE' })}
               className="w-full bg-plus-blue text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-[0_15px_30px_rgba(37,99,235,0.4)]"
             >
                Solicitar Pin de Red
             </button>
          </div>
        </div>

        <p className="text-center text-[8px] text-white/20 font-black uppercase tracking-[0.4em]">Propiedad de Delivery Plus Corp v1.2.0 • Sincronización Segura</p>
      </div>
    </div>
  );
};

export default LoginView;
