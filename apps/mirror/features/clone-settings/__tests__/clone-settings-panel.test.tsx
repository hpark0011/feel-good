// UT-14: Save button disabled while mutation pending (FR-13)
// UT-15: Form submits { tonePreset, personaPrompt, topicsToAvoid } (FR-11)
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

// Mock convex/react before importing the component
const mockUseQuery = mock(() => null);
let mutationResolve: (() => void) | null = null;
const mockMutationFn = mock(
  () =>
    new Promise<null>((resolve) => {
      mutationResolve = () => resolve(null);
    }),
);
const mockUseMutation = mock(() => mockMutationFn);

mock.module("convex/react", () => ({
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
}));

// Import component after mock is set up
const { CloneSettingsPanel } = await import(
  "@/features/clone-settings/components/clone-settings-panel"
);

describe("CloneSettingsPanel", () => {
  beforeEach(() => {
    mockMutationFn.mockReset();
    mutationResolve = null;
    // Default: mutation resolves immediately
    mockMutationFn.mockImplementation(() => Promise.resolve(null));
  });

  it("renders save button enabled when not submitting", () => {
    render(<CloneSettingsPanel />);
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDefined();
    expect((saveButton as HTMLButtonElement).disabled).toBe(false);
  });

  it("save button is disabled while mutation is pending (FR-13)", async () => {
    // Make mutation hang
    mockMutationFn.mockImplementation(
      () =>
        new Promise<null>((resolve) => {
          mutationResolve = () => resolve(null);
        }),
    );

    render(<CloneSettingsPanel />);

    const saveButton = screen.getByRole("button", { name: /save/i });
    await userEvent.click(saveButton);

    // During pending, button should be disabled
    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /saving/i });
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });

    // Resolve the mutation
    mutationResolve?.();
  });

  it("submits { tonePreset, personaPrompt, topicsToAvoid } on save (FR-11)", async () => {
    mockMutationFn.mockImplementation(() => Promise.resolve(null));
    render(<CloneSettingsPanel />);

    const saveButton = screen.getByRole("button", { name: /save/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockMutationFn).toHaveBeenCalledTimes(1);
    });

    const callArgs = mockMutationFn.mock.calls[0]?.[0] as Record<
      string,
      unknown
    >;
    expect(callArgs).toHaveProperty("tonePreset");
    expect(callArgs).toHaveProperty("personaPrompt");
    expect(callArgs).toHaveProperty("topicsToAvoid");
  });
});
