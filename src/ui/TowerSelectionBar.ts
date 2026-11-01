import Phaser from 'phaser';
import { GAME_FONT, GAME_HEIGHT, GAME_WIDTH, PALETTE } from '../config/GameConfig';
import { TOWER_CONFIGS, TowerType } from '../config/TowerConfig';
import { EconomySystem } from '../systems/EconomySystem';
import { SoundManager } from '../systems/SoundManager';
import { SaveSystem } from '../systems/SaveSystem';

export interface TowerSelectionBarCallbacks {
  onSelect: (type: TowerType | null) => void;
  onStartDrag: (type: TowerType, pointer: Phaser.Input.Pointer) => void;
  onLockedAttempt: () => void;
  onNotEnoughGold: () => void;
}

export class TowerSelectionBar extends Phaser.GameObjects.Container {
  private economy: EconomySystem;
  private selectedTowerType: TowerType | null = null;
  private cards: Map<TowerType, { container: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Graphics; costText: Phaser.GameObjects.Text; nameText: Phaser.GameObjects.Text }> = new Map();
  private callbacks: TowerSelectionBarCallbacks;
  private statusBadge: Phaser.GameObjects.Graphics;
  private statusTopText: Phaser.GameObjects.Text;
  private statusSubText: Phaser.GameObjects.Text;
  private buildEnabled: boolean = true;

