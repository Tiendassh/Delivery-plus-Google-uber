
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

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ONLINE', nodes: { orders: orders.length, drivers: drivers.length } });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(PORT, () => {
  console.log(`[BACKEND] Delivery Plus Neural Logistics operativo en puerto ${PORT}`);
});
