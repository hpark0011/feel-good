# Migrate UI Factory sonner-variants to use `showToast` and `@feel-good/icons`

## Context

We just added `showToast()` convenience function and icon color tokens to `@feel-good/ui/components/toast`. Now we need to update the UI Factory showcase (`sonner-variants.tsx`) to use it for the standard toast types (success, error, warning, info), while keeping the composable API for custom layouts (default, loading, action, description).

## File

`apps/ui-factory/app/components/sonner/_components/sonner-variants.tsx`

## Changes

1. **Imports** (already done): Add `showToast`, keep only `Loader2Icon` from lucide-react, remove `CircleCheckIcon`, `InfoIcon`, `OctagonXIcon`, `TriangleAlertIcon`

2. **Success section**: Replace manual `toast.custom()` with `showToast({ type: "success", title: "Action completed successfully", description: "Your changes have been saved" })`

3. **Error section**: Replace with `showToast({ type: "error", title: "Something went wrong", description: "Please try again later" })`

4. **Warning section**: Replace with `showToast({ type: "warning", title: "Please review before continuing" })`

5. **Info section**: Replace with `showToast({ type: "info", title: "Here is some useful information" })`

6. **Action section**: Replace the nested success toast (undo callback) with `showToast({ type: "success", title: "File restored" })`

7. **Keep composable**: Default, Loading, Action (outer), Description toasts stay as-is since they don't map to a standard type

## Verification

- `pnpm build --filter=@feel-good/ui-factory` must pass
