import Phaser from 'phaser';

/**
 * RTSAssetGenerator
 * Generiert hochwertige, vorgerenderte 2.5D-Isometrie-Grafiken im Stil von StarCraft II.
 * Alle Sprites besitzen vorberechnete gerichtete Beleuchtung (Top-Left),
 * Umgebungsverdeckung (Ambient Occlusion), metallische Glanzlichter und weiche Bodenschatten.
 */
export class RTSAssetGenerator {
  public static generateAll(scene: Phaser.Scene): void {
    const tm = scene.textures;

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
    // 1. ISOMETRISCHE TERRAIN-PLATTFORM (StarCraft II Terran/Orbital)
    // ==========================================
    create('rts_terrain_metal_platform', 1280, 720, (ctx) => {
      // Tiefes Weltraum-/Schlucht-Hintergrundgrün
      const spaceGrad = ctx.createLinearGradient(0, 0, 0, 720);
      spaceGrad.addColorStop(0, '#0a0d14');
      spaceGrad.addColorStop(0.5, '#121824');
      spaceGrad.addColorStop(1, '#090b10');
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, 1280, 720);

      // Funkelnde Sterne & ferne kosmische Nebel
      for (let s = 0; s < 45; s++) {
        const sx = (s * 97 + 13) % 1280;
        const sy = (s * 53 + 7) % 720;
        ctx.fillStyle = s % 3 === 0 ? 'rgba(56, 189, 248, 0.75)' : 'rgba(255, 255, 255, 0.65)';
        ctx.fillRect(sx, sy, s % 4 === 0 ? 2 : 1, s % 4 === 0 ? 2 : 1);
      }

      // 1. Untere Ebene / Abgrund-Schatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 44, 1280, 720 - 44 - 150);

      // 2. Erhöhte industrielle Plattform (Terran Space Platform)
      const platX = 40;
      const platY = 55;
      const platW = 1200;
      const platH = 490;

      // Plattform-Schatten nach rechts unten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.roundRect(platX + 16, platY + 18, platW, platH, 16);
      ctx.fill();

      // Plattform-Metallgrund
      const platGrad = ctx.createLinearGradient(platX, platY, platX + platW, platY + platH);
      platGrad.addColorStop(0, '#2b3342');
      platGrad.addColorStop(0.3, '#1f2532');
      platGrad.addColorStop(0.7, '#181e29');
      platGrad.addColorStop(1, '#131720');
      ctx.fillStyle = platGrad;
      ctx.beginPath();
      ctx.roundRect(platX, platY, platW, platH, 14);
      ctx.fill();

      // Kanten-Fasen (Bevel & Specular Highlight oben/links)
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#4f5d75';
      ctx.stroke();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(120, 160, 220, 0.35)';
      ctx.beginPath();
      ctx.moveTo(platX + 14, platY + 2);
      ctx.lineTo(platX + platW - 14, platY + 2);
      ctx.stroke();

      // 3. Isometrische Rauten-Bodenplatten (Isometric Steel Grid)
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(60, 75, 98, 0.28)';
      const tileW = 60;
      const tileH = 30;

      for (let y = platY + 20; y < platY + platH - 20; y += tileH) {
        for (let x = platX + 20; x < platX + platW - 20; x += tileW) {
          ctx.beginPath();
          ctx.moveTo(x, y + tileH / 2);
          ctx.lineTo(x + tileW / 2, y);
          ctx.lineTo(x + tileW, y + tileH / 2);
          ctx.lineTo(x + tileW / 2, y + tileH);
          ctx.closePath();
          ctx.stroke();

          // Subtile Nietpunkte
          ctx.fillStyle = 'rgba(80, 100, 130, 0.3)';
          ctx.fillRect(x + tileW / 2 - 1, y + tileH / 2 - 1, 2, 2);
        }
      }
      ctx.restore();

      // 4. Gelb-Schwarze Industrie-Warnstreifen an den Rändern (Hazard Stripes)
      const drawHazardStripe = (hx: number, hy: number, hw: number, hh: number) => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(hx, hy, hw, hh);
        ctx.clip();
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(hx, hy, hw, hh);
        ctx.fillStyle = '#1e1e1e';
        for (let s = -hh; s < hw + hh; s += 16) {
          ctx.beginPath();
          ctx.moveTo(hx + s, hy);
          ctx.lineTo(hx + s + 8, hy);
          ctx.lineTo(hx + s + 8 - hh, hy + hh);
          ctx.lineTo(hx + s - hh, hy + hh);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(hx, hy, hw, hh);
      };

      drawHazardStripe(platX + 16, platY + 12, 160, 8);
      drawHazardStripe(platX + platW - 176, platY + 12, 160, 8);
      drawHazardStripe(platX + 16, platY + platH - 20, 160, 8);
      drawHazardStripe(platX + platW - 176, platY + platH - 20, 160, 8);

      // 5. Versenkte Lüftungsschächte mit blauem Plasmaschimmer
      const vents = [
        { x: platX + 240, y: platY + 60, w: 90, h: 40 },
        { x: platX + platW - 320, y: platY + 380, w: 90, h: 40 }
      ];

      vents.forEach((v) => {
        // Schacht-Vertiefung
        ctx.fillStyle = '#0b0e14';
        ctx.fillRect(v.x, v.y, v.w, v.h);
        ctx.strokeStyle = '#384252';
        ctx.lineWidth = 2;
        ctx.strokeRect(v.x, v.y, v.w, v.h);

        // Cyan-Glut
        const glow = ctx.createRadialGradient(v.x + v.w / 2, v.y + v.h / 2, 2, v.x + v.w / 2, v.y + v.h / 2, v.w / 2);
        glow.addColorStop(0, 'rgba(0, 210, 255, 0.45)');
        glow.addColorStop(1, 'rgba(0, 210, 255, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(v.x, v.y, v.w, v.h);

        // Gitterstäbe
        ctx.strokeStyle = '#232936';
        ctx.lineWidth = 2;
        for (let gx = v.x + 8; gx < v.x + v.w; gx += 8) {
          ctx.beginPath();
          ctx.moveTo(gx, v.y);
          ctx.lineTo(gx, v.y + v.h);
          ctx.stroke();
        }
      });
    });

    // ==========================================
    // 1b. ZERG CREEP BIOME (Lebendiger violetter Bio-Teppich mit Adern)
    // ==========================================
    create('rts_terrain_creep', 1280, 720, (ctx) => {
      // 1. Dunkler infizierter Vulkan-/Aschegrund (Char / Zerus)
      const baseGrad = ctx.createLinearGradient(0, 0, 0, 720);
      baseGrad.addColorStop(0, '#15091d');
      baseGrad.addColorStop(0.5, '#240f31');
      baseGrad.addColorStop(1, '#110718');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, 1280, 720);

      const platX = 40;
      const platY = 55;
      const platW = 1200;
      const platH = 490;

      // Plattform-Schatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.roundRect(platX + 16, platY + 18, platW, platH, 18);
      ctx.fill();

      // Organischer Creep-Bodenkörper
      const creepGrad = ctx.createLinearGradient(platX, platY, platX + platW, platY + platH);
      creepGrad.addColorStop(0, '#421657');
      creepGrad.addColorStop(0.3, '#581c73');
      creepGrad.addColorStop(0.7, '#38104b');
      creepGrad.addColorStop(1, '#260a34');
      ctx.fillStyle = creepGrad;
      ctx.beginPath();
      ctx.roundRect(platX, platY, platW, platH, 16);
      ctx.fill();
      ctx.strokeStyle = '#8b2ca8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 2. Weiche organische Bio-Wülste & Creep-Polster
      for (let i = 0; i < 35; i++) {
        const bx = platX + 60 + ((i * 137) % (platW - 120));
        const by = platY + 40 + ((i * 89) % (platH - 80));
        const br = 35 + (i % 5) * 15;
        const bGrad = ctx.createRadialGradient(bx, by, 4, bx, by, br);
        bGrad.addColorStop(0, 'rgba(126, 34, 206, 0.45)');
        bGrad.addColorStop(0.6, 'rgba(88, 28, 135, 0.25)');
        bGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Pulsierende vaskuläre Creep-Adern (Creep Veins)
      ctx.save();
      const veins = [
        [ { x: 120, y: 180 }, { x: 340, y: 160 }, { x: 580, y: 220 }, { x: 840, y: 190 }, { x: 1100, y: 240 } ],
        [ { x: 160, y: 380 }, { x: 420, y: 410 }, { x: 680, y: 360 }, { x: 920, y: 430 }, { x: 1140, y: 390 } ],
        [ { x: 300, y: 100 }, { x: 380, y: 260 }, { x: 440, y: 460 } ],
        [ { x: 780, y: 110 }, { x: 830, y: 290 }, { x: 890, y: 480 } ]
      ];

      veins.forEach((pts) => {
        // Äußerer violetter Schein
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let j = 1; j < pts.length; j++) {
          ctx.lineTo(pts[j].x, pts[j].y);
        }
        ctx.stroke();

        // Kern-Ader in hellem Magenta
        ctx.strokeStyle = 'rgba(232, 121, 249, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let j = 1; j < pts.length; j++) {
          ctx.lineTo(pts[j].x, pts[j].y);
        }
        ctx.stroke();
      });
      ctx.restore();

      // 4. Glänzende feuchte Schleim-Highlights (Mucous Specular Gloss)
      for (let s = 0; s < 24; s++) {
        const mx = platX + 80 + ((s * 191) % (platW - 160));
        const my = platY + 50 + ((s * 113) % (platH - 100));
        ctx.fillStyle = 'rgba(243, 232, 255, 0.22)';
        ctx.beginPath();
        ctx.ellipse(mx, my, 22, 7, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Creep-Tumore & glühende Säure-Pusteln (Biolumineszenz)
      const tumors = [
        { x: platX + 180, y: platY + 130, r: 18 },
        { x: platX + 540, y: platY + 410, r: 22 },
        { x: platX + platW - 240, y: platY + 120, r: 20 },
        { x: platX + platW - 420, y: platY + 400, r: 16 }
      ];

      tumors.forEach((t) => {
        // Grüner Giftnebel
        const pGlow = ctx.createRadialGradient(t.x, t.y, 2, t.x, t.y, t.r * 2.2);
        pGlow.addColorStop(0, 'rgba(163, 230, 53, 0.55)');
        pGlow.addColorStop(0.5, 'rgba(101, 163, 13, 0.25)');
        pGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = pGlow;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Pustel-Körper
        const pGrad = ctx.createRadialGradient(t.x - 3, t.y - 3, 2, t.x, t.y, t.r);
        pGrad.addColorStop(0, '#bef264');
        pGrad.addColorStop(0.5, '#65a30d');
        pGrad.addColorStop(1, '#365314');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d9f99d';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glanzreflex
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(t.x - 4, t.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // 6. Eruptierte Zerg-Chitinstacheln an den Plattform-Kanten
      for (let k = 0; k < 12; k++) {
        const kx = platX + 50 + k * 95;
        const ky = platY + 14;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(kx, ky);
        ctx.lineTo(kx + 7, ky - 14);
        ctx.lineTo(kx + 14, ky);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#713f12';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // ==========================================
    // 1c. ALIEN NATURE JUNGLE BIOME (Bel'Shir / Shakuras Tropenwald mit Kristallen)
    // ==========================================
    create('rts_terrain_jungle', 1280, 720, (ctx) => {
      // 1. Tiefes Dschungel-Schattenbett
      const jungleGrad = ctx.createLinearGradient(0, 0, 0, 720);
      jungleGrad.addColorStop(0, '#0c1a12');
      jungleGrad.addColorStop(0.5, '#142c1e');
      jungleGrad.addColorStop(1, '#09150e');
      ctx.fillStyle = jungleGrad;
      ctx.fillRect(0, 0, 1280, 720);

      const platX = 40;
      const platY = 55;
      const platW = 1200;
      const platH = 490;

      // Plattform-Klippen-Schatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.roundRect(platX + 16, platY + 18, platW, platH, 18);
      ctx.fill();

      // Sattes, feuchtes Moos- & Dschungelgras
      const grassGrad = ctx.createLinearGradient(platX, platY, platX + platW, platY + platH);
      grassGrad.addColorStop(0, '#1c4728');
      grassGrad.addColorStop(0.3, '#2a633a');
      grassGrad.addColorStop(0.7, '#1b4025');
      grassGrad.addColorStop(1, '#13301c');
      ctx.fillStyle = grassGrad;
      ctx.beginPath();
      ctx.roundRect(platX, platY, platW, platH, 16);
      ctx.fill();
      ctx.strokeStyle = '#38a169';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 2. Feine Stein-Kanten und Sediment-Schichten
      for (let s = 0; s < 40; s++) {
        const gx = platX + 40 + ((s * 157) % (platW - 80));
        const gy = platY + 30 + ((s * 97) % (platH - 60));
        ctx.fillStyle = s % 2 === 0 ? 'rgba(46, 117, 89, 0.25)' : 'rgba(15, 45, 25, 0.35)';
        ctx.beginPath();
        ctx.arc(gx, gy, 30 + (s % 4) * 12, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Ikonische blaue StarCraft II Mineralien-Kristallfelder (Blue Minerals)
      const mineralFields = [
        { x: platX + 110, y: platY + 80 },
        { x: platX + 150, y: platY + 95 },
        { x: platX + platW - 180, y: platY + 85 },
        { x: platX + platW - 140, y: platY + 105 },
        { x: platX + 120, y: platY + platH - 80 },
        { x: platX + platW - 160, y: platY + platH - 80 }
      ];

      mineralFields.forEach((mf) => {
        // Kristall-Aura
        const cAura = ctx.createRadialGradient(mf.x, mf.y, 2, mf.x, mf.y, 22);
        cAura.addColorStop(0, 'rgba(56, 189, 248, 0.65)');
        cAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = cAura;
        ctx.beginPath();
        ctx.arc(mf.x, mf.y, 22, 0, Math.PI * 2);
        ctx.fill();

        // Polygonal geschliffene Kristall-Spieße
        const mGrad = ctx.createLinearGradient(mf.x - 8, mf.y - 14, mf.x + 8, mf.y + 14);
        mGrad.addColorStop(0, '#e0f2fe');
        mGrad.addColorStop(0.4, '#38bdf8');
        mGrad.addColorStop(0.8, '#0284c7');
        mGrad.addColorStop(1, '#0c4a6e');
        ctx.fillStyle = mGrad;

        ctx.beginPath();
        ctx.moveTo(mf.x, mf.y - 18);
        ctx.lineTo(mf.x + 9, mf.y - 2);
        ctx.lineTo(mf.x + 6, mf.y + 12);
        ctx.lineTo(mf.x - 6, mf.y + 12);
        ctx.lineTo(mf.x - 9, mf.y - 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#f0f9ff';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Glanzpunkt
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(mf.x - 2, mf.y - 8, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Exotische leuchtende Alien-Dschungelblüten (Magenta & Türkis)
      for (let f = 0; f < 35; f++) {
        const fx = platX + 70 + ((f * 181) % (platW - 140));
        const fy = platY + 45 + ((f * 109) % (platH - 90));
        ctx.fillStyle = f % 2 === 0 ? '#f43f5e' : '#06b6d4';
        ctx.beginPath();
        ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // ==========================================
    // 2. TURM 1: SIEGE GAUSS CANNON (Terran Siege Tank Style)
    // ==========================================
    // 2.1 Basis mit Hydraulikfüßen & Schatten
    create('rts_tower_cannon_base', 76, 76, (ctx) => {
      const cx = 38;
      const cy = 40;

      // 1. Richtungs-Bodenschatten (Projektion nach rechts unten)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(cx + 8, cy + 12, 32, 16, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // 2. 4 Hydraulische Ausleger (Stützbeine)
      const legs = [
        { angle: -Math.PI * 0.75 },
        { angle: -Math.PI * 0.25 },
        { angle: Math.PI * 0.25 },
        { angle: Math.PI * 0.75 }
      ];

      legs.forEach((l) => {
        const lx = cx + Math.cos(l.angle) * 26;
        const ly = cy + Math.sin(l.angle) * 16;
        ctx.fillStyle = '#222834';
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(lx - 6, ly - 4, 12, 8, 2);
        ctx.fill();
        ctx.stroke();
      });

      // 3. Oktogonales Bunker-Fundament
      ctx.save();
      ctx.translate(cx, cy);
      const rad = 24;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const x = Math.cos(a) * rad;
        const y = Math.sin(a) * (rad * 0.65); // Isometrisch gestaucht
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      const bGrad = ctx.createLinearGradient(-20, -20, 20, 20);
      bGrad.addColorStop(0, '#536179');
      bGrad.addColorStop(0.4, '#374151');
      bGrad.addColorStop(1, '#1f2937');
      ctx.fillStyle = bGrad;
      ctx.fill();
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Zwillings-Lüfter auf Basis
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(-8, 3, 5, 0, Math.PI * 2);
      ctx.arc(8, 3, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 2.2 Drehbares schweres Zwillings-Gauss-Geschütz
    create('rts_tower_cannon_turret', 80, 80, (ctx) => {
      const cx = 40;
      const cy = 40;

      // Drehbare Turm-Kuppel
      const tGrad = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, 18);
      tGrad.addColorStop(0, '#718096');
      tGrad.addColorStop(0.6, '#4a5568');
      tGrad.addColorStop(1, '#2d3748');
      ctx.fillStyle = tGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Zwillings-Kanonenläufe (nach rechts ausgerichtet für Standard-Drehung)
      ctx.fillStyle = '#1f2937';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;

      // Oberer Lauf
      ctx.fillRect(cx + 8, cy - 7, 26, 5);
      ctx.strokeRect(cx + 8, cy - 7, 26, 5);
      // Mündungsbremse
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(cx + 31, cy - 8, 4, 7);

      // Unterer Lauf
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(cx + 8, cy + 2, 26, 5);
      ctx.strokeRect(cx + 8, cy + 2, 26, 5);
      // Mündungsbremse
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(cx + 31, cy + 1, 4, 7);

      // Terran Team-Farbstreifen (Rot/Orange Akzent)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx - 10, cy - 3, 14, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx + 2, cy - 2, 4, 4); // Zieloptik-Sensor
    });

    // ==========================================
    // 3. TURM 2: PHOTON PLASMA PYLON (Protoss Style)
    // ==========================================
    // 3.1 Pylon-Pylonenfuß mit Goldlegierung
    create('rts_tower_tesla_base', 76, 76, (ctx) => {
      const cx = 38;
      const cy = 40;

      // Weicher Bodenschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(cx + 6, cy + 10, 30, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Runenkreis am Boden
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 22, 12, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 3 Geometrische Titan-Pylonen (Gold-/Bronze-Legierung)
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3 - Math.PI / 2;
        const px = cx + Math.cos(a) * 16;
        const py = cy + Math.sin(a) * 10;

        ctx.save();
        ctx.translate(px, py);
        const pGrad = ctx.createLinearGradient(-8, -14, 8, 14);
        pGrad.addColorStop(0, '#fde047');
        pGrad.addColorStop(0.5, '#ca8a04');
        pGrad.addColorStop(1, '#713f12');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(7, 4);
        ctx.lineTo(-7, 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }
    });

    // 3.2 Schwebender Plasma-Energiekern (Levitierend & Pulsierend)
    create('rts_tower_tesla_core', 60, 60, (ctx) => {
      const cx = 30;
      const cy = 30;

      // Äußere Energie-Aura
      const aGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 28);
      aGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
      aGrad.addColorStop(0.5, 'rgba(147, 51, 234, 0.45)');
      aGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fill();

      // Innerer Kristall-Kern
      const kGrad = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, 14);
      kGrad.addColorStop(0, '#ffffff');
      kGrad.addColorStop(0.3, '#38bdf8');
      kGrad.addColorStop(0.7, '#6366f1');
      kGrad.addColorStop(1, '#312e81');
      ctx.fillStyle = kGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx + 12, cy);
      ctx.lineTo(cx, cy + 14);
      ctx.lineTo(cx - 12, cy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // ==========================================
    // 4. TURM 3: SENTRY GATLING BUNKER (Terran Phalanx Style)
    // ==========================================
    create('rts_tower_sniper_base', 76, 76, (ctx) => {
      const cx = 38;
      const cy = 40;

      // Schatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(cx + 8, cy + 12, 32, 16, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Robuste Bunker-Kuppel
      const bGrad = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, 24);
      bGrad.addColorStop(0, '#64748b');
      bGrad.addColorStop(0.7, '#334155');
      bGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 26, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sehschlitze / Panzerschotten
      ctx.fillStyle = '#020617';
      ctx.fillRect(cx - 14, cy - 4, 28, 4);
    });

    create('rts_tower_sniper_turret', 80, 80, (ctx) => {
      const cx = 40;
      const cy = 40;

      // Geschützkopf
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Langer Railgun-/Laser-Lauf mit Ladekondensatoren
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.fillRect(cx + 8, cy - 3, 30, 6);
      ctx.strokeRect(cx + 8, cy - 3, 30, 6);

      // Leuchtende Kondensator-Ringe
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx + 14, cy - 4, 3, 8);
      ctx.fillRect(cx + 22, cy - 4, 3, 8);
      ctx.fillRect(cx + 30, cy - 4, 3, 8);
    });

    // ==========================================
    // 5. ISOMETRISCHE RTS-EINHEITEN (3D-Look & Schatten)
    // ==========================================
    // 5.1 Echter StarCraft II Zergling (HD mit Flügelsicheln & Klauen)
    create('rts_unit_zergling', 60, 60, (ctx) => {
      const cx = 30;
      const cy = 30;

      // 1. Weicher gerichteter Bodenschatten (Top-Left Licht)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
      ctx.beginPath();
      ctx.ellipse(cx + 4, cy + 9, 22, 9, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // 2. Kraftvolle Hinterbeine (Digitigrade Zerg-Sprungbeine)
      ctx.fillStyle = '#4a0e4e';
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 1.2;
      // Linkes Hinterbein
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + 4);
      ctx.lineTo(cx - 18, cy + 14);
      ctx.lineTo(cx - 24, cy + 11);
      ctx.stroke();
      // Rechtes Hinterbein
      ctx.beginPath();
      ctx.moveTo(cx + 6, cy + 4);
      ctx.lineTo(cx + 15, cy + 15);
      ctx.lineTo(cx + 21, cy + 12);
      ctx.stroke();

      // 3. Chitin-gepanzerter Zergling-Körper
      const bGrad = ctx.createLinearGradient(cx - 12, cy - 8, cx + 12, cy + 8);
      bGrad.addColorStop(0, '#a855f7');
      bGrad.addColorStop(0.4, '#6b21a8');
      bGrad.addColorStop(0.8, '#3b0764');
      bGrad.addColorStop(1, '#200538');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.ellipse(cx - 2, cy + 1, 15, 9, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d8b4fe';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Carapax-Panzerplatten-Rippen
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx - 6, cy, 6, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 7, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      // 4. IKONISCHE FLÜGELSICHELN / DORSAL-STACHELN (Zergling Wing Spikes)
      // Linke Rückensichel (Elfenbein-Knochen mit Chitin-Gelenk)
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy - 2);
      ctx.quadraticCurveTo(cx - 16, cy - 20, cx - 12, cy - 24);
      ctx.quadraticCurveTo(cx - 6, cy - 14, cx - 1, cy - 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Rechte Rückensichel
      ctx.beginPath();
      ctx.moveTo(cx + 3, cy - 3);
      ctx.quadraticCurveTo(cx + 12, cy - 21, cx + 18, cy - 24);
      ctx.quadraticCurveTo(cx + 12, cy - 13, cx + 7, cy - 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 5. Raubtier-Kopf mit Unterkiefer-Mandibeln & Zähnen
      const hGrad = ctx.createRadialGradient(cx + 12, cy - 2, 2, cx + 10, cy, 10);
      hGrad.addColorStop(0, '#c084fc');
      hGrad.addColorStop(0.6, '#7e22ce');
      hGrad.addColorStop(1, '#4c1d95');
      ctx.fillStyle = hGrad;
      ctx.beginPath();
      ctx.ellipse(cx + 10, cy - 1, 9, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f5d0fe';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Scharfe weiße Fangzähne
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx + 16, cy); ctx.lineTo(cx + 19, cy + 4); ctx.lineTo(cx + 15, cy + 2);
      ctx.moveTo(cx + 13, cy + 1); ctx.lineTo(cx + 15, cy + 5); ctx.lineTo(cx + 12, cy + 2);
      ctx.fill();

      // Glühende Raubtier-Augen (Bernsteingelb)
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(cx + 11, cy - 3, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx + 11, cy - 3, 1, 1); // Specular Glint
    });

    // 5.2 StarCraft II Hydralisk (Schwerer Zerg-Fernkämpfer)
    create('rts_unit_hydralisk', 64, 64, (ctx) => {
      const cx = 32;
      const cy = 32;

      // Bodenschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
      ctx.beginPath();
      ctx.ellipse(cx + 5, cy + 12, 25, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // 1. Schlangenkörper / Raupen-Unterleib
      const sGrad = ctx.createLinearGradient(cx - 18, cy + 12, cx + 18, cy + 12);
      sGrad.addColorStop(0, '#4a154b');
      sGrad.addColorStop(0.5, '#701a75');
      sGrad.addColorStop(1, '#2e0836');
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.ellipse(cx - 2, cy + 10, 18, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Aufrechter Torso
      ctx.fillStyle = '#581c87';
      ctx.beginPath();
      ctx.roundRect(cx - 8, cy - 8, 16, 18, 4);
      ctx.fill();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 3. Markanter Hydralisken-Kopfkamm (Carapace Crest)
      const cGrad = ctx.createLinearGradient(cx - 10, cy - 24, cx + 10, cy - 8);
      cGrad.addColorStop(0, '#86198f');
      cGrad.addColorStop(0.5, '#4a044e');
      cGrad.addColorStop(1, '#1e0220');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy - 10);
      ctx.lineTo(cx, cy - 24);
      ctx.lineTo(cx + 9, cy - 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4. Mächtige Sensen-Arme (Scythe Arms)
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 1.5;
      // Linke Klinge
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 2);
      ctx.quadraticCurveTo(cx - 22, cy - 12, cx - 20, cy + 6);
      ctx.lineTo(cx - 14, cy + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Rechte Klinge
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy - 2);
      ctx.quadraticCurveTo(cx + 22, cy - 12, cx + 20, cy + 6);
      ctx.lineTo(cx + 14, cy + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glühende Gift-Sporen
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(cx - 1, cy - 6, 2, 0, Math.PI * 2);
      ctx.arc(cx + 3, cy - 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 5.2 Goliath-Style "Armored Assault Mech"
    create('rts_unit_mech', 54, 54, (ctx) => {
      const cx = 27;
      const cy = 27;

      // Massiver Bodenschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(cx + 4, cy + 10, 20, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bipolare Beine & Kniegelenke
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 12, cy + 2, 7, 10);
      ctx.fillRect(cx + 5, cy + 2, 7, 10);

      // Gepanzerter Rumpf / Torso
      const mGrad = ctx.createLinearGradient(cx - 12, cy - 14, cx + 12, cy + 4);
      mGrad.addColorStop(0, '#94a3b8');
      mGrad.addColorStop(0.5, '#475569');
      mGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = mGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 14, cy - 14, 28, 18, 4);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Schulter-Raketenpod & Laserkanone
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx - 16, cy - 12, 4, 8);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx + 12, cy - 10, 8, 4);
    });

    // 5.3 Hover Wraith "Void Skimmer" (Schwebend)
    create('rts_unit_skimmer', 52, 52, (ctx) => {
      const cx = 26;
      const cy = 24;

      // Boden-Distanzschatten (Tiefer gelegen für Höhen-Illusion)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(cx + 2, cy + 18, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Aerodynamischer Stealth-Rumpf (Pfeilform)
      const sGrad = ctx.createLinearGradient(cx, cy - 14, cx, cy + 14);
      sGrad.addColorStop(0, '#38bdf8');
      sGrad.addColorStop(0.5, '#0284c7');
      sGrad.addColorStop(1, '#075985');
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.moveTo(cx + 16, cy);
      ctx.lineTo(cx - 14, cy - 12);
      ctx.lineTo(cx - 8, cy);
      ctx.lineTo(cx - 14, cy + 12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Düsen-Glühen (Triebwerk)
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx - 10, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // ==========================================
    // 6. STARCRAFT II RTS BEFEHLSKONSOLE (HUD Rahmen)
    // ==========================================
    create('rts_console_bottom_panel', 1280, 160, (ctx) => {
      // Dunkles Carbon/Titan-Panel
      const cGrad = ctx.createLinearGradient(0, 0, 0, 160);
      cGrad.addColorStop(0, '#1a202c');
      cGrad.addColorStop(0.2, '#111827');
      cGrad.addColorStop(1, '#080c14');
      ctx.fillStyle = cGrad;
      ctx.fillRect(0, 0, 1280, 160);

      // Obere Kantenfase mit Beleuchtungsstreifen
      ctx.strokeStyle = '#4a5568';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(1280, 2);
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(340, 2);
      ctx.lineTo(940, 2);
      ctx.stroke();

      // Rahmen 1: Radar / Minimap (Links, 280x140)
      ctx.fillStyle = '#0a0e17';
      ctx.roundRect(14, 12, 290, 136, 6);
      ctx.fill();
      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Radar-Gitterlinien
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(30, 25, 258, 110);
      ctx.beginPath();
      ctx.arc(159, 80, 45, 0, Math.PI * 2);
      ctx.arc(159, 80, 25, 0, Math.PI * 2);
      ctx.stroke();

      // Rahmen 2: Einheiten-Wireframe & Details (Mitte, 580x136)
      ctx.fillStyle = '#0a0e17';
      ctx.roundRect(320, 12, 600, 136, 6);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Drahtgitter-Fenster links im Center-Panel
      ctx.fillStyle = '#030712';
      ctx.fillRect(332, 22, 116, 116);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(332, 22, 116, 116);

      // Rahmen 3: 3x3 Taktische Befehlskarte (Command Card, Rechts, 320x136)
      ctx.fillStyle = '#0a0e17';
      ctx.roundRect(936, 12, 330, 136, 6);
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 3x3 Button-Plätze
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const bx = 952 + c * 102;
          const by = 22 + r * 40;
          ctx.fillRect(bx, by, 94, 34);
          ctx.strokeRect(bx, by, 94, 34);
        }
      }
    });
  }
}

