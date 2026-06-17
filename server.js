
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- DATA STORE (PERSISTENCIA EN MEMORIA) ---
let orders = [
  { 
    id: 1001, 
    detalles: "Repuestos Industriales (Caja 20kg)", 
    tipoEntrega: 'PAQUETERIA', 
    nombreCliente: "Ferretería Central", 
    estado: 'PENDIENTE', 
    idRepartidor: null, 
    idComercio: 1, 
    monto: 15500, 
    gananciaChofer: 3200, 
    viaticoCombustible: 800, 
    metodoPago: 'Transferencia', 
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

let drivers = [
  { id: 1, nombre: "Ramiro Tech", vehiculo: "Moto", patente: "A099BCD", puntos: 500, calificacion: 4.9, gananciasSemanales: 120000, nivel: 'DIAMANTE', latitud: -27.370, longitud: -55.890, monotributoActivo: true, polizaSeguro: "VIGENTE", etapaIngreso: 'ACTIVO', tieneKitPaqueteria: true, reseñas: [] }
];

let stores = [
  { id: 1, nombre: "Ferretería Central", categoria: "Ferretería", lat: -27.368, lng: -55.895, plan: 'DIAMANTE', cantidadPedidos: 450, estado: 'ACTIVO', demandaActual: 'ALTA' }
];

// --- API ENDPOINTS ---

// Orders
app.get('/api/orders', (req, res) => res.json(orders));

app.post('/api/orders/:id/assign', (req, res) => {
  const { id } = req.params;
  const { driverId } = req.body;
  const orderIndex = orders.findIndex(o => o.id === parseInt(id));
  if (orderIndex === -1) return res.status(404).json({ error: 'Pedido no encontrado' });
  
  orders[orderIndex] = { ...orders[orderIndex], idRepartidor: driverId, estado: 'ACEPTADO' };
  res.json(orders[orderIndex]);
});

app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const orderIndex = orders.findIndex(o => o.id === parseInt(id));
  if (orderIndex === -1) return res.status(404).json({ error: 'Pedido no encontrado' });
  
  orders[orderIndex] = { ...orders[orderIndex], estado };
  res.json(orders[orderIndex]);
});

// Drivers
app.get('/api/drivers', (req, res) => res.json(drivers));
app.post('/api/drivers', (req, res) => {
  const newDriver = { id: Date.now(), ...req.body, etapaIngreso: 'ACTIVO' };
  drivers.push(newDriver);
  res.status(201).json(newDriver);
});

// Stores
app.get('/api/stores', (req, res) => res.json(stores));
app.post('/api/stores', (req, res) => {
  const newStore = { id: Date.now(), ...req.body, estado: 'ACTIVO' };
  stores.push(newStore);
  res.status(201).json(newStore);
});

// --- CLIMA (WEATHER) API PROXY ---
app.get('/api/v1/weather/now', async (req, res) => {
  const { lat, lng } = req.query;
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    // Retorno simulado elegante si la API Key no está configurada aún
    return res.json({
      temp: 23,
      rainProb: 15,
      wind: 5,
      summary: "Operativa Logística Estable (Clima Templado)"
    });
  }

  try {
    const latitude = lat || -34.6037;
    const longitude = lng || -58.3816;
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=es`);
    if (!response.ok) {
      throw new Error(`Weather API responded status: ${response.status}`);
    }
    const data = await response.json();
    return res.json({
      temp: Math.round(data.main?.temp || 23),
      rainProb: data.rain ? 85 : 12,
      wind: Math.round(data.wind?.speed || 5),
      summary: data.weather?.[0]?.description 
        ? (data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)) 
        : "Operativa Logística Estable"
    });
  } catch (error) {
    console.error('[Weather Proxy Error]:', error);
    return res.json({
      temp: 24,
      rainProb: 20,
      wind: 6,
      summary: "Consola de Clima en Respaldo"
    });
  }
});

// --- ELEVENLABS VOICE SYNTHESIS PROXY ---
app.post('/api/voice/tts', async (req, res) => {
  const { text, voiceId } = req.body;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const selectedVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Rachel default voice ID

  if (!apiKey || apiKey.trim() === '') {
    return res.status(400).json({ error: 'La API Key de ElevenLabs no está configurada.' });
  }

  if (!text) {
    return res.status(400).json({ error: 'Se requiere el campo "text"' });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      throw new Error(`ElevenLabs API Error: ${errorResponse}`);
    }

    const buffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('[ElevenLabs Proxy Error]:', error);
    return res.status(500).json({ error: 'Error al generar síntesis de voz con ElevenLabs.' });
  }
});

// --- API MAP V1 TO COMPLEMENT API_BASE_URL (FULL COMPATIBILITY) ---
app.get('/api/v1/orders', (req, res) => res.json(orders));
app.post('/api/v1/orders', (req, res) => {
  const newOrder = { id: Date.now(), ...req.body, creadoEn: new Date().toISOString() };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});
app.post('/api/v1/orders/:id/assign', (req, res) => {
  const { id } = req.params;
  const { driverId } = req.query;
  const orderIndex = orders.findIndex(o => o.id === parseInt(id));
  if (orderIndex === -1) return res.status(404).json({ error: 'Pedido no encontrado' });
  
  orders[orderIndex] = { ...orders[orderIndex], idRepartidor: driverId, estado: 'ACEPTADO' };
  res.json(orders[orderIndex]);
});
app.post('/api/v1/orders/:id/ready', (req, res) => {
  const { id } = req.params;
  const orderIndex = orders.findIndex(o => o.id === parseInt(id));
  if (orderIndex === -1) return res.status(404).json({ error: 'Pedido no encontrado' });
  orders[orderIndex].estado = 'READY_FOR_PICKUP';
  res.json(orders[orderIndex]);
});
app.post('/api/v1/orders/:id/pickup', (req, res) => {
  const { id } = req.params;
  const orderIndex = orders.findIndex(o => o.id === parseInt(id));
  if (orderIndex === -1) return res.status(404).json({ error: 'Pedido no encontrado' });
  orders[orderIndex].estado = 'PICKED_UP';
  res.json(orders[orderIndex]);
});
app.post('/api/v1/orders/:id/deliver', (req, res) => {
  const { id } = req.params;
  const orderIndex = orders.findIndex(o => o.id === parseInt(id));
  if (orderIndex === -1) return res.status(404).json({ error: 'Pedido no encontrado' });
  orders[orderIndex].estado = 'DELIVERED';
  res.json(orders[orderIndex]);
});
app.get('/api/v1/drivers', (req, res) => res.json(drivers));
app.get('/api/v1/stores', (req, res) => res.json(stores));

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ONLINE', nodes: { orders: orders.length, drivers: drivers.length } });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(PORT, () => {
  console.log(`[BACKEND] Delivery Plus Neural Logistics operativo en puerto ${PORT}`);
});
