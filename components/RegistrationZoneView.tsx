import React, { useState } from 'react';
import { notificationService } from '../services/notificationService';
import { mockApi } from '../services/mockApi';

interface Props {
  setPestañaActiva: (pestaña: string) => void;
}

const RegistrationZoneView: React.FC<Props> = ({ setPestañaActiva }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<'bici' | 'moto' | 'auto'>('bici');
  const [purchased, setPurchased] = useState(false);
  const [buying, setBuying] = useState(false);

  // Requisitos e info de uniformes
  const uniforms = {
    bici: {
      title: 'Kit de Bici-Rider Pro',
      price: 18000,
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      description: 'Optimizado para la máxima comodidad aerodinámica y capacidad de carga térmica.',
      items: [
        { name: 'Mochila de Bici con Ploteo', desc: 'Impermeable, con aislación térmica pro y gráfica reflectiva.', icon: '🎒' },
        { name: 'Remeras Técnicas Delivery Plus', desc: 'Respirables, con secado rápido y protección UV.', icon: '👕' },
        { name: 'Buzos de Algodón Frisado', desc: 'Excelentes para días fríos.', icon: '🧥' },
        { name: 'Pantalones Deportivos', desc: 'Costuras reforzadas aptas para pedalear continuo.', icon: '👖' },
        { name: 'Camperas Rompeviento', desc: 'Ultra livianas y protectoras.', icon: '🧥' }
      ]
    },
    moto: {
      title: 'Kit de Moto-Rider Speed',
      price: 25000,
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
      description: 'Máxima visibilidad vial y protección climática reforzada para velocidades urbanas.',
      items: [
        { name: 'Remeras Oficiales de Algodón/Piqué', desc: 'Cuello polo, de alta durabilidad.', icon: '👕' },
        { name: 'Buzos Térmicos Pesados', desc: 'Para bajas temperaturas en autopista.', icon: '🧥' },
        { name: 'Camperas de Abrigo Impermeables', desc: 'Bandas reflectoras de seguridad homologadas.', icon: '🧥' }
      ]
    },
    auto: {
      title: 'Kit de Car-Delivery Elite',
      price: 14000,
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      description: 'Presencia corporativa óptima y confort premium para entregas en vehículo cerrado.',
      items: [
        { name: 'Remeras de Presentación', desc: 'Estampa corporativa HD en pecho y espalda.', icon: '👕' },
        { name: 'Buzos Delivery Plus Comfort', desc: 'Algodón suave para largas horas de manejo.', icon: '🧥' },
        { name: 'Camperas Softshell Neoprene', desc: 'Corte formal, térmicas e impermeables.', icon: '🧥' }
      ]
    }
  };

  const currentKit = uniforms[selectedVehicle];

  const handlePurchaseKit = () => {
    setBuying(true);
    notificationService.playAlert('info');
    setTimeout(() => {
      setBuying(false);
      setPurchased(true);
      mockApi.addTransaction({
        monto: -currentKit.price,
        tipo: 'SUSCRIPCION',
        detalle: `Compra de Uniformes Oficiales: ${currentKit.title}`
      });
      notificationService.playAlert('success');
      notificationService.notify(
        "Compra de Uniforme Confirmada",
        `Tu pedido del uniforme ${currentKit.title} ha sido registrado. Lo recibirás en tus capacitaciones.`
      );
    }, 1500);
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto space-y-16 pb-24">
      
      {/* Header */}
      <div>
        <h2 className="text-5xl font-[900] tracking-tighter uppercase italic text-gray-900 mb-4">Zona de Inscripción</h2>
        <p className="text-gray-500 text-lg max-w-3xl">Únete a la red de Delivery Plus, selecciona tu formato operativo y equípate con la indumentaria oficial para identificarte de forma segura.</p>
      </div>

      {/* Grid Alta de Negocio y Delivery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Alta de Negocio */}
        <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 p-10 flex flex-col hover:shadow-xl transition-shadow duration-300">
          <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-3xl mb-8 text-plus-blue">
            🏪
          </div>
          <h3 className="text-2xl font-black italic uppercase tracking-tight text-gray-900 mb-4">Alta de Negocio</h3>
          <p className="text-gray-600 mb-8 flex-1 text-sm leading-relaxed">
            Expande tu alcance y aumenta tus ventas uniendo tu comercio a nuestra plataforma. Llegá a miles de clientes en tu zona.
          </p>
          
          <div className="space-y-6 mb-10 border-t border-slate-50 pt-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs">Requisitos</h4>
              <ul className="space-y-2 text-sm text-gray-650 font-medium">
                <li className="flex items-center gap-2"><span>✅</span> Constancia de inscripción (CUIT/Monotributo)</li>
                <li className="flex items-center gap-2"><span>✅</span> Habilitación comercial vigente</li>
                <li className="flex items-center gap-2"><span>✅</span> Cuenta bancaria o CVU (Mercado Pago / Banco)</li>
                <li className="flex items-center gap-2"><span>✅</span> Menú o lista de productos con precios estables</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs">Acuerdo de Servicio</h4>
              <ul className="space-y-2 text-sm text-gray-650 font-medium">
                <li className="flex items-center gap-2"><span>🤝</span> Comisión transparente por venta exitosa</li>
                <li className="flex items-center gap-2"><span>⏱️</span> Liquidaciones semanales garantizadas</li>
                <li className="flex items-center gap-2"><span>📱</span> Soporte de red comercial dedicado 24/7</li>
              </ul>
            </div>
          </div>

          <button 
            onClick={() => setPestañaActiva('alta-comercio')}
            className="w-full py-5 bg-black hover:bg-gray-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
          >
            Comenzar Alta de Negocio
          </button>
        </div>

        {/* Alta de Delivery */}
        <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 p-10 flex flex-col hover:shadow-xl transition-shadow duration-300">
          <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-3xl mb-8 text-plus-blue">
            🛵
          </div>
          <h3 className="text-2xl font-black italic uppercase tracking-tight text-gray-900 mb-4">Alta de Delivery</h3>
          <p className="text-gray-600 mb-8 flex-1 text-sm leading-relaxed">
            Sé tu propio jefe, maneja tus horarios y genera ingresos adicionales repartiendo con Delivery Plus.
          </p>
          
          <div className="space-y-6 mb-10 border-t border-slate-50 pt-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs">Requisitos</h4>
              <ul className="space-y-2 text-sm text-gray-655 font-medium">
                <li className="flex items-center gap-2"><span>✅</span> Ser mayor de 18 años</li>
                <li className="flex items-center gap-2"><span>✅</span> Vehículo propio (Moto, Auto o Bicicleta)</li>
                <li className="flex items-center gap-2"><span>✅</span> Licencia de conducir y póliza de seguro al día</li>
                <li className="flex items-center gap-2"><span>✅</span> Smartphone con conexión de datos activa</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs">Acuerdo de Servicio</h4>
              <ul className="space-y-2 text-sm text-gray-655 font-medium">
                <li className="flex items-center gap-2"><span>💸</span> Ganancias competitivas por distancia y tiempo</li>
                <li className="flex items-center gap-2"><span>🕒</span> Flexibilidad absoluta de agendas y turnos</li>
                <li className="flex items-center gap-2"><span>🛡️</span> Cobertura de red y emergencias en Posadas</li>
              </ul>
            </div>
          </div>

          <button 
            onClick={() => setPestañaActiva('alta-socio')}
            className="w-full py-5 bg-plus-blue hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_20px_40px_rgba(37,99,235,0.25)]"
          >
            Comenzar Alta de Repartidor
          </button>
        </div>

      </div>

      {/* NUEVA SECCIÓN: Info de Modelos de Turnos Vigentes */}
      <div className="bg-white p-12 rounded-[4rem] border border-gray-150 shadow-lg space-y-10">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-plus-blue mb-2">Modelos de Cobertura Logística</h4>
          <h3 className="text-3xl font-black tracking-tight uppercase italic text-gray-900">
            Nuestros <span className="text-plus-blue">Formatos Horarios</span>
          </h3>
          <p className="text-gray-500 text-sm mt-2">Flexible, fijo o exprés: la red de Delivery Plus se adapta al milímetro para cada necesidad comercial.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-black/5 hover:border-plus-blue/30 transition-all flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-4">⏱️</div>
              <h5 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-2">Turnos de 4 Horas</h5>
              <p className="text-xs text-gray-500 leading-relaxed">
                Repartidor exclusivo asignado a tu comercio de forma fija para cubrir un bloque de almuerzo o cena. Reduce tiempos de preparación a entrega física.
              </p>
            </div>
            <span className="text-[9px] font-black text-plus-blue uppercase tracking-widest mt-6 block">★ Ideal para Picos de Demanda</span>
          </div>

          <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-black/5 hover:border-plus-blue/30 transition-all flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-4">📅</div>
              <h5 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-2">Turnos de 8 Horas</h5>
              <p className="text-xs text-gray-500 leading-relaxed">
                Cobertura completa del horario laboral del local. El rider queda de guardia exclusivo en la puerta de tu tienda durante las 8 horas contratadas.
              </p>
            </div>
            <span className="text-[9px] font-black text-plus-blue uppercase tracking-widest mt-6 block">★ Control Fijo de Envíos</span>
          </div>

          <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-black/5 hover:border-plus-blue/30 transition-all flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-4">🏠</div>
              <h5 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-2">Envíos Unitarios (Emprendedores)</h5>
              <p className="text-xs text-gray-500 leading-relaxed">
                Para creadores a domicilio. Olvídate de mensualidades: pides un rider para recoger y entregar un pedido específico en el momento. Pago a demanda.
              </p>
            </div>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-6 block">★ Sin Costo de Mantenimiento</span>
          </div>
        </div>
      </div>

      {/* NUEVA SECCIÓN: Tienda de Uniformes Oficiales y Mochilas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Selector de Indumentaria */}
        <div className="lg:col-span-4 bg-[#0A0A0B] text-white p-12 rounded-[4rem] flex flex-col justify-between border border-white/5 space-y-10">
          <div>
            <span className="px-4 py-1.5 bg-white/10 text-white/70 rounded-full font-black text-[8px] uppercase tracking-widest border border-white/10">
              EQUIPO REGLAMENTARIO
            </span>
            <h4 className="text-3xl font-black italic uppercase tracking-tighter mt-6 leading-tight">
              Kit de <span className="text-plus-blue">Uniformes</span>
            </h4>
            <p className="text-white/40 text-xs mt-3 leading-relaxed">
              De acuerdo a las normativas de Delivery Plus, los choferes deben utilizar indumentaria oficial reflectiva para su correcto reconocimiento.
            </p>

            {/* Selectores de transporte */}
            <div className="flex flex-col gap-3 mt-8">
              <button 
                onClick={() => { setSelectedVehicle('bici'); setPurchased(false); }}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-left transition-all ${selectedVehicle === 'bici' ? 'bg-plus-blue text-white shadow-xl' : 'bg-white/5 text-white/40 border border-white/5 hover:border-white/15'}`}
              >
                <span>🚲</span> Bicicleta Rider
              </button>
              <button 
                onClick={() => { setSelectedVehicle('moto'); setPurchased(false); }}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-left transition-all ${selectedVehicle === 'moto' ? 'bg-plus-blue text-white shadow-xl' : 'bg-white/5 text-white/40 border border-white/5 hover:border-white/15'}`}
              >
                <span>🛵</span> Moto Rider
              </button>
              <button 
                onClick={() => { setSelectedVehicle('auto'); setPurchased(false); }}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-left transition-all ${selectedVehicle === 'auto' ? 'bg-plus-blue text-white shadow-xl' : 'bg-white/5 text-white/40 border border-white/5 hover:border-white/15'}`}
              >
                <span>🚗</span> Auto Delivery
              </button>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <p className="text-[7px] text-white/30 uppercase font-black tracking-widest">Soporte Local</p>
            <p className="text-[11px] font-bold text-white/80 mt-1">Los kits se retiran en la planta central de Delivery Plus Posadas luego del alta.</p>
          </div>
        </div>

        {/* Detalle visual de los ítems del Kit seleccionado */}
        <div className="lg:col-span-8 bg-white p-12 rounded-[4rem] border border-gray-150 shadow-md flex flex-col justify-between space-y-10">
          <div>
            <div className="flex justify-between items-start gap-4 flex-wrap border-b border-slate-100 pb-6">
              <div>
                <span className={`px-4 py-1 rounded-full text-[8px] font-black border uppercase tracking-widest ${currentKit.badgeColor}`}>
                  {selectedVehicle.toUpperCase()} SELECTION
                </span>
                <h4 className="text-2xl font-black uppercase text-gray-900 mt-3">{currentKit.title}</h4>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Valor Unitario</span>
                <p className="text-3xl font-black text-plus-blue italic">${currentKit.price.toLocaleString('es-AR')}</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 font-medium italic mt-6">{currentKit.description}</p>

            {/* Listado de ítems incluidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {currentKit.items.map((it, i) => (
                <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-black/5 hover:border-plus-blue/20 transition-all">
                  <span className="text-2xl">{it.icon}</span>
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-gray-900 tracking-tight">{it.name}</h5>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed font-medium">{it.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Caja con botón de compra simulada */}
          <div className="bg-slate-55 border border-slate-150 p-6 rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-center gap-6 mt-6">
            <div className="flex items-center gap-4">
              <span className="text-3xl">📦</span>
              <div>
                <p className="text-[11px] font-black uppercase text-gray-900">¿Listo para equiparte?</p>
                <p className="text-xs text-gray-500 font-medium">Puedes pagarlo de forma simulada mediante tu balance virtual de Delivery Plus.</p>
              </div>
            </div>

            <button 
              onClick={handlePurchaseKit}
              disabled={buying || purchased}
              className={`px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all w-full sm:w-auto text-center ${purchased ? 'bg-emerald-100 text-emerald-705 border border-emerald-300' : 'bg-black hover:bg-plus-blue text-white shadow-md'}`}
            >
              {buying ? 'PROCESANDO PAGO...' : purchased ? '✓ COMPRADO' : 'COMPRAR KIT DE RED'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default RegistrationZoneView;
