import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { WorldSelectScene } from './scenes/WorldSelectScene';
import { MissionSelectScene } from './scenes/MissionSelectScene';
import { UpgradeMenuScene } from './scenes/UpgradeMenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { VictoryScene } from './scenes/VictoryScene';
import { StarCraftPrototypeScene } from './scenes/StarCraftPrototypeScene';
import { SkinShopScene } from './scenes/SkinShopScene';

// Globaler Hook für gestochen scharfen Text in Phaser (Native High-DPI Auflösung 3x)
const textResolution = Math.max(window.devicePixelRatio || 1, 2) * 1.5;

if (!(Phaser.GameObjects.GameObjectFactory.prototype as any).__isTextPatched) {
  const origAddText = Phaser.GameObjects.GameObjectFactory.prototype.text;
  Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, text, style) {
    const mergedStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      resolution: textResolution,
      padding: { x: 3, y: 2 },
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      ...(typeof style === 'object' ? style : {})
    };
    return origAddText.call(this, x, y, text, mergedStyle);
  };
  (Phaser.GameObjects.GameObjectFactory.prototype as any).__isTextPatched = true;
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  pixelArt: false,
  antialias: true,
  antialiasGL: true,
  roundPixels: false,
  backgroundColor: '#100d18',
  input: {
    activePointers: 1,
    smoothFactor: 0
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [
    BootScene,
    MenuScene,
    WorldSelectScene,
    MissionSelectScene,
    UpgradeMenuScene,
    GameScene,
    GameOverScene,
    VictoryScene,
    StarCraftPrototypeScene,
    SkinShopScene
  ]
};

window.addEventListener('load', async () => {
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
      await Promise.allSettled([
        document.fonts.load('500 16px "Inter"'),
        document.fonts.load('600 16px "Inter"'),
        document.fonts.load('700 16px "Inter"'),
        document.fonts.load('800 16px "Inter"')
      ]);
    } catch (e) {
      console.warn('Font loading check:', e);
    }
  }
  new Phaser.Game(config);
});
