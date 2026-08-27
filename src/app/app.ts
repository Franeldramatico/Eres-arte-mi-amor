import { ChangeDetectionStrategy, Component, signal, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BackgroundStains } from './components/background-stains/background-stains';
import { WatercolorCanvas } from './components/watercolor-canvas/watercolor-canvas';
import { LoveLetterModal } from './components/love-letter-modal/love-letter-modal';
import { StarryNightBackground } from './components/starry-night-background/starry-night-background';
import { StarryNightCanvas } from './components/starry-night-canvas/starry-night-canvas';
import { StarryLetterModal } from './components/starry-letter-modal/starry-letter-modal';
import { SoundEffects } from './services/sound-effects';

export interface Artwork {
  id: number;
  title: string;
  subtitle: string;
  paletteName: string;
  themeColor: string;
  bgGradient: string;
  stainColors: string[];
  description: string;
  quote: string;
  tags: string[];
}

export interface StarryArtwork {
  id: number;
  title: string;
  subtitle: string;
  paletteName: string;
  themeColor: string;
  bgGradient: string;
  accentColor: string;
  description: string;
  quote: string;
  yearRef: string;
  tags: string[];
}

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    MatIconModule,
    BackgroundStains,
    WatercolorCanvas,
    LoveLetterModal,
    StarryNightBackground,
    StarryNightCanvas,
    StarryLetterModal,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  sound = inject(SoundEffects);

  // Active theme: 'watercolor' (Part 1) or 'starry_night' (Part 2)
  currentTheme = signal<'watercolor' | 'starry_night'>('watercolor');
  isTransitioning = signal<boolean>(false);

  // Modals & Navigation
  isLetterOpen = signal<boolean>(false);
  isStarryLetterOpen = signal<boolean>(false);
  selectedArtwork = signal<Artwork | null>(null);
  selectedStarryArtwork = signal<StarryArtwork | null>(null);
  activeNav = signal<string>('hero');
  mobileMenuOpen = signal<boolean>(false);
  isSoundMuted = signal<boolean>(false);

  // Gallery Artworks (Part 1: Watercolor)
  artworks: Artwork[] = [
    {
      id: 1,
      title: 'Luz de la Mañana',
      subtitle: 'Amanecer en carmín y oro solar',
      paletteName: 'Carmín Quinacridona & Oro Solar',
      themeColor: '#f72585',
      bgGradient: 'from-[#fde2e8] via-[#fff1e0] to-[#fde8ec]',
      stainColors: ['#f72585', '#ffaa00', '#ff007f'],
      description: 'Inspirada en el momento exacto en que abres los ojos y la luz toca tu rostro. Una mezcla de pigmentos vivos que representan la pureza, la ternura y la frescura luminosa con la que comienzas cada día.',
      quote: '"Tu sola presencia tiene el poder de disipar cualquier sombra."',
      tags: ['Ternura', 'Despertar', 'Luminosidad']
    },
    {
      id: 2,
      title: 'Océano de Calma',
      subtitle: 'Azul cobalto y turquesa esmeralda',
      paletteName: 'Azul Cobalto & Turquesa Esmeralda',
      themeColor: '#0096c7',
      bgGradient: 'from-[#e0f4fc] via-[#e6faf6] to-[#ebf7f9]',
      stainColors: ['#0077b6', '#00b4d8', '#06d6a0'],
      description: 'El reflejo de la tranquilidad infinita que transmites. Como olas de agua cristalina sobre arena suave, esta obra captura la serenidad profunda que encuentro cuando estoy junto a ti.',
      quote: '"En tus brazos el mundo entero deja de tener prisa."',
      tags: ['Paz', 'Refugio', 'Serenidad']
    },
    {
      id: 3,
      title: 'Flores de Medianoche',
      subtitle: 'Violeta imperial y orquídea silvestre',
      paletteName: 'Violeta Imperial & Lavanda Intensa',
      themeColor: '#7209b7',
      bgGradient: 'from-[#f3e8fc] via-[#f9effe] to-[#eee0fa]',
      stainColors: ['#7209b7', '#9d4edd', '#c77dff'],
      description: 'Representa la profundidad de tus pensamientos, tu misterio encantador y esa sensibilidad artística que te hace tan única e inolvidable.',
      quote: '"La belleza más profunda no hace ruido; florece en silencio."',
      tags: ['Introspección', 'Magia', 'Elegancia']
    },
    {
      id: 4,
      title: 'Fuego y Ternura',
      subtitle: 'Bermellón encendido y rubí terciopelo',
      paletteName: 'Bermellón Coral & Rubí Vivo',
      themeColor: '#ff5400',
      bgGradient: 'from-[#ffede6] via-[#ffeae8] to-[#ffebed]',
      stainColors: ['#ff5400', '#f72585', '#d00000'],
      description: 'El latido apasionado de tu corazón, tu fuerza interior y el calor que le regalas a quienes tenemos la fortuna inmensa de amarte.',
      quote: '"Amas con toda el alma, y eso te convierte en una fuerza invencible."',
      tags: ['Pasión', 'Coraje', 'Amor Infinito']
    }
  ];

  // What you inspire features (Part 1)
  inspirations = [
    {
      title: 'Tu Dulzura',
      color: '#f72585',
      icon: 'favorite',
      bgLight: 'bg-[#fde2e8]',
      borderLight: 'border-[#f8a5c2]',
      textDark: 'text-[#9c184c]',
      quote: 'Una suavidad que abriga el alma',
      text: 'Tu forma de hablar, de mirar y de cuidar a los demás tiene una delicadeza que no se aprende: nace de un corazón naturalmente bondadoso.'
    },
    {
      title: 'Tu Calma',
      color: '#0096c7',
      icon: 'spa',
      bgLight: 'bg-[#e0f4fc]',
      borderLight: 'border-[#90e0ef]',
      textDark: 'text-[#023e8a]',
      quote: 'El refugio donde todo encuentra paz',
      text: 'Estar a tu lado es como respirar hondo después de un largo camino. Tienes la habilidad de serenar mis pensamientos con una sola palabra.'
    },
    {
      title: 'Tu Alegría',
      color: '#ffaa00',
      icon: 'wb_sunny',
      bgLight: 'bg-[#fff4e0]',
      borderLight: 'border-[#ffdd99]',
      textDark: 'text-[#995c00]',
      quote: 'La chispa que enciende los colores',
      text: 'Tu risa es contagiosa, genuina y luminosa. Cuando eres feliz, es imposible no contagiarse de esa vitalidad que desprendes.'
    },
    {
      title: 'Tu Esencia Única',
      color: '#7209b7',
      icon: 'auto_awesome',
      bgLight: 'bg-[#f3e8fc]',
      borderLight: 'border-[#d0a2f7]',
      textDark: 'text-[#5a189a]',
      quote: 'Una obra de arte irrepetible',
      text: 'No existe en este planeta nadie que piense, ame o sienta como tú. Eres auténtica, libre y profundamente hermosa en cada detalle.'
    }
  ];

  // Part 2: Starry Night Masterpieces for Aranxita
  starryArtworks: StarryArtwork[] = [
    {
      id: 1,
      title: 'El Gran Remolino de Saint-Rémy',
      subtitle: 'Óleo sobre lienzo · Impasto en Azul Cobalto y Amarillo Cadmio',
      paletteName: 'Azul Cobalto, Ultramar y Oro Solar',
      themeColor: '#ffd166',
      accentColor: '#0077b6',
      bgGradient: 'from-[#0a1638] via-[#0f2858] to-[#08122c]',
      yearRef: 'Saint-Rémy, Junio 1889',
      description: 'El vórtice celeste que gira con una pasión ingobernable. Así como Van Gogh plasmó la energía cósmica del firmamento, esta obra representa el torbellino de emociones hermosas y el latido desbordante que despiertas en mi pecho.',
      quote: '"No sé nada con certeza, pero la vista de las estrellas siempre me hace soñar contigo."',
      tags: ['Vórtice Cósmico', 'Pasión', 'Impasto Puro']
    },
    {
      id: 2,
      title: 'Terraza de Café a la Luz de tus Ojos',
      subtitle: 'Arles · La calidez dorada que desafía a la noche',
      paletteName: 'Amarillo Cromo, Violeta & Azul Noche',
      themeColor: '#ffaa00',
      accentColor: '#7209b7',
      bgGradient: 'from-[#141b38] via-[#1c2752] to-[#0f142e]',
      yearRef: 'Place du Forum, Arles 1888',
      description: 'Una terraza iluminada donde la luz dorada y cálida abraza a los caminantes en medio de una noche estrellada. Tú eres esa luz acogedora que transforma cualquier lugar en un hogar lleno de paz.',
      quote: '"La noche está más viva y ricamente coloreada cuando tú estás presente."',
      tags: ['Luz Dorada', 'Acogida', 'Noche de Arles']
    },
    {
      id: 3,
      title: 'Almendro en Flor para Aranxita',
      subtitle: 'Ramas celestes en turquesa y pétalos nacarados',
      paletteName: 'Turquesa Francés & Blanco Ópalo',
      themeColor: '#48cae4',
      accentColor: '#f72585',
      bgGradient: 'from-[#082032] via-[#0f3b56] to-[#081a28]',
      yearRef: 'Saint-Rémy, Febrero 1890',
      description: 'Pintado como homenaje al nacimiento y la vida más pura. Cada pétalo blanco de almendro floreciendo contra el azul turquesa simboliza tu ternura inquebrantable, tu inocencia y tu capacidad infinita de renovar mi corazón.',
      quote: '"Floreces con una gracia que ningún invierno puede marchitar."',
      tags: ['Esperanza', 'Florecimiento', 'Pureza']
    },
    {
      id: 4,
      title: 'Noche Estrellada sobre el Ródano',
      subtitle: 'Reflejos dorados de amor sobre aguas tranquilas',
      paletteName: 'Azul Prusia & Destellos de Gas Dorado',
      themeColor: '#ffdd53',
      accentColor: '#03045e',
      bgGradient: 'from-[#060c1e] via-[#0d1d44] to-[#050a18]',
      yearRef: 'Arles, Septiembre 1888',
      description: 'Dos almas caminando a orillas del agua mientras las luces de la ciudad y las estrellas del cielo se funden en destellos dorados. Es la promesa de caminar siempre a tu lado, bajo cualquier firmamento.',
      quote: '"Pienso que no hay nada más verdaderamente artístico que amar a alguien como yo te amo."',
      tags: ['Reflejos de Amor', 'Eternidad', 'Ródano']
    }
  ];

  // Part 2: Starry Night Constellations (What she inspires in Van Gogh theme)
  starryConstellations = [
    {
      title: 'El Vórtice de tu Mirada',
      color: '#ffd166',
      icon: 'cyclone',
      bgCard: 'bg-[#0f1d40]/90',
      borderCard: 'border-[#ffd166]/40',
      textAccent: 'text-[#ffd166]',
      quote: 'Una profundidad que conmueve el universo',
      text: 'Cuando me miras, siento el mismo asombro que Van Gogh al contemplar el cielo nocturno. Hay una fuerza inmensa y sincera en tus ojos que desarma cualquier temor.'
    },
    {
      title: 'La Luna Creciente Dorada',
      color: '#ffaa00',
      icon: 'nightlight',
      bgCard: 'bg-[#122248]/90',
      borderCard: 'border-[#ffaa00]/40',
      textAccent: 'text-[#ffaa00]',
      quote: 'El faro protector en la noche',
      text: 'Tu ternura tiene la suavidad de la luz de luna. No encandila ni quema: guía con paciencia, abriga en silencio y convierte la noche en un remanso de paz.'
    },
    {
      title: 'El Ciprés de Saint-Rémy',
      color: '#06d6a0',
      icon: 'park',
      bgCard: 'bg-[#0b1c28]/90',
      borderCard: 'border-[#06d6a0]/40',
      textAccent: 'text-[#06d6a0]',
      quote: 'Firmeza, lealtad y amor inquebrantable',
      text: 'El ciprés de Van Gogh se eleva como una llama viva hacia las estrellas. Así es nuestro amor y tu carácter: noble, firme, fiel y arraigado en la verdad.'
    },
    {
      title: 'La Estrella de la Mañana',
      color: '#48cae4',
      icon: 'auto_awesome',
      bgCard: 'bg-[#0f223f]/90',
      borderCard: 'border-[#48cae4]/40',
      textAccent: 'text-[#48cae4]',
      quote: 'La luz que nunca deja de brillar',
      text: 'Venus resplandece en el cuadro como un lucero inextinguible. Para mí, tú eres esa estrella que marca el norte de mi vida y me recuerda por qué vale la pena soñar.'
    }
  ];

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    window.addEventListener('scroll', this.handleScrollSpy, { passive: true });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.handleScrollSpy);
    }
  }

  private handleScrollSpy = () => {
    const isStarry = this.currentTheme() === 'starry_night';
    const sections = isStarry
      ? ['starry-hero', 'starry-intro', 'starry-constelaciones', 'starry-galeria', 'starry-pintar', 'starry-cartas']
      : ['hero', 'intro', 'lo-que-inspiras', 'galeria', 'pintar', 'historia', 'carta'];
    
    const scrollPos = window.scrollY + 200;

    for (const sectionId of sections) {
      const el = document.getElementById(sectionId);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          this.activeNav.set(sectionId);
          break;
        }
      }
    }
  };

  /**
   * Transition to Part 2: Van Gogh's Starry Night
   */
  switchToStarryNight() {
    this.isTransitioning.set(true);
    this.sound.playCelestialArpeggio();

    setTimeout(() => {
      this.currentTheme.set('starry_night');
      this.activeNav.set('starry-hero');
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      setTimeout(() => {
        this.isTransitioning.set(false);
      }, 500);
    }, 400);
  }

  /**
   * Transition back to Part 1: Watercolor
   */
  switchToWatercolor() {
    this.isTransitioning.set(true);
    this.sound.playSoftChime(4);

    setTimeout(() => {
      this.currentTheme.set('watercolor');
      this.activeNav.set('hero');
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      setTimeout(() => {
        this.isTransitioning.set(false);
      }, 500);
    }, 400);
  }

  scrollTo(sectionId: string) {
    this.mobileMenuOpen.set(false);
    this.activeNav.set(sectionId);
    
    if (this.currentTheme() === 'starry_night') {
      this.sound.playStarSparkle();
    } else {
      this.sound.playSoftChime(2);
    }

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleSound() {
    const muted = this.sound.toggleMute();
    this.isSoundMuted.set(muted);
    if (!muted) {
      if (this.currentTheme() === 'starry_night') {
        this.sound.playStarSparkle();
      } else {
        this.sound.playSoftChime(4);
      }
    }
  }

  openLetter() {
    this.isLetterOpen.set(true);
    this.sound.playSoftChime(3);
  }

  closeLetter() {
    this.isLetterOpen.set(false);
  }

  openStarryLetter() {
    this.isStarryLetterOpen.set(true);
    this.sound.playCelestialArpeggio();
  }

  closeStarryLetter() {
    this.isStarryLetterOpen.set(false);
  }

  openArtwork(artwork: Artwork) {
    this.selectedArtwork.set(artwork);
    this.sound.playSoftChime(1);
  }

  closeArtwork() {
    this.selectedArtwork.set(null);
  }

  openStarryArtwork(artwork: StarryArtwork) {
    this.selectedStarryArtwork.set(artwork);
    this.sound.playStarSparkle();
  }

  closeStarryArtwork() {
    this.selectedStarryArtwork.set(null);
  }

  onArtworkBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      this.closeArtwork();
    }
  }

  onStarryArtworkBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      this.closeStarryArtwork();
    }
  }

  // Interactive drop on gallery card
  onGalleryCardHover(index: number) {
    if (this.currentTheme() === 'starry_night') {
      this.sound.playStarSparkle();
    } else {
      this.sound.playWaterDrop(1 + index * 0.2);
    }
  }
}

