import Phaser from 'phaser';

export class PixelTextureGenerator {
  public static generateAll(scene: Phaser.Scene): void {
    const tm = scene.textures;

    // Moderner Vektor- & Digital-Art Renderer (Vollständige Kantenglättung & Antialiasing)
    const create = (key: string, width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void) => {
      if (tm.exists(key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        drawFn(ctx);
        const tex = tm.addCanvas(key, canvas);
        if (tex) {
          tex.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }
      }
    };

    // ==========================================
    // 1. MODERNE HUD & SYSTEM ICONS
    // ==========================================
    create('icon_heart', 28, 28, (ctx) => {
      // 3D-Rubinherz mit Glanzreflex
      const grad = ctx.createRadialGradient(11, 10, 2, 14, 14, 14);
      grad.addColorStop(0, '#ff6b81');
      grad.addColorStop(0.5, '#ee5253');
      grad.addColorStop(1, '#a31728');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(14, 25);
      ctx.bezierCurveTo(2, 16, 1, 5, 8, 4);
      ctx.bezierCurveTo(12, 4, 14, 8, 14, 8);
      ctx.bezierCurveTo(14, 8, 16, 4, 20, 4);
      ctx.bezierCurveTo(27, 5, 26, 16, 14, 25);
      ctx.closePath();
      ctx.fill();

      // Weicher Glanzreflex oben links
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.ellipse(9, 8, 4, 2.5, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    });

    create('icon_gold', 28, 28, (ctx) => {
      // Glänzende Goldmünze mit Riffelrand & Stern
      const grad = ctx.createLinearGradient(4, 4, 24, 24);
      grad.addColorStop(0, '#ffeaa7');
      grad.addColorStop(0.3, '#fdcb6e');
      grad.addColorStop(0.7, '#e17055');
      grad.addColorStop(1, '#b55829');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(14, 14, 12, 0, Math.PI * 2);
      ctx.fill();

      // Innenkreis mit Prägung
      ctx.strokeStyle = '#fff2a7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(14, 14, 9, 0, Math.PI * 2);
      ctx.stroke();

      // Goldstern-Prägung
      ctx.fillStyle = '#fff9d2';
      ctx.beginPath();
      ctx.arc(14, 14, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    create('icon_wave', 28, 28, (ctx) => {
      // Epische Schlacht-Totenkopf-Emblem
      const grad = ctx.createLinearGradient(0, 4, 0, 24);
      grad.addColorStop(0, '#f1f2f6');
      grad.addColorStop(0.7, '#ced6e0');
      grad.addColorStop(1, '#747d8c');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(14, 11, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(10, 15, 8, 6);

      // Augenhöhlen
      ctx.fillStyle = '#1e1b29';
      ctx.beginPath();
      ctx.arc(11, 11, 2.5, 0, Math.PI * 2);
      ctx.arc(17, 11, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    create('icon_crystal', 28, 28, (ctx) => {
      // Magischer Prismen-Kristall mit Schimmer
      const grad = ctx.createLinearGradient(4, 4, 24, 24);
      grad.addColorStop(0, '#74b9ff');
      grad.addColorStop(0.4, '#a29bfe');
      grad.addColorStop(0.8, '#e056fd');
      grad.addColorStop(1, '#6c5ce7');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(14, 3);
      ctx.lineTo(24, 11);
      ctx.lineTo(14, 25);
      ctx.lineTo(4, 11);
      ctx.closePath();
      ctx.fill();

      // Lichtfacette
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.moveTo(14, 3);
      ctx.lineTo(14, 25);
      ctx.lineTo(4, 11);
      ctx.closePath();
      ctx.fill();
    });

    // ==========================================
    // 2. MODERNE TURM-ICONS (Kaufleiste)
    // ==========================================
    create('icon_archer', 36, 36, (ctx) => {
      // Vektor-Balliste / Bogen
      ctx.fillStyle = '#1b1424';
      ctx.beginPath();
      ctx.arc(18, 18, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#e67e22';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(16, 18, 11, -Math.PI / 2.3, Math.PI / 2.3);
      ctx.stroke();

      // Bogensehne & Pfeil
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(12, 8);
      ctx.lineTo(12, 28);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(9, 18);
      ctx.lineTo(26, 18);
      ctx.stroke();
    });

    create('icon_cannon', 36, 36, (ctx) => {
      ctx.fillStyle = '#1b1424';
      ctx.beginPath();
      ctx.arc(18, 18, 16, 0, Math.PI * 2);
      ctx.fill();

      // Schweres Bronzerohr
      const tubeGrad = ctx.createLinearGradient(10, 10, 26, 26);
      tubeGrad.addColorStop(0, '#95a5a6');
      tubeGrad.addColorStop(0.5, '#34495e');
      tubeGrad.addColorStop(1, '#1e272e');

      ctx.fillStyle = tubeGrad;
      ctx.save();
      ctx.translate(18, 18);
      ctx.rotate(-Math.PI / 4);
      ctx.fillRect(-6, -12, 12, 22);
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(-7, -13, 14, 4);
      ctx.restore();
    });

    create('icon_ice', 36, 36, (ctx) => {
      ctx.fillStyle = '#1b1424';
      ctx.beginPath();
      ctx.arc(18, 18, 16, 0, Math.PI * 2);
      ctx.fill();

      const grad = ctx.createLinearGradient(10, 6, 26, 26);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#74b9ff');
      grad.addColorStop(1, '#0984e3');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(18, 6);
      ctx.lineTo(26, 18);
      ctx.lineTo(18, 30);
      ctx.lineTo(10, 18);
      ctx.closePath();
      ctx.fill();
    });

    create('icon_poison', 36, 36, (ctx) => {
      ctx.fillStyle = '#1b1424';
      ctx.beginPath();
      ctx.arc(18, 18, 16, 0, Math.PI * 2);
      ctx.fill();

      // Gift-Alchemiekolben
      const flaskGrad = ctx.createRadialGradient(18, 20, 2, 18, 20, 10);
      flaskGrad.addColorStop(0, '#55efc4');
      flaskGrad.addColorStop(0.7, '#00b894');
      flaskGrad.addColorStop(1, '#006266');

      ctx.fillStyle = flaskGrad;
      ctx.beginPath();
      ctx.arc(18, 21, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(15, 9, 6, 8);
    });

    create('icon_tesla', 36, 36, (ctx) => {
      ctx.fillStyle = '#1b1424';
      ctx.beginPath();
      ctx.arc(18, 18, 16, 0, Math.PI * 2);
      ctx.fill();

      // Plasma-Pylon mit Blitz
      ctx.fillStyle = '#0984e3';
      ctx.beginPath();
      ctx.arc(18, 13, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#55efc4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(19, 8);
      ctx.lineTo(15, 14);
      ctx.lineTo(20, 15);
      ctx.lineTo(16, 22);
      ctx.stroke();
    });

    create('icon_sniper', 36, 36, (ctx) => {
      ctx.fillStyle = '#1b1424';
      ctx.beginPath();
      ctx.arc(18, 18, 16, 0, Math.PI * 2);
      ctx.fill();

      // Fadenkreuz & Präzisionslauf
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(18, 18, 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(18, 5); ctx.lineTo(18, 31);
      ctx.moveTo(5, 18); ctx.lineTo(31, 18);
      ctx.stroke();
    });

    // ==========================================
    // 3. MODERNER UNTERGRUND & PFADE (SCI-FI / RTS ÄSTHETIK)
    // ==========================================
    create('tile_ground_witch', 40, 40, (ctx) => {
      // Dunkler Neosteel- / Alien-Boden mit dezentem Hexagonal-Tech-Muster
      const grad = ctx.createLinearGradient(0, 0, 40, 40);
      grad.addColorStop(0, '#0c1322');
      grad.addColorStop(0.5, '#111a2e');
      grad.addColorStop(1, '#080d17');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 40, 40);

      // Subtile Tech-Panel-Fugen
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
      ctx.lineWidth = 1;
      ctx.strokeRect(1, 1, 38, 38);

      // Feines Cyber-Schaltkreis-Segment
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.18)';
      ctx.beginPath();
      ctx.moveTo(8, 20);
      ctx.lineTo(20, 20);
      ctx.lineTo(26, 14);
      ctx.stroke();

      // Mikro-Lichtsensor-Knoten
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(26, 14, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Dezent leuchtende Alien-Biolumineszenz-Spore
      ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
      ctx.beginPath();
      ctx.arc(32, 30, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    create('tile_path_witch', 40, 40, (ctx) => {
      // Schwerer Neosteel-Aufmarschpfad mit leuchtenden Cyan-Führungsstreifen
      ctx.fillStyle = '#090e18';
      ctx.fillRect(0, 0, 40, 40);

      // Zentrale titanverstärkte Lauffläche
      const plateGrad = ctx.createLinearGradient(0, 0, 40, 0);
      plateGrad.addColorStop(0, '#151e30');
      plateGrad.addColorStop(0.5, '#1e293b');
      plateGrad.addColorStop(1, '#151e30');
      ctx.fillStyle = plateGrad;
      ctx.fillRect(4, 0, 32, 40);

      // Querverstrebungen / Dehnungsfugen
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(4, 10, 32, 2);
      ctx.fillRect(4, 20, 32, 2);
      ctx.fillRect(4, 30, 32, 2);

      // Beidseitige leuchtende Cyan-Navigationsspuren
      const cyanGlow = ctx.createLinearGradient(0, 0, 0, 40);
      cyanGlow.addColorStop(0, '#38bdf8');
      cyanGlow.addColorStop(0.5, '#0284c7');
      cyanGlow.addColorStop(1, '#38bdf8');
      ctx.fillStyle = cyanGlow;
      ctx.fillRect(2, 0, 2, 40);
      ctx.fillRect(36, 0, 2, 40);

      // Gelbe Warn-Pfeilmarkierung in der Mitte
      ctx.fillStyle = 'rgba(250, 204, 21, 0.55)';
      ctx.beginPath();
      ctx.moveTo(17, 24);
      ctx.lineTo(20, 21);
      ctx.lineTo(23, 24);
      ctx.lineTo(21, 24);
      ctx.lineTo(21, 27);
      ctx.lineTo(19, 27);
      ctx.lineTo(19, 24);
      ctx.closePath();
      ctx.fill();
    });

    create('tile_decor_witch', 40, 40, (ctx) => {
      // Sanft leuchtende Pilzgruppe
      ctx.fillStyle = '#dfe4ea';
      ctx.beginPath();
      ctx.ellipse(20, 26, 3, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      const capGrad = ctx.createRadialGradient(20, 16, 2, 20, 16, 12);
      capGrad.addColorStop(0, '#e056fd');
      capGrad.addColorStop(0.7, '#8e44ad');
      capGrad.addColorStop(1, '#481c5c');

      ctx.fillStyle = capGrad;
      ctx.beginPath();
      ctx.arc(20, 18, 12, Math.PI, 0);
      ctx.closePath();
      ctx.fill();

      // Leuchtpunkte
      ctx.fillStyle = '#55efc4';
      ctx.beginPath();
      ctx.arc(15, 13, 1.8, 0, Math.PI * 2);
      ctx.arc(22, 11, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });

    create('tile_ground_cave', 40, 40, (ctx) => {
      // Subterraner Schiefer mit Kristallglanz
      const grad = ctx.createRadialGradient(20, 20, 4, 20, 20, 25);
      grad.addColorStop(0, '#2f3542');
      grad.addColorStop(0.7, '#222731');
      grad.addColorStop(1, '#161920');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 40, 40);

      // Glänzende Azurit-Ader
      ctx.strokeStyle = '#00d2d3';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, 28);
      ctx.lineTo(16, 24);
      ctx.lineTo(24, 30);
      ctx.stroke();
    });

    create('tile_path_cave', 40, 40, (ctx) => {
      // Unterirdisches Schottergleisbett
      ctx.fillStyle = '#1c1714';
      ctx.fillRect(0, 0, 40, 40);

      // Schotter
      ctx.fillStyle = '#2d251f';
      ctx.fillRect(3, 3, 34, 34);

      // Schwellen
      const ties = [2, 12, 22, 32];
      ties.forEach((ty) => {
        ctx.fillStyle = '#4e3828';
        ctx.fillRect(4, ty, 32, 6);
      });

      // Schienen
      ctx.fillStyle = '#a4b0be';
      ctx.fillRect(10, 0, 3, 40);
      ctx.fillRect(27, 0, 3, 40);
      ctx.fillStyle = '#dfe4ea';
      ctx.fillRect(11, 0, 1, 40);
      ctx.fillRect(28, 0, 1, 40);
    });

    create('tile_decor_cave', 40, 40, (ctx) => {
      // Kristallmonolith
      const grad = ctx.createLinearGradient(12, 6, 28, 32);
      grad.addColorStop(0, '#f1c40f');
      grad.addColorStop(0.5, '#e67e22');
      grad.addColorStop(1, '#d35400');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(20, 4);
      ctx.lineTo(29, 32);
      ctx.lineTo(11, 32);
      ctx.closePath();
      ctx.fill();
    });

    create('tile_ground_mountain', 40, 40, (ctx) => {
      // Obsidian-Fels mit Magmaglimmen
      const grad = ctx.createLinearGradient(0, 0, 40, 40);
      grad.addColorStop(0, '#2c1417');
      grad.addColorStop(0.6, '#1d0c0e');
      grad.addColorStop(1, '#110507');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 40, 40);

      // Glühender Magmariss
      ctx.strokeStyle = '#ff4757';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(6, 26);
      ctx.lineTo(16, 22);
      ctx.lineTo(28, 28);
      ctx.stroke();

      ctx.strokeStyle = '#ffa502';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    create('tile_path_mountain', 40, 40, (ctx) => {
      ctx.fillStyle = '#170608';
      ctx.fillRect(0, 0, 40, 40);

      // Lavarinnen
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(1, 0, 4, 40);
      ctx.fillRect(35, 0, 4, 40);
      ctx.fillStyle = '#ffa502';
      ctx.fillRect(2, 0, 2, 40);
      ctx.fillRect(36, 0, 2, 40);

      // Obsidian-Straßenplatten
      const slabY = [2, 12, 22, 32];
      slabY.forEach((sy) => {
        ctx.fillStyle = '#381c20';
        ctx.fillRect(6, sy, 28, 8);
      });
    });

    create('tile_decor_mountain', 40, 40, (ctx) => {
      // Vulkankegel
      ctx.fillStyle = '#1e0c0f';
      ctx.beginPath();
      ctx.moveTo(10, 34);
      ctx.lineTo(15, 12);
      ctx.lineTo(25, 12);
      ctx.lineTo(30, 34);
      ctx.closePath();
      ctx.fill();

      // Glühender Krater
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.ellipse(20, 12, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    create('tile_ground_dungeon', 40, 40, (ctx) => {
      // Dunkle gotische Kerkerplatten mit antiken Fugen
      ctx.fillStyle = '#120b1f';
      ctx.fillRect(0, 0, 40, 40);

      ctx.fillStyle = '#1b122e';
      ctx.fillRect(1, 1, 18, 18);
      ctx.fillRect(21, 1, 18, 18);
      ctx.fillRect(1, 21, 18, 18);
      ctx.fillRect(21, 21, 18, 18);

      ctx.strokeStyle = '#090410';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, 39, 39);
      ctx.beginPath();
      ctx.moveTo(20, 0); ctx.lineTo(20, 40);
      ctx.moveTo(0, 20); ctx.lineTo(40, 20);
      ctx.stroke();

      // Zarte arkane Runenfurche
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(6, 14); ctx.lineTo(14, 6); ctx.lineTo(14, 14);
      ctx.stroke();
    });

    create('tile_path_dungeon', 40, 40, (ctx) => {
      // Dunkler Kerkergang mit Runenkristall
      ctx.fillStyle = '#0a0514';
      ctx.fillRect(0, 0, 40, 40);

      // Feste Kanten
      ctx.fillStyle = '#311054';
      ctx.fillRect(0, 0, 3, 40);
      ctx.fillRect(37, 0, 3, 40);

      const slabs = [2, 12, 22, 32];
      slabs.forEach((sy, i) => {
        ctx.fillStyle = i % 2 === 0 ? '#1f1335' : '#271743';
        ctx.fillRect(4, sy, 32, 8);
      });

      // Leuchtende magische Weg-Rune
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(20, 20, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    create('tile_decor_dungeon', 40, 40, (ctx) => {
      // Dungeon-Säule
      ctx.fillStyle = '#1c1030';
      ctx.fillRect(10, 6, 20, 28);
      ctx.strokeStyle = '#4c1d95';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(10, 6, 20, 28);

      const grad = ctx.createRadialGradient(20, 14, 1, 20, 14, 8);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#c084fc');
      grad.addColorStop(0.8, '#7e22ce');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(20, 14, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // ==========================================
    // 4. WEHENDES GRAS (MODERNE VEKTOR-HALME)
    // ==========================================
    create('decor_grass_tuft_1', 26, 26, (ctx) => {
      // Weiche, geschwungene Grashalme mit Farbverlauf
      const grad = ctx.createLinearGradient(0, 26, 0, 4);
      grad.addColorStop(0, '#1e824c');
      grad.addColorStop(0.6, '#2ecc71');
      grad.addColorStop(1, '#a8e6cf');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(13, 25);
      ctx.quadraticCurveTo(8, 14, 5, 5);
      ctx.quadraticCurveTo(10, 14, 13, 25);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(13, 25);
      ctx.quadraticCurveTo(13, 10, 13, 2);
      ctx.quadraticCurveTo(15, 10, 13, 25);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(13, 25);
      ctx.quadraticCurveTo(18, 14, 21, 6);
      ctx.quadraticCurveTo(16, 14, 13, 25);
      ctx.fill();
    });

    create('decor_grass_tuft_2', 26, 26, (ctx) => {
      // Grasbüschel mit zarter Blume
      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.moveTo(13, 25);
      ctx.quadraticCurveTo(7, 12, 4, 6);
      ctx.quadraticCurveTo(11, 14, 13, 25);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(13, 25);
      ctx.quadraticCurveTo(19, 12, 22, 7);
      ctx.quadraticCurveTo(15, 14, 13, 25);
      ctx.fill();

      // Gelbe Margerite
      ctx.fillStyle = '#ffd32a';
      ctx.beginPath();
      ctx.arc(13, 9, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(13, 9, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    create('decor_grass_tuft_3', 26, 26, (ctx) => {
      // Kleiner Wald-Farn
      ctx.fillStyle = '#16a085';
      ctx.beginPath();
      ctx.moveTo(13, 25);
      ctx.quadraticCurveTo(5, 14, 3, 10);
      ctx.quadraticCurveTo(10, 16, 13, 25);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(13, 25);
      ctx.quadraticCurveTo(21, 14, 23, 10);
      ctx.quadraticCurveTo(16, 16, 13, 25);
      ctx.fill();
    });

    // ==========================================
    // 4b. SCI-FI REQUISITEN: ENERGIE-PYLONEN, KRISTALLE, KÜHLVENTS & DRONES
    // ==========================================

    // Taktischer Energie-Pylon / Plasma-Relais (ersetzt alten Laubbaum)
    create('decor_tree_oak', 46, 56, (ctx) => {
      // Bodenschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(23, 51, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tripod-Basis aus Neosteel
      const baseGrad = ctx.createLinearGradient(12, 38, 34, 52);
      baseGrad.addColorStop(0, '#334155');
      baseGrad.addColorStop(0.5, '#1e293b');
      baseGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.moveTo(23, 32);
      ctx.lineTo(34, 50);
      ctx.lineTo(28, 52);
      ctx.lineTo(23, 44);
      ctx.lineTo(18, 52);
      ctx.lineTo(12, 50);
      ctx.closePath();
      ctx.fill();

      // Pylonen-Kernsäule (Vertikaler Generator)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, 14, 6, 26);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 14, 6, 26);

      // Leuchtender Plasma-Energiekern (Cyan Puls)
      const coreGrad = ctx.createLinearGradient(0, 16, 0, 36);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, '#38bdf8');
      coreGrad.addColorStop(0.7, '#0284c7');
      coreGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = coreGrad;
      ctx.fillRect(21.5, 17, 3, 20);

      // Schwebende Energie-Fokus-Spitze
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(23, 4);
      ctx.lineTo(27, 13);
      ctx.lineTo(19, 13);
      ctx.closePath();
      ctx.fill();

      // Rote Status-LED / Beacon
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(23, 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // StarCraft Khaydarin-Mineralien-Kristallspitze (ersetzt Tanne)
    create('decor_tree_pine', 40, 56, (ctx) => {
      // Bodenschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(20, 52, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dunkle geologische Kristallsockel-Felsen
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(10, 51);
      ctx.lineTo(14, 44);
      ctx.lineTo(26, 44);
      ctx.lineTo(31, 51);
      ctx.closePath();
      ctx.fill();

      // Große zentrale Kristallspitze (StarCraft Blue Minerals)
      const c1Grad = ctx.createLinearGradient(8, 12, 28, 48);
      c1Grad.addColorStop(0, '#e0f2fe');
      c1Grad.addColorStop(0.2, '#7dd3fc');
      c1Grad.addColorStop(0.6, '#0284c7');
      c1Grad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = c1Grad;
      ctx.beginPath();
      ctx.moveTo(20, 4);
      ctx.lineTo(26, 26);
      ctx.lineTo(23, 48);
      ctx.lineTo(17, 48);
      ctx.lineTo(14, 24);
      ctx.closePath();
      ctx.fill();

      // Lichtkante / Facette
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(20, 4);
      ctx.lineTo(20, 48);
      ctx.stroke();

      // Zweite kleinere Kristallspitze links
      const c2Grad = ctx.createLinearGradient(6, 20, 16, 46);
      c2Grad.addColorStop(0, '#38bdf8');
      c2Grad.addColorStop(0.7, '#0369a1');
      c2Grad.addColorStop(1, '#082f49');
      ctx.fillStyle = c2Grad;
      ctx.beginPath();
      ctx.moveTo(12, 18);
      ctx.lineTo(17, 34);
      ctx.lineTo(15, 48);
      ctx.lineTo(9, 48);
      ctx.lineTo(7, 32);
      ctx.closePath();
      ctx.fill();

      // Dritte Kristallspitze rechts
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(28, 22);
      ctx.lineTo(33, 36);
      ctx.lineTo(30, 49);
      ctx.lineTo(25, 49);
      ctx.lineTo(24, 34);
      ctx.closePath();
      ctx.fill();
    });

    // Industrieller Thermal-Kühlvent / Auslass (ersetzt toten Baum)
    create('decor_tree_dead', 42, 54, (ctx) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(21, 50, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Zylindrischer Industrieschacht
      const tubeGrad = ctx.createLinearGradient(12, 0, 30, 0);
      tubeGrad.addColorStop(0, '#1e293b');
      tubeGrad.addColorStop(0.5, '#334155');
      tubeGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = tubeGrad;
      ctx.fillRect(15, 20, 12, 28);

      // Hitzegitter mit glühender Orange/Rot-Emission
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(17, 14, 8, 8);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(19, 16, 4, 4);

      // Dampfrohr-Arme
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(15, 28);
      ctx.lineTo(8, 22);
      ctx.lineTo(8, 14);
      ctx.moveTo(27, 28);
      ctx.lineTo(34, 22);
      ctx.lineTo(34, 14);
      ctx.stroke();

      // Hitzewarn-LEDs
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(8, 12, 1.5, 0, Math.PI * 2);
      ctx.arc(34, 12, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Stalagmit-Säule (Goblinhöhle)
    create('decor_stalagmite_huge', 38, 54, (ctx) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(19, 50, 13, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      const g = ctx.createLinearGradient(12, 6, 26, 50);
      g.addColorStop(0, '#57606f');
      g.addColorStop(0.5, '#2f3542');
      g.addColorStop(1, '#1e272e');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(19, 4);
      ctx.lineTo(30, 48);
      ctx.lineTo(8, 48);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#00d2d3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(19, 10);
      ctx.lineTo(22, 28);
      ctx.lineTo(17, 44);
      ctx.stroke();
    });

    // Felsbrocken Granit mit Moos
    create('decor_rock_granite', 38, 30, (ctx) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(19, 26, 15, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      const g = ctx.createLinearGradient(6, 4, 32, 28);
      g.addColorStop(0, '#747d8c');
      g.addColorStop(0.6, '#4f5663');
      g.addColorStop(1, '#2f3542');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(8, 22);
      ctx.lineTo(12, 8);
      ctx.lineTo(25, 6);
      ctx.lineTo(32, 16);
      ctx.lineTo(29, 25);
      ctx.lineTo(14, 26);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#2ed573';
      ctx.beginPath();
      ctx.ellipse(18, 9, 8, 3.5, -0.1, 0, Math.PI * 2);
      ctx.fill();
    });

    // Felsbrocken mit Erz
    create('decor_rock_ore', 38, 30, (ctx) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(19, 26, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2d3436';
      ctx.beginPath();
      ctx.moveTo(8, 24);
      ctx.lineTo(11, 7);
      ctx.lineTo(27, 7);
      ctx.lineTo(31, 23);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(14, 12, 4, 4);
      ctx.fillRect(23, 16, 3, 3);
      ctx.fillStyle = '#be2edd';
      ctx.fillRect(19, 10, 3, 3);
    });

    // Vulkanfels mit Lava-Adern
    create('decor_rock_volcanic', 38, 30, (ctx) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(19, 26, 15, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e0c0f';
      ctx.beginPath();
      ctx.moveTo(7, 24);
      ctx.lineTo(13, 6);
      ctx.lineTo(26, 7);
      ctx.lineTo(33, 24);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ff4757';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(14, 10);
      ctx.lineTo(19, 18);
      ctx.lineTo(27, 20);
      ctx.stroke();
    });

    // Supraleitender Plasma-Energieleiter (ersetzt Wasserbach)
    create('decor_water_stream_h', 40, 40, (ctx) => {
      // Dunkle Panzerschacht-Bettung
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 4, 40, 32);

      // Titan-Schienenkanten oben und unten
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 4, 40, 4);
      ctx.fillRect(0, 32, 40, 4);

      // Fließender hochenergetischer Plasma-Strom
      const g = ctx.createLinearGradient(0, 8, 0, 32);
      g.addColorStop(0, '#0369a1');
      g.addColorStop(0.2, '#0284c7');
      g.addColorStop(0.5, '#38bdf8');
      g.addColorStop(0.8, '#0284c7');
      g.addColorStop(1, '#0369a1');
      ctx.fillStyle = g;
      ctx.fillRect(0, 8, 40, 24);

      // Zentrale Lichtbogen-Führung
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(12, 18);
      ctx.lineTo(24, 22);
      ctx.lineTo(40, 20);
      ctx.stroke();

      // Magnet-Stabilisatoren
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(8, 4, 3, 4);
      ctx.fillRect(28, 4, 3, 4);
      ctx.fillRect(18, 32, 3, 4);
    });

    // Magnetischer Induktionsknoten / Plasma-Koppler (ersetzt Seerose)
    create('decor_water_lily', 24, 24, (ctx) => {
      // Äußerer Magnetring
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(12, 12, 9, 0, Math.PI * 2);
      ctx.stroke();

      // Innerer leuchtender Plasma-Knoten
      const nodeGrad = ctx.createRadialGradient(12, 12, 1, 12, 12, 6);
      nodeGrad.addColorStop(0, '#ffffff');
      nodeGrad.addColorStop(0.5, '#38bdf8');
      nodeGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = nodeGrad;
      ctx.beginPath();
      ctx.arc(12, 12, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Mikro-Emitter-Zentrum
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(12, 12, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // ==========================================
    // MONUMENTALE SCI-FI LANDMARKEN
    // ==========================================
    create('landmark_radar_relay', 56, 56, (ctx) => {
      // 1. Bodenschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(28, 48, 24, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Beton-Verstärkter Sockel
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(16, 36, 24, 14);
      ctx.fillStyle = '#334155';
      ctx.fillRect(18, 38, 20, 10);

      // 3. Dreibein-Stützgerüst
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(18, 38); ctx.lineTo(28, 20); ctx.lineTo(38, 38);
      ctx.stroke();

      // 4. Parabol-Radarantenne
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(28, 16, 15, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();

      // 5. Signallinse & Emitter
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(28, 16, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(28, 16, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    create('landmark_power_generator', 56, 56, (ctx) => {
      // Fusion Plasma Generator mit Reaktor-Kühlern
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(28, 48, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Panzer-Chassis mit Warnstreifen
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(12, 22, 32, 26);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(12, 44, 32, 4);

      // Kühltürme links und rechts
      ctx.fillStyle = '#334155';
      ctx.fillRect(8, 18, 7, 28);
      ctx.fillRect(41, 18, 7, 28);

      // Glühender Fusions-Plasmakern
      const coreGrad = ctx.createRadialGradient(28, 32, 2, 28, 32, 10);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, '#38bdf8');
      coreGrad.addColorStop(0.8, '#0369a1');
      coreGrad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(28, 32, 9, 0, Math.PI * 2);
      ctx.fill();

      // Reaktorgitter
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 24, 16, 16);
    });

    create('landmark_alien_obelisk', 48, 64, (ctx) => {
      // Schwebender Xeno-Monolith mit astralen Runen
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(24, 58, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Obsidian-Monolith
      const obGrad = ctx.createLinearGradient(12, 6, 36, 52);
      obGrad.addColorStop(0, '#1e1b4b');
      obGrad.addColorStop(0.5, '#0f172a');
      obGrad.addColorStop(1, '#020617');
      ctx.fillStyle = obGrad;
      ctx.beginPath();
      ctx.moveTo(24, 4); ctx.lineTo(36, 16); ctx.lineTo(34, 52); ctx.lineTo(24, 56); ctx.lineTo(14, 52); ctx.lineTo(12, 16);
      ctx.closePath();
      ctx.fill();

      // Psionisch leuchtende Runenfugen
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(24, 8); ctx.lineTo(24, 50);
      ctx.moveTo(18, 24); ctx.lineTo(30, 24);
      ctx.moveTo(16, 36); ctx.lineTo(32, 36);
      ctx.stroke();

      // Schwebende Kristallsphäre
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(24, 24, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    create('landmark_mech_hangar', 64, 52, (ctx) => {
      // Schwerer Terran Mech Bunker & Reparaturhangar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(32, 46, 28, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Titan-Bunkerkörper
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(8, 14, 48, 32);

      // Panzertor mit Warnstreifen
      ctx.fillStyle = '#090d16';
      ctx.fillRect(18, 22, 28, 24);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(18, 20, 28, 2.5);

      // Hydraulikkran / Dach-Uplink
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(14, 14); ctx.lineTo(24, 4); ctx.lineTo(40, 4); ctx.lineTo(50, 14);
      ctx.stroke();

      // Statusleuchten
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(14, 24, 2.5, 2.5);
      ctx.fillRect(47, 24, 2.5, 2.5);
    });

    // Taktische Aufklärungs-Drohne (SC2 Scout Drone - ersetzt altes Wald-Kaninchen)
    create('critter_rabbit', 24, 22, (ctx) => {
      // Schwebeschatten am Boden
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(12, 19, 9, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Drohnen-Rumpf (Aerodynamisches Neosteel/Karbon)
      const hullGrad = ctx.createLinearGradient(4, 4, 20, 16);
      hullGrad.addColorStop(0, '#334155');
      hullGrad.addColorStop(0.5, '#1e293b');
      hullGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = hullGrad;
      ctx.beginPath();
      ctx.moveTo(12, 4);
      ctx.lineTo(21, 10);
      ctx.lineTo(18, 16);
      ctx.lineTo(6, 16);
      ctx.lineTo(3, 10);
      ctx.closePath();
      ctx.fill();

      // Ionen-Schubdüsen hinten (Cyan Flammen)
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(5, 15, 3, 3);
      ctx.fillRect(16, 15, 3, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 15, 1, 2);
      ctx.fillRect(17, 15, 1, 2);

      // Leuchtendes Scanner-Visier vorne (Cyan Sensorlinie)
      const opticGrad = ctx.createLinearGradient(7, 8, 17, 8);
      opticGrad.addColorStop(0, '#0284c7');
      opticGrad.addColorStop(0.5, '#38bdf8');
      opticGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = opticGrad;
      ctx.fillRect(8, 8, 8, 2.5);

      // Status-Beacon oben
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(12, 5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Orbital-Mikrosonde / Plasma-Funke (ersetzt Wald-Schmetterling)
    create('critter_butterfly', 22, 22, (ctx) => {
      // Äußerer gyroskopischer Magnetring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(11, 11, 8.5, 0, Math.PI * 2);
      ctx.stroke();

      // Leuchtender Plasma-Wisp Kern
      const coreGrad = ctx.createRadialGradient(11, 11, 1, 11, 11, 6);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, '#38bdf8');
      coreGrad.addColorStop(0.8, '#0284c7');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(11, 11, 6, 0, Math.PI * 2);
      ctx.fill();

      // Orbitale Energie-Funken
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(4, 7, 1.2, 0, Math.PI * 2);
      ctx.arc(18, 15, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Stealth Raven-UAV Aufklärer (ersetzt Höhlen-Fledermaus)
    create('critter_bat', 24, 18, (ctx) => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(12, 3);
      ctx.lineTo(23, 11);
      ctx.lineTo(16, 14);
      ctx.lineTo(12, 12);
      ctx.lineTo(8, 14);
      ctx.lineTo(1, 11);
      ctx.closePath();
      ctx.fill();

      // Rotes Zielsuch-Auge
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(11, 5, 2, 2);

      // Micro-Thruster
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(11, 12, 2, 2);
    });

    // Feuer-Salamander
    create('critter_salamander', 24, 16, (ctx) => {
      ctx.fillStyle = '#1a0d0d';
      ctx.beginPath();
      ctx.ellipse(12, 8, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#1a0d0d';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(5, 8);
      ctx.quadraticCurveTo(2, 6, 0, 10);
      ctx.stroke();

      ctx.fillStyle = '#ff9f43';
      ctx.beginPath();
      ctx.arc(9, 7, 1.3, 0, Math.PI * 2);
      ctx.arc(13, 8, 1.5, 0, Math.PI * 2);
      ctx.arc(16, 7, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Krabbelnde Dungeon-Spinne
    create('critter_spider', 22, 22, (ctx) => {
      // Körper
      ctx.fillStyle = '#1c102a';
      ctx.beginPath();
      ctx.ellipse(11, 11, 4.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rote Augen
      ctx.fillStyle = '#ff3838';
      ctx.fillRect(13, 9, 1.5, 1.5);
      ctx.fillRect(13, 11, 1.5, 1.5);

      // 8 Beine
      ctx.strokeStyle = '#3d2556';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(11, 8); ctx.lineTo(5, 5);
      ctx.moveTo(11, 10); ctx.lineTo(4, 10);
      ctx.moveTo(11, 12); ctx.lineTo(4, 13);
      ctx.moveTo(11, 14); ctx.lineTo(5, 18);
      ctx.moveTo(11, 8); ctx.lineTo(17, 5);
      ctx.moveTo(11, 10); ctx.lineTo(18, 10);
      ctx.moveTo(11, 12); ctx.lineTo(18, 13);
      ctx.moveTo(11, 14); ctx.lineTo(17, 18);
      ctx.stroke();
    });

    // Dungeon Fackelhalter / Wandbecken mit violetter Flamme
    create('decor_dungeon_torch', 28, 36, (ctx) => {
      // Schmiedeeiserner Halter
      ctx.fillStyle = '#1e1b24';
      ctx.fillRect(11, 16, 6, 16);
      ctx.fillStyle = '#2d2738';
      ctx.beginPath();
      ctx.ellipse(14, 16, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Violette arkane Flamme
      const flameGrad = ctx.createRadialGradient(14, 10, 1, 14, 10, 9);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.3, '#d8b4fe');
      flameGrad.addColorStop(0.7, '#9333ea');
      flameGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.ellipse(14, 10, 6, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Gotische Dungeon-Säule
    create('decor_dungeon_pillar', 32, 44, (ctx) => {
      // Sockel
      ctx.fillStyle = '#160e22';
      ctx.fillRect(4, 34, 24, 8);
      ctx.fillStyle = '#241738';
      ctx.fillRect(6, 10, 20, 24);
      ctx.fillStyle = '#32204d';
      ctx.fillRect(4, 4, 24, 6);

      // Leuchtender Runen-Riss
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(16, 12); ctx.lineTo(13, 20); ctx.lineTo(17, 26);
      ctx.stroke();
    });

    // ==========================================
    // 5. RUNENSTEIN, PORTAL & SCHLOSS
    // ==========================================
    create('bg_menu_panorama', 1280, 720, (ctx) => {
      // Epische Vektor-Hintergrundlandschaft
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 720);
      skyGrad.addColorStop(0, '#0a0714');
      skyGrad.addColorStop(0.35, '#15102a');
      skyGrad.addColorStop(0.65, '#28133d');
      skyGrad.addColorStop(0.85, '#4a1d47');
      skyGrad.addColorStop(1.0, '#1d0c24');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 1280, 720);

      // Sanfte leuchtende Sterne
      ctx.fillStyle = '#ffffff';
      const starCoords = [
        [120, 45], [240, 80], [380, 35], [510, 110], [640, 60],
        [790, 40], [920, 95], [1050, 50], [1180, 85], [160, 140],
        [310, 160], [450, 190], [700, 170], [860, 150], [1120, 130]
      ];
      starCoords.forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Leuchtender Vollmond mit weicher Aura
      const moonX = 1040;
      const moonY = 140;
      const moonRadius = 60;
      const moonGrad = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, moonRadius);
      moonGrad.addColorStop(0, '#fffbf0');
      moonGrad.addColorStop(0.7, '#f6e58d');
      moonGrad.addColorStop(1, '#eccc68');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Bergketten im Hintergrund (Schicht 1)
      ctx.fillStyle = '#1d1733';
      ctx.beginPath();
      ctx.moveTo(0, 480);
      ctx.lineTo(180, 360);
      ctx.lineTo(340, 440);
      ctx.lineTo(520, 320);
      ctx.lineTo(740, 460);
      ctx.lineTo(920, 350);
      ctx.lineTo(1120, 440);
      ctx.lineTo(1280, 370);
      ctx.lineTo(1280, 720);
      ctx.lineTo(0, 720);
      ctx.closePath();
      ctx.fill();

      // Schicht 2 (Dunklere Grate)
      ctx.fillStyle = '#171128';
      ctx.beginPath();
      ctx.moveTo(0, 530);
      ctx.lineTo(120, 450);
      ctx.lineTo(280, 520);
      ctx.lineTo(440, 410);
      ctx.lineTo(620, 510);
      ctx.lineTo(840, 420);
      ctx.lineTo(1020, 500);
      ctx.lineTo(1200, 430);
      ctx.lineTo(1280, 490);
      ctx.lineTo(1280, 720);
      ctx.lineTo(0, 720);
      ctx.closePath();
      ctx.fill();

      // Wehrturm auf Klippe links
      ctx.fillStyle = '#100a1f';
      ctx.beginPath();
      ctx.moveTo(0, 570);
      ctx.lineTo(260, 540);
      ctx.lineTo(320, 720);
      ctx.lineTo(0, 720);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1e1634';
      ctx.fillRect(100, 310, 80, 240);
      ctx.fillStyle = '#55efc4';
      ctx.beginPath();
      ctx.arc(140, 290, 8, 0, Math.PI * 2);
      ctx.fill();

      // Erleuchtete Turmfenster
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(133, 350, 14, 22);
      ctx.fillRect(133, 410, 14, 22);
    });

    create('tile_runestone', 40, 40, (ctx) => {
      // Magischer Runensockel mit leuchtender Aura
      ctx.fillStyle = '#161426';
      ctx.beginPath();
      ctx.arc(20, 20, 18, 0, Math.PI * 2);
      ctx.fill();

      const ringGrad = ctx.createLinearGradient(4, 4, 36, 36);
      ringGrad.addColorStop(0, '#55efc4');
      ringGrad.addColorStop(0.5, '#00cec9');
      ringGrad.addColorStop(1, '#0984e3');

      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(20, 20, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Zentrales Runenzeichen
      ctx.fillStyle = '#e056fd';
      ctx.beginPath();
      ctx.arc(20, 20, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    create('tile_portal', 40, 40, (ctx) => {
      // Hyperraum-Warp-Riss / Quantum Jump Portal (StarCraft Warp Gate)
      const portGrad = ctx.createRadialGradient(20, 20, 2, 20, 20, 19);
      portGrad.addColorStop(0, '#ffffff');
      portGrad.addColorStop(0.25, '#38bdf8');
      portGrad.addColorStop(0.6, '#9333ea');
      portGrad.addColorStop(0.85, '#3b0764');
      portGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = portGrad;
      ctx.beginPath();
      ctx.arc(20, 20, 19, 0, Math.PI * 2);
      ctx.fill();

      // Rotierender Quantum-Ring
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(20, 20, 13, 0, Math.PI * 2);
      ctx.stroke();

      // Energetischer Kern
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(20, 20, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    create('tile_castle', 40, 40, (ctx) => {
      // Terranisches Hauptquartier / Fortress Command Center (ersetzt altes Holz/Steintor)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(20, 36, 17, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Titan-Bunker-Hauptbau
      const bunkerGrad = ctx.createLinearGradient(6, 6, 34, 34);
      bunkerGrad.addColorStop(0, '#334155');
      bunkerGrad.addColorStop(0.5, '#1e293b');
      bunkerGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bunkerGrad;
      ctx.beginPath();
      ctx.roundRect(6, 8, 28, 28, 4);
      ctx.fill();

      // Schutzschild-Emitter-Kuppel (Leuchtendes Cyan-Energiefeld)
      const shieldGrad = ctx.createRadialGradient(20, 18, 2, 20, 18, 14);
      shieldGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      shieldGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.6)');
      shieldGrad.addColorStop(1, 'rgba(2, 132, 199, 0.15)');
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.arc(20, 18, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(20, 18, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Gelb-schwarze Gefahren-Markierung an der Basis
      ctx.fillStyle = '#facc15';
      ctx.fillRect(8, 32, 24, 3);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(12, 32, 4, 3);
      ctx.fillRect(20, 32, 4, 3);

      // Radar-Antenne / Uplink
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(27, 8);
      ctx.lineTo(31, 3);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(31, 3, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // ==========================================
    // 5b. MONUMENTALE FESTUNG, SPAWN-RISS & STEINBRÜCKE
    // ==========================================

    // Großes königliches Festungstor / Citadel Gatehouse (Ziel des Weges)
    create('fortress_citadel_gate', 110, 120, (ctx) => {
      // 1. Tiefer Bodenschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(55, 110, 52, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Linker Bastions-Turm
      const towerLGrad = ctx.createLinearGradient(4, 15, 32, 115);
      towerLGrad.addColorStop(0, '#475569');
      towerLGrad.addColorStop(0.5, '#1e293b');
      towerLGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = towerLGrad;
      ctx.fillRect(6, 20, 26, 92);

      // Zinnen linker Turm
      ctx.fillStyle = '#64748b';
      ctx.fillRect(4, 15, 9, 8);
      ctx.fillRect(16, 15, 7, 8);
      ctx.fillRect(26, 15, 8, 8);

      // Schießscharten linker Turm
      ctx.fillStyle = '#020617';
      ctx.fillRect(18, 40, 3, 10);
      ctx.fillRect(18, 65, 3, 10);

      // Feuerschale linker Turm
      ctx.fillStyle = '#b45309';
      ctx.fillRect(14, 10, 10, 5);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(19, 9, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(19, 8, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 3. Rechter Bastions-Turm
      const towerRGrad = ctx.createLinearGradient(78, 15, 106, 115);
      towerRGrad.addColorStop(0, '#475569');
      towerRGrad.addColorStop(0.5, '#1e293b');
      towerRGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = towerRGrad;
      ctx.fillRect(78, 20, 26, 92);

      // Zinnen rechter Turm
      ctx.fillStyle = '#64748b';
      ctx.fillRect(76, 15, 8, 8);
      ctx.fillRect(87, 15, 7, 8);
      ctx.fillRect(97, 15, 9, 8);

      // Schießscharten rechter Turm
      ctx.fillStyle = '#020617';
      ctx.fillRect(89, 40, 3, 10);
      ctx.fillRect(89, 65, 3, 10);

      // Feuerschale rechter Turm
      ctx.fillStyle = '#b45309';
      ctx.fillRect(86, 10, 10, 5);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(91, 9, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(91, 8, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 4. Zentraler Haupt-Torhaus-Bau
      const gateWallGrad = ctx.createLinearGradient(30, 30, 80, 112);
      gateWallGrad.addColorStop(0, '#334155');
      gateWallGrad.addColorStop(0.7, '#1e293b');
      gateWallGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = gateWallGrad;
      ctx.fillRect(30, 32, 50, 80);

      // Hoher mittlerer Wehrgang & Zinnen
      ctx.fillStyle = '#475569';
      ctx.fillRect(36, 26, 9, 6);
      ctx.fillRect(50, 26, 10, 6);
      ctx.fillRect(65, 26, 9, 6);

      // Königswappen über dem Tor
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(55, 36); ctx.lineTo(61, 44); ctx.lineTo(55, 52); ctx.lineTo(49, 44);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(55, 44, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 5. Großes offenes Festungstor (hier führt der Weg direkt hinein!)
      // Dunkler Tor-Tunnel mit Tiefen-Perspektive
      const tunnelGrad = ctx.createRadialGradient(55, 95, 3, 55, 95, 26);
      tunnelGrad.addColorStop(0, '#451a03'); // Warmes Hoflicht tief im Schloss
      tunnelGrad.addColorStop(0.4, '#1e1b4b');
      tunnelGrad.addColorStop(0.9, '#020617');
      ctx.fillStyle = tunnelGrad;
      ctx.beginPath();
      ctx.arc(55, 75, 20, Math.PI, 0); // Rundbogen oben
      ctx.lineTo(75, 114);
      ctx.lineTo(35, 114);
      ctx.closePath();
      ctx.fill();

      // Torbogen-Einfassung aus behauenen Quadern
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(55, 75, 20.5, Math.PI, 0);
      ctx.lineTo(75.5, 114);
      ctx.moveTo(34.5, 75);
      ctx.lineTo(34.5, 114);
      ctx.stroke();

      // Schlussstein im Torbogen
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(52, 52, 6, 6);

      // Hochgezogenes eisernes Fallgitter über der Durchfahrt
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      for (let gx = 39; gx <= 71; gx += 5) {
        ctx.beginPath();
        ctx.moveTo(gx, 58);
        ctx.lineTo(gx, 76);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(36, 65);
      ctx.lineTo(74, 65);
      ctx.moveTo(36, 72);
      ctx.lineTo(74, 72);
      ctx.stroke();

      // Rote Königs-Banner an den Bastionen
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(10, 48, 6, 26);
      ctx.fillRect(94, 48, 6, 26);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(10, 48, 6, 3);
      ctx.fillRect(94, 48, 6, 3);
    });

    // Das Schatten-Dimensionsportal (Start des Weges - hier strömen die Feinde hervor)
    create('fortress_spawn_rift', 100, 110, (ctx) => {
      // 1. Bodenschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(50, 102, 46, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Linker Obsidian-Monolith
      const monoL = ctx.createLinearGradient(12, 10, 30, 105);
      monoL.addColorStop(0, '#3b0764');
      monoL.addColorStop(0.5, '#0f051d');
      monoL.addColorStop(1, '#020617');
      ctx.fillStyle = monoL;
      ctx.beginPath();
      ctx.moveTo(18, 8);
      ctx.lineTo(29, 22);
      ctx.lineTo(27, 105);
      ctx.lineTo(13, 105);
      ctx.lineTo(11, 28);
      ctx.closePath();
      ctx.fill();

      // Leuchtende Runen linker Pfeiler
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(20, 35); ctx.lineTo(23, 44); ctx.lineTo(17, 52); ctx.lineTo(23, 62);
      ctx.moveTo(18, 75); ctx.lineTo(24, 82);
      ctx.stroke();

      // 3. Rechter Obsidian-Monolith
      const monoR = ctx.createLinearGradient(70, 10, 88, 105);
      monoR.addColorStop(0, '#3b0764');
      monoR.addColorStop(0.5, '#0f051d');
      monoR.addColorStop(1, '#020617');
      ctx.fillStyle = monoR;
      ctx.beginPath();
      ctx.moveTo(82, 8);
      ctx.lineTo(89, 28);
      ctx.lineTo(87, 105);
      ctx.lineTo(73, 105);
      ctx.lineTo(71, 22);
      ctx.closePath();
      ctx.fill();

      // Leuchtende Runen rechter Pfeiler
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(80, 35); ctx.lineTo(77, 44); ctx.lineTo(83, 52); ctx.lineTo(77, 62);
      ctx.moveTo(82, 75); ctx.lineTo(76, 82);
      ctx.stroke();

      // 4. Oberer Ruinen-Bogen
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(18, 8);
      ctx.lineTo(50, 2);
      ctx.lineTo(82, 8);
      ctx.lineTo(76, 22);
      ctx.lineTo(24, 22);
      ctx.closePath();
      ctx.fill();

      // 5. Wirbelnder Hyperraum-Vortex im Tor
      const vortex = ctx.createRadialGradient(50, 64, 2, 50, 64, 26);
      vortex.addColorStop(0, '#ffffff');
      vortex.addColorStop(0.25, '#38bdf8');
      vortex.addColorStop(0.55, '#9333ea');
      vortex.addColorStop(0.85, '#3b0764');
      vortex.addColorStop(1, 'transparent');
      ctx.fillStyle = vortex;
      ctx.beginPath();
      ctx.arc(50, 64, 26, 0, Math.PI * 2);
      ctx.fill();

      // Spiral-Arme & Entladungs-Blitze
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(50, 64, 18, 0.4, Math.PI * 1.6);
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(50, 64); ctx.lineTo(42, 88);
      ctx.moveTo(50, 64); ctx.lineTo(58, 88);
      ctx.stroke();
    });

    // Stabile Stein- & Titan-Brücke (Querung über Flüsse)
    create('decor_bridge_arch', 52, 52, (ctx) => {
      // Wasserschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, 52, 52);

      // Brücken-Fahrbahn (Mitte)
      const roadGrad = ctx.createLinearGradient(0, 8, 0, 44);
      roadGrad.addColorStop(0, '#334155');
      roadGrad.addColorStop(0.5, '#475569');
      roadGrad.addColorStop(1, '#334155');
      ctx.fillStyle = roadGrad;
      ctx.fillRect(0, 8, 52, 36);

      // Obere massive Steinbrüstung
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 4, 52, 6);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 4, 52, 1.5);

      // Untere massive Steinbrüstung
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 42, 52, 6);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 46.5, 52, 1.5);

      // Brückenpfeiler-Konsolen (Kragsteine)
      ctx.fillStyle = '#94a3b8';
      [8, 26, 44].forEach(bx => {
        ctx.fillRect(bx - 2, 2, 4, 3);
        ctx.fillRect(bx - 2, 47, 4, 3);
      });

      // Leuchtende Brücken-Laternen
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(26, 4, 2, 0, Math.PI * 2);
      ctx.arc(26, 48, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // ==========================================
    // 6. MENACING RTS MONSTER & ALIEN BIO-CREATURES
    // ==========================================

    // ZERGLING STALKER (Feral Chitin Hunter)
    create('enemy_goblin', 36, 36, (ctx) => {
      // Dunkler Chitin-Rumpf mit Segmentpanzerung
      const bodyGrad = ctx.createRadialGradient(18, 18, 2, 18, 18, 13);
      bodyGrad.addColorStop(0, '#581c87');
      bodyGrad.addColorStop(0.6, '#3b0764');
      bodyGrad.addColorStop(1, '#1e0538');

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(18, 18, 10, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Panzerplatten-Rückenrippen
      ctx.fillStyle = '#7e22ce';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(18, 11 + i * 5, 8 - i * 1.2, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tödliche Sensen-Klauen (Zergling Blades)
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      // Linke Sichel
      ctx.moveTo(9, 14);
      ctx.quadraticCurveTo(2, 6, 1, 1);
      ctx.quadraticCurveTo(5, 10, 11, 20);
      ctx.fill();
      // Rechte Sichel
      ctx.beginPath();
      ctx.moveTo(27, 14);
      ctx.quadraticCurveTo(34, 6, 35, 1);
      ctx.quadraticCurveTo(31, 10, 25, 20);
      ctx.fill();

      // Zähnefletschende Mandibeln
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(14, 28); ctx.lineTo(12, 34); ctx.lineTo(16, 30);
      ctx.moveTo(22, 28); ctx.lineTo(24, 34); ctx.lineTo(20, 30);
      ctx.fill();

      // Giftig leuchtende Raubtier-Augen (Neon-Acid)
      ctx.fillStyle = '#22c55e';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(14, 24, 2, 0, Math.PI * 2);
      ctx.arc(22, 24, 2, 0, Math.PI * 2);
      ctx.arc(18, 22, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // MUTALISK WINGED FIEND (Geflügelte Bio-Bestie)
    create('enemy_bat', 38, 38, (ctx) => {
      // Reißende Flügel mit giftigen Leuchtadern
      const wingGrad = ctx.createLinearGradient(0, 0, 38, 38);
      wingGrad.addColorStop(0, '#4a044e');
      wingGrad.addColorStop(0.5, '#2e1065');
      wingGrad.addColorStop(1, '#0f172a');

      ctx.fillStyle = wingGrad;
      // Linker Flügel mit Dornen
      ctx.beginPath();
      ctx.moveTo(19, 19);
      ctx.quadraticCurveTo(10, 3, 2, 4);
      ctx.lineTo(6, 15);
      ctx.lineTo(1, 22);
      ctx.lineTo(8, 25);
      ctx.lineTo(3, 33);
      ctx.quadraticCurveTo(13, 26, 19, 19);
      ctx.fill();

      // Rechter Flügel mit Dornen
      ctx.beginPath();
      ctx.moveTo(19, 19);
      ctx.quadraticCurveTo(28, 3, 36, 4);
      ctx.lineTo(32, 15);
      ctx.lineTo(37, 22);
      ctx.lineTo(30, 25);
      ctx.lineTo(35, 33);
      ctx.quadraticCurveTo(25, 26, 19, 19);
      ctx.fill();

      // Rumpf & Stachelpanzer
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.ellipse(19, 19, 5, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Giftstachel am Schwanz
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(17, 28); ctx.lineTo(19, 36); ctx.lineTo(21, 28);
      ctx.fill();

      // Glühende Raubvogel-Augen
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 5;
      ctx.fillRect(17, 12, 1.8, 3);
      ctx.fillRect(20, 12, 1.8, 3);
      ctx.shadowBlur = 0;
    });

    // VOID BROOD QUEEN (Psionische Brutmutter)
    create('enemy_witch', 38, 38, (ctx) => {
      // Schwebendes psionisches Alien-Wesen
      const psionGrad = ctx.createRadialGradient(19, 19, 2, 19, 19, 16);
      psionGrad.addColorStop(0, '#c084fc');
      psionGrad.addColorStop(0.5, '#6b21a8');
      psionGrad.addColorStop(1, '#1e0538');

      ctx.fillStyle = psionGrad;
      ctx.beginPath();
      ctx.arc(19, 19, 11, 0, Math.PI * 2);
      ctx.fill();

      // Gezackte Chitin-Krone
      ctx.fillStyle = '#d8b4fe';
      ctx.beginPath();
      ctx.moveTo(11, 12); ctx.lineTo(7, 2); ctx.lineTo(14, 8);
      ctx.lineTo(19, 0); ctx.lineTo(24, 8);
      ctx.lineTo(31, 2); ctx.lineTo(27, 12);
      ctx.closePath();
      ctx.fill();

      // Psionische Fang-Tentakel unten
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(14, 27); ctx.quadraticCurveTo(10, 34, 12, 38);
      ctx.moveTo(19, 28); ctx.quadraticCurveTo(19, 35, 19, 38);
      ctx.moveTo(24, 27); ctx.quadraticCurveTo(28, 34, 26, 38);
      ctx.stroke();

      // Leuchtender Void-Kern
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(19, 20, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // ACID BROOD ROACH (Säure-Kriecher)
    create('enemy_slime', 36, 36, (ctx) => {
      // Pulsierende eitrige Gift-Biomasse
      const acidGrad = ctx.createRadialGradient(18, 18, 2, 18, 18, 15);
      acidGrad.addColorStop(0, '#84cc16');
      acidGrad.addColorStop(0.5, '#4d7c0f');
      acidGrad.addColorStop(0.9, '#1a2e05');
      acidGrad.addColorStop(1, '#051201');

      ctx.fillStyle = acidGrad;
      ctx.beginPath();
      ctx.moveTo(7, 28);
      ctx.quadraticCurveTo(3, 14, 18, 6);
      ctx.quadraticCurveTo(33, 14, 29, 28);
      ctx.quadraticCurveTo(18, 33, 7, 28);
      ctx.closePath();
      ctx.fill();

      // Ekelhafte giftige Säureblasen / Pusteln
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#84cc16';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(14, 16, 3.5, 0, Math.PI * 2);
      ctx.arc(22, 15, 3, 0, Math.PI * 2);
      ctx.arc(18, 23, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Scharfe Chitin-Beine
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(6, 24); ctx.lineTo(1, 29);
      ctx.moveTo(30, 24); ctx.lineTo(35, 29);
      ctx.stroke();
    });

    // BANELING SPORE EXPLODER (Flüchtiger Säurebomber)
    create('enemy_bomber', 36, 36, (ctx) => {
      // Praller, giftig aufgedunsener Explosiv-Sack
      const sacGrad = ctx.createRadialGradient(18, 19, 3, 18, 19, 14);
      sacGrad.addColorStop(0, '#f97316');
      sacGrad.addColorStop(0.5, '#dc2626');
      sacGrad.addColorStop(0.9, '#7f1d1d');
      sacGrad.addColorStop(1, '#450a0a');

      ctx.fillStyle = sacGrad;
      ctx.beginPath();
      ctx.arc(18, 19, 13, 0, Math.PI * 2);
      ctx.fill();

      // Gefährlich glühende Säure-Venen
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 7;
      ctx.beginPath();
      ctx.moveTo(11, 14); ctx.quadraticCurveTo(18, 16, 25, 13);
      ctx.moveTo(13, 23); ctx.quadraticCurveTo(19, 21, 24, 25);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Gepanzerte Zähne am Unterkiefer
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(13, 28); ctx.lineTo(11, 34); ctx.lineTo(15, 31);
      ctx.moveTo(23, 28); ctx.lineTo(25, 34); ctx.lineTo(21, 31);
      ctx.fill();
    });

    // HYDRALISK ARMORED RAVAGER (Gepanzerter Killer)
    create('enemy_orc', 40, 40, (ctx) => {
      // Schwer gepanzerte Karapax-Platten
      const ravGrad = ctx.createRadialGradient(20, 20, 3, 20, 20, 16);
      ravGrad.addColorStop(0, '#991b1b');
      ravGrad.addColorStop(0.6, '#450a0a');
      ravGrad.addColorStop(1, '#180303');

      ctx.fillStyle = ravGrad;
      ctx.beginPath();
      ctx.arc(20, 20, 14, 0, Math.PI * 2);
      ctx.fill();

      // Rückenpanzer-Stacheln
      ctx.fillStyle = '#cbd5e1';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(14 + i * 3, 7); ctx.lineTo(15 + i * 3, 1); ctx.lineTo(17 + i * 3, 7);
        ctx.fill();
      }

      // Massive Sichelklauen
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      // Links
      ctx.moveTo(10, 16); ctx.quadraticCurveTo(2, 8, 1, 3); ctx.lineTo(9, 24);
      // Rechts
      ctx.moveTo(30, 16); ctx.quadraticCurveTo(38, 8, 39, 3); ctx.lineTo(31, 24);
      ctx.fill();

      // Blutrünstige Augen
      ctx.fillStyle = '#f87171';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 6;
      ctx.fillRect(16, 21, 2.5, 2.5);
      ctx.fillRect(22, 21, 2.5, 2.5);
      ctx.shadowBlur = 0;
    });

    // APEX ULTRALISK LEVIATHAN (Monumentaler Boss 48x48)
    create('enemy_boss', 48, 48, (ctx) => {
      // Gigantischer gepanzerter Koloss
      const bossGrad = ctx.createRadialGradient(24, 24, 4, 24, 24, 22);
      bossGrad.addColorStop(0, '#dc2626');
      bossGrad.addColorStop(0.4, '#7f1d1d');
      bossGrad.addColorStop(0.8, '#2a0606');
      bossGrad.addColorStop(1, '#0c0101');

      ctx.fillStyle = bossGrad;
      ctx.beginPath();
      ctx.ellipse(24, 24, 18, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Kolossale Kaiser-Klingen (Ultralisk Scythes)
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      // Linke Riesenklinge
      ctx.beginPath();
      ctx.moveTo(13, 20);
      ctx.quadraticCurveTo(3, 8, 1, 1);
      ctx.quadraticCurveTo(8, 12, 12, 32);
      ctx.fill();
      // Rechte Riesenklinge
      ctx.beginPath();
      ctx.moveTo(35, 20);
      ctx.quadraticCurveTo(45, 8, 47, 1);
      ctx.quadraticCurveTo(40, 12, 36, 32);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Schweres geripptes Chitin-Schutzschild
      ctx.fillStyle = '#991b1b';
      for (let r = 0; r < 5; r++) {
        ctx.beginPath();
        ctx.ellipse(24, 14 + r * 5, 14 - r * 1.5, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glühender Plasma-Kern im Zentrum
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(24, 26, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Eigene detaillierte Designs für alle weiteren Spezial-Monster
    create('enemy_swamp_troll', 38, 38, (ctx) => {
      // Sumpf-Goliath mit Moos- und Giftpanzer
      ctx.fillStyle = '#14532d';
      ctx.beginPath(); ctx.arc(19, 19, 15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#84cc16';
      ctx.beginPath(); ctx.arc(15, 15, 4, 0, Math.PI * 2); ctx.arc(23, 16, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(15, 22, 2.5, 2.5); ctx.fillRect(21, 22, 2.5, 2.5);
    });

    create('enemy_cave_goblin', 36, 36, (ctx) => {
      // Unterirdischer Gräber mit langen Krallen
      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.ellipse(18, 18, 10, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(14, 22, 2, 2); ctx.fillRect(20, 22, 2, 2);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(8, 18); ctx.lineTo(1, 25); ctx.moveTo(28, 18); ctx.lineTo(35, 25); ctx.stroke();
    });

    create('enemy_bomber_tnt', 36, 36, (ctx) => {
      const baseImg = tm.get('enemy_bomber').getSourceImage() as CanvasImageSource;
      if (baseImg) ctx.drawImage(baseImg, 0, 0, 36, 36);
    });

    create('enemy_armored_troll', 38, 38, (ctx) => {
      // Schwerer Titan-Juggernaut (Segmentierter Panzerrumpf, massive Schulterplatten, Cyber-Visier)
      // 1. Chitin-Unterbauch & Extremitäten
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(19, 4); ctx.lineTo(32, 12); ctx.lineTo(35, 26); ctx.lineTo(26, 36); ctx.lineTo(12, 36); ctx.lineTo(3, 26); ctx.lineTo(6, 12);
      ctx.closePath();
      ctx.fill();

      // 2. Titan-Frontal-Panzerplatten
      const armorGrad = ctx.createLinearGradient(6, 6, 32, 32);
      armorGrad.addColorStop(0, '#64748b');
      armorGrad.addColorStop(0.5, '#334155');
      armorGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = armorGrad;
      ctx.fillRect(8, 10, 22, 7);
      ctx.fillRect(10, 19, 18, 6);
      ctx.fillRect(13, 27, 12, 5);

      // 3. Stachelbewehrte Schulteraufsätze
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(6, 10); ctx.lineTo(0, 4); ctx.lineTo(8, 7); ctx.closePath();
      ctx.moveTo(32, 10); ctx.lineTo(38, 4); ctx.lineTo(30, 7); ctx.closePath();
      ctx.fill();

      // 4. Glühendes kybernetisches Visier (Gift-Resistenz Cyan-Rot)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(13, 14, 12, 2.5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(17, 14, 4, 2.5);
    });

    create('enemy_golem', 38, 38, (ctx) => {
      // Kristall-Obsidian Geomancer (Schwebende Kristallmonolithen & pulsierender Frostkern)
      // 1. Dunkler Obsidian-Monolith
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.moveTo(19, 3); ctx.lineTo(30, 10); ctx.lineTo(34, 26); ctx.lineTo(24, 35); ctx.lineTo(14, 35); ctx.lineTo(4, 26); ctx.lineTo(8, 10);
      ctx.closePath();
      ctx.fill();

      // 2. Schwebende eisblaue Kristallkanten
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(19, 5); ctx.lineTo(27, 14); ctx.lineTo(20, 20); ctx.lineTo(11, 14); ctx.closePath();
      ctx.moveTo(6, 15); ctx.lineTo(13, 27); ctx.lineTo(5, 29); ctx.closePath();
      ctx.moveTo(32, 15); ctx.lineTo(33, 29); ctx.lineTo(25, 27); ctx.closePath();
      ctx.fill();

      // 3. Glühende Kristall-Fokus-Linse (Frost-Immun Aura)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(19, 19, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(19, 19, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    create('enemy_fire_imp', 36, 36, (ctx) => {
      // Flug-Dämon / Flammen-Fiend (Gezackte Schwingen, glühender Flammen-Kamm & Reißzähne)
      // 1. Fledermaus-Schwingen mit feurigen Spitzen
      const wingGrad = ctx.createLinearGradient(0, 0, 36, 36);
      wingGrad.addColorStop(0, '#ea580c');
      wingGrad.addColorStop(0.5, '#7c2d12');
      wingGrad.addColorStop(1, '#290b02');
      ctx.fillStyle = wingGrad;
      ctx.beginPath();
      ctx.moveTo(18, 16); ctx.lineTo(3, 4); ctx.lineTo(6, 18); ctx.lineTo(0, 26); ctx.lineTo(14, 22);
      ctx.moveTo(18, 16); ctx.lineTo(33, 4); ctx.lineTo(30, 18); ctx.lineTo(36, 26); ctx.lineTo(22, 22);
      ctx.fill();

      // 2. Dämonischer Rumpf mit glühendem Hornkamm
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.ellipse(18, 19, 7.5, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hörner
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(14, 11); ctx.lineTo(11, 2); ctx.lineTo(16, 9); ctx.closePath();
      ctx.moveTo(22, 11); ctx.lineTo(25, 2); ctx.lineTo(20, 9); ctx.closePath();
      ctx.fill();

      // Glühende Augen
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(14, 16, 2.5, 2.5);
      ctx.fillRect(19.5, 16, 2.5, 2.5);
    });

    create('enemy_magma_orc', 40, 40, (ctx) => {
      // Vulkanischer Magma-Berserker (Tektonischer Basaltpanzer mit flüssiger Lava-Ader)
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(20, 4); ctx.lineTo(32, 10); ctx.lineTo(37, 24); ctx.lineTo(28, 36); ctx.lineTo(12, 36); ctx.lineTo(3, 24); ctx.lineTo(8, 10);
      ctx.closePath();
      ctx.fill();

      // Glühende Magmaströme in den tektonischen Fugen
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(12, 14); ctx.lineTo(20, 22); ctx.lineTo(16, 32);
      ctx.moveTo(28, 14); ctx.lineTo(20, 22); ctx.lineTo(24, 32);
      ctx.stroke();

      // Oberflächen-Lavamündungen & Schlote
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(13, 9, 4, 3);
      ctx.fillRect(23, 9, 4, 3);

      // Glühendes Visier & Zähne
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(16, 18, 2.5, 2.5);
      ctx.fillRect(21.5, 18, 2.5, 2.5);
    });

    create('enemy_hellhound', 38, 38, (ctx) => {
      // Höllen-Raubtier / Cyber-Wolf (Schnittiger, muskulöser Alien-Prädator mit Rücken-Stacheln)
      ctx.fillStyle = '#3f0b0b';
      ctx.beginPath();
      ctx.ellipse(19, 21, 8.5, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Prädator-Schädel & Kiefer
      ctx.fillStyle = '#1f0404';
      ctx.beginPath();
      ctx.moveTo(19, 7); ctx.lineTo(26, 18); ctx.lineTo(19, 23); ctx.lineTo(12, 18); ctx.closePath();
      ctx.fill();

      // Rückenstacheln & Nackenkamm
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(19, 4); ctx.lineTo(17, 10); ctx.lineTo(21, 10); ctx.closePath();
      ctx.moveTo(19, 14); ctx.lineTo(15, 20); ctx.lineTo(23, 20); ctx.closePath();
      ctx.moveTo(19, 24); ctx.lineTo(16, 30); ctx.lineTo(22, 30); ctx.closePath();
      ctx.fill();

      // Gezackte Raubtier-Ohren
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(13, 11); ctx.lineTo(7, 3); ctx.lineTo(15, 8); ctx.closePath();
      ctx.moveTo(25, 11); ctx.lineTo(31, 3); ctx.lineTo(23, 8); ctx.closePath();
      ctx.fill();

      // Glühende Raubtieraugen
      ctx.fillStyle = '#facc15';
      ctx.fillRect(14, 15, 2, 2); ctx.fillRect(22, 15, 2, 2);
    });

    create('enemy_lava_golem', 46, 46, (ctx) => {
      // Eruptierender Magma-Koloss (46x46 Monumental-Gestein mit fließender Lava)
      ctx.fillStyle = '#180702';
      ctx.beginPath();
      ctx.moveTo(23, 3); ctx.lineTo(39, 12); ctx.lineTo(44, 30); ctx.lineTo(34, 43); ctx.lineTo(12, 43); ctx.lineTo(2, 30); ctx.lineTo(7, 12);
      ctx.closePath();
      ctx.fill();

      // Magma-Brustkern (Infrarot-Hitze)
      const coreGrad = ctx.createRadialGradient(23, 23, 2, 23, 23, 16);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, '#facc15');
      coreGrad.addColorStop(0.7, '#ea580c');
      coreGrad.addColorStop(1, '#7c2d12');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(23, 23, 12, 0, Math.PI * 2);
      ctx.fill();

      // Obsidian-Schulterpanzer
      ctx.fillStyle = '#334155';
      ctx.fillRect(6, 12, 9, 14);
      ctx.fillRect(31, 12, 9, 14);
    });

    create('enemy_colossus', 46, 46, (ctx) => {
      // Void-Kriegs-Koloss (Psionischer Vierbein-Strider mit Spaltkern)
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(23, 4); ctx.lineTo(40, 15); ctx.lineTo(38, 38); ctx.lineTo(23, 43); ctx.lineTo(8, 38); ctx.lineTo(6, 15);
      ctx.closePath();
      ctx.fill();

      // Psionischer Reaktor
      const reactorGrad = ctx.createRadialGradient(23, 23, 2, 23, 23, 14);
      reactorGrad.addColorStop(0, '#f0abfc');
      reactorGrad.addColorStop(0.5, '#a855f7');
      reactorGrad.addColorStop(1, '#3b0764');
      ctx.fillStyle = reactorGrad;
      ctx.beginPath();
      ctx.arc(23, 23, 11, 0, Math.PI * 2);
      ctx.fill();

      // Flankierende Energie-Spreizer
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(9, 13, 28, 20);
    });

    create('enemy_titan', 48, 48, (ctx) => {
      // Kosmischer Überlord / Weltenzerstörer (48x48 Eldritch Titan mit 6 Augen & Sensenkrallen)
      ctx.fillStyle = '#0a0512';
      ctx.beginPath();
      ctx.moveTo(24, 2); ctx.lineTo(43, 12); ctx.lineTo(46, 34); ctx.lineTo(36, 46); ctx.lineTo(12, 46); ctx.lineTo(2, 34); ctx.lineTo(5, 12);
      ctx.closePath();
      ctx.fill();

      // Monströse Sensenkrallen
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(5, 12); ctx.lineTo(0, 0); ctx.lineTo(12, 6); ctx.closePath();
      ctx.moveTo(43, 12); ctx.lineTo(48, 0); ctx.lineTo(36, 6); ctx.closePath();
      ctx.fill();

      // Dunkle Materie-Strudel im Abdomen
      const voidGrad = ctx.createRadialGradient(24, 25, 2, 24, 25, 16);
      voidGrad.addColorStop(0, '#f43f5e');
      voidGrad.addColorStop(0.5, '#881337');
      voidGrad.addColorStop(1, '#1e0538');
      ctx.fillStyle = voidGrad;
      ctx.beginPath();
      ctx.arc(24, 25, 13, 0, Math.PI * 2);
      ctx.fill();

      // 6 Glühende Augen des Abgrunds
      ctx.fillStyle = '#fde047';
      [ {x: 18, y: 16}, {x: 24, y: 14}, {x: 30, y: 16}, {x: 19, y: 20}, {x: 24, y: 22}, {x: 29, y: 20} ].forEach(eye => {
        ctx.beginPath(); ctx.arc(eye.x, eye.y, 1.8, 0, Math.PI * 2); ctx.fill();
      });
    });

    // ==========================================
    // 7. MODERNE GESCHOSSE & EFFEKTE
    // ==========================================
    create('proj_arrow', 24, 8, (ctx) => {
      // Eleganter Holzpfeil mit Stahlspitze & Federn
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(2, 4);
      ctx.lineTo(18, 4);
      ctx.stroke();

      // Stahlspitze
      ctx.fillStyle = '#dfe4ea';
      ctx.beginPath();
      ctx.moveTo(23, 4);
      ctx.lineTo(17, 1);
      ctx.lineTo(17, 7);
      ctx.closePath();
      ctx.fill();

      // Befiederung
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.moveTo(2, 4); ctx.lineTo(6, 1); ctx.lineTo(8, 4);
      ctx.moveTo(2, 4); ctx.lineTo(6, 7); ctx.lineTo(8, 4);
      ctx.fill();
    });

    create('proj_cannonball', 16, 16, (ctx) => {
      // 3D-Gusseisenkugel mit Glanz
      const grad = ctx.createRadialGradient(5, 5, 1, 8, 8, 8);
      grad.addColorStop(0, '#a4b0be');
      grad.addColorStop(0.5, '#2f3542');
      grad.addColorStop(1, '#000000');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(8, 8, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    create('proj_ice', 18, 18, (ctx) => {
      // Eisspitze mit Leuchten
      const grad = ctx.createLinearGradient(0, 0, 18, 18);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#74b9ff');
      grad.addColorStop(1, '#0984e3');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(9, 1);
      ctx.lineTo(17, 9);
      ctx.lineTo(9, 17);
      ctx.lineTo(1, 9);
      ctx.closePath();
      ctx.fill();
    });

    create('proj_poison', 16, 16, (ctx) => {
      // Säure-Ampulle
      const grad = ctx.createRadialGradient(8, 8, 1, 8, 8, 8);
      grad.addColorStop(0, '#55efc4');
      grad.addColorStop(0.7, '#00b894');
      grad.addColorStop(1, '#006266');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(8, 8, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    create('proj_tesla', 20, 20, (ctx) => {
      // Energie-Plasmablitz
      ctx.fillStyle = 'rgba(0, 206, 201, 0.3)';
      ctx.beginPath();
      ctx.arc(10, 10, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(10, 10, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    create('proj_sniper', 26, 8, (ctx) => {
      // Hyperschall-Projektil mit Leuchtspur
      const grad = ctx.createLinearGradient(0, 4, 26, 4);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.4, '#ff4757');
      grad.addColorStop(1, '#ffffff');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 2, 26, 4);
    });

    create('proj_flame', 24, 16, (ctx) => {
      // Flammenstoß-Projektil (Feuriger Tropfen mit leuchtendem Kern)
      const grad = ctx.createRadialGradient(16, 8, 2, 16, 8, 10);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#facc15');
      grad.addColorStop(0.7, '#ea580c');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(24, 8); ctx.lineTo(12, 1); ctx.lineTo(0, 8); ctx.lineTo(12, 15); ctx.closePath();
      ctx.fill();
    });

    create('proj_plasma', 20, 20, (ctx) => {
      // Hochenergetischer Plasma-Orb
      const grad = ctx.createRadialGradient(10, 10, 2, 10, 10, 9);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#38bdf8');
      grad.addColorStop(0.8, '#0284c7');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(10, 10, 9, 0, Math.PI * 2);
      ctx.fill();
    });

    create('proj_orbital', 28, 8, (ctx) => {
      // Orbitale Laser-Lanze (Rubinroter Laserstrahl mit weißem Kern)
      const grad = ctx.createLinearGradient(0, 4, 28, 4);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.3, '#ef4444');
      grad.addColorStop(0.7, '#ffffff');
      grad.addColorStop(1, '#fca5a5');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 2, 28, 4);
    });

    create('proj_chrono', 22, 22, (ctx) => {
      // Temporale Raumverzerrungs-Welle
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(11, 11, 8, 0, Math.PI * 2);
      ctx.stroke();

      const coreGrad = ctx.createRadialGradient(11, 11, 1, 11, 11, 5);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.6, '#38bdf8');
      coreGrad.addColorStop(1, '#0e7490');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(11, 11, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    create('proj_spore', 18, 18, (ctx) => {
      // Ätzende Zerg-Bio-Spore
      const grad = ctx.createRadialGradient(9, 9, 2, 9, 9, 8);
      grad.addColorStop(0, '#facc15');
      grad.addColorStop(0.5, '#84cc16');
      grad.addColorStop(0.9, '#15803d');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(9, 9, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 7, 2, 2);
    });

    // Effekte
    create('effect_hit', 20, 20, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(10, 10, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    create('effect_explosion', 48, 48, (ctx) => {
      const grad = ctx.createRadialGradient(24, 24, 2, 24, 24, 22);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#ffa502');
      grad.addColorStop(0.7, '#ff4757');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();
    });

    // Eis-Nova / Frost-Explosion (Kristalline Eiskrone)
    create('effect_frost', 48, 48, (ctx) => {
      const grad = ctx.createRadialGradient(24, 24, 2, 24, 24, 22);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#70a1ff');
      grad.addColorStop(0.7, '#00d2d3');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();

      // 8 Frostkristall-Strahlen
      ctx.strokeStyle = '#e0f7fa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const x1 = 24 + Math.cos(angle) * 4;
        const y1 = 24 + Math.sin(angle) * 4;
        const x2 = 24 + Math.cos(angle) * 20;
        const y2 = 24 + Math.sin(angle) * 20;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();

      // Diamantene Eissplitter
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + Math.PI / 8;
        const sx = 24 + Math.cos(angle) * 12;
        const sy = 24 + Math.sin(angle) * 12;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Giftgas-Wolke / Toxische Explosion
    create('effect_poison', 48, 48, (ctx) => {
      const grad = ctx.createRadialGradient(24, 24, 2, 24, 24, 22);
      grad.addColorStop(0, '#7bed9f');
      grad.addColorStop(0.4, '#2ed573');
      grad.addColorStop(0.75, '#10ac84');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();

      // Giftige Gasbläschen
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      [ {x: 18, y: 18, r: 3}, {x: 30, y: 22, r: 2.5}, {x: 22, y: 30, r: 2} ].forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // ==========================================
    // 8. HOCHWERTIGE 2.5D RTS-TÜRME (REALISTISCHES MILITÄR-DESIGN)
    // ==========================================
    const towerTypes = ['archer', 'cannon', 'ice', 'poison', 'tesla', 'sniper', 'flamethrower', 'plasma_pylon', 'orbital_laser', 'chrono_disruptor', 'bio_hive'];

    const modernTierThemes: Record<number, { ring: string; trim: string; glow: string; armor: string; dark: string }> = {
      1: { ring: '#38bdf8', trim: '#7dd3fc', glow: 'rgba(56, 189, 248, 0.45)', armor: '#334155', dark: '#0f172a' },
      2: { ring: '#f59e0b', trim: '#fcd34d', glow: 'rgba(245, 158, 11, 0.55)', armor: '#475569', dark: '#1e293b' },
      3: { ring: '#ef4444', trim: '#fca5a5', glow: 'rgba(239, 68, 68, 0.65)', armor: '#1e293b', dark: '#090d16' }
    };

    towerTypes.forEach((type) => {
      for (let lvl = 1; lvl <= 3; lvl++) {
        const key = `tower_${type}_${lvl}`;
        const theme = modernTierThemes[lvl];

        create(key, 44, 44, (ctx) => {
          // 1. Weicher Bodenschatten
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.ellipse(22, 32, 18, 9, 0, 0, Math.PI * 2);
          ctx.fill();

          // 2. Titan-Turmfundament (Abgeschrägte 2.5D-Panzerplatte)
          const baseGrad = ctx.createRadialGradient(22, 28, 3, 22, 28, 18);
          baseGrad.addColorStop(0, '#475569');
          baseGrad.addColorStop(0.6, theme.armor);
          baseGrad.addColorStop(1, theme.dark);
          ctx.fillStyle = baseGrad;
          ctx.beginPath();
          ctx.ellipse(22, 28, 18, 10, 0, 0, Math.PI * 2);
          ctx.fill();

          // Turmfundament-Kantenfase mit Ausbaustufen-Zierring
          ctx.strokeStyle = theme.ring;
          ctx.lineWidth = lvl >= 2 ? 2.2 : 1.5;
          ctx.beginPath();
          ctx.ellipse(22, 28, 16.5, 8.8, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Befestigungsbolzen am Fundamentrand
          ctx.fillStyle = '#94a3b8';
          [ {x: 8, y: 28}, {x: 36, y: 28}, {x: 15, y: 34}, {x: 29, y: 34} ].forEach(b => {
            ctx.beginPath();
            ctx.arc(b.x, b.y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          });

          // 3. Drehbare Turmhaube / Drehkranz (Mitte)
          const turretRingGrad = ctx.createLinearGradient(14, 16, 30, 26);
          turretRingGrad.addColorStop(0, '#64748b');
          turretRingGrad.addColorStop(0.5, '#334155');
          turretRingGrad.addColorStop(1, '#1e293b');
          ctx.fillStyle = turretRingGrad;
          ctx.beginPath();
          ctx.ellipse(22, 23, 11, 6.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // 4. Waffen-System je nach Turmart
          if (type === 'archer') {
            // VULCAN FLAK / KINETISCHES SCHNELLFEUER-GESCHÜTZ
            if (lvl === 1) {
              // Stufe 1: Motorisierte Doppel-Kinetikkanone mit Munitionskasten
              ctx.fillStyle = '#1e293b';
              ctx.fillRect(17, 7, 3.5, 16);
              ctx.fillRect(23.5, 7, 3.5, 16);

              // Mündungsfeuerdämpfer
              ctx.fillStyle = theme.ring;
              ctx.fillRect(16, 5, 5.5, 2.5);
              ctx.fillRect(22.5, 5, 5.5, 2.5);

              // Seitliche Munitionsbox
              ctx.fillStyle = '#b45309';
              ctx.fillRect(10, 18, 5, 7);
            } else if (lvl === 2) {
              // Stufe 2: Verstärktes Zwillings-Rotationsgeschütz mit Munitionsgurt
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(16, 4, 4, 19);
              ctx.fillRect(24, 4, 4, 19);

              ctx.fillStyle = theme.ring;
              ctx.fillRect(15, 3, 6, 3);
              ctx.fillRect(23, 3, 6, 3);

              // Gelbe Munitions-Zuführungsglieder
              ctx.fillStyle = '#f59e0b';
              ctx.fillRect(9, 16, 6, 8);
              ctx.fillStyle = '#fbbf24';
              ctx.fillRect(10, 17, 4, 2);
              ctx.fillRect(10, 20, 4, 2);
            } else {
              // Stufe 3: Quad-Vulcan Phalanx (4 schwere Läufe & Laserzielgerät)
              ctx.fillStyle = '#090d16';
              ctx.fillRect(14, 3, 3, 20);
              ctx.fillRect(18, 2, 3, 21);
              ctx.fillRect(23, 2, 3, 21);
              ctx.fillRect(27, 3, 3, 20);

              // Verbund-Mündungsbremse in Meister-Rot
              ctx.fillStyle = theme.ring;
              ctx.fillRect(13, 1, 18, 3);

              // Roter Laserziel-Projektor
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(22, 13, 2.2, 0, Math.PI * 2);
              ctx.fill();

              // Doppelte Trommelmagazine
              ctx.fillStyle = '#1e293b';
              ctx.beginPath();
              ctx.arc(10, 21, 4, 0, Math.PI * 2);
              ctx.arc(34, 21, 4, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (type === 'cannon') {
            // BELAGERUNGS-GAUSS-KANONE / ARTILLERIE
            if (lvl === 1) {
              // Stufe 1: Schweres 120mm Haubitzenrohr mit Rückstoßzylinder
              const tubeGrad = ctx.createLinearGradient(17, 3, 27, 21);
              tubeGrad.addColorStop(0, '#64748b');
              tubeGrad.addColorStop(0.5, '#334155');
              tubeGrad.addColorStop(1, '#0f172a');
              ctx.fillStyle = tubeGrad;
              ctx.fillRect(18, 5, 8, 17);

              // Mündungsbremse
              ctx.fillStyle = theme.ring;
              ctx.fillRect(16.5, 3, 11, 3.5);

              // Hydraulischer Rückstoßdämpfer
              ctx.fillStyle = '#94a3b8';
              ctx.fillRect(16, 15, 2.5, 6);
              ctx.fillRect(25.5, 15, 2.5, 6);
            } else if (lvl === 2) {
              // Stufe 2: Langes verstärktes Belagerungsrohr mit Kühlrippen
              const tubeGrad = ctx.createLinearGradient(16, 2, 28, 22);
              tubeGrad.addColorStop(0, '#94a3b8');
              tubeGrad.addColorStop(0.5, '#475569');
              tubeGrad.addColorStop(1, '#1e293b');
              ctx.fillStyle = tubeGrad;
              ctx.fillRect(17, 3, 10, 20);

              // Doppelblenden-Mündungsbremse
              ctx.fillStyle = theme.ring;
              ctx.fillRect(15, 1, 14, 4);
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(18, 2, 8, 2);

              // Seitliche Panzerungsschürzen
              ctx.fillStyle = '#334155';
              ctx.fillRect(11, 14, 4, 10);
              ctx.fillRect(29, 14, 4, 10);
            } else {
              // Stufe 3: Kolossale Zwillings-Gauss-Belagerungskanone (StarCraft Siege Style)
              // Linker Lauf
              const t1 = ctx.createLinearGradient(13, 0, 19, 22);
              t1.addColorStop(0, '#64748b');
              t1.addColorStop(0.5, '#1e293b');
              t1.addColorStop(1, '#090d16');
              ctx.fillStyle = t1;
              ctx.fillRect(14, 1, 6.5, 22);

              // Rechter Lauf
              ctx.fillStyle = t1;
              ctx.fillRect(23.5, 1, 6.5, 22);

              // Massive Mündungsdämpfer
              ctx.fillStyle = theme.ring;
              ctx.fillRect(13, 0, 8.5, 4);
              ctx.fillRect(22.5, 0, 8.5, 4);

              // Schwere Turm-Blende mit Warn-Chevrons
              ctx.fillStyle = '#1e293b';
              ctx.fillRect(12, 13, 20, 10);
              ctx.fillStyle = '#facc15';
              ctx.fillRect(14, 17, 3, 3);
              ctx.fillRect(20, 17, 3, 3);
              ctx.fillRect(26, 17, 3, 3);
            }
          } else if (type === 'ice') {
            // KRYO-NULLIFIKATOR / QUANTEN-FROSTPROJEKTOR
            if (lvl === 1) {
              // Stufe 1: Facettierter Saphir-Kryokristall in Messingfassung
              const iceGrad = ctx.createLinearGradient(14, 4, 30, 24);
              iceGrad.addColorStop(0, '#ffffff');
              iceGrad.addColorStop(0.4, '#7dd3fc');
              iceGrad.addColorStop(1, '#0284c7');
              ctx.fillStyle = iceGrad;
              ctx.beginPath();
              ctx.moveTo(22, 3);
              ctx.lineTo(29, 14);
              ctx.lineTo(22, 23);
              ctx.lineTo(15, 14);
              ctx.closePath();
              ctx.fill();

              ctx.strokeStyle = '#bae6fd';
              ctx.lineWidth = 1.2;
              ctx.stroke();
            } else if (lvl === 2) {
              // Stufe 2: Kryo-Kondensator mit Stickstoff-Tanks & Eiskern
              ctx.fillStyle = '#0284c7';
              ctx.fillRect(11, 11, 5, 12);
              ctx.fillRect(28, 11, 5, 12);

              const iceGrad = ctx.createRadialGradient(22, 13, 2, 22, 13, 9);
              iceGrad.addColorStop(0, '#ffffff');
              iceGrad.addColorStop(0.5, '#38bdf8');
              iceGrad.addColorStop(1, '#0369a1');
              ctx.fillStyle = iceGrad;
              ctx.beginPath();
              ctx.arc(22, 13, 7.5, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = theme.ring;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(22, 13, 7.5, 0, Math.PI * 2);
              ctx.stroke();
            } else {
              // Stufe 3: Absoluter Nullpunkt Matrix (Schwebender Kryo-Diamant mit Energieringen)
              ctx.strokeStyle = theme.ring;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.ellipse(22, 13, 14, 6, 0.25, 0, Math.PI * 2);
              ctx.stroke();

              const diamondGrad = ctx.createLinearGradient(16, 2, 28, 22);
              diamondGrad.addColorStop(0, '#ffffff');
              diamondGrad.addColorStop(0.3, '#bae6fd');
              diamondGrad.addColorStop(0.7, '#0284c7');
              diamondGrad.addColorStop(1, '#082f49');
              ctx.fillStyle = diamondGrad;
              ctx.beginPath();
              ctx.moveTo(22, 1);
              ctx.lineTo(31, 13);
              ctx.lineTo(22, 24);
              ctx.lineTo(13, 13);
              ctx.closePath();
              ctx.fill();

              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          } else if (type === 'poison') {
            // BIO-TOXIN SÄURE-MÖRSER / SEUCHEN-REAKTOR
            if (lvl === 1) {
              // Stufe 1: Druck-Chemiebehälter mit gerippten Schläuchen
              ctx.fillStyle = '#14532d';
              ctx.beginPath();
              ctx.arc(22, 14, 8, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#22c55e';
              ctx.beginPath();
              ctx.arc(22, 14, 5, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#eab308';
              ctx.fillRect(20, 4, 4, 6);
            } else if (lvl === 2) {
              // Stufe 2: Doppelter Säure-Mörser mit blubberndem Gift-Zylinder
              ctx.fillStyle = '#166534';
              ctx.fillRect(15, 5, 4.5, 16);
              ctx.fillRect(24.5, 5, 4.5, 16);

              const bioGrad = ctx.createRadialGradient(22, 16, 1, 22, 16, 7);
              bioGrad.addColorStop(0, '#86efac');
              bioGrad.addColorStop(0.6, '#16a34a');
              bioGrad.addColorStop(1, '#052e16');
              ctx.fillStyle = bioGrad;
              ctx.beginPath();
              ctx.arc(22, 16, 6.5, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = theme.ring;
              ctx.lineWidth = 2;
              ctx.stroke();
            } else {
              // Stufe 3: Virulenter Bio-Reaktor (Seuchen-Zitadelle mit Auslass-Kaminen)
              ctx.fillStyle = '#052e16';
              ctx.fillRect(12, 3, 5, 18);
              ctx.fillRect(27, 3, 5, 18);

              // Kamin-Mündungen
              ctx.fillStyle = '#22c55e';
              ctx.beginPath();
              ctx.arc(14.5, 3, 3, 0, Math.PI * 2);
              ctx.arc(29.5, 3, 3, 0, Math.PI * 2);
              ctx.fill();

              // Zentraler bioaktiver Kern
              const toxicGrad = ctx.createRadialGradient(22, 14, 2, 22, 14, 8);
              toxicGrad.addColorStop(0, '#ffffff');
              toxicGrad.addColorStop(0.3, '#4ade80');
              toxicGrad.addColorStop(0.7, '#15803d');
              toxicGrad.addColorStop(1, '#052e16');
              ctx.fillStyle = toxicGrad;
              ctx.beginPath();
              ctx.arc(22, 14, 8, 0, Math.PI * 2);
              ctx.fill();

              // Biohazard-Dreieck
              ctx.fillStyle = '#facc15';
              ctx.beginPath();
              ctx.moveTo(22, 11); ctx.lineTo(25, 16); ctx.lineTo(19, 16);
              ctx.closePath();
              ctx.fill();
            }
          } else if (type === 'tesla') {
            // TACHYON-PLASMA-RELAIS / PROTOSS-STIL PYLON
            if (lvl === 1) {
              // Stufe 1: Kupfer-Induktionsspule mit Elektrode
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(20, 8, 4, 15);

              ctx.strokeStyle = '#b45309';
              ctx.lineWidth = 2;
              ctx.strokeRect(17, 12, 10, 8);

              // Plasmakugel
              const orbGrad = ctx.createRadialGradient(22, 7, 1, 22, 7, 5);
              orbGrad.addColorStop(0, '#ffffff');
              orbGrad.addColorStop(0.5, '#38bdf8');
              orbGrad.addColorStop(1, '#0369a1');
              ctx.fillStyle = orbGrad;
              ctx.beginPath();
              ctx.arc(22, 7, 5, 0, Math.PI * 2);
              ctx.fill();
            } else if (lvl === 2) {
              // Stufe 2: Doppel-Teslamast mit Hochvolt-Lichtbogen
              ctx.fillStyle = '#1e293b';
              ctx.fillRect(14, 6, 3.5, 17);
              ctx.fillRect(26.5, 6, 3.5, 17);

              ctx.fillStyle = '#38bdf8';
              ctx.beginPath();
              ctx.arc(15.75, 5, 3.5, 0, Math.PI * 2);
              ctx.arc(28.25, 5, 3.5, 0, Math.PI * 2);
              ctx.fill();

              // Blitzbogen zwischen Polen
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(16, 5);
              ctx.lineTo(22, 7);
              ctx.lineTo(28, 5);
              ctx.stroke();
            } else {
              // Stufe 3: Protoss-Stil Tachyon Storm Obelisk (Schwebende Kristallspitze mit Magnetringen)
              ctx.strokeStyle = theme.ring;
              ctx.lineWidth = 2.2;
              ctx.beginPath();
              ctx.ellipse(22, 12, 15, 6, 0, 0, Math.PI * 2);
              ctx.stroke();

              // Vertikaler Obelisk
              const pylonGrad = ctx.createLinearGradient(16, 0, 28, 22);
              pylonGrad.addColorStop(0, '#ffffff');
              pylonGrad.addColorStop(0.3, '#38bdf8');
              pylonGrad.addColorStop(0.7, '#0284c7');
              pylonGrad.addColorStop(1, '#082f49');
              ctx.fillStyle = pylonGrad;
              ctx.beginPath();
              ctx.moveTo(22, 0);
              ctx.lineTo(29, 13);
              ctx.lineTo(22, 23);
              ctx.lineTo(15, 13);
              ctx.closePath();
              ctx.fill();

              // Energie-Lichtkante
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(22, 0);
              ctx.lineTo(22, 23);
              ctx.stroke();
            }
          } else if (type === 'sniper') {
            // PRÄZISIONS-RAILGUN BUNKER
            if (lvl === 1) {
              // Stufe 1: Flache Bunkerkuppel mit langem Rail-Lauf
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(20, 2, 4, 21);

              ctx.fillStyle = theme.ring;
              ctx.fillRect(19, 1, 6, 2.5);

              // Visier-Optik
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(22, 12, 2, 0, Math.PI * 2);
              ctx.fill();
            } else if (lvl === 2) {
              // Stufe 2: Schweres Gauss-Gewehr mit Kühlrippen & Laserstrahl
              ctx.fillStyle = '#1e293b';
              ctx.fillRect(19.5, 0, 5, 23);

              // Kühlrippen
              ctx.fillStyle = '#64748b';
              ctx.fillRect(18, 6, 8, 2);
              ctx.fillRect(18, 10, 8, 2);
              ctx.fillRect(18, 14, 8, 2);

              // Mündungs-Kompensator
              ctx.fillStyle = theme.ring;
              ctx.fillRect(17.5, 0, 9, 3);

              // Roter Ziel-Laser
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(22, 0);
              ctx.lineTo(22, -15);
              ctx.stroke();
            } else {
              // Stufe 3: Orbitale Kinetik-Railgun Plattform (Verlängerte Zwillings-Beschleuniger)
              ctx.fillStyle = '#090d16';
              ctx.fillRect(18, -3, 8, 26);

              // Magnetische Beschleuniger-Schienen
              ctx.fillStyle = theme.ring;
              ctx.fillRect(17, -4, 2, 24);
              ctx.fillRect(25, -4, 2, 24);

              // Mündungsstabilisator
              ctx.fillStyle = '#f87171';
              ctx.fillRect(16, -5, 12, 3);

              // Multi-Spektral Zielradar-Kuppel
              ctx.fillStyle = '#38bdf8';
              ctx.beginPath();
              ctx.arc(22, 14, 4, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(22, 14, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (type === 'flamethrower') {
            // SCHWERER FEUERSTURM-WERFER
            if (lvl === 1) {
              ctx.fillStyle = '#b45309';
              ctx.fillRect(19, 5, 6, 18);
              ctx.fillStyle = '#f97316';
              ctx.fillRect(18, 3, 8, 3);
              ctx.fillStyle = '#ef4444';
              ctx.fillRect(9, 20, 6, 7);
            } else if (lvl === 2) {
              ctx.fillStyle = '#7c2d12';
              ctx.fillRect(16, 3, 5, 20);
              ctx.fillRect(23, 3, 5, 20);
              ctx.fillStyle = '#ea580c';
              ctx.fillRect(15, 1, 14, 3);
              ctx.fillStyle = '#fbbf24';
              ctx.fillRect(8, 18, 6, 9);
              ctx.fillRect(30, 18, 6, 9);
            } else {
              ctx.fillStyle = '#450a0a';
              ctx.fillRect(14, 1, 6, 22);
              ctx.fillRect(24, 1, 6, 22);
              ctx.fillStyle = '#ef4444';
              ctx.fillRect(13, -1, 18, 3.5);
              ctx.fillStyle = '#facc15';
              ctx.beginPath(); ctx.arc(22, 12, 3.5, 0, Math.PI * 2); ctx.fill();
            }
          } else if (type === 'plasma_pylon') {
            // PROTOSS-STIL PLASMA-PYLONE
            const pylonGrad = ctx.createLinearGradient(16, 2, 28, 24);
            pylonGrad.addColorStop(0, '#38bdf8');
            pylonGrad.addColorStop(0.5, '#0284c7');
            pylonGrad.addColorStop(1, '#0c4a6e');
            ctx.fillStyle = pylonGrad;
            ctx.beginPath();
            ctx.moveTo(22, 0); ctx.lineTo(29, 14); ctx.lineTo(22, 24); ctx.lineTo(15, 14); ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(22, 10, lvl + 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#00f2fe';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(22, 10, lvl + 4, 0, Math.PI * 2); ctx.stroke();
          } else if (type === 'orbital_laser') {
            // ORBITAL-UPLINK & GEODÄTISCHER ZIELRADAR
            ctx.fillStyle = '#1e293b';
            ctx.beginPath(); ctx.arc(22, 14, 10, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.arc(22, 14, 8, 0, Math.PI * 2); ctx.stroke();

            ctx.fillStyle = '#ef4444';
            ctx.beginPath(); ctx.arc(22, 14, 3 + lvl, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(22, 14, 1.5, 0, Math.PI * 2); ctx.fill();
          } else if (type === 'chrono_disruptor') {
            // TEMPORAL-VERZERRUNGS KERN
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.ellipse(22, 14, 11, 6, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(22, 14, 6, 11, 0, 0, Math.PI * 2); ctx.stroke();

            const chronoGrad = ctx.createRadialGradient(22, 14, 1, 22, 14, 6);
            chronoGrad.addColorStop(0, '#ffffff');
            chronoGrad.addColorStop(0.5, '#38bdf8');
            chronoGrad.addColorStop(1, '#1e1b4b');
            ctx.fillStyle = chronoGrad;
            ctx.beginPath(); ctx.arc(22, 14, 5, 0, Math.PI * 2); ctx.fill();
          } else if (type === 'bio_hive') {
            // ZERG-INSPIRIERTER BIO-ORGANISCHER BRUTTURM
            const hiveGrad = ctx.createRadialGradient(22, 16, 2, 22, 16, 12);
            hiveGrad.addColorStop(0, '#84cc16');
            hiveGrad.addColorStop(0.5, '#4d7c0f');
            hiveGrad.addColorStop(1, '#1e0538');
            ctx.fillStyle = hiveGrad;
            ctx.beginPath(); ctx.arc(22, 16, 10, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.moveTo(14, 10); ctx.lineTo(10, 2); ctx.lineTo(18, 7); ctx.closePath();
            ctx.moveTo(30, 10); ctx.lineTo(34, 2); ctx.lineTo(26, 7); ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#bef264';
            ctx.fillRect(19, 13, 3, 3);
            ctx.fillRect(23, 13, 3, 3);
          }
        });
      }
    });

    // Meister-Spezialisierungen A & B mit leuchtenden Prunk-Auren
    towerTypes.forEach((type) => {
      ['spec_a', 'spec_b'].forEach((specKey) => {
        const key = `tower_${type}_${specKey}`;
        const isPathA = specKey === 'spec_a';
        const auraColor = isPathA ? '#00d2d3' : '#a855f7';

        create(key, 44, 44, (ctx) => {
          // Basis-Stufe-3 Rendering
          const baseImg = tm.get(`tower_${type}_3`).getSourceImage() as CanvasImageSource;
          if (baseImg) {
            ctx.drawImage(baseImg, 0, 0, 44, 44);
          }

          // Taktische Meister-Aura
          ctx.strokeStyle = auraColor;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(22, 28, 19, 10, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Meister-Insignie
          ctx.fillStyle = auraColor;
          ctx.beginPath();
          ctx.moveTo(19, 4); ctx.lineTo(22, 0); ctx.lineTo(25, 4);
          ctx.closePath();
          ctx.fill();
        });
      });
    });
  }
}
