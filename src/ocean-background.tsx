"use client";

import { useRef, useEffect, useId, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "./utils";

export type OceanTuning = {
  pointAX: number;
  pointAY: number;
  pointBX: number;
  pointBY: number;
  curveAXOffset: number;
  curveAYOffset: number;
  curveBXOffset: number;
  curveBYOffset: number;
  blueLeftY: number;
  bluePointYOffset: number;
  blueRightY: number;
  highlightLeftY: number;
  highlightPointAYOffset: number;
  highlightPointBXOffset: number;
  highlightPointBYOffset: number;
  highlightRightY: number;
  highlightScale: number;
  ambientSpeed: number;
  hoverSpeedBoost: number;
  ambientAmplitude: number;
  hoverAmplitudeBoost: number;
  pointerLift: number;
  maxTravel: number;
  followSpeed: number;
  hoverFollowBoost: number;
  revealDuration: number;
  revealStart: number;
  revealTravel: number;
  revealCurve: number;
  revealBlur: number;
  motionEnabled: boolean;
  hoverEnabled: boolean;
  revealEnabled: boolean;
  darkColor: string;
  darkOpacity: number;
  darkFadeStart: number;
  darkFadeEnd: number;
  blueColor: string;
  highlightColor: string;
  grainOpacity: number;
};

type OceanBackgroundProps = {
  intensityWhite?: number; // 0-1
  intensityBlue?: number; // 0-1
  BlurWhite?: number; // px
  BlurBlue?: number; // px
  surfaceColor?: string;
  grain?: boolean;
  tuning?: Partial<OceanTuning>;
  className?: string;
  ambient?: boolean;
  inverted?: boolean;
};

export default function OceanBackground({
  intensityWhite = 1,
  intensityBlue = 1,
  BlurWhite = 50,
  BlurBlue = 140,
  surfaceColor,
  grain = false,
  tuning,
  className,
  ambient = false,
  inverted = false,
}: OceanBackgroundProps) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const revealId = useId();
  const revealMaskId = `ocean-reveal-${revealId}`;
  const revealBlurId = `ocean-reveal-blur-${revealId}`;
  const reduceMotion = useReducedMotion();
  const pointAX = tuning?.pointAX ?? 25;
  const pointAY = tuning?.pointAY ?? 12;
  const pointBX = tuning?.pointBX ?? 80;
  const pointBY = tuning?.pointBY ?? 25;
  const motionEnabled = tuning?.motionEnabled ?? true;
  const hoverEnabled = tuning?.hoverEnabled ?? true;
  const revealEnabled = tuning?.revealEnabled ?? true;
  const revealDuration = tuning?.revealDuration ?? 0.9;
  const [pointA, setPointA] = useState({ x: pointAX, y: pointAY });
  const [pointB, setPointB] = useState({ x: pointBX, y: pointBY });
  const [revealProgress, setRevealProgress] = useState(0);
  const revealElapsed = useRef(0);
  const targetOffset = useRef({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 } });
  const hoverTarget = useRef(0);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const renderedPointA = motionEnabled ? pointA : { x: pointAX, y: pointAY };
  const renderedPointB = motionEnabled ? pointB : { x: pointBX, y: pointBY };
  const curveAX = renderedPointA.x + (tuning?.curveAXOffset ?? (ambient && !inverted ? -3 : 0));
  const curveBX = renderedPointB.x + (tuning?.curveBXOffset ?? (ambient && inverted ? 3 : 0));
  const curveAY = renderedPointA.y + (tuning?.curveAYOffset ?? (ambient ? -1 : 0));
  const curveBY = renderedPointB.y + (tuning?.curveBYOffset ?? (ambient ? 1 : 0));
  const progress = ambient && revealEnabled && !reduceMotion ? revealProgress : 1;
  const revealEdge = (tuning?.revealStart ?? -0.3) + progress * (tuning?.revealTravel ?? 1.6);
  const revealCurve = Math.sin(progress * Math.PI) * (tuning?.revealCurve ?? 0.12);
  const maskY = (y: number) => inverted ? 1 - y : y;
  const revealMask = ambient && progress < 1 ? `url("#${revealMaskId}")` : undefined;

  useEffect(() => {
    if (reduceMotion) return;

    let raf: number;
    let previousTime: number | undefined;
    let phase = 0;
    let hover = 0;
    let resetPosition = true;

    function animate(time: number) {
      const delta = previousTime === undefined
        ? 0
        : Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      if (ambient && revealEnabled && revealElapsed.current < revealDuration) {
        revealElapsed.current = Math.min(revealDuration, revealElapsed.current + delta);
        setRevealProgress(1 - (1 - revealElapsed.current / revealDuration) ** 3);
      }
      hover += (hoverTarget.current - hover) * (1 - Math.exp(-delta * 5));
      phase += delta * ((tuning?.ambientSpeed ?? 0.64) + hover * (tuning?.hoverSpeedBoost ?? 0.16));

      const amplitude = (tuning?.ambientAmplitude ?? 0.8) + hover * (tuning?.hoverAmplitudeBoost ?? 1.2);
      const pointerLift = hover * (1 + (1 - pointer.current.y) * (tuning?.pointerLift ?? 4));
      // Both waves retreat from the initial edge, including after dark-mode rotation.
      const direction = inverted ? 1 : -1;
      const offsets = ambient && motionEnabled
        ? {
            a: {
              x: 0,
              y: direction * Math.min(tuning?.maxTravel ?? 5,
                amplitude * (1 - Math.cos(phase)) / 2
                + pointerLift * (1 - pointer.current.x * 0.7)),
            },
            b: {
              x: 0,
              y: direction * Math.min(tuning?.maxTravel ?? 5,
                amplitude * (1 - Math.cos(phase * 0.78)) / 2
                + pointerLift * (0.3 + pointer.current.x * 0.7)),
            },
          }
        : targetOffset.current;
      const smoothing = resetPosition
        ? 1
        : 1 - Math.exp(-delta * ((tuning?.followSpeed ?? 5) + hover * (tuning?.hoverFollowBoost ?? 5)));
      resetPosition = false;

      if (motionEnabled) {
        setPointA((prev) => ({
          x: prev.x + (pointAX + offsets.a.x - prev.x) * smoothing,
          y: prev.y + (pointAY + offsets.a.y - prev.y) * smoothing,
        }));
        setPointB((prev) => ({
          x: prev.x + (pointBX + offsets.b.x - prev.x) * smoothing,
          y: prev.y + (pointBY + offsets.b.y - prev.y) * smoothing,
        }));
      }
      raf = requestAnimationFrame(animate);
    }

    function updateVisibility() {
      cancelAnimationFrame(raf);
      previousTime = undefined;
      hoverTarget.current = 0;
      if (!document.hidden) raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, [
    ambient,
    hoverEnabled,
    inverted,
    motionEnabled,
    pointAX,
    pointAY,
    pointBX,
    pointBY,
    reduceMotion,
    revealDuration,
    revealEnabled,
    tuning,
  ]);

  useEffect(() => {
    if (reduceMotion || !motionEnabled || !hoverEnabled) return;

    function onPointerMove(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      if (e.target instanceof Element && e.target.closest("[data-ocean-configurator]")) {
        hoverTarget.current = 0;
        return;
      }

      if (ambient) {
        const bounds = backgroundRef.current?.getBoundingClientRect();
        if (!bounds) return;

        const visibleTop = Math.max(0, bounds.top);
        const visibleBottom = Math.min(window.innerHeight, bounds.bottom);
        const isInside = e.clientX >= bounds.left && e.clientX <= bounds.right
          && e.clientY >= visibleTop && e.clientY <= visibleBottom;
        hoverTarget.current = isInside ? 1 : 0;
        if (isInside) {
          const x = (e.clientX - bounds.left) / Math.max(1, bounds.right - bounds.left);
          pointer.current = {
            x: inverted ? 1 - x : x,
            y: (e.clientY - visibleTop) / Math.max(1, visibleBottom - visibleTop),
          };
        }
        return;
      }

      const xRatio = e.clientX / window.innerWidth;
      const yRatio = e.clientY / window.innerHeight;
      targetOffset.current.a = {
        x: (Math.sin(xRatio * Math.PI * 2) + Math.random() * 0.2 - 0.1) * 2.5,
        y: (Math.cos(yRatio * Math.PI * 2) + Math.random() * 0.2 - 0.1) * 2.5,
      };
      targetOffset.current.b = {
        x: (Math.cos(xRatio * Math.PI * 2 + 1) + Math.random() * 0.2 - 0.1) * 2.5,
        y: (Math.sin(yRatio * Math.PI * 2 + 1) + Math.random() * 0.2 - 0.1) * 2.5,
      };
    }

    function resetHover() {
      hoverTarget.current = 0;
    }

    function onPointerOut(e: PointerEvent) {
      if (!e.relatedTarget) resetHover();
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut);
    window.addEventListener("blur", resetHover);
    window.addEventListener("scroll", resetHover, { passive: true });
    return () => {
      hoverTarget.current = 0;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("blur", resetHover);
      window.removeEventListener("scroll", resetHover);
    };
  }, [ambient, hoverEnabled, inverted, motionEnabled, reduceMotion]);

  return (
    <div ref={backgroundRef} style={{ width: "100%", height: "100%", backgroundColor: surfaceColor ?? "#1A1A1C", position: "relative" }} className={cn(className)}>
      {/* Animation styles */}
      <style>{`
        @keyframes riseUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .rise-blue {
          animation: riseUp 0.6s cubic-bezier(0.6,0.2,0.3,1) 0.1s both;
        }
        .rise-white {
          animation: riseUp 0.4s cubic-bezier(0.6,0.2,0.3,1) 0.1s both;
        }
        @media (prefers-reduced-motion: reduce) {
          .rise-blue, .rise-white { animation: none; }
        }
      `}</style>
      {ambient && (
        <svg className="absolute h-0 w-0" aria-hidden="true">
          <defs>
            <filter id={revealBlurId} filterUnits="userSpaceOnUse" x="-0.5" y="-0.5" width="2" height="2">
              <feGaussianBlur stdDeviation={tuning?.revealBlur ?? 0.035} />
            </filter>
            <mask
              id={revealMaskId}
              maskUnits="objectBoundingBox"
              maskContentUnits="objectBoundingBox"
              x="0"
              y="0"
              width="1"
              height="1"
            >
              <polygon
                points={`-0.3,${maskY(-0.3)} 1.3,${maskY(-0.3)} 1.3,${maskY(revealEdge)} 0.8,${maskY(revealEdge - revealCurve)} 0.22,${maskY(revealEdge + revealCurve)} -0.3,${maskY(revealEdge)}`}
                fill="#fff"
                filter={`url(#${revealBlurId})`}
              />
            </mask>
          </defs>
        </svg>
      )}
      {/* Reveal the original palette together over the stationary page background. */}
      <div
        className="absolute inset-0 isolate"
        style={{
          backgroundColor: surfaceColor ?? "#1A1A1C",
          WebkitMaskImage: revealMask,
          maskImage: revealMask,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(${inverted ? "to top" : "to bottom"}, ${tuning?.darkColor ?? "#1A1A1C"} ${tuning?.darkFadeStart ?? 18}%, transparent ${tuning?.darkFadeEnd ?? 82}%)`,
            opacity: tuning?.darkOpacity ?? 1,
          }}
        />
        <svg
          className={ambient ? undefined : "rise-blue"}
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          style={{ filter: `blur(${BlurBlue}px)`, position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        >
          <polygon
            points={`0,40 0,${(tuning?.blueLeftY ?? 13) + intensityBlue}  ${curveAX},${curveAY + (tuning?.bluePointYOffset ?? -4) + intensityBlue} ${curveBX},${curveBY + (tuning?.bluePointYOffset ?? -4) + intensityBlue}  100,${(tuning?.blueRightY ?? 18) + intensityBlue} 100,40`}
            fill={tuning?.blueColor ?? "#5329CD"}
            strokeWidth="0.5"
          />
        </svg>
        <svg
          className={ambient ? undefined : "rise-white"}
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          style={{ filter: `blur(${BlurWhite}px)`, scale: tuning?.highlightScale ?? 1.4, position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        >
          <polygon
            points={`0,40 0,${(tuning?.highlightLeftY ?? 20) + intensityWhite}  ${curveAX},${curveAY + (tuning?.highlightPointAYOffset ?? 4) + intensityWhite} ${curveBX + (tuning?.highlightPointBXOffset ?? -18)},${curveBY + (tuning?.highlightPointBYOffset ?? -4) + intensityWhite}  100,${(tuning?.highlightRightY ?? 23) + intensityWhite} 100,40`}
            fill={tuning?.highlightColor ?? "#fff"}
            strokeWidth="0.5"
          />
        </svg>
        {grain && (
          <div
            className="pointer-events-none absolute inset-0 bg-noise mix-blend-overlay"
            style={{ opacity: tuning?.grainOpacity ?? 0.75 }}
          />
        )}
      </div>
    </div>
  );
}
