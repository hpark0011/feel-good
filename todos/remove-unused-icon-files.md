# Remove Unused Icon Files and Packages

Clean up unused icon-related files and packages from greyboard after migrating to `@feel-good/icons`.

## Tasks

- [x] **Delete icons directory** - Remove `apps/greyboard/icons/` (206 files including SVGs, subdirectories, and index.ts)

- [x] **Remove @svgr/webpack dependency** - Edit `apps/greyboard/package.json` line 59

- [ ] **Remove SVGR webpack config** - Simplify `apps/greyboard/next.config.ts` by removing the webpack() function (lines 13-38)

- [ ] **Update lockfile** - Run `pnpm install` to sync the lockfile

## Verification

- [ ] `pnpm --filter=@feel-good/greyboard check-types` - TypeScript compiles
- [ ] `pnpm dev --filter=@feel-good/greyboard` - Dev server starts
- [ ] Icons render correctly on `/dashboard/tasks`
