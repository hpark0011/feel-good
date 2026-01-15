"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { getStorageKey } from "@/lib/storage-keys";

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
    setSelectedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
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
