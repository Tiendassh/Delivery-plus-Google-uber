import React from 'react';

const AboutUsView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-12">
      <header className="mb-12">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase text-black leading-none mb-4">
          Quiénes <span className="text-plus-blue">Somos</span>
        </h2>
        <p className="text-xl text-gray-600 font-medium max-w-3xl">
          Conectando comercios locales, repartidores independientes y clientes a través de una plataforma tecnológica eficiente y transparente, nacida en Argentina.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-black/5">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6">
            🇦🇷
          </div>
          <h3 className="text-3xl font-black italic uppercase tracking-tight mb-4">Nuestra Misión</h3>
          <p className="text-gray-600 leading-relaxed">
            En Delivery Plus, nuestra misión es democratizar el acceso a la logística de última milla para los comercios de barrio, al mismo tiempo que brindamos una oportunidad de ingresos flexible y justa para los repartidores. Creemos en el poder de la tecnología para impulsar la economía local.
          </p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-black/5">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6">
            🚀
          </div>
          <h3 className="text-3xl font-black italic uppercase tracking-tight mb-4">Nuestra Visión</h3>
          <p className="text-gray-600 leading-relaxed">
            Ser la plataforma de delivery líder en la región, reconocida por su transparencia, bajas comisiones y excelente soporte humano y tecnológico. Queremos ser el socio estratégico número uno de cada emprendedor gastronómico y comercial.
          </p>
        </div>
      </div>

      <div className="bg-black text-white p-12 rounded-[3rem] shadow-2xl mt-12">
        <h3 className="text-4xl font-black italic uppercase tracking-tight mb-8 text-center">¿Cómo funciona nuestro servicio?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              🏪
            </div>
            <h4 className="text-xl font-bold mb-3">Para Comercios</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              Te damos una vitrina digital. Recibís pedidos directamente en nuestra plataforma, los preparás y nosotros nos encargamos de enviar a un repartidor para que llegue rápido y seguro a tu cliente.
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              🛵
            </div>
            <h4 className="text-xl font-bold mb-3">Para Repartidores</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              Te conectás cuando querés. Aceptás los pedidos que te convienen, recogés el paquete en el comercio y lo entregás. Ganás dinero por cada viaje completado, con liquidaciones claras.
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              📱
            </div>
            <h4 className="text-xl font-bold mb-3">Para Clientes</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              Exploran los mejores locales de su zona, piden lo que necesitan con unos pocos clics y siguen su pedido en tiempo real hasta la puerta de su casa.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-black/5 mt-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tight mb-2">¿Listo para sumarte?</h3>
          <p className="text-gray-600">Conocé los requisitos y empezá a operar con nosotros hoy mismo.</p>
        </div>
        <button 
          onClick={() => document.querySelector('button:has(span:contains("Inscripción"))')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
          className="bg-plus-blue hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest transition-colors whitespace-nowrap"
        >
          Ir a Inscripción
        </button>
      </div>
    </div>
  );
};

export default AboutUsView;
