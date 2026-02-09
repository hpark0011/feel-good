# Lessons Learned

## 2026-02-09

- `DrawerContent` is backed by Radix Dialog content. Always include a `DrawerTitle` (typically in an `sr-only` `DrawerHeader`) to keep the component accessible and prevent Dialog accessibility warnings/errors.
