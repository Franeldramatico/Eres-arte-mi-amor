# Aranxita · Eres una Obra de Arte 💕

> Una dedicatoria de amor interactiva en dos actos: **Acuarela de Bellas Artes** y **La Noche Estrellada** de Van Gogh. Hecho a mano, 100% propio, sin dependencias de Google AI Studio.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-pink)

**Demo:** https://franeldramatico.github.io/Eres-arte-mi-amor/  
**Repositorio:** https://github.com/Franeldramatico/Eres-arte-mi-amor

---

## ✨ Qué es

Página web dedicatoria para Aranxita con dos universos que se transforman entre sí:

| Parte I — Acuarela Pura | Parte II — La Noche Estrellada |
|---|---|
| Papel de algodón Arches Torchon, manchas vivas, veladuras, sangrado, sal marina y pan de oro Kintsugi | Cielo de Saint-Rémy, vórtices cósmicos, impasto de óleo, estrellas pulsantes y halos dorados |
| Taller interactivo con física real de acuarela | Taller impasto interactivo con trazos Van Gogh |
| Carta de amor en acuarela | Carta bajo el firmamento estrellado |

Incluye: galería de 4 obras por parte, modales dedicatoria, música generativa Web Audio API (gotas, chimes, arpegios celestiales), transición cinematográfica y soporte táctil.

## 🛠️ Stack

- **Angular 21** (standalone, SSR `outputMode: server` + prerender)
- **Tailwind CSS 4** (`@tailwindcss/postcss`)
- **Angular Material** (iconos) + **Angular CDK**
- **Motion** (animaciones)
- **Express** (SSR server `src/server.ts`)
- **Web Audio API** propia (`src/app/services/sound-effects.ts`) — sin librerías externas

No requiere API keys ni servicios externos. 100% estático para GitHub Pages.

## 📁 Estructura

```
src/
├── app/
│   ├── app.ts / app.html          # Orquestador: 2 temas, modales, scroll-spy
│   ├── components/
│   │   ├── background-stains/     # Fondo acuarela líquido + cursor particles
│   │   ├── watercolor-canvas/     # Taller acuarela (6 pinceles, física real)
│   │   ├── love-letter-modal/     # Carta acuarela
│   │   ├── starry-night-background/ # Cielo Van Gogh animado
│   │   ├── starry-night-canvas/   # Taller impasto
│   │   └── starry-letter-modal/   # Carta estrellada
│   └── services/sound-effects.ts  # Efectos sonoros propios
├── index.html
├── styles.css                     # Tailwind + utilidades acuarela/starry
└── server.ts                      # SSR Express
public/favicon.ico
```

## 🚀 Inicio rápido

**Requisitos:** Node.js 20+

```bash
# Instalar
npm install

# Desarrollo (hot-reload) - puerto 3000
npm run dev
# o puerto 4200 por defecto
npm start

# Build producción (SSR + prerender)
npm run build

# Servir SSR local
npm run serve:ssr:app
# -> http://localhost:4000

# Build estático para GitHub Pages (base-href)
npx ng build --base-href /Eres-arte-mi-amor/
```

Abre http://localhost:3000 (dev) o http://localhost:4200 (start).

## 🎨 Taller de Acuarela — cómo funciona

`watercolor-canvas.ts:351` — 6 técnicas con física real:

1. **Kolinsky** — veladura translúcida + cerco oscuro
2. **Húmedo s/ húmedo** — difusión orgánica con `activeBleeds` y bucle `requestAnimationFrame`
3. **Pincel Seco** — granulación sobre cresta del papel Torchon 300g
4. **Sal Marina** — cristales con centro claro + anillo de pigmento
5. **Floración** — halos de agua pura (efecto coliflor)
6. **Pan de Oro** — destellos Kintsugi metálicos

Extras: selector de papel (Torchon / Grano fino), 12 pigmentos puros, dilución de agua, tamaños, bocetos guía, sellos románticos, historial 15 pasos, export PNG con passepartout museo.

## 🌌 Noche Estrellada

`starry-night-background.ts` + `starry-night-canvas.ts` — vórtices, estrellas pulsantes, luna creciente, ciprés, impasto texturizado y arpegios celestiales.

## 🔊 Sonido

`sound-effects.ts:6` — Web Audio API sin dependencias: `playWaterDrop`, `playSoftChime` (pentatónica), `playBrushSweep` (ruido filtrado), `playStarSparkle`, `playCelestialArpeggio`. Lazy `AudioContext` + mute toggle.

## 🌐 Despliegue

### GitHub Pages (recomendado — estático)

GitHub Pages no ejecuta Node SSR, así que se despliega el **browser bundle** prerenderizado:

```bash
# 1. Build con base-href del repo
npx ng build --base-href /Eres-arte-mi-amor/

# 2. Publicar dist/app/browser en rama gh-pages
# (requiere gh-pages o push manual — ver workflow abajo)
```

Alternativa con `angular-cli-ghpages`:
```bash
npm i -D angular-cli-ghpages
npx ng build --base-href /Eres-arte-mi-amor/
npx angular-cli-ghpages --dir=dist/app/browser
```

O workflow automático (ver `.github/workflows/deploy.yml`).

### SSR (Vercel / Cloud Run / Node)

```bash
npm run build
npm run serve:ssr:app
# PORT=4000 por defecto (respeta env PORT)
```

## 🔧 Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | `ng serve --port=3000 --host=0.0.0.0` |
| `npm start` | `ng serve` (4200) |
| `npm run build` | `ng build` (browser + server + prerender) |
| `npm run watch` | build watch development |
| `npm run serve:ssr:app` | `node dist/app/server/server.mjs` |
| `npm run lint` | `ng lint` |
| `npm test` | `ng test` (vitest) |

## 📝 Licencia

MIT — Proyecto personal dedicado a Aranxita. 2026

---

Hecho con amor · color · agua · luz · para la mujer más hermosa de mi vida.
