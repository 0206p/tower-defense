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
  levels: TowerLevelData[]; // 3 Ausbaustufen!
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
        damage: 18,
        range: 165,
        attackCooldown: 600,
        description: 'Stufe 1 (Gelb): Schnelle Pfeilsalven auf einzelne Feinde.'
      },
      {
        level: 2,
        cost: 110,
        damage: 38,
        range: 195,
        attackCooldown: 480,
        description: 'Stufe 2 (Orange): Verstärkter Kompositbogen mit höherer Reichweite.'
      },
      {
        level: 3,
        cost: 180,
        damage: 75,
        range: 235,
        attackCooldown: 340,
        description: 'Stufe 3 (Rot): Meisterschütze mit verheerendem Pfeilhagel!'
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
        damage: 60,
        range: 140,
        attackCooldown: 1600,
        splashRadius: 70,
        description: 'Stufe 1 (Gelb): Schwere Artillerie mit Flächenschaden.'
      },
      {
        level: 2,
        cost: 150,
        damage: 130,
        range: 165,
        attackCooldown: 1350,
        splashRadius: 90,
        description: 'Stufe 2 (Orange): Bronzemörser mit vergrößertem Splitterradius.'
      },
      {
        level: 3,
        cost: 260,
        damage: 260,
        range: 195,
        attackCooldown: 1100,
        splashRadius: 120,
        description: 'Stufe 3 (Rot): Titanische Belagerungshaubitze mit Schockwellen!'
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
        damage: 15,
        range: 140,
        attackCooldown: 1100,
        splashRadius: 60,
        slowFactor: 0.50,
        slowDuration: 2500,
        description: 'Stufe 1 (Gelb): Gefriert Feinde und halbiert ihr Lauftempo.'
      },
      {
        level: 2,
        cost: 130,
        damage: 35,
        range: 170,
        attackCooldown: 900,
        splashRadius: 85,
        slowFactor: 0.65,
        slowDuration: 3200,
        description: 'Stufe 2 (Orange): Tiefkristalle mit 65% Frostlähmung.'
      },
      {
        level: 3,
        cost: 230,
        damage: 75,
        range: 210,
        attackCooldown: 720,
        splashRadius: 115,
        slowFactor: 0.80,
        slowDuration: 4000,
        description: 'Stufe 3 (Rot): Blizzard-Zitadelle: Feinde frieren nahezu ein (80% Slow)!'
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
        damage: 12,
        range: 145,
        attackCooldown: 1200,
        splashRadius: 55,
        dotDamage: 10,
        dotDuration: 3000,
        description: 'Stufe 1 (Gelb): Schleudert Säurekolben mit Giftschaden über Zeit.'
      },
      {
        level: 2,
        cost: 120,
        damage: 28,
        range: 175,
        attackCooldown: 1000,
        splashRadius: 75,
        dotDamage: 24,
        dotDuration: 3800,
        description: 'Stufe 2 (Orange): Konzentriertes Gift zersetzt Panzerung.'
      },
      {
        level: 3,
        cost: 220,
        damage: 60,
        range: 215,
        attackCooldown: 800,
        splashRadius: 105,
        dotDamage: 55,
        dotDuration: 4800,
        description: 'Stufe 3 (Rot): Biozid-Reaktor: Ätzende Seuchenwelle schmilzt Feindesmassen!'
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
        damage: 40,
        range: 155,
        attackCooldown: 1250,
        chainTargets: 3,
        description: 'Stufe 1 (Gelb): Entlädt Blitze auf 3 nahe Feinde.'
      },
      {
        level: 2,
        cost: 160,
        damage: 85,
        range: 185,
        attackCooldown: 1050,
        chainTargets: 5,
        description: 'Stufe 2 (Orange): Resonanz-Plasma springt auf 5 Ziele.'
      },
      {
        level: 3,
        cost: 280,
        damage: 175,
        range: 225,
        attackCooldown: 850,
        chainTargets: 7,
        description: 'Stufe 3 (Rot): Donnergott-Kondensator: 7 Kettenblitze mit Schock-Schaden!'
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
        damage: 120,
        range: 320,
        attackCooldown: 2300,
        critChance: 0.20,
        description: 'Stufe 1 (Gelb): Große Reichweite, panzerbrechend & 20% Kritisch.'
      },
      {
        level: 2,
        cost: 180,
        damage: 260,
        range: 390,
        attackCooldown: 1950,
        critChance: 0.35,
        description: 'Stufe 2 (Orange): Wolfram-Kaliber mit 35% kritischer Chance.'
      },
      {
        level: 3,
        cost: 320,
        damage: 550,
        range: 480,
        attackCooldown: 1600,
        critChance: 0.50,
        description: 'Stufe 3 (Rot): Orbital-Scharfschütze mit 50% kritischer Trefferchance (Doppelschaden)!'
      }
    ]
  }
};
