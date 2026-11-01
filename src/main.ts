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

// Globaler Hook für gestochen scharfen Text in Phaser (2-fache interne Auflösung gegen Verpixelung)
const origAddText = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, text, style) {
  const mergedStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    resolution: 2,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    ...(typeof style === 'object' ? style : {})
  };
  return origAddText.call(this, x, y, text, mergedStyle);
};

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  pixelArt: false,
  antialias: true,
  antialiasGL: true,
  roundPixels: true,
  backgroundColor: '#100d18',
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
    VictoryScene
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
