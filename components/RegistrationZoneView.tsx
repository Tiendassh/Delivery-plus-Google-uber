import React from 'react';

interface Props {
  setPestañaActiva: (pestaña: string) => void;
}

const RegistrationZoneView: React.FC<Props> = ({ setPestañaActiva }) => {
  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto space-y-12">
      <div className="mb-12">
        <h2 className="text-4xl font-[900] tracking-tighter uppercase italic text-gray-900 mb-4">Zona de Inscripción</h2>
        <p className="text-gray-500 text-lg">Únete a la red de Delivery Plus. Selecciona tu perfil para conocer los requisitos y comenzar el proceso de alta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Alta de Negocio */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 flex flex-col hover:shadow-xl transition-shadow duration-300">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-8 text-plus-blue">
            🏪
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Alta de Negocio</h3>
          <p className="text-gray-600 mb-8 flex-1">
            Expande tu alcance y aumenta tus ventas uniendo tu comercio a nuestra plataforma. Llegá a miles de clientes en tu zona.
          </p>
          
          <div className="space-y-6 mb-10">
            <div>
              <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs">Requisitos</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><span>✅</span> Constancia de inscripción (CUIT/Monotributo)</li>
                <li className="flex items-center gap-2"><span>✅</span> Habilitación comercial vigente</li>
                <li className="flex items-center gap-2"><span>✅</span> Cuenta bancaria o CVU (Mercado Pago)</li>
                <li className="flex items-center gap-2"><span>✅</span> Menú o lista de productos con precios</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs">Acuerdo de Servicio</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><span>🤝</span> Comisión transparente por venta exitosa</li>
                <li className="flex items-center gap-2"><span>⏱️</span> Liquidaciones semanales garantizadas</li>
                <li className="flex items-center gap-2"><span>📱</span> Soporte técnico y comercial dedicado</li>
              </ul>
            </div>
          </div>

          <button 
            onClick={() => setPestañaActiva('alta-comercio')}
            className="w-full py-4 bg-black hover:bg-gray-800 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-colors"
          >
            Comenzar Alta de Negocio
          </button>
        </div>

        {/* Alta de Delivery */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 flex flex-col hover:shadow-xl transition-shadow duration-300">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-8 text-plus-blue">
            🛵
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Alta de Delivery</h3>
          <p className="text-gray-600 mb-8 flex-1">
            Sé tu propio jefe, maneja tus horarios y genera ingresos adicionales repartiendo con Delivery Plus.
          </p>
          
          <div className="space-y-6 mb-10">
            <div>
              <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs">Requisitos</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><span>✅</span> Ser mayor de 18 años</li>
                <li className="flex items-center gap-2"><span>✅</span> Vehículo propio (Moto, Auto o Bicicleta)</li>
                <li className="flex items-center gap-2"><span>✅</span> Licencia de conducir y seguro al día</li>
                <li className="flex items-center gap-2"><span>✅</span> Smartphone con conexión a internet</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs">Acuerdo de Servicio</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><span>💸</span> Ganancias por distancia y tiempo</li>
                <li className="flex items-center gap-2"><span>🕒</span> Flexibilidad total de horarios</li>
                <li className="flex items-center gap-2"><span>🛡️</span> Seguro de accidentes personales (opcional)</li>
              </ul>
            </div>
          </div>

          <button 
            onClick={() => setPestañaActiva('alta-socio')}
            className="w-full py-4 bg-plus-blue hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-colors"
          >
            Comenzar Alta de Repartidor
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationZoneView;
