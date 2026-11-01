export type TowerType = 'archer' | 'cannon' | 'ice' | 'poison' | 'tesla' | 'sniper' | 'flamethrower' | 'plasma_pylon' | 'orbital_laser' | 'chrono_disruptor' | 'bio_hive';
export type TowerSpecializationId = 'none' | 'path_a' | 'path_b';

export interface TowerLevelData {
  level: number;
  cost: number;
  damage: number;
  range: number;
  attackCooldown: number;
  splashRadius?: number;
  slowFactor?: number;
  slowDuration?: number;
  chainTargets?: number;
  dotDamage?: number;
  dotDuration?: number;
  critChance?: number;
  description: string;
}

export interface TowerSpecializationDef {
  id: 'path_a' | 'path_b';
  name: string;
  shortName: string;
  cost: number;
  damage: number;
  range: number;
  attackCooldown: number;
  splashRadius?: number;
  slowFactor?: number;
  slowDuration?: number;
  chainTargets?: number;
  dotDamage?: number;
  dotDuration?: number;
  critChance?: number;
  multishotCount?: number;
  stunDuration?: number;
  executeThreshold?: number;
  shieldPiercing?: boolean;
  description: string;
}

export interface TowerDefinition {
  type: TowerType;
  name: string;
  shortName: string;
  icon: string;
  baseCost: number;
  levels: TowerLevelData[];
  specializations: {
    path_a: TowerSpecializationDef;
    path_b: TowerSpecializationDef;
  };
}

