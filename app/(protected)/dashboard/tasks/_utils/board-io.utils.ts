import { BoardState } from "@/types/board.types";
import {
  validateBoardData,
  deserializeBoardData,
} from "./board-serialization.utils";

// ============================================================================
// Board Import/Export Functions
// ============================================================================

export function importBoardFromJson(jsonData: string): BoardState {
  const parsed = JSON.parse(jsonData);

  if (!validateBoardData(parsed)) {
    throw new Error("Invalid board data format");
  }

  return deserializeBoardData(jsonData);
}

export function downloadJsonFile(data: string, filename: string): void {
  if (typeof window === "undefined") return;

  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
