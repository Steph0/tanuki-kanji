import { useEffect, useState } from "preact/hooks";

const LOADING_CAPTION_MIN_MS = 1200;
const LOADING_CAPTION_MAX_MS = 4000;

const LOADING_CAPTIONS: string[] = [
  "Looking up that kanji for you…",
  "Tracing the roots of your kanji…",
  "Consulting the scriptures for you…",
  "Reading every stroke as a picture…",
  "Grinding fresh ink for your lesson…",
  "Uncovering folklore and cultural memory for you…",
  "Tracing your radical origins and ancient brushwork…",
  "Handcrafting your authentic etymology lesson…",
  "Reading the old bones of your script…",
  "Building your radicals into story blocks…",
  "Dusting off bronze inscriptions for you…",
  "Carrying your brush from oracle bone to screen…",
  "Keeping old tales warm under the lamp for you…",
  "Letting meaning settle for you like silt in clear water…",
  "Tea cools, ink dries, your meaning stays.",
];

export function useRotatingCaption(): string {
  const [caption, setCaption] = useState(LOADING_CAPTIONS[0]);
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      timer = setTimeout(() => {
        setCaption((current) => pickNextCaption(current));
        scheduleNext();
      }, pickDelay());
    };
    scheduleNext();
    return () => {
      clearTimeout(timer);
    };
  }, [reducedMotion]);

  return caption;
}

function pickNextCaption(current: string): string {
  const offset = 1 + Math.floor(Math.random() * (LOADING_CAPTIONS.length - 1));
  return LOADING_CAPTIONS[(LOADING_CAPTIONS.indexOf(current) + offset) % LOADING_CAPTIONS.length];
}

function pickDelay(): number {
  return LOADING_CAPTION_MIN_MS + Math.random() * (LOADING_CAPTION_MAX_MS - LOADING_CAPTION_MIN_MS);
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
