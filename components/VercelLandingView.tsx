import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { notificationService } from '../services/notificationService';

interface Repartidor {
  id: string;
  nombre: string;
  puntuacion: number;
  pedidosEntregados: number;
  eficienciaSLA: string;
  vehiculo: string;
  tarifaBase: number;
  reputacionBadge: string;
  avatar: string;
  esEmpleadoDelMes: boolean;
  especialidad: string;
  recomendaciones: number;
}

const VercelLandingView: React.FC = () => {
  // Dynamic City & Elite Riders States
  const [selectedCity, setSelectedCity] = useState<string>('Posadas');
  const [repartidoresPorCiudad, setRepartidoresPorCiudad] = useState<Record<string, Repartidor[]>>({
    'Posadas': [
      {
        id: 'pos-1',
        nombre: 'Marcos "Del Águila" Benítez',
        puntuacion: 5.0,
        pedidosEntregados: 2450,
        eficienciaSLA: '100% On-Time',
        vehiculo: 'KTM RC 200 (Flete Premium)',
        tarifaBase: 4200,
        reputacionBadge: 'Empleado del Mes',
        avatar: '🏍️',
        esEmpleadoDelMes: true,
        especialidad: 'Fletes Corporativos Especiales, Envíos Asegurados de Gran Valor',
        recomendaciones: 412
      },
      {
        id: 'pos-2',
        nombre: 'Valentina Ruiz',
        puntuacion: 4.9,
        pedidosEntregados: 1890,
        eficienciaSLA: '99.2%',
        vehiculo: 'Honda Wave 110S',
        tarifaBase: 2800,
        reputacionBadge: 'Empleado Estrella',
        avatar: '💫',
        esEmpleadoDelMes: false,
        especialidad: 'Pedidos Rápidos Express en Zona Centro',
        recomendaciones: 285
      },
      {
        id: 'pos-3',
        nombre: 'Facundo Gómez',
        puntuacion: 4.8,
        pedidosEntregados: 1210,
        eficienciaSLA: '98.7%',
        vehiculo: 'Yamaha YBR 125',
        tarifaBase: 2500,
        reputacionBadge: 'Empleado Estrella',
        avatar: '📦',
        esEmpleadoDelMes: false,
        especialidad: 'Fletes medianos y paquetería comercial',
        recomendaciones: 194
      }
    ],
    'Garupá': [
      {
        id: 'gar-1',
        nombre: 'Sandra "La Flecha" Ortiz',
        puntuacion: 5.0,
        pedidosEntregados: 1980,
        eficienciaSLA: '99.8% On-Time',
        vehiculo: 'Motomel Blitz 110 (Flete Pro)',
        tarifaBase: 3800,
        reputacionBadge: 'Empleado del Mes',
        avatar: '⚡',
        esEmpleadoDelMes: true,
        especialidad: 'Envíos Rápidos Interconurbano Posadas-Garupá',
        recomendaciones: 345
      },
      {
        id: 'gar-2',
        nombre: 'Lucas Speratti',
        puntuacion: 4.7,
        pedidosEntregados: 850,
        eficienciaSLA: '96.5%',
        vehiculo: 'Zanella RX 150',
        tarifaBase: 2400,
        reputacionBadge: 'Empleado Estrella',
        avatar: '🎒',
        esEmpleadoDelMes: false,
        especialidad: 'Entregas residenciales de fin de semana',
        recomendaciones: 110
      }
    ],
    'Oberá': [
      {
        id: 'obe-1',
        nombre: 'Christian "El Vasco" Errecart',
        puntuacion: 5.0,
        pedidosEntregados: 1720,
        eficienciaSLA: '99.9% On-Time',
        vehiculo: 'Honda XR 150L (Todo Terreno)',
        tarifaBase: 4500,
        reputacionBadge: 'Empleado del Mes',
        avatar: '🌲',
        esEmpleadoDelMes: true,
        especialidad: 'Despachos Pesados y Zona Rural / Zona de Sierras de Oberá',
        recomendaciones: 389
      },
      {
        id: 'obe-2',
        nombre: 'Martina Kliukas',
        puntuacion: 4.9,
        pedidosEntregados: 1410,
        eficienciaSLA: '98.9%',
        vehiculo: 'Bajaj Rouser NS 200',
        tarifaBase: 3100,
        reputacionBadge: 'Empleado Estrella',
        avatar: '🔥',
        esEmpleadoDelMes: false,
        especialidad: 'Envíos rápidos de gastronomía típica misionera',
        recomendaciones: 261
      }
    ],
    'Eldorado': [
      {
        id: 'eld-1',
        nombre: 'Axel "El Guardián" Wagner',
        puntuacion: 5.0,
        pedidosEntregados: 2150,
        eficienciaSLA: '100% On-Time',
        vehiculo: 'Yamaha Crypton 110 (Premium Cargo)',
        tarifaBase: 4100,
        reputacionBadge: 'Empleado del Mes',
        avatar: '🛡️',
        esEmpleadoDelMes: true,
        especialidad: 'Distribución Mayorista, Envíos a Hospitales y Farmacias de Guardia',
        recomendaciones: 401
      },
      {
        id: 'eld-2',
        nombre: 'Estela Benítez',
        puntuacion: 4.8,
        pedidosEntregados: 1120,
        eficienciaSLA: '97.2%',
        vehiculo: 'Gilera Smash 110',
        tarifaBase: 2600,
        reputacionBadge: 'Empleado Estrella',
        avatar: '🥪',
        esEmpleadoDelMes: false,
        especialidad: 'Envíos pequeños a comercios minoristas',
        recomendaciones: 153
      }
    ],
    'Puerto Iguazú': [
      {
        id: 'igu-1',
        nombre: 'Thiago "Cataratas" Silva',
        puntuacion: 5.0,
        pedidosEntregados: 2900,
        eficienciaSLA: '100% On-Time',
        vehiculo: 'Kawasaki Versys 300 (Mega Flete)',
        tarifaBase: 5500,
        reputacionBadge: 'Empleado del Mes',
        avatar: '🐆',
        esEmpleadoDelMes: true,
        especialidad: 'Fletes Premium Internacionales, Hotelería 5 Estrellas y Turismo',
        recomendaciones: 580
      },
      {
        id: 'igu-2',
        nombre: 'Camila Rojas',
        puntuacion: 4.8,
        pedidosEntregados: 1350,
        eficienciaSLA: '98.1%',
        vehiculo: 'Honda GLH 150',
        tarifaBase: 2900,
        reputacionBadge: 'Empleado Estrella',
        avatar: '🤙',
        esEmpleadoDelMes: false,
        especialidad: 'Logística de regalos y souvenirs de la Triple Frontera',
        recomendaciones: 212
      }
    ]
  });

  const handleVoteRider = (riderId: string) => {
    setRepartidoresPorCiudad(prev => {
      const updated = { ...prev };
      const currentRiders = updated[selectedCity] || [];
      updated[selectedCity] = currentRiders.map(rider => {
        if (rider.id === riderId) {
          notificationService.playAlert('success');
          notificationService.notify(
            "Recomendación Registrada",
            `Has votado positivamente a ${rider.nombre}. ¡Su reputación se ha incrementado!`
          );
          return {
            ...rider,
            recomendaciones: rider.recomendaciones + 1,
            puntuacion: Math.min(5.0, Number((rider.puntuacion + 0.01).toFixed(2)))
          };
        }
        return rider;
      });
      return updated;
    });
  };

  const handleHireRider = (riderName: string) => {
    notificationService.playAlert('info');
    notificationService.notify(
      "Reserva Exclusiva de Flete",
      `Se ha derivado un aviso de flete prioritario a ${riderName} en la terminal de ${selectedCity}.`
    );
  };

  const currentRiders = repartidoresPorCiudad[selectedCity] || [];
  const empleadoDelMes = currentRiders.find(r => r.esEmpleadoDelMes);
  const otrosRiders = currentRiders.filter(r => !r.esEmpleadoDelMes);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-24 text-white bg-[#030303] -mx-10 md:-mx-16 p-10 md:p-16 min-h-screen relative overflow-hidden">
      
      {/* Decorative Grid Background with blur orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111113_1px,transparent_1px),linear-gradient(to_bottom,#111113_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0 opacity-80"></div>
      <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-plus-blue/10 rounded-full blur-[180px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[5%] left-[5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Title & Concept Header */}
      <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6 py-6">
        <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-full border border-amber-500/20 text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">
          🏆 RANGO LOGÍSTICO SUPREMO
        </div>
        <h1 className="text-5xl md:text-7xl font-black italic uppercase leading-none tracking-tighter text-white">
          CUADRO DE HONOR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-[#8B5CF6] to-[#06B6D4]">
            EMPLEADO DEL MES & ESTRELLAS
          </span>
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed font-semibold">
          Sección exclusiva dedicada a los repartidores más destacados con puntuación perfecta, máxima reputación y servicios de élite del sector.
        </p>
      </div>

      {/* SECTION: PIZARRA DE HONOR & REPARTIDORES DE ELITE */}
      <div className="relative z-10 bg-[#07070a]/90 rounded-[3.5rem] border border-white/10 p-8 md:p-12 shadow-2xl space-y-10 overflow-hidden">
        {/* Floating gradient orb */}
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/15 pb-8 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">
              <span>⭐️</span> RECOMENDACIÓN AUTOMÁTICA EN TU CIUDAD
            </div>
            <h2 className="text-3xl md:text-4xl font-black italic uppercase leading-none tracking-tight">
              SOCIOS DESTACADOS EN <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-[#8B5CF6]">{selectedCity.toUpperCase()}</span>
            </h2>
            <p className="text-white/50 text-xs font-semibold leading-relaxed max-w-xl">
              Como recomendación automatizada, visualizas a los operadores activos de tu misma zona garantizando disponibilidad inmediata y el mejor servicio regional.
            </p>
          </div>

          {/* Dynamic City Selector Pills */}
          <div className="space-y-2 w-full lg:w-auto shrink-0">
            <span className="text-[9px] font-black tracking-widest text-white/40 uppercase block">📍 SELECCIONAR CIUDAD (MISMA ZONA)</span>
            <div className="flex flex-wrap gap-2">
              {['Posadas', 'Garupá', 'Oberá', 'Eldorado', 'Puerto Iguazú'].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    notificationService.playAlert('info');
                    notificationService.notify(
                      "Zona Seleccionada",
                      `Descubriendo repartidores premium de ${city}.`
                    );
                  }}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border ${selectedCity === city ? 'bg-white text-black font-black border-white shadow-[0_4px_15px_rgba(255,255,255,0.1)]' : 'bg-white/5 text-white/50 border-white/5 hover:border-white/10 hover:text-white'}`}
                >
                  📍 {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Board Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch relative z-10">
          
          {/* LEFT: EMPLEADO DEL MES PROFILE CARD */}
          <div className="lg:col-span-5">
            {empleadoDelMes ? (
              <div className="h-full bg-gradient-to-b from-[#16120a] to-[#070709] border border-amber-400/30 rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group flex flex-col justify-between">
                {/* Glow behind the badge */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-amber-500/15 transition-all"></div>
                
                {/* Top Ribbons */}
                <div className="flex justify-between items-start mb-8">
                  <div className="px-4 py-1.5 bg-amber-400 text-black text-[9px] font-black tracking-widest uppercase rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                    <span>👑</span> EMPLEADO DEL MES
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">EFICIENCIA SLA</span>
                    <span className="text-base font-mono font-black text-amber-300">{empleadoDelMes.eficienciaSLA}</span>
                  </div>
                </div>

                {/* Profile Visual */}
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-3xl shadow-lg relative shrink-0">
                      <span className="relative z-10">{empleadoDelMes.avatar}</span>
                      <span className="absolute inset-0 bg-amber-400/10 rounded-2xl animate-pulse"></span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black italic uppercase leading-none tracking-tight text-white group-hover:text-amber-300 transition-colors">
                        {empleadoDelMes.nombre}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-emerald-400 font-mono font-black text-sm">★ {empleadoDelMes.puntuacion.toFixed(1)}</span>
                        <span className="text-white/40 text-[10px] uppercase font-semibold">| Reputación Suprema</span>
                      </div>
                    </div>
                  </div>

                  {/* Public Attributes and High rates banner */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40 tracking-wider text-[9px] uppercase font-black font-semibold">TARIFA ELITE CORPORATIVA</span>
                      <span className="text-amber-400 font-mono font-black text-sm">
                        ${empleadoDelMes.tarifaBase.toLocaleString('es-AR')} base
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-300/80 font-bold italic leading-relaxed">
                      * Este operador líder posee los costos más altos del sector debido a su historial intachable sin demoras, custodia blindada y prioridad absoluta.
                    </p>
                    <div className="h-px bg-white/10"></div>
                    <div className="space-y-1.5">
                      <span className="text-white/30 text-[8px] tracking-widest uppercase font-black block">Servicio Certificado</span>
                      <p className="text-[11px] text-white/70 font-semibold leading-relaxed">
                        {empleadoDelMes.especialidad}
                      </p>
                    </div>
                  </div>

                  {/* Operational metrics details */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-[8px] text-white/40 font-black uppercase block tracking-wider">PEDIDOS ENTREGADOS</span>
                      <span className="text-sm font-mono font-black text-white">{empleadoDelMes.pedidosEntregados} envíos</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-[8px] text-white/40 font-black uppercase block tracking-wider">VEHÍCULO LOGÍSTICO</span>
                      <span className="text-[9px] font-bold text-white uppercase block truncate mt-1">{empleadoDelMes.vehiculo}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-8 border-t border-white/15 grid grid-cols-2 gap-3 mt-8">
                  <button 
                    onClick={() => handleVoteRider(empleadoDelMes.id)}
                    className="py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-all"
                  >
                    ❤️ Recomendar ({empleadoDelMes.recomendaciones})
                  </button>
                  <button 
                    onClick={() => handleHireRider(empleadoDelMes.nombre)}
                    className="py-3 bg-amber-400 hover:bg-amber-500 text-black rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-[0_10px_20px_rgba(245,158,11,0.2)]"
                  >
                    💼 Reservar Elite
                  </button>
                </div>

              </div>
            ) : (
              <div className="h-full bg-white/5 rounded-[3rem] p-10 flex items-center justify-center text-center border border-white/5">
                <p className="text-xs text-white/40">No hay empleado del mes asignado en esta ciudad.</p>
              </div>
            )}
          </div>

          {/* RIGHT: OTHER RECOMENDED RIDERS WITH MAXIMUM SCORING */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <span className="text-[10px] font-black tracking-widest text-[#10B981] uppercase block">
                ⭐ EMPLEADOS ESTRELLA DEL SECTOR ({selectedCity.toUpperCase()})
              </span>
              <p className="text-[11px] text-white/50 font-semibold leading-relaxed max-w-xl">
                Nuestros mejores fletistas del sector urbano de {selectedCity}. Cuentan con un perfil impecable y altísima reputación dentro del ecosistema de Delivery Plus.
              </p>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto max-h-[450px] pr-2 no-scrollbar">
              {otrosRiders.length > 0 ? (
                otrosRiders.map((rider) => (
                  <div 
                    key={rider.id}
                    className="p-6 bg-white/[0.03] hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-3xl transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-all border border-white/5">
                        {rider.avatar}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h4 className="text-md font-bold text-white group-hover:text-sky-400 transition-colors truncate">
                            {rider.nombre}
                          </h4>
                          <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[8px] font-black rounded uppercase tracking-wider border border-cyan-500/20">
                            {rider.reputacionBadge}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/40 font-semibold leading-tight">{rider.especialidad}</p>
                        
                        <div className="flex flex-wrap gap-4 text-[10px] text-white/50 pt-1 font-bold">
                          <span>🏍️ {rider.vehiculo}</span>
                          <span className="text-emerald-400">★ {rider.puntuacion.toFixed(1)}</span>
                          <span>📦 {rider.pedidosEntregados} fletes</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-stretch md:items-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:pt-0 pt-4 border-white/5">
                      <div className="text-right hidden md:block">
                        <span className="text-[8px] font-black tracking-wider text-white/30 uppercase block">Tarifa Inicial</span>
                        <span className="text-white font-mono font-black text-sm">${rider.tarifaBase.toLocaleString('es-AR')}</span>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto">
                        <button 
                          onClick={() => handleVoteRider(rider.id)}
                          className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95"
                          title="Votar Recomendado"
                        >
                          ❤️ {rider.recomendaciones}
                        </button>
                        <button 
                          onClick={() => handleHireRider(rider.nombre)}
                          className="px-4 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-black font-black rounded-xl text-[9px] font-black uppercase tracking-wider text-center flex-1 sm:flex-initial transition-all active:scale-95"
                        >
                          Contratar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 bg-white/5 rounded-3xl border border-white/5 text-center text-xs text-white/40 font-semibold">
                  No se registran candidatos de puntuación máxima en {selectedCity} todavía.
                </div>
              )}
            </div>

            <div className="p-5 bg-gradient-to-r from-teal-500/5 to-purple-500/5 rounded-2xl border border-white/5 flex justify-between items-center flex-wrap gap-4">
              <span className="text-[9px] font-black tracking-widest text-[#10B981] uppercase">
                🛡️ TODOS LOS REPARTIDORES POSEEN SEGURO CONTRA INCIDENTES ACTIVO
              </span>
              <span className="text-[8px] text-white/30 font-mono font-bold">
                MISIONES ELITE v1.5
              </span>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default VercelLandingView;
