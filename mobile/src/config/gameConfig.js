// gameConfig.js - Configuración completa del juego ScapeAr Bern

export const stops = [
  {
    id: "stop-1",
    name: "🕐 Zytglogge",
    coordinates: { lat: 46.9489, lng: 7.4470 },
    puzzle: { type: "vitral" },
    seal: "time",
    points: 10,
    description: "Torre del reloj astronómico medieval",
    address: "Kramgasse 49, 3011 Bern",
    difficulty: "Fácil",
    hint: "Busca las manecillas del tiempo"
  },
  {
    id: "stop-2", 
    name: "⛪ Catedral (Münster)",
    coordinates: { lat: 46.9484, lng: 7.4510 },
    puzzle: { type: "vitral" },
    seal: "light",
    points: 12,
    description: "Majestuosa catedral gótica con vistas panorámicas",
    address: "Münsterplatz 1, 3000 Bern",
    difficulty: "Fácil",
    hint: "La luz guía a los fieles"
  },
  {
    id: "stop-3",
    name: "🏛️ Bundeshaus", 
    coordinates: { lat: 46.9470, lng: 7.4446 },
    puzzle: { type: "decision" },
    seal: "consensus",
    points: 15,
    description: "Sede del parlamento suizo",
    address: "Bundesplatz 3, 3005 Bern",
    difficulty: "Medio",
    hint: "Las decisiones se toman en consenso"
  },
  {
    id: "stop-4",
    name: "🗼 Käfigturm",
    coordinates: { lat: 46.9477, lng: 7.4441 },
    puzzle: { type: "cryptogram" },
    seal: "justice",
    points: 14,
    description: "Antigua torre prisión y puerta de la ciudad",
    address: "Marktgasse 67, 3011 Bern", 
    difficulty: "Medio",
    hint: "La justicia tiene muchas caras"
  },
  {
    id: "stop-5",
    name: "🌉 Nydeggbrücke",
    coordinates: { lat: 46.9480, lng: 7.4590 },
    puzzle: { type: "compass", targetAngle: 90 },
    seal: "river",
    points: 16,
    description: "Puente histórico sobre el río Aare",
    address: "Nydeggbrücke, 3011 Bern",
    difficulty: "Difícil"
  },
  {
    id: "stop-6", 
    name: "🎭 Rosengarten",
    coordinates: { lat: 46.9510, lng: 7.4600 },
    puzzle: { type: "sequence", pattern: ["rose", "bear", "tower"] },
    seal: "memory",
    points: 18,
    description: "Jardín de rosas con vista panorámica de la ciudad",
    address: "Alter Aargauerstalden 31b, 3006 Bern",
    difficulty: "Difícil",
    hint: "Las rosas guardan memorias"
  },
  {
    id: "stop-7",
    name: "📚 Einstein-Haus", 
    coordinates: { lat: 46.9486, lng: 7.4515 },
    puzzle: { type: "sequence", pattern: ["E=mc2", "relativity", "light"] },
    seal: "relativity",
    points: 20,
    description: "Casa donde Einstein desarrolló su teoría de la relatividad",
    address: "Kramgasse 49, 3011 Bern",
    difficulty: "Experto",
    hint: "Todo es relativo al observador"
  },
  {
    id: "stop-8",
    name: "🌳 Bundesplatz",
    coordinates: { lat: 46.9475, lng: 7.4449 },
    puzzle: { type: "exchange" },
    seal: "trade",
    points: 15,
    description: "Plaza central con fuentes interactivas",
    address: "Bundesplatz, 3005 Bern", 
    difficulty: "Medio",
    hint: "El comercio une a las naciones"
  },
  {
    id: "stop-9",
    name: "🏛️ Museo Histórico",
    coordinates: { lat: 46.9465, lng: 7.4475 },
    puzzle: { type: "ar-overlay" },
    seal: "archive",
    points: 17,
    description: "Museo de historia con tesoros medievales",
    address: "Helvetiaplatz 5, 3005 Bern",
    difficulty: "Difícil",
    hint: "Los archivos guardan la verdad"
  },
  {
    id: "stop-10",
    name: "🏰 Bärengraben",
    coordinates: { lat: 46.9482, lng: 7.4643 },
    puzzle: { type: "mosaic" },
    seal: "guardian",
    points: 20,
    description: "Parque de los osos, símbolo de Berna",
    address: "Grosser Muristalden 6, 3006 Bern",
    difficulty: "Experto",
    hint: "El oso guarda los secretos de Berna"
  },
];

// 🔹 Función para obtener el siguiente nivel
export function getNextStop(currentId) {
  const index = stops.findIndex((s) => s.id === currentId);
  if (index === -1) return null;
  return stops[index + 1] || null;
}

// 🔹 Función para validar y desbloquear
export function validateStop(currentId, solved) {
  if (!solved) return null; // si no se resolvió, no desbloquea
  return getNextStop(currentId);
}

// 🔹 Función para obtener parada por ID
export function getStopById(id) {
  return stops.find(stop => stop.id === id) || null;
}

// 🔹 Función para obtener paradas desbloqueadas
export function getUnlockedStops(completedStops) {
  const unlockedStops = ['stop-1']; // Primer nivel siempre desbloqueado
  
  completedStops.forEach(stopId => {
    const nextStop = getNextStop(stopId);
    if (nextStop && !unlockedStops.includes(nextStop.id)) {
      unlockedStops.push(nextStop.id);
    }
  });
  
  return unlockedStops;
}

// 🔹 Tipos de puzzle disponibles
export const puzzleTypes = {
  vitral: "Puzzle de Vitral",
  decision: "Decisión Múltiple", 
  cryptogram: "Criptograma",
  compass: "Orientación con Brújula",
  sequence: "Secuencia de Patrones",
  exchange: "Intercambio de Elementos",
  "ar-overlay": "Realidad Aumentada",
  mosaic: "Mosaico Interactivo"
};

// 🔹 Sellos coleccionables
export const seals = {
  time: "⏰ Sello del Tiempo",
  light: "💡 Sello de la Luz", 
  consensus: "🤝 Sello del Consenso",
  justice: "⚖️ Sello de la Justicia",
  river: "🌊 Sello del Río",
  memory: "🧠 Sello de la Memoria",
  relativity: "🔬 Sello de la Relatividad",
  trade: "💰 Sello del Comercio",
  archive: "📜 Sello del Archivo",
  guardian: "🐻 Sello del Guardián"
};