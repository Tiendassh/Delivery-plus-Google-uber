
import { SesionWhatsApp } from '../types';

const WA_TOKEN = process.env.WA_TOKEN;
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;

export const whatsappService = {
  getSessions: async (): Promise<SesionWhatsApp[]> => {
    // Aquí conectarías con tu backend del VPS que almacena las sesiones de WhatsApp
    return import('./mockApi').then(() => [
      {
        id: 'wa-prod-1',
        nombreCliente: 'Comercio en Espera',
        telefonoCliente: '+549...',
        ultimoMensaje: 'Hola, quiero información de los planes.',
        estado: 'IA_VENDEDOR',
        esPremium: false,
        interes: 'CONTRATO_NUEVO',
        tiempoEsperaMinutos: 0,
        historial: []
      }
    ]);
  },

  sendMessage: async (phone: string, text: string) => {
    if (!WA_TOKEN || !WA_PHONE_NUMBER_ID) {
      console.warn('[WhatsApp] Tokens no configurados. Simulando envío...');
      return true;
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v17.0/${WA_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WA_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: text }
        })
      });
      return response.ok;
    } catch (error) {
      console.error('[WhatsApp] Error enviando mensaje:', error);
      return false;
    }
  }
};
