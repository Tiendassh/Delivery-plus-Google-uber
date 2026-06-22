import React from 'react';
import { Shield, Zap, TrendingUp, Building2, Users } from 'lucide-react';
import { BrandHero, CorporateBrandPanel, BrandWatermark } from './BrandComponents';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-6xl mx-auto h-full min-h-[80vh] flex flex-col justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        {/* Left Content Area */}
        <div className="lg:col-span-7 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-center z-10">
          <BrandWatermark opacity="opacity-[0.03]" />
          
          <div className="relative z-10 space-y-8">
            <div>
              <span className="px-4 py-1.5 bg-plus-blue/10 text-plus-blue rounded-full font-black text-[9px] uppercase tracking-widest border border-plus-blue/10">
                INSTITUCIONAL
              </span>
              <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none italic uppercase mt-6">
                Delivery <span className="text-plus-blue">Plus</span>
              </h2>
              <p className="text-xl text-slate-500 font-medium mt-4">
                Innovación logística y tecnología de vanguardia para envíos inteligentes.
              </p>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-plus-blue" />
                </div>
                <div>
                  <h4 className="font-black text-gray-950 uppercase tracking-tight">Velocidad Operativa</h4>
                  <p className="text-sm text-slate-500 mt-1">Routing dinámico y asignaciones instantáneas impulsadas por IA.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-plus-blue" />
                </div>
                <div>
                  <h4 className="font-black text-gray-950 uppercase tracking-tight">Seguridad Empresarial</h4>
                  <p className="text-sm text-slate-500 mt-1">Sistema de Escrow robusto para una garantía financiera integral.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-plus-blue" />
                </div>
                <div>
                  <h4 className="font-black text-gray-950 uppercase tracking-tight">Infraestructura Escalar</h4>
                  <p className="text-sm text-slate-500 mt-1">Soporte nativo B2B y logística interurbana de alta tolerancia.</p>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                © {new Date().getFullYear()} Delivery Plus Posadas. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>

        {/* Right Branding Area */}
        <div className="lg:col-span-5 relative min-h-[400px]">
          <CorporateBrandPanel />
        </div>
      </div>
    </div>
  );
};
