"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  MoveDiagonal2,
  Play,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import {
  useLightOceanConfig,
  type LightOceanConfig,
} from "./light-ocean-config";
import { cn } from "./utils";

type NumberKey = {
  [Key in keyof LightOceanConfig]: LightOceanConfig[Key] extends number ? Key : never;
}[keyof LightOceanConfig];

type ColorKey = {
  [Key in keyof LightOceanConfig]: LightOceanConfig[Key] extends string ? Key : never;
}[keyof LightOceanConfig];

type BooleanKey = {
  [Key in keyof LightOceanConfig]: LightOceanConfig[Key] extends boolean ? Key : never;
}[keyof LightOceanConfig];

type NumberSetting = {
  key: NumberKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
};

type ColorSetting = {
  key: ColorKey;
  label: string;
};

type PanelBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type PanelInteraction = PanelBounds & {
  kind: "drag" | "resize";
  pointerId: number;
  startX: number;
  startY: number;
};

const positionSettings: NumberSetting[] = [
  { key: "positionTopSvh", label: "Top position", min: 0, max: 70, step: 1, unit: "svh" },
  { key: "oceanHeightSvh", label: "Layer height", min: 60, max: 160, step: 1, unit: "svh" },
  { key: "maskFadeStart", label: "Bottom fade start", min: 30, max: 95, step: 1, unit: "%" },
];

const appearanceSettings: NumberSetting[] = [
  { key: "intensityBlue", label: "Blue intensity", min: -5, max: 15, step: 0.5 },
  { key: "intensityWhite", label: "Highlight intensity", min: -5, max: 20, step: 0.5 },
  { key: "blurBlue", label: "Blue blur", min: 0, max: 240, step: 2, unit: "px" },
  { key: "blurWhite", label: "Highlight blur", min: 0, max: 180, step: 2, unit: "px" },
  { key: "darkOpacity", label: "Dark shading opacity", min: 0, max: 1, step: 0.05 },
  { key: "darkFadeStart", label: "Dark fade start", min: 0, max: 90, step: 1, unit: "%" },
  { key: "darkFadeEnd", label: "Dark fade end", min: 10, max: 100, step: 1, unit: "%" },
  { key: "grainOpacity", label: "Grain opacity", min: 0, max: 1, step: 0.05 },
];

const shapeSettings: NumberSetting[] = [
  { key: "pointAX", label: "Point A · X", min: -10, max: 110, step: 1 },
  { key: "pointAY", label: "Point A · Y", min: -10, max: 50, step: 0.5 },
  { key: "pointBX", label: "Point B · X", min: -10, max: 110, step: 1 },
  { key: "pointBY", label: "Point B · Y", min: -10, max: 50, step: 0.5 },
  { key: "curveAXOffset", label: "Curve A · X offset", min: -20, max: 20, step: 0.5 },
  { key: "curveAYOffset", label: "Curve A · Y offset", min: -20, max: 20, step: 0.5 },
  { key: "curveBXOffset", label: "Curve B · X offset", min: -20, max: 20, step: 0.5 },
  { key: "curveBYOffset", label: "Curve B · Y offset", min: -20, max: 20, step: 0.5 },
  { key: "blueLeftY", label: "Blue left edge", min: -10, max: 50, step: 0.5 },
  { key: "bluePointYOffset", label: "Blue point Y offset", min: -20, max: 20, step: 0.5 },
  { key: "blueRightY", label: "Blue right edge", min: -10, max: 50, step: 0.5 },
  { key: "highlightLeftY", label: "Highlight left edge", min: -10, max: 50, step: 0.5 },
  { key: "highlightPointAYOffset", label: "Highlight A · Y offset", min: -20, max: 20, step: 0.5 },
  { key: "highlightPointBXOffset", label: "Highlight B · X offset", min: -40, max: 20, step: 0.5 },
  { key: "highlightPointBYOffset", label: "Highlight B · Y offset", min: -20, max: 20, step: 0.5 },
  { key: "highlightRightY", label: "Highlight right edge", min: -10, max: 50, step: 0.5 },
  { key: "highlightScale", label: "Highlight scale", min: 0.5, max: 2, step: 0.05 },
];

