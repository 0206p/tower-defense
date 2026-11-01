import Phaser from 'phaser';
import { GAME_FONT, GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { TOWER_CONFIGS, TowerType } from '../config/TowerConfig';
import { SaveSystem, TowerMetaUpgrade } from '../systems/SaveSystem';

export class UpgradeMenuScene extends Phaser.Scene {
  private selectedTowerType: TowerType = 'archer';
  private crystalText!: Phaser.GameObjects.Text;
  private contentContainer!: Phaser.GameObjects.Container;
  private towerButtons: Map<TowerType, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super({ key: 'UpgradeMenuScene' });
  }

  public create(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x110e19, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Header
    this.add.text(GAME_WIDTH / 2, 40, 'TURM-SCHMIEDE & AKADEMIE', {
      fontFamily: GAME_FONT,
      fontSize: '30px',
      color: '#ffd13b',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 75, 'Verstärke deine Türme dauerhaft in Schaden, Frequenz, Reichweite & Schnelligkeit!', {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#dcdde1',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Kristalle oben rechts
    this.add.image(GAME_WIDTH - 240, 40, 'icon_crystal').setScale(1.4);
    this.crystalText = this.add.text(GAME_WIDTH - 215, 40, `${SaveSystem.getCrystals()} KRISTALLE`, {
      fontFamily: GAME_FONT,
      fontSize: '16px',
      color: '#be2edd',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);

    // Linke Leiste: Turm-Auswahl (6 Türme)
    this.createTowerSidebar();

    // Rechter Bereich: Stat-Upgrade-Knoten
    this.contentContainer = this.add.container(400, 110);

    this.refreshUpgradeContent();

    // Unten: Zurücksetzen & Zurück-Button
    this.createBottomButtons();
  }

  private createTowerSidebar(): void {
    const types: TowerType[] = ['archer', 'cannon', 'ice', 'poison', 'tesla', 'sniper'];
    const startY = 120;
    const spacingY = 70;

    types.forEach((type, idx) => {
      const def = TOWER_CONFIGS[type];
      const y = startY + idx * spacingY;
      const btn = this.add.container(70, y);

      const bg = this.add.graphics();
      btn.add(bg);

      const icon = this.add.image(24, 25, def.icon);
      btn.add(icon);

      const label = this.add.text(60, 17, def.name, {
        fontFamily: GAME_FONT,
        fontSize: '14px',
        color: '#ffffff'
      });
      btn.add(label);

      btn.setSize(270, 52);
      btn.setInteractive(new Phaser.Geom.Rectangle(0, 0, 270, 52), Phaser.Geom.Rectangle.Contains);

      btn.on('pointerdown', () => {
        this.selectedTowerType = type;
        this.updateSidebarVisuals();
        this.refreshUpgradeContent();
      });

      this.towerButtons.set(type, btn);
      this.updateSingleButtonVisual(type, btn, type === this.selectedTowerType);
    });
  }

  private updateSidebarVisuals(): void {
    this.towerButtons.forEach((btn, type) => {
      this.updateSingleButtonVisual(type, btn, type === this.selectedTowerType);
    });
  }

  private updateSingleButtonVisual(type: TowerType, btn: Phaser.GameObjects.Container, isSelected: boolean): void {
    const bg = btn.getAt(0) as Phaser.GameObjects.Graphics;
    bg.clear();
    if (isSelected) {
      bg.fillStyle(0x38284e, 1);
      bg.fillRoundedRect(0, 0, 270, 52, 6);
      bg.lineStyle(2, 0xd4af37, 1);
      bg.strokeRoundedRect(0, 0, 270, 52, 6);
    } else {
      bg.fillStyle(0x1e1929, 0.85);
      bg.fillRoundedRect(0, 0, 270, 52, 6);
      bg.lineStyle(1, 0x3d354a, 1);
      bg.strokeRoundedRect(0, 0, 270, 52, 6);
    }
  }

  private refreshUpgradeContent(): void {
    this.contentContainer.removeAll(true);

    const def = TOWER_CONFIGS[this.selectedTowerType];
    const upgrades = SaveSystem.getTowerUpgrade(this.selectedTowerType);

    // Haupt-Panel Hintergrund
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1c1726, 0.95);
    panelBg.fillRoundedRect(0, 0, 810, 480, 10);
    panelBg.lineStyle(2, 0x8a78a5, 1);
    panelBg.strokeRoundedRect(0, 0, 810, 480, 10);
    this.contentContainer.add(panelBg);

    // Turm-Header im Panel
    const title = this.add.text(30, 22, `${def.name.toUpperCase()} - FORSCHUNG`, {
      fontFamily: GAME_FONT,
      fontSize: '20px',
      color: '#ffd13b'
    });
    this.contentContainer.add(title);

    const desc = this.add.text(30, 52, def.levels[0].description, {
      fontFamily: GAME_FONT,
      fontSize: '13px',
      color: '#a4b0be'
    });
    this.contentContainer.add(desc);

    // 4 Upgrade-Attribute
    const attributes: { key: keyof TowerMetaUpgrade; name: string; icon: string; desc: string; maxBonus: string }[] = [
      {
        key: 'damage',
        name: 'SCHADENSKRAFT',
        icon: '⚔️',
        desc: 'Erhöht den Basis- und Flächenschaden aller Geschosse.',
        maxBonus: `+${upgrades.damage * 12}% (Max +60%)`
      },
      {
        key: 'frequency',
        name: 'ANGRIFFS-FREQUENZ',
        icon: '⏱️',
        desc: 'Verringert die Nachladezeit und beschleunigt Salven.',
        maxBonus: `+${upgrades.frequency * 9}% (Max +45%)`
      },
      {
        key: 'range',
        name: 'REICHWEITE',
        icon: '🎯',
        desc: 'Erweitert den Zielerfassungs-Radius auf dem Spielfeld.',
        maxBonus: `+${upgrades.range * 8}% (Max +40%)`
      },
      {
        key: 'speed',
        name: 'SCHNELLIGKEIT & SPEZIAL',
        icon: '⚡',
        desc: 'Erhöht Projektiltempo, Gift-Dauer, Frost-Slow & Blitz-Ketten.',
        maxBonus: `+${upgrades.speed * 15}% (Max +75%)`
      }
    ];

    attributes.forEach((attr, idx) => {
      this.createAttributeRow(attr, 30, 85 + idx * 95, upgrades[attr.key]);
    });
  }

  private createAttributeRow(
    attr: { key: keyof TowerMetaUpgrade; name: string; icon: string; desc: string; maxBonus: string },
    x: number,
    y: number,
    currentLevel: number
  ): void {
    const rowBg = this.add.graphics();
    rowBg.fillStyle(0x252033, 0.9);
    rowBg.fillRoundedRect(x, y, 750, 82, 6);
    rowBg.lineStyle(1, 0x483d5a, 1);
    rowBg.strokeRoundedRect(x, y, 750, 82, 6);
    this.contentContainer.add(rowBg);

    // Label & Icon
    const label = this.add.text(x + 16, y + 12, `${attr.icon} ${attr.name}`, {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#f5f0e6'
    });
    this.contentContainer.add(label);

    const bonus = this.add.text(x + 360, y + 12, attr.maxBonus, {
      fontFamily: GAME_FONT,
      fontSize: '14px',
      color: '#5cd670'
    });
    this.contentContainer.add(bonus);

    const desc = this.add.text(x + 16, y + 36, attr.desc, {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      color: '#8c829e'
    });
    this.contentContainer.add(desc);

    // 5 Stufen-Pips (Balken 1 bis 5)
    for (let i = 1; i <= 5; i++) {
      const pip = this.add.graphics();
      const isFilled = i <= currentLevel;
      pip.fillStyle(isFilled ? 0xf1c40f : 0x3d354a, 1);
      pip.fillRoundedRect(x + 16 + (i - 1) * 36, y + 58, 30, 10, 2);
      this.contentContainer.add(pip);
    }

    // Upgrade-Button rechts
    if (currentLevel < 5) {
      const cost = SaveSystem.getUpgradeCost(currentLevel);
      const canAfford = SaveSystem.getCrystals() >= cost;

      const upBtn = this.add.container(x + 630, y + 41);
      const btnBg = this.add.graphics();
      btnBg.fillStyle(canAfford ? 0x27ae60 : 0x221f2d, 1);
      btnBg.fillRoundedRect(-85, -18, 170, 36, 4);
      btnBg.lineStyle(2, canAfford ? 0x2ecc71 : 0x3d354a, 1);
      btnBg.strokeRoundedRect(-85, -18, 170, 36, 4);
      upBtn.add(btnBg);

      const btnText = this.add.text(0, 0, `STUFE ${currentLevel + 1} (${cost}💎)`, {
        fontFamily: GAME_FONT,
        fontSize: '13px',
        color: canAfford ? '#ffffff' : '#686075'
      }).setOrigin(0.5);
      upBtn.add(btnText);

      if (canAfford) {
        upBtn.setSize(170, 36);
        upBtn.setInteractive(new Phaser.Geom.Rectangle(-85, -18, 170, 36), Phaser.Geom.Rectangle.Contains);

        upBtn.on('pointerdown', () => {
          if (SaveSystem.upgradeStat(this.selectedTowerType, attr.key)) {
            this.crystalText.setText(`${SaveSystem.getCrystals()} KRISTALLE`);
            this.refreshUpgradeContent();
          }
        });
      }

      this.contentContainer.add(upBtn);
    } else {
      const maxText = this.add.text(x + 630, y + 41, '★ MAX STUFE 5', {
        fontFamily: GAME_FONT,
        fontSize: '14px',
        color: '#ffd13b'
      }).setOrigin(0.5);
      this.contentContainer.add(maxText);
    }
  }

  private createBottomButtons(): void {
    // Reset-Button
    const resetBtn = this.add.container(GAME_WIDTH / 2 - 160, 640);
    const rBg = this.add.graphics();
    rBg.fillStyle(0x7a2828, 1);
    rBg.fillRoundedRect(-140, -18, 280, 36, 6);
    rBg.lineStyle(2, 0xa33b3b, 1);
    rBg.strokeRoundedRect(-140, -18, 280, 36, 6);
    resetBtn.add(rBg);

    const rLabel = this.add.text(0, 0, 'ALLE KRISTALLE ZURÜCKSETZEN', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5);
    resetBtn.add(rLabel);

    resetBtn.setSize(280, 36);
    resetBtn.setInteractive(new Phaser.Geom.Rectangle(-140, -18, 280, 36), Phaser.Geom.Rectangle.Contains);
    resetBtn.on('pointerdown', () => {
      SaveSystem.resetAllUpgrades();
      this.crystalText.setText(`${SaveSystem.getCrystals()} KRISTALLE`);
      this.refreshUpgradeContent();
    });

    // Zurück-Button
    const backBtn = this.add.container(GAME_WIDTH / 2 + 180, 640);
    const bBg = this.add.graphics();
    bBg.fillStyle(0x2d3436, 1);
    bBg.fillRoundedRect(-120, -18, 240, 36, 6);
    bBg.lineStyle(2, 0x636e72, 1);
    bBg.strokeRoundedRect(-120, -18, 240, 36, 6);
    backBtn.add(bBg);

    const bLabel = this.add.text(0, 0, '< ZURÜCK ZU DEN WELTEN', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      color: '#ffd13b'
    }).setOrigin(0.5);
    backBtn.add(bLabel);

    backBtn.setSize(240, 36);
    backBtn.setInteractive(new Phaser.Geom.Rectangle(-120, -18, 240, 36), Phaser.Geom.Rectangle.Contains);
    backBtn.on('pointerdown', () => {
      this.scene.start('WorldSelectScene');
    });
  }
}

