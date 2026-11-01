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
        damage: 46, // 1-Shot gegen Fledermäuse, 1-2 Shots gegen Goblins!
        range: 185,
        attackCooldown: 480,
        description: 'Stufe 1 (Gelb): Schnelle Pfeilsalven (46 Schaden, 2+ Schüsse/s).'
      },
      {
        level: 2,
        cost: 120,
        damage: 110,
        range: 220,
        attackCooldown: 380,
        description: 'Stufe 2 (Orange): Verstärkter Kompositbogen (110 Schaden).'
      },
      {
        level: 3,
        cost: 200,
        damage: 240,
        range: 260,
        attackCooldown: 260,
        description: 'Stufe 3 (Rot): Meisterschütze mit Pfeilhagel (240 Schaden, fast 4 Schüsse/s)!'
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
        damage: 135, // Krachender Flächenschaden!
        range: 160,
        attackCooldown: 1300,
        splashRadius: 90,
        description: 'Stufe 1 (Gelb): Schwere Artillerie (135 Flächenschaden).'
      },
      {
        level: 2,
        cost: 160,
        damage: 280,
        range: 190,
        attackCooldown: 1100,
        splashRadius: 115,
        description: 'Stufe 2 (Orange): Belagerungsmörser (280 Flächenschaden).'
      },
      {
        level: 3,
        cost: 280,
        damage: 550,
        range: 225,
        attackCooldown: 900,
        splashRadius: 145,
        description: 'Stufe 3 (Rot): Titanische Erdbebenkanone (550 Flächenschaden zermalmt Gruppen)!'
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
        damage: 40,
        range: 160,
        attackCooldown: 900,
        splashRadius: 80,
        slowFactor: 0.55,
        slowDuration: 2800,
        description: 'Stufe 1 (Gelb): Gefriert Gruppen (40 Schaden, 55% Verlangsamung).'
      },
      {
        level: 2,
        cost: 140,
        damage: 90,
        range: 195,
        attackCooldown: 750,
        splashRadius: 105,
        slowFactor: 0.70,
        slowDuration: 3500,
        description: 'Stufe 2 (Orange): Tiefkristalle mit 70% Frostlähmung (90 Schaden).'
      },
      {
        level: 3,
        cost: 250,
        damage: 180,
        range: 235,
        attackCooldown: 600,
        splashRadius: 135,
        slowFactor: 0.85,
        slowDuration: 4400,
        description: 'Stufe 3 (Rot): Blizzard-Kathedrale: 85% Lähmung und 180 Kälteschaden!'
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
        damage: 35,
        range: 165,
        attackCooldown: 1000,
        splashRadius: 75,
        dotDamage: 25,
        dotDuration: 3200,
        description: 'Stufe 1 (Gelb): Säurebombe (35 Aufprall + 25 Giftschaden pro Tick).'
      },
      {
        level: 2,
        cost: 130,
        damage: 75,
        range: 195,
        attackCooldown: 850,
        splashRadius: 95,
        dotDamage: 50,
        dotDuration: 4000,
        description: 'Stufe 2 (Orange): Schlangengift schmilzt Rüstung (50 DoT).'
      },
      {
        level: 3,
        cost: 240,
        damage: 160,
        range: 235,
        attackCooldown: 700,
        splashRadius: 125,
        dotDamage: 110,
        dotDuration: 5000,
        description: 'Stufe 3 (Rot): Biozid-Kaskade: 160 Aufprall + 110 Giftschaden zersetzt Horden!'
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
        damage: 95,
        range: 175,
        attackCooldown: 1050,
        chainTargets: 3,
        description: 'Stufe 1 (Gelb): Kettenblitze auf 3 Feinde (95 Schockschaden).'
      },
      {
        level: 2,
        cost: 170,
        damage: 200,
        range: 205,
        attackCooldown: 900,
        chainTargets: 5,
        description: 'Stufe 2 (Orange): Hochfrequenz-Plasma auf 5 Ziele (200 Schaden).'
      },
      {
        level: 3,
        cost: 300,
        damage: 420,
        range: 235,
        attackCooldown: 780,
        chainTargets: 7,
        description: 'Stufe 3 (Rot): Donnergott-Kondensator: 420 Blitzschaden auf 7 Feinde!'
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
        damage: 280,
        range: 350,
        attackCooldown: 1800,
        critChance: 0.25,
        description: 'Stufe 1 (Gelb): Große Reichweite, 280 Schaden & 25% Kritischer Schuss (616 Dmg)!'
      },
      {
        level: 2,
        cost: 190,
        damage: 560,
        range: 420,
        attackCooldown: 1500,
        critChance: 0.40,
        description: 'Stufe 2 (Orange): Panzerbrechendes Wolfram: 560 Schaden & 40% Kritisch.'
      },
      {
        level: 3,
        cost: 340,
        damage: 1150,
        range: 520,
        attackCooldown: 1250,
        critChance: 0.55,
        description: 'Stufe 3 (Rot): Orbital-Kaliber: 1150 Schaden & 55% Kritisch (über 2500 Schaden)!'
      }
    ]
  }
};
