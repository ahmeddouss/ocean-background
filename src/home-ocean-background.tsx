"use client";

import OceanBackground from "./ocean-background";
import {
  defaultLightOceanConfig,
  useLightOceanConfig,
} from "./light-ocean-config";
import { cn } from "./utils";
import type { CSSProperties } from "react";

export function HomeOceanBackground({
  className,
  configurable = false,
}: {
  className?: string;
  configurable?: boolean;
}) {
  const { config, replayVersion } = useLightOceanConfig();
  const lightConfig = configurable ? config : defaultLightOceanConfig;
  const lightMaskStyle = {
    WebkitMaskImage: `linear-gradient(to bottom, #000 ${lightConfig.maskFadeStart}%, transparent 100%)`,
    maskImage: `linear-gradient(to bottom, #000 ${lightConfig.maskFadeStart}%, transparent 100%)`,
  } satisfies CSSProperties;
  const darkMaskStyle = {
    WebkitMaskImage: "linear-gradient(to bottom, #000 72%, transparent 95%)",
    maskImage: "linear-gradient(to bottom, #000 72%, transparent 95%)",
  } satisfies CSSProperties;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-[var(--light-ocean-top)] z-0 h-[var(--light-ocean-height)] overflow-hidden dark:-top-[30svh] dark:h-screen",
        className,
      )}
      style={{
        "--light-ocean-top": `-${lightConfig.positionTopSvh}svh`,
        "--light-ocean-height": `${lightConfig.oceanHeightSvh}svh`,
      } as CSSProperties}
      aria-hidden="true"
    >
      <div className="relative isolate h-full">
        <div className="relative h-full overflow-hidden dark:hidden" style={lightMaskStyle}>
          <OceanBackground
            key={configurable ? replayVersion : undefined}
            ambient
            grain
            surfaceColor={lightConfig.surfaceColor}
            intensityWhite={lightConfig.intensityWhite}
            intensityBlue={lightConfig.intensityBlue}
            BlurWhite={lightConfig.blurWhite}
            BlurBlue={lightConfig.blurBlue}
            tuning={lightConfig}
          />
        </div>
        {/* Keep the fade in page coordinates while rotating only the ocean. */}
        <div
          className="relative hidden h-full overflow-hidden dark:block"
          style={darkMaskStyle}
        >
          <OceanBackground
            className="rotate-180"
            ambient
            grain
            inverted
            surfaceColor="hsl(var(--background))"
            intensityWhite={11}
            intensityBlue={7.5}
            BlurWhite={75}
            BlurBlue={130}
          />
        </div>
      </div>
    </div>
  );
}
