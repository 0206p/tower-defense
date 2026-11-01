import Phaser from 'phaser';
import { GAME_FONT, GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { TOWER_CONFIGS, TowerType } from '../config/TowerConfig';
import { SaveSystem, TowerMetaUpgrade, TOWER_UNLOCK_COSTS } from '../systems/SaveSystem';
import { SoundManager } from '../systems/SoundManager';

export class UpgradeMenuScene extends Phaser.Scene {
  private selectedTowerType: TowerType = 'archer';
  private crystalText!: Phaser.GameObjects.Text;
  private contentContainer!: Phaser.GameObjects.Container;
  private towerButtons: Map<TowerType, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super({ key: 'UpgradeMenuScene' });
  }

  public create(): void {
    this.input.setPollAlways();
    const bg = this.add.graphics();
    bg.fillStyle(0x0e111a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Header
    this.add.text(GAME_WIDTH / 2, 34, 'SCHMIEDE & AKADEMIE', {
      fontFamily: GAME_FONT,
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffd13b',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 64, 'Schalte neue High-Tech-Waffensysteme frei und verstärke bestehende Türme dauerhaft!', {
      fontFamily: GAME_FONT,
      fontSize: '14px',
      color: '#cbd5e1',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Kristalle oben rechts
    this.add.image(GAME_WIDTH - 240, 36, 'icon_crystal').setScale(1.4);
    this.crystalText = this.add.text(GAME_WIDTH - 215, 36, `${SaveSystem.getCrystals()} KRISTALLE`, {
      fontFamily: GAME_FONT,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#c084fc',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);

    // Linke Leiste: Turm-Auswahl (Alle 11 Türme)
    this.createTowerSidebar();

    // Rechter Bereich: Stat-Upgrade-Knoten oder Freischalt-Konsole
    this.contentContainer = this.add.container(360, 95);

    this.refreshUpgradeContent();

    // Unten: Zurücksetzen & Zurück-Button
    this.createBottomButtons();
  }

  private createTowerSidebar(): void {
    const types: TowerType[] = [
      'archer', 'cannon', 'ice', 'poison', 'tesla', 'sniper',
      'flamethrower', 'plasma_pylon', 'orbital_laser', 'chrono_disruptor', 'bio_hive'
    ];
    const startY = 95;
    const spacingY = 46;

    types.forEach((type, idx) => {
      const def = TOWER_CONFIGS[type];
      const y = startY + idx * spacingY;
      const btn = this.add.container(40, y);

      const bg = this.add.graphics();
      btn.add(bg);

      const isUnlocked = SaveSystem.isTowerUnlocked(type);
      const iconKey = this.textures.exists(def.icon) ? def.icon : 'icon_archer';
      const icon = this.add.image(22, 21, iconKey).setDisplaySize(28, 28);
      btn.add(icon);

      const label = this.add.text(52, 13, isUnlocked ? def.name : `🔒 ${def.name}`, {
        fontFamily: GAME_FONT,
        fontSize: '12.5px',
        fontStyle: 'bold',
        color: isUnlocked ? '#f8fafc' : '#94a3b8'
      });
      btn.add(label);

      btn.setSize(290, 40);
      btn.setInteractive({
        hitArea: new Phaser.Geom.Rectangle(0, 0, 290, 40),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        useHandCursor: true
      });

      btn.on('pointerdown', () => {
        SoundManager.playClick();
        this.selectedTowerType = type;
        this.updateSidebarVisuals();
        this.refreshUpgradeContent();
      });

      btn.on('pointerover', () => {
        btn.setScale(1.02);
      });
      btn.on('pointerout', () => {
        btn.setScale(1.0);
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
    const isUnlocked = SaveSystem.isTowerUnlocked(type);
    bg.clear();
    if (isSelected) {
      bg.fillStyle(0x1e293b, 1);
      bg.fillRoundedRect(0, 0, 290, 40, 6);
      bg.lineStyle(2, 0x38bdf8, 1);
      bg.strokeRoundedRect(0, 0, 290, 40, 6);
    } else {
      bg.fillStyle(isUnlocked ? 0x0f172a : 0x090d16, 0.85);
      bg.fillRoundedRect(0, 0, 290, 40, 6);
      bg.lineStyle(1, isUnlocked ? 0x1e293b : 0x172033, 1);
      bg.strokeRoundedRect(0, 0, 290, 40, 6);
    }
  }

  private refreshUpgradeContent(): void {
    this.contentContainer.removeAll(true);

    const def = TOWER_CONFIGS[this.selectedTowerType];
    const isUnlocked = SaveSystem.isTowerUnlocked(this.selectedTowerType);
    const upgrades = SaveSystem.getTowerUpgrade(this.selectedTowerType);

    // Haupt-Panel Hintergrund
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0f172a, 0.96);
    panelBg.fillRoundedRect(0, 0, 880, 506, 10);
    panelBg.lineStyle(2, 0x1e293b, 1);
    panelBg.strokeRoundedRect(0, 0, 880, 506, 10);
    this.contentContainer.add(panelBg);

    if (!isUnlocked) {
      // FREISCHALT-KONSOLE FÜR NEUE ADVANCED TÜRMEN
      const unlockCost = TOWER_UNLOCK_COSTS[this.selectedTowerType] || 500;
      const canAfford = SaveSystem.getCrystals() >= unlockCost;

      const title = this.add.text(440, 50, `🔒 ${def.name.toUpperCase()} FREISCHALTEN`, {
        fontFamily: GAME_FONT,
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#f8fafc'
      }).setOrigin(0.5);
      this.contentContainer.add(title);

      const iconKey = `tower_${this.selectedTowerType}_1`;
      if (this.textures.exists(iconKey)) {
        const preview = this.add.sprite(440, 140, iconKey).setScale(2.2);
        this.contentContainer.add(preview);
      }

      const descBox = this.add.text(440, 230, `${def.levels[0].description}\n\nKosten im Gefecht: ${def.baseCost} Gold\nSpezialitäten: Pfad A (${def.specializations.path_a.name}) & Pfad B (${def.specializations.path_b.name})`, {
        fontFamily: GAME_FONT,
        fontSize: '13.5px',
        color: '#94a3b8',
        align: 'center',
        lineSpacing: 6,
        wordWrap: { width: 700 }
      }).setOrigin(0.5);
      this.contentContainer.add(descBox);

      // Unlock Button
      const unlockBtn = this.add.container(440, 360);
      const btnBg = this.add.graphics();
      btnBg.fillStyle(canAfford ? 0x1e3a8a : 0x1e293b, 1);
      btnBg.fillRoundedRect(-180, -26, 360, 52, 8);
      btnBg.lineStyle(2, canAfford ? 0x38bdf8 : 0x475569, 1);
      btnBg.strokeRoundedRect(-180, -26, 360, 52, 8);
      unlockBtn.add(btnBg);

      const btnLabel = this.add.text(0, 0, `⚡ FREISCHALTEN FÜR ${unlockCost} KRISTALLE`, {
        fontFamily: GAME_FONT,
        fontSize: '14px',
        fontStyle: 'bold',
        color: canAfford ? '#ffffff' : '#64748b'
      }).setOrigin(0.5);
      unlockBtn.add(btnLabel);

      if (canAfford) {
        unlockBtn.setSize(360, 52);
        unlockBtn.setInteractive({
          hitArea: new Phaser.Geom.Rectangle(0, 0, 360, 52),
          hitAreaCallback: Phaser.Geom.Rectangle.Contains,
          useHandCursor: true
        });

        unlockBtn.on('pointerdown', () => {
          if (SaveSystem.unlockTower(this.selectedTowerType, unlockCost)) {
            SoundManager.playUpgrade();
            this.crystalText.setText(`${SaveSystem.getCrystals()} KRISTALLE`);
            this.createTowerSidebar();
            this.refreshUpgradeContent();
          }
        });

        unlockBtn.on('pointerover', () => {
          btnBg.clear();
          btnBg.fillStyle(0x2563eb, 1);
          btnBg.fillRoundedRect(-180, -26, 360, 52, 8);
          btnBg.lineStyle(2, 0xffffff, 1);
          btnBg.strokeRoundedRect(-180, -26, 360, 52, 8);
        });

        unlockBtn.on('pointerout', () => {
          btnBg.clear();
          btnBg.fillStyle(0x1e3a8a, 1);
          btnBg.fillRoundedRect(-180, -26, 360, 52, 8);
          btnBg.lineStyle(2, 0x38bdf8, 1);
          btnBg.strokeRoundedRect(-180, -26, 360, 52, 8);
        });
      }

      this.contentContainer.add(unlockBtn);
      return;
    }

    // Turm-Header im Panel
    const title = this.add.text(30, 22, `${def.name.toUpperCase()} - FORSCHUNG & UPGRADES`, {
      fontFamily: GAME_FONT,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#38bdf8'
    });
    this.contentContainer.add(title);

    const desc = this.add.text(30, 50, def.levels[0].description, {
      fontFamily: GAME_FONT,
      fontSize: '12.5px',
      color: '#94a3b8'
    });
    this.contentContainer.add(desc);

    // 4 Upgrade-Attribute
    const attributes: { key: keyof TowerMetaUpgrade; name: string; icon: string; desc: string; maxBonus: string }[] = [
      {
        key: 'damage',
        name: 'SCHADENSKRAFT',
        icon: '⚔️',
        desc: 'Erhöht den Basis- und Flächenschaden aller Geschosse massiv.',
        maxBonus: `+${upgrades.damage * 16}% (Max +80%)`
      },
      {
        key: 'frequency',
        name: 'ANGRIFFS-FREQUENZ',
        icon: '⏱️',
        desc: 'Verringert die Nachladezeit und beschleunigt Salven drastisch.',
        maxBonus: `+${upgrades.frequency * 12}% (Max +60%)`
      },
      {
        key: 'range',
        name: 'REICHWEITE',
        icon: '🎯',
        desc: 'Erweitert den Zielerfassungs-Radius auf dem Schlachtfeld.',
        maxBonus: `+${upgrades.range * 10}% (Max +50%)`
      },
      {
        key: 'speed',
        name: 'SCHNELLIGKEIT & SPEZIAL',
        icon: '⚡',
        desc: 'Erhöht Projektiltempo, Gift-Dauer, Frost-Slow & Blitz-Ketten.',
        maxBonus: `+${upgrades.speed * 16}% (Max +80%)`
      }
    ];

    attributes.forEach((attr, idx) => {
      this.createAttributeRow(attr, 30, 85 + idx * 100, upgrades[attr.key]);
    });
  }

  private createAttributeRow(
    attr: { key: keyof TowerMetaUpgrade; name: string; icon: string; desc: string; maxBonus: string },
    x: number,
    y: number,
    currentLevel: number
  ): void {
    const rowBg = this.add.graphics();
    rowBg.fillStyle(0x1e293b, 0.7);
    rowBg.fillRoundedRect(x, y, 820, 86, 6);
    rowBg.lineStyle(1, 0x334155, 1);
    rowBg.strokeRoundedRect(x, y, 820, 86, 6);
    this.contentContainer.add(rowBg);

    // Label & Icon
    const label = this.add.text(x + 18, y + 14, `${attr.icon} ${attr.name}`, {
      fontFamily: GAME_FONT,
      fontSize: '14.5px',
      fontStyle: 'bold',
      color: '#f8fafc'
    });
    this.contentContainer.add(label);

    const bonus = this.add.text(x + 400, y + 14, attr.maxBonus, {
      fontFamily: GAME_FONT,
      fontSize: '13.5px',
      fontStyle: 'bold',
      color: '#38bdf8'
    });
    this.contentContainer.add(bonus);

    const desc = this.add.text(x + 18, y + 38, attr.desc, {
      fontFamily: GAME_FONT,
      fontSize: '11.5px',
      color: '#94a3b8'
    });
    this.contentContainer.add(desc);

    // 5 Stufen-Pips (Balken 1 bis 5)
    for (let i = 1; i <= 5; i++) {
      const pip = this.add.graphics();
      const isFilled = i <= currentLevel;
      pip.fillStyle(isFilled ? 0x38bdf8 : 0x0f172a, 1);
      pip.fillRoundedRect(x + 18 + (i - 1) * 40, y + 60, 34, 12, 3);
      this.contentContainer.add(pip);
    }

    // Upgrade-Button rechts
    if (currentLevel < 5) {
      const cost = SaveSystem.getUpgradeCost(currentLevel);
      const canAfford = SaveSystem.getCrystals() >= cost;

      const upBtn = this.add.container(x + 710, y + 43);
      const btnBg = this.add.graphics();
      btnBg.fillStyle(canAfford ? 0x1e3a8a : 0x0f172a, 1);
      btnBg.fillRoundedRect(-95, -20, 190, 40, 6);
      btnBg.lineStyle(2, canAfford ? 0x38bdf8 : 0x334155, 1);
      btnBg.strokeRoundedRect(-95, -20, 190, 40, 6);
      upBtn.add(btnBg);

      const btnText = this.add.text(0, 0, `STUFE ${currentLevel + 1} (${cost} 💎)`, {
        fontFamily: GAME_FONT,
        fontSize: '13px',
        fontStyle: 'bold',
        color: canAfford ? '#ffffff' : '#64748b'
      }).setOrigin(0.5);
      upBtn.add(btnText);

      if (canAfford) {
        upBtn.setSize(190, 40);
        upBtn.setInteractive({
          hitArea: new Phaser.Geom.Rectangle(0, 0, 190, 40),
          hitAreaCallback: Phaser.Geom.Rectangle.Contains,
          useHandCursor: true
        });

        upBtn.on('pointerdown', () => {
          if (SaveSystem.upgradeStat(this.selectedTowerType, attr.key)) {
            SoundManager.playUpgrade();
            this.crystalText.setText(`${SaveSystem.getCrystals()} KRISTALLE`);
            this.refreshUpgradeContent();
          }
        });

        upBtn.on('pointerover', () => {
          btnBg.clear();
          btnBg.fillStyle(0x2563eb, 1);
          btnBg.fillRoundedRect(-95, -20, 190, 40, 6);
          btnBg.lineStyle(2, 0xffffff, 1);
          btnBg.strokeRoundedRect(-95, -20, 190, 40, 6);
        });

        upBtn.on('pointerout', () => {
          btnBg.clear();
          btnBg.fillStyle(0x1e3a8a, 1);
          btnBg.fillRoundedRect(-95, -20, 190, 40, 6);
          btnBg.lineStyle(2, 0x38bdf8, 1);
          btnBg.strokeRoundedRect(-95, -20, 190, 40, 6);
        });
      }

      this.contentContainer.add(upBtn);
    } else {
      const maxText = this.add.text(x + 710, y + 43, '★ MAX STUFE 5', {
        fontFamily: GAME_FONT,
        fontSize: '13.5px',
        fontStyle: 'bold',
        color: '#f59e0b'
      }).setOrigin(0.5);
      this.contentContainer.add(maxText);
    }
  }

  private createBottomButtons(): void {
    const btnW = 230;
    const halfW = btnW / 2;

    // Reset-Button
    const resetBtn = this.add.container(GAME_WIDTH / 2 - 260, 640);
    const rBg = this.add.graphics();
    rBg.fillStyle(0x7a2828, 1);
    rBg.fillRoundedRect(-halfW, -18, btnW, 36, 6);
    rBg.lineStyle(2, 0xa33b3b, 1);
    rBg.strokeRoundedRect(-halfW, -18, btnW, 36, 6);
    resetBtn.add(rBg);

    const rLabel = this.add.text(0, 0, 'KRISTALLE RESETTEN', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5);
    resetBtn.add(rLabel);

    resetBtn.setSize(btnW, 36);
    resetBtn.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, btnW, 36),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });
    resetBtn.on('pointerdown', () => {
      SaveSystem.resetAllUpgrades();
      this.crystalText.setText(`${SaveSystem.getCrystals()} KRISTALLE`);
      this.refreshUpgradeContent();
    });
    resetBtn.on('pointerover', () => {
      rBg.clear();
      rBg.fillStyle(0x993535, 1);
      rBg.fillRoundedRect(-halfW, -18, btnW, 36, 6);
      rBg.lineStyle(2, 0xffffff, 1);
      rBg.strokeRoundedRect(-halfW, -18, btnW, 36, 6);
      resetBtn.setScale(1.03);
    });
    resetBtn.on('pointerout', () => {
      rBg.clear();
      rBg.fillStyle(0x7a2828, 1);
      rBg.fillRoundedRect(-halfW, -18, btnW, 36, 6);
      rBg.lineStyle(2, 0xa33b3b, 1);
      rBg.strokeRoundedRect(-halfW, -18, btnW, 36, 6);
      resetBtn.setScale(1.0);
    });

    // Skins-Button
    const skinsBtn = this.add.container(GAME_WIDTH / 2, 640);
    const sBg = this.add.graphics();
    sBg.fillStyle(0x1e3a8a, 1);
    sBg.fillRoundedRect(-halfW, -18, btnW, 36, 6);
    sBg.lineStyle(2, 0x3b82f6, 1);
    sBg.strokeRoundedRect(-halfW, -18, btnW, 36, 6);
    skinsBtn.add(sBg);

    const sLabel = this.add.text(0, 0, '🎨 TURM-SKINS (ARSENAL)', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5);
    skinsBtn.add(sLabel);

    skinsBtn.setSize(btnW, 36);
    skinsBtn.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, btnW, 36),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });
    skinsBtn.on('pointerdown', () => {
      this.scene.start('SkinShopScene');
    });
    skinsBtn.on('pointerover', () => {
      sBg.clear();
      sBg.fillStyle(0x2563eb, 1);
      sBg.fillRoundedRect(-halfW, -18, btnW, 36, 6);
      sBg.lineStyle(2, 0xffffff, 1);
      sBg.strokeRoundedRect(-halfW, -18, btnW, 36, 6);
      skinsBtn.setScale(1.03);
    });
    skinsBtn.on('pointerout', () => {
      sBg.clear();
      sBg.fillStyle(0x1e3a8a, 1);
      sBg.fillRoundedRect(-halfW, -18, btnW, 36, 6);
      sBg.lineStyle(2, 0x3b82f6, 1);
      sBg.strokeRoundedRect(-halfW, -18, btnW, 36, 6);
      skinsBtn.setScale(1.0);
    });

    // Zurück-Button
    const backBtn = this.add.container(GAME_WIDTH / 2 + 260, 640);
    const bBg = this.add.graphics();
    bBg.fillStyle(0x2d3436, 1);
    bBg.fillRoundedRect(-halfW, -18, btnW, 36, 6);
    bBg.lineStyle(2, 0x636e72, 1);
    bBg.strokeRoundedRect(-halfW, -18, btnW, 36, 6);
    backBtn.add(bBg);

    const bLabel = this.add.text(0, 0, 'ZURÜCK ZU DEN WELTEN', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      color: '#ffd13b'
    }).setOrigin(0.5);
    backBtn.add(bLabel);

    backBtn.setSize(btnW, 36);
    backBtn.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, btnW, 36),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });
    backBtn.on('pointerdown', () => {
      this.scene.start('WorldSelectScene');
    });
    backBtn.on('pointerover', () => {
      bBg.clear();
      bBg.fillStyle(0x404b50, 1);
      bBg.fillRoundedRect(-halfW, -18, btnW, 36, 6);
      bBg.lineStyle(2, 0xffffff, 1);
      bBg.strokeRoundedRect(-halfW, -18, btnW, 36, 6);
      backBtn.setScale(1.03);
    });
    backBtn.on('pointerout', () => {
      bBg.clear();
      bBg.fillStyle(0x2d3436, 1);
      bBg.fillRoundedRect(-halfW, -18, btnW, 36, 6);
      bBg.lineStyle(2, 0x636e72, 1);
      bBg.strokeRoundedRect(-halfW, -18, btnW, 36, 6);
      backBtn.setScale(1.0);
    });
  }
}

