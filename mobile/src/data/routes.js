export const bernRoute = {
  id: 'bern-classic',
  name: 'El Secreto de la Ciudad de los Osos',
  description: 'Descubre el misterioso Manuscrito del Aare recorriendo 10 lugares emblemáticos de Berna.',
  estimatedDuration: '2-3 horas',
  distance: '~3 km',
  difficulty: 'Intermedio',
  stops: [
    {
      id: 'zytglogge',
      name: 'Zytglogge',
      description: 'La famosa torre del reloj astronómico de Berna, construida en el siglo XIII.',
      coordinates: {
        lat: 46.9481,
        lng: 7.4474
      },
      radius: 30, // metros
      puzzle: {
        type: 'Alineación Astronómica AR',
        hint: 'Observa el reloj astronómico y alinea los símbolos según la hora actual.',
        instructions: 'Usa la cámara para escanear el reloj y alinea los símbolos planetarios con la posición actual del sol.',
        solutionSchema: {
          type: 'symbols',
          requiredSymbols: ['sol', 'luna', 'mercurio'],
          timeDependent: true
        },
        assets: {
          arMarker: 'zytglogge_marker.jpg',
          symbols: ['sun.png', 'moon.png', 'mercury.png']
        }
      },
      reward: {
        seal: 'tiempo_seal.png',
        text: 'Has obtenido el Sello del Tiempo. El tiempo es la clave de todos los misterios.',
        points: 100
      }
    },
    {
      id: 'munster',
      name: 'Catedral de Berna (Münster)',
      description: 'La catedral gótica más importante de Suiza, con sus impresionantes vitrales.',
      coordinates: {
        lat: 46.9472,
        lng: 7.4518
      },
      radius: 25,
      puzzle: {
        type: 'Reconstrucción de Vitral',
        hint: 'Reconstruye el vitral sagrado combinando las piezas de colores en el orden correcto.',
        instructions: 'Arrastra las piezas de vitral para formar la imagen completa. Presta atención a los patrones de luz.',
        solutionSchema: {
          type: 'pattern',
          pieces: 9,
          correctOrder: [1, 5, 3, 8, 2, 7, 4, 9, 6]
        },
        assets: {
          pieces: ['piece1.png', 'piece2.png', 'piece3.png', 'piece4.png', 'piece5.png'],
          completedImage: 'vitral_completo.jpg'
        }
      },
      reward: {
        seal: 'luz_seal.png',
        text: 'Has obtenido el Sello de la Luz. La luz divina ilumina el camino hacia la verdad.',
        points: 120
      }
    },
    {
      id: 'bundeshaus',
      name: 'Bundeshaus',
      description: 'El edificio del Parlamento Federal Suizo, símbolo de la democracia.',
      coordinates: {
        lat: 46.9467,
        lng: 7.4436
      },
      radius: 40,
      puzzle: {
        type: 'Dilema de Decisiones',
        hint: 'Ordena los principios democráticos según las pistas grabadas en la plaza.',
        instructions: 'Lee las inscripciones alrededor de la plaza y ordena los principios según su importancia histórica.',
        solutionSchema: {
          type: 'sequence',
          principles: ['Libertad', 'Igualdad', 'Fraternidad', 'Justicia', 'Democracia'],
          correctOrder: [3, 1, 4, 2, 5]
        },
        assets: {
          inscriptions: ['inscripcion1.jpg', 'inscripcion2.jpg'],
          principles: ['libertad.png', 'igualdad.png', 'fraternidad.png']
        }
      },
      reward: {
        seal: 'democracia_seal.png',
        text: 'Has obtenido el Sello de la Democracia. El poder del pueblo es la base de la justicia.',
        points: 110
      }
    },
    {
      id: 'kafigturm',
      name: 'Käfigturm',
      description: 'Antigua torre prisión, ahora símbolo de la libertad y centro político.',
      coordinates: {
        lat: 46.9478,
        lng: 7.4461
      },
      radius: 20,
      puzzle: {
        type: 'Criptograma',
        hint: 'Descifra el mensaje secreto basado en las inscripciones históricas de la torre.',
        instructions: 'Cada símbolo representa una letra. Usa las inscripciones de la torre como clave.',
        solutionSchema: {
          type: 'cipher',
          cipherType: 'substitution',
          solution: 'LIBERTAS',
          alphabet: 'abcdefghijklmnopqrstuvwxyz',
          key: 'kafigturmlibeatsxyzdefghj'
        },
        assets: {
          cipher: 'criptograma_kafig.png',
          inscriptions: ['inscripcion_kafig.jpg']
        }
      },
      reward: {
        seal: 'libertad_seal.png',
        text: 'Has obtenido el Sello de la Libertad. La libertad es el bien más preciado del ser humano.',
        points: 130
      }
    },
    {
      id: 'nydeggbrucke',
      name: 'Nydeggbrücke y Río Aare',
      description: 'Puente histórico sobre el río Aare con vistas espectaculares de la ciudad.',
      coordinates: {
        lat: 46.9495,
        lng: 7.4565
      },
      radius: 35,
      puzzle: {
        type: 'Orientación con Brújula',
        hint: 'Usa la brújula del teléfono para encontrar la dirección del flujo del río y orientarte correctamente.',
        instructions: 'Ponte de cara al río y usa la brújula para determinar la dirección exacta del flujo del agua.',
        solutionSchema: {
          type: 'compass',
          targetDirection: 270, // Oeste
          tolerance: 15 // grados
        },
        assets: {
          compass: 'brujula_digital.png',
          riverMap: 'mapa_aare.jpg'
        }
      },
      reward: {
        seal: 'agua_seal.png',
        text: 'Has obtenido el Sello del Agua. El río fluye hacia el destino, como la vida hacia la verdad.',
        points: 100
      }
    },
    {
      id: 'rosengarten',
      name: 'Rosengarten',
      description: 'Hermoso jardín de rosas con vistas panorámicas de la ciudad vieja.',
      coordinates: {
        lat: 46.9520,
        lng: 7.4563
      },
      radius: 30,
      puzzle: {
        type: 'Secuencia de Colores',
        hint: 'Observa las rosas y encuentra la secuencia de colores que representa las estaciones del año.',
        instructions: 'Toca las rosas en el orden correcto siguiendo el ciclo de las estaciones: primavera, verano, otoño, invierno.',
        solutionSchema: {
          type: 'colorSequence',
          colors: ['rosa_claro', 'rojo', 'amarillo', 'blanco'],
          sequence: [1, 2, 3, 4]
        },
        assets: {
          roses: ['rosa_primavera.jpg', 'rosa_verano.jpg', 'rosa_otono.jpg', 'rosa_invierno.jpg']
        }
      },
      reward: {
        seal: 'naturaleza_seal.png',
        text: 'Has obtenido el Sello de la Naturaleza. La belleza natural es el reflejo del alma pura.',
        points: 90
      }
    },
    {
      id: 'einstein-haus',
      name: 'Einstein-Haus',
      description: 'Casa donde vivió Albert Einstein y desarrolló su teoría de la relatividad.',
      coordinates: {
        lat: 46.9476,
        lng: 7.4513
      },
      radius: 15,
      puzzle: {
        type: 'Sincronización de Relojes',
        hint: 'Ajusta los relojes relativos según la teoría de Einstein para sincronizarlos correctamente.',
        instructions: 'Mueve las manecillas de los relojes para sincronizarlos según los efectos relativistas del tiempo.',
        solutionSchema: {
          type: 'timeSynchronization',
          clocks: 3,
          baseTime: '14:30:00',
          relativistic_effects: [0, -0.5, +1.2] // segundos de desfase
        },
        assets: {
          clocks: ['reloj1.png', 'reloj2.png', 'reloj3.png'],
          equations: ['e_mc2.png']
        }
      },
      reward: {
        seal: 'ciencia_seal.png',
        text: 'Has obtenido el Sello de la Ciencia. El conocimiento es la luz que disipa la ignorancia.',
        points: 140
      }
    },
    {
      id: 'bundesplatz',
      name: 'Mercado en Bundesplatz',
      description: 'Plaza principal donde se celebra el mercado tradicional de Berna.',
      coordinates: {
        lat: 46.9463,
        lng: 7.4440
      },
      radius: 50,
      puzzle: {
        type: 'Intercambio de Productos',
        hint: 'Equilibra el intercambio de productos locales para obtener la combinación correcta.',
        instructions: 'Intercambia productos en el mercado para conseguir la combinación exacta que necesita el comerciante.',
        solutionSchema: {
          type: 'trading',
          products: ['queso', 'pan', 'miel', 'vino'],
          targetCombination: [2, 1, 3, 1], // cantidades necesarias
          availableProducts: [3, 2, 4, 2]
        },
        assets: {
          products: ['queso.png', 'pan.png', 'miel.png', 'vino.png'],
          merchant: 'comerciante.png'
        }
      },
      reward: {
        seal: 'comercio_seal.png',
        text: 'Has obtenido el Sello del Comercio. El intercambio justo es la base de la prosperidad.',
        points: 105
      }
    },
    {
      id: 'museo-historico',
      name: 'Museo Histórico de Berna',
      description: 'Museo que alberga la rica historia de la ciudad y sus tesoros.',
      coordinates: {
        lat: 46.9437,
        lng: 7.4499
      },
      radius: 25,
      puzzle: {
        type: 'Escaneo de Relieve',
        hint: 'Escanea el relieve histórico y reconstruye el sello antiguo que representa la gloria de Berna.',
        instructions: 'Usa la cámara para escanear el relieve y traza el patrón para reconstruir el sello perdido.',
        solutionSchema: {
          type: 'patternTracing',
          pattern: 'bear_seal_pattern',
          tolerance: 0.85 // 85% de precisión requerida
        },
        assets: {
          relief: 'relieve_historico.jpg',
          pattern: 'patron_sello.png',
          tracing_guide: 'guia_trazado.png'
        }
      },
      reward: {
        seal: 'historia_seal.png',
        text: 'Has obtenido el Sello de la Historia. El pasado es la llave que abre el futuro.',
        points: 125
      }
    },
    {
      id: 'barengraben',
      name: 'Bärengraben',
      description: 'El famoso foso de los osos, símbolo de Berna y hogar de sus osos heráldicos.',
      coordinates: {
        lat: 46.9506,
        lng: 7.4587
      },
      radius: 40,
      puzzle: {
        type: 'Ensamble Final AR',
        hint: 'Ensambla los 9 sellos obtenidos en un mosaico de realidad aumentada para revelar el secreto final.',
        instructions: 'Coloca cada sello en su posición correcta del mosaico AR para descubrir la ubicación del Manuscrito del Aare.',
        solutionSchema: {
          type: 'mosaicAssembly',
          seals: 9,
          positions: [
            [1, 1], [1, 2], [1, 3],
            [2, 1], [2, 2], [2, 3],
            [3, 1], [3, 2], [3, 3]
          ],
          correctOrder: [5, 1, 7, 3, 9, 2, 6, 4, 8] // centro primero, luego en espiral
        },
        assets: {
          mosaicTemplate: 'mosaico_template.png',
          finalReveal: 'manuscrito_aare.jpg',
          arOverlay: 'bear_ar_overlay.png'
        }
      },
      reward: {
        seal: 'maestro_seal.png',
        text: '¡Felicidades! Has desvelado el Secreto de la Ciudad de los Osos y encontrado el Manuscrito del Aare.',
        points: 200,
        finalReward: true
      }
    }
  ],
  totalPoints: 1220,
  completionRewards: {
    title: 'Guardián del Secreto de Berna',
    badge: 'guardian_badge.png',
    certificate: 'certificado_completacion.pdf'
  }
};