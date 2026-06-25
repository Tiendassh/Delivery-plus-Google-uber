import { Pedido, EstadoPedido, SocioRepartidor, Comercio, WeatherNow } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const API_BASE_URL = ''; 

async function fetchWithTimeout(resource: string, options: any = {}, timeout = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const apiService = {
  getEnv() {
    return window.location.hostname === 'localhost' ? "DELIVERY_PLUS_LOCAL_DEV" : "DELIVERY_PLUS_PRODUCTION_CORE";
  },

  async fetchOrders(): Promise<Pedido[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('pedidos').select('*');
        if (error) throw error;
        return data as Pedido[];
      } catch (err: any) {
        console.warn('Supabase fetchOrders failed:', err.message);
      }
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/orders`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data.map((o: any) => ({
        ...o,
        monto: o.total || 0,
        idRepartidor: o.driverId,
        creadoEn: o.createdAt,
        nombreCliente: o.nombreCliente || `ID: ${String(o.id).slice(0,5)}`,
        detalles: o.items?.map((i: any) => `${i.qty}x Art.`).join(', ') || "Sin detalles"
      }));
    } catch {
      // AGENTS.md RULE: No mock data. Show empty state.
      return [];
    }
  },

  async assignOrder(orderId: string | number, driverId: string | number) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/orders/${orderId}/assign?driverId=${driverId}`, {
        method: 'POST'
      });
      return await res.json();
    } catch {
      return { success: false, error: 'No connection' };
    }
  },

  async updateOrder(orderId: string | number, status: EstadoPedido) {
    let endpoint = `${API_BASE_URL}/api/v1/orders/${orderId}`;
    if ((status as any) === EstadoPedido.READY_FOR_PICKUP) endpoint += '/ready';
    else if ((status as any) === EstadoPedido.PICKED_UP) endpoint += '/pickup';
    else if ((status as any) === EstadoPedido.DELIVERED) endpoint += '/deliver';
    
    try {
      const res = await fetchWithTimeout(endpoint, { method: 'POST' });
      return res.ok ? await res.json() : { error: "API_ERROR" };
    } catch {
      return { success: false, error: 'No connection' };
    }
  },

  async fetchWeather(lat: number, lng: number): Promise<WeatherNow> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/weather/now?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return { temp: 0, rainProb: 0, wind: 0, summary: "Datos no disponibles" };
    }
  },

  async getDrivers(): Promise<SocioRepartidor[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('repartidores').select('*');
        if (error) throw error;
        return data as SocioRepartidor[];
      } catch (err: any) {
        console.warn('Supabase getDrivers failed:', err.message);
      }
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/drivers`);
      return await res.json();
    } catch {
      // AGENTS.md RULE: No mock data.
      return [];
    }
  },

  async getStores(): Promise<Comercio[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('comercios').select('*');
        if (error) throw error;
        return data as Comercio[];
      } catch (err: any) {
        console.warn('Supabase getStores failed:', err.message);
      }
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/stores`);
      return await res.json();
    } catch {
      // AGENTS.md RULE: No mock data.
      return [];
    }
  },

  async registerDriver(data: any) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/notifications/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async createOrder(data: any) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async registerStore(data: any) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/stores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  }
};