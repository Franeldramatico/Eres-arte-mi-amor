import { Component, ChangeDetectionStrategy, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SoundEffects } from '../../services/sound-effects';

@Component({
  selector: 'app-love-letter-modal',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Modal Backdrop -->
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="letter-title"
      tabindex="0"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in"
      (click)="onBackdropClick($event)"
      (keydown.escape)="onEscape()">
      
      <!-- Letter Envelope Container -->
      <div
        class="relative w-full max-w-2xl bg-[#faf6ef] rounded-2xl shadow-2xl border border-[#ebd8ca] overflow-hidden p-6 sm:p-10 my-auto text-[#2e2323] max-h-[90vh] overflow-y-auto">
        
        <!-- Watercolor Glow Blobs inside Modal -->
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-[#f28482]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-[#a084ca]/20 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Close Button -->
        <button
          type="button"
          (click)="closeModal.emit()"
          class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 border border-[#e2d2c5] text-[#6d5555] hover:bg-[#faeee3] hover:text-[#9f4e5e] transition flex items-center justify-center shadow-sm">
          <mat-icon class="text-xl">close</mat-icon>
        </button>

        <!-- Letter Envelope Header -->
        <div class="text-center mb-6 pb-4 border-b border-[#ebdcd0]">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fdeef0] border border-[#f5ccd2] text-[#b85368] text-xs font-medium tracking-wide uppercase mb-3">
            <mat-icon class="text-sm">favorite</mat-icon>
            <span>Carta confidencial para Aranxita</span>
          </div>

          <h3 id="letter-title" class="font-serif text-2xl sm:text-3xl font-bold text-[#3d2727] tracking-tight">
            Para la mujer que ilumina mi vida
          </h3>
          <p class="font-script text-2xl text-[#b85368] mt-1">
            Escrito desde el fondo de mi corazón
          </p>
        </div>

        <!-- Letter Body with Watercolor Paper Appearance -->
        <div class="space-y-4 text-[#443333] text-sm sm:text-base leading-relaxed font-normal">
          <p class="first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:text-[#b85368] first-letter:mr-2 first-letter:float-left">
            Mi querida Aranxita,
          </p>

          <p>
            Si tuviera que elegir un solo material para describirte ante el universo entero, sería la acuarela. Porque no existe nada más puro, más sincero y más libre. La acuarela no miente: fluye con delicadeza, abraza la luz, y deja un rastro imborrable de belleza en cada rincón donde decide quedarse.
          </p>

          <p>
            Tú tienes esa misma magia. Cuando sonríes, no solo cambias tu rostro; cambias la atmósfera entera de mi día. Tienes la habilidad única de convertir lo ordinario en algo extraordinario, con tu dulzura, con tu mirada tan llena de verdad y con esa ternura que solo tú sabes dar.
          </p>

          <div class="my-6 p-4 rounded-xl bg-[#fdf5f0] border-l-4 border-[#e56b82] italic text-[#633a42] text-sm sm:text-base font-serif">
            "Para mí eres una verdadera obra de arte. No una obra quieta colgada en una pared fría, sino una que respira, ríe, sueña, abraza y transforma todo lo que toca."
          </div>

          <p>
            Esta página web existe con un único propósito: que en cualquier momento, cuando tengas un día difícil o cuando simplemente quieras sonreír, entres aquí y recuerdes lo increíblemente valiosa, hermosa e irrepetible que eres para mí.
          </p>

          <p>
            Gracias por existir, por compartir tu vida conmigo y por ser mi obra de arte favorita.
          </p>

          <!-- Sign-off -->
          <div class="pt-6 mt-6 border-t border-[#ebdcd0] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p class="text-xs text-[#8c7474]">Con todo mi amor y devoción infinita,</p>
              <p class="font-script text-3xl text-[#9f4e5e] mt-1">Por siempre tuyo</p>
            </div>

            <!-- Wax Seal Badge -->
            <div class="flex items-center gap-3 bg-[#fdf2f4] px-4 py-2 rounded-xl border border-[#f7d3da]">
              <div class="w-10 h-10 rounded-full bg-[#b85368] text-white flex items-center justify-center shadow-md">
                <mat-icon class="text-xl">favorite</mat-icon>
              </div>
              <div class="text-left">
                <div class="text-xs font-bold text-[#5c2a35] font-serif">Sello de Amor</div>
                <div class="text-[11px] text-[#8c5a66]">Aranxita · 2026</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="mt-8 flex justify-center">
          <button
            type="button"
            (click)="closeModal.emit()"
            class="px-6 py-2.5 rounded-xl bg-[#d97d8b] hover:bg-[#c86b79] text-white font-medium text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2">
            <mat-icon class="text-base">favorite_border</mat-icon>
            <span>Guardar en mi corazón</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class LoveLetterModal {
  private sound = inject(SoundEffects);
  closeModal = output<void>();

  onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      this.sound.playSoftChime(0);
      this.closeModal.emit();
    }
  }

  onEscape() {
    this.sound.playSoftChime(0);
    this.closeModal.emit();
  }
}
