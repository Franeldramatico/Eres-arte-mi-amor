import { Component, ElementRef, OnInit, OnDestroy, viewChild, ChangeDetectionStrategy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface MasterStar {
  xRatio: number;
  yRatio: number;
  coreRadius: number;
  haloRadius: number;
  haloRings: number;
  primaryColor: string;
  glowColor: string;
  pulseSpeed: number;
  pulsePhase: number;
  rotationSpeed: number;
  rotation: number;
  rays: number;
  isMoon?: boolean;
  isVenus?: boolean;
  name?: string;
}

interface SkyRibbonParticle {
  streamId: number;
  u: number;         // Progress along path [0, 1]
  speed: number;
  offsetLateral: number;
  length: number;
  width: number;
  color: string;
  highlightColor: string;
  baseAlpha: number;
}

interface WindowLantern {
  xRatio: number;
  yRatio: number;
  w: number;
  h: number;
  color: string;
  flickerSpeed: number;
  flickerPhase: number;
}

@Component({
  selector: 'app-starry-night-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      <!-- High fidelity dynamic canvas -->
      <canvas #bgCanvas class="w-full h-full block pointer-events-none"></canvas>
      
      <!-- Museum gallery lighting: subtle spotlight centered on canvas & soft vignette -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_50%,rgba(3,6,15,0.7)_100%)] pointer-events-none"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-[#030612]/30 via-transparent to-[#02040a]/80 pointer-events-none"></div>
    </div>
  `
})
export class StarryNightBackground implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  bgCanvas = viewChild<ElementRef<HTMLCanvasElement>>('bgCanvas');

  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private stars: MasterStar[] = [];
  private ribbonStrokes: SkyRibbonParticle[] = [];
  private lanterns: WindowLantern[] = [];
  private width = 0;
  private height = 0;
  private time = 0;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    window.addEventListener('resize', this.onResize, { passive: true });
    
    setTimeout(() => {
      this.initCanvas();
      this.initStars();
      this.initRibbonStrokes();
      this.initLanterns();
      this.startRenderLoop();
    }, 40);
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.onResize);
    }
  }

  private onResize = () => {
    this.initCanvas();
    this.initStars();
    this.initLanterns();
  };

  private initCanvas() {
    const canvas = this.bgCanvas()?.nativeElement;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    canvas.width = this.width * dpr;
    canvas.height = this.height * dpr;

    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  private initStars() {
    this.stars = [];
    if (this.width === 0) return;

    // 1. The Iconic Flaming Crescent Moon & Sun Aura (Upper Right)
    this.stars.push({
      xRatio: 0.85,
      yRatio: 0.16,
      coreRadius: Math.min(38, this.width * 0.032),
      haloRadius: Math.min(125, this.width * 0.095),
      haloRings: 6,
      primaryColor: '#ffea75',
      glowColor: '#ff9e00',
      pulseSpeed: 0.003,      // Very slow and serene
      pulsePhase: 0,
      rotationSpeed: 0.0008,  // Majestic gentle drift
      rotation: -0.22,
      rays: 28,
      isMoon: true,
      name: 'La Luna Creciente de Saint-Rémy'
    });

    // 2. Venus (The Morning Star) - The immense, dazzling white star to the right of the cypress
    this.stars.push({
      xRatio: 0.31,
      yRatio: 0.38,
      coreRadius: Math.min(24, this.width * 0.022),
      haloRadius: Math.min(95, this.width * 0.075),
      haloRings: 5,
      primaryColor: '#ffffff',
      glowColor: '#ffd166',
      pulseSpeed: 0.004,
      pulsePhase: 1.8,
      rotationSpeed: 0.0012,
      rotation: 0.45,
      rays: 22,
      isVenus: true,
      name: 'Venus · El Lucero del Alba'
    });

    // 3. The 9 other astronomical stars painted by Van Gogh (11 stars total)
    const authenticStarData = [
      { rx: 0.14, ry: 0.12, r: 16, hr: 58, rings: 3, c: '#fffae6', gc: '#fdcb6e', rays: 14, phase: 0.5 },
      { rx: 0.23, ry: 0.21, r: 14, hr: 50, rings: 3, c: '#ffd166', gc: '#f39c12', rays: 12, phase: 1.2 },
      { rx: 0.45, ry: 0.13, r: 19, hr: 70, rings: 4, c: '#ffffff', gc: '#ffd166', rays: 16, phase: 2.1 },
      { rx: 0.58, ry: 0.22, r: 15, hr: 54, rings: 3, c: '#ffeaa7', gc: '#e67e22', rays: 14, phase: 3.4 },
      { rx: 0.71, ry: 0.11, r: 18, hr: 64, rings: 4, c: '#ffffff', gc: '#fdcb6e', rays: 16, phase: 4.2 },
      { rx: 0.77, ry: 0.27, r: 16, hr: 56, rings: 3, c: '#ffeaa7', gc: '#ffd166', rays: 14, phase: 5.1 },
      { rx: 0.94, ry: 0.32, r: 13, hr: 46, rings: 3, c: '#ffd166', gc: '#f39c12', rays: 12, phase: 0.9 },
      { rx: 0.17, ry: 0.45, r: 15, hr: 52, rings: 3, c: '#ffffff', gc: '#ffd166', rays: 14, phase: 2.8 },
      { rx: 0.54, ry: 0.42, r: 17, hr: 60, rings: 3, c: '#ffeaa7', gc: '#fdcb6e', rays: 15, phase: 4.7 }
    ];

    authenticStarData.forEach((st, idx) => {
      this.stars.push({
        xRatio: st.rx,
        yRatio: st.ry,
        coreRadius: Math.min(st.r, this.width * 0.018),
        haloRadius: Math.min(st.hr, this.width * 0.058),
        haloRings: st.rings,
        primaryColor: st.c,
        glowColor: st.gc,
        pulseSpeed: 0.0035 + (idx * 0.0003),
        pulsePhase: st.phase,
        rotationSpeed: 0.0007 * (idx % 2 === 0 ? 1 : -1),
        rotation: (idx * Math.PI) / 3,
        rays: st.rays
      });
    });
  }

  private initRibbonStrokes() {
    this.ribbonStrokes = [];
    
    // Exact palette extracted from MoMA's 1889 original:
    // Cobalt, Ultramarine, Prussian Blue, Cerulean, Zinc Yellow, Cadmium Ochre, White
    const palette = [
      { base: '#1b3b6f', hl: '#3a6fb0' }, // French Cobalt Blue
      { base: '#0e244d', hl: '#1d428a' }, // Deep Ultramarine
      { base: '#065a82', hl: '#0096c7' }, // Cerulean
      { base: '#0077b6', hl: '#48cae4' }, // Luminous Azure
      { base: '#ffd166', hl: '#fffae6' }, // Zinc Yellow
      { base: '#ffaa00', hl: '#ffe49e' }, // Warm Cadmium
      { base: '#e9ecef', hl: '#ffffff' }, // Pure Impasto White
      { base: '#d4a373', hl: '#faedcd' }, // Raw Ochre
      { base: '#0b1d3a', hl: '#1c3d73' }  // Midnight Navy
    ];

    // Generate 260 layered impasto brush marks flowing along harmonic curves
    const totalStrokes = 260;
    for (let i = 0; i < totalStrokes; i++) {
      const colorPair = palette[Math.floor(Math.random() * palette.length)];
      const streamId = Math.floor(Math.random() * 5);

      this.ribbonStrokes.push({
        streamId,
        u: Math.random(),
        // Extremely calm, slow drift speed (no rushing or darting)
        speed: 0.00012 + Math.random() * 0.00022,
        offsetLateral: (Math.random() - 0.5) * 85,
        length: 22 + Math.random() * 32,
        width: 3.5 + Math.random() * 3.5,
        color: colorPair.base,
        highlightColor: colorPair.hl,
        baseAlpha: 0.35 + Math.random() * 0.45
      });
    }
  }

  private initLanterns() {
    this.lanterns = [];
    if (this.width === 0) return;

    // Cozy village lantern windows of Saint-Rémy
    for (let i = 0; i < 28; i++) {
      this.lanterns.push({
        xRatio: 0.34 + (i * 0.016) + (Math.random() - 0.5) * 0.01,
        yRatio: 0.86 + (Math.random() - 0.5) * 0.03,
        w: 3 + Math.random() * 2.5,
        h: 4 + Math.random() * 3.5,
        color: Math.random() > 0.3 ? '#ffd166' : '#ff9e00',
        flickerSpeed: 0.008 + Math.random() * 0.012,
        flickerPhase: Math.random() * Math.PI * 2
      });
    }
  }

  private startRenderLoop() {
    const renderFrame = () => {
      // Extremely smooth, slow time evolution
      this.time += 0.0018;
      this.renderMasterpiece();
      this.animationFrameId = requestAnimationFrame(renderFrame);
    };
    this.animationFrameId = requestAnimationFrame(renderFrame);
  }

  private renderMasterpiece() {
    if (!this.ctx || this.width === 0 || this.height === 0) return;

    const w = this.width;
    const h = this.height;

    // 1. Deep Midnight & Ultramarine Sky Foundation
    const skyGradient = this.ctx.createLinearGradient(0, 0, 0, h);
    skyGradient.addColorStop(0, '#030714');      // High Midnight
    skyGradient.addColorStop(0.28, '#081636');   // Deep Ultramarine
    skyGradient.addColorStop(0.58, '#0f2b5c');   // Cobalt Atmosphere
    skyGradient.addColorStop(0.76, '#18447e');   // Luminous Horizon Azure
    skyGradient.addColorStop(0.88, '#0d1f3d');   // Mountain Valley Shadow
    skyGradient.addColorStop(1, '#050a14');      // Deep Earth

    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(0, 0, w, h);

    // 2. Pre-Dawn Light Band on Horizon (Van Gogh's signature glowing turquoise-gold mist)
    this.drawHorizonDawnGlow(w, h);

    // 3. Dense Rhythmic Impasto Brushwork of the Sky (The Great Swirling Double Vortex)
    this.drawSkySwirlCurrents(w, h);

    // 4. The 11 Radiant Stars and the Fiery Golden Crescent Moon
    this.drawRadiantStarsAndMoon(w, h);

    // 5. Les Alpilles Mountain Range (Rolling Indigo Wave Ridges)
    this.drawAlpillesMountains(w, h);

    // 6. The Village of Saint-Rémy with Steeple and Golden Lantern Windows
    this.drawVillageOfSaintRemy(w, h);

    // 7. The Towering Flame Cypress Tree in the Left Foreground
    this.drawFlameCypress(w, h);

    // 8. Fine Oil Canvas Impasto Relief Texture
    this.drawCanvasGrain(w, h);
  }

  private drawHorizonDawnGlow(w: number, h: number) {
    if (!this.ctx) return;

    const glowGrad = this.ctx.createLinearGradient(0, h * 0.65, 0, h * 0.82);
    glowGrad.addColorStop(0, 'rgba(0, 119, 182, 0)');
    glowGrad.addColorStop(0.5, 'rgba(144, 224, 239, 0.18)');
    glowGrad.addColorStop(0.85, 'rgba(255, 238, 175, 0.22)');
    glowGrad.addColorStop(1, 'rgba(10, 25, 55, 0)');

    this.ctx.fillStyle = glowGrad;
    this.ctx.fillRect(0, h * 0.62, w, h * 0.2);
  }

  private drawSkySwirlCurrents(w: number, h: number) {
    if (!this.ctx) return;
    this.ctx.save();

    for (const stroke of this.ribbonStrokes) {
      // Advance position along the cosmic streamline
      stroke.u = (stroke.u + stroke.speed) % 1;

      // Parametric calculation of Van Gogh's dual harmonic vortex
      const x = stroke.u * (w + 140) - 70;
      const yBaseline = h * 0.36;

      let waveY = 0;
      if (stroke.streamId === 0) {
        // Main majestic central swirl (The Great Double Spiral)
        const spiralPhase = stroke.u * Math.PI * 2.6 + this.time * 0.8;
        waveY = Math.sin(spiralPhase) * (h * 0.12) +
                Math.cos(stroke.u * Math.PI * 3.8 - this.time * 0.5) * (h * 0.05);
      } else if (stroke.streamId === 1) {
        // Upper counter-swirl ribbon
        const spiralPhase = stroke.u * Math.PI * 3.2 - this.time * 0.7;
        waveY = Math.sin(spiralPhase) * (h * 0.09) - (h * 0.1);
      } else if (stroke.streamId === 2) {
        // Lower sky stream sweeping above mountains
        const wavePhase = stroke.u * Math.PI * 2.1 + this.time * 0.6;
        waveY = Math.cos(wavePhase) * (h * 0.08) + (h * 0.14);
      } else if (stroke.streamId === 3) {
        // Zenit celestial crest
        const wavePhase = stroke.u * Math.PI * 1.8 - this.time * 0.4;
        waveY = Math.sin(wavePhase) * (h * 0.08) - (h * 0.2);
      } else {
        // Interlaced connective current
        const wavePhase = stroke.u * Math.PI * 2.9 + this.time * 0.5;
        waveY = Math.sin(wavePhase) * (h * 0.1) + Math.sin(stroke.u * Math.PI * 5) * 15;
      }

      const y = yBaseline + waveY + stroke.offsetLateral;

      // Calculate tangent angle for directional impasto dash
      const du = 0.003;
      const nextX = (stroke.u + du) * (w + 140) - 70;
      let nextWaveY = 0;
      if (stroke.streamId === 0) {
        const spiralPhase = (stroke.u + du) * Math.PI * 2.6 + this.time * 0.8;
        nextWaveY = Math.sin(spiralPhase) * (h * 0.12) +
                    Math.cos((stroke.u + du) * Math.PI * 3.8 - this.time * 0.5) * (h * 0.05);
      } else if (stroke.streamId === 1) {
        const spiralPhase = (stroke.u + du) * Math.PI * 3.2 - this.time * 0.7;
        nextWaveY = Math.sin(spiralPhase) * (h * 0.09) - (h * 0.1);
      } else if (stroke.streamId === 2) {
        const wavePhase = (stroke.u + du) * Math.PI * 2.1 + this.time * 0.6;
        nextWaveY = Math.cos(wavePhase) * (h * 0.08) + (h * 0.14);
      } else if (stroke.streamId === 3) {
        const wavePhase = (stroke.u + du) * Math.PI * 1.8 - this.time * 0.4;
        nextWaveY = Math.sin(wavePhase) * (h * 0.08) - (h * 0.2);
      } else {
        const wavePhase = (stroke.u + du) * Math.PI * 2.9 + this.time * 0.5;
        nextWaveY = Math.sin(wavePhase) * (h * 0.1) + Math.sin((stroke.u + du) * Math.PI * 5) * 15;
      }
      const nextY = yBaseline + nextWaveY + stroke.offsetLateral;
      const angle = Math.atan2(nextY - y, nextX - x);

      // Render textured thick impasto brush stroke
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(angle);

      // Smooth fade at canvas borders
      const borderFade = Math.sin(stroke.u * Math.PI);
      const alpha = Math.max(0.1, stroke.baseAlpha * borderFade);

      // 1. Darker edge shadow of thick oil paint
      this.ctx.strokeStyle = 'rgba(2, 6, 18, 0.4)';
      this.ctx.lineWidth = stroke.width + 1.5;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(-stroke.length * 0.5, 1);
      this.ctx.lineTo(stroke.length * 0.5, 1);
      this.ctx.stroke();

      // 2. Primary rich pigment stroke
      this.ctx.strokeStyle = stroke.color;
      this.ctx.lineWidth = stroke.width;
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.moveTo(-stroke.length * 0.5, 0);
      this.ctx.lineTo(stroke.length * 0.5, 0);
      this.ctx.stroke();

      // 3. Impasto raised light ridge (thick paint catching celestial light)
      this.ctx.strokeStyle = stroke.highlightColor;
      this.ctx.lineWidth = Math.max(1, stroke.width * 0.35);
      this.ctx.globalAlpha = alpha * 0.6;
      this.ctx.beginPath();
      this.ctx.moveTo(-stroke.length * 0.38, -stroke.width * 0.22);
      this.ctx.lineTo(stroke.length * 0.38, -stroke.width * 0.22);
      this.ctx.stroke();

      this.ctx.restore();
    }

    this.ctx.restore();
  }

  private drawRadiantStarsAndMoon(w: number, h: number) {
    if (!this.ctx) return;

    for (const star of this.stars) {
      const sx = star.xRatio * w;
      const sy = star.yRatio * h;

      star.rotation += star.rotationSpeed;
      // Gentle, soothing breath cycle (6-10 seconds per pulse)
      const pulseFactor = 1 + Math.sin(this.time * 60 * star.pulseSpeed + star.pulsePhase) * 0.08;

      this.ctx.save();
      this.ctx.translate(sx, sy);

      // 1. Van Gogh Concentric Impasto Dash Halos (Rhythmic paint marks around star)
      for (let ring = 1; ring <= star.haloRings; ring++) {
        const ringRadius = (star.haloRadius * (ring / star.haloRings)) * pulseFactor;
        const totalDashes = star.rays + ring * 4;
        
        this.ctx.save();
        // Slow alternating counter-rotations for depth
        this.ctx.rotate(star.rotation * (ring % 2 === 0 ? 1 : -0.8));
        
        const ringAlpha = ring === star.haloRings ? 0.22 : 0.45;
        this.ctx.strokeStyle = ring % 2 === 0 ? 'rgba(255, 238, 175, 0.45)' : 'rgba(255, 209, 102, 0.35)';
        this.ctx.lineWidth = 3.2;
        this.ctx.lineCap = 'round';
        this.ctx.globalAlpha = ringAlpha;

        const dashStep = (Math.PI * 2) / totalDashes;
        for (let d = 0; d < totalDashes; d++) {
          const startAngle = d * dashStep;
          const endAngle = startAngle + dashStep * 0.52;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, ringRadius, startAngle, endAngle);
          this.ctx.stroke();
        }
        this.ctx.restore();
      }

      // 2. Soft Luminous Radiant Bloom Gradient
      const bloom = this.ctx.createRadialGradient(0, 0, star.coreRadius * 0.2, 0, 0, star.haloRadius * pulseFactor);
      if (star.isMoon) {
        bloom.addColorStop(0, 'rgba(255, 255, 230, 0.95)');
        bloom.addColorStop(0.25, 'rgba(255, 209, 102, 0.7)');
        bloom.addColorStop(0.6, 'rgba(247, 127, 0, 0.25)');
        bloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (star.isVenus) {
        bloom.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        bloom.addColorStop(0.3, 'rgba(255, 234, 167, 0.75)');
        bloom.addColorStop(0.65, 'rgba(0, 150, 199, 0.25)');
        bloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        bloom.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
        bloom.addColorStop(0.35, 'rgba(255, 214, 10, 0.55)');
        bloom.addColorStop(0.7, 'rgba(243, 156, 18, 0.18)');
        bloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      this.ctx.fillStyle = bloom;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, star.haloRadius * pulseFactor, 0, Math.PI * 2);
      this.ctx.fill();

      // 3. Moon or Star Core
      if (star.isMoon) {
        this.ctx.save();
        this.ctx.rotate(-0.35);

        // Radiant Sun-Moon Solar Disc Base
        this.ctx.fillStyle = '#ff9e00';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, star.coreRadius * 1.18 * pulseFactor, 0, Math.PI * 2);
        this.ctx.fill();

        // Golden Crescent Core Disc
        this.ctx.fillStyle = '#ffea75';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, star.coreRadius * pulseFactor, 0, Math.PI * 2);
        this.ctx.fill();

        // Deep Night Prussian Blue Cutout creating the intense blazing crescent
        this.ctx.fillStyle = '#081736';
        this.ctx.beginPath();
        this.ctx.arc(-star.coreRadius * 0.46, -star.coreRadius * 0.26, star.coreRadius * 0.92 * pulseFactor, 0, Math.PI * 2);
        this.ctx.fill();

        // White Impasto Crescent Rim
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2.8;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, star.coreRadius * 0.96 * pulseFactor, -0.45, Math.PI * 0.72);
        this.ctx.stroke();

        this.ctx.restore();
      } else {
        // Bright Vibrant Star Core with thick impasto white center
        this.ctx.fillStyle = star.primaryColor;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, star.coreRadius * 0.65 * pulseFactor, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, star.coreRadius * 0.34 * pulseFactor, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }
  }

  private drawAlpillesMountains(w: number, h: number) {
    if (!this.ctx) return;
    this.ctx.save();

    // 1. Distant Mountain Ridge (Deep Prussian Blue & Cobalt Contours)
    this.ctx.fillStyle = '#091530';
    this.ctx.beginPath();
    this.ctx.moveTo(0, h * 0.77);
    this.ctx.bezierCurveTo(w * 0.18, h * 0.71, w * 0.42, h * 0.83, w * 0.65, h * 0.73);
    this.ctx.bezierCurveTo(w * 0.82, h * 0.67, w * 0.94, h * 0.76, w, h * 0.78);
    this.ctx.lineTo(w, h);
    this.ctx.lineTo(0, h);
    this.ctx.closePath();
    this.ctx.fill();

    // Post-impressionist rolling wave lines across the mountain crests
    this.ctx.strokeStyle = '#1b3863';
    this.ctx.lineWidth = 3.2;
    this.ctx.lineCap = 'round';
    for (let layer = 0; layer < 6; layer++) {
      const yOffset = layer * 7;
      this.ctx.beginPath();
      this.ctx.moveTo(w * 0.22, h * 0.75 + yOffset);
      this.ctx.quadraticCurveTo(w * 0.46, h * 0.84 + yOffset, w * 0.72, h * 0.74 + yOffset);
      this.ctx.stroke();
    }

    // 2. Midground Rolling Hill (Deep Midnight Indigo)
    this.ctx.fillStyle = '#050c1e';
    this.ctx.beginPath();
    this.ctx.moveTo(0, h * 0.84);
    this.ctx.quadraticCurveTo(w * 0.38, h * 0.80, w, h * 0.87);
    this.ctx.lineTo(w, h);
    this.ctx.lineTo(0, h);
    this.ctx.closePath();
    this.ctx.fill();

    // Swirling olive grove contours in valley
    this.ctx.strokeStyle = '#0f2444';
    this.ctx.lineWidth = 2.5;
    for (let g = 0; g < 4; g++) {
      const gx = w * (0.35 + g * 0.14);
      const gy = h * 0.85 + g * 4;
      this.ctx.beginPath();
      this.ctx.arc(gx, gy, 18, Math.PI * 0.8, Math.PI * 1.9);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private drawVillageOfSaintRemy(w: number, h: number) {
    if (!this.ctx) return;
    this.ctx.save();

    // 1. Saint-Rémy Church Steeple (Iconic Dutch-Provençal spire piercing the horizon)
    const churchX = w * 0.52;
    const churchY = h * 0.86;
    const steepleHeight = h * 0.17;

    this.ctx.fillStyle = '#030713';
    
    // Spire
    this.ctx.beginPath();
    this.ctx.moveTo(churchX - 8, churchY);
    this.ctx.lineTo(churchX, churchY - steepleHeight);
    this.ctx.lineTo(churchX + 8, churchY);
    this.ctx.closePath();
    this.ctx.fill();

    // Church tower block
    this.ctx.fillRect(churchX - 11, churchY, 22, h * 0.1);

    // Steeple contour highlight
    this.ctx.strokeStyle = '#1b3b6f';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(churchX, churchY - steepleHeight);
    this.ctx.lineTo(churchX, churchY);
    this.ctx.stroke();

    // 2. Village Cottages Silhouette
    const cottageCount = 15;
    for (let i = 0; i < cottageCount; i++) {
      const cx = w * 0.36 + (i * (w * 0.036));
      const cy = h * 0.875 + Math.sin(i * 1.4) * 7;
      const cw = 18 + (i % 3) * 7;
      const ch = 12 + (i % 2) * 6;

      this.ctx.fillStyle = '#02050e';
      this.ctx.fillRect(cx, cy, cw, ch);

      // Triangular gable roof
      this.ctx.beginPath();
      this.ctx.moveTo(cx - 2, cy);
      this.ctx.lineTo(cx + cw / 2, cy - 7);
      this.ctx.lineTo(cx + cw + 2, cy);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // 3. Warm Glowing Village Lantern Windows
    for (const lantern of this.lanterns) {
      const lx = lantern.xRatio * w;
      const ly = lantern.yRatio * h;
      
      // Extremely subtle, calming fireplace flicker
      const flicker = 0.75 + Math.sin(this.time * 60 * lantern.flickerSpeed + lantern.flickerPhase) * 0.2;

      this.ctx.fillStyle = lantern.color;
      this.ctx.globalAlpha = Math.max(0.25, Math.min(0.95, flicker));
      this.ctx.fillRect(lx, ly, lantern.w, lantern.h);

      // Window warmth bloom
      this.ctx.fillStyle = 'rgba(255, 170, 0, 0.25)';
      this.ctx.beginPath();
      this.ctx.arc(lx + lantern.w / 2, ly + lantern.h / 2, 7, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  private drawFlameCypress(w: number, h: number) {
    if (!this.ctx) return;
    this.ctx.save();

    const cx = Math.max(75, w * 0.095);
    const baseWidth = Math.min(185, w * 0.22);
    const treeHeight = h * 0.86;

    // Gentle cypress wind sway calculation
    const sway = Math.sin(this.time * 1.2) * 3.5;

    // 1. Dark Viridian Base Silhouette (Deepest green, umber and pitch black)
    this.ctx.fillStyle = '#02050a';
    this.ctx.beginPath();
    this.ctx.moveTo(cx - baseWidth * 0.46, h);

    // Left organic flame contours
    this.ctx.bezierCurveTo(
      cx - baseWidth * 0.68 + sway, h - treeHeight * 0.34,
      cx - baseWidth * 0.36 + sway * 1.5, h - treeHeight * 0.70,
      cx - 10 + sway * 2, h - treeHeight
    );

    // Towering tip flame
    this.ctx.quadraticCurveTo(cx + sway * 2.2, h - treeHeight - 20, cx + 12 + sway * 2, h - treeHeight);

    // Right flame contours
    this.ctx.bezierCurveTo(
      cx + baseWidth * 0.42 + sway * 1.3, h - treeHeight * 0.72,
      cx + baseWidth * 0.62 + sway * 0.7, h - treeHeight * 0.38,
      cx + baseWidth * 0.54, h
    );
    this.ctx.closePath();
    this.ctx.fill();

    // 2. Thick Impasto Flame Strokes (Deep Viridian, Dark Emerald, Raw Umber, Prussian Blue)
    const flameColors = [
      '#072816', // Deep Viridian
      '#043c1b', // Emerald Moss
      '#103022', // Forest Pine
      '#0a1828', // Prussian Navy
      '#3d2d14'  // Burnt Ochre Bark
    ];

    for (let i = 0; i < 20; i++) {
      const strokeY = h - (treeHeight * (0.12 + i * 0.044));
      const strokeColor = flameColors[i % flameColors.length];
      const strokeSway = sway * (1 - strokeY / h);

      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = 4 + (i % 3);
      this.ctx.lineCap = 'round';

      this.ctx.beginPath();
      const xStart = cx - 28 + (i % 4) * 16 + strokeSway;
      const xEnd = cx + ((i % 2 === 0 ? 1 : -1) * (14 + (i % 5) * 6)) + strokeSway * 1.2;
      this.ctx.moveTo(xStart, strokeY + 38);
      this.ctx.quadraticCurveTo(cx + (i % 2 === 0 ? 28 : -28) + strokeSway, strokeY + 14, xEnd, strokeY - 24);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private drawCanvasGrain(w: number, h: number) {
    if (!this.ctx) return;
    this.ctx.save();

    // Fine organic oil paint canvas impasto grain overlay
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    const step = 8;
    for (let x = 0; x < w; x += step) {
      if ((x / step) % 2 === 0) {
        this.ctx.fillRect(x, 0, 1, h);
      }
    }
    for (let y = 0; y < h; y += step) {
      if ((y / step) % 2 === 0) {
        this.ctx.fillRect(0, y, w, 1);
      }
    }

    this.ctx.restore();
  }
}
