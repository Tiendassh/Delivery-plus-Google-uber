import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { mockApi } from '../services/mockApi';
import { apiService } from '../services/apiService';
import { notificationService } from '../services/notificationService';
import { PlanComercio, ChatRoom } from '../types';
import { firebaseService } from '../services/firebaseService';

type StoreType = 'comercio' | 'emprendedor';

const StoreOnboardingView: React.FC = () => {
  const [selectedType, setSelectedType] = useState<StoreType>('comercio');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Basic states
  const [showChat, setShowChat] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Form Fields
  const [form, setForm] = useState({
    // Comercios specific
    razonSocial: '',
    cuit: '',
    direccion: '',
    telefono: '',
    correo: '',
    plan: PlanComercio.BRONCE,
    categoria: 'Comida',
    
    // Emprendedores specific
    dni: '',
    emprendedorNombre: '',
    emprendedorTelefono: '',
    emprendedorCorreo: '',
    
    // Joint attributes
    aceptarTerminos: false,
    googlePlaceId: ''
  });

  // Verification states
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState<string | null>(null);
  const [emailOtpField, setEmailOtpField] = useState('');

  const [isSendingPhone, setIsSendingPhone] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState<string | null>(null);
  const [phoneOtpField, setPhoneOtpField] = useState('');

  // AI Auditor Report
  const [aiAuditReport, setAiAuditReport] = useState<{
    valid: boolean;
    confidence: number;
    issues: string[];
    summary: string;
  } | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Unique Lead ID for Chat feature with operations team
  const leadId = useRef(`LEAD_STORE_${Date.now()}`);

  useEffect(() => {
    if (showChat) {
      const unsubscribe = firebaseService.subscribe(leadId.current, (chat) => {
        setChatRoom(chat);
        setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
      });
      return unsubscribe;
    }
  }, [showChat]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const nameLabel = selectedType === 'comercio' ? (form.razonSocial || 'Afiliado') : (form.emprendedorNombre || 'Emprendedor');
    firebaseService.sendMessage(leadId.current, 'OWNER', nameLabel, inputText, 'USUARIO');
    setInputText('');
  };

  const handleSendEmailOtp = () => {
    const targetEmail = selectedType === 'comercio' ? form.correo : form.emprendedorCorreo;
    if (!targetEmail || !targetEmail.includes('@')) {
      notificationService.notify('Email Inválido', 'Por favor, introduce una casilla de correo electrónico válida.');
      return;
    }

    setIsSendingEmail(true);
    notificationService.playAlert('info');
    setTimeout(() => {
      setIsSendingEmail(false);
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setEmailOtpSent(code);
      notificationService.playAlert('success');
      notificationService.notify(
        'Correo de Verificación',
        `[SIMULACIÓN] Delivery Plus envió código de activación ${code} al correo ${targetEmail}`
      );
    }, 1200);
  };

  const handleVerifyEmail = () => {
    if (emailOtpField === emailOtpSent) {
      setEmailVerified(true);
      notificationService.playAlert('success');
      notificationService.notify('Correo Verificado', 'Tu casilla de e-mail ha sido autenticada en el nodo central.');
    } else {
      notificationService.playAlert('info');
      notificationService.notify('Código Inválido', 'El token ingresado no coincide con el enviado.');
    }
  };

  const handleSendPhoneOtp = () => {
    const targetPhone = selectedType === 'comercio' ? form.telefono : form.emprendedorTelefono;
    if (!targetPhone) {
      notificationService.notify('Teléfono Inválido', 'Por favor, introduce un número de teléfono móvil.');
      return;
    }

    setIsSendingPhone(true);
    notificationService.playAlert('info');
    setTimeout(() => {
      setIsSendingPhone(false);
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setPhoneOtpSent(code);
      notificationService.playAlert('success');
      notificationService.notify(
        'SMS Recibido',
        `[SIMULACIÓN] Token de activación SMS: ${code} al nro ${targetPhone}`
      );
    }, 1200);
  };

  const handleVerifyPhone = () => {
    if (phoneOtpField === phoneOtpSent) {
      setPhoneVerified(true);
      notificationService.playAlert('success');
      notificationService.notify('Teléfono Verificado', 'El número de teléfono móvil está verificado.');
    } else {
      notificationService.playAlert('info');
      notificationService.notify('Código Inválido', 'El código de seguridad ingresado no concuerda.');
    }
  };

  const handleRunAiAudit = async () => {
    setIsAuditing(true);
    notificationService.playAlert('info');

    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });

      const detailPrompt = selectedType === 'comercio' 
        ? `Consorcio: Razón Social "${form.razonSocial}", CUIT: "${form.cuit}", Correo verificado: ${emailVerified ? 'SÍ' : 'NO'}, Teléfono: "${form.telefono}", Rubro: "${form.categoria}".`
        : `Emprendedor unipersonal: Nombre "${form.emprendedorNombre}", DNI: "${form.dni}", Correo verificado: ${emailVerified ? 'SÍ' : 'NO'}, Teléfono: "${form.emprendedorTelefono}".`;

      const auditPrompt = `
        Sos un clasificador y auditor mercantil de la red logística Delivery Plus de Posadas.
        Analiza si el siguiente registro del tipo "${selectedType.toUpperCase()}" cumple con las normativas dadas en el Capítulo 2 (Sistemas de Registros Comerciales):
        
        ${detailPrompt}
        
        Generá un reporte analítico resumido en formato JSON que respete estrictamente este esquema:
        {
          "valid": boolean (indicando si tiene los requisitos legales ingresados),
          "confidence": number (nivel de calidad fiscal de 0 a 100),
          "issues": array de string (alertas, advertencias o advertencias de CUIT si son requeridas),
          "summary": string (un resumen profesional de la habilitación tributaria y comercial del solicitante)
        }
        Retorna ÚNICAMENTE la cadena JSON nítida, sin bloques de código formateados ni markdown adicional.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: auditPrompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const cleanJson = response.text?.trim() || '{}';
      const parsed = JSON.parse(cleanJson);
      setAiAuditReport(parsed);

    } catch (err) {
      console.error(err);
      // Fallback local robusto
      const isOk = selectedType === 'comercio' 
        ? !!form.razonSocial && !!form.cuit && emailVerified
        : !!form.emprendedorNombre && !!form.dni && emailVerified;

      setAiAuditReport({
        valid: isOk,
        confidence: isOk ? 95 : 55,
        issues: !emailVerified ? ['El correo electrónico del comercio/emprendedor aún no ha completado la validación criptográfica OTP.'] : [],
        summary: `Pre-visualización de auditoría fiscal completada en modo offline. Los datos presentados parecen ${isOk ? 'correctamente validados para inicio de expedientes.' : 'incompletos o carecen de email autenticado.'}`
      });
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSubmit = async () => {
    if (!emailVerified) {
      notificationService.notify('Verificación Requerida', 'El correo electrónico debe ser verificado para cumplir con los estándares del Capítulo 2.');
      return;
    }
    if (selectedType === 'comercio' && (!form.razonSocial || !form.cuit || !form.direccion)) {
      notificationService.notify('Faltan Campos', 'Por favor complete Razón social, CUIT y Dirección comercial.');
      return;
    }
    if (selectedType === 'emprendedor' && (!form.emprendedorNombre || !form.dni)) {
      notificationService.notify('Faltan Campos', 'Por favor complete Nombre del emprendedor y número de DNI.');
      return;
    }

    setLoading(true);
    try {
      const nombreRegistro = selectedType === 'comercio' ? form.razonSocial : `Emp: ${form.emprendedorNombre}`;
      const cuitRegistro = selectedType === 'comercio' ? form.cuit : `DNI-${form.dni}`;
      const categoriaRes = selectedType === 'comercio' ? form.categoria : 'Emprendimiento / Artesanal';

      // Llamar al mockApi para registrar la tienda o afiliado
      await mockApi.registerStore({
        nombre: nombreRegistro,
        categoria: categoriaRes,
        plan: selectedType === 'comercio' ? form.plan : PlanComercio.BRONCE,
        estado: 'ACTIVO'
      });

      setSuccess(true);
      notificationService.playAlert('success');
    } catch (err) {
      console.error(err);
      notificationService.notify('Error', 'No se ha podido procesar el alta debido a una interrupción en el servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center p-24 bg-white rounded-[5rem] border border-slate-100 shadow-2xl max-w-4xl mx-auto text-black animate-in zoom-in duration-500">
      <div className="text-9xl mb-12">🏢</div>
      <h2 className="text-5xl font-black tracking-tighter uppercase italic text-center">¡Alta Registrada con Éxito!</h2>
      <p className="text-slate-500 font-medium text-center mt-6 max-w-lg">
        El perfil comercial de {selectedType === 'comercio' ? form.razonSocial : form.emprendedorNombre} ha quedado habilitado bajo los estatutos normativos del sistema de logística.
      </p>
      
      <div className="mt-8 px-8 py-5 bg-slate-50 rounded-2xl border border-black/5 w-full max-w-md text-xs">
        <p className="font-extrabold uppercase tracking-wider text-slate-800">Resumen Fiscal Habilitado:</p>
        <ul className="mt-3 space-y-1.5 font-bold text-slate-600">
          <li>• Tipo de Afiliado: {selectedType.toUpperCase()}</li>
          <li>• Correo: {selectedType === 'comercio' ? form.correo : form.emprendedorCorreo} (Verificado ✓)</li>
          <li>• Identificación: {selectedType === 'comercio' ? `CUIT ${form.cuit}` : `DNI ${form.dni}`}</li>
        </ul>
      </div>

      <button 
        onClick={() => window.location.reload()} 
        className="mt-12 px-12 py-6 bg-black hover:bg-plus-blue text-white rounded-full font-black uppercase text-xs tracking-widest transition-all shadow-md"
      >
        Ir al Dashboard Principal
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 text-black relative">
      
      {/* SECCIÓN FLOTANTE CHAT DE ASESORÍA LOGÍSTICA */}
      <div className="fixed bottom-10 right-10 z-[100]">
        {!showChat ? (
          <button 
            onClick={() => setShowChat(true)}
            className="bg-plus-blue text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-all border-4 border-white animate-bounce"
          >
            💬
          </button>
        ) : (
          <div className="w-96 h-[550px] bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden border border-slate-105 animate-in slide-in-from-bottom duration-500">
            <div className="p-8 bg-black text-white flex justify-between items-center">
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-plus-blue mb-1">Mesa de Ayuda Registro</p>
                <h4 className="text-sm font-black italic uppercase">Soporte Corporativo</h4>
              </div>
              <button onClick={() => setShowChat(false)} className="text-white/40 hover:text-white">✕</button>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 no-scrollbar">
              {chatRoom?.mensajes.length === 0 && (
                <div className="text-center py-10 opacity-30">
                  <p className="text-xs font-bold leading-relaxed">¿Tienes dudas sobre los planes de habilitación?<br/>Escríbenos directamente.</p>
                </div>
              )}
              {chatRoom?.mensajes.map(m => (
                <div key={m.id} className={`flex flex-col ${m.emisorId === 'OWNER' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] font-bold shadow-sm ${m.emisorId === 'OWNER' ? 'bg-plus-blue text-white' : 'bg-white text-black border border-black/5'}`}>
                    {m.texto}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-slate-100 bg-white flex gap-2">
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribir consulta..."
                className="flex-1 bg-slate-50 border border-slate-100 px-5 py-3.5 rounded-xl text-xs font-bold focus:shadow-sm"
              />
              <button onClick={handleSendMessage} className="bg-plus-blue text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">🚀</button>
            </div>
          </div>
        )}
      </div>

      {/* HEADER DE LA SECCIÓN */}
      <header className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full font-black text-[9px] uppercase tracking-widest border border-indigo-100">
            CAPÍTULO 2 • SISTEMA DE AFILIADOS
          </span>
          <h2 className="text-5xl font-black tracking-tighter leading-none italic uppercase mt-4">
            Inscripción <span className="text-plus-blue">Comercios</span>
          </h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Alta y auditoría de tiendas corporativas y emprendimientos artesanales locales.
          </p>
        </div>

        {/* CONTRAFICHA SEGMENTADA TIPO DE CUENTA */}
        <div className="flex bg-slate-105 p-1.5 rounded-[2rem] border border-black/5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setSelectedType('comercio');
              setEmailVerified(false);
              setPhoneVerified(false);
              setAiAuditReport(null);
            }}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all leading-none ${
              selectedType === 'comercio' ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-black hover:bg-slate-200'
            }`}
          >
            <span>🏢</span> Comercio
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedType('emprendedor');
              setEmailVerified(false);
              setPhoneVerified(false);
              setAiAuditReport(null);
            }}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all leading-none ${
              selectedType === 'emprendedor' ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-black hover:bg-slate-200'
            }`}
          >
            <span>🏠</span> Emprendedor
          </button>
        </div>
      </header>

      {/* WORKFLOW GRÁFICO DEL FORMULARIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA PRINCIPAL DEL FORMULARIO */}
        <div className="lg:col-span-8 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-10 flex flex-col justify-between">
          
          {/* PASO 1: DATOS FISCALES / IDENTIDAD */}
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-400">
              <div className="border-b border-indigo-100 pb-4 mb-4">
                <h3 className="text-xl font-bold uppercase tracking-tight text-gray-950 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-black text-white text-xs font-black flex items-center justify-center leading-none">1</span>
                  {selectedType === 'comercio' ? 'Datos del Comercio Registrado' : 'Datos del Emprendedor Local'}
                </h3>
                <p className="text-slate-400 text-xs mt-1">Identificación comercial oficial para el encuadramiento en la red tributaria.</p>
              </div>

              {selectedType === 'comercio' ? (
                // COMERCIO FIELDS
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Razón Social</label>
                      <input 
                        required
                        placeholder="Ej. Sándwiches Del Misionero S.A." 
                        value={form.razonSocial} 
                        onChange={e => setForm({...form, razonSocial: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-xl font-bold text-xs" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">CUIT Impositivo</label>
                      <input 
                        required
                        placeholder="Ej. 30-71938472-9" 
                        value={form.cuit} 
                        onChange={e => setForm({...form, cuit: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-xl font-bold text-xs" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Dirección del Local</label>
                      <input 
                        required
                        placeholder="Ej. Av. Uruguay 2310, Posadas, Misiones" 
                        value={form.direccion} 
                        onChange={e => setForm({...form, direccion: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-xl font-bold text-xs" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Rubro Principal</label>
                      <select 
                        value={form.categoria} 
                        onChange={e => setForm({...form, categoria: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 px-5 py-4.5 rounded-xl font-bold text-xs"
                      >
                        <option>Comida</option>
                        <option>Farmacia</option>
                        <option>Paquetería</option>
                        <option>Supermercado</option>
                        <option>Indumentaria / Decoración</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                // EMPRENDEDOR FIELDS
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Nombre y Apellido</label>
                      <input 
                        required
                        placeholder="Ej. Micaela Estefanía Galeano" 
                        value={form.emprendedorNombre} 
                        onChange={e => setForm({...form, emprendedorNombre: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-xl font-bold text-xs" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Número de DNI</label>
                      <input 
                        required
                        placeholder="Ej. 42394857" 
                        value={form.dni} 
                        onChange={e => setForm({...form, dni: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-xl font-bold text-xs" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASO 2: VERIFICACIONES CONTACTO MANDATORIAS */}
          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-400">
              <div className="border-b border-indigo-100 pb-4 mb-4">
                <h3 className="text-xl font-bold uppercase tracking-tight text-gray-950 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-black text-white text-xs font-black flex items-center justify-center leading-none">2</span>
                  Autenticación Canales de Contacto
                </h3>
                <p className="text-slate-400 text-xs mt-1">Conforme a las directivas del Capítulo 2, los canales móviles y e-mail deben certificarse mediante OTP.</p>
              </div>

              {/* AUTENTICACIÓN EMAIL (CORREO VERIFICADO - REQUISITO EXPLICITO) */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-205 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight text-gray-950 flex gap-2 items-center">
                      📧 Correo Electrónico Verificado
                      {emailVerified && <span className="text-[8px] bg-emerald-100 px-2 py-0.5 rounded-full text-emerald-850 font-black border border-emerald-300">ACTIVO ✓</span>}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Utilizado para resúmenes de comisiones comerciales y estado legal.</p>
                  </div>
                  {emailVerified && <span className="text-emerald-500 font-extrabold text-xs">✓ Habilitación Confirmada</span>}
                </div>

                {!emailVerified ? (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <input 
                        placeholder="Ej. administracion@comercio.com" 
                        value={selectedType === 'comercio' ? form.correo : form.emprendedorCorreo}
                        onChange={e => {
                          if (selectedType === 'comercio') {
                            setForm({...form, correo: e.target.value});
                          } else {
                            setForm({...form, emprendedorCorreo: e.target.value});
                          }
                        }}
                        className="flex-1 bg-white border border-slate-200 px-5 py-3.5 rounded-xl font-bold text-xs" 
                      />
                      <button 
                        type="button" 
                        onClick={handleSendEmailOtp}
                        disabled={isSendingEmail}
                        className="px-6 py-3.5 bg-black hover:bg-plus-blue text-white rounded-xl text-xs font-black uppercase tracking-widest leading-none"
                      >
                        {isSendingEmail ? 'Enviando...' : 'Autenticar Email'}
                      </button>
                    </div>

                    {emailOtpSent && (
                      <div className="p-4 bg-white rounded-2xl border border-emerald-200 flex gap-4 items-center">
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-emerald-850 uppercase">Token de Correo SMS/Simulación</p>
                          <input 
                            placeholder="Ej. código de 4 dígitos" 
                            value={emailOtpField} 
                            onChange={e => setEmailOtpField(e.target.value)} 
                            className="w-full mt-1 bg-slate-50 border border-slate-155 px-4 py-2 rounded-lg font-mono text-center font-bold tracking-widest text-emerald-900 text-xs" 
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={handleVerifyEmail}
                          className="px-6 py-4 bg-emerald-900 hover:bg-emerald-850 text-white rounded-xl font-black text-[9px] uppercase tracking-widest self-end"
                        >
                          Verificar Casilla
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium italic">Correo ligado con éxito a la pasarela electrónica.</p>
                )}
              </div>

              {/* AUTENTICACIÓN TELÉFONO */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-205 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight text-gray-950 flex gap-2 items-center">
                      📱 Teléfono de Coordinación Comercial
                      {phoneVerified && <span className="text-[8px] bg-emerald-100 px-2 py-0.5 rounded-full text-emerald-850 font-black border border-emerald-300">CONECTADO ✓</span>}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Soporte telefónico inmediato para despachar riders de repuesto.</p>
                  </div>
                  {phoneVerified && <span className="text-emerald-500 font-extrabold text-xs">✓ Verificado SMS</span>}
                </div>

                {!phoneVerified ? (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <input 
                        placeholder="Ej. +54 376 4302910" 
                        value={selectedType === 'comercio' ? form.telefono : form.emprendedorTelefono}
                        onChange={e => {
                          if (selectedType === 'comercio') {
                            setForm({...form, telefono: e.target.value});
                          } else {
                            setForm({...form, emprendedorTelefono: e.target.value});
                          }
                        }}
                        className="flex-1 bg-white border border-slate-200 px-5 py-3.5 rounded-xl font-bold text-xs" 
                      />
                      <button 
                        type="button" 
                        onClick={handleSendPhoneOtp}
                        disabled={isSendingPhone}
                        className="px-6 py-3.5 bg-black hover:bg-plus-blue text-white rounded-xl text-xs font-black uppercase tracking-widest leading-none"
                      >
                        {isSendingPhone ? 'Enviando...' : 'Autenticar Nro'}
                      </button>
                    </div>

                    {phoneOtpSent && (
                      <div className="p-4 bg-white rounded-2xl border border-emerald-200 flex gap-4 items-center">
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-emerald-850 uppercase">Token SMS Simulado</p>
                          <input 
                            placeholder="Ej. código de 4 dígitos" 
                            value={phoneOtpField} 
                            onChange={e => setPhoneOtpField(e.target.value)} 
                            className="w-full mt-1 bg-slate-50 border border-slate-155 px-4 py-2 rounded-lg font-mono text-center font-bold tracking-widest text-emerald-900 text-xs" 
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={handleVerifyPhone}
                          className="px-6 py-4 bg-emerald-900 hover:bg-emerald-850 text-white rounded-xl font-black text-[9px] uppercase tracking-widest self-end"
                        >
                          Verificar SMS
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium italic">Canal homologado para despachos directos del local.</p>
                )}
              </div>
            </div>
          )}

          {/* PASO 3: MODELOS DE PLANES SI ES COMERCIO COMPLETO */}
          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-400">
              <div className="border-b border-indigo-100 pb-4 mb-4">
                <h3 className="text-xl font-bold uppercase tracking-tight text-gray-950 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-black text-white text-xs font-black flex items-center justify-center leading-none">3</span>
                  Estructura de Comisiones
                </h3>
                <p className="text-slate-400 text-xs mt-1">Defina el bloque organizativo comercial de acuerdo a su volumen comercial.</p>
              </div>

              {selectedType === 'comercio' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* BRONCE */}
                  <div 
                    onClick={() => setForm({...form, plan: PlanComercio.BRONCE})}
                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[220px] ${form.plan === PlanComercio.BRONCE ? 'bg-indigo-50 border-plus-blue text-indigo-950 shadow-md' : 'bg-slate-50 border-black/5 hover:border-slate-300'}`}
                  >
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">Plan Bronce</h4>
                      <p className="text-[10px] opacity-70 mt-2 font-semibold">Básico. 15% Comisión.</p>
                    </div>
                    <span className="text-[9px] font-black tracking-widest uppercase text-plus-blue mt-6 block">★ Ideal Nuevos Locales</span>
                  </div>

                  {/* SILVER */}
                  <div 
                    onClick={() => setForm({...form, plan: PlanComercio.SILVER})}
                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[220px] ${form.plan === PlanComercio.SILVER ? 'bg-indigo-50 border-plus-blue text-indigo-950 shadow-md' : 'bg-slate-50 border-black/5 hover:border-slate-300'}`}
                  >
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">Plan Plata</h4>
                      <p className="text-[10px] opacity-70 mt-2 font-semibold">Intermedio. 12% Comisión + Soporte Web.</p>
                    </div>
                    <span className="text-[9px] font-black tracking-widest uppercase text-plus-blue mt-6 block">★ Volumen Medio</span>
                  </div>

                  {/* GOLD */}
                  <div 
                    onClick={() => setForm({...form, plan: PlanComercio.GOLD})}
                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[220px] ${form.plan === PlanComercio.GOLD ? 'bg-indigo-50 border-plus-blue text-indigo-950 shadow-md' : 'bg-slate-50 border-black/5 hover:border-slate-300'}`}
                  >
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">Plan Oro</h4>
                      <p className="text-[10px] opacity-70 mt-2 font-semibold">VIP. 8% Comisión + Publicidad Corporativa.</p>
                    </div>
                    <span className="text-[9px] font-black tracking-widest uppercase text-plus-blue mt-6 block">★ Alta Demanda</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-150 space-y-4">
                  <span className="text-3xl">🏠</span>
                  <h4 className="text-sm font-black uppercase tracking-wide text-indigo-950">Plan Único Emprendedor</h4>
                  <p className="text-xs text-indigo-900/85 font-medium leading-relaxed">
                    Comisión plana del 5% por envío. Sin tarifas mensuales de mantenimiento ni costos fijos, optimizado para artesanos o micro creadores independientes con pedidos esporádicos en Posadas.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* MENÚ DE COMPORTAMIENTO NAVEGADOR DE PASOS */}
          <div className="flex gap-4 pt-8 border-t border-slate-100 mt-10">
            {step > 1 && (
              <button 
                type="button" 
                onClick={() => setStep(step - 1)} 
                className="px-8 py-5.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-colors"
              >
                Atrás
              </button>
            )}
            
            {step < 3 ? (
              <button 
                type="button" 
                onClick={() => {
                  if (step === 1 && selectedType === 'comercio' && (!form.razonSocial || !form.cuit)) {
                    notificationService.notify('Campos Vacíos', 'La Razón Social y el CUIT son obligatorios.');
                    return;
                  }
                  if (step === 1 && selectedType === 'emprendedor' && (!form.emprendedorNombre || !form.dni)) {
                    notificationService.notify('Campos Vacíos', 'El nombre y el DNI son obligatorios.');
                    return;
                  }
                  setStep(step + 1);
                }} 
                className="flex-1 py-5.5 bg-black hover:bg-indigo-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
              >
                Siguiente Paso
              </button>
            ) : (
              <div className="flex-1 flex gap-4">
                <button
                  type="button"
                  onClick={handleRunAiAudit}
                  disabled={isAuditing}
                  className="px-6 py-5.5 border-2 border-black hover:bg-black hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  {isAuditing ? 'Auditando...' : '🤖 Auditoría AI'}
                </button>
                
                <button 
                  type="button"
                  onClick={handleSubmit} 
                  disabled={loading} 
                  className="flex-1 py-5.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-55 shadow-[0_15px_30px_rgba(79,70,229,0.25)]"
                >
                  {loading ? 'HABILITANDO COMERCIO...' : 'Finalizar Registro'}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* COLUMNA LATERAL: REQUISITOS CAPÍTULO 2 Y REPORTES */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* DISPLAY DEL REPORTE GENERADO CON INTELIGENCIA ARTIFICIAL */}
          {aiAuditReport ? (
            <div className={`p-8 rounded-[3rem] border shadow-md animate-in zoom-in-50 duration-350 ${
              aiAuditReport.valid 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                : 'bg-rose-50 border-rose-200 text-rose-955'
            }`}>
              <div className="flex justify-between items-center border-b pb-4 mb-4" style={{ borderColor: aiAuditReport.valid ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)' }}>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest opacity-60">Módulo de Auditoría</h4>
                  <h3 className="text-xl font-black italic mt-1">{aiAuditReport.valid ? 'APTO OPERATIVO' : 'DOCUMENTO AFECTADO'}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold block opacity-60">Puntaje Habilitación</span>
                  <span className="text-2xl font-black italic">{aiAuditReport.confidence}%</span>
                </div>
              </div>

              <p className="text-xs font-semibold leading-relaxed mb-6">{aiAuditReport.summary}</p>

              {aiAuditReport.issues.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider block opacity-70">Sugerencias encontradas:</span>
                  <ul className="space-y-2">
                    {aiAuditReport.issues.map((issue, idx) => (
                      <li key={idx} className="text-[11px] font-bold flex items-start gap-2 leading-tight">
                        <span className="text-xs">⚠️</span> {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#0A0A0B] p-10 rounded-[3.5rem] text-white relative overflow-hidden flex flex-col justify-center border border-white/5 shadow-2xl">
              <h4 className="text-3xl font-black italic uppercase tracking-tighter mb-6 leading-tight">Canal Seguro<br/><span className="text-plus-blue">Garantizado</span></h4>
              
              <ul className="space-y-4 text-xs font-medium text-white/60 mb-8 list-none">
                <li className="flex gap-2">✓ <span>Las altas de comercios requieren de validación de CUIT fiscal ante AFIP.</span></li>
                <li className="flex gap-2 font-semibold text-emerald-400">✓ <span>El correo electrónico verificado protege sus despachos.</span></li>
              </ul>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Canal Criptográfico Oficial Activo</p>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 text-[12rem] font-black text-white/[0.015] italic rotate-12 pointer-events-none">REG</div>
            </div>
          )}

          {/* CAJA DE REQUISITOS EXPLÍCITOS DEL CAPÍTULO 2 */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div>
              <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Capítulo 2 • Requisitos Oficiales</p>
              <h4 className="text-lg font-black uppercase tracking-tight text-gray-900 mt-1">{selectedType === 'comercio' ? 'Requisitos Comercio' : 'Requisitos Emprendedor'}</h4>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-600 font-bold">
              {selectedType === 'comercio' ? (
                <>
                  <li className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black leading-none ${form.razonSocial ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-105 text-slate-500'}`}>
                      {form.razonSocial ? '✓' : '1'}
                    </span>
                    <span className="flex-1">Razón Social declarada</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black leading-none ${form.cuit ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-105 text-slate-500'}`}>
                      {form.cuit ? '✓' : '2'}
                    </span>
                    <span className="flex-1">CUIT Impositivo activo</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black leading-none ${form.direccion ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-105 text-slate-500'}`}>
                      {form.direccion ? '✓' : '3'}
                    </span>
                    <span className="flex-1">Dirección del Local</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black leading-none ${phoneVerified ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-105 text-slate-500'}`}>
                      {phoneVerified ? '✓' : '4'}
                    </span>
                    <span className="flex-1">Teléfono verificado</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black leading-none ${emailVerified ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-105 text-slate-500'}`}>
                      {emailVerified ? '✓' : '5'}
                    </span>
                    <span className="flex-1 font-semibold text-indigo-850">Correo Verificado (Obligatorio)</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black leading-none ${form.emprendedorNombre ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-105 text-slate-500'}`}>
                      {form.emprendedorNombre ? '✓' : '1'}
                    </span>
                    <span className="flex-1">Nombre completo</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black leading-none ${form.dni ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-105 text-slate-500'}`}>
                      {form.dni ? '✓' : '2'}
                    </span>
                    <span className="flex-1">DNI de la Persona Física</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black leading-none ${phoneVerified ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-105 text-slate-500'}`}>
                      {phoneVerified ? '✓' : '3'}
                    </span>
                    <span className="flex-1 font-semibold text-indigo-800">Teléfono móvil verificado</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black leading-none ${emailVerified ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-105 text-slate-500'}`}>
                      {emailVerified ? '✓' : '4'}
                    </span>
                    <span className="flex-1">Correo electrónico</span>
                  </li>
                </>
              )}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};

export default StoreOnboardingView;
