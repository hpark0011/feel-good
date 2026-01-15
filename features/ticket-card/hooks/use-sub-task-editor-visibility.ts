import { useCallback, useState } from "react";

interface UseSubTaskEditorVisibilityProps {
  /** Number of sub-tasks on the ticket */
  subTaskCount: number;
}

type UseSubTaskEditorVisibilityResult = [
  /** Whether the sub-task editor is currently open */
  isOpen: boolean,
  /** Toggle the editor visibility */
  toggle: () => void,
];

/**
 * Manages the visibility state of the sub-task inline editor.
 *
 * Automatically opens the editor when sub-tasks exist (derived initial state),
 * eliminating the need for useEffect synchronization.
 *
 * @param props.subTaskCount - Number of existing sub-tasks
 * @returns Tuple of [isOpen, toggle] for controlling visibility
 *
 * @example
 * const [isSubTaskEditorOpen, toggleSubTaskEditor] =
 *   useSubTaskEditorVisibility({ subTaskCount: ticket.subTasks?.length ?? 0 });
 *
 * <button onClick={toggleSubTaskEditor}>
 *   {isSubTaskEditorOpen ? "Hide" : "Show"} Sub-tasks
 * </button>
 */
export function useSubTaskEditorVisibility({
  subTaskCount,
}: UseSubTaskEditorVisibilityProps): UseSubTaskEditorVisibilityResult {
  // Derive initial state from sub-task count - open if sub-tasks exist
  const [isOpen, setIsOpen] = useState(() => subTaskCount > 0);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return [isOpen, toggle];
}
