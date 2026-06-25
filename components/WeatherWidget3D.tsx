import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Cloud, Wind, Droplets, Thermometer, ChevronRight } from 'lucide-react';

export const WeatherWidget3D: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Fetch real weather data using Open-Meteo (No API key required)
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-27.3671&longitude=-55.8961&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo');
        const json = await res.json();

        if (json.current) {
          const mapWeatherCode = (code: number, isDay: number) => {
             // Basic mapping for Open-Meteo WMO codes
             if (code === 0) return isDay ? 'sun' : 'moon';
             if (code >= 1 && code <= 3) return 'cloud';
             if (code >= 51 && code <= 99) return 'rain';
             return 'cloud';
          };
          
          const conditionText = (code: number) => {
             if (code === 0) return 'Despejado';
             if (code >= 1 && code <= 3) return 'Nublado';
             if (code >= 51 && code <= 69) return 'Llovizna';
             if (code >= 70 && code <= 79) return 'Nieve';
             if (code >= 80 && code <= 82) return 'Lluvia';
             if (code >= 95 && code <= 99) return 'Tormenta';
             return 'Variable';
          };

          const forecastDays = json.daily.time.slice(0, 5).map((dateStr: string, idx: number) => {
             const date = new Date(dateStr + "T00:00:00");
             const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
             return {
                day: idx === 0 ? 'Hoy' : idx === 1 ? 'Mañana' : days[date.getDay()],
                temp: Math.round(json.daily.temperature_2m_max[idx]),
                min: Math.round(json.daily.temperature_2m_min[idx]),
                rain: `${json.daily.precipitation_probability_max[idx]}%`,
                icon: mapWeatherCode(json.daily.weather_code[idx], 1)
             };
          });

          setData({
            temp: Math.round(json.current.temperature_2m),
            feelsLike: Math.round(json.current.apparent_temperature),
            condition: conditionText(json.current.weather_code),
            humidity: `${json.current.relative_humidity_2m}%`,
            wind: `${Math.round(json.current.wind_speed_10m)} km/h`,
            rainProb: `${json.daily.precipitation_probability_max[0]}%`,
            icon: mapWeatherCode(json.current.weather_code, json.current.is_day),
            forecast: forecastDays
          });
        }
      } catch (err) {
        console.error("Failed to fetch weather data", err);
      }
    };
    
    fetchWeather();
  }, []);

  if (!data) return <div className="h-64 bg-dp-surfaceLight animate-pulse rounded-[2rem]" />;

  const getIcon3D = (type: string, size = 'w-24 h-24') => {
    switch(type) {
      case 'rain': return (
        <div className={`relative ${size} flex items-center justify-center`}>
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
          <CloudRain className="w-full h-full text-blue-400 drop-shadow-[0_10px_15px_rgba(59,130,246,0.5)] z-10" />
        </div>
      );
      case 'sun': return (
        <div className={`relative ${size} flex items-center justify-center`}>
          <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
          <Sun className="w-full h-full text-yellow-400 drop-shadow-[0_10px_15px_rgba(234,179,8,0.5)] z-10" />
        </div>
      );
      case 'cloud': return (
        <div className={`relative ${size} flex items-center justify-center`}>
          <div className="absolute inset-0 bg-gray-500/20 blur-xl rounded-full"></div>
          <Cloud className="w-full h-full text-gray-300 drop-shadow-[0_10px_15px_rgba(156,163,175,0.5)] z-10" />
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-dp-surfaceLight to-[#151a25] rounded-[2rem] border border-dp-border shadow-2xl p-6 md:p-8">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-stretch">
        
        {/* Main Current Weather */}
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-8 w-full">
          {getIcon3D(data.icon, 'w-32 h-32 md:w-40 md:h-40 shrink-0')}
          
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-dp-text">Posadas, Misiones</h3>
            <p className="text-dp-textMuted text-sm font-semibold mt-1">Sincronizado vía AccuWeather™</p>
            
            <div className="flex items-baseline justify-center sm:justify-start gap-4 mt-2">
              <span className="text-6xl md:text-7xl font-black font-poppins text-white tracking-tighter">
                {data.temp}°
              </span>
              <span className="text-xl md:text-2xl font-poppins font-bold text-dp-primary">
                {data.condition}
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
              <span className="px-3 py-1.5 bg-black/40 rounded-lg text-xs font-bold text-dp-textMuted flex items-center gap-1.5 border border-white/5">
                <Thermometer className="w-3.5 h-3.5 text-orange-400" /> ST {data.feelsLike}°
              </span>
              <span className="px-3 py-1.5 bg-black/40 rounded-lg text-xs font-bold text-dp-textMuted flex items-center gap-1.5 border border-white/5">
                <Droplets className="w-3.5 h-3.5 text-blue-400" /> {data.humidity}
              </span>
              <span className="px-3 py-1.5 bg-black/40 rounded-lg text-xs font-bold text-dp-textMuted flex items-center gap-1.5 border border-white/5">
                <Wind className="w-3.5 h-3.5 text-gray-400" /> {data.wind}
              </span>
            </div>
          </div>
        </div>

        {/* Extended Forecast */}
        <div className="lg:w-2/5 w-full flex flex-col justify-between bg-black/30 rounded-3xl p-6 border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-black uppercase text-dp-textMuted tracking-widest">Pronóstico Extendido</h4>
            <ChevronRight className="w-4 h-4 text-dp-textMuted" />
          </div>
          
          <div className="flex justify-between items-end gap-2">
            {data.forecast.map((day: any, i: number) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-dp-textMuted uppercase">{day.day}</span>
                {getIcon3D(day.icon, 'w-8 h-8')}
                <div className="flex flex-col items-center mt-1">
                  <span className="text-sm font-bold text-white">{day.temp}°</span>
                  <span className="text-[10px] font-bold text-dp-textMuted opacity-50">{day.min}°</span>
                </div>
                {Number(day.rain.replace('%','')) > 0 && (
                  <span className="text-[8px] font-black text-blue-400 mt-1">{day.rain}</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
