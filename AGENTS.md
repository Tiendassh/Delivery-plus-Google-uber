# DELIVERY PLUS MASTER AGENT

VISIÓN, ARQUITECTURA, IA, OPERACIONES, SEGURIDAD, LEGAL Y CRECIMIENTO

## VISIÓN

Delivery Plus no es una aplicación de delivery.

Delivery Plus es una plataforma logística inteligente impulsada por inteligencia artificial.

Su objetivo es conectar personas, comercios, emprendedores, repartidores y operadores mediante tecnología, automatización, seguimiento en tiempo real e inteligencia operativa.

La plataforma debe evolucionar hacia un ecosistema completo de movilidad, logística, asistencia por voz e inteligencia comercial.

---

## PRINCIPIOS FUNDAMENTALES

### DATOS REALES

Prohibido utilizar:

- Mock Data
- Usuarios simulados
- Pedidos simulados
- Ganancias simuladas
- Tracking ficticio
- Métricas ficticias

Si no existen datos:

Mostrar estados vacíos.

Nunca inventar información.

---

### SUPABASE

Supabase es la fuente oficial de verdad.

Toda información debe provenir de Supabase.

Incluye:

- Usuarios
- Roles
- Comercios
- Emprendedores
- Repartidores
- Pedidos
- Tracking
- Notificaciones
- IA
- Historial
- Reputación
- Academia
- Configuración
- Auditorías

No almacenar información crítica en localStorage.

---

### MCP

Preparar toda la arquitectura para MCP.

Los agentes IA deben consultar datos reales desde Supabase.

La IA nunca debe responder utilizando datos inventados.

---

## ARQUITECTURA

Separar claramente:

- Presentation Layer
- Application Layer
- Domain Layer
- Infrastructure Layer
- Data Layer

No mezclar lógica de negocio con componentes visuales.

---

## ROLES DEL SISTEMA

### Repartidor

Funciones:

- Pedidos
- Tracking
- Ganancias
- Navegación
- IA operativa
- SOS

---

### Comercio

Funciones:

- Gestión de pedidos
- Seguimiento
- Estadísticas
- IA comercial

---

### Emprendedor

Funciones:

- Gestión de envíos
- Billetera
- Seguimiento
- Reportes

---

### Administrador

Funciones:

- Centro de operaciones
- Gestión global
- KPIs
- Seguridad
- Auditorías

---

## IA

La IA es un componente central.

Debe soportar:

- Chat de texto
- Chat contextual
- Chat por voz
- IA administrativa
- IA operativa
- IA comercial

---

### MODELO IA OFICIAL

Proveedor principal:

Gemini 2.5 Flash

Proveedor avanzado:

Gemini 2.5 Pro

Arquitectura obligatoria:

AIProvider

Implementaciones futuras:

- Gemini
- OpenAI
- Anthropic
- Local LLM

Nunca depender exclusivamente de un proveedor.

---

### CHAT

Implementar:

- Conversaciones persistentes
- Historial
- Contexto por usuario
- Contexto por rol

Experiencia similar a ChatGPT.

---

### OPEN SOURCE FIRST

Priorizar:

1. Open Source
2. Self Hosted
3. Free Tier
4. SaaS Comercial

Ninguna funcionalidad crítica debe depender exclusivamente de servicios pagos.

---

## VOZ

La voz es parte de la identidad corporativa.

Debe existir una arquitectura desacoplada.

Interface:

VoiceProvider

---

### TTS

Compatibilidad:

- Kokoro TTS
- Piper TTS
- Coqui TTS
- OpenAI TTS
- ElevenLabs

Proveedor principal:

Kokoro TTS

Proveedor fallback:

Piper TTS

ElevenLabs:

Opcional.

Nunca obligatorio.

---

### STT

Compatibilidad:

- Whisper
- Faster Whisper
- Deepgram
- Google Speech

---

### VOICE TO VOICE

Objetivo:

Usuario habla

→ STT

→ IA

→ TTS

→ Audio

Latencia objetivo:

Menor a 2 segundos.

---

## IDENTIDAD DE VOZ

### VALENTINA IA

Rol:

Asesora Comercial Inteligente.

Características:

- Femenina
- Argentina
- Profesional
- Empática
- Customer Success
- Cercana
- Resolutiva

Uso:

- Comercios
- Emprendedores
- Administración
- Soporte

---

### MATEO IA

Rol:

Asesor Operativo Inteligente.

Características:

- Masculino
- Argentino
- Profesional
- Operativo
- Confiable

Uso:

- Repartidores
- Tracking
- Navegación
- Operaciones

---

## PERSONALIDAD SEGÚN HORARIO

### Mañana
05:00 a 12:00
Más energética.
Más motivadora.

---

### Tarde
12:00 a 19:00
Más productiva.
Más comercial.

---

### Noche
19:00 a 00:00
Más preventiva.
Más operativa.

---

### Madrugada
00:00 a 05:00
Más breve.
Más tranquila.
Más precisa.

---

## CLIMA

Integrar:

- OpenWeather
- WeatherAPI
- AccuWeather

Mostrar:

- Clima actual
- Pronóstico extendido
- Recomendaciones IA
