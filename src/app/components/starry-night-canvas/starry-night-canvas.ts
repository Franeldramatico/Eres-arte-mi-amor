import { Component, ElementRef, OnInit, OnDestroy, viewChild, ChangeDetectionStrategy, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SoundEffects } from '../../services/sound-effects';

export type VanGoghBrush = 'impasto' | 'vortex' | 'star_burst' | 'palette_knife' | 'cypress' | 'gold_swirl';

interface OilColorPreset {
  name: string;
  hex: string;
  desc: string;
}

interface StarryPreset {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

@Component({
  selector: 'app-starry-night-canvas',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-[#0d162d]/95 rounded-2xl border-2 border-[#ffdd53]/40 shadow-2xl p-4 sm:p-7 backdrop-blur-2xl relative overflow-hidden text-white">
      <!-- Van Gogh Star Aura behind canvas -->
      <div class="absolute -top-24 -right-24 w-80 h-80 bg-[#ffd166]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-[#0077b6]/25 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/3 w-64 h-64 bg-[#7209b7]/15 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Studio Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3.5 border-b border-[#22335c]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ffd166] via-[#f72585] to-[#0077b6] flex items-center justify-center text-[#090e24] shadow-md font-bold">
            <mat-icon class="text-2xl">auto_awesome</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="font-serif text-xl font-bold text-[#fffae6] tracking-tight">Atelier de Óleo e Impasto · Van Gogh</h4>
              <span class="px-2 py-0.5 rounded-full bg-[#ffd166]/20 text-[#ffeaa7] text-[10px] font-bold uppercase tracking-wider border border-[#ffd166]/40">Óleo Texturado</span>
            </div>
            <p class="text-xs text-[#9bb0d8]">Pinceladas rítmicas y espirales celestiales dedicadas a mi querida Aranxita</p>
          </div>
        </div>

        <!-- Canvas Actions -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="vg-undo-btn"
            (click)="undo()"
            [disabled]="historyIndex() <= 0"
            title="Deshacer último trazo de óleo"
            class="px-3 py-1.5 rounded-lg border border-[#314878] bg-[#142347] text-xs font-semibold text-[#ccd8f0] hover:bg-[#1a2f60] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 shadow-sm">
            <mat-icon class="text-sm">undo</mat-icon>
            <span class="hidden sm:inline">Deshacer</span>
          </button>

          <button
            type="button"
            id="vg-clear-btn"
            (click)="clearCanvas()"
            title="Limpiar lienzo de óleo"
            class="px-3 py-1.5 rounded-lg border border-[#314878] bg-[#142347] text-xs font-semibold text-[#ccd8f0] hover:bg-[#1a2f60] transition flex items-center gap-1 shadow-sm">
            <mat-icon class="text-sm">refresh</mat-icon>
            <span class="hidden sm:inline">Limpiar</span>
          </button>

          <button
            type="button"
            id="vg-download-btn"
            (click)="downloadArtwork()"
            title="Guardar obra enmarcada al óleo"
            class="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#ffd166] via-[#ffaa00] to-[#e07a5f] hover:opacity-95 text-[#0a1128] text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-1.5">
            <mat-icon class="text-sm">brush</mat-icon>
            <span>Firmar & Enmarcar</span>
          </button>
        </div>
      </div>

      <!-- Van Gogh Brushes -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-bold text-[#ffdd53] uppercase tracking-wider flex items-center gap-1.5">
            <mat-icon class="text-sm text-[#ffd166]">palette</mat-icon>
            <span>Técnicas Postimpresionistas:</span>
          </span>
          <span class="text-[11px] text-[#9bb0d8] italic">
            {{ getActiveBrushDescription() }}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          @for (brush of brushOptions; track brush.id) {
            <button
              type="button"
              [id]="'vg-brush-' + brush.id"
              (click)="selectBrush(brush.id)"
              [class.bg-[#1e3568]]="activeBrush() === brush.id"
              [class.border-[#ffd166]]="activeBrush() === brush.id"
              [class.ring-2]="activeBrush() === brush.id"
              [class.ring-[#ffd166]/40]="activeBrush() === brush.id"
              class="p-2.5 rounded-xl border border-[#263c6c] bg-[#122044]/80 hover:bg-[#182b5a] transition-all text-left flex items-center gap-2.5 group cursor-pointer shadow-sm">
              <div
                [class.bg-[#ffd166]]="activeBrush() === brush.id"
                [class.text-[#0a1128]]="activeBrush() === brush.id"
                [class.bg-[#1b2c58]]="activeBrush() !== brush.id"
                [class.text-[#ffd166]]="activeBrush() !== brush.id"
                class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition shadow-inner">
                <mat-icon class="text-base">{{ brush.icon }}</mat-icon>
              </div>
              <div class="min-w-0">
                <div class="text-xs font-bold leading-tight text-[#fffae6] truncate">{{ brush.name }}</div>
                <div class="text-[10px] text-[#90a8d6] truncate leading-tight">{{ brush.tag }}</div>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- Oil Palette & Sliders -->
      <div class="mb-4 bg-[#111e40]/90 p-3.5 rounded-xl border border-[#223868] shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <!-- Swatches -->
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs font-bold text-[#ffdd53] uppercase tracking-wider">Paleta de Saint-Rémy (1889):</span>
              <span class="text-[11px] text-[#c6d7fa] font-medium font-serif">
                {{ getSelectedColorInfo() }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              @for (c of oilPalette; track c.hex) {
                <button
                  type="button"
                  [id]="'vg-color-' + c.hex.replace('#', '')"
                  (click)="selectColor(c.hex)"
                  [title]="c.name + ' - ' + c.desc"
                  [style.background-color]="c.hex"
                  [class.ring-4]="selectedColor() === c.hex"
                  [class.ring-[#ffd166]/80]="selectedColor() === c.hex"
                  [class.scale-120]="selectedColor() === c.hex"
                  [class.shadow-lg]="selectedColor() === c.hex"
                  class="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#ffdd53]/60 shadow-md transition-all hover:scale-125 relative group">
                </button>
              }

              <!-- Color picker -->
              <label class="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#ffdd53]/60 bg-gradient-to-tr from-yellow-300 via-amber-500 to-blue-600 flex items-center justify-center cursor-pointer hover:scale-125 transition shadow-md" title="Elegir tono personalizado de óleo">
                <input type="color" [value]="selectedColor()" (change)="onCustomColorChange($event)" class="sr-only" />
                <mat-icon class="text-white text-xs drop-shadow">colorize</mat-icon>
              </label>
            </div>
          </div>

          <!-- Brush controls -->
          <div class="flex flex-wrap items-center gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#223868]">
            <div class="flex items-center gap-2">
              <mat-icon class="text-[#ffd166] text-base">line_weight</mat-icon>
              <div class="flex flex-col">
                <div class="flex justify-between text-[11px] font-semibold text-[#ccd8f0]">
                  <span>Grosor Impasto</span>
                  <span>{{ brushSize() }}px</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="60"
                  [value]="brushSize()"
                  (input)="onBrushSizeChange($event)"
                  class="w-24 sm:w-28 accent-[#ffd166] h-1.5 bg-[#25396b] rounded-lg cursor-pointer" />
              </div>
            </div>

            <div class="flex items-center gap-2">
              <mat-icon class="text-[#48cae4] text-base">blur_on</mat-icon>
              <div class="flex flex-col">
                <div class="flex justify-between text-[11px] font-semibold text-[#ccd8f0]">
                  <span>Relieve y Espiral</span>
                  <span>{{ swirlCurvature() }}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  [value]="swirlCurvature()"
                  (input)="onCurvatureChange($event)"
                  class="w-24 sm:w-28 accent-[#48cae4] h-1.5 bg-[#25396b] rounded-lg cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stencils / Sketches -->
      <div class="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <div class="flex items-center gap-1.5 text-xs text-[#ffd166] font-semibold">
          <mat-icon class="text-sm">auto_stories</mat-icon>
          <span>Composiciones de Noche Estrellada:</span>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          @for (stencil of stencils; track stencil.id) {
            <button
              type="button"
              [id]="'vg-stencil-' + stencil.id"
              (click)="loadStencil(stencil.id)"
              [class.bg-[#233a70]]="activeStencil() === stencil.id"
              [class.border-[#ffd166]]="activeStencil() === stencil.id"
              [class.font-bold]="activeStencil() === stencil.id"
              class="px-2.5 py-1 rounded-lg border border-[#2a437a] bg-[#142347] hover:bg-[#1a2e5c] text-[11px] text-[#ccd8f0] transition-all flex items-center gap-1 shadow-sm">
              <mat-icon class="text-xs text-[#ffd166]">{{ stencil.icon }}</mat-icon>
              <span>{{ stencil.name }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Canvas Area -->
      <div class="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#070c1e] rounded-2xl border-2 border-[#ffd166]/50 shadow-inner overflow-hidden cursor-crosshair select-none touch-none">
        
        <canvas
          #starryCanvas
          (mousedown)="startDrawing($event)"
          (mousemove)="draw($event)"
          (mouseup)="stopDrawing()"
          (mouseleave)="stopDrawing()"
          (touchstart)="handleTouchStart($event)"
          (touchmove)="handleTouchMove($event)"
          (touchend)="stopDrawing()"
          class="w-full h-full block touch-none z-10 relative">
        </canvas>

        @if (isClean()) {
          <div class="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center pointer-events-none opacity-85 transition-opacity">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ffd166] via-[#ffaa00] to-[#0077b6] flex items-center justify-center text-[#0a1128] mb-3 shadow-lg animate-pulse">
              <mat-icon class="text-3xl">brush</mat-icon>
            </div>
            <p class="font-serif text-xl sm:text-2xl text-[#fff5cc] font-bold">Pinta tu propia Noche Estrellada</p>
            <p class="text-xs sm:text-sm text-[#9bb3de] max-w-md mt-1.5 leading-relaxed">
              Desliza tu pincel para crear trazos de óleo impasto, vórtices de luz y constelaciones doradas para Aranxita.
            </p>
            <div class="mt-4 flex items-center gap-2 text-[11px] bg-[#122044]/90 px-3 py-1.5 rounded-full border border-[#ffd166]/40 text-[#ffea9f] font-medium shadow-sm">
              <mat-icon class="text-sm text-[#ffd166]">favorite</mat-icon>
              <span>Dedicada a la mujer que ilumina mi noche: Aranxita</span>
            </div>
          </div>
        }

        <div class="absolute bottom-3 right-4 z-20 text-xs font-serif italic text-[#ffd166]/80 pointer-events-none select-none tracking-wider">
          Vincent van Gogh · Para Aranxita (1889 - 2026)
        </div>
      </div>

      <!-- Quick Masterpiece Stamps -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#22335c] text-xs">
        <div class="flex items-center gap-1.5 text-[#ffd166]">
          <mat-icon class="text-base">star</mat-icon>
          <span class="font-bold text-xs">Elementos Célebres de Van Gogh:</span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="vg-stamp-star"
            (click)="stampElement('star')"
            class="px-3 py-1.5 rounded-xl bg-[#142347] hover:bg-[#1e346b] border border-[#ffd166]/50 text-xs font-medium text-[#fffae6] transition-all hover:scale-105 shadow-sm flex items-center gap-1.5">
            <mat-icon class="text-sm text-[#ffd166]">flare</mat-icon>
            <span>Estrella Radiante</span>
          </button>

          <button
            type="button"
            id="vg-stamp-swirl"
            (click)="stampElement('swirl')"
            class="px-3 py-1.5 rounded-xl bg-[#142347] hover:bg-[#1e346b] border border-[#3a5d9e] text-xs font-medium text-[#c5daf8] transition-all hover:scale-105 shadow-sm flex items-center gap-1.5">
            <mat-icon class="text-sm text-[#00b4d8]">cyclone</mat-icon>
            <span>Gran Espiral Celeste</span>
          </button>

          <button
            type="button"
            id="vg-stamp-moon"
            (click)="stampElement('moon')"
            class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#ffd166]/20 to-[#ffaa00]/20 hover:bg-[#ffd166]/30 border border-[#ffd166] text-xs font-bold text-[#fffae6] transition-all hover:scale-105 shadow-sm flex items-center gap-1.5">
            <mat-icon class="text-sm text-[#ffd166]">nightlight</mat-icon>
            <span>Luna Dorada de Saint-Rémy</span>
          </button>

          <button
            type="button"
            id="vg-stamp-cypress"
            (click)="stampElement('cypress')"
            class="px-3 py-1.5 rounded-xl bg-[#0c1a14] hover:bg-[#132c22] border border-[#1e4a38] text-xs font-medium text-[#73d2a7] transition-all hover:scale-105 shadow-sm flex items-center gap-1.5">
            <mat-icon class="text-sm text-[#52b788]">park</mat-icon>
            <span>Silueta de Ciprés</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class StarryNightCanvas implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private sound = inject(SoundEffects);

  starryCanvas = viewChild<ElementRef<HTMLCanvasElement>>('starryCanvas');

  activeBrush = signal<VanGoghBrush>('impasto');
  selectedColor = signal<string>('#ffd166');
  brushSize = signal<number>(24);
  swirlCurvature = signal<number>(65);
  isClean = signal<boolean>(true);
  historyIndex = signal<number>(0);
  activeStencil = signal<string>('blank');

  brushOptions = [
    { id: 'impasto' as VanGoghBrush, name: 'Óleo Impasto', icon: 'brush', tag: 'Trazo Texturado', desc: 'Pincelada gruesa en relieve con dirección rítmica de óleo denso.' },
    { id: 'vortex' as VanGoghBrush, name: 'Espiral Celeste', icon: 'cyclone', tag: 'Vórtice Dinámico', desc: 'Curva en espiral con estela de partículas luminosas.' },
    { id: 'star_burst' as VanGoghBrush, name: 'Estrella Pulsar', icon: 'flare', tag: 'Halo Concéntrico', desc: 'Corona de luz con anillos de pequeñas pinceladas en órbita.' },
    { id: 'palette_knife' as VanGoghBrush, name: 'Espátula Fina', icon: 'horizontal_rule', tag: 'Placa de Pigmento', desc: 'Bloques anchos de color empastado al óleo.' },
    { id: 'cypress' as VanGoghBrush, name: 'Llama de Ciprés', icon: 'park', tag: 'Ondulación Nocturna', desc: 'Trazo verde esmeralda y negro azulado con forma de llama.' },
    { id: 'gold_swirl' as VanGoghBrush, name: 'Óleo Oro Puro', icon: 'auto_awesome', tag: 'Luz Radiante', desc: 'Pinceladas doradas luminosas con destellos de Saint-Rémy.' },
  ];

  oilPalette: OilColorPreset[] = [
    { name: 'Amarillo Cadmio Noche', hex: '#ffd166', desc: 'El brillo dorado de las estrellas' },
    { name: 'Amarillo Oro Solar', hex: '#ffaa00', desc: 'La luz cálida del corazón de la luna' },
    { name: 'Blanco de Zinc Impasto', hex: '#ffffff', desc: 'Destellos de luz pura y espuma cósmica' },
    { name: 'Azul Cobalto Vivo', hex: '#0077b6', desc: 'El cielo profundo de Provenza' },
    { name: 'Azul Ultramar Francés', hex: '#03045e', desc: 'La inmensidad infinita de la noche' },
    { name: 'Azul Prusia Oscuro', hex: '#0b132b', desc: 'Sombras y contornos dramáticos' },
    { name: 'Turquesa Célico', hex: '#48cae4', desc: 'Corrientes de viento y luz sideral' },
    { name: 'Verde Ciprés Esmeralda', hex: '#004b23', desc: 'El alma viva de los cipreses' },
    { name: 'Violeta Noche Estrellada', hex: '#7209b7', desc: 'Misterio y pasión romántica' },
    { name: 'Rosa Flor de Almendro', hex: '#f72585', desc: 'Amor y ternura para Aranxita' },
    { name: 'Siena Tierra Cálida', hex: '#b07d62', desc: 'Casas del pueblito de Saint-Rémy' },
    { name: 'Negro Marfil Profundo', hex: '#050811', desc: 'El contraste de la noche' },
  ];

  stencils: StarryPreset[] = [
    { id: 'blank', name: 'Lienzo Libre', icon: 'crop_portrait', desc: 'Cielo en blanco' },
    { id: 'classic', name: 'Noche de Saint-Rémy', icon: 'nightlight', desc: 'Composición clásica' },
    { id: 'heart_vortex', name: 'Vórtice de Amor', icon: 'favorite_border', desc: 'Espiral de corazón' },
    { id: 'constellation', name: 'Constelación Aranxita', icon: 'star_outline', desc: 'Corona de estrellas' },
  ];

  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private history: ImageData[] = [];
  private maxHistory = 15;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    window.addEventListener('resize', this.onResize);
    setTimeout(() => {
      this.initCanvas();
    }, 80);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.onResize);
    }
  }

  private onResize = () => {
    if (!this.ctx) return;
    const canvas = this.starryCanvas()?.nativeElement;
    if (!canvas) return;
    const temp = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.initCanvas(false);
    if (this.ctx && temp) {
      this.ctx.putImageData(temp, 0, 0);
    }
  };

  private initCanvas(clear = true) {
    const canvas = this.starryCanvas()?.nativeElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!this.ctx) return;

    this.ctx.scale(dpr, dpr);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (clear) {
      this.drawNightSkyBase();
      this.saveState();
    }
  }

  private drawNightSkyBase() {
    if (!this.ctx) return;
    const canvas = this.starryCanvas()?.nativeElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Van Gogh deep Prussian / Ultramarine night sky canvas texture
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#060b1c');
    skyGrad.addColorStop(0.35, '#0a163a');
    skyGrad.addColorStop(0.7, '#0f2758');
    skyGrad.addColorStop(1, '#09132e');

    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, w, h);

    // Subtle oil canvas weave texture
    this.ctx.save();
    for (let x = 0; x < w; x += 4) {
      for (let y = 0; y < h; y += 4) {
        if (Math.random() < 0.2) {
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
          this.ctx.fillRect(x, y, 1.5, 1.5);
        } else if (Math.random() > 0.85) {
          this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
          this.ctx.fillRect(x, y, 1.5, 1.5);
        }
      }
    }
    this.ctx.restore();
  }

  selectBrush(type: VanGoghBrush) {
    this.activeBrush.set(type);
    this.sound.playSoftChime(3);
  }

  getActiveBrushDescription(): string {
    const current = this.brushOptions.find(b => b.id === this.activeBrush());
    return current ? current.desc : '';
  }

  selectColor(hex: string) {
    this.selectedColor.set(hex);
    this.sound.playStarSparkle();
  }

  getSelectedColorInfo(): string {
    const current = this.oilPalette.find(p => p.hex === this.selectedColor());
    return current ? `${current.name}` : 'Tono personalizado';
  }

  onCustomColorChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target?.value) {
      this.selectedColor.set(target.value);
    }
  }

  onBrushSizeChange(e: Event) {
    const val = Number((e.target as HTMLInputElement).value);
    this.brushSize.set(val);
  }

  onCurvatureChange(e: Event) {
    const val = Number((e.target as HTMLInputElement).value);
    this.swirlCurvature.set(val);
  }

  startDrawing(e: MouseEvent) {
    this.isDrawing = true;
    this.isClean.set(false);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;

    this.renderStroke(this.lastX, this.lastY, this.lastX, this.lastY);
    this.sound.playBrushSweep();
  }

  draw(e: MouseEvent) {
    if (!this.isDrawing) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    this.renderStroke(this.lastX, this.lastY, currentX, currentY);

    this.lastX = currentX;
    this.lastY = currentY;
  }

  handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      this.isDrawing = true;
      this.isClean.set(false);
      this.lastX = touch.clientX - rect.left;
      this.lastY = touch.clientY - rect.top;
      this.renderStroke(this.lastX, this.lastY, this.lastX, this.lastY);
      this.sound.playBrushSweep();
    }
  }

  handleTouchMove(e: TouchEvent) {
    if (!this.isDrawing || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;

    this.renderStroke(this.lastX, this.lastY, currentX, currentY);

    this.lastX = currentX;
    this.lastY = currentY;
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.saveState();
    }
  }

  private renderStroke(x1: number, y1: number, x2: number, y2: number) {
    if (!this.ctx) return;

    const brush = this.activeBrush();
    const size = this.brushSize();
    const color = this.selectedColor();
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const dist = Math.hypot(x2 - x1, y2 - y1);

    this.ctx.save();

    switch (brush) {
      case 'impasto':
        this.drawImpastoDashes(x1, y1, x2, y2, size, color, angle, dist);
        break;
      case 'vortex':
        this.drawVortexSwirl(x2, y2, size, color);
        break;
      case 'star_burst':
        this.drawStarBurst(x2, y2, size, color);
        break;
      case 'palette_knife':
        this.drawPaletteKnife(x1, y1, x2, y2, size, color, angle);
        break;
      case 'cypress':
        this.drawCypressFlame(x2, y2, size, color);
        break;
      case 'gold_swirl':
        this.drawGoldSwirl(x1, y1, x2, y2, size, angle, dist);
        break;
    }

    this.ctx.restore();
  }

  /**
   * 1. Van Gogh Thick Impasto Dashes
   */
  private drawImpastoDashes(x1: number, y1: number, x2: number, y2: number, size: number, color: string, angle: number, dist: number) {
    if (!this.ctx) return;

    const step = Math.max(4, size * 0.4);
    const steps = Math.max(1, Math.floor(dist / step));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;

      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(angle + (Math.random() - 0.5) * 0.2);

      // Dark under-oil shadow for 3D impasto depth
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.fillRect(-size * 0.5, size * 0.15, size, size * 0.4);

      // Main thick impasto stroke
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, size * 0.6, size * 0.22, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Top specular highlight of thick wet oil paint
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      this.ctx.beginPath();
      this.ctx.ellipse(-size * 0.1, -size * 0.08, size * 0.35, size * 0.08, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  /**
   * 2. Vortex Swirls
   */
  private drawVortexSwirl(x: number, y: number, size: number, color: string) {
    if (!this.ctx) return;
    const curvature = this.swirlCurvature() / 100;
    const rings = 4;

    for (let r = 1; r <= rings; r++) {
      const radius = (size * 0.5 * r) * curvature;
      const dashes = 6 + r * 3;
      const step = (Math.PI * 2) / dashes;

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 3.5;
      this.ctx.lineCap = 'round';

      for (let d = 0; d < dashes; d++) {
        const start = d * step;
        const end = start + step * 0.6;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, start, end);
        this.ctx.stroke();
      }
    }
  }

  /**
   * 3. Star Burst with Concentric Impasto Halos
   */
  private drawStarBurst(x: number, y: number, size: number, color: string) {
    if (!this.ctx) return;

    // Glowing core
    const glow = this.ctx.createRadialGradient(x, y, 0, x, y, size * 1.6);
    glow.addColorStop(0, '#ffffff');
    glow.addColorStop(0.3, color);
    glow.addColorStop(0.7, 'rgba(255, 209, 102, 0.25)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.fillStyle = glow;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size * 1.6, 0, Math.PI * 2);
    this.ctx.fill();

    // Concentric dashed rings
    const rings = 3;
    for (let i = 1; i <= rings; i++) {
      const r = size * (0.5 + i * 0.4);
      const dashes = 8 + i * 4;
      const step = (Math.PI * 2) / dashes;
      this.ctx.strokeStyle = i === 1 ? '#ffffff' : color;
      this.ctx.lineWidth = 2.5;

      for (let d = 0; d < dashes; d++) {
        const s = d * step;
        const e = s + step * 0.55;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, s, e);
        this.ctx.stroke();
      }
    }
  }

  /**
   * 4. Palette Knife
   */
  private drawPaletteKnife(x1: number, y1: number, x2: number, y2: number, size: number, color: string, angle: number) {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.translate(x2, y2);
    this.ctx.rotate(angle + Math.PI / 2);

    this.ctx.fillStyle = color;
    this.ctx.fillRect(-size * 0.8, -size * 0.2, size * 1.6, size * 0.4);

    // Knife texture scrape
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.fillRect(-size * 0.6, -size * 0.1, size * 1.2, 2);

    this.ctx.restore();
  }

  /**
   * 5. Cypress Flame
   */
  private drawCypressFlame(x: number, y: number, size: number, color: string) {
    if (!this.ctx) return;
    const strokes = 5;
    for (let i = 0; i < strokes; i++) {
      const ox = (Math.random() - 0.5) * size * 0.6;
      const oy = (Math.random() - 0.5) * size * 0.6;
      this.ctx.strokeStyle = i % 2 === 0 ? color : '#040d1a';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.moveTo(x + ox, y + oy + size * 0.5);
      this.ctx.quadraticCurveTo(x + ox + (Math.random() - 0.5) * 15, y + oy, x + ox, y + oy - size * 0.5);
      this.ctx.stroke();
    }
  }

  /**
   * 6. Pure Golden Swirl
   */
  private drawGoldSwirl(x1: number, y1: number, x2: number, y2: number, size: number, angle: number, dist: number) {
    if (!this.ctx) return;
    this.drawImpastoDashes(x1, y1, x2, y2, size, '#ffd166', angle, dist);
    
    // Extra golden sparkles
    this.ctx.fillStyle = '#ffffff';
    for (let s = 0; s < 3; s++) {
      const rx = x2 + (Math.random() - 0.5) * size;
      const ry = y2 + (Math.random() - 0.5) * size;
      this.ctx.fillRect(rx, ry, 2, 2);
    }
  }

  /**
   * Quick Masterpiece Elements
   */
  stampElement(type: 'star' | 'swirl' | 'moon' | 'cypress') {
    const canvas = this.starryCanvas()?.nativeElement;
    if (!canvas || !this.ctx) return;

    this.isClean.set(false);
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2 + (Math.random() - 0.5) * (rect.width * 0.4);
    const cy = rect.height / 2 + (Math.random() - 0.5) * (rect.height * 0.3);

    if (type === 'star') {
      this.drawStarBurst(cx, cy, 32, '#ffd166');
      this.sound.playStarSparkle();
    } else if (type === 'swirl') {
      this.drawVortexSwirl(cx, cy, 45, '#48cae4');
      this.drawVortexSwirl(cx, cy, 30, '#ffd166');
      this.sound.playSoftChime(2);
    } else if (type === 'moon') {
      // Golden Crescent Moon
      this.ctx.save();
      this.ctx.translate(cx, cy);
      const moonGrad = this.ctx.createRadialGradient(0, 0, 10, 0, 0, 50);
      moonGrad.addColorStop(0, '#ffffff');
      moonGrad.addColorStop(0.4, '#ffd166');
      moonGrad.addColorStop(1, 'rgba(255, 170, 0, 0)');
      this.ctx.fillStyle = moonGrad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 45, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#fff4cc';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 24, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#070c1e';
      this.ctx.beginPath();
      this.ctx.arc(-10, -6, 21, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
      this.sound.playCelestialArpeggio();
    } else if (type === 'cypress') {
      this.drawCypressFlame(cx, cy, 60, '#004b23');
      this.sound.playBrushSweep();
    }

    this.saveState();
  }

  loadStencil(id: string) {
    this.activeStencil.set(id);
    this.clearCanvas();

    if (id === 'blank') return;

    this.isClean.set(false);
    const canvas = this.starryCanvas()?.nativeElement;
    if (!canvas || !this.ctx) return;

    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 209, 102, 0.35)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([6, 6]);

    if (id === 'classic') {
      // Swirling wave guide
      this.ctx.beginPath();
      this.ctx.moveTo(0, cy + 40);
      this.ctx.bezierCurveTo(cx * 0.5, cy - 80, cx * 1.2, cy + 90, rect.width, cy - 40);
      this.ctx.stroke();

      // Moon position
      this.ctx.beginPath();
      this.ctx.arc(rect.width * 0.85, rect.height * 0.2, 35, 0, Math.PI * 2);
      this.ctx.stroke();

      // Cypress outline on left
      this.ctx.beginPath();
      this.ctx.moveTo(rect.width * 0.12, rect.height);
      this.ctx.quadraticCurveTo(rect.width * 0.05, cy * 0.6, rect.width * 0.14, cy * 0.2);
      this.ctx.quadraticCurveTo(rect.width * 0.22, cy * 0.6, rect.width * 0.18, rect.height);
      this.ctx.stroke();
    } else if (id === 'heart_vortex') {
      // Swirling heart vortex
      const scale = 2.6;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - 20 * scale);
      this.ctx.bezierCurveTo(cx - 30 * scale, cy - 45 * scale, cx - 60 * scale, cy + 5 * scale, cx, cy + 50 * scale);
      this.ctx.bezierCurveTo(cx + 60 * scale, cy + 5 * scale, cx + 30 * scale, cy - 45 * scale, cx, cy - 20 * scale);
      this.ctx.stroke();
    } else if (id === 'constellation') {
      // Star constellation circle
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 90, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();
    this.saveState();
    this.sound.playStarSparkle();
  }

  private saveState() {
    const canvas = this.starryCanvas()?.nativeElement;
    if (!canvas || !this.ctx) return;

    const data = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (this.history.length >= this.maxHistory) {
      this.history.shift();
    }
    this.history.push(data);
    this.historyIndex.set(this.history.length - 1);
  }

  undo() {
    if (this.history.length <= 1 || !this.ctx) return;
    this.history.pop();
    const prevState = this.history[this.history.length - 1];
    if (prevState) {
      this.ctx.putImageData(prevState, 0, 0);
      this.historyIndex.set(this.history.length - 1);
      this.sound.playBrushSweep();
    }
  }

  clearCanvas() {
    this.drawNightSkyBase();
    this.history = [];
    this.saveState();
    this.isClean.set(true);
    this.sound.playSoftChime(0);
  }

  downloadArtwork() {
    const canvas = this.starryCanvas()?.nativeElement;
    if (!canvas) return;

    const exportCanvas = document.createElement('canvas');
    const border = 45;
    exportCanvas.width = canvas.width + border * 2;
    exportCanvas.height = canvas.height + border * 2;
    const eCtx = exportCanvas.getContext('2d');
    if (!eCtx) return;

    // Rich Antique Gilded Van Gogh Gallery Frame
    const goldFrame = eCtx.createLinearGradient(0, 0, exportCanvas.width, exportCanvas.height);
    goldFrame.addColorStop(0, '#b8860b');
    goldFrame.addColorStop(0.25, '#ffd700');
    goldFrame.addColorStop(0.5, '#daa520');
    goldFrame.addColorStop(0.75, '#ffd700');
    goldFrame.addColorStop(1, '#8b6508');

    eCtx.fillStyle = goldFrame;
    eCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Inner bevel shadow
    eCtx.fillStyle = '#060b1c';
    eCtx.fillRect(border - 8, border - 8, canvas.width + 16, canvas.height + 16);

    // Artwork
    eCtx.drawImage(canvas, border, border);

    // Romantic inscription
    eCtx.fillStyle = '#ffd166';
    eCtx.font = 'italic 24px "Playfair Display", Georgia, serif';
    eCtx.textAlign = 'right';
    eCtx.fillText('Vincent van Gogh · Para mi amada Aranxita', exportCanvas.width - border - 12, exportCanvas.height - 14);

    const link = document.createElement('a');
    link.download = 'Aranxita-Noche-Estrellada.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    this.sound.playCelestialArpeggio();
  }
}
