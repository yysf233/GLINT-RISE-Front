import { useEffect, useRef, useState } from "react";

export const APPLE_CAROUSEL_AUTOPLAY_MS = 6400;
export const APPLE_CAROUSEL_RESUME_MS = 9000;
export const APPLE_CAROUSEL_TRANSITION = {
  duration: 0.9,
  ease: [0.32, 0.72, 0, 1],
};

export const appleCarouselSlideVariants = {
  initial: { opacity: 0, x: 48, scale: 1.01 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -48, scale: 0.985 },
};

function normalizeIndex(index, length) {
  if (length <= 0) {
    return 0;
  }

  return ((index % length) + length) % length;
}

export function useAppleStyleCarousel({
  length,
  autoplayMs = APPLE_CAROUSEL_AUTOPLAY_MS,
  resumeDelayMs = APPLE_CAROUSEL_RESUME_MS,
  initialIndex = 0,
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const resumeTimerRef = useRef(null);

  const clearResumeTimer = () => {
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    setActiveIndex((current) => normalizeIndex(current, length));
  }, [length]);

  useEffect(() => () => clearResumeTimer(), []);

  useEffect(() => {
    if (length <= 1 || prefersReducedMotion || isPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => normalizeIndex(current + 1, length));
    }, autoplayMs);

    return () => window.clearInterval(timer);
  }, [autoplayMs, isPaused, length, prefersReducedMotion]);

  const pauseAutoplay = () => {
    clearResumeTimer();
    setIsPaused(true);
  };

  const resumeAutoplay = () => {
    clearResumeTimer();

    if (length <= 1 || prefersReducedMotion) {
      return;
    }

    setIsPaused(false);
  };

  const scheduleResume = () => {
    clearResumeTimer();

    if (length <= 1 || prefersReducedMotion) {
      return;
    }

    resumeTimerRef.current = window.setTimeout(() => {
      setIsPaused(false);
      resumeTimerRef.current = null;
    }, resumeDelayMs);
  };

  const goTo = (nextIndex, { manual = true } = {}) => {
    if (length <= 0) {
      return;
    }

    setActiveIndex(normalizeIndex(nextIndex, length));

    if (manual) {
      pauseAutoplay();
      scheduleResume();
    }
  };

  const shiftBy = (offset, { manual = true } = {}) => {
    if (length <= 0) {
      return;
    }

    setActiveIndex((current) => normalizeIndex(current + offset, length));

    if (manual) {
      pauseAutoplay();
      scheduleResume();
    }
  };

  const next = ({ manual = true } = {}) => {
    shiftBy(1, { manual });
  };

  const prev = ({ manual = true } = {}) => {
    shiftBy(-1, { manual });
  };

  return {
    activeIndex,
    isPaused,
    prefersReducedMotion,
    pauseAutoplay,
    resumeAutoplay,
    goTo,
    next,
    prev,
    hoverHandlers: {
      onMouseEnter: pauseAutoplay,
      onMouseLeave: resumeAutoplay,
    },
  };
}

export default useAppleStyleCarousel;
