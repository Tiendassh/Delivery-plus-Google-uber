import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Landmark, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  RefreshCw, 
  Send, 
  CheckCircle2, 
  ChevronRight, 
  AlertTriangle, 
  Check, 
  TrendingUp, 
  Users, 
  Building2, 
  Zap,
  HelpCircle
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { Transaccion } from '../types';
import { GoogleGenAI } from "@google/genai";
import { BrandWatermark } from './BrandComponents';

type SubWalletType = 'delivery-plus' | 'repartidor' | 'comercio' | 'administrador';

const WalletView: React.FC = () => {
  const [activeWallet, setActiveWallet] = useState<SubWalletType>('delivery-plus');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaccion[]>([]);
  const [iaAdvice, setIaAdvice] = useState('Detección del estado logístico-financiero...');
  const [isProcessing, setIsProcessing] = useState(false);

  // States for Billetera Delivery Plus Flow Simulation
  const [escrowStep, setEscrowStep] = useState(1);
  const [escrowAmount, setEscrowAmount] = useState(0);
  const [escrowDetail, setEscrowDetail] = useState('');
  const [isSimulatingEscrow, setIsSimulatingEscrow] = useState(false);

  // States for Billetera Repartidor
  const [riderBalancePending, setRiderBalancePending] = useState(0);
  const [riderBalanceAvailable, setRiderBalanceAvailable] = useState(0);
  const [riderEarningsDaily, setRiderEarningsDaily] = useState(0);
  const [riderEarningsWeekly, setRiderEarningsWeekly] = useState(0);
  const [riderEarningsMonthly, setRiderEarningsMonthly] = useState(0);
  
  // Withdraw States (Repartidor)
  const [withdrawMethod, setWithdrawMethod] = useState<'mp' | 'cvu' | 'cbu'>('mp');
  const [withdrawVal, setWithdrawVal] = useState<string>('');
  const [withdrawDest, setWithdrawDest] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState('');

  // States for Billetera Comercio
  const [storeBalanceAvailable, setStoreBalanceAvailable] = useState(0);
  const [storeExpenses, setStoreExpenses] = useState(0); 

  // States for Billetera Administrador
  const [adminCommissions, setAdminCommissions] = useState(0);
  const [adminHeldFunds, setAdminHeldFunds] = useState(0);
  const [adminReleasedFunds, setAdminReleasedFunds] = useState(0);
  const [adminAlerts, setAdminAlerts] = useState<{ id: string, type: string, msg: string }[]>([]);

  // Loading initial transactions and triggering Gemini insight
  const fetchFinanceData = async () => {
    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const summaryText = `
          Analizá resumidamente los siguientes balances logísticos del Capítulo 3 del sistema Delivery Plus en Posadas:
          - Billetera Rider: Disponible $${riderBalanceAvailable}, Pendiente $${riderBalancePending}
          - Billetera Comercio: Disponible $${storeBalanceAvailable}, Gastos $${storeExpenses}
          - Billetera Administrador: Comisiones totales $${adminCommissions}, Reservado en Escrow $${adminHeldFunds}
          
          Brindá en español un solo consejo financiero, directo y muy corto, en tono corporativo elegante y profesional. Máximo 25 palabras.
        `;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { role: 'user', parts: [{ text: summaryText }] }
        });
        setIaAdvice(response.text?.trim() || "La liquidez actual es óptima. Mantener los sumarios de retención de comisiones activos.");
      } else {
        setIaAdvice("Para optimizar comisiones, se recomienda mantener activos los filtros preventivos bancarios del Capítulo 3.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const addLocalTransaction = (txData: any) => {
    const newTx: Transaccion = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      monto: txData.monto,
      tipo: txData.tipo,
      detalle: txData.detalle,
      fecha: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Simulating the Delivery Plus Escrow Flow step-by-step
  const handleNextEscrowStep = () => {
    if (escrowStep === 5) {
      setEscrowStep(1);
      notificationService.playAlert('info');
      return;
    }
    const next = escrowStep + 1;
    setEscrowStep(next);
    
    if (next === 2) {
      setAdminHeldFunds(prev => prev + escrowAmount);
      notificationService.playAlert('info');
      notificationService.notify('Fondos en Garantía', `Se retienen temporalmente los $${escrowAmount} del ${escrowDetail}.`);
    } else if (next === 3) {
      notificationService.playAlert('info');
      notificationService.notify('Ruta Finalizada', 'El Rider marcó el pedido como entregado en Posadas.');
    } else if (next === 4) {
      notificationService.playAlert('success');
      notificationService.notify('Verificación Exitosa', 'El cliente confirmó la entrega en su app celular.');
    } else if (next === 5) {
      const commission = Math.round(escrowAmount * 0.12);
      const riderNet = escrowAmount - commission;
      
      setAdminHeldFunds(prev => Math.max(0, prev - escrowAmount));
      setAdminCommissions(prev => prev + commission);
      setAdminReleasedFunds(prev => prev + escrowAmount);
      setRiderBalanceAvailable(prev => prev + riderNet);
      
      addLocalTransaction({
        monto: riderNet,
        tipo: 'GANANCIA_CHOFER',
        detalle: `Pago Liberado: ${escrowDetail}`
      });
      fetchFinanceData();

      notificationService.playAlert('success');
      notificationService.notify('Fondos Distribuidos', `Comisión: $${commission} (Plataforma), Ganancia Rider: $${riderNet} (Disponible).`);
    }
  };

  const handleAutoRunEscrowFlow = () => {
    if (isSimulatingEscrow) return;
    setIsSimulatingEscrow(true);
    setEscrowStep(1);
    notificationService.playAlert('info');

    let current = 1;
    const interval = setInterval(() => {
      current += 1;
      setEscrowStep(current);
      
      if (current === 2) {
        setAdminHeldFunds(prev => prev + escrowAmount);
        notificationService.notify('Garantía Escrow Activada', `Se retienen temporalmente $${escrowAmount}.`);
      } else if (current === 3) {
        notificationService.notify('Progreso: Entregado', 'Repartidor completó el viaje.');
      } else if (current === 4) {
        notificationService.notify('Progreso: Confirmado', 'El cliente validó la conformidad del envío.');
      } else if (current === 5) {
        const commission = Math.round(escrowAmount * 0.12);
        const riderNet = escrowAmount - commission;
        
        setAdminHeldFunds(prev => Math.max(0, prev - escrowAmount));
        setAdminCommissions(prev => prev + commission);
        setAdminReleasedFunds(prev => prev + escrowAmount);
        setRiderBalanceAvailable(prev => prev + riderNet);
        
        addLocalTransaction({
          monto: riderNet,
          tipo: 'GANANCIA_CHOFER',
          detalle: `Ciclo Completado: ${escrowDetail}`
        });
        fetchFinanceData();

        notificationService.playAlert('success');
        notificationService.notify('Distribución Exitosa', 'Fondos acreditados al Rider con liberación de comisión.');
        clearInterval(interval);
        setIsSimulatingEscrow(false);
      }
    }, 1800);
  };

  // Payout / Withdraw logic for Riders (Repartidor)
  const handleRiderWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    const amt = parseFloat(withdrawVal);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawError('Por favor ingrese un monto de retiro válido.');
      return;
    }
    if (amt > riderBalanceAvailable) {
      setWithdrawError('Saldo disponible insuficiente para efectuar la extracción solicitada.');
      return;
    }
    if (!withdrawDest.trim()) {
      setWithdrawError('Especifique el número de CBU, CVU de destino o alias de cuenta.');
      return;
    }

    setIsProcessing(true);
    notificationService.playAlert('info');
    
    setTimeout(async () => {
      setRiderBalanceAvailable(prev => prev - amt);
      const labelMap = { mp: 'Mercado Pago', cvu: 'Cuenta Digital CVU', cbu: 'Cuenta Bancaria CBU' };
      
      addLocalTransaction({
        monto: -amt,
        tipo: 'RETIRO',
        detalle: `Retiro (${labelMap[withdrawMethod]}) a ${withdrawDest}`
      });
      
      await fetchFinanceData();
      setIsProcessing(false);
      setWithdrawVal('');
      setWithdrawDest('');
      notificationService.playAlert('success');
      notificationService.notify(
        'Retiro Procesado',
        `$${amt} transferidos exitosamente a su cuenta vinculada (${labelMap[withdrawMethod]}).`
      );
    }, 1200);
  };

  // Simulate extra revenue or expense for Comercio
  const handleSimulateStoreAction = async (type: 'sale' | 'expense') => {
    notificationService.playAlert('info');
    if (type === 'sale') {
      const saleAmt = 12500;
      const commishFee = Math.round(saleAmt * 0.12);
      const storeNet = saleAmt - commishFee;

      setStoreBalanceAvailable(prev => prev + storeNet);
      setAdminCommissions(prev => prev + commishFee);

      addLocalTransaction({
        monto: storeNet,
        tipo: 'ENVIO',
        detalle: `Venta Comercial - Cliente Delivery Plus`
      });
      await fetchFinanceData();
      notificationService.playAlert('success');
      notificationService.notify('Venta Registrada', `Acreditación: $${storeNet} (descontando 12% de comisión de red).`);
    } else {
      const expenseAmt = 18000;
      if (storeBalanceAvailable < expenseAmt) {
        notificationService.notify('Saldo Insuficiente', 'El saldo comercial no cubre esta membresía prepaga.');
        return;
      }
      setStoreBalanceAvailable(prev => prev - expenseAmt);
      setStoreExpenses(prev => prev + expenseAmt);
      setAdminReleasedFunds(prev => prev + expenseAmt);

      addLocalTransaction({
        monto: -expenseAmt,
        tipo: 'MEMBRESIA_PAQUETERIA',
        detalle: 'Compra de Kit Profesional / Publicidad Oro'
      });
      await fetchFinanceData();
      notificationService.playAlert('success');
      notificationService.notify('Gasto Acreditado', `Kit Profesional abonado con cargo directo: $${expenseAmt}.`);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* HEADER DE LA BILLETERA */}
      <header className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="px-4 py-1.5 bg-plus-blue/10 text-plus-blue rounded-full font-black text-[9px] uppercase tracking-widest border border-plus-blue/10">
            CAPÍTULO 3 • SISTEMA DE BILLETERAS
          </span>
          <h2 className="text-5xl font-black tracking-tighter leading-none italic uppercase mt-4">
            Gestión de <span className="text-plus-blue">Fondos</span>
          </h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Administración unificada de balances de plataforma, repartidores, comercios y comisiones.
          </p>
        </div>

        {/* SELECTOR DE SUBBILLETERAS COMPATIBLES */}
        <div className="grid grid-cols-2 sm:flex bg-slate-100 p-1.5 rounded-[2rem] border border-black/5 w-full md:w-auto gap-1">
          {(['delivery-plus', 'repartidor', 'comercio', 'administrador'] as SubWalletType[]).map((type) => {
            const labels = {
              'delivery-plus': '🛡️ Delivery Plus',
              'repartidor': '🛵 Repartidor',
              'comercio': '🏢 Comercio',
              'administrador': '👔 Administrador'
            };
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setActiveWallet(type);
                  notificationService.playAlert('info');
                }}
                className={`px-4 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all leading-none ${
                  activeWallet === type 
                    ? 'bg-black text-white shadow-md' 
                    : 'text-slate-500 hover:text-black hover:bg-slate-200'
                }`}
              >
                {labels[type]}
              </button>
            )
          })}
        </div>
      </header>

      {/* RENDERIZADO PRINCIPAL SEGÚN BILLETERA ACTIVA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL DE CONTROL CENTRAL */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. BILLETERA DELIVERY PLUS (ESCROW RETENCION) */}
          {activeWallet === 'delivery-plus' && (
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10 relative overflow-hidden z-10">
              <BrandWatermark opacity="opacity-[0.05]" className="top-1/2" />
              <div className="border-b border-slate-100 pb-6 relative z-10">
                <span className="px-3.5 py-1 bg-blue-50 text-plus-blue rounded-full text-[9px] font-black uppercase tracking-wider">
                  MÓDULO DE ESCROW CENTRAL
                </span>
                <h3 className="text-3xl font-black tracking-tight uppercase italic text-gray-950 mt-3">
                  Billetera Delivery Plus
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  La plataforma retiene temporalmente los fondos para asegurar que el servicio sea correcto.
                </p>
              </div>

              {/* FLUJO DIGITAL DE ARQUITECTURA */}
              <div className="relative">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#009EE3] mb-6">FLUJO NORMATIVO DE FONDOS REQUISITO</p>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                  
                  {/* STEP 1: CLIENTE PAGA */}
                  <div className={`p-5 rounded-2xl border transition-all relative ${escrowStep === 1 ? 'bg-plus-blue text-white shadow-lg border-plus-blue' : 'bg-slate-50 text-slate-500 border-black/5'}`}>
                    <span className="text-xs font-black block">PASO 1</span>
                    <span className="text-lg block mt-2">💳</span>
                    <h4 className="text-xs font-black uppercase mt-1">Cliente paga</h4>
                    <p className="text-[9px] font-medium opacity-80 mt-1">Transacción iniciada.</p>
                  </div>

                  {/* STEP 2: FONDOS RETENIDOS */}
                  <div className={`p-5 rounded-2xl border transition-all relative ${escrowStep === 2 ? 'bg-amber-500 text-white shadow-lg border-amber-600' : 'bg-slate-50 text-slate-500 border-black/5'}`}>
                    <span className="text-xs font-black block">PASO 2</span>
                    <span className="text-lg block mt-2">🔒</span>
                    <h4 className="text-xs font-black uppercase mt-1">Retenidos</h4>
                    <p className="text-[9px] font-medium opacity-80 mt-1">Resguardo en custodia.</p>
                  </div>

                  {/* STEP 3: TRABAJO COMPLETADO */}
                  <div className={`p-5 rounded-2xl border transition-all relative ${escrowStep === 3 ? 'bg-blue-600 text-white shadow-lg border-blue-700' : 'bg-slate-50 text-slate-500 border-black/5'}`}>
                    <span className="text-xs font-black block">PASO 3</span>
                    <span className="text-lg block mt-2">🗺️</span>
                    <h4 className="text-xs font-black uppercase mt-1">Completado</h4>
                    <p className="text-[9px] font-medium opacity-80 mt-1">Ruta finalizada.</p>
                  </div>

                  {/* STEP 4: CONFIRMACIÓN */}
                  <div className={`p-5 rounded-2xl border transition-all relative ${escrowStep === 4 ? 'bg-indigo-600 text-white shadow-lg border-indigo-700' : 'bg-slate-50 text-slate-500 border-black/5'}`}>
                    <span className="text-xs font-black block">PASO 4</span>
                    <span className="text-lg block mt-2">👍</span>
                    <h4 className="text-xs font-black uppercase mt-1">Confirmación</h4>
                    <p className="text-[9px] font-medium opacity-80 mt-1">Conformidad cliente.</p>
                  </div>

                  {/* STEP 5: FONDOS LIBERADOS */}
                  <div className={`p-5 rounded-2xl border transition-all relative ${escrowStep === 5 ? 'bg-emerald-600 text-white shadow-lg border-emerald-700' : 'bg-slate-50 text-slate-500 border-black/5'}`}>
                    <span className="text-xs font-black block">PASO 5</span>
                    <span className="text-lg block mt-2">💸</span>
                    <h4 className="text-xs font-black uppercase mt-1">Liberados</h4>
                    <p className="text-[9px] font-medium opacity-80 mt-1">Acreditación balance.</p>
                  </div>

                </div>
              </div>

              {/* SIMULADOR INTERACTIVO DEL SUMARIO */}
              <div className="bg-slate-50 p-8 rounded-3xl border border-black/5 space-y-6">
                <div>
                  <h4 className="text-sm font-black uppercase text-gray-950 flex items-center gap-2">
                    🕹️ Simulador de Retención Temporal
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">Pruebe dinámicamente cómo viaja el dinero de un pedido y se distribuye.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-wider text-slate-400">Valor de Prueba ($)</label>
                    <input 
                      type="number"
                      value={escrowAmount} 
                      onChange={e => setEscrowAmount(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-wider text-slate-400">Concepto o Detalle</label>
                    <input 
                      type="text"
                      value={escrowDetail} 
                      onChange={e => setEscrowDetail(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleNextEscrowStep}
                    className="px-6 py-4 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                  >
                    Retroalimentar Paso ({escrowStep}/5)
                  </button>
                  <button
                    onClick={handleAutoRunEscrowFlow}
                    disabled={isSimulatingEscrow}
                    className="px-6 py-4 bg-plus-blue hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isSimulatingEscrow ? 'Simulando...' : '⚡ Corrida Automática'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. BILLETERA REPARTIDOR */}
          {activeWallet === 'repartidor' && (
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10 animate-in slide-in-from-right duration-300 relative overflow-hidden z-10">
              <BrandWatermark opacity="opacity-[0.05]" className="top-1/2" />
              <div className="border-b border-slate-100 pb-6 flex justify-between items-start flex-wrap gap-4 relative z-10">
                <div>
                  <span className="px-3 py-1 bg-yellow-50 text-amber-800 rounded-full text-[9px] font-black uppercase tracking-wider">
                    Socio: Ramiro Tech (Rider Diamante)
                  </span>
                  <h3 className="text-3xl font-black tracking-tight uppercase italic text-gray-950 mt-3">
                    Billetera Repartidor
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">Estatuto de saldos diarios y semanales de cadetería express.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border text-right">
                  <span className="text-[9px] font-black text-slate-400 block uppercase">Nivel Comisiones</span>
                  <span className="text-xs font-black text-emerald-600 block">Fijo: 100% Viáticos Sin Cargo</span>
                </div>
              </div>

              {/* CUENTAS DE BALANCES REQUISITO */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                
                <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                  <span className="text-[8px] font-black uppercase tracking-wider text-amber-700 block">Saldo Pendiente</span>
                  <h4 className="text-xl font-black text-amber-950 mt-2">${riderBalancePending.toLocaleString()}</h4>
                  <p className="text-[8px] mt-1 text-amber-700/80 font-bold">Escrow activo</p>
                </div>

                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                  <span className="text-[8px] font-black uppercase tracking-wider text-emerald-700 block">Disponible</span>
                  <h4 className="text-xl font-black text-emerald-950 mt-2">${riderBalanceAvailable.toLocaleString()}</h4>
                  <p className="text-[8px] mt-1 text-emerald-700/80 font-bold">Retirable libre</p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 animate-pulse">
                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Ganancia Diaria</span>
                  <h4 className="text-lg font-black text-slate-900 mt-2">${riderEarningsDaily.toLocaleString()}</h4>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Ganancia Semanal</span>
                  <h4 className="text-lg font-black text-slate-900 mt-2">${riderEarningsWeekly.toLocaleString()}</h4>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 col-span-2 md:col-span-1">
                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Mes en Curso</span>
                  <h4 className="text-lg font-black text-slate-900 mt-2">${riderEarningsMonthly.toLocaleString()}</h4>
                </div>

              </div>

              {/* FORMULARIO DE EXTRACCIÓN / RETIRO MUESTRA */}
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-black/5">
                <h4 className="text-sm font-black uppercase text-gray-950 flex items-center gap-2 mb-4">
                  📤 Formular Solicitud de Retiro de Fondos
                </h4>
                
                <form onSubmit={handleRiderWithdraw} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => { 
                        setWithdrawMethod('mp'); 
                        setWithdrawDest('alias.mp.ramiro.tech'); 
                        notificationService.playAlert('info');
                      }}
                      className={`p-4 rounded-xl border font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all ${withdrawMethod === 'mp' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600'}`}
                    >
                      Mercado Pago
                    </button>
                    <button
                      type="button"
                      onClick={() => { 
                        setWithdrawMethod('cvu'); 
                        setWithdrawDest('0000003100029384729104'); 
                        notificationService.playAlert('info');
                      }}
                      className={`p-4 rounded-xl border font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all ${withdrawMethod === 'cvu' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600'}`}
                    >
                      Retiro a CVU
                    </button>
                    <button
                      type="button"
                      onClick={() => { 
                        setWithdrawMethod('cbu'); 
                        setWithdrawDest('0110483730048192837482'); 
                        notificationService.playAlert('info');
                      }}
                      className={`p-4 rounded-xl border font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all ${withdrawMethod === 'cbu' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600'}`}
                    >
                      Retiro a CBU
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-400">Monto a Retirar ($)</label>
                      <input 
                        type="number"
                        placeholder="Ej. 15000" 
                        value={withdrawVal}
                        onChange={e => setWithdrawVal(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-400">Coordenadas del destino (CBU / CVU / CVU Alias)</label>
                      <input 
                        type="text"
                        placeholder="Ingresa CBU, CVU o alias" 
                        value={withdrawDest}
                        onChange={e => setWithdrawDest(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs" 
                      />
                    </div>
                  </div>

                  {withdrawError && (
                    <p className="text-xs text-rose-600 font-extrabold">⚠️ {withdrawError}</p>
                  )}

                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="px-8 py-4.5 bg-black hover:bg-plus-blue text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                  >
                    {isProcessing ? 'TRANSFIRIENDO...' : 'Confirmar Retiro Inmediato'}
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* 3. BILLETERA COMERCIO */}
          {activeWallet === 'comercio' && (
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10 animate-in slide-in-from-right duration-300 relative overflow-hidden z-10">
              <BrandWatermark opacity="opacity-[0.05]" className="top-1/2" />
              <div className="border-b border-slate-100 pb-6 flex justify-between items-start flex-wrap gap-4 relative z-10">
                <div>
                  <span className="px-3 py-1 bg-violet-50 text-indigo-700 rounded-full text-[9px] font-black uppercase tracking-wider">
                    Establecimiento: Hamburguesas Posadas (Plan Oro)
                  </span>
                  <h3 className="text-3xl font-black tracking-tight uppercase italic text-gray-950 mt-3">
                    Billetera Comercio
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">Control de fondos disponibles y egresos corporativos en la red.</p>
                </div>
              </div>

              {/* SALDOS COMERCIO REGISTRADOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-black/5 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Fondos Disponibles</span>
                    <h4 className="text-3xl font-[900] text-gray-900 mt-2">${storeBalanceAvailable.toLocaleString()}</h4>
                  </div>
                  <span className="text-4xl">🏢</span>
                </div>

                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 block">Suma de Gastos</span>
                    <h4 className="text-3xl font-[900] text-indigo-950 mt-2">${storeExpenses.toLocaleString()}</h4>
                  </div>
                  <span className="text-4xl">💸</span>
                </div>

              </div>

              {/* INTERACCION COMERCIO EXTRAS */}
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-black/5 space-y-6">
                <div>
                  <h4 className="text-sm font-black uppercase text-gray-950">⚙️ Autoprocesamiento de Movimientos de Negocio</h4>
                  <p className="text-xs text-slate-400 mt-1">Estimule la billetera del local emitiendo ventas de prueba o comprando insumos.</p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleSimulateStoreAction('sale')}
                    className="px-6 py-4 bg-emerald-650 hover:bg-emerald-700 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                  >
                    Simular Pedido Venta (+$12.500)
                  </button>
                  <button
                    onClick={() => handleSimulateStoreAction('expense')}
                    className="px-6 py-4 bg-black hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                  >
                    Adquirir Pack Socio (Gasto -$18.000)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. BILLETERA ADMINISTRADOR */}
          {activeWallet === 'administrador' && (
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10 animate-in slide-in-from-right duration-300 relative overflow-hidden z-10">
              <BrandWatermark opacity="opacity-[0.05]" className="top-1/2" />
              <div className="border-b border-slate-100 pb-6 relative z-10">
                <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-[9px] font-black uppercase tracking-wider">
                  Solo Operadores Centrales Autorizados • Nivel 1
                </span>
                <h3 className="text-3xl font-black tracking-tight uppercase italic text-gray-950 mt-3">
                  Billetera Administrador
                </h3>
                <p className="text-slate-500 text-xs mt-1">Rendimiento anual, auditoría de comisiones cobradas y alertas de seguridad.</p>
              </div>

              {/* ESTADOS FINANCIEROS CLAVE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-6 rounded-2xl text-white">
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 block">Comisiones Ganadas</span>
                  <h4 className="text-2xl font-[900] mt-2">${adminCommissions.toLocaleString()}</h4>
                  <p className="text-[10px] text-white/50 mt-1">Margen de comisiones 12%</p>
                </div>

                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-150 text-amber-950">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block">Fondos Retenidos</span>
                  <h4 className="text-2xl font-[900] mt-2">${adminHeldFunds.toLocaleString()}</h4>
                  <p className="text-[10px] text-amber-850/65 mt-1">Garantía transitoria</p>
                </div>

                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-150 text-emerald-950">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-850 block">Fondos Liberados</span>
                  <h4 className="text-2xl font-[900] mt-2">${adminReleasedFunds.toLocaleString()}</h4>
                  <p className="text-[10px] text-emerald-800/60 mt-1">Entregados con éxito</p>
                </div>
              </div>

              {/* SECCION ALERTA DE COMPLIANCE ADMNISTRADOR COMPLETA */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-rose-650 text-rose-600">🚨 Alertador Fiscal y de Desvíos Activos</h4>
                
                <div className="space-y-2">
                  {adminAlerts.map(alert => (
                    <div key={alert.id} className="flex gap-4 p-5 bg-rose-50/50 border border-rose-100 rounded-2xl items-start">
                      <span className="text-xl">⚠️</span>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-rose-950 leading-snug">{alert.msg}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setAdminAlerts(prev => prev.filter(a => a.id !== alert.id));
                          notificationService.notify('Alerta Resuelta', 'Se desestimó el aviso operativo fiscal.');
                          notificationService.playAlert('success');
                        }}
                        className="text-[9px] font-bold uppercase tracking-wider hover:underline text-rose-700"
                      >
                        Solucionar
                      </button>
                    </div>
                  ))}
                  {adminAlerts.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400 font-semibold italic bg-slate-50 rounded-2xl border border-dashed">
                      ✓ No hay desvíos tributarios ni alertas en la red de Posadas.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* COLUMNA DERECHA: INSIGHTS DE IA Y HISTORIAL */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* DIGITAL IA ADVICE CARD CARD */}
          <div className="bg-[#0A0A0B] p-10 rounded-[3.5rem] text-white relative overflow-hidden flex flex-col justify-center border border-white/5 shadow-2xl">
            <span className="text-[8px] font-black uppercase text-plus-blue tracking-[0.2em] mb-2">Delivery Plus AI Advisor</span>
            <h4 className="text-3xl font-black italic uppercase tracking-tighter mb-4 leading-none">
              Monitoreo <span className="text-plus-blue">Financiero</span>
            </h4>
            <div className="text-xs text-white/75 font-semibold leading-relaxed mb-6 bg-white/5 p-4 rounded-xl border border-white/10 italic">
              "{iaAdvice}"
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Algoritmo Capítulo 3 OK</p>
            </div>
            <div className="absolute -bottom-10 -right-10 text-[10rem] font-black text-white/[0.012] italic rotate-12 pointer-events-none">WAL</div>
          </div>

          {/* HISTORIAL GENERAL DE AUDITORIA */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <div>
              <p className="text-[8px] font-black text-plus-blue uppercase tracking-widest">Capítulo 3 • Libro Mayor</p>
              <h4 className="text-xl font-black uppercase tracking-tight text-gray-900 mt-1">Historial de Red</h4>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
              {transactions.map(tx => (
                <div key={tx.id} className="p-4 bg-slate-50 rounded-2xl border border-black/5 flex justify-between items-center hover:border-plus-blue/10 transition-all">
                  <div>
                    <p className="text-[10px] font-black text-slate-800 leading-tight">{tx.detalle}</p>
                    <span className="text-[8px] font-black text-slate-400 block mt-1 uppercase">{tx.tipo}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[11px] font-black block ${tx.monto > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {tx.monto > 0 ? '+' : ''}${tx.monto}
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold block mt-0.5">
                      {new Date(tx.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-6">No se registraron cobros ni pagos temporalmente.</p>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default WalletView;
