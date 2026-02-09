"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type DragState = "IDLE" | "DRAGGING" | "SCROLLING";

const SNAP_POINTS = [0.01, 1.0] as const;
const PEEK = SNAP_POINTS[0];
const VELOCITY_THRESHOLD = 0.3;
const SCROLL_TO_DRAG_DELAY = 100;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function nearestSnap(progress: number, velocity: number): number {
  if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
    return velocity > 0 ? SNAP_POINTS[1] : SNAP_POINTS[0];
  }
  const mid = (SNAP_POINTS[0] + SNAP_POINTS[1]) / 2;
  return progress > mid ? SNAP_POINTS[1] : SNAP_POINTS[0];
}

export function useBottomSheet() {
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState<number>(PEEK);
  const [isDragging, setIsDragging] = useState(false);

  const stateRef = useRef<DragState>("IDLE");
  const progressRef = useRef<number>(PEEK);
  const startYRef = useRef(0);
  const startProgressRef = useRef<number>(PEEK);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const scrollTopAtStartRef = useRef(0);
  const scrollToleranceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const applyTransform = useCallback((p: number, animating: boolean) => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    const bgScale = 1 - p * 0.2;
    const translateY = (1 - p) * 85;

    sheet.style.transform = `translateY(${translateY}%)`;

    if (animating && !prefersReducedMotion.current) {
      sheet.style.transition = "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)";
    } else {
      sheet.style.transition = "none";
    }

    const container = sheet.parentElement;
    if (container) {
      const bg = container.firstElementChild as HTMLElement | null;
      if (bg) {
        bg.style.transform = `scale(${bgScale})`;
        if (animating && !prefersReducedMotion.current) {
          bg.style.transition =
            "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)";
        } else {
          bg.style.transition = "none";
        }
      }
    }
  }, []);

  const snapTo = useCallback(
    (target: number) => {
      progressRef.current = target;
      setProgress(target);
      setIsDragging(false);
      stateRef.current = "IDLE";
      applyTransform(target, true);

      const sheet = sheetRef.current;
      if (sheet) {
        sheet.style.willChange = "";
        const container = sheet.parentElement;
        if (container) {
          const bg = container.firstElementChild as HTMLElement | null;
          if (bg) bg.style.willChange = "";
        }
      }
    },
    [applyTransform],
  );

  const handlePointerDown = useCallback(
    (e: PointerEvent, isHandle: boolean) => {
      if (e.button !== 0) return;

      const scrollContainer = contentRef.current;

      if (!isHandle && progressRef.current >= 1) {
        const scrollTop = scrollContainer?.scrollTop ?? 0;
        if (scrollTop > 0) {
          stateRef.current = "SCROLLING";
          scrollTopAtStartRef.current = scrollTop;
          return;
        }
      }

      e.preventDefault();
      stateRef.current = "DRAGGING";
      setIsDragging(true);

      startYRef.current = e.clientY;
      startProgressRef.current = progressRef.current;
      lastYRef.current = e.clientY;
      lastTimeRef.current = e.timeStamp;
      velocityRef.current = 0;

      const sheet = sheetRef.current;
      if (sheet) {
        sheet.style.willChange = "transform";
        const container = sheet.parentElement;
        if (container) {
          const bg = container.firstElementChild as HTMLElement | null;
          if (bg) bg.style.willChange = "transform";
        }
      }

      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (stateRef.current !== "DRAGGING") return;

      const deltaY = startYRef.current - e.clientY;
      const viewportHeight = window.innerHeight;
      const deltaProgress = deltaY / viewportHeight;
      const newProgress = clamp(
        startProgressRef.current + deltaProgress,
        SNAP_POINTS[0],
        SNAP_POINTS[1],
      );

      const dt = e.timeStamp - lastTimeRef.current;
      if (dt > 0) {
        const dy = lastYRef.current - e.clientY;
        velocityRef.current = dy / dt;
      }
      lastYRef.current = e.clientY;
      lastTimeRef.current = e.timeStamp;

      progressRef.current = newProgress;
      applyTransform(newProgress, false);
    },
    [applyTransform],
  );

  const handlePointerUp = useCallback(() => {
    if (stateRef.current !== "DRAGGING") {
      stateRef.current = "IDLE";
      return;
    }

    const target = nearestSnap(progressRef.current, velocityRef.current);
    snapTo(target);
  }, [snapTo]);

  // Pointer events on the handle
  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    const onDown = (e: PointerEvent) => handlePointerDown(e, true);
    const onMove = (e: PointerEvent) => handlePointerMove(e);
    const onUp = () => handlePointerUp();

    handle.addEventListener("pointerdown", onDown);
    handle.addEventListener("pointermove", onMove, { passive: true });
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);

    return () => {
      handle.removeEventListener("pointerdown", onDown);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  // Pointer events on the scrollable content for pull-to-collapse
  useEffect(() => {
    const scrollContainer = contentRef.current;
    if (!scrollContainer) return;

    const onDown = (e: PointerEvent) => handlePointerDown(e, false);
    const onMove = (e: PointerEvent) => handlePointerMove(e);
    const onUp = () => handlePointerUp();

    scrollContainer.addEventListener("pointerdown", onDown);
    scrollContainer.addEventListener("pointermove", onMove, { passive: true });
    scrollContainer.addEventListener("pointerup", onUp);
    scrollContainer.addEventListener("pointercancel", onUp);

    return () => {
      scrollContainer.removeEventListener("pointerdown", onDown);
      scrollContainer.removeEventListener("pointermove", onMove);
      scrollContainer.removeEventListener("pointerup", onUp);
      scrollContainer.removeEventListener("pointercancel", onUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  // Scroll-to-drag transition: at scrollTop=0 pulling down collapses the sheet
  useEffect(() => {
    const scrollContainer = contentRef.current;
    if (!scrollContainer) return;

    let lastScrollTop = 0;

    const onScroll = () => {
      const scrollTop = scrollContainer.scrollTop;

      if (
        stateRef.current === "SCROLLING" &&
        scrollTop <= 0 &&
        lastScrollTop <= 0
      ) {
        if (!scrollToleranceTimerRef.current) {
          scrollToleranceTimerRef.current = setTimeout(() => {
            scrollToleranceTimerRef.current = null;
            if (scrollContainer.scrollTop <= 0) {
              snapTo(PEEK);
            }
          }, SCROLL_TO_DRAG_DELAY);
        }
      } else {
        if (scrollToleranceTimerRef.current) {
          clearTimeout(scrollToleranceTimerRef.current);
          scrollToleranceTimerRef.current = null;
        }
      }

      lastScrollTop = scrollTop;
    };

    scrollContainer.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scrollContainer.removeEventListener("scroll", onScroll);
      if (scrollToleranceTimerRef.current) {
        clearTimeout(scrollToleranceTimerRef.current);
      }
    };
  }, [snapTo]);

  const bgScale = 1 - progress * 0.2;

  return {
    progress,
    bgScale,
    sheetRef,
    handleRef,
    contentRef,
    isDragging,
  };
}