export const TOWER_CONFIGS: Record<TowerType, TowerDefinition> = {
  archer: {
    type: 'archer',
    name: 'Bogenschütze',
    shortName: 'Bogen',
    icon: 'icon_archer',
    baseCost: 100,
    levels: [
      {
        level: 1,
        cost: 100,
        damage: 22,
        range: 165,
        attackCooldown: 420,
        description: 'Stufe 1 (Gelb): Schnelle Pfeilsalven (22 Schaden, ~2.4/s).'
      },
      {
        level: 2,
        cost: 140,
        damage: 48,
        range: 195,
        attackCooldown: 360,
        description: 'Stufe 2 (Orange): Verstärkter Kompositbogen (48 Schaden).'
      },
      {
        level: 3,
        cost: 240,
        damage: 105,
        range: 230,
        attackCooldown: 270,
        description: 'Stufe 3 (Rot): Meisterschütze mit Pfeilhagel (105 Schaden, fast 4/s)!'
      }
    ],
    specializations: {
      path_a: {
        id: 'path_a',
        name: 'Waldläufer (Multishot)',
        shortName: 'Waldläufer',
        cost: 320,
        damage: 85,
        range: 240,
        attackCooldown: 260,
        multishotCount: 3,
        description: 'Pfad A: Feuert 3 Pfeile gleichzeitig in gefächerter Streuung auf mehrere Feinde!'
      },
      path_b: {
        id: 'path_b',
        name: 'Scharfschütze (Panzerbrecher)',
        shortName: 'Panzerbrecher',
        cost: 320,
        damage: 210,
        range: 330,
        attackCooldown: 380,
        critChance: 0.55,
        shieldPiercing: true,
        description: 'Pfad B: Durchdringt Schilde direkt und verursacht 55% verheerende Krits!'
      }
    }
  },
  cannon: {
    type: 'cannon',
    name: 'Kanone',
    shortName: 'Kanone',
    icon: 'icon_cannon',
    baseCost: 150,
    levels: [
      {
        level: 1,
        cost: 150,
        damage: 65,
        range: 150,
        attackCooldown: 1400,
        splashRadius: 75,
        description: 'Stufe 1 (Gelb): Schwere Artillerie (65 Flächenschaden).'
      },
      {
        level: 2,
        cost: 180,
        damage: 140,
        range: 175,
        attackCooldown: 1200,
        splashRadius: 95,
        description: 'Stufe 2 (Orange): Belagerungsmörser (140 Flächenschaden).'
      },
      {
        level: 3,
        cost: 290,
        damage: 320,
        range: 205,
        attackCooldown: 1000,
        splashRadius: 125,
        description: 'Stufe 3 (Rot): Titanische Erdbebenkanone (320 Flächenschaden)!'
      }
    ],
    specializations: {
      path_a: {
        id: 'path_a',
        name: 'Mörser-Festung (Napalm)',
        shortName: 'Napalm-Mörser',
        cost: 380,
        damage: 460,
        range: 235,
        attackCooldown: 950,
        splashRadius: 155,
        dotDamage: 40,
        dotDuration: 3000,
        description: 'Pfad A: Gigantischer Explosionsradius und hinterlässt brennende Brandflächen (40 DoT).'
      },
      path_b: {
        id: 'path_b',
        name: 'Erschütterungs-Geschütz (Stun)',
        shortName: 'Schock-Kanone',
        cost: 380,
        damage: 410,
        range: 215,
        attackCooldown: 1050,
        splashRadius: 130,
        stunDuration: 1200,
        description: 'Pfad B: Massive Druckwellen betäuben alle getroffenen Feinde für 1.2 Sekunden!'
      }
    }
  },
  ice: {
    type: 'ice',
    name: 'Eismagier',
    shortName: 'Eis',
    icon: 'icon_ice',
    baseCost: 130,
    levels: [
      {
        level: 1,
        cost: 130,
        damage: 18,
        range: 150,
        attackCooldown: 900,
        splashRadius: 75,
        slowFactor: 0.45,
        slowDuration: 2500,
        description: 'Stufe 1 (Gelb): Gefriert Gruppen (18 Schaden, 45% Slow).'
      },
      {
        level: 2,
        cost: 160,
        damage: 42,
        range: 180,
        attackCooldown: 750,
        splashRadius: 95,
        slowFactor: 0.60,
        slowDuration: 3200,
        description: 'Stufe 2 (Orange): Tiefkristalle mit 60% Frostlähmung (42 Schaden).'
      },
      {
        level: 3,
        cost: 260,
        damage: 95,
        range: 215,
        attackCooldown: 600,
        splashRadius: 125,
        slowFactor: 0.75,
        slowDuration: 4000,
        description: 'Stufe 3 (Rot): Blizzard-Kathedrale: 75% Lähmung und 95 Kälteschaden!'
      }
    ],
    specializations: {
      path_a: {
        id: 'path_a',
        name: 'Blizzard-Gipfel (Permafrost)',
        shortName: 'Blizzard',
        cost: 350,
        damage: 140,
        range: 240,
        attackCooldown: 500,
        splashRadius: 150,
        slowFactor: 0.85,
        slowDuration: 4500,
        description: 'Pfad A: Extreme Verlangsamung um 85% und riesiges Erfrierungsfeld!'
      },
      path_b: {
        id: 'path_b',
        name: 'Gletscher-Lanze (Schockfrost)',
        shortName: 'Frostlanze',
        cost: 350,
        damage: 320,
        range: 270,
        attackCooldown: 650,
        stunDuration: 1500,
        shieldPiercing: true,
        description: 'Pfad B: Schleudert Eislanzen, die Feinde für 1.5s komplett einfrieren und Schilde durchschlagen.'
      }
    }
  },
  poison: {
    type: 'poison',
    name: 'Gift-Alchemist',
    shortName: 'Gift',
    icon: 'icon_poison',
    baseCost: 135,
    levels: [
      {
        level: 1,
        cost: 135,
        damage: 18,
        range: 155,
        attackCooldown: 1000,
        splashRadius: 70,
        dotDamage: 14,
        dotDuration: 3000,
        description: 'Stufe 1 (Gelb): Säurebombe (18 Schaden + 14 DoT).'
      },
      {
        level: 2,
        cost: 170,
        damage: 40,
        range: 185,
        attackCooldown: 850,
        splashRadius: 90,
        dotDamage: 30,
        dotDuration: 3800,
        description: 'Stufe 2 (Orange): Schlangengift schmilzt Rüstung (30 DoT).'
      },
      {
        level: 3,
        cost: 270,
        damage: 90,
        range: 220,
        attackCooldown: 700,
        splashRadius: 115,
        dotDamage: 65,
        dotDuration: 4500,
        description: 'Stufe 3 (Rot): Biozid-Kaskade: 90 Schaden + 65 DoT zersetzt Horden!'
      }
    ],
    specializations: {
      path_a: {
        id: 'path_a',
        name: 'Säure-Vulkan (Schildbrecher)',
        shortName: 'Säurewerfer',
        cost: 360,
        damage: 150,
        range: 235,
        attackCooldown: 620,
        splashRadius: 130,
        dotDamage: 95,
        dotDuration: 4500,
        shieldPiercing: true,
        description: 'Pfad A: Hochkonzentrierte Säure (95 DoT) schmilzt gegnerische Schilde sofort ein!'
      },
      path_b: {
        id: 'path_b',
        name: 'Seuchen-Kessel (Pestilenz)',
        shortName: 'Pestilenz',
        cost: 360,
        damage: 130,
        range: 220,
        attackCooldown: 650,
        splashRadius: 150,
        dotDamage: 85,
        dotDuration: 6000,
        description: 'Pfad B: 6 Sekunden Seuche; infizierte Feinde vergiften bei jedem Schritt den Pfad.'
      }
    }
  },
  tesla: {
    type: 'tesla',
    name: 'Tesla-Spule',
    shortName: 'Tesla',
    icon: 'icon_tesla',
    baseCost: 180,
    levels: [
      {
        level: 1,
        cost: 180,
        damage: 48,
        range: 165,
        attackCooldown: 1100,
        chainTargets: 3,
        description: 'Stufe 1 (Gelb): Kettenblitze auf 3 Feinde (48 Schockschaden).'
      },
      {
        level: 2,
        cost: 210,
        damage: 105,
        range: 195,
        attackCooldown: 950,
        chainTargets: 4,
        description: 'Stufe 2 (Orange): Hochfrequenz-Plasma auf 4 Ziele (105 Schaden).'
      },
      {
        level: 3,
        cost: 320,
        damage: 230,
        range: 225,
        attackCooldown: 800,
        chainTargets: 6,
        description: 'Stufe 3 (Rot): Donnergott-Kondensator: 230 Blitzschaden auf 6 Feinde!'
      }
    ],
    specializations: {
      path_a: {
        id: 'path_a',
        name: 'Blitz-Sturm (Kettenmeister)',
        shortName: 'Kettenblitz-Meister',
        cost: 440,
        damage: 310,
        range: 250,
        attackCooldown: 700,
        chainTargets: 9,
        description: 'Pfad A: Springt auf bis zu 9 Gegner über – vernichtet ganze Monsterwellen!'
      },
      path_b: {
        id: 'path_b',
        name: 'Plasma-Pylon (Schock-Desintegrierer)',
        shortName: 'Plasma-Pylon',
        cost: 440,
        damage: 640,
        range: 240,
        attackCooldown: 650,
        critChance: 0.40,
        shieldPiercing: true,
        description: 'Pfad B: Konzentrierter Hochspannungs-Laser mit 640 Schaden und 40% Krit gegen Bosse.'
      }
    }
  },
  sniper: {
    type: 'sniper',
    name: 'Scharfschütze',
    shortName: 'Sniper',
    icon: 'icon_sniper',
    baseCost: 210,
    levels: [
      {
        level: 1,
        cost: 210,
        damage: 140,
        range: 340,
        attackCooldown: 1900,
        critChance: 0.20,
        description: 'Stufe 1 (Gelb): Große Reichweite, 140 Schaden & 20% Kritisch (308 Dmg).'
      },
      {
        level: 2,
        cost: 240,
        damage: 300,
        range: 400,
        attackCooldown: 1600,
        critChance: 0.35,
        description: 'Stufe 2 (Orange): Panzerbrechendes Wolfram: 300 Schaden & 35% Kritisch.'
      },
      {
        level: 3,
        cost: 370,
        damage: 680,
        range: 480,
        attackCooldown: 1300,
        critChance: 0.50,
        description: 'Stufe 3 (Rot): Orbital-Kaliber: 680 Schaden & 50% Kritisch (über 1500 Dmg)!'
      }
    ],
    specializations: {
      path_a: {
        id: 'path_a',
        name: 'Assassine (Exekution)',
        shortName: 'Assassine',
        cost: 460,
        damage: 850,
        range: 520,
        attackCooldown: 1200,
        critChance: 0.65,
        executeThreshold: 0.25,
        description: 'Pfad A: 850 Schaden, 65% Krit – exekutiert Gegner unter 25% HP sofort!'
      },
      path_b: {
        id: 'path_b',
        name: 'Railgun-Station (Durchschlag)',
        shortName: 'Railgun',
        cost: 460,
        damage: 780,
        range: 500,
        attackCooldown: 1250,
        splashRadius: 80,
        shieldPiercing: true,
        description: 'Pfad B: Überschall-Projektil durchschlägt Schilde und trifft Nebenziele im Strahl.'
      }
    }
  },
  flamethrower: {
    type: 'flamethrower',
    name: 'Hellbat-Flammenwerfer',
    shortName: 'Flamme',
    icon: 'icon_flamethrower',
    baseCost: 140,
    levels: [
      {
        level: 1,
        cost: 140,
        damage: 18,
        range: 140,
        attackCooldown: 180,
        dotDamage: 12,
        dotDuration: 2500,
        splashRadius: 65,
        description: 'Stufe 1 (Gelb): Flammenwerfer mit kontinuierlichem Flächenbrand (12 DoT, 65px Splash).'
      },
      {
        level: 2,
        cost: 200,
        damage: 40,
        range: 160,
        attackCooldown: 160,
        dotDamage: 28,
        dotDuration: 3000,
        splashRadius: 80,
        description: 'Stufe 2 (Orange): Verstärkte Napalmdüsen (40 Dmg, 28 DoT).'
      },
      {
        level: 3,
        cost: 320,
        damage: 90,
        range: 185,
        attackCooldown: 130,
        dotDamage: 65,
        dotDuration: 3500,
        splashRadius: 95,
        description: 'Stufe 3 (Rot): Höllischer Flammensturm (90 Dmg, 65 DoT fast 8/s)!'
      }
    ],
    specializations: {
      path_a: {
        id: 'path_a',
        name: 'Napalm-Kaskade (See aus Feuer)',
        shortName: 'Napalm',
        cost: 420,
        damage: 110,
        range: 195,
        attackCooldown: 120,
        dotDamage: 110,
        dotDuration: 5000,
        splashRadius: 130,
        description: 'Pfad A: Brennende Napalmseen schmelzen Feindwellen mit 110 Feuerschaden/s!'
      },
      path_b: {
        id: 'path_b',
        name: 'Plasma-Flamme (Panzerbrecher)',
        shortName: 'Plasmaflamme',
        cost: 420,
        damage: 220,
        range: 180,
        attackCooldown: 150,
        shieldPiercing: true,
        dotDamage: 80,
        dotDuration: 3000,
        splashRadius: 105,
        description: 'Pfad B: Blaues Plasmafeuer ignoriert Schilde und schmilzt schwere Rüstungen!'
      }
    }
  },
  plasma_pylon: {
    type: 'plasma_pylon',
    name: 'Protoss-Plasmapylone',
    shortName: 'Plasma',
    icon: 'icon_plasma_pylon',
    baseCost: 175,
    levels: [
      {
        level: 1,
        cost: 175,
        damage: 55,
        range: 175,
        attackCooldown: 620,
        splashRadius: 75,
        description: 'Stufe 1 (Gelb): Hochenergetische Plasmabälle mit 55 Schaden und 75px Radius.'
      },
      {
        level: 2,
        cost: 250,
        damage: 125,
        range: 205,
        attackCooldown: 560,
        splashRadius: 95,
        description: 'Stufe 2 (Orange): Fokussierte Plasmagas-Injektion (125 Schaden).'
      },
      {
        level: 3,
        cost: 380,
        damage: 260,
        range: 240,
        attackCooldown: 480,
        splashRadius: 120,
        description: 'Stufe 3 (Rot): Warpfeld-Kondensator (260 Schaden, 120px Splash)!'
      }
    ],
    specializations: {
      path_a: {
        id: 'path_a',
        name: 'Photonen-Überladung (Kettenbogen)',
        shortName: 'Überladung',
        cost: 480,
        damage: 450,
        range: 265,
        attackCooldown: 520,
        splashRadius: 150,
        chainTargets: 4,
        description: 'Pfad A: Gewaltige Plasmaentladung mit 450 Schaden, 150px Splash und 4 Kettenblitzen!'
      },
      path_b: {
        id: 'path_b',
        name: 'Psi-Sturmfeld (Schnellfeuer)',
        shortName: 'Psi-Sturm',
        cost: 480,
        damage: 320,
        range: 250,
        attackCooldown: 320,
        splashRadius: 130,
        shieldPiercing: true,
        description: 'Pfad B: Rasend schneller Psi-Sturm (über 3/s) mit reinem psionischem Schaden!'
      }
    }
  },
  orbital_laser: {
    type: 'orbital_laser',
    name: 'Orbital-Ionenlaser',
    shortName: 'Laser',
    icon: 'icon_orbital_laser',
    baseCost: 220,
    levels: [
      {
        level: 1,
        cost: 220,
        damage: 160,
        range: 260,
        attackCooldown: 900,
        critChance: 0.25,
        description: 'Stufe 1 (Gelb): Ionenstrahl aus dem Orbit (160 Schaden, 25% Krit).'
      },
      {
        level: 2,
        cost: 320,
        damage: 360,
        range: 300,
        attackCooldown: 820,
        critChance: 0.40,
        description: 'Stufe 2 (Orange): Verstärkte Satelliten-Optik (360 Schaden, 40% Krit).'
      },
      {
        level: 3,
        cost: 480,
        damage: 780,
        range: 350,
        attackCooldown: 750,
        critChance: 0.55,
        description: 'Stufe 3 (Rot): Orbitaler Todesstrahl (780 Schaden, 55% Krit)!'
      }
    ],
    specializations: {
      path_a: {
        id: 'path_a',
        name: 'Disintegrator (Exekution)',
        shortName: 'Disintegrator',
        cost: 600,
        damage: 1450,
        range: 390,
        attackCooldown: 800,
        executeThreshold: 0.25,
        critChance: 0.65,
        shieldPiercing: true,
        description: 'Pfad A: Tödlicher Orbitalstrahl (1450 Dmg, 65% Krit). Richtet Feinde unter 25% HP sofort hin!'
      },
      path_b: {
        id: 'path_b',
        name: 'Dreifach-Satellitenfokus',
        shortName: 'Dreifach-Fokus',
        cost: 600,
        damage: 820,
        range: 370,
        attackCooldown: 680,
        multishotCount: 3,
        critChance: 0.45,
        description: 'Pfad B: Drei synchrone Satellitenstrahlen vernichten bis zu 3 Elite-Ziele zeitgleich!'
      }
    }
  },
  chrono_disruptor: {
    type: 'chrono_disruptor',
    name: 'Chrono-Disruptor',
    shortName: 'Chrono',
    icon: 'icon_chrono_disruptor',
    baseCost: 160,
    levels: [
      {
        level: 1,
        cost: 160,
        damage: 25,
        range: 175,
        attackCooldown: 700,
        slowFactor: 0.45,
        slowDuration: 3000,
        splashRadius: 90,
        description: 'Stufe 1 (Gelb): Zeitverzerrungsfeld verlangsamt Feinde um 45% (90px Radius).'
      },
      {
        level: 2,
        cost: 230,
        damage: 55,
        range: 205,
        attackCooldown: 620,
        slowFactor: 0.60,
        slowDuration: 3500,
        splashRadius: 115,
        description: 'Stufe 2 (Orange): Schwere Raumkrümmung (60% Slow, 115px Splash).'
      },
      {
        level: 3,
        cost: 350,
        damage: 120,
        range: 240,
        attackCooldown: 540,
        slowFactor: 0.72,
        slowDuration: 4000,
        splashRadius: 140,
        description: 'Stufe 3 (Rot): Hyperraum-Verzögerer (72% Slow, 140px Splash)!'
      }
    ],
    specializations: {
      path_a: {
        id: 'path_a',
        name: 'Temporaler Stillstand (Freeze)',
        shortName: 'Stasis',
        cost: 460,
        damage: 160,
        range: 260,
        attackCooldown: 600,
        stunDuration: 2200,
        slowFactor: 0.85,
        splashRadius: 165,
        description: 'Pfad A: Friert feindliche Truppen in 165px Radius für 2.2 Sekunden komplett ein!'
      },
      path_b: {
        id: 'path_b',
        name: 'Entropie-Spaltung (Zeitzerfall)',
        shortName: 'Entropie',
        cost: 460,
        damage: 290,
        range: 250,
        attackCooldown: 440,
        slowFactor: 0.75,
        dotDamage: 55,
        dotDuration: 3500,
        splashRadius: 135,
        description: 'Pfad B: Zeitzerfall fügt verlangsamten Feinden kontinuierlich Entropieschaden zu!'
      }
    }
  },
  bio_hive: {
    type: 'bio_hive',
    name: 'Zerg-Bio-Schwarmstock',
    shortName: 'Schwarm',
    icon: 'icon_bio_hive',
    baseCost: 150,
    levels: [
      {
        level: 1,
        cost: 150,
        damage: 32,
        range: 165,
        attackCooldown: 480,
        dotDamage: 18,
        dotDuration: 3000,
        description: 'Stufe 1 (Gelb): Schleudert parasitäre Säuresporen (18 DoT).'
      },
      {
        level: 2,
        cost: 220,
        damage: 72,
        range: 195,
        attackCooldown: 420,
        dotDamage: 42,
        dotDuration: 3500,
        description: 'Stufe 2 (Orange): Mutierte Brutparasiten (72 Dmg, 42 DoT).'
      },
      {
        level: 3,
        cost: 340,
        damage: 155,
        range: 230,
        attackCooldown: 340,
        dotDamage: 90,
        dotDuration: 4000,
        description: 'Stufe 3 (Rot): Schwarmkolloss mit aggressivem Bruthagel!'
      }
    ],
    specializations: {
      path_a: {
        id: 'path_a',
        name: 'Parasiten-Epidemie (Flächen-Sporen)',
        shortName: 'Epidemie',
        cost: 450,
        damage: 210,
        range: 250,
        attackCooldown: 300,
        dotDamage: 140,
        dotDuration: 5000,
        splashRadius: 115,
        description: 'Pfad A: Ätzende Säuresporen explodieren und vergiften Umstehende (140 DoT)!'
      },
      path_b: {
        id: 'path_b',
        name: 'Ätzende Doppelsalve (Panzerfresser)',
        shortName: 'Ätzsalve',
        cost: 450,
        damage: 340,
        range: 240,
        attackCooldown: 360,
        shieldPiercing: true,
        dotDamage: 120,
        dotDuration: 4000,
        multishotCount: 2,
        description: 'Pfad B: Feuert zwei ätzende Säurekolben gleichzeitig ab, die Panzerung & Schilde zersetzen!'
      }
    }
  }
};
