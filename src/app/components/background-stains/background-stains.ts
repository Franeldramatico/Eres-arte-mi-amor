import { Component, ElementRef, OnInit, OnDestroy, viewChild, ChangeDetectionStrategy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface FloatingStain {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  vx: number;
  vy: number;
  angle: number;
  va: number;
  scaleX: number;
  scaleY: number;
}

interface CursorParticle {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
}

@Component({
  selector: 'app-background-stains',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <!-- Procedural Canvas for floating stains and fluid cursor -->
      <canvas #bgCanvas class="w-full h-full opacity-90"></canvas>
      
      <!-- Paper Grain Gradient Overlay with artistic texture -->
      <div class="absolute inset-0 bg-[radial-gradient(#cbbab0_0.75px,transparent_0.75px)] [background-size:20px_20px] opacity-35"></div>
      
      <!-- Ambient Watercolor Hues at corners with rich, strong saturated pigments -->
      <div class="absolute -top-24 -left-24 w-[32rem] h-[32rem] bg-[#f72585]/28 rounded-full blur-3xl stain-blob"></div>
      <div class="absolute top-1/4 -right-28 w-[36rem] h-[36rem] bg-[#ff8800]/25 rounded-full blur-3xl stain-blob-2"></div>
      <div class="absolute top-2/3 left-10 w-[30rem] h-[30rem] bg-[#06d6a0]/25 rounded-full blur-3xl stain-blob"></div>
      <div class="absolute -bottom-24 -right-24 w-[34rem] h-[34rem] bg-[#8338ec]/28 rounded-full blur-3xl stain-blob-2"></div>
      <div class="absolute top-1/2 left-1/3 w-[26rem] h-[26rem] bg-[#f72585]/18 rounded-full blur-3xl stain-blob"></div>
    </div>
  `
})
export class BackgroundStains implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  bgCanvas = viewChild<ElementRef<HTMLCanvasElement>>('bgCanvas');

  private animationFrameId: number | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stains: FloatingStain[] = [];
  private cursorParticles: CursorParticle[] = [];
  private mousePos = { x: -100, y: -100 };
  private targetMousePos = { x: -100, y: -100 };
  private width = 0;
  private height = 0;

  private colors = [
    'rgba(247, 37, 133, ', // Magenta Fucsia Vibrante (Carmín Quinacridona)
    'rgba(255, 87, 87, ',  // Coral Encendido (Bermellón)
    'rgba(255, 158, 0, ',  // Oro Cálido Saturado (Naranja Cadmio)
    'rgba(131, 56, 236, ', // Violeta Imperial Intenso
    'rgba(0, 150, 199, ',  // Azul Cobalto Vibrante
    'rgba(6, 214, 160, ',  // Verde Esmeralda Acuarela
    'rgba(230, 57, 70, ',  // Carmín Pasión
  ];

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('scroll', this.onScroll, { passive: true });

    setTimeout(() => {
      this.initCanvas();
      this.initStains();
      this.loop();
    }, 50);
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.onResize);
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('scroll', this.onScroll);
    }
  }

  private onResize = () => {
    this.initCanvas();
  };

  private onMouseMove = (e: MouseEvent) => {
    this.targetMousePos.x = e.clientX;
    this.targetMousePos.y = e.clientY;

    // Spawn slight watercolor cursor droplets occasionally
    if (Math.random() < 0.35) {
      const colorBase = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.cursorParticles.push({
        x: e.clientX + (Math.random() - 0.5) * 16,
        y: e.clientY + (Math.random() - 0.5) * 16,
        radius: 6 + Math.random() * 18,
        color: colorBase,
        alpha: 0.28 + Math.random() * 0.2,
        maxLife: 40 + Math.random() * 30,
        life: 0
      });
    }
  };

  private onScroll = () => {
    // Slight shift on scroll to bring life to pigments
    for (let i = 0; i < this.stains.length; i++) {
      this.stains[i].y += (i % 2 === 0 ? 0.3 : -0.3);
    }
  };

  private initCanvas() {
    const canvas = this.bgCanvas()?.nativeElement;
    if (!canvas) return;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    canvas.width = this.width;
    canvas.height = this.height;
    this.ctx = canvas.getContext('2d');
  }

  private initStains() {
    this.stains = [];
    const count = Math.min(12, Math.floor(window.innerWidth / 130));

    for (let i = 0; i < count; i++) {
      const color = this.colors[i % this.colors.length];
      this.stains.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 110 + Math.random() * 180,
        color,
        alpha: 0.22 + Math.random() * 0.22,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        angle: Math.random() * Math.PI * 2,
        va: (Math.random() - 0.5) * 0.003,
        scaleX: 0.75 + Math.random() * 0.5,
        scaleY: 0.75 + Math.random() * 0.5
      });
    }
  }

  private loop = () => {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Smooth mouse interpolation
    this.mousePos.x += (this.targetMousePos.x - this.mousePos.x) * 0.15;
    this.mousePos.y += (this.targetMousePos.y - this.mousePos.y) * 0.15;

    // Draw floating living watercolor stains
    for (const stain of this.stains) {
      stain.x += stain.vx;
      stain.y += stain.vy;
      stain.angle += stain.va;

      // Wrap around edges softly
      if (stain.x < -stain.radius) stain.x = this.width + stain.radius;
      if (stain.x > this.width + stain.radius) stain.x = -stain.radius;
      if (stain.y < -stain.radius) stain.y = this.height + stain.radius;
      if (stain.y > this.height + stain.radius) stain.y = -stain.radius;

      this.ctx.save();
      this.ctx.translate(stain.x, stain.y);
      this.ctx.rotate(stain.angle);
      this.ctx.scale(stain.scaleX, stain.scaleY);

      // Create radial gradient for realistic watercolor bloom with dark edge pooling (caustic fringing)
      const grad = this.ctx.createRadialGradient(0, 0, stain.radius * 0.05, 0, 0, stain.radius);
      grad.addColorStop(0, `${stain.color}${stain.alpha * 0.9})`);
      grad.addColorStop(0.4, `${stain.color}${stain.alpha * 0.65})`);
      grad.addColorStop(0.8, `${stain.color}${stain.alpha * 0.45})`);
      grad.addColorStop(0.94, `${stain.color}${stain.alpha * 0.85})`); // characteristic watercolor dark edge
      grad.addColorStop(1, `${stain.color}0)`);

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      // Draw organic petal-like polygon
      const points = 9;
      for (let p = 0; p < points; p++) {
        const theta = (p / points) * Math.PI * 2;
        const variation = Math.sin(theta * 3 + stain.angle * 2) * 20;
        const r = stain.radius + variation;
        const px = Math.cos(theta) * r;
        const py = Math.sin(theta) * r;
        if (p === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    }

    // Draw cursor halo and particles with radiant watercolor drop glow
    if (this.mousePos.x > 0 && this.mousePos.y > 0) {
      this.ctx.save();
      const cursorGrad = this.ctx.createRadialGradient(
        this.mousePos.x, this.mousePos.y, 4,
        this.mousePos.x, this.mousePos.y, 60
      );
      cursorGrad.addColorStop(0, 'rgba(247, 37, 133, 0.4)');
      cursorGrad.addColorStop(0.5, 'rgba(255, 158, 0, 0.25)');
      cursorGrad.addColorStop(0.85, 'rgba(131, 56, 236, 0.15)');
      cursorGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      this.ctx.fillStyle = cursorGrad;
      this.ctx.beginPath();
      this.ctx.arc(this.mousePos.x, this.mousePos.y, 60, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Update and draw cursor droplets
    for (let i = this.cursorParticles.length - 1; i >= 0; i--) {
      const p = this.cursorParticles[i];
      p.life++;
      const progress = p.life / p.maxLife;
      const currentAlpha = p.alpha * (1 - progress);
      const currentRadius = p.radius * (1 + progress * 0.4);

      if (progress >= 1) {
        this.cursorParticles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      const pGrad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius);
      pGrad.addColorStop(0, `${p.color}${currentAlpha * 1.2})`);
      pGrad.addColorStop(0.65, `${p.color}${currentAlpha * 0.7})`);
      pGrad.addColorStop(0.92, `${p.color}${currentAlpha * 0.9})`); // dark edge
      pGrad.addColorStop(1, `${p.color}0)`);

      this.ctx.fillStyle = pGrad;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  };
}
