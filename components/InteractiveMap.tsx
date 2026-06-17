import React from 'react';
import { Comercio, SocioRepartidor } from '../types';

interface InteractiveMapProps {
  center: string; // "lat,lng"
  stores: Comercio[];
  drivers: SocioRepartidor[];
  onStoreClick?: (store: Comercio) => void;
  className?: string;
  pickup?: { lat: number, lng: number };
  delivery?: { lat: number, lng: number };
  showRiskZones?: boolean;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  center, stores, drivers, onStoreClick, className, pickup, delivery, showRiskZones 
}) => {
  const [lat, lng] = center.split(',').map(Number);

  // Zonas de riesgo simuladas
  const riskZones = [
    { lat: -27.380, lng: -55.910, radius: 0.005, name: 'Zona Alta Demanda' },
    { lat: -27.360, lng: -55.885, radius: 0.003, name: 'Corte de Calle' }
  ];

  // Mejora de proyección: Escala ajustada para zoom 14 aproximado
  // A lat -27, 0.01 deg lat es ~1.1km, 0.01 deg lng es ~1km.
  // Usamos factores de escala más precisos para el contenedor visual.
  const SCALE_LAT = 15000;
  const SCALE_LNG = 15000;

  const getPosition = (targetLat: number, targetLng: number) => {
    return {
      top: `${50 - (targetLat - lat) * SCALE_LAT}%`,
      left: `${50 + (targetLng - lng) * SCALE_LNG}%`
    };
  };

  return (
    <div className={`relative bg-[#1A1A1A] overflow-hidden ${className}`}>
      {/* Map Base con filtro nocturno premium */}
      <iframe 
        src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d20000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sar!4v1716388400000!5m2!1ses!2sar`} 
        className="w-full h-full grayscale" 
        style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.8) contrast(1.2)' }}
        loading="lazy"
      ></iframe>

      {/* Markers & Overlays Layer */}
      <div className="absolute inset-0 pointer-events-none">
        
        {/* Risk Zones Overlay */}
        {showRiskZones && riskZones.map((zone, idx) => (
          <div 
            key={idx}
            className="absolute rounded-full border-2 border-red-500/40 bg-red-500/10 flex items-center justify-center animate-pulse"
            style={{ 
              ...getPosition(zone.lat, zone.lng),
              width: '160px',
              height: '160px',
              transform: 'translate(-50%, -50%)'
            }}
          >
             <span className="text-[8px] font-black text-red-500 uppercase tracking-widest text-center px-2 bg-black/40 rounded-lg">{zone.name}</span>
          </div>
        ))}

        {/* Pickup Marker (Store) */}
        {pickup && (
          <div 
            className="absolute z-20"
            style={{ 
              ...getPosition(pickup.lat, pickup.lng),
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="flex flex-col items-center">
               <div className="w-10 h-10 bg-amber-500 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center text-white text-xl border-2 border-white">
                  🏪
               </div>
               <div className="w-0.5 h-4 bg-amber-500"></div>
            </div>
          </div>
        )}

        {/* Delivery Marker (Home) */}
        {delivery && (
          <div 
            className="absolute z-20"
            style={{ 
              ...getPosition(delivery.lat, delivery.lng),
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="flex flex-col items-center">
               <div className="w-10 h-10 bg-emerald-500 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center justify-center text-white text-xl animate-bounce border-2 border-white">
                  🚩
               </div>
               <div className="w-0.5 h-4 bg-emerald-500"></div>
            </div>
          </div>
        )}

        {/* Stores Markers (Global) */}
        {stores.map(store => (
          <div 
            key={store.id}
            className="absolute pointer-events-auto cursor-pointer group"
            style={{ 
              ...getPosition(store.lat, store.lng),
              transform: 'translate(-50%, -100%)'
            }}
            onClick={() => onStoreClick && onStoreClick(store)}
          >
            <div className="flex flex-col items-center">
               <div className="w-12 h-12 bg-white shadow-2xl rounded-2xl border-2 border-black/10 flex items-center justify-center text-xl transition-transform group-hover:scale-125 group-hover:z-50">
                  {store.categoria === 'Paquetería' ? '📦' : '🍴'}
               </div>
               <div className="w-1 h-3 bg-white shadow-sm mt-[-4px]"></div>
            </div>
          </div>
        ))}

        {/* Driver Markers */}
        {drivers.map(driver => (
          <div 
            key={driver.id}
            className="absolute transition-all duration-1000 ease-linear z-40"
            style={{ 
              ...getPosition(driver.latitud, driver.longitud),
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-plus-blue rounded-full border-4 border-white flex items-center justify-center text-lg shadow-[0_15px_30px_rgba(37,99,235,0.6)] relative z-10">
                 <div className="text-white transform -scale-x-100">🛵</div>
              </div>
              <div className="absolute -inset-6 bg-plus-blue/30 rounded-full animate-ping"></div>
            </div>
          </div>
        ))}

        {/* Simulated Route Lines */}
        {drivers.length > 0 && pickup && delivery && (
           <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                 <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#10B981" />
                 </linearGradient>
              </defs>
              <line 
                x1={`${50 + (drivers[0].longitud - lng) * SCALE_LNG}%`} 
                y1={`${50 - (drivers[0].latitud - lat) * SCALE_LAT}%`} 
                x2={`${50 + (pickup.lng - lng) * SCALE_LNG}%`} 
                y2={`${50 - (pickup.lat - lat) * SCALE_LAT}%`} 
                stroke="#F59E0B" 
                strokeWidth="3" 
                strokeDasharray="6,6"
                className="opacity-60"
              />
              <line 
                x1={`${50 + (pickup.lng - lng) * SCALE_LNG}%`} 
                y1={`${50 - (pickup.lat - lat) * SCALE_LAT}%`} 
                x2={`${50 + (delivery.lng - lng) * SCALE_LNG}%`} 
                y2={`${50 - (delivery.lat - lat) * SCALE_LAT}%`} 
                stroke="#10B981" 
                strokeWidth="4" 
                strokeDasharray="10,10"
                className="opacity-50"
              />
           </svg>
        )}
      </div>

      {/* Floating Status UI */}
      <div className="absolute top-6 left-6 flex gap-3">
         <div className="bg-black/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_#10B981]"></div>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Vínculo Satelital</p>
              <p className="text-[8px] font-bold text-white/40 uppercase mt-1">Sincronización: 14ms</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default InteractiveMap;