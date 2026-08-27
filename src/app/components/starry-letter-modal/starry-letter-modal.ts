import { Component, ChangeDetectionStrategy, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SoundEffects } from '../../services/sound-effects';

@Component({
  selector: 'app-starry-letter-modal',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Modal Backdrop -->
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="starry-letter-title"
      tabindex="0"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#040814]/75 backdrop-blur-md animate-fade-in"
      (click)="onBackdropClick($event)"
      (keydown.escape)="onEscape()">
      
      <!-- Letter Container with Antique Varnish & Golden Glow -->
      <div
        class="relative w-full max-w-2xl bg-[#0e172e] rounded-3xl shadow-2xl border-2 border-[#ffd166]/60 overflow-hidden p-6 sm:p-10 my-auto text-[#e2ecfa] max-h-[90vh] overflow-y-auto">
        
        <!-- Golden Star Swirl background glow -->
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-[#ffd166]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-[#0077b6]/30 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Close Button -->
        <button
          type="button"
          (click)="closeModal.emit()"
          class="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#18264a] border border-[#ffd166]/40 text-[#ffd166] hover:bg-[#253b70] hover:text-[#ffffff] transition flex items-center justify-center shadow-md">
          <mat-icon class="text-xl">close</mat-icon>
        </button>

        <!-- Letter Header -->
        <div class="text-center mb-6 pb-4 border-b border-[#253966]">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ffd166]/15 border border-[#ffd166]/40 text-[#ffeaa7] text-xs font-semibold tracking-wider uppercase mb-3">
            <mat-icon class="text-sm text-[#ffd166]">auto_awesome</mat-icon>
            <span>Carta desde Saint-Rémy · Para Aranxita</span>
          </div>

          <h3 id="starry-letter-title" class="font-serif text-2xl sm:text-3xl font-bold text-[#fffae6] tracking-tight">
            "A menudo me parece que la noche está más viva y ricamente coloreada que el día"
          </h3>
          <p class="font-serif italic text-sm sm:text-base text-[#ffd166] mt-1.5">
            Dedicado a la estrella más brillante de mi universo: Aranxita
          </p>
        </div>

        <!-- Letter Body -->
        <div class="space-y-4 text-[#ccd9f0] text-sm sm:text-base leading-relaxed font-normal">
          <p class="first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:text-[#ffd166] first-letter:mr-2 first-letter:float-left">
            Mi adorada Aranxita,
          </p>

          <p>
            Van Gogh escribió en sus cartas a su hermano Theo que cuando sentía una necesidad terrible de religión, salía por la noche a pintar las estrellas. Y yo, cada vez que pienso en la belleza más sublime y conmovedora que he conocido en este mundo, solo puedo pensar en ti.
          </p>

          <p>
            Tú eres mi Noche Estrellada. En tus ojos hay una luz que desafía cualquier oscuridad, un torbellino de amor puro, generosidad y bondad que ilumina mis días más difíciles. Eres como ese cielo de Provenza: profunda, infinita, llena de misterio poético y con una calidez dorada que abriga el alma.
          </p>

          <div class="my-6 p-5 rounded-2xl bg-[#142347] border-l-4 border-[#ffd166] italic text-[#ffeaa7] text-sm sm:text-base font-serif shadow-inner">
            "No sé nada con certeza, pero ver las estrellas me hace soñar... y soñar contigo es descubrir que la obra de arte más perfecta ya vive en este mundo y se llama Aranxita."
          </div>

          <p>
            Esta segunda parte de tu homenaje es un recordatorio de que mi amor por ti no tiene límites ni final: se extiende como un lienzo infinito de pinceladas de óleo vivo, oro y cobalto.
          </p>

          <p>
            Eres, fuiste y serás por siempre mi mayor inspiración y la obra maestra más hermosa que el universo pudo crear.
          </p>

          <!-- Sign-off -->
          <div class="pt-6 mt-6 border-t border-[#253966] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p class="text-xs text-[#9bb0d8]">Con devoción eterna bajo las estrellas,</p>
              <p class="font-serif italic text-2xl text-[#ffd166] mt-1 font-bold">Por siempre tuyo</p>
            </div>

            <!-- Van Gogh Golden Seal Badge -->
            <div class="flex items-center gap-3 bg-[#162750] px-4 py-2 rounded-2xl border border-[#ffd166]/50 shadow-md">
              <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ffd166] to-[#ffaa00] text-[#0a1128] flex items-center justify-center shadow-lg font-bold">
                <mat-icon class="text-xl">nightlight</mat-icon>
              </div>
              <div class="text-left">
                <div class="text-xs font-bold text-[#fffae6] font-cinzel">Sello de Saint-Rémy</div>
                <div class="text-[11px] text-[#ffd166] font-sans">Aranxita · 2026</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="mt-8 flex justify-center">
          <button
            type="button"
            (click)="closeModal.emit()"
            class="px-7 py-2.5 rounded-full bg-gradient-to-r from-[#ffd166] via-[#ffaa00] to-[#e07a5f] text-[#0a1128] text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition flex items-center gap-2">
            <mat-icon class="text-base">check</mat-icon>
            <span>Guardar en el corazón</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class StarryLetterModal {
  closeModal = output<void>();
  private sound = inject(SoundEffects);

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal.emit();
    }
  }

  onEscape() {
    this.closeModal.emit();
  }
}