const motionSettings: NumberSetting[] = [
  { key: "ambientSpeed", label: "Ambient speed", min: 0, max: 3, step: 0.02 },
  { key: "ambientAmplitude", label: "Ambient range", min: 0, max: 8, step: 0.1 },
  { key: "hoverSpeedBoost", label: "Hover speed boost", min: 0, max: 3, step: 0.02 },
  { key: "hoverAmplitudeBoost", label: "Hover range boost", min: 0, max: 10, step: 0.1 },
  { key: "pointerLift", label: "Pointer influence", min: 0, max: 12, step: 0.25 },
  { key: "maxTravel", label: "Maximum travel", min: 0, max: 15, step: 0.25 },
  { key: "followSpeed", label: "Follow speed", min: 1, max: 20, step: 0.25 },
  { key: "hoverFollowBoost", label: "Hover follow boost", min: 0, max: 20, step: 0.25 },
];

const revealSettings: NumberSetting[] = [
  { key: "revealDuration", label: "Reveal duration", min: 0.1, max: 3, step: 0.05, unit: "s" },
  { key: "revealStart", label: "Reveal start", min: -1, max: 0.5, step: 0.025 },
  { key: "revealTravel", label: "Reveal travel", min: 0.5, max: 3, step: 0.05 },
  { key: "revealCurve", label: "Reveal curve", min: 0, max: 0.4, step: 0.01 },
  { key: "revealBlur", label: "Reveal softness", min: 0, max: 0.12, step: 0.005 },
];

const oceanColors: ColorSetting[] = [
  { key: "surfaceColor", label: "Page surface" },
  { key: "darkColor", label: "Dark shading" },
  { key: "blueColor", label: "Ocean blue" },
  { key: "highlightColor", label: "Ocean highlight" },
];

const contentColors: ColorSetting[] = [
  { key: "eyebrowColor", label: "Public beta" },
  { key: "headingColor", label: "Hero heading" },
  { key: "metricLabelColor", label: "Metric labels" },
  { key: "metricValueColor", label: "Metric values" },
  { key: "descriptionColor", label: "Description" },
  { key: "separatorColor", label: "Separators" },
];

function TunerSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-border/70 last:border-0">
      <button
        type="button"
        className="flex h-10 w-full items-center gap-2 px-4 text-left text-xs font-semibold uppercase text-foreground"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <ChevronRight
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")}
          aria-hidden="true"
        />
        {title}
      </button>
      {open && <div className="space-y-4 px-4 pb-4">{children}</div>}
    </section>
  );
}

function NumberControl({
  setting,
  value,
  onChange,
}: {
  setting: NumberSetting;
  value: number;
  onChange: (value: number) => void;
}) {
  const precision = setting.step < 0.01 ? 3 : setting.step < 1 ? 2 : 0;

  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{setting.label}</span>
        <span className="flex items-center font-mono text-[11px] tabular-nums text-foreground">
          <input
            type="number"
            min={setting.min}
            max={setting.max}
            step={setting.step}
            value={Number(value.toFixed(precision))}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              if (Number.isFinite(nextValue)) onChange(nextValue);
            }}
            className="h-6 w-16 rounded-[4px] border border-border bg-background px-1.5 text-right outline-none focus:border-primary"
            aria-label={`${setting.label} value`}
          />
          {setting.unit && <span className="ml-1 text-muted-foreground">{setting.unit}</span>}
        </span>
      </span>
      <Slider
        min={setting.min}
        max={setting.max}
        step={setting.step}
        value={[value]}
        onValueChange={([nextValue]) => onChange(nextValue)}
        className="[&_[role=slider]]:h-3.5 [&_[role=slider]]:w-3.5 [&>span:first-child]:h-1"
        aria-label={setting.label}
      />
    </label>
  );
}

