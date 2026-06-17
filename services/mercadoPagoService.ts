
import { Transaccion } from '../types';

export interface MPBalance {
  total_amount: number;
  available_balance: number;
  unavailable_balance: number;
  isSimulated?: boolean;
}

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const MP_PUBLIC_KEY = process.env.MERCADOPAGO_PUBLIC_KEY;

export const mercadoPagoService = {
  getPublicKey: () => MP_PUBLIC_KEY,
  
  isConfigured: () => {
    return !!MP_ACCESS_TOKEN && !MP_ACCESS_TOKEN.includes('YOUR_ACCESS_TOKEN');
  },

  getUserInfo: async (): Promise<{ first_name?: string, last_name?: string, email?: string } | null> => {
    if (!mercadoPagoService.isConfigured()) return null;
    try {
      const response = await fetch('https://api.mercadopago.com/users/me', {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  },

  getBalance: async (): Promise<MPBalance> => {
    if (!mercadoPagoService.isConfigured()) {
      return {
        total_amount: 5400300.25,
        available_balance: 4900000.00,
        unavailable_balance: 500300.25,
        isSimulated: true
      };
    }

    try {
      const response = await fetch('https://api.mercadopago.com/v1/account/balance', {
        headers: { 
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('MP API Error');
      return await response.json();
    } catch (error) {
      return {
        total_amount: 5400300.25,
        available_balance: 4900000.00,
        unavailable_balance: 500300.25,
        isSimulated: true
      };
    }
  },

  getHistorialTransacciones: async (): Promise<Transaccion[]> => {
    if (!mercadoPagoService.isConfigured()) {
      return [
        { id: 'TX-SIM-01', monto: 12500, tipo: 'VENTA_TURNO', detalle: 'Suscripción Mensual Pizzería El Sol', fecha: new Date().toISOString() },
        { id: 'TX-SIM-02', monto: 4500, tipo: 'ENVIO', detalle: 'Envío Pack Express #992', fecha: new Date(Date.now() - 3600000).toISOString() },
        { id: 'TX-SIM-03', monto: -1800, tipo: 'GANANCIA_CHOFER', detalle: 'Pago Chofer: Mario Rossi', fecha: new Date(Date.now() - 7200000).toISOString() }
      ];
    }
    
    try {
      const response = await fetch('https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=10', {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
      });
      const data = await response.json();
      return data.results.map((r: any) => ({
        id: r.id.toString(),
        monto: r.transaction_amount,
        tipo: r.operation_type === 'regular_payment' ? 'ENVIO' : 'RETIRO',
        detalle: r.description || 'Transacción Mercado Pago',
        fecha: r.date_created
      }));
    } catch {
      return [];
    }
  },

  registrarVenta: async (monto: number, detalle: string, tipo: Transaccion['tipo']) => {
    console.log(`[MP] Registrando venta de ${monto} por ${detalle} (${tipo})`);
    // Simulación de registro local/remoto de la transacción
    return true;
  },

  createPreference: async (title: string, price: number, quantity: number = 1) => {
    if (!mercadoPagoService.isConfigured()) {
      console.warn('[MP] Usando modo simulación para preferencia.');
      return { init_point: '#' };
    }

    try {
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [{ title, unit_price: price, quantity, currency_id: 'ARS' }],
          back_urls: { success: window.location.href, failure: window.location.href, pending: window.location.href },
          auto_return: 'approved'
        })
      });
      return await response.json();
    } catch (error) {
      console.error('[MP] Error creando preferencia:', error);
      return { init_point: '#' };
    }
  }
};
