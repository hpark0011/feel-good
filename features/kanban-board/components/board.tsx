"use client";

import type React from "react";
import { Fragment, forwardRef, useCallback, useImperativeHandle } from "react";
import { closestCenter, DndContext } from "@dnd-kit/core";
import { COLUMNS } from "@/config/board.config";
import { useStopWatchStore } from "@/store/stop-watch-store";
import { BodyContainer } from "@/components/layout/layout-ui";
import { TicketFormDialog } from "@/features/ticket-form";
import type { ColumnId, SubTask, Ticket } from "@/types/board.types";
import { useBoardState } from "../hooks/use-board-state";
import { useBoardDnd } from "../hooks/use-board-dnd";
import { useBoardForm } from "../hooks/use-board-form";
import { BoardColumn } from "./board-column";
import { BoardDragOverlay } from "./board-drag-overlay";

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
    (data: {
      title: string;
      description: string;
      status: ColumnId;
      projectId?: string;
      subTasks?: SubTask[];
    }) => {
      // Save the selected project as the last selected
      actions.setLastSelectedProjectId(data.projectId);

      if (editingTicket) {
        const oldColumn = findColumn(editingTicket.id);
        if (!oldColumn) return;

        const oldStatus = editingTicket.status;
        const newStatus = data.status;

        actions.setBoard((board) => {
          const now = new Date();
          const updatedTicket: Ticket = {
            ...editingTicket,
            title: data.title,
            description: data.description,
            status: data.status,
            projectId: data.projectId,
            subTasks: data.subTasks,
            updatedAt: now,
            completedAt:
              data.status === "complete"
                ? (editingTicket.completedAt ?? now)
                : null,
          };

          if (oldColumn === data.status) {
            return {
              ...board,
              [oldColumn]: board[oldColumn].map((t) =>
                t.id === editingTicket.id ? updatedTicket : t
              ),
            };
          } else {
            return {
              ...board,
              [oldColumn]: board[oldColumn].filter(
                (t) => t.id !== editingTicket.id
              ),
              [data.status]: [...board[data.status], updatedTicket],
            };
          }
        });

        // Update timer title if this ticket has active timer and title changed
        const stopWatchStore = useStopWatchStore.getState();
        if (
          stopWatchStore.activeTicketId === editingTicket.id &&
          data.title !== editingTicket.title
        ) {
          stopWatchStore.updateActiveTicketTitle(editingTicket.id, data.title);
        }

        // Handle timer logic if status changed
        if (oldStatus !== newStatus) {
          actions.handleStatusChange(editingTicket.id, oldStatus, newStatus);
        }
      } else {
        // Create new ticket
        const now = new Date();
        const newTicket: Ticket = {
          id: `ticket-${Date.now()}`,
          title: data.title,
          description: data.description,
          status: data.status,
          projectId: data.projectId,
          subTasks: data.subTasks,
          duration: 0,
          timeEntries: [],
          completedAt: data.status === "complete" ? now : null,
          createdAt: now,
          updatedAt: now,
        };

        actions.setBoard((board) => ({
          ...board,
          [data.status]: [...board[data.status], newTicket],
        }));
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
              <div className="w-[1px] min-w-[1px] bg-neutral-200 dark:bg-neutral-900 last:hidden" />
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
