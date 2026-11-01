import Phaser from 'phaser';

export class PixelTextureGenerator {
  public static generateAll(scene: Phaser.Scene): void {
    const tm = scene.textures;

    const create = (key: string, width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void) => {
      if (tm.exists(key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        drawFn(ctx);
        tm.addCanvas(key, canvas);
      }
    };

    // ==========================================
    // 1. HUD & SYSTEM ICONS
    // ==========================================
    // Herz (Leben)
    create('icon_heart', 24, 24, (ctx) => {
      ctx.fillStyle = '#ff3838';
      ctx.beginPath();
      ctx.moveTo(12, 21);
      ctx.bezierCurveTo(3, 14, 2, 5, 7, 4);
      ctx.bezierCurveTo(11, 4, 12, 7, 12, 7);
      ctx.bezierCurveTo(12, 7, 13, 4, 17, 4);
      ctx.bezierCurveTo(22, 5, 21, 14, 12, 21);
      ctx.fill();
      ctx.fillStyle = '#ff9f9f';
      ctx.fillRect(7, 6, 3, 3);
    });

    // Gold
    create('icon_gold', 24, 24, (ctx) => {
      ctx.fillStyle = '#b7791f';
      ctx.beginPath();
      ctx.arc(12, 12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(12, 12, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef160';
      ctx.fillRect(8, 7, 3, 4);
      ctx.fillStyle = '#946014';
      ctx.fillRect(11, 7, 2, 10);
    });

    // Welle (Totenkopf / Fahne)
    create('icon_wave', 24, 24, (ctx) => {
      ctx.fillStyle = '#dfe6e9';
      ctx.fillRect(6, 4, 12, 11);
      ctx.fillRect(8, 15, 8, 5);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(8, 8, 3, 4);
      ctx.fillRect(13, 8, 3, 4);
      ctx.fillRect(10, 16, 1, 4);
      ctx.fillRect(13, 16, 1, 4);
    });

    // Kristalle
    create('icon_crystal', 24, 24, (ctx) => {
      ctx.fillStyle = '#8e44ad';
      ctx.beginPath();
      ctx.moveTo(12, 2);
      ctx.lineTo(21, 10);
      ctx.lineTo(12, 22);
      ctx.lineTo(3, 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#be2edd';
      ctx.beginPath();
      ctx.moveTo(12, 4);
      ctx.lineTo(19, 10);
      ctx.lineTo(12, 20);
      ctx.lineTo(5, 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 7, 3, 4);
    });

    // Turm-Icons
    create('icon_archer', 32, 32, (ctx) => {
      ctx.fillStyle = '#222f3e';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#576574';
      ctx.strokeRect(1, 1, 30, 30);
      ctx.fillStyle = '#feca57';
      ctx.fillRect(18, 4, 3, 24);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, 15, 16, 2);
    });

    create('icon_cannon', 32, 32, (ctx) => {
      ctx.fillStyle = '#222f3e';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#576574';
      ctx.strokeRect(1, 1, 30, 30);
      ctx.fillStyle = '#ee5253';
      ctx.fillRect(8, 10, 16, 12);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(12, 10, 2, 12);
    });

    create('icon_ice', 32, 32, (ctx) => {
      ctx.fillStyle = '#222f3e';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#576574';
      ctx.strokeRect(1, 1, 30, 30);
      ctx.fillStyle = '#48dbfb';
      ctx.beginPath();
      ctx.moveTo(16, 4);
      ctx.lineTo(26, 16);
      ctx.lineTo(16, 28);
      ctx.lineTo(6, 16);
      ctx.closePath();
      ctx.fill();
    });

    create('icon_poison', 32, 32, (ctx) => {
      ctx.fillStyle = '#222f3e';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#576574';
      ctx.strokeRect(1, 1, 30, 30);
      ctx.fillStyle = '#10ac84';
      ctx.beginPath();
      ctx.arc(16, 18, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1dd1a1';
      ctx.fillRect(14, 6, 4, 8);
    });

    create('icon_tesla', 32, 32, (ctx) => {
      ctx.fillStyle = '#222f3e';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#576574';
      ctx.strokeRect(1, 1, 30, 30);
      ctx.fillStyle = '#74b9ff';
      ctx.beginPath();
      ctx.arc(16, 12, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(14, 18, 4, 10);
    });

    create('icon_sniper', 32, 32, (ctx) => {
      ctx.fillStyle = '#222f3e';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#576574';
      ctx.strokeRect(1, 1, 30, 30);
      ctx.fillStyle = '#636e72';
      ctx.fillRect(14, 4, 4, 24);
      ctx.fillStyle = '#e84118';
      ctx.fillRect(15, 3, 2, 3);
    });

    // ==========================================
    // 2. KARTEN-TILES (40x40)
    // ==========================================
    // Standard Gras & Dirt Fallback
    create('tile_grass', 40, 40, (ctx) => {
      ctx.fillStyle = '#3f6728';
      ctx.fillRect(0, 0, 40, 40);
      ctx.fillStyle = '#518233';
      ctx.fillRect(4, 4, 10, 8);
      ctx.fillRect(20, 20, 14, 10);
      ctx.fillStyle = '#77b244';
      ctx.fillRect(8, 12, 2, 4);
      ctx.fillRect(26, 26, 2, 4);
    });

    create('tile_dirt', 40, 40, (ctx) => {
      ctx.fillStyle = '#7e5330';
      ctx.fillRect(0, 0, 40, 40);
      ctx.fillStyle = '#654124';
      ctx.fillRect(8, 0, 4, 40);
      ctx.fillRect(28, 0, 4, 40);
      ctx.fillStyle = '#9b6c43';
      ctx.fillRect(16, 10, 8, 4);
      ctx.fillRect(14, 26, 10, 4);
    });

    create('tile_tree', 40, 40, (ctx) => {
      ctx.fillStyle = '#4a2f1b';
      ctx.fillRect(17, 24, 6, 12);
      ctx.fillStyle = '#2d6323';
      ctx.beginPath();
      ctx.arc(20, 16, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#418632';
      ctx.beginPath();
      ctx.arc(18, 13, 10, 0, Math.PI * 2);
      ctx.fill();
    });

    create('tile_rock', 40, 40, (ctx) => {
      ctx.fillStyle = '#3a3a47';
      ctx.fillRect(10, 16, 20, 16);
      ctx.fillStyle = '#525263';
      ctx.fillRect(12, 14, 16, 16);
      ctx.fillStyle = '#737388';
      ctx.fillRect(14, 14, 10, 10);
    });

    // Hexenwelt
    create('tile_ground_witch', 40, 40, (ctx) => {
      ctx.fillStyle = '#223824';
      ctx.fillRect(0, 0, 40, 40);
      ctx.fillStyle = '#1c281e';
      ctx.fillRect(4, 4, 16, 12);
      ctx.fillRect(24, 20, 12, 16);
      ctx.fillStyle = '#2f4f34';
      ctx.fillRect(10, 10, 8, 8);
      ctx.fillStyle = '#4a2f54';
      ctx.fillRect(2, 26, 8, 10);
      ctx.fillStyle = '#8e44ad';
      ctx.fillRect(8, 22, 2, 2);
      ctx.fillRect(30, 8, 2, 2);
    });

    create('tile_path_witch', 40, 40, (ctx) => {
      ctx.fillStyle = '#3a2936';
      ctx.fillRect(0, 0, 40, 40);
      ctx.fillStyle = '#4d3748';
      ctx.fillRect(4, 0, 32, 40);
      ctx.fillStyle = '#2b1c28';
      ctx.fillRect(8, 10, 24, 4);
      ctx.fillRect(6, 26, 26, 4);
      ctx.fillStyle = '#9b59b6';
      ctx.fillRect(18, 6, 2, 2);
      ctx.fillRect(14, 20, 3, 2);
    });

    create('tile_decor_witch', 40, 40, (ctx) => {
      ctx.fillStyle = '#dcdde1';
      ctx.fillRect(17, 18, 6, 16);
      ctx.fillStyle = '#8e44ad';
      ctx.beginPath();
      ctx.arc(20, 18, 14, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(14, 10, 3, 3);
      ctx.fillRect(23, 9, 3, 3);
    });

    // Goblinhöhlen
    create('tile_ground_cave', 40, 40, (ctx) => {
      ctx.fillStyle = '#23222a';
      ctx.fillRect(0, 0, 40, 40);
      ctx.fillStyle = '#1a1920';
      ctx.fillRect(0, 0, 20, 20);
      ctx.fillRect(20, 20, 20, 20);
      ctx.fillStyle = '#34323d';
      ctx.fillRect(6, 8, 14, 6);
      ctx.fillRect(22, 26, 12, 8);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(14, 18, 2, 3);
    });

    create('tile_path_cave', 40, 40, (ctx) => {
      ctx.fillStyle = '#3d3023';
      ctx.fillRect(0, 0, 40, 40);
      ctx.fillStyle = '#5c4632';
      ctx.fillRect(4, 6, 32, 6);
      ctx.fillRect(4, 24, 32, 6);
      ctx.fillStyle = '#95a5a6';
      ctx.fillRect(10, 0, 3, 40);
      ctx.fillRect(27, 0, 3, 40);
    });

    create('tile_decor_cave', 40, 40, (ctx) => {
      ctx.fillStyle = '#d35400';
      ctx.beginPath();
      ctx.moveTo(20, 6);
      ctx.lineTo(28, 30);
      ctx.lineTo(12, 30);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(18, 12, 3, 14);
    });

    // Der Tote Berg
    create('tile_ground_mountain', 40, 40, (ctx) => {
      ctx.fillStyle = '#1f0d0d';
      ctx.fillRect(0, 0, 40, 40);
      ctx.fillStyle = '#2f1212';
      ctx.fillRect(6, 6, 28, 28);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(0, 18, 16, 3);
      ctx.fillRect(16, 26, 24, 3);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(15, 20, 2, 4);
    });

    create('tile_path_mountain', 40, 40, (ctx) => {
      ctx.fillStyle = '#3a1313';
      ctx.fillRect(0, 0, 40, 40);
      ctx.fillStyle = '#4a1c1c';
      ctx.fillRect(4, 0, 32, 40);
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(3, 0, 2, 40);
      ctx.fillRect(35, 0, 2, 40);
    });

    create('tile_decor_mountain', 40, 40, (ctx) => {
      ctx.fillStyle = '#180707';
      ctx.fillRect(8, 10, 24, 24);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(16, 12, 8, 16);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(18, 14, 4, 12);
    });

    // Portal & Burg
    create('tile_portal', 40, 40, (ctx) => {
      ctx.fillStyle = '#110b1a';
      ctx.fillRect(2, 2, 36, 36);
      ctx.fillStyle = '#8e44ad';
      ctx.beginPath();
      ctx.arc(20, 20, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(18, 18, 4, 4);
    });

    create('tile_castle', 40, 40, (ctx) => {
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(2, 6, 36, 30);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(6, 0, 6, 6);
      ctx.fillRect(17, 0, 6, 6);
      ctx.fillRect(28, 0, 6, 6);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(16, 16, 8, 10);
    });

    // ==========================================
    // 3. ALLE GEGNER-SPRITES (AUSNAHMSLOS)
    // ==========================================
    create('enemy_goblin', 32, 32, (ctx) => {
      ctx.fillStyle = '#4c8c30';
      ctx.fillRect(11, 14, 10, 10);
      ctx.fillStyle = '#5cb038';
      ctx.fillRect(10, 6, 12, 9);
      ctx.fillStyle = '#e53935';
      ctx.fillRect(12, 9, 2, 2);
      ctx.fillRect(18, 9, 2, 2);
    });

    create('enemy_bat', 32, 32, (ctx) => {
      ctx.fillStyle = '#2c1b3d';
      ctx.beginPath();
      ctx.moveTo(14, 14);
      ctx.lineTo(2, 6);
      ctx.lineTo(4, 18);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(18, 14);
      ctx.lineTo(30, 6);
      ctx.lineTo(28, 18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1e142b';
      ctx.fillRect(13, 10, 6, 10);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(14, 12, 1, 2);
      ctx.fillRect(17, 12, 1, 2);
    });

    create('enemy_witch', 32, 32, (ctx) => {
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(4, 21, 24, 3);
      ctx.fillStyle = '#6c5ce7';
      ctx.fillRect(10, 10, 12, 12);
      ctx.fillStyle = '#2d3436';
      ctx.beginPath();
      ctx.moveTo(16, 2);
      ctx.lineTo(24, 10);
      ctx.lineTo(8, 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#55efc4';
      ctx.fillRect(12, 10, 8, 5);
      ctx.fillStyle = '#d63031';
      ctx.fillRect(14, 11, 2, 2);
      ctx.fillRect(18, 11, 2, 2);
    });

    create('enemy_slime', 32, 32, (ctx) => {
      ctx.fillStyle = '#00b894';
      ctx.beginPath();
      ctx.arc(16, 20, 10, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(6, 20, 20, 6);
      ctx.fillStyle = '#ffeaa7';
      ctx.fillRect(10, 16, 3, 3);
      ctx.fillRect(19, 16, 3, 3);
    });

    create('enemy_swamp_troll', 32, 32, (ctx) => {
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(7, 10, 18, 15);
      ctx.fillStyle = '#006266';
      ctx.fillRect(9, 12, 14, 12);
      ctx.fillStyle = '#ff7675';
      ctx.fillRect(11, 14, 3, 2);
      ctx.fillRect(18, 14, 3, 2);
    });

    create('enemy_cave_goblin', 32, 32, (ctx) => {
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(10, 12, 12, 10);
      ctx.fillStyle = '#b8e994';
      ctx.fillRect(11, 6, 10, 7);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(10, 4, 12, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, 2, 4, 3);
    });

    create('enemy_bomber', 32, 32, (ctx) => {
      ctx.fillStyle = '#636e72';
      ctx.fillRect(11, 14, 10, 9);
      ctx.fillStyle = '#d63031';
      ctx.beginPath();
      ctx.arc(16, 10, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(15, 0, 2, 4);
    });

    create('enemy_orc', 32, 32, (ctx) => {
      ctx.fillStyle = '#4a5438';
      ctx.fillRect(8, 12, 16, 12);
      ctx.fillStyle = '#3a6634';
      ctx.fillRect(10, 4, 12, 9);
      ctx.fillStyle = '#4a4f56';
      ctx.fillRect(9, 3, 14, 4);
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(12, 7, 2, 2);
      ctx.fillRect(18, 7, 2, 2);
    });

    create('enemy_armored_troll', 32, 32, (ctx) => {
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(6, 8, 20, 18);
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(10, 12, 12, 8);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(12, 9, 2, 2);
      ctx.fillRect(18, 9, 2, 2);
    });

    create('enemy_golem', 32, 32, (ctx) => {
      ctx.fillStyle = '#4c5057';
      ctx.fillRect(5, 8, 22, 15);
      ctx.fillStyle = '#676c75';
      ctx.fillRect(7, 10, 18, 11);
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(12, 5, 2, 2);
      ctx.fillRect(18, 5, 2, 2);
    });

    create('enemy_fire_imp', 32, 32, (ctx) => {
      ctx.fillStyle = '#d63031';
      ctx.fillRect(11, 12, 10, 10);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(9, 4, 4, 6);
      ctx.fillRect(19, 4, 4, 6);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(13, 13, 2, 2);
      ctx.fillRect(17, 13, 2, 2);
    });

    create('enemy_magma_orc', 32, 32, (ctx) => {
      ctx.fillStyle = '#2c0c0c';
      ctx.fillRect(8, 10, 16, 14);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(10, 12, 12, 10);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(12, 14, 8, 4);
    });

    create('enemy_hellhound', 32, 32, (ctx) => {
      ctx.fillStyle = '#1e0505';
      ctx.fillRect(4, 14, 24, 10);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(6, 16, 20, 6);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(20, 13, 3, 2);
    });

    create('enemy_lava_golem', 36, 36, (ctx) => {
      ctx.fillStyle = '#110505';
      ctx.fillRect(4, 8, 28, 20);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(8, 10, 20, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, 14, 8, 8);
    });

    create('enemy_boss', 36, 36, (ctx) => {
      ctx.fillStyle = '#3a1f13';
      ctx.fillRect(6, 6, 24, 24);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(9, 10, 18, 14);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(13, 8, 2, 2);
      ctx.fillRect(21, 8, 2, 2);
      ctx.fillStyle = '#e8d8b5';
      ctx.fillRect(4, 2, 4, 6);
      ctx.fillRect(28, 2, 4, 6);
    });

    // ==========================================
    // 4. PROJEKTILE & EFFEKTE
    // ==========================================
    create('proj_arrow', 18, 6, (ctx) => {
      ctx.fillStyle = '#8d5b2d';
      ctx.fillRect(2, 2, 12, 2);
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(14, 1, 4, 4);
      ctx.fillStyle = '#e53935';
      ctx.fillRect(0, 0, 3, 2);
      ctx.fillRect(0, 4, 3, 2);
    });

    create('proj_cannonball', 12, 12, (ctx) => {
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(6, 6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, 3, 2, 2);
    });

    create('proj_ice', 14, 14, (ctx) => {
      ctx.fillStyle = '#00bcd4';
      ctx.beginPath();
      ctx.moveTo(7, 0);
      ctx.lineTo(14, 7);
      ctx.lineTo(7, 14);
      ctx.lineTo(0, 7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e0f7fa';
      ctx.fillRect(5, 5, 4, 4);
    });

    create('proj_poison', 12, 12, (ctx) => {
      ctx.fillStyle = '#10ac84';
      ctx.beginPath();
      ctx.arc(6, 6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1dd1a1';
      ctx.fillRect(4, 4, 3, 3);
    });

    create('proj_tesla', 16, 16, (ctx) => {
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(2, 6, 12, 4);
      ctx.fillStyle = '#74b9ff';
      ctx.fillRect(5, 3, 6, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 5, 2, 6);
    });

    create('proj_sniper', 20, 6, (ctx) => {
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(0, 2, 20, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(16, 1, 4, 4);
    });

    create('effect_hit', 16, 16, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 0, 4, 16);
      ctx.fillRect(0, 6, 16, 4);
    });

    create('effect_explosion', 48, 48, (ctx) => {
      ctx.fillStyle = 'rgba(255, 87, 34, 0.6)';
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd13b';
      ctx.beginPath();
      ctx.arc(24, 24, 12, 0, Math.PI * 2);
      ctx.fill();
    });

    create('effect_frost', 48, 48, (ctx) => {
      ctx.fillStyle = 'rgba(79, 195, 247, 0.45)';
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(23, 8, 2, 32);
      ctx.fillRect(8, 23, 32, 2);
    });

    create('effect_poison', 48, 48, (ctx) => {
      ctx.fillStyle = 'rgba(16, 172, 132, 0.45)';
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1dd1a1';
      ctx.fillRect(18, 18, 12, 12);
    });

    create('effect_lightning', 48, 48, (ctx) => {
      ctx.strokeStyle = '#74b9ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(4, 24);
      ctx.lineTo(24, 10);
      ctx.lineTo(44, 24);
      ctx.stroke();
    });

    // ==========================================
    // 5. TÜRMER-TEXTS (Stufe 1 bis 5 für 6 Typen)
    // ==========================================
    const towerTypes = ['archer', 'cannon', 'ice', 'poison', 'tesla', 'sniper'];

    towerTypes.forEach((type) => {
      for (let lvl = 1; lvl <= 5; lvl++) {
        const key = `tower_${type}_${lvl}`;
        create(key, 40, 40, (ctx) => {
          const baseBorder = lvl >= 4 ? '#f1c40f' : lvl >= 3 ? '#9b59b6' : '#576574';
          const baseColor = lvl === 5 ? '#222f3e' : '#341f97';

          ctx.fillStyle = '#1e272e';
          ctx.fillRect(4, 14, 32, 22);
          ctx.fillStyle = baseColor;
          ctx.fillRect(6, 16, 28, 18);

          if (lvl >= 2) {
            ctx.fillStyle = baseBorder;
            ctx.fillRect(4, 32, 32, 3);
          }
          if (lvl >= 4) {
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(4, 14, 4, 20);
            ctx.fillRect(32, 14, 4, 20);
          }

          if (type === 'archer') {
            ctx.fillStyle = lvl >= 3 ? '#10ac84' : '#2e86de';
            ctx.fillRect(15, 6, 10, 14);
            ctx.fillStyle = '#feca57';
            ctx.fillRect(23, 4, 4, 16);
            if (lvl >= 3) {
              ctx.fillStyle = '#1dd1a1';
              ctx.fillRect(13, 2, 14, 4);
            }
            if (lvl === 5) {
              ctx.fillStyle = '#ff9ff3';
              ctx.fillRect(17, 0, 6, 6);
            }
          } else if (type === 'cannon') {
            const tubeColor = lvl >= 4 ? '#222f3e' : lvl >= 3 ? '#ee5253' : '#576574';
            ctx.fillStyle = tubeColor;
            ctx.fillRect(12, 6 + (5 - lvl), 16, 16);
            ctx.fillStyle = '#111';
            ctx.fillRect(10, 4 + (5 - lvl), 20, 4);
            if (lvl >= 3) {
              ctx.fillStyle = '#f1c40f';
              ctx.fillRect(12, 12, 16, 3);
            }
            if (lvl === 5) {
              ctx.fillStyle = '#ff4757';
              ctx.fillRect(14, 5, 12, 3);
            }
          } else if (type === 'ice') {
            ctx.fillStyle = '#48dbfb';
            ctx.beginPath();
            ctx.moveTo(20, 2);
            ctx.lineTo(30, 16);
            ctx.lineTo(20, 26);
            ctx.lineTo(10, 16);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(18, 10, 4, 8);
          } else if (type === 'poison') {
            ctx.fillStyle = '#10ac84';
            ctx.fillRect(14, 10, 12, 16);
            ctx.beginPath();
            ctx.arc(20, 18, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1dd1a1';
            ctx.fillRect(17, 12, 6, 8);
          } else if (type === 'tesla') {
            ctx.fillStyle = '#0984e3';
            ctx.fillRect(18, 10, 4, 14);
            ctx.fillStyle = '#74b9ff';
            ctx.beginPath();
            ctx.arc(20, 8, 7, 0, Math.PI * 2);
            ctx.fill();
          } else if (type === 'sniper') {
            ctx.fillStyle = '#2d3436';
            ctx.fillRect(14, 8, 12, 16);
            ctx.fillStyle = '#636e72';
            ctx.fillRect(18, 0, 4, 20);
            ctx.fillStyle = '#e84118';
            ctx.fillRect(19, 0, 2, 2);
          }

          ctx.fillStyle = '#f1c40f';
          for (let s = 0; s < lvl; s++) {
            ctx.fillRect(8 + s * 5, 34, 3, 3);
          }
        });
      }
    });
  }
}
