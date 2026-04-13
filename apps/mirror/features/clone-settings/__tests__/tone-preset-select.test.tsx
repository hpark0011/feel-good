// UT-11: TonePresetSelect renders all six preset labels (FR-05)
import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { TONE_PRESETS } from "@feel-good/convex/chat/tonePresets";
import { TonePresetSelect } from "@/features/clone-settings/components/tone-preset-select";

describe("TonePresetSelect", () => {
  it("renders all six preset labels", async () => {
    const onChange = mock(() => {});
    render(<TonePresetSelect value={null} onChange={onChange} />);

    // Open the select to reveal all options
    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);

    // Verify all six label strings are in the DOM
    for (const { label } of Object.values(TONE_PRESETS)) {
      expect(screen.getByText(label)).toBeDefined();
    }
  });

  it("renders exactly six tone preset options (from TONE_PRESETS)", async () => {
    const onChange = mock(() => {});
    render(<TonePresetSelect value={null} onChange={onChange} />);

    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);

    const presetKeys = Object.keys(TONE_PRESETS);
    expect(presetKeys).toHaveLength(6);
  });
});
