"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { OceanTuning } from "./ocean-background";

export type LightOceanConfig = OceanTuning & {
  positionTopSvh: number;
  oceanHeightSvh: number;
  maskFadeStart: number;
  intensityWhite: number;
  intensityBlue: number;
  blurWhite: number;
  blurBlue: number;
  surfaceColor: string;
  eyebrowColor: string;
  headingColor: string;
  metricLabelColor: string;
  metricValueColor: string;
  descriptionColor: string;
  separatorColor: string;
  separatorOpacity: number;
};

export const defaultLightOceanConfig: LightOceanConfig = {
  positionTopSvh: 30,
  oceanHeightSvh: 100,
  maskFadeStart: 72,
  intensityWhite: 4,
  intensityBlue: 2,
  blurWhite: 65,
  blurBlue: 130,
  pointAX: 25,
  pointAY: 12,
  pointBX: 80,
  pointBY: 25,
  curveAXOffset: -3,
  curveAYOffset: -1,
  curveBXOffset: 0,
  curveBYOffset: 1,
  blueLeftY: 13,
  bluePointYOffset: -4,
  blueRightY: 18,
  highlightLeftY: 20,
  highlightPointAYOffset: 4,
  highlightPointBXOffset: -18,
  highlightPointBYOffset: -4,
  highlightRightY: 23,
  highlightScale: 1.4,
  ambientSpeed: 0.64,
  hoverSpeedBoost: 0.16,
  ambientAmplitude: 0.8,
  hoverAmplitudeBoost: 1.2,
  pointerLift: 4,
  maxTravel: 5,
  followSpeed: 5,
  hoverFollowBoost: 5,
  revealDuration: 0.9,
  revealStart: -0.3,
  revealTravel: 1.6,
  revealCurve: 0.12,
  revealBlur: 0.035,
  motionEnabled: true,
  hoverEnabled: true,
  revealEnabled: true,
  surfaceColor: "#f5f5f5",
  darkColor: "#1a1a1c",
  darkOpacity: 1,
  darkFadeStart: 18,
  darkFadeEnd: 82,
  blueColor: "#5329cd",
  highlightColor: "#ffffff",
  grainOpacity: 0.75,
  eyebrowColor: "#1973e1",
  headingColor: "#1a243d",
  metricLabelColor: "#75777f",
  metricValueColor: "#1973e1",
  descriptionColor: "#75777f",
  separatorColor: "#1a243d",
  separatorOpacity: 0.4,
};

type LightOceanConfigContextValue = {
  config: LightOceanConfig;
  setConfig: Dispatch<SetStateAction<LightOceanConfig>>;
  resetConfig: () => void;
  replayVersion: number;
  replayReveal: () => void;
};

const storageKey = "avora-light-ocean-config";

const LightOceanConfigContext = createContext<LightOceanConfigContextValue>({
  config: defaultLightOceanConfig,
  setConfig: () => undefined,
  resetConfig: () => undefined,
  replayVersion: 0,
  replayReveal: () => undefined,
});

export function LightOceanConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState(defaultLightOceanConfig);
  const [loaded, setLoaded] = useState(false);
  const [replayVersion, setReplayVersion] = useState(0);

  useEffect(() => {
    try {
      const savedConfig = window.localStorage.getItem(storageKey);
      if (savedConfig) {
        setConfig({ ...defaultLightOceanConfig, ...JSON.parse(savedConfig) });
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(storageKey, JSON.stringify(config));
    }, 120);
    return () => window.clearTimeout(timeout);
  }, [config, loaded]);

  const value = useMemo<LightOceanConfigContextValue>(() => ({
    config,
    setConfig,
    resetConfig: () => setConfig({ ...defaultLightOceanConfig }),
    replayVersion,
    replayReveal: () => setReplayVersion((current) => current + 1),
  }), [config, replayVersion]);

  return (
    <LightOceanConfigContext.Provider value={value}>
      {children}
    </LightOceanConfigContext.Provider>
  );
}

export function useLightOceanConfig() {
  return useContext(LightOceanConfigContext);
}
