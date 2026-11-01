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
    // 5.1 Zergling-Style "Swarm Skitterer"
    create('rts_unit_crawler', 48, 48, (ctx) => {
      const cx = 24;
      const cy = 24;

      // Bodenschatten
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx + 3, cy + 6, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Chitin-Körper (Organisches Violett / Zerg-Braun)
      const cGrad = ctx.createLinearGradient(cx - 8, cy - 8, cx + 8, cy + 8);
      cGrad.addColorStop(0, '#c084fc');
      cGrad.addColorStop(0.5, '#7e22ce');
      cGrad.addColorStop(1, '#3b0764');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 12, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f3e8ff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 4 Klauenbeine
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 4); ctx.lineTo(cx - 15, cy - 10);
      ctx.moveTo(cx + 8, cy - 4); ctx.lineTo(cx + 15, cy - 10);
      ctx.moveTo(cx - 8, cy + 4); ctx.lineTo(cx - 14, cy + 9);
      ctx.moveTo(cx + 8, cy + 4); ctx.lineTo(cx + 14, cy + 9);
      ctx.stroke();

      // Leuchtende Facettenaugen
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(cx + 6, cy - 3, 3, 2);
      ctx.fillRect(cx + 6, cy + 1, 3, 2);
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
