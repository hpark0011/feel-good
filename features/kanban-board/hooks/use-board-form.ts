"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColumnId, Ticket } from "@/types/board.types";

// ============================================================================
// Types
// ============================================================================

export interface TicketFormValues {
  title: string;
  description: string;
  status: ColumnId;
  projectId?: string;
  subTasks: Array<{ id: string; text: string; completed: boolean }>;
}

export interface UseBoardFormOptions {
  /** Last selected project ID for form defaults */
  lastSelectedProjectId?: string;
}

export interface UseBoardFormReturn {
  /** Whether the form dialog is open */
  isFormOpen: boolean;
  /** Ticket being edited (null for create mode) */
  editingTicket: Ticket | null;
  /** Column ID for new ticket creation */
  formColumnId: ColumnId;
  /** Open form for creating a new ticket in specified column */
  openCreate: (columnId: ColumnId) => void;
  /** Open form for editing an existing ticket */
  openEdit: (ticket: Ticket) => void;
  /** Close the form dialog */
  closeForm: () => void;
  /** Set form open state (for dialog onOpenChange) */
  setIsFormOpen: (open: boolean) => void;
  /** Default values for the form based on mode and editing ticket */
  defaultValues: TicketFormValues;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Manages the ticket form dialog state including open/close,
 * create/edit modes, and default values.
 *
 * @param options - Configuration options
 * @returns Form state and handlers
 *
 * @example
 * const { isFormOpen, openCreate, openEdit, closeForm, defaultValues } = useBoardForm({
 *   lastSelectedProjectId,
 * });
 */
export function useBoardForm({
  lastSelectedProjectId,
}: UseBoardFormOptions = {}): UseBoardFormReturn {
  // ============================================================================
  // State
  // ============================================================================

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [formColumnId, setFormColumnId] = useState<ColumnId>("backlog");

  // ============================================================================
  // Actions
  // ============================================================================

  const openCreate = useCallback((columnId: ColumnId) => {
    setFormColumnId(columnId);
    setEditingTicket(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormColumnId(ticket.status);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
  }, []);

  // Handle dialog close - clear editing ticket after dialog is closed
  const handleSetIsFormOpen = useCallback((open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      // Clear editingTicket only after dialog is closed
      setEditingTicket(null);
    }
  }, []);

  // ============================================================================
  // Default Values
  // ============================================================================

  const defaultValues = useMemo((): TicketFormValues => {
    if (editingTicket) {
      return {
        title: editingTicket.title,
        description: editingTicket.description,
        status: editingTicket.status,
        projectId: editingTicket.projectId,
        subTasks: editingTicket.subTasks || [],
      };
    }
    return {
      title: "",
      description: "",
      status: formColumnId,
      projectId: lastSelectedProjectId,
      subTasks: [],
    };
  }, [editingTicket, formColumnId, lastSelectedProjectId]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    isFormOpen,
    editingTicket,
    formColumnId,
    openCreate,
    openEdit,
    closeForm,
    setIsFormOpen: handleSetIsFormOpen,
    defaultValues,
  };
}
