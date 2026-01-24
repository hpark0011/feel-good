#!/usr/bin/env tsx
/**
 * One-time script to convert forwardRef icon components to simple function components.
 * Run: pnpm --filter @feel-good/icons simplify
 */
import { readdir, readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMPONENTS_DIR = join(__dirname, "../src/components");
const DOC_ICONS_DIR = join(__dirname, "../src/doc-icons");

async function transformFile(filePath: string): Promise<boolean> {
  const content = await readFile(filePath, "utf8");

  // Skip if already transformed (no forwardRef)
  if (!content.includes("forwardRef")) {
    return false;
  }

  // Extract component name
  const nameMatch = content.match(/export const (\w+) = forwardRef/);
  if (!nameMatch) {
    console.warn(`Could not find component name in ${filePath}`);
    return false;
  }
  const componentName = nameMatch[1];

  // Extract viewBox
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 28 28";

  // Extract inner content (between <svg...> and </svg>)
  const innerMatch = content.match(/<svg[^>]*>\s*([\s\S]*?)\s*<\/svg>/);
  const innerContent = innerMatch ? innerMatch[1].trim() : "";

  const newContent = `import type { SVGProps } from "react";

export function ${componentName}({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="${viewBox}"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      ${innerContent}
    </svg>
  );
}
`;

  await writeFile(filePath, newContent);
  return true;
}

async function processDirectory(dir: string): Promise<number> {
  let count = 0;
  try {
    const files = await readdir(dir);
    for (const file of files) {
      if (file.endsWith(".tsx")) {
        const transformed = await transformFile(join(dir, file));
        if (transformed) count++;
      }
    }
  } catch (err) {
    console.warn(`Could not process directory ${dir}:`, err);
  }
  return count;
}

async function main() {
  console.log("Simplifying icon components...");

  const componentsCount = await processDirectory(COMPONENTS_DIR);
  const docIconsCount = await processDirectory(DOC_ICONS_DIR);

  console.log(`\nTransformed ${componentsCount + docIconsCount} files:`);
  console.log(`  - ${componentsCount} main components`);
  console.log(`  - ${docIconsCount} doc icons`);
}

main().catch(console.error);
