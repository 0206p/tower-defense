export type TowerType = 'archer' | 'cannon' | 'ice' | 'poison' | 'tesla' | 'sniper';

export interface TowerLevelData {
  level: number;
  cost: number; // Kosten zum Erreichen / Bauen
  damage: number;
  range: number;
  attackCooldown: number; // in Millisekunden
  splashRadius?: number;
  slowFactor?: number;
  slowDuration?: number;
  chainTargets?: number; // für Tesla
  dotDamage?: number;    // für Gift
  dotDuration?: number;  // für Gift
  critChance?: number;   // für Sniper
  description: string;
}

export interface TowerDefinition {
  type: TowerType;
  name: string;
  shortName: string;
  icon: string;
  baseCost: number;
  levels: TowerLevelData[]; // 5 Stufen!
}

export const TOWER_CONFIGS: Record<TowerType, TowerDefinition> = {
  archer: {
    type: 'archer',
    name: 'Bogenschütze',
    shortName: 'Bogen',
    icon: 'icon_archer',
    baseCost: 100,
    levels: [
      { level: 1, cost: 100, damage: 16, range: 160, attackCooldown: 620, description: 'Schnelle Pfeilsalven auf einzelne Feinde.' },
      { level: 2, cost: 80, damage: 28, range: 185, attackCooldown: 540, description: 'Langbogen mit verstärkter Durchschlagskraft.' },
      { level: 3, cost: 140, damage: 48, range: 215, attackCooldown: 440, description: 'Meisterschütze mit schneller Kadenz.' },
      { level: 4, cost: 220, damage: 78, range: 245, attackCooldown: 360, description: 'Scharfaugen-Elite mit Falkenaugen.' },
      { level: 5, cost: 350, damage: 130, range: 280, attackCooldown: 280, description: 'Mythischer Waldläufer: Pfeilhagel der Verdammnis.' }
    ]
  },
  cannon: {
    type: 'cannon',
    name: 'Kanone',
    shortName: 'Kanone',
    icon: 'icon_cannon',
    baseCost: 175,
    levels: [
      { level: 1, cost: 175, damage: 55, range: 140, attackCooldown: 1600, splashRadius: 65, description: 'Schwere Artillerie mit Explosionsschaden.' },
      { level: 2, cost: 130, damage: 95, range: 160, attackCooldown: 1450, splashRadius: 80, description: 'Bronzemörser mit vergrößertem Splitterradius.' },
      { level: 3, cost: 210, damage: 165, range: 180, attackCooldown: 1300, splashRadius: 100, description: 'Belagerungs-Mörser mit gewaltiger Wucht.' },
      { level: 4, cost: 320, damage: 270, range: 200, attackCooldown: 1150, splashRadius: 120, description: 'Obsidian-Haubitze mit Schockwellen.' },
      { level: 5, cost: 480, damage: 450, range: 230, attackCooldown: 980, splashRadius: 145, description: 'Titanische Erdbebenkanone: Zermalmt alles.' }
    ]
  },
  ice: {
    type: 'ice',
    name: 'Eismagier',
    shortName: 'Eis',
    icon: 'icon_ice',
    baseCost: 150,
    levels: [
      { level: 1, cost: 150, damage: 12, range: 135, attackCooldown: 1100, splashRadius: 55, slowFactor: 0.50, slowDuration: 2400, description: 'Gefriert Feinde und halbiert ihr Lauftempo.' },
      { level: 2, cost: 110, damage: 22, range: 155, attackCooldown: 960, splashRadius: 70, slowFactor: 0.60, slowDuration: 2800, description: 'Tiefkristalle mit stärkerer Frostwirkung.' },
      { level: 3, cost: 180, damage: 40, range: 180, attackCooldown: 820, splashRadius: 90, slowFactor: 0.70, slowDuration: 3200, description: 'Blizzard-Zauber mit dichtem Eissturm.' },
      { level: 4, cost: 260, damage: 68, range: 205, attackCooldown: 700, splashRadius: 110, slowFactor: 0.78, slowDuration: 3800, description: 'Gletscher-Kathedrale mit Permafrost.' },
      { level: 5, cost: 400, damage: 115, range: 235, attackCooldown: 580, splashRadius: 135, slowFactor: 0.85, slowDuration: 4500, description: 'Absolute Null-Zitadelle: Lähmender Eiskern.' }
    ]
  },
  poison: {
    type: 'poison',
    name: 'Gift-Alchemist',
    shortName: 'Gift',
    icon: 'icon_poison',
    baseCost: 140,
    levels: [
      { level: 1, cost: 140, damage: 10, range: 145, attackCooldown: 1200, splashRadius: 50, dotDamage: 8, dotDuration: 3000, description: 'Schleudert Säurekolben mit verheerendem Giftschaden über Zeit.' },
      { level: 2, cost: 100, damage: 18, range: 165, attackCooldown: 1050, splashRadius: 65, dotDamage: 16, dotDuration: 3500, description: 'Konzentriertes Schlangengift zersetzt Rüstung.' },
      { level: 3, cost: 160, damage: 32, range: 190, attackCooldown: 920, splashRadius: 80, dotDamage: 30, dotDuration: 4000, description: 'Toxischer Nebel: Erstickt ganze Gruppen.' },
      { level: 4, cost: 240, damage: 55, range: 215, attackCooldown: 800, splashRadius: 100, dotDamage: 52, dotDuration: 4500, description: 'Ätzende Schwefelsäure mit Kettenkontamination.' },
      { level: 5, cost: 380, damage: 95, range: 245, attackCooldown: 680, splashRadius: 125, dotDamage: 90, dotDuration: 5500, description: 'Biozid-Reaktor: Unheilbare Seuchen-Kaskade.' }
    ]
  },
  tesla: {
    type: 'tesla',
    name: 'Tesla-Spule',
    shortName: 'Tesla',
    icon: 'icon_tesla',
    baseCost: 200,
    levels: [
      { level: 1, cost: 200, damage: 35, range: 150, attackCooldown: 1300, chainTargets: 3, description: 'Entlädt Hochspannungsblitze auf 3 nahe Feinde.' },
      { level: 2, cost: 150, damage: 58, range: 170, attackCooldown: 1150, chainTargets: 4, description: 'Verstärkte Resonanzspule für 4 Blitzketten.' },
      { level: 3, cost: 230, damage: 95, range: 195, attackCooldown: 1000, chainTargets: 5, description: 'Plasma-Kondensator mit Hochfrequenz-Lichtbögen.' },
      { level: 4, cost: 340, damage: 155, range: 220, attackCooldown: 850, chainTargets: 6, description: 'Ionen-Turm mit betäubenden Entladungen.' },
      { level: 5, cost: 520, damage: 250, range: 255, attackCooldown: 700, chainTargets: 8, description: 'Donnergott-Spule: Gigantisches Blitzinferno auf 8 Feinde.' }
    ]
  },
  sniper: {
    type: 'sniper',
    name: 'Scharfschütze',
    shortName: 'Sniper',
    icon: 'icon_sniper',
    baseCost: 220,
    levels: [
      { level: 1, cost: 220, damage: 110, range: 300, attackCooldown: 2400, critChance: 0.20, description: 'Enorme Reichweite, vernichtende Einzeltreffer & 20% Kritisch.' },
      { level: 2, cost: 160, damage: 190, range: 350, attackCooldown: 2200, critChance: 0.28, description: 'Präzisionsvisier für gepanzerte Ziele.' },
      { level: 3, cost: 250, damage: 320, range: 400, attackCooldown: 2000, critChance: 0.36, description: 'Panzerbrechende Wolfram-Kugeln.' },
      { level: 4, cost: 380, damage: 520, range: 460, attackCooldown: 1750, critChance: 0.45, description: 'Antimaterie-Kaliber mit 45% kritischer Chance.' },
      { level: 5, cost: 600, damage: 850, range: 530, attackCooldown: 1500, critChance: 0.55, description: 'Todesurteil-Orbitalgewehr: Ein Schuss, ein Treffer.' }
    ]
  }
};
