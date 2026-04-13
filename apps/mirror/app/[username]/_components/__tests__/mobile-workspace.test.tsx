// UT-18: MobileWorkspace does not call scrollContainer.scrollTo when routeState is null (FR-23)
import { describe, expect, it, mock } from "bun:test";
import { renderHook } from "@testing-library/react";
import { useProfileNavigationEffects } from "@/hooks/use-profile-navigation-effects";

describe("useProfileNavigationEffects with routeState=null", () => {
  it("does not call scrollContainer.scrollTo when routeState is null", () => {
    const scrollToSpy = mock(() => {});
    const scrollContainer = {
      scrollTo: scrollToSpy,
      scrollTop: 0,
    } as unknown as HTMLElement;

    renderHook(() =>
      useProfileNavigationEffects(scrollContainer, null),
    );

    expect(scrollToSpy).toHaveBeenCalledTimes(0);
  });
});
