
import { Pedido, EstadoPedido, SocioRepartidor, Comercio, PlanComercio, Transaccion } from '../types';

const STORAGE_KEYS = {
  ORDERS: 'dp_v2_orders',
  DRIVERS: 'dp_v2_drivers',
  STORES: 'dp_v2_stores',
  TRANSACTIONS: 'dp_v2_transactions'
};

const load = <T>(key: string, def: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : def;
  } catch { return def; }
};

const save = <T>(key: string, data: T) => localStorage.setItem(key, JSON.stringify(data));

let orders: Pedido[] = load(STORAGE_KEYS.ORDERS, []);
let drivers: SocioRepartidor[] = load(STORAGE_KEYS.DRIVERS, []);
let stores: Comercio[] = load(STORAGE_KEYS.STORES, []);
let transactions: Transaccion[] = load(STORAGE_KEYS.TRANSACTIONS, []);

if (orders.length === 0) {
  orders = [
    { 
      id: 1001, 
      detalles: "Doble Cuarto XL + Papas", 
      tipoEntrega: 'COMIDA', 
      nombreCliente: "Marcos Galperin", 
      estado: EstadoPedido.PENDIENTE, 
      idRepartidor: null, 
      idComercio: 1, 
      monto: 8500, 
      gananciaChofer: 1200, 
      viaticoCombustible: 400, 
      metodoPago: 'Mercado Pago', 
      creadoEn: new Date().toISOString(), 
      latUsuario: -27.375, 
      lngUsuario: -55.905, 
      latitud: -27.368, 
      longitud: -55.895, 
      esNocturno: false, 
      historialLegal: [], 
      chatDirecto: [] 
    }
  ];
  save(STORAGE_KEYS.ORDERS, orders);
}

if (drivers.length === 0) {
  drivers = [
    { id: 1, nombre: "Ramiro Tech", vehiculo: "Moto", patente: "A099BCD", puntos: 500, calificacion: 4.9, gananciasSemanales: 120000, nivel: 'DIAMANTE', latitud: -27.370, longitud: -55.890, monotributoActivo: true, polizaSeguro: "VIGENTE", etapaIngreso: 'ACTIVO', tieneKitPaqueteria: true, reseñas: [] }
  ];
  save(STORAGE_KEYS.DRIVERS, drivers);
}

export const mockApi = {
  getOrders: async () => [...orders],
  getDeliveries: async () => [...drivers],
  getDrivers: async () => [...drivers],
  getStores: async () => [...stores],
  getTransactions: async () => [...transactions],

  assignOrder: async (orderId: number, driverId: number) => {
    orders = orders.map(o => Number(o.id) === orderId ? { ...o, estado: EstadoPedido.ACEPTADO, idRepartidor: driverId } : o) as Pedido[];
    save(STORAGE_KEYS.ORDERS, orders);
    return orders.find(o => Number(o.id) === orderId);
  },

  updateOrderStatus: async (orderId: number, estado: EstadoPedido) => {
    orders = orders.map(o => Number(o.id) === orderId ? { ...o, estado } : o) as Pedido[];
    save(STORAGE_KEYS.ORDERS, orders);
    return orders.find(o => Number(o.id) === orderId);
  },

  registerDriver: async (data: Partial<SocioRepartidor>) => {
    const newDriver: SocioRepartidor = {
      id: Date.now(),
      nombre: data.nombre || "Nuevo Rider",
      vehiculo: data.vehiculo || "Moto",
      patente: data.patente || "PROV-000",
      puntos: 0, calificacion: 5.0, gananciasSemanales: 0, nivel: 'PLATA', latitud: -27.368, longitud: -55.895,
      monotributoActivo: true, polizaSeguro: "VIGENTE", etapaIngreso: data.etapaIngreso || 'PENDIENTE',
      tieneKitPaqueteria: data.tieneKitPaqueteria || false, reseñas: []
    };
    drivers = [...drivers, newDriver];
    save(STORAGE_KEYS.DRIVERS, drivers);
    return newDriver;
  },

  registerStore: async (data: Partial<Comercio>) => {
    const newStore: Comercio = {
      id: Date.now(),
      nombre: data.nombre || "Nuevo Comercio",
      categoria: data.categoria || "Comida",
      cantidadPedidos: 0,
      estado: data.estado || 'ACTIVO',
      plan: data.plan || PlanComercio.BRONCE,
      lat: -27.368,
      lng: -55.895,
      demandaActual: 'BAJA'
    };
    stores = [...stores, newStore];
    save(STORAGE_KEYS.STORES, stores);
    return newStore;
  },

  createOrder: async (data: Partial<Pedido>) => {
    const newId = orders.length > 0 ? Math.max(...orders.map(o => Number(o.id) || 1000)) + 1 : 1001;
    const newOrder: Pedido = {
      id: newId,
      nombreCliente: data.nombreCliente || "Cliente Directo",
      detalles: data.detalles || "Paquete Unitario",
      estado: data.estado || EstadoPedido.PENDIENTE,
      idRepartidor: data.idRepartidor || null,
      monto: data.monto || 1800,
      latitud: data.latitud || -27.368,
      longitud: data.longitud || -55.895,
      latUsuario: data.latUsuario || -27.375,
      lngUsuario: data.lngUsuario || -55.905,
      tipoEntrega: 'PAQUETERIA',
      creadoEn: new Date().toISOString(),
      historialLegal: [],
      chatDirecto: [],
      ...data
    } as any;
    orders = [...orders, newOrder];
    save(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  },

  addTransaction: async (tx: Partial<Transaccion>) => {
    const newTx: Transaccion = {
      id: `TX-${Date.now()}`,
      monto: tx.monto || 0,
      tipo: tx.tipo || 'ENVIO',
      detalle: tx.detalle || 'Transacción de Red',
      fecha: new Date().toISOString()
    };
    transactions = [newTx, ...transactions];
    save(STORAGE_KEYS.TRANSACTIONS, transactions);
    return newTx;
  }
};
