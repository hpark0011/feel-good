// Types
export type { SubTask } from "@/types/board.types";

// Core presentational component
export { SubTaskRow } from "./components/sub-task-row";

// Adapters for different state management approaches
export { SubTaskRowForm } from "./components/sub-task-row-form";
export { SubTaskRowControlled } from "./components/sub-task-row-controlled";

// Shared building blocks (for advanced customization)
export { SubTaskWrapper } from "./components/sub-task-wrapper";
export { SubTaskDeleteButton } from "./components/sub-task-delete-button";
export { SubTaskDeleteGradientOverlay } from "./components/sub-task-delete-gradient-overlay";

// Backwards compatibility aliases (deprecated)
/** @deprecated Use SubTaskRowForm instead */
export { SubTaskRowForm as SubTaskFormRow } from "./components/sub-task-row-form";
/** @deprecated Use SubTaskRowControlled instead */
export { SubTaskRowControlled as SubTasksControlledRow } from "./components/sub-task-row-controlled";
