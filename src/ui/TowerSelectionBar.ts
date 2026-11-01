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
    super(scene, 0, GAME_HEIGHT - 64);
    this.economy = economy;
    this.onSelectCallback = onSelect;

    // Leisten-Hintergrund
    const barBg = scene.add.graphics();
    barBg.fillStyle(PALETTE.uiBg, 0.94);
    barBg.fillRect(0, 0, GAME_WIDTH, 64);
    barBg.lineStyle(2, PALETTE.uiBorder, 1);
    barBg.lineBetween(0, 0, GAME_WIDTH, 0);
    this.add(barBg);

    // Label links
    const title = scene.add.text(24, 24, 'TURMBAU:', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffd13b'
    }).setOrigin(0, 0.5);
    this.add(title);

    // Karten für die 3 Türme
    const towerTypes: TowerType[] = ['archer', 'cannon', 'ice'];
    let startX = 170;
    const cardSpacing = 220;

    towerTypes.forEach((type, index) => {
      const card = this.createTowerCard(type, startX + index * cardSpacing, 32);
      this.cards.set(type, card);
      this.add(card.container);
    });

    // Info- und Hilfetext rechts
    this.infoText = scene.add.text(GAME_WIDTH - 24, 32, 'Klicke auf einen Turm und setze ihn auf das Gras', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
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

    // Icon
    const icon = this.scene.add.image(-70, 0, def.icon);
    container.add(icon);

    // Turm-Name
    const nameText = this.scene.add.text(-44, -12, def.name, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff'
    });
    container.add(nameText);

    // Kosten mit Münz-Symbol
    const coin = this.scene.add.image(-38, 12, 'icon_gold').setScale(0.7);
    container.add(coin);

    const costText = this.scene.add.text(-26, 6, `${def.baseCost} G`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffd13b'
    });
    container.add(costText);

    container.setSize(200, 48);
    container.setInteractive(new Phaser.Geom.Rectangle(-95, -24, 190, 48), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.toggleSelection(type);
    });

    container.on('pointerover', () => {
      this.setInfoText(def.levels[0].description);
    });

    container.on('pointerout', () => {
      this.setInfoText('Klicke auf einen Turm und setze ihn auf das Gras');
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
        // Nicht genug Gold
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
        // Stark hervorgehoben (Gold / Grün)
        card.bg.fillStyle(0x384a28, 1);
        card.bg.fillRoundedRect(-95, -24, 190, 48, 6);
        card.bg.lineStyle(2, 0x7eb34d, 1);
        card.bg.strokeRoundedRect(-95, -24, 190, 48, 6);
        card.nameText.setColor('#ffffff');
      } else if (!canAfford) {
        // Ausgegraut
        card.bg.fillStyle(0x191821, 0.7);
        card.bg.fillRoundedRect(-95, -24, 190, 48, 6);
        card.bg.lineStyle(2, 0x2e293a, 1);
        card.bg.strokeRoundedRect(-95, -24, 190, 48, 6);
        card.nameText.setColor('#686075');
      } else {
        // Normal bereit
        card.bg.fillStyle(0x282337, 1);
        card.bg.fillRoundedRect(-95, -24, 190, 48, 6);
        card.bg.lineStyle(2, 0x483d5a, 1);
        card.bg.strokeRoundedRect(-95, -24, 190, 48, 6);
        card.nameText.setColor('#f5f0e6');
      }
    });
  }

  public setInfoText(text: string): void {
    this.infoText.setText(text);
  }
}

