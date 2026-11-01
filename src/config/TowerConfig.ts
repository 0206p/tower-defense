export type TowerType = 'archer' | 'cannon' | 'ice' | 'poison' | 'tesla' | 'sniper';

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

export interface TowerDefinition {
  type: TowerType;
  name: string;
  shortName: string;
  icon: string;
  baseCost: number;
  levels: TowerLevelData[];
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
        damage: 32, // Spürbar stark gegen Welle 1 Monster!
        range: 175,
        attackCooldown: 500,
        description: 'Stufe 1 (Gelb): Schnelle Pfeilsalven (32 Schaden, 2 Schüsse/s).'
      },
      {
        level: 2,
        cost: 120,
        damage: 72,
        range: 210,
        attackCooldown: 400,
        description: 'Stufe 2 (Orange): Verstärkter Kompositbogen (72 Schaden).'
      },
      {
        level: 3,
        cost: 200,
        damage: 155,
        range: 250,
        attackCooldown: 280,
        description: 'Stufe 3 (Rot): Meisterschütze mit Pfeilhagel (155 Schaden, fast 4 Schüsse/s)!'
      }
    ]
  },
  cannon: {
    type: 'cannon',
    name: 'Kanone',
    shortName: 'Kanone',
    icon: 'icon_cannon',
    baseCost: 175,
    levels: [
      {
        level: 1,
        cost: 175,
        damage: 110, // Krachender Flächenschaden!
        range: 155,
        attackCooldown: 1400,
        splashRadius: 80,
        description: 'Stufe 1 (Gelb): Schwere Artillerie (110 Flächenschaden).'
      },
      {
        level: 2,
        cost: 160,
        damage: 240,
        range: 180,
        attackCooldown: 1200,
        splashRadius: 105,
        description: 'Stufe 2 (Orange): Belagerungsmörser (240 Flächenschaden).'
      },
      {
        level: 3,
        cost: 280,
        damage: 490,
        range: 215,
        attackCooldown: 1000,
        splashRadius: 135,
        description: 'Stufe 3 (Rot): Titanische Erdbebenkanone (490 Flächenschaden zermalmt Gruppen)!'
      }
    ]
  },
  ice: {
    type: 'ice',
    name: 'Eismagier',
    shortName: 'Eis',
    icon: 'icon_ice',
    baseCost: 150,
    levels: [
      {
        level: 1,
        cost: 150,
        damage: 28,
        range: 150,
        attackCooldown: 950,
        splashRadius: 70,
        slowFactor: 0.55,
        slowDuration: 2800,
        description: 'Stufe 1 (Gelb): Gefriert Gruppen (28 Schaden, 55% Verlangsamung).'
      },
      {
        level: 2,
        cost: 140,
        damage: 68,
        range: 185,
        attackCooldown: 800,
        splashRadius: 95,
        slowFactor: 0.70,
        slowDuration: 3500,
        description: 'Stufe 2 (Orange): Tiefkristalle mit 70% Frostlähmung.'
      },
      {
        level: 3,
        cost: 250,
        damage: 145,
        range: 225,
        attackCooldown: 650,
        splashRadius: 125,
        slowFactor: 0.85,
        slowDuration: 4400,
        description: 'Stufe 3 (Rot): Blizzard-Kathedrale: 85% Lähmung und 145 Kälteschaden!'
      }
    ]
  },
  poison: {
    type: 'poison',
    name: 'Gift-Alchemist',
    shortName: 'Gift',
    icon: 'icon_poison',
    baseCost: 140,
    levels: [
      {
        level: 1,
        cost: 140,
        damage: 25,
        range: 155,
        attackCooldown: 1050,
        splashRadius: 65,
        dotDamage: 18,
        dotDuration: 3200,
        description: 'Stufe 1 (Gelb): Säurebombe (25 Aufprall + 18 Giftschaden pro Tick).'
      },
      {
        level: 2,
        cost: 130,
        damage: 58,
        range: 185,
        attackCooldown: 900,
        splashRadius: 85,
        dotDamage: 42,
        dotDuration: 4000,
        description: 'Stufe 2 (Orange): Schlangengift schmilzt Rüstung (42 DoT).'
      },
      {
        level: 3,
        cost: 240,
        damage: 125,
        range: 225,
        attackCooldown: 750,
        splashRadius: 115,
        dotDamage: 90,
        dotDuration: 5000,
        description: 'Stufe 3 (Rot): Biozid-Kaskade: 125 Aufprall + 90 Giftschaden zersetzt Horden!'
      }
    ]
  },
  tesla: {
    type: 'tesla',
    name: 'Tesla-Spule',
    shortName: 'Tesla',
    icon: 'icon_tesla',
    baseCost: 200,
    levels: [
      {
        level: 1,
        cost: 200,
        damage: 75,
        range: 165,
        attackCooldown: 1100,
        chainTargets: 3,
        description: 'Stufe 1 (Gelb): Kettenblitze auf 3 Feinde (75 Schockschaden).'
      },
      {
        level: 2,
        cost: 170,
        damage: 160,
        range: 195,
        attackCooldown: 950,
        chainTargets: 5,
        description: 'Stufe 2 (Orange): Hochfrequenz-Plasma auf 5 Ziele (160 Schaden).'
      },
      {
        level: 3,
        cost: 300,
        damage: 330,
        range: 235,
        attackCooldown: 780,
        chainTargets: 7,
        description: 'Stufe 3 (Rot): Donnergott-Kondensator: 330 Blitzschaden auf 7 Feinde!'
      }
    ]
  },
  sniper: {
    type: 'sniper',
    name: 'Scharfschütze',
    shortName: 'Sniper',
    icon: 'icon_sniper',
    baseCost: 220,
    levels: [
      {
        level: 1,
        cost: 220,
        damage: 220,
        range: 350,
        attackCooldown: 2000,
        critChance: 0.25,
        description: 'Stufe 1 (Gelb): Große Reichweite, 220 Schaden & 25% Kritischer Schuss (480 Dmg)!'
      },
      {
        level: 2,
        cost: 190,
        damage: 480,
        range: 420,
        attackCooldown: 1700,
        critChance: 0.40,
        description: 'Stufe 2 (Orange): Panzerbrechendes Wolfram: 480 Schaden & 40% Kritisch.'
      },
      {
        level: 3,
        cost: 340,
        damage: 980,
        range: 520,
        attackCooldown: 1400,
        critChance: 0.55,
        description: 'Stufe 3 (Rot): Orbital-Kaliber: 980 Schaden & 55% Kritisch (über 2100 Schaden)!'
      }
    ]
  }
};
