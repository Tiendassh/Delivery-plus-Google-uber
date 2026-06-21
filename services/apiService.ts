import { Pedido, EstadoPedido, SocioRepartidor, Comercio, WeatherNow } from '../types';

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
      const { mockApi } = await import('./mockApi');
      return mockApi.getOrders() as unknown as Promise<Pedido[]>;
    }
  },

  async assignOrder(orderId: string | number, driverId: string | number) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/orders/${orderId}/assign?driverId=${driverId}`, {
        method: 'POST'
      });
      return await res.json();
    } catch {
      const { mockApi } = await import('./mockApi');
      return mockApi.assignOrder(Number(orderId), Number(driverId));
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
      const { mockApi } = await import('./mockApi');
      return mockApi.updateOrderStatus(Number(orderId), status);
    }
  },

  async fetchWeather(lat: number, lng: number): Promise<WeatherNow> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/weather/now?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return { temp: 22, rainProb: 10, wind: 5, summary: "Operativa Estable" };
    }
  },

  async getDrivers(): Promise<SocioRepartidor[]> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/drivers`);
      return await res.json();
    } catch {
      const { mockApi } = await import('./mockApi');
      return mockApi.getDeliveries() as unknown as Promise<SocioRepartidor[]>;
    }
  },

  async getStores(): Promise<Comercio[]> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/stores`);
      return await res.json();
    } catch {
      const { mockApi } = await import('./mockApi');
      return mockApi.getStores() as unknown as Promise<Comercio[]>;
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
      const { mockApi } = await import('./mockApi');
      return mockApi.registerDriver(data);
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
      const { mockApi } = await import('./mockApi');
      return mockApi.createOrder(data);
    }
  }
};