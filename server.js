
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

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

// --- GEMINI REST PROXY FOR CHAT IA ---

app.post('/api/gemini/chat', async (req, res) => {
  const { messages: currentMessages, systemInstruction } = req.body;
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: "La API Key de Gemini no está configurada en el servidor." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Map messages payload to contents
    let contents = currentMessages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Gemini API requires the conversation history to start with a 'user' role
    // and maintain alternating roles.
    let validContents = [];
    let expectedRole = 'user';
    
    // We process backwards to keep the most recent messages, then reverse
    for (let i = contents.length - 1; i >= 0; i--) {
      // If we are looking for a model message but get a user message, we can just prepend it
      // But if we want alternating, it's safer to just take everything and let Gemini handle if it's relaxed, 
      // OR we just ensure the first message is 'user' by shifting if 'model'.
    }
    
    // Simple fix: if the first message is 'model', just remove it.
    if (contents.length > 0 && contents[0].role === 'model') {
      contents.shift();
    }
    
    // If there are consecutive elements of the same role, it might error.
    // Let's rebuild the array strictly alternating, ending with the last user message.
    const strictContents = [];
    if (contents.length > 0) {
      let lastRole = null;
      for (const msg of contents) {
        if (msg.role !== lastRole) {
          strictContents.push(msg);
          lastRole = msg.role;
        } else {
          // If we have two of the same role in a row, combine their text
          strictContents[strictContents.length - 1].parts[0].text += '\n\n' + msg.parts[0].text;
        }
      }
    }
    
    if (strictContents.length > 0 && strictContents[0].role === 'model') {
      strictContents.shift();
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: strictContents.length > 0 ? strictContents : [{role: 'user', parts: [{text: 'Hola'}]}],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7
      }
    });

    const aiText = response.text || "Hubo un error al generar la respuesta.";
    res.json({ text: aiText });
  } catch (error) {
    if (error.message && error.message.includes('503')) {
      console.warn("[Gemini API Proxy Warning]: High demand, 503 Service Unavailable");
    } else {
      console.warn("[Gemini API Proxy Error]:", error.message || error);
    }
    res.status(503).json({ error: error.message || "Error interno llamando a Gemini." });
  }
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
    console.warn('[Weather Proxy Error]:', error.message || error);
    return res.json({
      temp: 24,
      rainProb: 20,
      wind: 6,
      summary: "Consola de Clima en Respaldo"
    });
  }
});

// --- ELEVENLABS TTS PROXY ---
app.post('/api/elevenlabs/tts', async (req, res) => {
  const { text, voiceProfile } = req.body;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  let valentinaVoiceId = process.env.ELEVENLABS_VALENTINA_VOICE_ID;
  let mateoVoiceId = process.env.ELEVENLABS_MATEO_VOICE_ID;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_')) {
    return res.status(400).json({ error: 'La API Key de ElevenLabs no está configurada.' });
  }

  if (!text) {
    return res.status(400).json({ error: 'Se requiere el campo "text"' });
  }
  
  if (!mateoVoiceId) mateoVoiceId = '4wDRKlxcHNOFO5kBvE81'; // Default
  if (!valentinaVoiceId) valentinaVoiceId = 'ByVRQtaK1WDOvTmP1PKO'; // Default

  let voiceId = mateoVoiceId;
  if (voiceProfile === 'valentina' || voiceProfile === 'agustina') {
    voiceId = valentinaVoiceId;
  }

  try {
    const { ElevenLabsClient } = await import('@elevenlabs/elevenlabs-js');
    const elevenlabs = new ElevenLabsClient({ apiKey });

    console.log(`[ElevenLabs TTS Proxy] Inicializando conversión para voiceId: ${voiceId}`);
    
    // Returns a stream or a readable
    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: text,
      model_id: 'eleven_multilingual_v2',
      output_format: 'mp3_44100_128',
    });

    console.log(`[ElevenLabs TTS Proxy] Respuesta de stream generada correctamente.`);
    res.set('Content-Type', 'audio/mpeg');

    if (audioStream && typeof audioStream.pipe === 'function') {
      audioStream.pipe(res);
    } else {
      // It's probably a Blob, Buffer or ArrayBuffer
      let buffer;
      if (audioStream instanceof Buffer) {
        buffer = audioStream;
      } else if (audioStream.arrayBuffer) {
        buffer = Buffer.from(await audioStream.arrayBuffer());
      } else if (typeof audioStream === 'object' && audioStream !== null) {
        // Collect stream if it's an async iterable
        const chunks = [];
        for await (const chunk of audioStream) {
          chunks.push(chunk);
        }
        buffer = Buffer.concat(chunks);
      } else {
        buffer = Buffer.from(audioStream);
      }
      res.send(buffer);
    }
  } catch (error) {
    if (error.message && error.message.includes('payment_required')) {
      console.warn('[ElevenLabs TTS Proxy Warning]: Free tier limit or premium voice requested.');
    } else {
      console.warn('[ElevenLabs TTS Proxy Error]:', error.message || error);
    }
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

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BACKEND] Delivery Plus Neural Logistics operativo en puerto ${PORT}`);
  });
}

startServer();
