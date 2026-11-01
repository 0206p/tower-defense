import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PALETTE } from '../config/GameConfig';
import { TOWER_CONFIGS, TowerType } from '../config/TowerConfig';
import { EconomySystem } from '../systems/EconomySystem';

export class TowerSelectionBar extends Phaser.GameObjects.Container {
  private economy: EconomySystem;
  private selectedTowerType: TowerType | null = null;
  private cards: Map<TowerType, { container: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Graphics; costText: Phaser.GameObjects.Text; nameText: Phaser.GameObjects.Text }> = new Map();
  private infoText: Phaser.GameObjects.Text;
  private onSelectCallback: (type: TowerType | null) => void;

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
    barBg.fillStyle(PALETTE.uiBg, 0.95);
    barBg.fillRect(0, 0, GAME_WIDTH, 66);
    barBg.lineStyle(2, PALETTE.uiBorder, 1);
    barBg.lineBetween(0, 0, GAME_WIDTH, 0);
    this.add(barBg);

    const title = scene.add.text(18, 22, 'TÜRME:', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffd13b'
    }).setOrigin(0, 0.5);
    this.add(title);

    // 6 Türme im Grid
    const towerTypes: TowerType[] = ['archer', 'cannon', 'ice', 'poison', 'tesla', 'sniper'];
    const startX = 140;
    const cardSpacing = 160;

    towerTypes.forEach((type, index) => {
      const card = this.createTowerCard(type, startX + index * cardSpacing, 32);
      this.cards.set(type, card);
      this.add(card.container);
    });

    // Hilfetext
    this.infoText = scene.add.text(GAME_WIDTH - 18, 48, 'Wähle einen Turm und baue ihn auf das Feld', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#9e97b0',
      align: 'right'
    }).setOrigin(1, 0.5);
    this.add(this.infoText);

    this.setDepth(100);
    scene.add.existing(this);

    this.updateAffordability();
  }

  private createTowerCard(type: TowerType, x: number, y: number) {
    const def = TOWER_CONFIGS[type];
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    container.add(bg);

    const icon = this.scene.add.image(-52, 0, def.icon).setScale(0.9);
    container.add(icon);

    const nameText = this.scene.add.text(-32, -12, def.shortName, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffffff'
    });
    container.add(nameText);

    const costText = this.scene.add.text(-32, 4, `${def.baseCost}G`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffd13b'
    });
    container.add(costText);

    container.setSize(145, 46);
    container.setInteractive(new Phaser.Geom.Rectangle(-72, -23, 145, 46), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.toggleSelection(type);
    });

    container.on('pointerover', () => {
      this.setInfoText(def.levels[0].description);
    });

    container.on('pointerout', () => {
      this.setInfoText('Wähle einen Turm und baue ihn auf das Feld');
    });

    return { container, bg, costText, nameText };
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
        this.setInfoText('Nicht genügend Gold für diesen Turm!');
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
        card.bg.fillRoundedRect(-72, -23, 145, 46, 6);
        card.bg.lineStyle(2, 0x7eb34d, 1);
        card.bg.strokeRoundedRect(-72, -23, 145, 46, 6);
        card.nameText.setColor('#ffffff');
      } else if (!canAfford) {
        card.bg.fillStyle(0x191821, 0.7);
        card.bg.fillRoundedRect(-72, -23, 145, 46, 6);
        card.bg.lineStyle(2, 0x2e293a, 1);
        card.bg.strokeRoundedRect(-72, -23, 145, 46, 6);
        card.nameText.setColor('#686075');
      } else {
        card.bg.fillStyle(0x282337, 1);
        card.bg.fillRoundedRect(-72, -23, 145, 46, 6);
        card.bg.lineStyle(2, 0x483d5a, 1);
        card.bg.strokeRoundedRect(-72, -23, 145, 46, 6);
        card.nameText.setColor('#f5f0e6');
      }
    });
  }

  public setInfoText(text: string): void {
    this.infoText.setText(text);
  }
}
