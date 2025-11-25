import { pool } from '../models/database.js';
import dotenv from 'dotenv';

dotenv.config();

// Bern Classic route data
const bernRoute = {
  id: 'bern-classic',
  name: 'El Secreto de la Ciudad de los Osos',
  description: 'Descubre el misterioso Manuscrito del Aare recorriendo 10 lugares emblemáticos de Berna.',
  estimated_duration: '2-3 horas',
  distance: '~3 km',
  difficulty: 'Intermedio',
  total_points: 1220
};

const bernStops = [
  {
    id: 'zytglogge',
    route_id: 'bern-classic',
    name: 'Zytglogge',
    description: 'La famosa torre del reloj astronómico de Berna, construida en el siglo XIII.',
    latitude: 46.9481,
    longitude: 7.4474,
    radius: 30,
    puzzle_type: 'Alineación Astronómica AR',
    puzzle_data: {
      hint: 'Observa el reloj astronómico y alinea los símbolos según la hora actual.',
      instructions: 'Usa la cámara para escanear el reloj y alinea los símbolos planetarios con la posición actual del sol.',
      type: 'symbols',
      solutionSchema: {
        requiredSymbols: ['sol', 'luna', 'mercurio'],
        timeDependent: true
      }
    },
    reward_data: {
      seal: 'tiempo_seal.png',
      text: 'Has obtenido el Sello del Tiempo. El tiempo es la clave de todos los misterios.',
      points: 100
    },
    stop_order: 1
  },
  {
    id: 'munster',
    route_id: 'bern-classic',
    name: 'Catedral de Berna (Münster)',
    description: 'La catedral gótica más importante de Suiza, con sus impresionantes vitrales.',
    latitude: 46.9472,
    longitude: 7.4518,
    radius: 25,
    puzzle_type: 'Reconstrucción de Vitral',
    puzzle_data: {
      hint: 'Reconstruye el vitral sagrado combinando las piezas de colores en el orden correcto.',
      instructions: 'Arrastra las piezas de vitral para formar la imagen completa. Presta atención a los patrones de luz.',
      type: 'pattern',
      solutionSchema: {
        pieces: 9,
        correctOrder: [1, 5, 3, 8, 2, 7, 4, 9, 6]
      }
    },
    reward_data: {
      seal: 'luz_seal.png',
      text: 'Has obtenido el Sello de la Luz. La luz divina ilumina el camino hacia la verdad.',
      points: 120
    },
    stop_order: 2
  },
  {
    id: 'bundeshaus',
    route_id: 'bern-classic',
    name: 'Bundeshaus',
    description: 'El edificio del Parlamento Federal Suizo, símbolo de la democracia.',
    latitude: 46.9467,
    longitude: 7.4436,
    radius: 40,
    puzzle_type: 'Dilema de Decisiones',
    puzzle_data: {
      hint: 'Ordena los principios democráticos según las pistas grabadas en la plaza.',
      instructions: 'Lee las inscripciones alrededor de la plaza y ordena los principios según su importancia histórica.',
      type: 'sequence',
      solutionSchema: {
        principles: ['Libertad', 'Igualdad', 'Fraternidad', 'Justicia', 'Democracia'],
        correctOrder: [3, 1, 4, 2, 5]
      }
    },
    reward_data: {
      seal: 'democracia_seal.png',
      text: 'Has obtenido el Sello de la Democracia. El poder del pueblo es la base de la justicia.',
      points: 110
    },
    stop_order: 3
  },
  {
    id: 'kafigturm',
    route_id: 'bern-classic',
    name: 'Käfigturm',
    description: 'Antigua torre prisión, ahora símbolo de la libertad y centro político.',
    latitude: 46.9478,
    longitude: 7.4461,
    radius: 20,
    puzzle_type: 'Criptograma',
    puzzle_data: {
      hint: 'Descifra el mensaje secreto basado en las inscripciones históricas de la torre.',
      instructions: 'Cada símbolo representa una letra. Usa las inscripciones de la torre como clave.',
      type: 'cipher',
      solutionSchema: {
        cipherType: 'substitution',
        solution: 'LIBERTAS'
      }
    },
    reward_data: {
      seal: 'libertad_seal.png',
      text: 'Has obtenido el Sello de la Libertad. La libertad es el bien más preciado del ser humano.',
      points: 130
    },
    stop_order: 4
  },
  {
    id: 'nydeggbrucke',
    route_id: 'bern-classic',
    name: 'Nydeggbrücke y Río Aare',
    description: 'Puente histórico sobre el río Aare con vistas espectaculares de la ciudad.',
    latitude: 46.9495,
    longitude: 7.4565,
    radius: 35,
    puzzle_type: 'Orientación con Brújula',
    puzzle_data: {
      hint: 'Usa la brújula del teléfono para encontrar la dirección del flujo del río y orientarte correctamente.',
      instructions: 'Ponte de cara al río y usa la brújula para determinar la dirección exacta del flujo del agua.',
      type: 'compass',
      solutionSchema: {
        targetDirection: 270,
        tolerance: 15
      }
    },
    reward_data: {
      seal: 'agua_seal.png',
      text: 'Has obtenido el Sello del Agua. El río fluye hacia el destino, como la vida hacia la verdad.',
      points: 100
    },
    stop_order: 5
  },
  {
    id: 'rosengarten',
    route_id: 'bern-classic',
    name: 'Rosengarten',
    description: 'Hermoso jardín de rosas con vistas panorámicas de la ciudad vieja.',
    latitude: 46.9520,
    longitude: 7.4563,
    radius: 30,
    puzzle_type: 'Secuencia de Colores',
    puzzle_data: {
      hint: 'Observa las rosas y encuentra la secuencia de colores que representa las estaciones del año.',
      instructions: 'Toca las rosas en el orden correcto siguiendo el ciclo de las estaciones: primavera, verano, otoño, invierno.',
      type: 'colorSequence',
      solutionSchema: {
        colors: ['rosa_claro', 'rojo', 'amarillo', 'blanco'],
        sequence: [1, 2, 3, 4]
      }
    },
    reward_data: {
      seal: 'naturaleza_seal.png',
      text: 'Has obtenido el Sello de la Naturaleza. La belleza natural es el reflejo del alma pura.',
      points: 90
    },
    stop_order: 6
  },
  {
    id: 'einstein-haus',
    route_id: 'bern-classic',
    name: 'Einstein-Haus',
    description: 'Casa donde vivió Albert Einstein y desarrolló su teoría de la relatividad.',
    latitude: 46.9476,
    longitude: 7.4513,
    radius: 15,
    puzzle_type: 'Sincronización de Relojes',
    puzzle_data: {
      hint: 'Ajusta los relojes relativos según la teoría de Einstein para sincronizarlos correctamente.',
      instructions: 'Mueve las manecillas de los relojes para sincronizarlos según los efectos relativistas del tiempo.',
      type: 'timeSynchronization',
      solutionSchema: {
        clocks: 3,
        baseTime: '14:30:00'
      }
    },
    reward_data: {
      seal: 'ciencia_seal.png',
      text: 'Has obtenido el Sello de la Ciencia. El conocimiento es la luz que disipa la ignorancia.',
      points: 140
    },
    stop_order: 7
  },
  {
    id: 'bundesplatz',
    route_id: 'bern-classic',
    name: 'Mercado en Bundesplatz',
    description: 'Plaza principal donde se celebra el mercado tradicional de Berna.',
    latitude: 46.9463,
    longitude: 7.4440,
    radius: 50,
    puzzle_type: 'Intercambio de Productos',
    puzzle_data: {
      hint: 'Equilibra el intercambio de productos locales para obtener la combinación correcta.',
      instructions: 'Intercambia productos en el mercado para conseguir la combinación exacta que necesita el comerciante.',
      type: 'trading',
      solutionSchema: {
        products: ['queso', 'pan', 'miel', 'vino'],
        targetCombination: [2, 1, 3, 1]
      }
    },
    reward_data: {
      seal: 'comercio_seal.png',
      text: 'Has obtenido el Sello del Comercio. El intercambio justo es la base de la prosperidad.',
      points: 105
    },
    stop_order: 8
  },
  {
    id: 'museo-historico',
    route_id: 'bern-classic',
    name: 'Museo Histórico de Berna',
    description: 'Museo que alberga la rica historia de la ciudad y sus tesoros.',
    latitude: 46.9437,
    longitude: 7.4499,
    radius: 25,
    puzzle_type: 'Escaneo de Relieve',
    puzzle_data: {
      hint: 'Escanea el relieve histórico y reconstruye el sello antiguo que representa la gloria de Berna.',
      instructions: 'Usa la cámara para escanear el relieve y traza el patrón para reconstruir el sello perdido.',
      type: 'patternTracing',
      solutionSchema: {
        pattern: 'bear_seal_pattern',
        tolerance: 0.85
      }
    },
    reward_data: {
      seal: 'historia_seal.png',
      text: 'Has obtenido el Sello de la Historia. El pasado es la llave que abre el futuro.',
      points: 125
    },
    stop_order: 9
  },
  {
    id: 'barengraben',
    route_id: 'bern-classic',
    name: 'Bärengraben',
    description: 'El famoso foso de los osos, símbolo de Berna y hogar de sus osos heráldicos.',
    latitude: 46.9506,
    longitude: 7.4587,
    radius: 40,
    puzzle_type: 'Ensamble Final AR',
    puzzle_data: {
      hint: 'Ensambla los 9 sellos obtenidos en un mosaico de realidad aumentada para revelar el secreto final.',
      instructions: 'Coloca cada sello en su posición correcta del mosaico AR para descubrir la ubicación del Manuscrito del Aare.',
      type: 'mosaicAssembly',
      solutionSchema: {
        seals: 9,
        correctOrder: [5, 1, 7, 3, 9, 2, 6, 4, 8]
      }
    },
    reward_data: {
      seal: 'maestro_seal.png',
      text: '¡Felicidades! Has desvelado el Secreto de la Ciudad de los Osos y encontrado el Manuscrito del Aare.',
      points: 200,
      finalReward: true
    },
    stop_order: 10
  }
];

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database seeding...');
    
    await client.query('BEGIN');
    
    // Insert route
    console.log('Inserting route...');
    await client.query(`
      INSERT INTO routes (id, name, description, estimated_duration, distance, difficulty, total_points, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        estimated_duration = EXCLUDED.estimated_duration,
        distance = EXCLUDED.distance,
        difficulty = EXCLUDED.difficulty,
        total_points = EXCLUDED.total_points,
        is_active = EXCLUDED.is_active
    `, [
      bernRoute.id,
      bernRoute.name,
      bernRoute.description,
      bernRoute.estimated_duration,
      bernRoute.distance,
      bernRoute.difficulty,
      bernRoute.total_points,
      true
    ]);
    
    // Insert stops
    console.log('Inserting stops...');
    for (const stop of bernStops) {
      await client.query(`
        INSERT INTO stops (
          id, route_id, name, description, latitude, longitude, radius,
          puzzle_type, puzzle_data, reward_data, stop_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          route_id = EXCLUDED.route_id,
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          radius = EXCLUDED.radius,
          puzzle_type = EXCLUDED.puzzle_type,
          puzzle_data = EXCLUDED.puzzle_data,
          reward_data = EXCLUDED.reward_data,
          stop_order = EXCLUDED.stop_order
      `, [
        stop.id,
        stop.route_id,
        stop.name,
        stop.description,
        stop.latitude,
        stop.longitude,
        stop.radius,
        stop.puzzle_type,
        JSON.stringify(stop.puzzle_data),
        JSON.stringify(stop.reward_data),
        stop.stop_order
      ]);
    }
    
    await client.query('COMMIT');
    console.log('✅ Database seeded successfully!');
    console.log(`Inserted route: ${bernRoute.name}`);
    console.log(`Inserted ${bernStops.length} stops`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };