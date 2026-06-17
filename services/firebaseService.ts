import { MensajeChat, ChatRoom } from '../types';

const STORAGE_KEY = 'dp_v2_chat_persistence';

class RealtimeMessagingService {
  private chats: Map<string, ChatRoom> = new Map();
  private listeners: Map<string, ChatCallback[]> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.chats = new Map(Object.entries(parsed));
      }
    } catch (e) {
      console.error("Error loading chat persistence:", e);
    }
  }

  private saveToStorage() {
    try {
      const obj = Object.fromEntries(this.chats.entries());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.error("Error saving chat persistence:", e);
    }
  }

  subscribe(roomId: string | number, callback: ChatCallback) {
    const id = String(roomId);
    if (!this.chats.has(id)) {
      this.chats.set(id, {
        pedidoId: typeof roomId === 'number' ? roomId : 0,
        mensajes: [],
        ultimaActualizacion: new Date().toISOString()
      });
      this.saveToStorage();
    }

    const currentListeners = this.listeners.get(id) || [];
    this.listeners.set(id, [...currentListeners, callback]);
    
    callback(this.chats.get(id)!);

    return () => {
      const filtered = (this.listeners.get(id) || []).filter(l => l !== callback);
      this.listeners.set(id, filtered);
    };
  }

  async sendMessage(roomId: string | number, emisorId: string | number, nombre: string, texto: string, tipo: MensajeChat['tipo'] = 'USUARIO') {
    const id = String(roomId);
    const chat = this.chats.get(id);
    if (!chat) return;

    const nuevoMensaje: MensajeChat = {
      id: Math.random().toString(36).substring(2, 11),
      emisorId,
      emisorNombre: nombre,
      texto,
      fechaHora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      leido: false,
      tipo
    };

    chat.mensajes.push(nuevoMensaje);
    chat.ultimaActualizacion = new Date().toISOString();
    chat.estaEscribiendo = null;

    this.saveToStorage();
    this.notify(id);
  }

  setTyping(roomId: string | number, userId: string | number | null) {
    const id = String(roomId);
    const chat = this.chats.get(id);
    if (chat) {
      chat.estaEscribiendo = userId ? String(userId) : null;
      this.notify(id);
    }
  }

  private notify(id: string) {
    const chat = this.chats.get(id);
    const callbacks = this.listeners.get(id) || [];
    if (chat) {
      callbacks.forEach(cb => cb({ ...chat, mensajes: [...chat.mensajes] }));
    }
  }
  
  getActiveNegotiations() {
    return Array.from(this.chats.entries())
      .filter(([id]) => id.startsWith('LEAD_'))
      .map(([id, chat]) => ({ id, chat }))
      .sort((a, b) => new Date(b.chat.ultimaActualizacion).getTime() - new Date(a.chat.ultimaActualizacion).getTime());
  }
}

type ChatCallback = (chat: ChatRoom) => void;
export const firebaseService = new RealtimeMessagingService();