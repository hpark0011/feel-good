// UT-12: Counter data-state="warning" at 80% of limit (FR-09)
// UT-13: Counter data-state="danger" at >= limit (FR-07, FR-08)
import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { CharCounterTextarea } from "../components/char-counter-textarea";

describe("CharCounterTextarea", () => {
  describe("data-state=warning at 80% of limit", () => {
    it("shows warning state at 3200/4000 characters (80%)", () => {
      const onChange = mock(() => {});
      render(
        <CharCounterTextarea
          value={"a".repeat(3200)}
          onChange={onChange}
          maxLength={4000}
        />,
      );
      const counter = screen.getByText("3200/4000");
      expect(counter.getAttribute("data-state")).toBe("warning");
    });

    it("shows warning state at 400/500 characters (80%)", () => {
      const onChange = mock(() => {});
      render(
        <CharCounterTextarea
          value={"a".repeat(400)}
          onChange={onChange}
          maxLength={500}
        />,
      );
      const counter = screen.getByText("400/500");
      expect(counter.getAttribute("data-state")).toBe("warning");
    });

    it("shows normal state below 80%", () => {
      const onChange = mock(() => {});
      render(
        <CharCounterTextarea
          value={"a".repeat(100)}
          onChange={onChange}
          maxLength={4000}
        />,
      );
      const counter = screen.getByText("100/4000");
      expect(counter.getAttribute("data-state")).toBe("normal");
    });
  });

  describe("data-state=danger at >= limit", () => {
    it("shows danger state at exactly 4000/4000 characters", () => {
      const onChange = mock(() => {});
      render(
        <CharCounterTextarea
          value={"a".repeat(4000)}
          onChange={onChange}
          maxLength={4000}
        />,
      );
      const counter = screen.getByText("4000/4000");
      expect(counter.getAttribute("data-state")).toBe("danger");
    });

    it("shows danger state at exactly 500/500 characters", () => {
      const onChange = mock(() => {});
      render(
        <CharCounterTextarea
          value={"a".repeat(500)}
          onChange={onChange}
          maxLength={500}
        />,
      );
      const counter = screen.getByText("500/500");
      expect(counter.getAttribute("data-state")).toBe("danger");
    });
  });
});
