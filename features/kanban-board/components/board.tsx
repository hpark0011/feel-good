"use client";

import type React from "react";
import { Fragment, forwardRef, useCallback, useImperativeHandle } from "react";
import { closestCenter, DndContext } from "@dnd-kit/core";
import { COLUMNS } from "@/config/board.config";
import { BodyContainer } from "@/components/layout/layout-ui";
import { TicketFormDialog } from "@/features/ticket-form";
import type { ColumnId } from "@/types/board.types";
import { useBoardState } from "../hooks/use-board-state";
import { useBoardDnd } from "../hooks/use-board-dnd";
import { useBoardForm, type TicketFormValues } from "../hooks/use-board-form";
import { BoardColumn } from "./board-column";
import { BoardDragOverlay } from "./board-drag-overlay";
import {
  createTicketFromFormData,
  updateTicketFromFormData,
  updateBoardWithTicket,
  syncTimerOnTicketUpdate,
} from "../utils/ticket-form.utils";

export type BoardHandle = {
  importFromInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  exportBoard: () => void;
  clearBoard: () => void;
};

export const Board = forwardRef<BoardHandle>(function Board(_props, ref) {
  const {
    board,
    filteredBoard,
    actions,
    findColumn,
    findTicket,
    lastSelectedProjectId,
    imperativeActions,
  } = useBoardState();

  const {
    isFormOpen,
    editingTicket,
    openCreate,
    openEdit,
    setIsFormOpen,
    defaultValues,
  } = useBoardForm({ lastSelectedProjectId });

  const { sensors, handlers, activeTicket } = useBoardDnd({
    board,
    findColumn,
    findTicket,
    onBoardUpdate: actions.setBoard,
    onStatusChange: actions.handleStatusChange,
  });

  const handleFormSubmit = useCallback(
    (data: TicketFormValues) => {
      // Save the selected project as the last selected
      actions.setLastSelectedProjectId(data.projectId);

      if (editingTicket) {
        const foundColumn = findColumn(editingTicket.id);
        if (!foundColumn) return;

        const oldColumn = foundColumn as ColumnId;
        const oldStatus = editingTicket.status;
        const newStatus = data.status;

        // Create updated ticket from form data
        const updatedTicket = updateTicketFromFormData(editingTicket, data);

        // Update board state (handles column movement)
        actions.setBoard((board) =>
          updateBoardWithTicket(board, updatedTicket, oldColumn, data.status)
        );

        // Sync timer title if changed
        syncTimerOnTicketUpdate(
          editingTicket.id,
          editingTicket.title,
          data.title
        );

        // Handle timer logic if status changed
        if (oldStatus !== newStatus) {
          actions.handleStatusChange(editingTicket.id, oldStatus, newStatus);
        }
      } else {
        // Create new ticket from form data
        const newTicket = createTicketFromFormData(data);

        // Add to board
        actions.setBoard((board) =>
          updateBoardWithTicket(board, newTicket, null, data.status)
        );
      }

      setIsFormOpen(false);
    },
    [editingTicket, findColumn, actions, setIsFormOpen]
  );

  const handleImportFromInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          imperativeActions.importBoard(content);
        } catch (error) {
          console.error("Failed to import board:", error);
          alert("Failed to import board. Please check the file format.");
        }
      };
      reader.readAsText(file);
    },
    [imperativeActions]
  );

  useImperativeHandle(
    ref,
    () => ({
      importFromInput: handleImportFromInput,
      exportBoard: imperativeActions.exportBoard,
      clearBoard: imperativeActions.clearBoard,
    }),
    [handleImportFromInput, imperativeActions]
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handlers.onDragStart}
        onDragOver={handlers.onDragOver}
        onDragEnd={handlers.onDragEnd}
      >
        <BodyContainer>
          {COLUMNS.map((column) => (
            <Fragment key={column.id}>
              <BoardColumn
                column={column}
                tickets={filteredBoard[column.id] || []}
                onAddTicket={() => openCreate(column.id)}
                onEditTicket={openEdit}
                onDeleteTicket={actions.deleteTicket}
                onClearColumn={
                  column.id === "complete"
                    ? () => actions.clearColumn("complete")
                    : undefined
                }
                onUpdateSubTasks={actions.updateSubTasks}
              />
              <div className='w-[1px] min-w-[1px] bg-neutral-200 dark:bg-neutral-900 last:hidden' />
            </Fragment>
          ))}
        </BodyContainer>
        <BoardDragOverlay activeTicket={activeTicket} />
      </DndContext>

      <TicketFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        defaultValues={defaultValues}
        mode={editingTicket ? "edit" : "create"}
      />
    </>
  );
});
