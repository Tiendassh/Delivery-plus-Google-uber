import React from 'react';

const LegalView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-12">
      <header className="mb-12">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase text-black leading-none mb-4">
          Auditoría <span className="text-plus-blue">Legal</span>
        </h2>
        <p className="text-xl text-gray-600 font-medium max-w-3xl">
          Documentación regulatoria, términos de servicio y políticas de privacidad preparadas para revisión legal y cumplimiento normativo en Argentina.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Términos y Condiciones */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-black/5">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6">
            📜
          </div>
          <h3 className="text-2xl font-black italic uppercase tracking-tight mb-4">Términos y Condiciones</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Regula la relación entre Delivery Plus, los comercios adheridos, los repartidores independientes y los usuarios finales. Incluye cláusulas de limitación de responsabilidad y uso de la plataforma.
          </p>
          <button className="text-plus-blue font-bold text-sm uppercase tracking-widest hover:underline">
            Revisar Documento Completo →
          </button>
        </div>

        {/* Políticas de Privacidad */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-black/5">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6">
            🔒
          </div>
          <h3 className="text-2xl font-black italic uppercase tracking-tight mb-4">Políticas de Privacidad</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Cumplimiento con la Ley de Protección de Datos Personales (Ley 25.326). Detalla cómo recopilamos, almacenamos y procesamos los datos de geolocalización, pagos e identidad.
          </p>
          <button className="text-plus-blue font-bold text-sm uppercase tracking-widest hover:underline">
            Revisar Documento Completo →
          </button>
        </div>

        {/* Defensa del Consumidor */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-black/5">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6">
            ⚖️
          </div>
          <h3 className="text-2xl font-black italic uppercase tracking-tight mb-4">Defensa del Consumidor</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Adecuación a la Ley de Defensa del Consumidor (Ley 24.240). Incluye el "Botón de Arrepentimiento" obligatorio y los canales de resolución de conflictos y reclamos.
          </p>
          <button className="text-plus-blue font-bold text-sm uppercase tracking-widest hover:underline">
            Revisar Documento Completo →
          </button>
        </div>

        {/* Contratos de Repartidores */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-black/5">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6">
            🛵
          </div>
          <h3 className="text-2xl font-black italic uppercase tracking-tight mb-4">Acuerdo de Repartidores</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Marco legal que establece la relación de independencia de los repartidores (locación de servicios), requisitos de seguros (accidentes personales) y facturación (Monotributo).
          </p>
          <button className="text-plus-blue font-bold text-sm uppercase tracking-widest hover:underline">
            Revisar Documento Completo →
          </button>
        </div>
      </div>

      <div className="bg-black text-white p-12 rounded-[3rem] shadow-2xl mt-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tight mb-2">Estado de Auditoría</h3>
          <p className="text-white/70">La plataforma está estructurada para facilitar la revisión de su equipo legal.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/10 px-6 py-4 rounded-2xl border border-white/10">
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="font-bold uppercase tracking-widest text-sm">Pendiente de Revisión</span>
        </div>
      </div>
    </div>
  );
};

export default LegalView;
