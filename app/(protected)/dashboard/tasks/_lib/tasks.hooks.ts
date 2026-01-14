"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { getStorageKey } from "@/lib/storage-keys";

// ============================================================================
// Ticket Form Hook
// ============================================================================

const ticketSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(1000, "Description is too long").default(""),
  status: z.enum(["backlog", "to-do", "in-progress", "complete"]),
  projectId: z.string().optional(),
  subTasks: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        completed: z.boolean(),
      })
    )
    .optional()
    .default([]),
});

type TicketFormInput = z.input<typeof ticketSchema>;
type TicketFormOutput = z.output<typeof ticketSchema>;

interface UseTicketFormProps {
  defaultValues?: TicketFormInput;
  onSubmit: (data: TicketFormOutput) => void;
  open?: boolean;
}

/**
 * Manages ticket form state and validation.
 *
 * Handles form initialization, reset behavior on dialog open/close,
 * and submission with Zod validation.
 *
 * @param defaultValues - Initial form values
 * @param onSubmit - Callback when form is submitted with valid data
 * @param open - Dialog open state (triggers form reset on open transition)
 * @returns Object containing form instance, submit handler, and schema
 *
 * @example
 * const { form, handleSubmit } = useTicketForm({
 *   defaultValues: { title: "", status: "backlog" },
 *   onSubmit: (data) => createTicket(data),
 *   open: isDialogOpen
 * });
 */
export function useTicketForm({
  defaultValues,
  onSubmit,
  open,
}: UseTicketFormProps) {
  const form = useForm<TicketFormInput, unknown, TicketFormOutput>({
    resolver: zodResolver(ticketSchema),
    defaultValues,
  });

  // Track previous open state to detect transitions
  const prevOpen = useRef(false);

  // Reset form only when dialog transitions from closed to open
  useEffect(() => {
    if (open && !prevOpen.current) {
      form.reset(defaultValues);
    }
    prevOpen.current = open ?? false;
  }, [open, defaultValues, form]);

  const handleSubmit = (data: TicketFormOutput) => {
    onSubmit(data);
  };

  return {
    form,
    handleSubmit,
    ticketSchema,
  };
}

export type { TicketFormInput, TicketFormOutput };

// ============================================================================
// Project Filter Hook
// ============================================================================

const PROJECT_FILTER_STORAGE_KEY = getStorageKey("TASKS", "PROJECT_FILTER");

/**
 * Manages the project filter state for the task board.
 *
 * Stores selected project IDs in localStorage and provides methods to
 * toggle project selection and clear all filters.
 *
 * @returns Object containing selected project IDs and filter management functions
 *
 * @example
 * const { selectedProjectIds, toggleProject, clearFilter } = useProjectFilter();
 *
 * // Toggle a project in the filter
 * toggleProject("project-123");
 *
 * // Clear all filters
 * clearFilter();
 */
export function useProjectFilter() {
  const [selectedProjectIds, setSelectedProjectIds] = useLocalStorage<string[]>(
    PROJECT_FILTER_STORAGE_KEY,
    []
  );

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds((prev) => {
      if (prev.includes(projectId)) {
        return prev.filter((id) => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const clearFilter = () => {
    setSelectedProjectIds([]);
  };

  return {
    selectedProjectIds,
    toggleProject,
    clearFilter,
  };
}

// ============================================================================
// Last Selected Project Hook
// ============================================================================

const LAST_SELECTED_PROJECT_STORAGE_KEY = getStorageKey("TASKS", "LAST_SELECTED_PROJECT");

/**
 * Manages the last selected project for ticket creation.
 *
 * Stores the project ID (or undefined) in localStorage so that when users
 * create a new ticket, the project field defaults to their previous selection.
 *
 * @returns Object containing the last selected project ID and a function to update it
 *
 * @example
 * const { lastSelectedProjectId, setLastSelectedProjectId } = useLastSelectedProject();
 *
 * // Set the last selected project
 * setLastSelectedProjectId("project-123");
 *
 * // Clear the last selected project
 * setLastSelectedProjectId(undefined);
 */
export function useLastSelectedProject() {
  const [lastSelectedProjectId, setLastSelectedProjectId] = useLocalStorage<
    string | undefined
  >(LAST_SELECTED_PROJECT_STORAGE_KEY, undefined);

  return {
    lastSelectedProjectId,
    setLastSelectedProjectId,
  };
}

// ============================================================================
// Today's Focus Hook
// ============================================================================

type FocusData = {
  [date: string]: string; // "2025-08-29": "Complete the design system"
};

const TODAY_FOCUS_STORAGE_KEY = getStorageKey("UI", "TODAY_FOCUS");
const MAX_DAYS_TO_KEEP = 7;

function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function cleanupOldEntries(data: FocusData): FocusData {
  const today = new Date();
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - MAX_DAYS_TO_KEEP);

  const cleaned: FocusData = {};

  for (const [dateStr, focus] of Object.entries(data)) {
    const entryDate = new Date(dateStr);
    if (entryDate >= cutoffDate) {
      cleaned[dateStr] = focus;
    }
  }

  return cleaned;
}

/**
 * Manages daily focus text with automatic cleanup of old entries.
 *
 * Stores focus text by date in localStorage (keeps last 7 days) and provides
 * methods to get/set today's focus.
 *
 * @returns Tuple containing today's focus text and a function to update it
 *
 * @example
 * const [todaysFocus, setTodaysFocus] = useTodayFocus();
 *
 * // Get today's focus
 * console.log(todaysFocus);
 *
 * // Set today's focus
 * setTodaysFocus("Complete the authentication module");
 */
export function useTodayFocus(): [string, (focus: string) => void] {
  const [focusData, setFocusData] = useLocalStorage<FocusData>(TODAY_FOCUS_STORAGE_KEY, {});
  const hasCleanedRef = useRef(false);

  const todayKey = getTodayDateString();

  // Clean up old entries only once when component mounts
  useEffect(() => {
    // Only run cleanup once
    if (hasCleanedRef.current) {
      return;
    }

    // Mark as cleaned to prevent re-running
    hasCleanedRef.current = true;

    // Delay cleanup to ensure localStorage has loaded
    const timeoutId = setTimeout(() => {
      setFocusData((current) => {
        // Don't clean empty initial state
        if (Object.keys(current).length === 0) {
          return current;
        }

        const cleaned = cleanupOldEntries(current);
        // Only update if something was actually cleaned
        if (Object.keys(cleaned).length !== Object.keys(current).length) {
          return cleaned;
        }
        return current;
      });
    }, 100); // Small delay to ensure localStorage is loaded

    return () => clearTimeout(timeoutId);
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todaysFocus = focusData[todayKey] || "";

  const setTodaysFocus = (focus: string) => {
    setFocusData((current) => ({
      ...current,
      [todayKey]: focus,
    }));
  };

  return [todaysFocus, setTodaysFocus];
}
