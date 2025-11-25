// Configuration file for "El Secreto de la Ciudad de los Osos" escape room route
// Contains all 10 stops with their puzzles, coordinates, and rewards

export interface Coords {
  lat: number;
  lng: number;
}

export interface PuzzleConfig {
  type: 'vitral' | 'cryptogram' | 'compass' | 'sequence' | 'mosaic' | 'ar-overlay' | 'decision' | 'exchange';
  solution?: string;
  targetAngle?: number;
  pattern?: string[];
  hint?: string;
  targetMarker?: string;
}

export interface Reward {
  seal: string;
  points: number;
}

export interface Stop {
  id: string;
  name: string;
  coords: Coords;
  puzzle: PuzzleConfig;
  reward: Reward;
  description?: string;
  radius?: number;
}

// The complete route: "El Secreto de la Ciudad de los Osos"
export const stops: Stop[] = [
  {
    id: 'zytglogge',
    name: 'Zytglogge',
    coords: {
      lat: 46.9480,
      lng: 7.4474
    },
    puzzle: {
      type: 'vitral',
      solution: 'TIEMPO',
      hint: 'Las agujas del reloj revelan el patrón correcto para restaurar el vitral del tiempo'
    },
    reward: {
      seal: 'time',
      points: 150
    },
    description: 'Torre del reloj medieval, símbolo de Berna desde 1530',
    radius: 30
  },
  {
    id: 'cathedral-munster',
    name: 'Catedral (Münster)',
    coords: {
      lat: 46.9472,
      lng: 7.4518
    },
    puzzle: {
      type: 'vitral',
      solution: 'LUMINA',
      hint: 'La luz sagrada debe atravesar cada fragmento del vitral en el orden correcto'
    },
    reward: {
      seal: 'light',
      points: 180
    },
    description: 'Catedral gótica con la torre más alta de Suiza',
    radius: 40
  },
  {
    id: 'bundeshaus',
    name: 'Bundeshaus',
    coords: {
      lat: 46.9468,
      lng: 7.4442
    },
    puzzle: {
      type: 'decision',
      solution: 'DEMOCRACIA',
      hint: 'Toma las decisiones correctas que llevaron a la formación de la Confederación Suiza'
    },
    reward: {
      seal: 'consensus',
      points: 200
    },
    description: 'Parlamento Federal Suizo, sede de la democracia helvética',
    radius: 50
  },
  {
    id: 'kafigturm',
    name: 'Käfigturm',
    coords: {
      lat: 46.9475,
      lng: 7.4457
    },
    puzzle: {
      type: 'cryptogram',
      solution: 'JUSTICIA',
      hint: 'Descifra el código secreto usado por los prisioneros de la antigua torre'
    },
    reward: {
      seal: 'justice',
      points: 170
    },
    description: 'Antigua prisión y torre de la ciudad, guardiana de la justicia',
    radius: 25
  },
  {
    id: 'nydeggbrucke',
    name: 'Nydeggbrücke',
    coords: {
      lat: 46.9486,
      lng: 7.4565
    },
    puzzle: {
      type: 'compass',
      targetAngle: 142,
      hint: 'Oriéntate hacia el curso del río Aare para encontrar la dirección correcta'
    },
    reward: {
      seal: 'river',
      points: 160
    },
    description: 'Puente histórico sobre el río Aare, conexión vital de la ciudad',
    radius: 35
  },
  {
    id: 'rosengarten',
    name: 'Rosengarten',
    coords: {
      lat: 46.9506,
      lng: 7.4569
    },
    puzzle: {
      type: 'sequence',
      pattern: ['rojo', 'rosa', 'blanco', 'amarillo', 'rosa', 'rojo'],
      hint: 'Sigue la secuencia de colores de las rosas tal como florecen en primavera'
    },
    reward: {
      seal: 'memory',
      points: 140
    },
    description: 'Jardín de rosas con vista panorámica de la ciudad medieval',
    radius: 45
  },
  {
    id: 'einstein-haus',
    name: 'Einstein-Haus',
    coords: {
      lat: 46.9478,
      lng: 7.4496
    },
    puzzle: {
      type: 'sequence',
      pattern: ['E', 'mc²', 'relatividad', 'luz', 'tiempo'],
      hint: 'Recuerda la secuencia de descubrimientos que Einstein hizo en esta casa'
    },
    reward: {
      seal: 'relativity',
      points: 190
    },
    description: 'Casa donde Einstein desarrolló la teoría de la relatividad',
    radius: 20
  },
  {
    id: 'bundesplatz',
    name: 'Bundesplatz',
    coords: {
      lat: 46.9465,
      lng: 7.4440
    },
    puzzle: {
      type: 'exchange',
      solution: 'COMERCIO',
      hint: 'Intercambia los elementos correctos como se hacía en el antiguo mercado'
    },
    reward: {
      seal: 'trade',
      points: 130
    },
    description: 'Plaza federal, centro político y comercial de Berna',
    radius: 40
  },
  {
    id: 'historical-museum',
    name: 'Museo Histórico',
    coords: {
      lat: 46.9414,
      lng: 7.4496
    },
    puzzle: {
      type: 'ar-overlay',
      targetMarker: 'bern-archive',
      hint: 'Usa la realidad aumentada para revelar los documentos secretos del archivo'
    },
    reward: {
      seal: 'archive',
      points: 220
    },
    description: 'Museo Histórico de Berna, guardián de la memoria colectiva',
    radius: 60
  },
  {
    id: 'barengraben',
    name: 'Bärengraben',
    coords: {
      lat: 46.9495,
      lng: 7.4615
    },
    puzzle: {
      type: 'mosaic',
      pattern: ['time', 'light', 'consensus', 'justice', 'river', 'memory', 'relativity', 'trade', 'archive'],
      hint: 'Ensambla todos los sellos recolectados para formar el mosaico final de la ciudad de los osos'
    },
    reward: {
      seal: 'guardian',
      points: 300
    },
    description: 'Foso de los osos, símbolo histórico y guardián final de Berna',
    radius: 50
  }
];

// Helper functions for working with stops data
export const getStopById = (id: string): Stop | undefined => {
  return stops.find(stop => stop.id === id);
};

export const getStopsByPuzzleType = (puzzleType: PuzzleConfig['type']): Stop[] => {
  return stops.filter(stop => stop.puzzle.type === puzzleType);
};

export const getTotalPossiblePoints = (): number => {
  return stops.reduce((total, stop) => total + stop.reward.points, 0);
};

export const getRouteInfo = () => ({
  name: 'El Secreto de la Ciudad de los Osos',
  description: 'Una aventura de escape room urbano que te llevará por los lugares más emblemáticos de Berna, descubriendo los secretos ocultos de la capital suiza.',
  totalStops: stops.length,
  totalPoints: getTotalPossiblePoints(),
  estimatedDuration: '3-4 horas',
  difficulty: 'Intermedio',
  city: 'Berna, Suiza'
});

// Note: Types are already exported with their interface declarations above