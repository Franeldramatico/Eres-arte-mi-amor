import { Component, ElementRef, OnInit, OnDestroy, viewChild, ChangeDetectionStrategy, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SoundEffects } from '../../services/sound-effects';

export type BrushType = 'kolinsky' | 'humedo' | 'seco' | 'sal' | 'floracion' | 'oro';
export type PaperTextureType = 'torchon' | 'fino' | 'satinado';

interface ColorPreset {
  name: string;
  hex: string;
  pigmentCode: string;
  desc: string;
  granulating?: boolean;
}

interface StencilPreset {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

interface WetBleedPoint {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  bleedSpeed: number;
  dendrites: number[];
}

@Component({
  selector: 'app-watercolor-canvas',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-[#fcf8f3]/95 rounded-2xl border-2 border-[#ecdcd0] shadow-2xl p-4 sm:p-7 backdrop-blur-xl relative overflow-hidden">
      <!-- Watercolor Ambient Aura Behind Canvas -->
      <div class="absolute -top-20 -right-20 w-72 h-72 bg-[#f72585]/18 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-20 -left-20 w-72 h-72 bg-[#ffaa00]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/2 right-1/4 w-60 h-60 bg-[#7209b7]/12 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Studio Header & Controls Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3.5 border-b border-[#ebdcd0]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f72585] to-[#ffaa00] flex items-center justify-center text-white shadow-md">
            <mat-icon class="text-2xl">palette</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="font-serif text-xl font-bold text-[#2e1d1d] tracking-tight">Taller de Acuarela Fina</h4>
              <span class="px-2 py-0.5 rounded-full bg-[#fde2e8] text-[#9c184c] text-[10px] font-bold uppercase tracking-wider border border-[#f8a5c2]">Pigmento Vivo</span>
            </div>
            <p class="text-xs text-[#7d6464]">Pintura con difusión de agua real y papel de algodón Arches para Aranxita</p>
          </div>
        </div>

        <!-- Canvas Actions -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Texture Selector -->
          <div class="inline-flex rounded-lg border border-[#ded0c2] bg-white/80 p-0.5 text-xs">
            <button
              type="button"
              (click)="setPaperTexture('torchon')"
              [class.bg-[#f4dfd4]]="paperTexture() === 'torchon'"
              [class.font-bold]="paperTexture() === 'torchon'"
              [class.text-[#4f2a24]]="paperTexture() === 'torchon'"
              title="Papel Torchon 300g (Grano Grueso)"
              class="px-2.5 py-1 rounded-md transition text-[11px] text-[#6d5555]">
              Torchon
            </button>
            <button
              type="button"
              (click)="setPaperTexture('fino')"
              [class.bg-[#f4dfd4]]="paperTexture() === 'fino'"
              [class.font-bold]="paperTexture() === 'fino'"
              [class.text-[#4f2a24]]="paperTexture() === 'fino'"
              title="Papel Grano Fino / Cold Press"
              class="px-2.5 py-1 rounded-md transition text-[11px] text-[#6d5555]">
              Grano Fino
            </button>
          </div>

          <button
            type="button"
            id="canvas-undo-btn"
            (click)="undo()"
            [disabled]="historyIndex() <= 0"
            title="Deshacer último trazo"
            class="px-3 py-1.5 rounded-lg border border-[#dfcebe] bg-white/90 text-xs font-semibold text-[#5c4a4a] hover:bg-[#faeee3] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 shadow-sm">
            <mat-icon class="text-sm">undo</mat-icon>
            <span class="hidden sm:inline">Deshacer</span>
          </button>

          <button
            type="button"
            id="canvas-clear-btn"
            (click)="clearCanvas()"
            title="Limpiar papel"
            class="px-3 py-1.5 rounded-lg border border-[#dfcebe] bg-white/90 text-xs font-semibold text-[#5c4a4a] hover:bg-[#faeee3] transition flex items-center gap-1 shadow-sm">
            <mat-icon class="text-sm">refresh</mat-icon>
            <span class="hidden sm:inline">Limpiar</span>
          </button>

          <button
            type="button"
            id="canvas-download-btn"
            (click)="downloadArtwork()"
            title="Guardar dedicatoria en imagen de alta resolución"
            class="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#d90429] via-[#f72585] to-[#ffaa00] hover:opacity-95 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-1.5">
            <mat-icon class="text-sm">brush</mat-icon>
            <span>Firmar & Guardar</span>
          </button>
        </div>
      </div>

      <!-- Professional Brushes Selector -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-bold text-[#4d3636] uppercase tracking-wider flex items-center gap-1.5">
            <mat-icon class="text-sm text-[#f72585]">draw</mat-icon>
            <span>Técnicas de Pincel:</span>
          </span>
          <span class="text-[11px] text-[#866f6f] italic">
            {{ getActiveBrushDescription() }}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          @for (brush of brushOptions; track brush.id) {
            <button
              type="button"
              [id]="'brush-option-' + brush.id"
              (click)="selectBrush(brush.id)"
              [class.bg-[#f6dfd7]]="activeBrush() === brush.id"
              [class.border-[#e07a5f]]="activeBrush() === brush.id"
              [class.ring-2]="activeBrush() === brush.id"
              [class.ring-[#e07a5f]/40]="activeBrush() === brush.id"
              class="p-2.5 rounded-xl border border-[#ebd8ca] bg-white/70 hover:bg-[#fbf1ea] transition-all text-left flex items-center gap-2.5 group cursor-pointer shadow-sm">
              <div
                [class.bg-[#f72585]]="activeBrush() === brush.id"
                [class.text-white]="activeBrush() === brush.id"
                [class.bg-[#f0dfd5]]="activeBrush() !== brush.id"
                [class.text-[#795246]]="activeBrush() !== brush.id"
                class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition shadow-inner">
                <mat-icon class="text-base">{{ brush.icon }}</mat-icon>
              </div>
              <div class="min-w-0">
                <div class="text-xs font-bold leading-tight text-[#3d2727] truncate">{{ brush.name }}</div>
                <div class="text-[10px] text-[#866f6f] truncate leading-tight">{{ brush.tag }}</div>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- Fine Art Pigment Palette & Physical Properties -->
      <div class="mb-4 bg-[#f6eee5]/80 p-3.5 rounded-xl border border-[#ebd8ca] shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <!-- Palette Swatches with Pigment Information -->
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs font-bold text-[#543b3b] uppercase tracking-wider">Paleta de Pigmentos Puros:</span>
              <span class="text-[11px] text-[#8e6b75] font-medium font-serif">
                {{ getSelectedColorInfo() }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              @for (c of palette; track c.hex) {
                <button
                  type="button"
                  [id]="'color-swatch-' + c.hex.replace('#', '')"
                  (click)="selectColor(c.hex)"
                  [title]="c.name + ' (' + c.pigmentCode + ') - ' + c.desc"
                  [style.background-color]="c.hex"
                  [class.ring-4]="selectedColor() === c.hex"
                  [class.ring-[#f72585]/60]="selectedColor() === c.hex"
                  [class.scale-120]="selectedColor() === c.hex"
                  [class.shadow-lg]="selectedColor() === c.hex"
                  class="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-md transition-all hover:scale-125 relative group">
                  @if (c.granulating) {
                    <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#ffaa00] border border-white" title="Pigmento granulado"></span>
                  }
                </button>
              }

              <!-- Color Wheel Selector -->
              <label class="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-gradient-to-tr from-pink-500 via-amber-400 to-sky-400 flex items-center justify-center cursor-pointer hover:scale-125 transition shadow-md" title="Elegir tono personalizado">
                <input type="color" [value]="selectedColor()" (change)="onCustomColorChange($event)" class="sr-only" />
                <mat-icon class="text-white text-xs drop-shadow">colorize</mat-icon>
              </label>
            </div>
          </div>

          <!-- Brush Size & Water Saturation Sliders -->
          <div class="flex flex-wrap items-center gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#ebdcd0]">
            <!-- Brush Diameter -->
            <div class="flex items-center gap-2">
              <mat-icon class="text-[#8c5959] text-base">line_weight</mat-icon>
              <div class="flex flex-col">
                <div class="flex justify-between text-[11px] font-semibold text-[#543b3b]">
                  <span>Grosor</span>
                  <span>{{ brushSize() }}px</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="70"
                  [value]="brushSize()"
                  (input)="onBrushSizeChange($event)"
                  class="w-24 sm:w-28 accent-[#f72585] h-1.5 bg-[#ded0c2] rounded-lg cursor-pointer" />
              </div>
            </div>

            <!-- Water Wash Dilution -->
            <div class="flex items-center gap-2">
              <mat-icon class="text-[#0077b6] text-base">opacity</mat-icon>
              <div class="flex flex-col">
                <div class="flex justify-between text-[11px] font-semibold text-[#543b3b]">
                  <span>Agua / Dilución</span>
                  <span>{{ waterDilution() }}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  [value]="waterDilution()"
                  (input)="onDilutionChange($event)"
                  class="w-24 sm:w-28 accent-[#0077b6] h-1.5 bg-[#ded0c2] rounded-lg cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Guiding Stencils / Sketches Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <div class="flex items-center gap-1.5 text-xs text-[#634b4b] font-semibold">
          <mat-icon class="text-sm text-[#ffaa00]">auto_stories</mat-icon>
          <span>Bocetos y guías para pintar:</span>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          @for (stencil of stencils; track stencil.id) {
            <button
              type="button"
              [id]="'stencil-' + stencil.id"
              (click)="loadStencil(stencil.id)"
              [class.bg-[#f4dfd4]]="activeStencil() === stencil.id"
              [class.border-[#e07a5f]]="activeStencil() === stencil.id"
              [class.font-bold]="activeStencil() === stencil.id"
              class="px-2.5 py-1 rounded-lg border border-[#decbc0] bg-white/80 hover:bg-[#faf0e6] text-[11px] text-[#5c3e3e] transition-all flex items-center gap-1 shadow-sm">
              <mat-icon class="text-xs text-[#c85a70]">{{ stencil.icon }}</mat-icon>
              <span>{{ stencil.name }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Real-feel Watercolor Interactive Drawing Canvas Area -->
      <div class="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#faf6ef] rounded-2xl border-2 border-[#dfcebe] shadow-inner overflow-hidden cursor-crosshair select-none touch-none">
        
        <!-- Live HTML5 Paint Canvas -->
        <canvas
          #paintCanvas
          (mousedown)="startDrawing($event)"
          (mousemove)="draw($event)"
          (mouseup)="stopDrawing()"
          (mouseleave)="stopDrawing()"
          (touchstart)="handleTouchStart($event)"
          (touchmove)="handleTouchMove($event)"
          (touchend)="stopDrawing()"
          class="w-full h-full block touch-none z-10 relative">
        </canvas>

        <!-- Initial Placeholder Instruction -->
        @if (isClean()) {
          <div class="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center pointer-events-none opacity-80 transition-opacity">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#f72585] to-[#ffaa00] flex items-center justify-center text-white mb-3 shadow-lg animate-bounce">
              <mat-icon class="text-3xl">brush</mat-icon>
            </div>
            <p class="font-serif text-xl sm:text-2xl text-[#3d2424] font-bold">Toca o arrastra aquí con tu pincel</p>
            <p class="text-xs sm:text-sm text-[#7d5e5e] max-w-md mt-1.5 leading-relaxed">
              El agua y el pigmento se expandirán de forma viva y orgánica sobre el papel de algodón, mezclándose con la luz.
            </p>
            <div class="mt-4 flex items-center gap-2 text-[11px] bg-white/80 px-3 py-1.5 rounded-full border border-[#ebd8ca] text-[#9c184c] font-medium shadow-sm">
              <mat-icon class="text-sm">favorite</mat-icon>
              <span>Dedicatoria para mi querida Aranxita</span>
            </div>
          </div>
        }

        <!-- Watermark / Romantic signature at bottom corner -->
        <div class="absolute bottom-3 right-4 z-20 text-xs font-script text-[#7c6363] pointer-events-none select-none tracking-wider opacity-85">
          Para Aranxita · Eres una obra de arte
        </div>
      </div>

      <!-- Romantic Art Stamps & Quick Effects -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#ebdcd0] text-xs">
        <div class="flex items-center gap-1.5 text-[#5e4444]">
          <mat-icon class="text-base text-[#f72585]">favorite</mat-icon>
          <span class="font-bold text-xs">Detalles Románticos de Acuarela:</span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="stamp-heart"
            (click)="stampShape('heart')"
            class="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-[#faeee3] border border-[#dfcebe] text-xs font-medium text-[#5a3a3a] transition-all hover:scale-105 shadow-sm flex items-center gap-1.5">
            <mat-icon class="text-sm text-[#f72585]">favorite</mat-icon>
            <span>Corazón de Agua</span>
          </button>

          <button
            type="button"
            id="stamp-rose"
            (click)="stampShape('rose')"
            class="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-[#faeee3] border border-[#dfcebe] text-xs font-medium text-[#5a3a3a] transition-all hover:scale-105 shadow-sm flex items-center gap-1.5">
            <mat-icon class="text-sm text-[#b85368]">local_florist</mat-icon>
            <span>Rosa Acuarelada</span>
          </button>

          <button
            type="button"
            id="stamp-gold"
            (click)="stampShape('gold_splatter')"
            class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#ffe8b3] to-[#fff3d6] hover:from-[#ffd580] border border-[#e6b800] text-xs font-bold text-[#8c5900] transition-all hover:scale-105 shadow-sm flex items-center gap-1.5">
            <mat-icon class="text-sm text-[#d4af37]">auto_awesome</mat-icon>
            <span>Lluvia de Oro Kintsugi</span>
          </button>

          <button
            type="button"
            id="stamp-kiss"
            (click)="stampShape('kiss')"
            class="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-[#faeee3] border border-[#dfcebe] text-xs font-medium text-[#5a3a3a] transition-all hover:scale-105 shadow-sm flex items-center gap-1.5">
            <mat-icon class="text-sm text-[#e63946]">volunteer_activism</mat-icon>
            <span>Beso de Acuarela</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class WatercolorCanvas implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private sound = inject(SoundEffects);

  paintCanvas = viewChild<ElementRef<HTMLCanvasElement>>('paintCanvas');

  activeBrush = signal<BrushType>('kolinsky');
  paperTexture = signal<PaperTextureType>('torchon');
  selectedColor = signal<string>('#f72585');
  brushSize = signal<number>(28);
  waterDilution = signal<number>(20);
  isClean = signal<boolean>(true);
  historyIndex = signal<number>(0);
  activeStencil = signal<string>('blank');

  brushOptions = [
    { id: 'kolinsky' as BrushType, name: 'Pincel Kolinsky', icon: 'brush', tag: 'Acuarela Pura & Cerco', desc: 'Trazo fluido con cuerpo translúcido y borde oscuro por secado de agua.' },
    { id: 'humedo' as BrushType, name: 'Húmedo s/ Húmedo', icon: 'water_drop', tag: 'Difusión Líquida', desc: 'Sangrado orgánico que se expande vivamente hacia las fibras del papel.' },
    { id: 'seco' as BrushType, name: 'Pincel Seco', icon: 'grain', tag: 'Granulación Arches', desc: 'Textura rugosa sobre las crestas del papel Torchon 300g.' },
    { id: 'sal' as BrushType, name: 'Sal Marina', icon: 'scatter_plot', tag: 'Cristales & Salpicado', desc: 'Gotas con efecto salino que abren estrellas de luz translúcidas.' },
    { id: 'floracion' as BrushType, name: 'Floración de Agua', icon: 'spa', tag: 'Efecto Coliflor', desc: 'Gotas de agua pura que dispersan el pigmento creando halos.' },
    { id: 'oro' as BrushType, name: 'Pan de Oro', icon: 'auto_awesome', tag: 'Destellos Kintsugi', desc: 'Pinceladas doradas luminosas con reflejos metálicos.' },
  ];

  palette: ColorPreset[] = [
    { name: 'Carmín Alizarina', hex: '#d90429', pigmentCode: 'PR83', desc: 'Pasión profunda y amor eterno', granulating: false },
    { name: 'Quinacridona Magenta', hex: '#f72585', pigmentCode: 'PR122', desc: 'Ternura viva e intensa', granulating: false },
    { name: 'Rosa Ópera', hex: '#ff007f', pigmentCode: 'PR122/BV10', desc: 'Luz radiante y romance', granulating: false },
    { name: 'Bermellón Cadmio', hex: '#ff5400', pigmentCode: 'PR108', desc: 'Calidez de atardecer', granulating: false },
    { name: 'Amarillo Oro Solar', hex: '#ffaa00', pigmentCode: 'PY150', desc: 'Alegría, sol y brillo', granulating: true },
    { name: 'Azul Ultramar Francés', hex: '#0077b6', pigmentCode: 'PB29', desc: 'Paz profunda y serenidad', granulating: true },
    { name: 'Turquesa Cobalto', hex: '#06d6a0', pigmentCode: 'PG50', desc: 'Frescura cristalina y pureza', granulating: true },
    { name: 'Violeta Dioxazina', hex: '#7209b7', pigmentCode: 'PV23', desc: 'Misterio y belleza poética', granulating: false },
    { name: 'Púrpura Amatista', hex: '#9d4edd', pigmentCode: 'PV19', desc: 'Sensibilidad y ensueño', granulating: true },
    { name: 'Siena Tostada', hex: '#9c4a1a', pigmentCode: 'PBr7', desc: 'Tierra cálida y refugio', granulating: true },
    { name: 'Oro Real Kintsugi', hex: '#d4af37', pigmentCode: 'GOLD', desc: 'Valor incalculable de tu alma', granulating: false },
    { name: 'Agua Pura / Borrador', hex: '#ffffff', pigmentCode: 'H2O', desc: 'Luz y transparencias', granulating: false },
  ];

  stencils: StencilPreset[] = [
    { id: 'blank', name: 'Papel Libre', icon: 'crop_portrait', desc: 'Lienzo en blanco' },
    { id: 'roses', name: 'Rosas para Aranxita', icon: 'local_florist', desc: 'Boceto botánico' },
    { id: 'heart', name: 'Corona de Flores', icon: 'favorite_border', desc: 'Corazón floral' },
    { id: 'butterfly', name: 'Mariposa de Luz', icon: 'filter_vintage', desc: 'Alas translúcidas' },
  ];

  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private history: ImageData[] = [];
  private maxHistory = 15;
  private activeBleeds: WetBleedPoint[] = [];
  private animationFrameId: number | null = null;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    window.addEventListener('resize', this.onResize);
    setTimeout(() => {
      this.initCanvas();
      this.startBleedAnimationLoop();
    }, 80);
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
    if (!this.ctx) return;
    const canvas = this.paintCanvas()?.nativeElement;
    if (!canvas) return;
    const temp = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.initCanvas(false);
    if (this.ctx && temp) {
      this.ctx.putImageData(temp, 0, 0);
    }
  };

  private initCanvas(clear = true) {
    const canvas = this.paintCanvas()?.nativeElement;
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
      this.drawPaperBase();
      this.saveState();
    }
  }

  private drawPaperBase() {
    if (!this.ctx) return;
    const canvas = this.paintCanvas()?.nativeElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Rich handmade watercolor cotton paper base (Arches Torchon / Grain Satin)
    const baseGrad = this.ctx.createLinearGradient(0, 0, w, h);
    baseGrad.addColorStop(0, '#fdfbf7');
    baseGrad.addColorStop(0.5, '#faf5ed');
    baseGrad.addColorStop(1, '#f6f0e4');

    this.ctx.fillStyle = baseGrad;
    this.ctx.fillRect(0, 0, w, h);

    // Render cold-press paper grain texture
    const texture = this.paperTexture();
    const density = texture === 'torchon' ? 4 : 8;
    const intensity = texture === 'torchon' ? 0.08 : 0.04;

    this.ctx.save();
    for (let x = 0; x < w; x += density) {
      for (let y = 0; y < h; y += density) {
        const rand = Math.random();
        if (rand < 0.35) {
          this.ctx.fillStyle = `rgba(180, 160, 145, ${intensity * (0.5 + rand)})`;
          this.ctx.fillRect(x + (Math.random() - 0.5) * 2, y + (Math.random() - 0.5) * 2, 1.2, 1.2);
        } else if (rand > 0.85) {
          this.ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 1.5})`;
          this.ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // Deckled torn-paper border shadow inside
    const innerShadow = this.ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.7);
    innerShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
    innerShadow.addColorStop(1, 'rgba(180, 145, 125, 0.07)');
    this.ctx.fillStyle = innerShadow;
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.restore();
  }

  setPaperTexture(t: PaperTextureType) {
    this.paperTexture.set(t);
    this.sound.playBrushSweep();
    // Softly apply new paper texture underneath
  }

  selectBrush(type: BrushType) {
    this.activeBrush.set(type);
    this.sound.playSoftChime(2);
  }

  getActiveBrushDescription(): string {
    const current = this.brushOptions.find(b => b.id === this.activeBrush());
    return current ? current.desc : '';
  }

  selectColor(hex: string) {
    this.selectedColor.set(hex);
    this.sound.playWaterDrop(1.3);
  }

  getSelectedColorInfo(): string {
    const current = this.palette.find(p => p.hex === this.selectedColor());
    return current ? `${current.name} (${current.pigmentCode})` : 'Tono personalizado';
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

  onDilutionChange(e: Event) {
    const val = Number((e.target as HTMLInputElement).value);
    this.waterDilution.set(val);
  }

  startDrawing(e: MouseEvent) {
    this.isDrawing = true;
    this.isClean.set(false);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;

    this.renderBrushPoint(this.lastX, this.lastY);
    this.sound.playWaterDrop(0.9);
    this.sound.playBrushSweep();
  }

  draw(e: MouseEvent) {
    if (!this.isDrawing) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const dist = Math.hypot(currentX - this.lastX, currentY - this.lastY);
    this.renderBrushSegment(this.lastX, this.lastY, currentX, currentY, dist);

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
      this.renderBrushPoint(this.lastX, this.lastY);
      this.sound.playWaterDrop(0.9);
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

    const dist = Math.hypot(currentX - this.lastX, currentY - this.lastY);
    this.renderBrushSegment(this.lastX, this.lastY, currentX, currentY, dist);

    this.lastX = currentX;
    this.lastY = currentY;
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.saveState();
    }
  }

  private renderBrushPoint(x: number, y: number) {
    if (!this.ctx) return;

    const brush = this.activeBrush();
    const size = this.brushSize();
    const dilution = this.waterDilution();
    const hex = this.selectedColor();

    // High pigment saturation calculation with physical watercolor glazing
    const baseAlpha = ((100 - dilution) / 100) * 0.85 + 0.15;

    switch (brush) {
      case 'kolinsky':
        this.renderKolinskyWash(x, y, size, hex, baseAlpha);
        break;
      case 'humedo':
        this.renderWetInWetBloom(x, y, size, hex, baseAlpha);
        break;
      case 'seco':
        this.renderDryBrush(x, y, size, hex, baseAlpha);
        break;
      case 'sal':
        this.renderSaltCrystals(x, y, size, hex, baseAlpha);
        break;
      case 'floracion':
        this.renderCauliflowerBloom(x, y, size);
        break;
      case 'oro':
        this.renderLiquidGold(x, y, size, baseAlpha);
        break;
    }
  }

  private renderBrushSegment(x1: number, y1: number, x2: number, y2: number, distance: number) {
    if (!this.ctx) return;

    const stepSize = Math.max(2, Math.floor(this.brushSize() * 0.2));
    const steps = Math.max(1, Math.floor(distance / stepSize));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      this.renderBrushPoint(x, y);
    }
  }

  /**
   * 1. Kolinsky Classic Watercolor: Concentric soft glaze with characteristic dark water pooling rim
   */
  private renderKolinskyWash(x: number, y: number, radius: number, color: string, alpha: number) {
    if (!this.ctx) return;
    this.ctx.save();

    // Subtle multiply blend mode for natural watercolor glazing
    this.ctx.globalCompositeOperation = color === '#ffffff' ? 'destination-out' : 'multiply';

    const layers = 3;
    for (let i = 0; i < layers; i++) {
      const currentR = radius * (0.65 + (i / layers) * 0.45);
      const jx = x + (Math.random() - 0.5) * 3;
      const jy = y + (Math.random() - 0.5) * 3;

      const grad = this.ctx.createRadialGradient(jx, jy, currentR * 0.1, jx, jy, currentR);
      grad.addColorStop(0, this.hexToRgba(color, Math.min(1, alpha * 0.85)));
      grad.addColorStop(0.65, this.hexToRgba(color, Math.min(1, alpha * 0.65)));
      grad.addColorStop(0.92, this.hexToRgba(color, Math.min(1, alpha * 0.95))); // Dark caustic edge ring
      grad.addColorStop(1, this.hexToRgba(color, 0));

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(jx, jy, currentR, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Micro granulation specks
    if (this.palette.find(p => p.hex === color)?.granulating) {
      this.renderGranulationSpecks(x, y, radius, color, alpha * 0.5);
    }

    this.ctx.restore();
  }

  /**
   * 2. Wet-in-Wet Active Diffusion: Liquid blooming that expands organically
   */
  private renderWetInWetBloom(x: number, y: number, radius: number, color: string, alpha: number) {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.globalCompositeOperation = color === '#ffffff' ? 'destination-out' : 'multiply';

    const bloomRadius = radius * 1.35;
    const grad = this.ctx.createRadialGradient(x, y, 0, x, y, bloomRadius);
    grad.addColorStop(0, this.hexToRgba(color, Math.min(1, alpha * 1.1)));
    grad.addColorStop(0.5, this.hexToRgba(color, Math.min(1, alpha * 0.75)));
    grad.addColorStop(0.88, this.hexToRgba(color, Math.min(1, alpha * 0.98))); // Pigment ring
    grad.addColorStop(1, this.hexToRgba(color, 0));

    this.ctx.fillStyle = grad;

    // Organic fractal polygon for realistic dendritic water edge
    const points = 10;
    this.ctx.beginPath();
    for (let p = 0; p < points; p++) {
      const angle = (p / points) * Math.PI * 2;
      const variation = (Math.sin(p * 2.5 + x * 0.05) + Math.cos(p * 3 + y * 0.05)) * 0.25;
      const r = bloomRadius * (0.85 + variation);
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (p === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Register active bleed point for live fluid expansion
    if (Math.random() < 0.25 && this.activeBleeds.length < 20) {
      const dendrites: number[] = [];
      for (let d = 0; d < 8; d++) {
        dendrites.push(0.8 + Math.random() * 0.5);
      }
      this.activeBleeds.push({
        x,
        y,
        radius: radius * 0.7,
        maxRadius: radius * 1.6,
        color,
        alpha: alpha * 0.4,
        bleedSpeed: 0.35 + Math.random() * 0.4,
        dendrites
      });
    }

    this.ctx.restore();
  }

  /**
   * 3. Dry Brush on Torchon Cotton Paper: Pigment touches only raised tooth peaks
   */
  private renderDryBrush(x: number, y: number, radius: number, color: string, alpha: number) {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.globalCompositeOperation = color === '#ffffff' ? 'destination-out' : 'multiply';

    const bristles = Math.floor(radius * 2);
    this.ctx.fillStyle = this.hexToRgba(color, Math.min(1, alpha * 1.25));

    for (let i = 0; i < bristles; i++) {
      // Paper grain skip probability
      if (Math.random() < 0.3) continue;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * radius;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;
      const dotSize = 1.2 + Math.random() * 2.8;

      this.ctx.fillRect(px, py, dotSize, dotSize);
    }

    this.ctx.restore();
  }

  /**
   * 4. Sea Salt Crystals & Splatter: Creates crystalline blossoms with light center and dark salt rim
   */
  private renderSaltCrystals(x: number, y: number, radius: number, color: string, alpha: number) {
    if (!this.ctx) return;
    this.ctx.save();

    // Fine watercolor splatter drops
    const drops = 8 + Math.floor(Math.random() * 12);
    for (let d = 0; d < drops; d++) {
      const dist = Math.random() * radius * 2.5;
      const angle = Math.random() * Math.PI * 2;
      const sx = x + Math.cos(angle) * dist;
      const sy = y + Math.sin(angle) * dist;
      const dotR = 1 + Math.random() * 4;

      const grad = this.ctx.createRadialGradient(sx, sy, 0, sx, sy, dotR);
      grad.addColorStop(0, this.hexToRgba(color, Math.min(1, alpha * 1.1)));
      grad.addColorStop(0.75, this.hexToRgba(color, Math.min(1, alpha * 0.85)));
      grad.addColorStop(0.92, this.hexToRgba(color, Math.min(1, alpha * 1.0))); // Rim
      grad.addColorStop(1, this.hexToRgba(color, 0));

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Salt crystallization starbloom
    const saltStars = 3;
    for (let s = 0; s < saltStars; s++) {
      const sx = x + (Math.random() - 0.5) * radius * 1.2;
      const sy = y + (Math.random() - 0.5) * radius * 1.2;
      const saltR = 6 + Math.random() * 10;

      // Salt absorbs water: clear center with pushed-out pigment ring
      const saltGrad = this.ctx.createRadialGradient(sx, sy, 0, sx, sy, saltR);
      saltGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      saltGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
      saltGrad.addColorStop(0.85, this.hexToRgba(color, Math.min(1, alpha * 1.3))); // Salt edge
      saltGrad.addColorStop(1, this.hexToRgba(color, 0));

      this.ctx.fillStyle = saltGrad;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, saltR, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  /**
   * 5. Cauliflower / Water Bloom: Clear water push that opens transparent halos in wet paint
   */
  private renderCauliflowerBloom(x: number, y: number, radius: number) {
    if (!this.ctx) return;
    this.ctx.save();

    const bloomR = radius * 1.4;
    const grad = this.ctx.createRadialGradient(x, y, 0, x, y, bloomR);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(0.85, 'rgba(215, 175, 160, 0.35)'); // Displaced pigment ridge
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    this.ctx.fillStyle = grad;

    // Organic cauliflower edge
    const lobes = 9;
    this.ctx.beginPath();
    for (let i = 0; i < lobes; i++) {
      const angle = (i / lobes) * Math.PI * 2;
      const r = bloomR * (0.8 + Math.random() * 0.35);
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * 6. Liquid Gold Leaf / Kintsugi: Metallic shimmering gold strokes
   */
  private renderLiquidGold(x: number, y: number, radius: number, alpha: number) {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.globalAlpha = Math.min(1, alpha);

    const goldColors = ['#ffd700', '#d4af37', '#ffaa00', '#fff3b0'];
    const r = radius * 0.8;

    const grad = this.ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, '#fff6cc');
    grad.addColorStop(0.4, '#ffd700');
    grad.addColorStop(0.8, '#d4af37');
    grad.addColorStop(1, 'rgba(212, 175, 55, 0)');

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.fill();

    // Glitter flakes
    const flakes = 5;
    for (let f = 0; f < flakes; f++) {
      const fx = x + (Math.random() - 0.5) * r * 1.5;
      const fy = y + (Math.random() - 0.5) * r * 1.5;
      const fColor = goldColors[Math.floor(Math.random() * goldColors.length)];
      this.ctx.fillStyle = fColor;
      this.ctx.fillRect(fx, fy, 1.8, 1.8);
    }

    this.ctx.restore();
  }

  /**
   * Flocculation & Granulation specks
   */
  private renderGranulationSpecks(x: number, y: number, radius: number, color: string, alpha: number) {
    if (!this.ctx) return;
    const specks = Math.floor(radius * 0.7);
    this.ctx.fillStyle = this.hexToRgba(color, Math.min(1, alpha * 1.5));
    for (let i = 0; i < specks; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * radius * 0.9;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;
      this.ctx.fillRect(px, py, 1.3, 1.3);
    }
  }

  /**
   * Continuous Bleed Animation Loop for fluid wet watercolor expansion
   */
  private startBleedAnimationLoop() {
    const loop = () => {
      if (this.activeBleeds.length > 0 && this.ctx) {
        for (let i = this.activeBleeds.length - 1; i >= 0; i--) {
          const bleed = this.activeBleeds[i];
          bleed.radius += bleed.bleedSpeed;
          bleed.alpha *= 0.97;

          this.ctx.save();
          this.ctx.globalCompositeOperation = 'multiply';

          const grad = this.ctx.createRadialGradient(bleed.x, bleed.y, 0, bleed.x, bleed.y, bleed.radius);
          grad.addColorStop(0, this.hexToRgba(bleed.color, bleed.alpha * 0.4));
          grad.addColorStop(0.85, this.hexToRgba(bleed.color, bleed.alpha * 0.6));
          grad.addColorStop(1, this.hexToRgba(bleed.color, 0));

          this.ctx.fillStyle = grad;
          this.ctx.beginPath();
          const pts = bleed.dendrites.length;
          for (let p = 0; p < pts; p++) {
            const angle = (p / pts) * Math.PI * 2;
            const r = bleed.radius * bleed.dendrites[p];
            const px = bleed.x + Math.cos(angle) * r;
            const py = bleed.y + Math.sin(angle) * r;
            if (p === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
          }
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.restore();

          if (bleed.radius >= bleed.maxRadius || bleed.alpha < 0.02) {
            this.activeBleeds.splice(i, 1);
          }
        }
      }
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Romantic Quick Stamps
   */
  stampShape(type: 'heart' | 'rose' | 'gold_splatter' | 'kiss') {
    const canvas = this.paintCanvas()?.nativeElement;
    if (!canvas || !this.ctx) return;

    this.isClean.set(false);
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2 + (Math.random() - 0.5) * (rect.width * 0.4);
    const cy = rect.height / 2 + (Math.random() - 0.5) * (rect.height * 0.3);
    const color = this.selectedColor();

    this.ctx.save();
    this.ctx.translate(cx, cy);

    if (type === 'heart') {
      this.drawWatercolorHeart(color);
      this.sound.playSoftChime(4);
    } else if (type === 'rose') {
      this.drawWatercolorRose(color);
      this.sound.playSoftChime(3);
    } else if (type === 'gold_splatter') {
      this.renderLiquidGold(0, 0, 45, 0.9);
      this.renderSaltCrystals(0, 0, 50, '#ffaa00', 0.9);
      this.sound.playWaterDrop(1.5);
    } else if (type === 'kiss') {
      this.drawWatercolorKiss(color);
      this.sound.playSoftChime(1);
    }

    this.ctx.restore();
    this.saveState();
  }

  private drawWatercolorHeart(color: string) {
    if (!this.ctx) return;
    const scale = 1.4;

    for (let layer = 0; layer < 5; layer++) {
      const alpha = 0.55 - layer * 0.08;
      const currentScale = scale * (1 - layer * 0.08);
      this.ctx.fillStyle = this.hexToRgba(color, alpha);
      this.ctx.beginPath();
      this.ctx.moveTo(0, -10 * currentScale);
      this.ctx.bezierCurveTo(-22 * currentScale, -32 * currentScale, -42 * currentScale, 6 * currentScale, 0, 38 * currentScale);
      this.ctx.bezierCurveTo(42 * currentScale, 6 * currentScale, 22 * currentScale, -32 * currentScale, 0, -10 * currentScale);
      this.ctx.fill();
    }
  }

  private drawWatercolorRose(color: string) {
    if (!this.ctx) return;
    const petals = 9;
    for (let p = 0; p < petals; p++) {
      const angle = (p / petals) * Math.PI * 2;
      const r = 22 + (p % 2) * 12;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      this.renderWetInWetBloom(px, py, 24, color, 0.7);
    }
    this.renderWetInWetBloom(0, 0, 18, '#d90429', 0.9);
    this.renderLiquidGold(0, 0, 8, 0.95);
  }

  private drawWatercolorKiss(color: string) {
    if (!this.ctx) return;
    for (let l = 0; l < 3; l++) {
      this.ctx.fillStyle = this.hexToRgba(color, 0.5 - l * 0.1);
      this.ctx.beginPath();
      this.ctx.ellipse(-14, -5, 18 - l * 2, 7 - l, -0.2, 0, Math.PI * 2);
      this.ctx.ellipse(14, -5, 18 - l * 2, 7 - l, 0.2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.ellipse(0, 9, 24 - l * 3, 10 - l, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * Load Guided Stencils
   */
  loadStencil(id: string) {
    this.activeStencil.set(id);
    this.clearCanvas();

    if (id === 'blank') return;

    this.isClean.set(false);
    const canvas = this.paintCanvas()?.nativeElement;
    if (!canvas || !this.ctx) return;

    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(180, 140, 130, 0.35)';
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([4, 4]);

    if (id === 'roses') {
      // Botanical guide
      this.ctx.beginPath();
      this.ctx.arc(cx - 50, cy, 35, 0, Math.PI * 2);
      this.ctx.arc(cx + 50, cy - 20, 42, 0, Math.PI * 2);
      this.ctx.arc(cx, cy + 45, 38, 0, Math.PI * 2);
      this.ctx.stroke();

      // Delicate leaf stems
      this.ctx.beginPath();
      this.ctx.moveTo(cx - 85, cy + 10);
      this.ctx.quadraticCurveTo(cx - 120, cy + 20, cx - 140, cy + 60);
      this.ctx.moveTo(cx + 90, cy - 10);
      this.ctx.quadraticCurveTo(cx + 130, cy + 10, cx + 150, cy + 40);
      this.ctx.stroke();
    } else if (id === 'heart') {
      // Heart floral wreath guide
      const scale = 2.8;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - 20 * scale);
      this.ctx.bezierCurveTo(cx - 30 * scale, cy - 45 * scale, cx - 60 * scale, cy + 5 * scale, cx, cy + 50 * scale);
      this.ctx.bezierCurveTo(cx + 60 * scale, cy + 5 * scale, cx + 30 * scale, cy - 45 * scale, cx, cy - 20 * scale);
      this.ctx.stroke();
    } else if (id === 'butterfly') {
      // Butterfly wings guide
      this.ctx.beginPath();
      this.ctx.ellipse(cx - 60, cy - 30, 55, 35, -0.4, 0, Math.PI * 2);
      this.ctx.ellipse(cx + 60, cy - 30, 55, 35, 0.4, 0, Math.PI * 2);
      this.ctx.ellipse(cx - 45, cy + 30, 40, 25, 0.3, 0, Math.PI * 2);
      this.ctx.ellipse(cx + 45, cy + 30, 40, 25, -0.3, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();
    this.saveState();
    this.sound.playSoftChime(0);
  }

  private hexToRgba(hex: string, alpha: number): string {
    let c = hex.replace('#', '');
    if (c.length === 3) {
      c = c.split('').map(x => x + x).join('');
    }
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private saveState() {
    const canvas = this.paintCanvas()?.nativeElement;
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
      this.sound.playWaterDrop(0.8);
    }
  }

  clearCanvas() {
    this.activeBleeds = [];
    this.drawPaperBase();
    this.history = [];
    this.saveState();
    this.isClean.set(true);
    this.sound.playSoftChime(0);
  }

  downloadArtwork() {
    const canvas = this.paintCanvas()?.nativeElement;
    if (!canvas) return;

    // Create high-res export canvas with museum passepartout border and dedication watermark
    const exportCanvas = document.createElement('canvas');
    const border = 40;
    exportCanvas.width = canvas.width + border * 2;
    exportCanvas.height = canvas.height + border * 2;
    const eCtx = exportCanvas.getContext('2d');
    if (!eCtx) return;

    // Outer warm museum mat board
    eCtx.fillStyle = '#f8f4ed';
    eCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Inner gold fillet border line
    eCtx.strokeStyle = '#d4af37';
    eCtx.lineWidth = 2;
    eCtx.strokeRect(border - 6, border - 6, canvas.width + 12, canvas.height + 12);

    // Draw artwork in center
    eCtx.drawImage(canvas, border, border);

    // Romantic dedication and signature
    eCtx.fillStyle = '#5a3a3a';
    eCtx.font = 'italic 26px "Playfair Display", Georgia, serif';
    eCtx.textAlign = 'right';
    eCtx.fillText('Para Aranxita · Eres una obra de arte', exportCanvas.width - border - 12, exportCanvas.height - 14);

    const link = document.createElement('a');
    link.download = 'Aranxita-Obra-De-Arte.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    this.sound.playSoftChime(5);
  }
}
