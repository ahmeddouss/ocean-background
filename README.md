# Ocean Background

Animated, configurable ocean background component extracted from the Avora landing page.

This repository contains only the reusable component source and the small local utilities it needs.

## Included

- `src/ocean-background.tsx` - animated SVG ocean renderer.
- `src/home-ocean-background.tsx` - landing-style wrapper with light and dark layers.
- `src/light-ocean-config.tsx` - default config, provider, localStorage persistence, and hook.
- `src/light-ocean-configurator.tsx` - draggable/resizable tuning panel.
- `src/ui/button.tsx` and `src/ui/slider.tsx` - copied UI primitives used by the configurator.
- `src/utils.ts` - local class name merge helper.
- `src/styles.css` - `bg-noise` Tailwind utility used by the grain overlay.

## Install Dependencies

```bash
pnpm add react react-dom motion lucide-react @radix-ui/react-slot @radix-ui/react-slider class-variance-authority clsx tailwind-merge
```

The component is Tailwind-based. Import `src/styles.css` or copy the `bg-noise` utility into your app stylesheet.

## Usage

```tsx
import {
  HomeOceanBackground,
  LightOceanConfigProvider,
  LightOceanConfigurator,
} from "@ahmeddouss/ocean-background";
import "@ahmeddouss/ocean-background/styles.css";

export function Page() {
  return (
    <LightOceanConfigProvider>
      <div className="relative min-h-screen bg-background">
        <HomeOceanBackground configurable />
        <main className="relative z-10">...</main>
        <LightOceanConfigurator />
      </div>
    </LightOceanConfigProvider>
  );
}
```

Use the renderer directly when you only need the visual layer:

```tsx
import { OceanBackground } from "@ahmeddouss/ocean-background";

export function Backdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <OceanBackground
        ambient
        grain
        surfaceColor="#f5f5f5"
        intensityWhite={4}
        intensityBlue={2}
        BlurWhite={65}
        BlurBlue={130}
      />
    </div>
  );
}
```

## Configuration

`defaultLightOceanConfig` includes layout, shape, motion, reveal, color, blur, intensity, grain, and hero text color settings. The configurator writes changes to `localStorage` under `avora-light-ocean-config`.

## Notes Before Package Publishing

This repository is ready as source code for GitHub. Before publishing to npm, add a build step that emits JavaScript and declaration files into `dist`, then update `package.json` exports to point at the built files.
