
import React, { useState, useEffect } from 'react';
import { mercadoPagoService, MPBalance } from '../services/mercadoPagoService';
import { notificationService } from '../services/notificationService';
import { Transaccion } from '../types';
import { GoogleGenAI } from "@google/genai";

const WalletView: React.FC = () => {
  const [balance, setBalance] = useState<MPBalance | null>(null);
  const [history, setHistory] = useState<Transaccion[]>([]);
  const [userInfo, setUserInfo] = useState<{ first_name?: string, last_name?: string, email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [iaAdvice, setIaAdvice] = useState('Analizando tu cuenta...');
  const [isProcessing, setIsProcessing] = useState(false);

  const isConfigured = mercadoPagoService.isConfigured();

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [b, h, u] = await Promise.all([
        mercadoPagoService.getBalance(),
        mercadoPagoService.getHistorialTransacciones(),
        mercadoPagoService.getUserInfo()
      ]);
      setBalance(b);
      setHistory(h);
      setUserInfo(u);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analiza este balance de Mercado Pago: $${b.total_amount}. Da un consejo financiero corto y amigable.`
      });
      setIaAdvice(response.text || "Tu dinero está rindiendo. ¡Sigue así!");
    } catch (err) {
      setIaAdvice("Todo en orden con tu cuenta.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleWithdraw = async () => {
    setIsProcessing(true);
    notificationService.playAlert('info');
    await new Promise(resolve => setTimeout(resolve, 2000));
    notificationService.notify("Transferencia en camino", "El dinero estará en tu cuenta bancaria pronto.");
    setIsProcessing(false);
  };

  if (loading) return (
    <div className="h-[600px] flex flex-col items-center justify-center gap-4 bg-[#f5f5f5] rounded-3xl">
      <div className="w-12 h-12 border-4 border-[#009EE3] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-gray-500">Cargando tu billetera...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 bg-[#f5f5f5] -m-10 lg:-m-16 p-10 lg:p-16 min-h-screen font-sans">
      {/* Header Mercado Pago Style */}
      <div className="bg-[#009EE3] -mx-10 -mt-10 lg:-mx-16 lg:-mt-16 px-10 lg:px-16 pt-16 pb-32">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo-0.png" className="h-6 object-contain" alt="Mercado Pago" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Billetera</h2>
          </div>
          <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-full text-white text-sm font-medium backdrop-blur-sm">
            <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
            {isConfigured ? (userInfo?.first_name ? `Cuenta Vinculada: ${userInfo.first_name} ${userInfo.last_name || ''}` : 'Cuenta Vinculada') : 'Modo Simulación'}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto -mt-20 space-y-6 relative z-10">
        
        {/* Balance Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Dinero disponible</p>
              <h3 className="text-5xl font-semibold text-gray-900">
                $ {balance?.available_balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </h3>
              {balance?.unavailable_balance ? (
                <p className="text-gray-500 text-sm mt-3">
                  Dinero a liberar: $ {balance.unavailable_balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </p>
              ) : null}
            </div>
            
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <button 
                onClick={handleWithdraw}
                disabled={isProcessing}
                className="flex-1 lg:flex-none bg-[#009EE3] hover:bg-[#008BCC] text-white px-6 py-3 rounded-xl font-semibold transition-colors text-sm"
              >
                Transferir dinero
              </button>
              <button 
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    const pref = await mercadoPagoService.createPreference('Cobro desde Billetera', 1500);
                    if (pref && pref.init_point && pref.init_point !== '#') {
                      window.open(pref.init_point, '_blank');
                    } else {
                      notificationService.notify("Atención", "Estás en modo simulación.");
                    }
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                className="flex-1 lg:flex-none bg-[rgba(0,158,227,0.1)] hover:bg-[rgba(0,158,227,0.15)] text-[#009EE3] px-6 py-3 rounded-xl font-semibold transition-colors text-sm"
              >
                Generar link de pago
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* AI Insight Card */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#009EE3] rounded-full flex items-center justify-center text-white text-sm">
                ✨
              </div>
              <h4 className="font-semibold text-gray-900">Asistente Financiero</h4>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed flex-1">
              {iaAdvice}
            </p>
          </div>

          {/* API Tokens Integration Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Tus integraciones</h4>
            <div className="border border-gray-100 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🔑</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Credenciales de Mercado Pago</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {isConfigured 
                      ? 'Tus API tokens están configurados y activos.' 
                      : 'Usando entorno de prueba. Configura tus tokens reales.'}
                  </p>
                </div>
              </div>
              <a 
                href="https://www.mercadopago.com.ar/developers/panel/credentials" 
                target="_blank" 
                rel="noreferrer"
                className="text-[#009EE3] font-semibold text-sm hover:underline whitespace-nowrap"
              >
                Ir al Panel de Developers
              </a>
            </div>
          </div>
          
        </div>

        {/* Activity History */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h4 className="font-semibold text-gray-900 text-lg">Tu actividad</h4>
          </div>
          <div className="divide-y divide-gray-100">
            {history.map(tx => (
              <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${tx.monto > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    {tx.monto > 0 ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tx.detalle}</p>
                    <p className="text-sm text-gray-500 mt-0.5 capitalize">{tx.tipo.toLowerCase().replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium text-lg ${tx.monto > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.monto > 0 ? '+ ' : ''}$ {Math.abs(tx.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(tx.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No hay movimientos recientes.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default WalletView;