function ColorControl({
  setting,
  value,
  onChange,
}: {
  setting: ColorSetting;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
      <span>{setting.label}</span>
      <span className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-7 w-20 rounded-[4px] border border-border bg-background px-2 font-mono text-[11px] text-foreground outline-none focus:border-primary"
          aria-label={`${setting.label} color value`}
        />
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="h-7 w-8 cursor-pointer rounded-[4px] border border-border bg-background p-0.5"
          aria-label={`${setting.label} color`}
        />
      </span>
    </label>
  );
}

function ToggleControl({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between text-xs text-muted-foreground"
    >
      {label}
      <span className={cn("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-primary" : "bg-muted")}>
        <span className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )} />
      </span>
    </button>
  );
}

export function LightOceanConfigurator() {
  const { config, setConfig, resetConfig, replayReveal } = useLightOceanConfig();
  const [open, setOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [panelBounds, setPanelBounds] = useState<PanelBounds | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const interactionRef = useRef<PanelInteraction | null>(null);

  const startInteraction = (
    kind: PanelInteraction["kind"],
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (event.button !== 0 || !panelRef.current) return;
    const bounds = panelRef.current.getBoundingClientRect();
    interactionRef.current = {
      kind,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const updateInteraction = (event: ReactPointerEvent<HTMLElement>) => {
    const interaction = interactionRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - interaction.startX;
    const deltaY = event.clientY - interaction.startY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (interaction.kind === "drag") {
      setPanelBounds({
        left: Math.min(Math.max(8, interaction.left + deltaX), viewportWidth - interaction.width - 8),
        top: Math.min(Math.max(8, interaction.top + deltaY), viewportHeight - interaction.height - 8),
        width: interaction.width,
        height: interaction.height,
      });
      return;
    }

    const minWidth = Math.min(320, viewportWidth - 16);
    const minHeight = Math.min(280, viewportHeight - 16);
    const width = Math.min(Math.max(minWidth, interaction.width - deltaX), viewportWidth - 16);
    const height = Math.min(Math.max(minHeight, interaction.height - deltaY), viewportHeight - 16);
    setPanelBounds({
      left: interaction.left + interaction.width - width,
      top: interaction.top + interaction.height - height,
      width,
      height,
    });
  };

  const endInteraction = (event: ReactPointerEvent<HTMLElement>) => {
    if (interactionRef.current?.pointerId !== event.pointerId) return;
    interactionRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const updateNumber = (key: NumberKey, value: number) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

  const updateColor = (key: ColorKey, value: string) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

  const updateBoolean = (key: BooleanKey, value: boolean) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

  const copyConfig = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1400);
    } catch {
      setCopyState("error");
    }
  };

  if (!open) {
    return (
      <Button
        type="button"
        size="icon"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[80] h-11 w-11 rounded-[7px] shadow-lg dark:hidden"
        title="Open ocean tuner"
        aria-label="Open ocean tuner"
        data-ocean-configurator
      >
        <SlidersHorizontal className="h-[18px] w-[18px]" />
      </Button>
    );
  }

  return (
    <aside
      ref={panelRef}
      id="light-ocean-configurator"
      className={cn(
        "fixed z-[80] flex flex-col overflow-hidden rounded-[8px] border border-border bg-popover text-popover-foreground shadow-2xl dark:hidden",
        !panelBounds && "bottom-4 right-4 h-[min(620px,62svh)] w-[min(390px,calc(100vw-32px))]",
      )}
      style={panelBounds ?? undefined}
      aria-label="Light ocean configurator"
      data-ocean-configurator
    >
      <button
        type="button"
        className="absolute left-0 top-0 z-10 flex h-6 w-6 touch-none items-center justify-center text-muted-foreground hover:text-foreground"
        onPointerDown={(event) => startInteraction("resize", event)}
        onPointerMove={updateInteraction}
        onPointerUp={endInteraction}
        onPointerCancel={endInteraction}
        title="Drag to resize"
        aria-label="Resize ocean tuner"
      >
        <MoveDiagonal2 className="h-3.5 w-3.5" />
      </button>
      <header
        className="flex shrink-0 touch-none select-none items-center justify-between border-b border-border px-4 py-3 pl-7 cursor-move"
        onPointerDown={(event) => startInteraction("drag", event)}
        onPointerMove={updateInteraction}
        onPointerUp={endInteraction}
        onPointerCancel={endInteraction}
      >
        <div>
          <h2 className="text-sm font-semibold">Ocean tuner</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Light mode</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          onPointerDown={(event) => event.stopPropagation()}
          className="flex h-8 w-8 items-center justify-center rounded-[5px] text-muted-foreground hover:bg-accent hover:text-foreground"
          title="Close tuner"
          aria-label="Close ocean tuner"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <TunerSection title="Position" defaultOpen>
          {positionSettings.map((setting) => (
            <NumberControl
              key={setting.key}
              setting={setting}
              value={config[setting.key]}
              onChange={(value) => updateNumber(setting.key, value)}
            />
          ))}
        </TunerSection>

        <TunerSection title="Ocean appearance" defaultOpen>
          {appearanceSettings.map((setting) => (
            <NumberControl
              key={setting.key}
              setting={setting}
              value={config[setting.key]}
              onChange={(value) => updateNumber(setting.key, value)}
            />
          ))}
        </TunerSection>

        <TunerSection title="Shape points">
          {shapeSettings.map((setting) => (
            <NumberControl
              key={setting.key}
              setting={setting}
              value={config[setting.key]}
              onChange={(value) => updateNumber(setting.key, value)}
            />
          ))}
        </TunerSection>

        <TunerSection title="Motion & hover">
          <ToggleControl
            label="Ambient motion"
            checked={config.motionEnabled}
            onChange={(value) => updateBoolean("motionEnabled", value)}
          />
          <ToggleControl
            label="Pointer response"
            checked={config.hoverEnabled}
            onChange={(value) => updateBoolean("hoverEnabled", value)}
          />
          {motionSettings.map((setting) => (
            <NumberControl
              key={setting.key}
              setting={setting}
              value={config[setting.key]}
              onChange={(value) => updateNumber(setting.key, value)}
            />
          ))}
        </TunerSection>

        <TunerSection title="Load reveal">
          <ToggleControl
            label="Reveal enabled"
            checked={config.revealEnabled}
            onChange={(value) => updateBoolean("revealEnabled", value)}
          />
          {revealSettings.map((setting) => (
            <NumberControl
              key={setting.key}
              setting={setting}
              value={config[setting.key]}
              onChange={(value) => updateNumber(setting.key, value)}
            />
          ))}
        </TunerSection>

        <TunerSection title="Ocean colors" defaultOpen>
          {oceanColors.map((setting) => (
            <ColorControl
              key={setting.key}
              setting={setting}
              value={config[setting.key]}
              onChange={(value) => updateColor(setting.key, value)}
            />
          ))}
        </TunerSection>

        <TunerSection title="Hero content colors" defaultOpen>
          {contentColors.map((setting) => (
            <ColorControl
              key={setting.key}
              setting={setting}
              value={config[setting.key]}
              onChange={(value) => updateColor(setting.key, value)}
            />
          ))}
          <NumberControl
            setting={{
              key: "separatorOpacity",
              label: "Separator opacity",
              min: 0,
              max: 1,
              step: 0.05,
            }}
            value={config.separatorOpacity}
            onChange={(value) => updateNumber("separatorOpacity", value)}
          />
        </TunerSection>
      </div>

      <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-popover px-3 py-2.5">
        <Button type="button" variant="ghost" size="sm" onClick={resetConfig}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={replayReveal}>
          <Play className="h-3.5 w-3.5" />
          Replay
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={copyConfig}>
          {copyState === "copied" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy config"}
        </Button>
      </footer>
    </aside>
  );
}
