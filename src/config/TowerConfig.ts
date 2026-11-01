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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  }
};
