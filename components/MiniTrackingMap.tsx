import React from 'react';
import { MapPin, Navigation, Car, Package } from 'lucide-react';
import { BrandWatermark } from './BrandComponents';

interface MiniTrackingMapProps {
  role: 'REPARTIDOR' | 'COMERCIO' | 'EMPRENDEDOR';
}

export const MiniTrackingMap: React.FC<MiniTrackingMapProps> = ({ role }) => {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] bg-[#0A0A0A] rounded-[2rem] border border-dp-border overflow-hidden">
      
      {/* Brand Isotipo - Bottom Right Map Watermark */}
      <BrandWatermark opacity="opacity-20" className="top-auto left-auto bottom-0 right-0 w-48 h-48" />

      {/* Fake Map Background (Dark Mode) */}
      <div 
        className="absolute inset-0 opacity-40 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/-55.892,-27.365,13/800x600?access_token=pk.eyJ1IjoiZmFrZSIsImEiOiJjamZhc2sifQ.fake")',
          filter: 'grayscale(100%) contrast(120%)'
        }}
      >
        {/* CSS Map Simulation if the image fails */}
        <div className="absolute inset-0 bg-[#0A0A0A] [background-image:linear-gradient(#1A1A1A_1px,transparent_1px),linear-gradient(90deg,#1A1A1A_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Map Routes/Polylines (CSS Simulated) */}
      <div className="absolute inset-0 flex items-center justify-center transform -rotate-12 pointer-events-none">
        <div className="w-1/2 h-1 bg-dp-primary/50 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-dp-primary shadow-[0_0_15px_#2666FF] animate-pulse"></div>
        </div>
      </div>

      {/* Markers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Origin Marker */}
        <div className="absolute top-[30%] left-[25%] flex flex-col items-center animate-bounce">
          <div className="bg-dp-warning p-2 rounded-full shadow-[0_0_20px_#FFC31A]">
            <Package className="w-5 h-5 text-black" />
          </div>
          <span className="mt-1 px-2 py-0.5 bg-black/80 border border-white/10 rounded text-[9px] font-bold text-white whitespace-nowrap">Origen</span>
        </div>

        {/* Destination Marker */}
        <div className="absolute bottom-[30%] right-[25%] flex flex-col items-center">
          <div className="bg-dp-success p-2 rounded-full shadow-[0_0_20px_#00E0A3]">
            <MapPin className="w-5 h-5 text-black" />
          </div>
          <span className="mt-1 px-2 py-0.5 bg-black/80 border border-white/10 rounded text-[9px] font-bold text-white whitespace-nowrap">Destino</span>
        </div>

        {/* Vehicle Marker */}
        <div className="absolute top-[50%] left-[50%] flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute -inset-4 bg-dp-primary/20 rounded-full animate-ping"></div>
            <div className="bg-dp-primary p-2.5 rounded-full shadow-[0_0_20px_#2666FF] relative z-10">
              <Navigation className="w-5 h-5 text-white transform rotate-45" />
            </div>
          </div>
          <div className="mt-2 px-3 py-1 bg-black/90 border border-dp-border rounded-lg shadow-xl backdrop-blur-sm whitespace-nowrap">
            <p className="text-[10px] font-bold text-white">ETA: 4 min</p>
            {role !== 'REPARTIDOR' && <p className="text-[9px] text-dp-textMuted uppercase">Esteban Silva (Moto)</p>}
          </div>
        </div>
      </div>

      {/* Overlays */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-2xl pointer-events-auto">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tracking Local</h4>
          <p className="text-[10px] text-dp-success font-black mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-dp-success animate-pulse"></span> GPRS Activo
          </p>
        </div>

        <button className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-full hover:bg-black transition-colors pointer-events-auto">
          <Navigation className="w-4 h-4 text-white" />
        </button>
      </div>

    </div>
  );
};
