"use client";

import { useCallback, useRef } from "react";
import { useDock } from "../providers";

/**
 * Options for the useDockVisibility hook
 */
export interface UseDockVisibilityOptions {
  /** Delay in milliseconds before hiding the dock (default: 300) */
  hideDelay?: number;
}

/**
 * Handler functions for dock visibility events
 */
export interface DockVisibilityHandlers {
  /** Called when mouse enters the activation zone */
  onActivationZoneEnter: () => void;
  /** Called when mouse leaves the dock */
  onDockLeave: () => void;
}

/**
 * Return type for the useDockVisibility hook
 */
export interface UseDockVisibilityReturn {
  /** Whether the dock is currently visible */
  isVisible: boolean;
  /** Show the dock immediately */
  show: () => void;
  /** Hide the dock after the configured delay */
  hide: () => void;
  /** Event handlers for dock visibility management */
  handlers: DockVisibilityHandlers;
}

/**
 * Hook for managing dock visibility with delayed hide behavior.
 * Provides show/hide functions and event handlers for activation zone and dock interactions.
 *
 * @param options - Configuration options
 * @returns Visibility state, control functions, and event handlers
 *
 * @example
 * const { isVisible, show, hide, handlers } = useDockVisibility({ hideDelay: 500 });
 *
 * return (
 *   <>
 *     <div onMouseEnter={handlers.onActivationZoneEnter} />
 *     <Dock onMouseLeave={handlers.onDockLeave} />
 *   </>
 * );
 */
export function useDockVisibility(
  options: UseDockVisibilityOptions = {}
): UseDockVisibilityReturn {
  const { hideDelay = 300 } = options;
  const { state, setIsVisible } = useDock();
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsVisible(true);
  }, [setIsVisible]);

  const hide = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      hideTimeoutRef.current = null;
    }, hideDelay);
  }, [setIsVisible, hideDelay]);

  const handlers: DockVisibilityHandlers = {
    onActivationZoneEnter: show,
    onDockLeave: hide,
  };

  return {
    isVisible: state.isVisible,
    show,
    hide,
    handlers,
  };
}
