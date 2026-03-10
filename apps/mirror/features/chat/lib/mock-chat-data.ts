import type { UIMessage } from "@convex-dev/agent/react";

/**
 * Sample streaming text for progressive reveal simulation.
 * ~200 chars to exercise useSmoothText without being excessively long.
 */
export const MOCK_STREAMING_TEXT =
  "That's a great question! I've been thinking a lot about how creative work intersects with technology. The key insight is that tools should amplify human intention, not replace it. Let me elaborate on that.";

function mockMessage(
  overrides: Partial<UIMessage> & Pick<UIMessage, "key" | "role" | "text" | "status">,
): UIMessage {
  return {
    id: overrides.key,
    parts: [{ type: "text" as const, text: overrides.text }],
    order: 0,
    stepOrder: 0,
    _creationTime: Date.now(),
    createdAt: new Date(),
    ...overrides,
  } as UIMessage;
}

export const MOCK_MESSAGES: UIMessage[] = [
  mockMessage({
    key: "mock-1",
    role: "user",
    text: "What do you think about the relationship between creativity and technology?",
    status: "success",
    order: 1,
    stepOrder: 0,
  }),
  mockMessage({
    key: "mock-2",
    role: "assistant",
    text: "I think creativity and technology have always been deeply intertwined. Every new tool — from the printing press to the internet — has expanded what creators can imagine and build.",
    status: "success",
    order: 2,
    stepOrder: 0,
  }),
  mockMessage({
    key: "mock-3",
    role: "user",
    text: "How do you stay focused when working on long-term projects?",
    status: "success",
    order: 3,
    stepOrder: 0,
  }),
  mockMessage({
    key: "mock-4",
    role: "assistant",
    text: "I break things down into small, meaningful milestones. Each one should feel like a real accomplishment, not just a checkbox. That way the momentum carries itself forward.",
    status: "success",
    order: 4,
    stepOrder: 0,
  }),
];
