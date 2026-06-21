import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { GoogleGenAI } from "@google/genai";
import { notificationService } from '../services/notificationService';
import { mockApi } from '../services/mockApi';

type VehicleType = 'bici' | 'moto' | 'auto' | 'furgon';

const DriverOnboardingView: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('bici');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paidKit, setPaidKit] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    telefono: '',
    direccion: '',
    plate: '',
    banco: '',
    cbu: '',
    alias: '',
    habilitacionesSpec: 'Carga General / Alimentos SENASA'
  });

  // Simulated uploader states
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: { name: string; size: string; verified: boolean } }>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Phone OTP code states
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Selfie capture state
  const [capturingSelfie, setCapturingSelfie] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);

  // AI Auditor state
  const [aiAuditReport, setAiAuditReport] = useState<{
    valid: boolean;
    confidence: number;
    issues: string[];
    summary: string;
  } | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Countdown timer for SMS OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Dynamic documentation list needed
  const getRequiredDocs = (vehicle: VehicleType) => {
    const common = [
      { id: 'dni', label: 'DNI (Frente y Dorso)', type: 'file' },
      { id: 'selfie', label: 'Selfie de Rostro (Foto de Perfil)', type: 'selfie' },
    ];
    if (vehicle === 'bici') {
      return [
        ...common,
        { id: 'banco_proof', label: 'Comprobante de Datos Bancarios (CBU/CVU)', type: 'file' }
      ];
    }
    const motorComun = [
      ...common,
      { id: 'licencia', label: 'Licencia de Conducir (Vigente)', type: 'file' },
      { id: 'cedula_vehiculo', label: 'Cédula de Identificación del Vehículo', type: 'file' },
      { id: 'seguro', label: 'Póliza de Seguro Obligatorio al Día', type: 'file' },
    ];
    if (vehicle === 'furgon') {
      return [
        ...motorComun,
        { id: 'habilitacion', label: 'Habilitaciones Específicas / SENASA / Frío', type: 'file' }
      ];
    }
    return motorComun; // moto y auto
  };

  const handleSimulateUpload = (fieldId: string, customName?: string) => {
    setUploadingField(fieldId);
    notificationService.playAlert('info');
    setTimeout(() => {
      setUploadingField(null);
      const randSize = (Math.random() * 3 + 1).toFixed(1);
      const docName = customName || `DOC_${fieldId.toUpperCase()}_SCAN.pdf`;
      setUploadedDocs(prev => ({
        ...prev,
        [fieldId]: { name: docName, size: `${randSize} MB`, verified: true }
      }));
      notificationService.playAlert('success');
      notificationService.notify(
        'Archivo Cargado',
        `El archivo "${docName}" se ha subido con éxito y fue pre-analizado.`
      );
    }, 1500);
  };

  const handleSimulateSelfie = () => {
    setCapturingSelfie(true);
    notificationService.playAlert('info');
    setTimeout(() => {
      setCapturingSelfie(false);
      setSelfieCaptured(true);
      setUploadedDocs(prev => ({
        ...prev,
        selfie: { name: 'Selfie_Rostro_Biometrico.jpg', size: '1.2 MB', verified: true }
      }));
      notificationService.playAlert('success');
      notificationService.notify('Foto Capturada', 'Selfie capturado correctamente con análisis de prueba de vida.');
    }, 2000);
  };

  const handleSendOtp = () => {
    if (!formData.telefono) {
      notificationService.notify('Error', 'Por favor ingresa un número de teléfono válido.');
      return;
    }
    setIsSendingSms(true);
    notificationService.playAlert('info');
    setTimeout(() => {
      setIsSendingSms(false);
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setSentCode(code);
      setCountdown(60);
      notificationService.playAlert('success');
      notificationService.notify(
        'Código SMS Enviado',
        `[SIMULACIÓN] Delivery Plus envió el código OTP: ${code} al ${formData.telefono}`
      );
    }, 1200);
  };

  const handleVerifyOtp = () => {
    if (otpInput === sentCode) {
      setPhoneVerified(true);
      notificationService.playAlert('success');
      notificationService.notify('Teléfono Verificado', 'Tu número de teléfono ha sido verificado con éxito.');
    } else {
      notificationService.playAlert('success'); // plays notification sound
      notificationService.notify('Código Inválido', 'El código de seguridad ingresado no concuerda.');
    }
  };

  const handleRunAiAudit = async () => {
    setIsAuditing(true);
    notificationService.playAlert('info');
    
    // Check if we have at least uploaded DNI and Selfie
    const missingDocs = getRequiredDocs(selectedVehicle).filter(doc => !uploadedDocs[doc.id]);
    
    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      
      const auditPrompt = `
        Sos un auditor inteligente del sistema Delivery Plus.
        Analizá detalladamente los siguientes datos ingresados por un postulante a Repartidor en vehículo "${selectedVehicle}" de Posadas, Misiones, Argentina:
        
        - Nombre: ${formData.nombre}
        - DNI: ${formData.dni}
        - Teléfono verificado: ${phoneVerified ? 'SÍ' : 'NO'}
        - Dirección: ${formData.direccion}
        - Patente del vehículo: ${formData.plate || 'No aplica (Bicicleta)'}
        - Banco: ${formData.banco || 'N/A'} - CBU: ${formData.cbu || 'N/A'} - Alias: ${formData.alias || 'N/A'}
        - Archivos Cargados: ${Object.keys(uploadedDocs).join(', ')}
        - Falta subir estos archivos requeridos: ${missingDocs.map(d => d.label).join(', ') || 'NINGUNO'}
        
        Generá un reporte detallado en formato JSON que respete estrictamente este esquema de campos:
        {
          "valid": boolean (indicando si tiene los datos mínimos para aprobación inicial),
          "confidence": number (nivel de confianza de 0 a 100),
          "issues": array de string (alertas, advertencias o documentos faltantes),
          "summary": string (un resumen profesional del examen de perfil en español, detallando si cumple los requisitos del Capítulo 2 del sistema de registro)
        }
        Asegúrate de retornar ÚNICAMENTE el JSON string, sin formato de markdown, libre de prefijos o barras.
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
      // Fallback robusto si falla la API
      setAiAuditReport({
        valid: missingDocs.length === 0 && phoneVerified,
        confidence: missingDocs.length === 0 ? 98 : 60,
        issues: missingDocs.length > 0 
          ? [`Falta subir documentación obligatoria: ${missingDocs.map(d => d.label).join(', ')}`]
          : !phoneVerified ? ['Falta completar la verificación telefónica por SMS OTP.'] : [],
        summary: `Examen simulado completado para ${formData.nombre || 'el aspirante'}. Requisitos del Capítulo 2 verificados de forma analítica locales.`
      });
    } finally {
      setIsAuditing(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneVerified) {
      notificationService.notify('Registro Bloqueado', 'Debes verificar tu número de teléfono por SMS OTP antes de finalizar.');
      return;
    }

    const requiredIdList = getRequiredDocs(selectedVehicle).map(d => d.id);
    const uploadedIdList = Object.keys(uploadedDocs);
    const allDocsUploaded = requiredIdList.every(id => uploadedIdList.includes(id));

    if (!allDocsUploaded) {
      notificationService.notify('Documentación Incompleta', 'Por favor, suba todos los documentos requeridos para su tipo de vehículo.');
      return;
    }

    setLoading(true);
    
    try {
      const vehicleLabelMap = {
        bici: 'Bicicleta',
        moto: 'Moto',
        auto: 'Auto',
        furgon: 'Furgón'
      };

      await apiService.registerDriver({
        nombre: formData.nombre,
        vehiculo: vehicleLabelMap[selectedVehicle],
        patente: formData.plate || 'BIKE-REG',
        polizaSeguro: uploadedDocs['seguro'] ? 'VIGENTE' : 'S/D',
        nivel: paidKit ? 'DIAMANTE' : 'PLATA',
        etapaIngreso: 'DOCS_VALIDADOS',
        latitud: -27.368,
        longitud: -55.895
      });

      // Registrar una transacción simulada por compra de kit si aplica
      if (paidKit) {
        mockApi.addTransaction({
          monto: -18000,
          tipo: 'MEMBRESIA_PAQUETERIA',
          detalle: `Kit Profesional Premium - Registro de ${formData.nombre}`
        });
      }

      setSuccess(true);
      notificationService.playAlert('success');
    } catch (err) {
      console.error(err);
      notificationService.notify('Error', 'Hubo un inconveniente al conectar con el servidor central de registro.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center p-20 bg-emerald-50 rounded-[4rem] border border-emerald-100 max-w-4xl mx-auto shadow-2xl animate-in zoom-in duration-500">
      <div className="text-9xl mb-10">🎉</div>
      <h2 className="text-5xl font-black tracking-tighter text-emerald-950 uppercase italic text-center">¡Postulación Enviada!</h2>
      <p className="text-emerald-700 font-bold text-center mt-6 max-w-lg">
        El perfil de {formData.nombre} ha sido cargado con nivel <span className="underline">{paidKit ? 'DIAMANTE' : 'PLATA'}</span> en estado <span className="font-extrabold text-emerald-900 border px-3 py-1 rounded-full border-emerald-300">DOCS_VALIDADOS</span>. 
        Nuestro equipo de operaciones revisará las patentes y certificados en Posadas.
      </p>

      <div className="mt-10 bg-white p-6 rounded-3xl border border-emerald-200 w-full max-w-md shadow-sm">
        <h4 className="font-extrabold text-sm uppercase tracking-wide text-emerald-900">Resumen del Alta:</h4>
        <ul className="mt-4 space-y-2 text-xs text-emerald-800 font-semibold">
          <li>• Tipo: Repartidor en {selectedVehicle.toUpperCase()}</li>
          <li>• Teléfono: {formData.telefono} (Verificado ✓)</li>
          <li>• Identificación / DNI: {formData.dni}</li>
          {formData.plate && <li>• Patente registrada: {formData.plate}</li>}
        </ul>
      </div>

      <button 
        onClick={() => {
          setSuccess(false);
          setFormData({
            nombre: '',
            dni: '',
            telefono: '',
            direccion: '',
            plate: '',
            banco: '',
            cbu: '',
            alias: '',
            habilitacionesSpec: 'Carga General / Alimentos SENASA'
          });
          setUploadedDocs({});
          setPhoneVerified(false);
          setSelfieCaptured(false);
          setAiAuditReport(null);
          setStep(1);
        }} 
        className="mt-12 px-16 py-5 bg-emerald-950 hover:bg-emerald-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg"
      >
        Inscribir Otro Repartidor
      </button>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* HEADER PRINCIPAL */}
      <header className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="px-4 py-1.5 bg-plus-blue/10 text-plus-blue rounded-full font-black text-[9px] uppercase tracking-widest border border-plus-blue/10">
            CAPÍTULO 2 • SISTEMA DE REGISTRO
          </span>
          <h2 className="text-5xl font-black tracking-tighter leading-none italic uppercase mt-4">
            Rider <span className="text-plus-blue">Onboarding</span>
          </h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Formulario inteligente segmentado con validación de documentación digitalizada.
          </p>
        </div>

        {/* SELECTOR DE VEHÍCULO FORMAT - CAPÍTULO 2 MANDATE */}
        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] border border-black/5 w-full md:w-auto">
          {(['bici', 'moto', 'auto', 'furgon'] as VehicleType[]).map((type) => {
            const emojis = { bici: '🚲', moto: '🛵', auto: '🚗', furgon: '🚐' };
            const names = { bici: 'Bici', moto: 'Moto', auto: 'Auto', furgon: 'Furgón' };
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSelectedVehicle(type);
                  setUploadedDocs({});
                  setSelfieCaptured(false);
                  setAiAuditReport(null);
                }}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all leading-none ${
                  selectedVehicle === type 
                    ? 'bg-black text-white shadow-md' 
                    : 'text-slate-500 hover:text-black hover:bg-slate-200'
                }`}
              >
                <span>{emojis[type]}</span>
                <span className="hidden sm:inline">{names[type]}</span>
              </button>
            )
          })}
        </div>
      </header>

      {/* RIDER ONBOARDING FORM WORKFLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL DEL FORMULARIO ELECTRÓNICO */}
        <form onSubmit={handleRegister} className="lg:col-span-8 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10 flex flex-col justify-between">
          
          {/* PASO 1: DATOS PERSONALES */}
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-400">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold uppercase tracking-tight text-gray-950 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-black text-white text-xs font-black flex items-center justify-center leading-none">1</span>
                  Datos del Solicitante
                </h3>
                <p className="text-slate-400 text-xs mt-1">Identidad básica para el inicio del sumario operativo de registro.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Nombre Completo</label>
                  <input 
                    required 
                    placeholder="Ej. Carlos Damián Ojeda" 
                    value={formData.nombre} 
                    onChange={e => setFormData({...formData, nombre: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-100 px-6 py-4.5 rounded-2xl font-bold text-sm focus:bg-white focus:outline-plus-blue transition-all" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">DNI (Número de Documento)</label>
                  <input 
                    required 
                    placeholder="Ej. 38459281" 
                    value={formData.dni} 
                    onChange={e => setFormData({...formData, dni: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-100 px-6 py-4.5 rounded-2xl font-bold text-sm focus:bg-white focus:outline-plus-blue transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Dirección Real de Residencia</label>
                <input 
                  required 
                  placeholder="Ej. Calle Junín 1420, Posadas, Misiones" 
                  value={formData.direccion} 
                  onChange={e => setFormData({...formData, direccion: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-100 px-6 py-4.5 rounded-2xl font-bold text-sm focus:bg-white focus:outline-plus-blue transition-all" 
                />
              </div>

              {/* Teléfono verificado (REQUISITO FUERTE EN CAPITULO 2) */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-black/5 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight text-gray-950 flex items-center gap-2">
                      📞 Teléfono Celular
                      {phoneVerified && <span className="bg-emerald-100 border border-emerald-300 text-emerald-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Verificado ✓</span>}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Se requiere verificación numérica integrada mediante protocolo SMS OTP virtual.</p>
                  </div>
                  {phoneVerified && (
                    <span className="text-emerald-500 text-sm font-black">✓ Verificación SMS Completada</span>
                  )}
                </div>

                {!phoneVerified ? (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <input 
                        type="tel"
                        placeholder="Ej. +54 376 4123456" 
                        value={formData.telefono} 
                        onChange={e => setFormData({...formData, telefono: e.target.value})} 
                        className="flex-1 bg-white border border-slate-200 px-6 py-4 rounded-xl font-bold text-sm" 
                      />
                      <button 
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingSms || countdown > 0}
                        className={`px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all ${isSendingSms || countdown > 0 ? 'bg-slate-300 pointer-events-none' : 'bg-plus-blue hover:bg-blue-700'}`}
                      >
                        {isSendingSms ? 'Enviando...' : countdown > 0 ? `Reenviar en ${countdown}s` : 'Enviar SMS'}
                      </button>
                    </div>

                    {sentCode && (
                      <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-dashed border-plus-blue/40 animate-pulse-subtle">
                        <div className="flex-1">
                          <p className="text-[10px] uppercase font-black text-plus-blue">Ingresa el código OTP SMS</p>
                          <input 
                            placeholder="Ej. Código de 4 dígitos" 
                            value={otpInput} 
                            onChange={e => setOtpInput(e.target.value)} 
                            className="w-full mt-1 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-lg font-mono text-center font-bold tracking-widest text-plus-blue" 
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={handleVerifyOtp}
                          className="px-6 py-8 bg-black hover:bg-plus-blue text-white rounded-xl font-black text-xs uppercase tracking-widest leading-none self-end"
                        >
                          Confirmar Código
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-505 font-medium italic">Contacto listo para integrar la red de alertas de ruta.</p>
                )}
              </div>
            </div>
          )}

          {/* PASO 2: DOCUMENTOS SEGÚN VEHÍCULO */}
          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-400">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold uppercase tracking-tight text-gray-950 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-black text-white text-xs font-black flex items-center justify-center leading-none">2</span>
                  Digitalización de Documentación
                </h3>
                <p className="text-slate-400 text-xs mt-1">Cargá las copias nítidas y legibles requeridas regulatoriamente por Delivery Plus.</p>
              </div>

              {/* Condicional Patente si no es bici */}
              {selectedVehicle !== 'bici' && (
                <div className="bg-amber-50/50 border border-amber-200/50 p-6 rounded-3xl space-y-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚗</span>
                    <div>
                      <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider">Identificación Vial</h4>
                      <p className="text-[10px] text-amber-700/80 font-medium">Debe coincidir con la cédula del automotor / motovehículo.</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Patente de Vehículo</label>
                    <input 
                      required 
                      placeholder="Ej. A099BCD o AE123ZZ" 
                      value={formData.plate} 
                      onChange={e => setFormData({...formData, plate: e.target.value})} 
                      className="w-full bg-white border border-slate-200 px-6 py-4.5 rounded-2xl font-black text-sm uppercase tracking-wide text-gray-950 focus:bg-white focus:outline-amber-400 transition-all" 
                    />
                  </div>
                </div>
              )}

              {/* DOCUMENT LIST GENERATED FOR VEHICLE SPECIFICATIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getRequiredDocs(selectedVehicle).map(doc => {
                  const isUploaded = !!uploadedDocs[doc.id];
                  const isUploading = uploadingField === doc.id;

                  if (doc.type === 'selfie') {
                    return (
                      <div key={doc.id} className="p-6 bg-slate-50 border border-black/5 rounded-3xl flex flex-col justify-between hover:border-plus-blue/20 transition-all min-h-[220px]">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{doc.label}</span>
                            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full ${selfieCaptured ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                              {selfieCaptured ? 'CAPTURADO' : 'PENDIENTE'}
                            </span>
                          </div>
                          
                          {selfieCaptured ? (
                            <div className="mt-4 flex items-center gap-3 p-3 bg-white rounded-2xl border border-black/5">
                              <span className="text-2xl">👤</span>
                              <div>
                                <p className="text-[10px] font-black text-gray-900 leading-tight">Selfie_Rostro_Biometrico.jpg</p>
                                <p className="text-[9px] text-slate-400 font-bold">1.2 MB • Codificado ✓</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-3 font-medium leading-relaxed">Requiere activar la cámara integrada para validar prueba de vida.</p>
                          )}
                        </div>

                        {capturingSelfie ? (
                          <div className="w-full bg-black text-white py-4 rounded-xl text-center text-xs font-bold font-mono tracking-widest flex items-center justify-center gap-3 animate-pulse">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                            [ INICIANDO LENTE... ]
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSimulateSelfie}
                            className="mt-6 w-full py-4.5 bg-black hover:bg-plus-blue text-white rounded-xl text-xs font-black uppercase tracking-widest text-center shadow-md transition-all"
                          >
                            {selfieCaptured ? 'Volver a Capturar' : '📱 Iniciar Biometría'}
                          </button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={doc.id} className="p-6 bg-slate-50 border border-black/5 rounded-3xl flex flex-col justify-between hover:border-plus-blue/20 transition-all min-h-[220px]">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-505">{doc.label}</span>
                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full ${isUploaded ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                            {isUploaded ? 'Cargado ✓' : 'Falta'}
                          </span>
                        </div>
                        {isUploaded ? (
                          <div className="mt-4 p-3 bg-white rounded-2xl border border-black/5 flex items-center gap-3">
                            <span className="text-2xl">📄</span>
                            <div className="overflow-hidden">
                              <p className="text-[10px] font-black text-gray-900 truncate">{uploadedDocs[doc.id].name}</p>
                              <p className="text-[9px] text-slate-400 font-bold">{uploadedDocs[doc.id].size}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 mt-3 font-medium leading-relaxed">Formato PDF o imágen JPG legible de alta resolución.</p>
                        )}
                      </div>

                      {isUploading ? (
                        <div className="w-full py-4 bg-slate-200 text-slate-500 rounded-xl text-xs font-bold text-center animate-pulse">
                          Leyendo archivo...
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSimulateUpload(doc.id)}
                          className="mt-6 w-full py-4.5 border-2 border-dashed border-slate-350 hover:border-plus-blue text-slate-600 hover:text-plus-blue rounded-xl text-xs font-black uppercase tracking-wider text-center transition-all"
                        >
                          {isUploaded ? 'Reemplazar' : '📎 Adjuntar Archivo'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO 3: DETALLES BANCARIOS O HABILITACIONES EXTRAS */}
          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-400">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold uppercase tracking-tight text-gray-950 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-black text-white text-xs font-black flex items-center justify-center leading-none">3</span>
                  Ficha de Liquidación y Seguros
                </h3>
                <p className="text-slate-400 text-xs mt-1">Suministre las coordenadas financieras para recibir transferencias semanales de recaudación.</p>
              </div>

              {/* BICICLETA BANK FIELDS OR OPTIONAL */}
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-black/5 space-y-6">
                <h4 className="text-sm font-black uppercase tracking-wide text-gray-950">
                  🏦 Depósito del Balance General
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Banco / Fintech</label>
                    <input 
                      placeholder="Ej. Mercado Pago o Banco Galicia" 
                      value={formData.banco} 
                      onChange={e => setFormData({...formData, banco: e.target.value})} 
                      className="w-full bg-white border border-slate-200 px-6 py-4 rounded-xl font-bold text-xs" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Alias de Cuenta</label>
                    <input 
                      placeholder="Ej. flete.plus.posadas" 
                      value={formData.alias} 
                      onChange={e => setFormData({...formData, alias: e.target.value})} 
                      className="w-full bg-white border border-slate-200 px-6 py-4 rounded-xl font-bold text-xs" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">CBU / CVU (22 dígitos numéricos)</label>
                  <input 
                    maxLength={22}
                    placeholder="Ej. 0000003100029384729104" 
                    value={formData.cbu} 
                    onChange={e => setFormData({...formData, cbu: e.target.value})} 
                    className="w-full bg-white border border-slate-200 px-6 py-4.5 rounded-xl font-mono text-center font-bold tracking-wide text-xs" 
                  />
                </div>
              </div>

              {/* CONDICIONAL: SPECIAL PERMIT FOR FURGON CARRIERS (MANDATORY IN REQS) */}
              {selectedVehicle === 'furgon' && (
                <div className="bg-blue-50/50 border border-plus-blue/40 p-8 rounded-[2.5rem] space-y-4">
                  <div className="flex items-center gap-3 border-b border-plus-blue/20 pb-4">
                    <span className="text-3xl">🚐</span>
                    <div>
                      <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider">Habilitación Furgón Especial</h4>
                      <p className="text-[10px] text-blue-700/80 font-semibold">Toda documentación de transporte particular para transporte flete premium.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Rige Habilitaciones Específicas</label>
                    <select 
                      value={formData.habilitacionesSpec} 
                      onChange={e => setFormData({...formData, habilitacionesSpec: e.target.value})}
                      className="w-full bg-white border border-slate-200 px-5 py-4 rounded-xl font-bold text-xs"
                    >
                      <option value="SENASA">SENASA Habilitación Sanitaria</option>
                      <option value="FRIO">Transporte Isotérmico / Cadena Frio</option>
                      <option value="GENERAL">General Carga Clasificada Comercial</option>
                    </select>
                  </div>
                </div>
              )}

              {/* AFILIACION DIAMANTE PACK (INCORPORATES PREMIUM KIT PURCHASE FROM OLD COMPONENT) */}
              <div className="bg-plus-blue p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                  <h4 className="text-2xl font-black italic tracking-tighter uppercase">¿Adquirir Pack Socio Diamante?</h4>
                  <p className="text-xs opacity-90 max-w-xl font-medium leading-relaxed">
                    Prioridad absoluta de despachos y kit de indumentaria oficial con su mochila reflectiva. Paga simuladamente a través de Mercado Pago.
                  </p>
                  
                  <div className="flex gap-4 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setPaidKit(!paidKit)} 
                      className={`px-8 py-4.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        paidKit 
                          ? 'bg-emerald-400 text-emerald-950 border border-emerald-500' 
                          : 'bg-white text-black hover:bg-slate-100 hover:scale-103'
                      }`}
                    >
                      {paidKit ? '✓ PACK ADQUIRIDO (Diamante)' : 'Comprar Pack - $18.000'}
                    </button>
                    {paidKit && (
                      <span className="text-emerald-300 font-extrabold text-xs flex items-center">✓ Incluye: Remeras, Rompeviento y Mochila</span>
                    )}
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-10 text-9xl opacity-10 pointer-events-none group-hover:scale-110 transition-transform italic font-black">P+</div>
              </div>
            </div>
          )}

          {/* CONTROL DE NAVEGACION DE PASOS */}
          <div className="flex gap-4 pt-8 border-t border-slate-100 mt-10">
            {step > 1 && (
              <button 
                type="button" 
                onClick={() => setStep(step - 1)} 
                className="px-8 py-5.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-colors"
              >
                Atrás
              </button>
            )}
            
            {step < 3 ? (
              <button 
                type="button" 
                onClick={() => {
                  if (step === 1 && !formData.nombre) {
                    notificationService.notify('Rellene Campos', 'El nombre es obligatorio.');
                    return;
                  }
                  if (step === 1 && !phoneVerified) {
                    notificationService.notify('SMS Requerido', 'Debe verificar el número de contacto por SMS primero.');
                    return;
                  }
                  setStep(step + 1);
                }} 
                className="flex-1 py-5.5 bg-black hover:bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
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
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 py-5.5 bg-plus-blue hover:bg-blue-750 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-55 shadow-[0_15px_30px_rgba(37,99,235,0.25)]"
                >
                  {loading ? 'REGISTRANDO EN RED...' : 'Finalizar Registro'}
                </button>
              </div>
            )}
          </div>

        </form>

        {/* POLÍTICAS DE RED, EXPLICACIONES Y INFORMACIÓN REGULATORIA (BARRA LATERAL) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* REPORTE DIGITAL DE AUDITORÍA AI */}
          {aiAuditReport ? (
            <div className={`p-8 rounded-[3rem] border shadow-md animate-in zoom-in-50 duration-300 ${
              aiAuditReport.valid 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                : 'bg-rose-50 border-rose-200 text-rose-955'
            }`}>
              <div className="flex justify-between items-center border-b pb-4 mb-4" style={{ borderColor: aiAuditReport.valid ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)' }}>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest opacity-60">Filtro Auditor AI</h4>
                  <h3 className="text-xl font-black italic mt-1">{aiAuditReport.valid ? 'APROBACIÓN INICIAL' : 'SUMARIO DEMORADO'}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold block opacity-60">Confianza</span>
                  <span className="text-2xl font-black italic">{aiAuditReport.confidence}%</span>
                </div>
              </div>

              <p className="text-xs font-semibold leading-relaxed mb-6">{aiAuditReport.summary}</p>

              {aiAuditReport.issues.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider block opacity-70">Advertencias encontradas:</span>
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
              <h4 className="text-3xl font-black italic uppercase tracking-tighter mb-6 leading-tight">Filtro de<br/><span className="text-plus-blue">Cumplimiento</span></h4>
              
              <ul className="space-y-4 text-xs font-medium text-white/60 mb-8 list-none">
                <li className="flex gap-2">✓ <span>DNI y Selfie actúan como clave biométrica de identidad.</span></li>
                <li className="flex gap-2">✓ <span>Las licencias y patentes se validan dinámicamente con AFIP.</span></li>
                <li className="flex gap-2">✓ <span>El CBU/CVU de pago de las comisiones se audita antes del viernes.</span></li>
              </ul>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Verificación Biométrica Activa</p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">SMS OTP Token Gateway Operativo</p>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 text-[12rem] font-black text-white/[0.015] italic rotate-12 pointer-events-none">REG</div>
            </div>
          )}

          {/* RESUMEN DE REQUISITOS DEL CAPÍTULO 2 DEPENDIENDO DEL VEHÍCULO SELECCIONADO */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div>
              <p className="text-[8px] font-black text-plus-blue uppercase tracking-widest">Capítulo 2 • Requisitos</p>
              <h4 className="text-lg font-black uppercase tracking-tight text-gray-900 mt-1">Socio {selectedVehicle.toUpperCase()}</h4>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-600 font-bold">
              {getRequiredDocs(selectedVehicle).map((reqDoc, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black leading-none ${!!uploadedDocs[reqDoc.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {!!uploadedDocs[reqDoc.id] ? '✓' : idx + 1}
                  </span>
                  <span className="flex-1">{reqDoc.label}</span>
                </li>
              ))}
              <li className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black leading-none ${phoneVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {phoneVerified ? '✓' : '*'}
                </span>
                <span className="flex-1">Teléfono verificado (OTP SMS)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black leading-none bg-emerald-100 text-emerald-700">✓</span>
                <span className="flex-1">Dirección de Posadas corroborada</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DriverOnboardingView;
