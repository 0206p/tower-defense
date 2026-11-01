export type TowerType = 'archer' | 'cannon' | 'ice';

export interface TowerLevelData {
  level: number;
  cost: number; // cost to reach or buy
  damage: number;
  range: number; // radius in pixels
  attackCooldown: number; // in milliseconds
  splashRadius?: number; // for cannon or ice AoE
  slowFactor?: number; // e.g. 0.5 = 50% slow
  slowDuration?: number; // ms
  description: string;
}

export interface TowerDefinition {
  type: TowerType;
  name: string;
  icon: string;
  baseCost: number;
  levels: TowerLevelData[];
}

export const TOWER_CONFIGS: Record<TowerType, TowerDefinition> = {
  archer: {
    type: 'archer',
    name: 'Bogenschütze',
    icon: 'icon_archer',
    baseCost: 100,
    levels: [
      {
        level: 1,
        cost: 100,
        damage: 16,
        range: 155,
        attackCooldown: 650,
        description: 'Schnelle Pfeile gegen einzelne Feinde.'
      },
      {
        level: 2,
        cost: 80,
        damage: 28,
        range: 180,
        attackCooldown: 550,
        description: 'Langbogen mit höherer Reichweite und Durchschlag.'
      },
      {
        level: 3,
        cost: 140,
        damage: 48,
        range: 210,
        attackCooldown: 420,
        description: 'Meisterschütze mit tödlicher Präzision.'
      }
    ]
  },
  cannon: {
    type: 'cannon',
    name: 'Kanone',
    icon: 'icon_cannon',
    baseCost: 175,
    levels: [
      {
        level: 1,
        cost: 175,
        damage: 55,
        range: 135,
        attackCooldown: 1600,
        splashRadius: 65,
        description: 'Schwere Artillerie mit mächtigem Flächenschaden.'
      },
      {
        level: 2,
        cost: 130,
        damage: 95,
        range: 155,
        attackCooldown: 1450,
        splashRadius: 80,
        description: 'Verstärkte Munition mit vergrößertem Explosionsradius.'
      },
      {
        level: 3,
        cost: 210,
        damage: 165,
        range: 175,
        attackCooldown: 1300,
        splashRadius: 100,
        description: 'Belagerungs-Mörser mit vernichtender Feuerkraft.'
      }
    ]
  },
  ice: {
    type: 'ice',
    name: 'Eismagier',
    icon: 'icon_ice',
    baseCost: 150,
    levels: [
      {
        level: 1,
        cost: 150,
        damage: 12,
        range: 130,
        attackCooldown: 1100,
        splashRadius: 50,
        slowFactor: 0.5,
        slowDuration: 2400,
        description: 'Friert Gruppen ein und halbiert ihr Lauftempo.'
      },
      {
        level: 2,
        cost: 110,
        damage: 22,
        range: 150,
        attackCooldown: 950,
        splashRadius: 65,
        slowFactor: 0.6,
        slowDuration: 3000,
        description: 'Tiefkristalle mit stärkerer Frostwirkung.'
      },
      {
        level: 3,
        cost: 180,
        damage: 38,
        range: 175,
        attackCooldown: 800,
        splashRadius: 85,
        slowFactor: 0.72,
        slowDuration: 3600,
        description: 'Blizzard-Zauber mit maximalem Verlangsamungseffekt.'
      }
    ]
  }
};

