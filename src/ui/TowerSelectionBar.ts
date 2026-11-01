import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PALETTE } from '../config/GameConfig';
import { TOWER_CONFIGS, TowerType } from '../config/TowerConfig';
import { EconomySystem } from '../systems/EconomySystem';
import { SoundManager } from '../systems/SoundManager';
import { SaveSystem } from '../systems/SaveSystem';

export class TowerSelectionBar extends Phaser.GameObjects.Container {
  private economy: EconomySystem;
  private selectedTowerType: TowerType | null = null;
  private cards: Map<TowerType, { container: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Graphics; costText: Phaser.GameObjects.Text; nameText: Phaser.GameObjects.Text }> = new Map();
  private onSelectCallback: (type: TowerType | null) => void;

  // Hover-Stats-Box rechts unten
  private statsHoverPanel: Phaser.GameObjects.Container;
  private hoverTitle: Phaser.GameObjects.Text;
  private hoverStats: Phaser.GameObjects.Text;
  private hoverDesc: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    economy: EconomySystem,
    onSelect: (type: TowerType | null) => void
  ) {
    super(scene, 0, GAME_HEIGHT - 66);
    this.economy = economy;
    this.onSelectCallback = onSelect;

    // Leisten-Hintergrund
    const barBg = scene.add.graphics();
    barBg.fillStyle(PALETTE.uiBg, 0.96);
    barBg.fillRect(0, 0, GAME_WIDTH, 66);
    barBg.lineStyle(2, PALETTE.uiBorder, 1);
    barBg.lineBetween(0, 0, GAME_WIDTH, 0);
    this.add(barBg);

    const title = scene.add.text(20, 33, 'TÜRME:', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffd13b',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);
    this.add(title);

    // 6 Turm-Karten (Großzügiger Abstand, kein Überlappen)
    const towerTypes: TowerType[] = ['archer', 'cannon', 'ice', 'poison', 'tesla', 'sniper'];
    const startX = 175;
    const cardSpacing = 144;

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
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffd13b',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.statsHoverPanel.add(this.hoverTitle);

    this.hoverStats = scene.add.text(12, 32, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      lineSpacing: 6,
      color: '#5eead4',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.statsHoverPanel.add(this.hoverStats);

    this.hoverDesc = scene.add.text(12, 75, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      lineSpacing: 4,
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

  private createTowerCard(type: TowerType, x: number, y: number) {
    const def = TOWER_CONFIGS[type];
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    container.add(bg);

    // 1:1 Pixel-Art für perfekte Schärfe
    const icon = this.scene.add.image(-48, 0, def.icon);
    container.add(icon);

    const nameText = this.scene.add.text(-24, -13, def.shortName, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    container.add(nameText);

    const costText = this.scene.add.text(-24, 4, `${def.baseCost}G`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffd13b',
      stroke: '#000000',
      strokeThickness: 2
    });
    container.add(costText);

    container.setSize(134, 46);
    container.setInteractive(new Phaser.Geom.Rectangle(-67, -23, 134, 46), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      SoundManager.playClick();
      this.toggleSelection(type);
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
    this.onSelectCallback(this.selectedTowerType);
  }

  public getSelectedTowerType(): TowerType | null {
    return this.selectedTowerType;
  }

  public clearSelection(): void {
    this.selectedTowerType = null;
    this.updateCardVisuals();
    this.onSelectCallback(null);
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
    });
  }
}
