
declare global {
  interface Window {
    aistudio?: any;
  }
}

export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  ACEPTADO = 'ACEPTADO',
  EN_RETIRO = 'EN RETIRO',
  EN_CAMINO = 'EN CAMINO',
  ENTREGADO = 'ENTREGADO',
  LIQUIDADO = 'LIQUIDADO',
  CANCELADO = 'CANCELADO',
  
  // Compatibilidad hacia atrás
  NEW = 'PENDIENTE',
  ACCEPTED_BY_BUSINESS = 'ACEPTADO',
  PREPARING = 'ACEPTADO',
  PREPARANDO = 'ACEPTADO',
  READY_FOR_PICKUP = 'EN RETIRO',
  ASSIGNED_TO_DRIVER = 'ACEPTADO',
  PICKED_UP = 'EN RETIRO',
  DELIVERED = 'ENTREGADO',
  CANCELLED = 'CANCELADO',
  INCIDENT = 'CANCELADO',
  RETURNED = 'CANCELADO'
}

export enum PlanComercio {
  BRONCE = 'BRONCE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINO = 'PLATINO',
  DIAMANTE = 'DIAMANTE'
}

export interface MensajeChat {
  id: string;
  emisorId: string | number;
  emisorNombre: string;
  texto: string;
  fechaHora: string;
  leido: boolean;
  tipo: 'USUARIO' | 'ADMIN';
}

export interface SesionWhatsApp {
  id: string;
  nombreCliente: string;
  telefonoCliente: string;
  ultimoMensaje: string;
  estado: string;
  esPremium: boolean;
  interes: string;
  tiempoEsperaMinutos: number;
  historial: any[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  qty: number;
  unitPrice: number;
  notes?: string;
}

export interface Pedido {
  id: string | number;
  storefrontSlug?: string;
  estado: EstadoPedido;
  monto: number; // Mapeado de 'Total' en .NET
  platformFee?: number;
  driverNet?: number;
  deliveryLat?: number;
  deliveryLng?: number;
  deliveryAddressText?: string;
  idRepartidor: string | number | null; // Mapeado de 'DriverId'
  creadoEn: string; // Mapeado de 'CreatedAt'
  items?: OrderItem[];
  // Campos de compatibilidad UI
  nombreCliente: string;
  detalles: string;
  tipoEntrega?: 'COMIDA' | 'PAQUETERIA';
  idComercio?: string | number;
  gananciaChofer?: number;
  viaticoCombustible?: number;
  metodoPago?: string;
  latUsuario: number;
  lngUsuario: number;
  latitud: number;
  longitud: number;
  esNocturno?: boolean;
  historialLegal?: any[];
  chatDirecto?: any[];
}

export interface WeatherNow {
  temp: number;
  rainProb: number;
  wind: number;
  summary: string;
}

export type UserRole = 'REPARTIDOR' | 'COMERCIO' | 'EMPRENDEDOR' | 'ADMINISTRADOR' | 'IA_ASISTENTE';

export interface SocioRepartidor {
  id: string | number;
  nombre: string;
  vehiculo: string;
  patente: string;
  puntos: number;
  calificacion: number;
  gananciasSemanales: number;
  nivel: 'DIAMANTE' | 'ORO' | 'PLATA' | 'BRONCE';
  latitud: number;
  longitud: number;
  monotributoActivo: boolean;
  polizaSeguro: string;
  etapaIngreso: 'PENDIENTE' | 'DOCS_VALIDADOS' | 'ACTIVO' | 'LISTA_ESPERA_PRO';
  tieneKitPaqueteria: boolean;
  reseñas: any[];
}

export interface Comercio {
  id: string | number;
  nombre: string;
  categoria: string;
  cantidadPedidos: number;
  estado: 'ACTIVO' | 'SUSPENDIDO';
  plan: string;
  lat: number;
  lng: number;
  demandaActual: 'BAJA' | 'MEDIA' | 'ALTA';
}

export interface Transaccion {
  id: string;
  monto: number;
  tipo: 'VENTA_TURNO' | 'SUSCRIPCION' | 'ENVIO' | 'RETIRO' | 'MEMBRESIA_PAQUETERIA' | 'GANANCIA_CHOFER';
  detalle: string;
  fecha: string;
}

export interface ChatRoom {
  pedidoId: string | number;
  mensajes: MensajeChat[];
  ultimaActualizacion: string;
  estaEscribiendo?: string | null;
}
