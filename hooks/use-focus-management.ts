import { useRef } from "react";

export function useFocusManagement() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleAutoFocus = (event: Event) => {
    event.preventDefault();
    const input = inputRef.current;
    if (input) {
      input.focus({ preventScroll: true });
      try {
        const position = input.value?.length ?? 0;
        input.setSelectionRange(position, position);
      } catch {}
    }
  };

  const setRefs = (el: HTMLInputElement | null, fieldRef: (el: HTMLInputElement | null) => void) => {
    fieldRef(el);
    inputRef.current = el;
  };

  return {
    inputRef,
    handleAutoFocus,
    setRefs,
  };
}