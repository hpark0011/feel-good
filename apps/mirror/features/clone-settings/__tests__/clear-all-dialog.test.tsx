// UT-16: Dialog renders exact verbatim body string (FR-16)
import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ClearAllDialog } from "../components/clear-all-dialog";

describe("ClearAllDialog", () => {
  it("renders the verbatim confirmation body after trigger click", async () => {
    const onConfirm = mock(() => {});
    render(<ClearAllDialog onConfirm={onConfirm} />);

    // Click the trigger to open the dialog
    const trigger = screen.getByRole("button", {
      name: /clear all customizations/i,
    });
    await userEvent.click(trigger);

    // Verify the exact verbatim body string
    const expectedText =
      "This removes your tone, persona, and topics. Your clone will fall back to the default persona.";
    expect(screen.getByText(expectedText)).toBeDefined();
  });

  it("calls onConfirm when the confirm action is clicked", async () => {
    const onConfirm = mock(() => {});
    render(<ClearAllDialog onConfirm={onConfirm} />);

    await userEvent.click(
      screen.getByRole("button", { name: /clear all customizations/i }),
    );
    await userEvent.click(screen.getByRole("button", { name: /clear all/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