  // Hover-Stats-Box rechts unten
  private statsHoverPanel: Phaser.GameObjects.Container;
  private hoverTitle: Phaser.GameObjects.Text;
  private hoverStats: Phaser.GameObjects.Text;
  private hoverDesc: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    economy: EconomySystem,
    callbacks: TowerSelectionBarCallbacks
  ) {
    super(scene, 0, GAME_HEIGHT - 66);
    this.economy = economy;
    this.callbacks = callbacks;

    // Leisten-Hintergrund
    const barBg = scene.add.graphics();
    barBg.fillStyle(PALETTE.uiBg, 0.96);
    barBg.fillRect(0, 0, GAME_WIDTH, 66);
    barBg.lineStyle(2, PALETTE.uiBorder, 1);
    barBg.lineBetween(0, 0, GAME_WIDTH, 0);
    this.add(barBg);

    // Status-Badge links (112 x 46 px, sauber getrennt von den Karten)
    this.statusBadge = scene.add.graphics();
    this.statusBadge.fillStyle(0x191624, 0.95);
    this.statusBadge.fillRoundedRect(12, 10, 114, 46, 5);
    this.statusBadge.lineStyle(2, 0x3d354f, 1);
    this.statusBadge.strokeRoundedRect(12, 10, 114, 46, 5);
    this.add(this.statusBadge);

    this.statusTopText = scene.add.text(69, 21, 'BAUMENÜ', {
      fontFamily: GAME_FONT,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffd13b',
      stroke: '#000000',
      strokeThickness: 1.5
    }).setOrigin(0.5);
    this.add(this.statusTopText);

    this.statusSubText = scene.add.text(69, 40, 'BEREIT', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#2ecc71',
      stroke: '#000000',
      strokeThickness: 1.5
    }).setOrigin(0.5);
    this.add(this.statusSubText);

    // 6 Turm-Karten mit optimierten Abständen (absolut überschneidungsfrei)
    const towerTypes: TowerType[] = ['archer', 'cannon', 'ice', 'poison', 'tesla', 'sniper'];
    const startX = 202;
    const cardSpacing = 135;

    towerTypes.forEach((type, index) => {
      const card = this.createTowerCard(type, startX + index * cardSpacing, 33);
      this.cards.set(type, card);
      this.add(card.container);
    });

    // Hover-Stats-Panel rechts unten
    this.statsHoverPanel = scene.add.container(GAME_WIDTH - 315, -115);
    const hBg = scene.add.graphics();
    hBg.fillStyle(0x130f1c, 0.98);
    hBg.fillRoundedRect(0, 0, 305, 110, 6);
    hBg.lineStyle(2, 0xd4af37, 1);
    hBg.strokeRoundedRect(0, 0, 305, 110, 6);
    this.statsHoverPanel.add(hBg);

    this.hoverTitle = scene.add.text(12, 10, 'TURM DETAILS', {
      fontFamily: GAME_FONT,
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffd13b',
      stroke: '#000000',
      strokeThickness: 1.5
    });
    this.statsHoverPanel.add(this.hoverTitle);

    this.hoverStats = scene.add.text(12, 32, '', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      fontStyle: 'bold',
      lineSpacing: 4,
      color: '#5eead4',
      stroke: '#000000',
      strokeThickness: 1.5
    });
    this.statsHoverPanel.add(this.hoverStats);

    this.hoverDesc = scene.add.text(12, 75, '', {
      fontFamily: GAME_FONT,
      fontSize: '12px',
      lineSpacing: 3,
      color: '#f5f0e6',
      wordWrap: { width: 280 }
    });
    this.statsHoverPanel.add(this.hoverDesc);

    this.statsHoverPanel.setVisible(false);
    this.add(this.statsHoverPanel);

    this.setDepth(100);
    scene.add.existing(this);

    this.updateAffordability();
  }

  public setBuildEnabled(enabled: boolean): void {
    this.buildEnabled = enabled;
    if (!enabled) {
      this.statusBadge.clear();
      this.statusBadge.fillStyle(0x2a141a, 0.95);
      this.statusBadge.fillRoundedRect(12, 10, 114, 46, 5);
      this.statusBadge.lineStyle(2, 0x8a2334, 1);
      this.statusBadge.strokeRoundedRect(12, 10, 114, 46, 5);

      this.statusSubText.setText('🔒 GESPERRT');
      this.statusSubText.setColor('#ff4757');
      if (this.selectedTowerType) {
        this.clearSelection();
      }
    } else {
      this.statusBadge.clear();
      this.statusBadge.fillStyle(0x191624, 0.95);
      this.statusBadge.fillRoundedRect(12, 10, 114, 46, 5);
      this.statusBadge.lineStyle(2, 0x3d354f, 1);
      this.statusBadge.strokeRoundedRect(12, 10, 114, 46, 5);

      this.statusSubText.setText('BEREIT');
      this.statusSubText.setColor('#2ecc71');
    }
    this.updateCardVisuals();
  }

  public isBuildEnabled(): boolean {
    return this.buildEnabled;
  }

  private createTowerCard(type: TowerType, x: number, y: number) {
    const def = TOWER_CONFIGS[type];
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    container.add(bg);

    // 1:1 Pixel-Art für perfekte Schärfe
    const icon = this.scene.add.image(-48, 0, def.icon);
    container.add(icon);

    const nameText = this.scene.add.text(-24, -13, def.shortName, {
      fontFamily: GAME_FONT,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1.5
    });
    container.add(nameText);

    const costText = this.scene.add.text(-24, 4, `${def.baseCost}G`, {
      fontFamily: GAME_FONT,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffd13b',
      stroke: '#000000',
      strokeThickness: 1.5
    });
    container.add(costText);

    container.setSize(134, 46);
    container.setInteractive(new Phaser.Geom.Rectangle(-67, -23, 134, 46), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      if (!this.buildEnabled) {
        SoundManager.playDeny();
        this.callbacks.onLockedAttempt();
        return;
      }

      if (!this.economy.canAfford(def.baseCost)) {
        SoundManager.playDeny();
        this.callbacks.onNotEnoughGold();
        return;
      }

      SoundManager.playClick();
      this.selectedTowerType = type;
      this.updateCardVisuals();
      this.callbacks.onSelect(type);
      this.callbacks.onStartDrag(type, pointer);
    });

    container.on('pointerover', () => {
      this.showHoverStats(type);
    });

    container.on('pointerout', () => {
      this.hideHoverStats();
    });

    return { container, bg, costText, nameText };
  }

  public showHoverStats(type: TowerType): void {
    const def = TOWER_CONFIGS[type];
    const stats = def.levels[0];
    const mults = SaveSystem.getStatMultipliers(type);

    const dmg = Math.round(stats.damage * mults.damageMult);
    const range = Math.round(stats.range * mults.rangeMult);
    const cd = Math.round(stats.attackCooldown / mults.frequencyMult);
    const rate = (1000 / cd).toFixed(1);

    this.hoverTitle.setText(`${def.name.toUpperCase()} (STUFE 1)`);

    let s = `⚔️ Schaden: ${dmg}   🎯 Range: ${range}px\n⏱️ Kadenz: ${rate}/s`;
    if (stats.splashRadius) s += `   💥 Splash: ${stats.splashRadius}px`;
    if (stats.slowFactor) s += `   ❄️ Slow: ${Math.round(stats.slowFactor * 100)}%`;
    if (stats.dotDamage) s += `   ☠️ Gift: ${stats.dotDamage} DoT`;
    if (stats.chainTargets) s += `   ⚡ Blitz: ${stats.chainTargets} Ziele`;
    if (stats.critChance) s += `   🎯 Krit: ${Math.round(stats.critChance * 100)}%`;

    this.hoverStats.setText(s);
    this.hoverDesc.setText(stats.description);
    this.statsHoverPanel.setVisible(true);
  }

  public hideHoverStats(): void {
    this.statsHoverPanel.setVisible(false);
  }

  public toggleSelection(type: TowerType): void {
    if (!this.buildEnabled) {
      this.callbacks.onLockedAttempt();
      return;
    }

    if (this.selectedTowerType === type) {
      this.selectedTowerType = null;
    } else {
      const def = TOWER_CONFIGS[type];
      if (this.economy.canAfford(def.baseCost)) {
        this.selectedTowerType = type;
      } else {
        this.selectedTowerType = null;
      }
    }

    this.updateCardVisuals();
    this.callbacks.onSelect(this.selectedTowerType);
  }

  public getSelectedTowerType(): TowerType | null {
    return this.selectedTowerType;
  }

  public clearSelection(): void {
    this.selectedTowerType = null;
    this.updateCardVisuals();
    this.callbacks.onSelect(null);
  }

  public updateAffordability(): void {
    this.updateCardVisuals();
  }

  private updateCardVisuals(): void {
    this.cards.forEach((card, type) => {
      const def = TOWER_CONFIGS[type];
      const canAfford = this.economy.canAfford(def.baseCost);
      const isSelected = this.selectedTowerType === type;

      card.bg.clear();

      if (!this.buildEnabled) {
        card.container.setAlpha(0.5);
        card.bg.fillStyle(0x191821, 0.7);
        card.bg.fillRoundedRect(-67, -23, 134, 46, 6);
        card.bg.lineStyle(2, 0x3d2828, 1);
        card.bg.strokeRoundedRect(-67, -23, 134, 46, 6);
        card.nameText.setColor('#686075');
      } else {
        card.container.setAlpha(1.0);
        if (isSelected) {
          card.bg.fillStyle(0x384a28, 1);
          card.bg.fillRoundedRect(-67, -23, 134, 46, 6);
          card.bg.lineStyle(2, 0x7eb34d, 1);
          card.bg.strokeRoundedRect(-67, -23, 134, 46, 6);
          card.nameText.setColor('#ffffff');
        } else if (!canAfford) {
          card.bg.fillStyle(0x191821, 0.7);
          card.bg.fillRoundedRect(-67, -23, 134, 46, 6);
          card.bg.lineStyle(2, 0x2e293a, 1);
          card.bg.strokeRoundedRect(-67, -23, 134, 46, 6);
          card.nameText.setColor('#686075');
        } else {
          card.bg.fillStyle(0x282337, 1);
          card.bg.fillRoundedRect(-67, -23, 134, 46, 6);
          card.bg.lineStyle(2, 0x483d5a, 1);
          card.bg.strokeRoundedRect(-67, -23, 134, 46, 6);
          card.nameText.setColor('#f5f0e6');
        }
      }
    });
  }
}
