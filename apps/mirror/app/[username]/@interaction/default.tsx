import { InteractionPanel } from "../_components/interaction-panel";

// default.tsx is the ONLY file in this slot intentionally.
// Adding page.tsx or [slug]/page.tsx causes Next.js to unmount/remount
// the interaction panel during article navigation.
export default function InteractionDefault() {
  return <InteractionPanel />;
}
