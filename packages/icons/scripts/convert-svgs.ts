#!/usr/bin/env tsx
/**
 * One-time script to convert SVG files to TSX components.
 * Run: pnpm --filter @feel-good/icons convert
 *
 * Reads SVGs from apps/greyboard/icons/ and generates
 * TSX components in packages/icons/src/components/
 */
import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_DIR = join(__dirname, "../../../apps/greyboard/icons");
const OUTPUT_DIR = join(__dirname, "../src/components");
const DOC_ICONS_OUTPUT = join(__dirname, "../src/doc-icons");
const TYPES_FILE = join(__dirname, "../src/types.ts");
const INDEX_FILE = join(__dirname, "../src/index.ts");

// Icon name mappings from the original index.ts (SF Symbols naming to PascalCase)
const ICON_MAPPINGS: Record<string, string> = {
  "1.circle.fill.svg": "OneCircleFillIcon",
  "2.circle.fill.svg": "TwoCircleFillIcon",
  "3.circle.fill.svg": "ThreeCircleFillIcon",
  "4.circle.fill.svg": "FourCircleFillIcon",
  "5.circle.fill.svg": "FiveCircleFillIcon",
  "a.circle.fill.svg": "ACircleFillIcon",
  "aqi.high.svg": "AqiHighIcon",
  "archivebox.fill.svg": "ArchiveBoxFillIcon",
  "arrow.backward.svg": "ArrowBackwardIcon",
  "arrow.clockwise.svg": "ArrowClockwiseIcon",
  "arrow.down.doc.fill.svg": "ArrowDownDocFillIcon",
  "arrow.down.doc.svg": "ArrowDownDocIcon",
  "arrow.down.svg": "ArrowDownIcon",
  "arrow.down.to.line.compact.svg": "ArrowDownToLineCompactIcon",
  "arrow.forward.svg": "ArrowForwardIcon",
  "arrow.left.circle.fill.svg": "ArrowLeftCircleFillIcon",
  "arrow.left.line.svg": "ArrowLeftLineIcon",
  "arrow.left.up.and.right.down.svg": "ArrowLeftUpAndRightDownIcon",
  "arrow.triangle.left.fill.svg": "ArrowTriangleLeftFillIcon",
  "arrow.triangle.right.fill.svg": "ArrowTriangleRightFillIcon",
  "arrow.turn.down.left.svg": "ArrowTurnDownLeftIcon",
  "arrow.turn.down.right.svg": "ArrowTurnDownRightIcon",
  "arrow.up.and.down.svg": "ArrowUpAndDownIcon",
  "arrow.up.right.svg": "ArrowUpRightIcon",
  "arrow.up.svg": "ArrowUpIcon",
  "arrow.up.to.line.compact.svg": "ArrowUpToLineCompactIcon",
  "arrowshape.turn.up.right.fill.svg": "ArrowshapeTurnUpRightFillIcon",
  "arrowshape.up.fill.svg": "ArrowshapeUpFillIcon",
  "bell.fill.svg": "BellFillIcon",
  "bold.svg": "BoldIcon",
  "bolt.svg": "BoltIcon",
  "book.fill.svg": "BookFillIcon",
  "bookmark.fill.svg": "BookmarkFillIcon",
  "bubble.left.fill.svg": "BubbleLeftFillIcon",
  "calendar.fill.svg": "CalendarFillIcon",
  "chart.bar.fill.svg": "ChartBarFillIcon",
  "chart.bar.xaxis.svg": "ChartBarXAxisIcon",
  "checked.circle.fill.svg": "CheckedCircleFillIcon",
  "checklist.svg": "ChecklistIcon",
  "checkmark.circle.svg": "CheckCircleIcon",
  "checkmark.small.svg": "CheckmarkSmallIcon",
  "checkmark.svg": "CheckmarkIcon",
  "circle.dashed.svg": "CircleDashedIcon",
  "circle.grid.cross.fill.svg": "CircleGridCrossFillIcon",
  "circle.lefthalf.filled.righthalf.striped.horizontal.inverse.svg":
    "CircleLeftHalfFilledRightHalfStripedHorizontalInverseIcon",
  "circle.lefthalf.filled.righthalf.striped.horizontal.svg":
    "CircleLeftHalfFilledRightHalfStripedHorizontalIcon",
  "circle.lefthalf.filled.svg": "CircleLeftHalfFilledIcon",
  "clock.fill.svg": "ClockFillIcon",
  "code.svg": "CodeIcon",
  "cursorarrow.click.2.svg": "CursorArrowClick2Icon",
  "cursorarrow.rays.svg": "CursorArrowRaysIcon",
  "cursorarrow.svg": "CursorArrowIcon",
  "cylinder.split.1x2.fill.svg": "CylinderSplit1x2FillIcon",
  "delete.left.fill.svg": "DeleteLeftFillIcon",
  "doc.fill.svg": "DocFillIcon",
  "doc.plain.text.fill.svg": "DocPlainTextFillIcon",
  "doc.richtext.fill.svg": "DocRichTextFillIcon",
  "drag.handle.vertical.svg": "DragHandleVerticalIcon",
  "ellipsis.svg": "EllipsisIcon",
  "envelope.fill.svg": "EnvelopeFillIcon",
  "exclamationmark.triangle.fill.svg": "ExclamationmarkTriangleFillIcon",
  "eye.fill.svg": "EyeFillIcon",
  "eyes.inverse.svg": "EyesInverseIcon",
  "eyes.svg": "EyesIcon",
  "face.smiling.inverse.svg": "FaceSmilingInverseIcon",
  "folder.fill.svg": "FolderFillIcon",
  "gear.svg": "GearIcon",
  "globe.fill.svg": "GlobeFillIcon",
  "globe.svg": "GlobeIcon",
  "hand.tap.fill.svg": "HandTapFillIcon",
  "hand.wave.fill.svg": "HandWaveFillIcon",
  "hands.thumbsdown.fill.svg": "HandsThumbsdownFillIcon",
  "hands.thumbsup.fill.svg": "HandsThumbsupFillIcon",
  "heart.fill.svg": "HeartFillIcon",
  "heart.svg": "HeartIcon",
  "house.fill.svg": "HouseFillIcon",
  "info.circle.fill.svg": "InfoCircleFillIcon",
  "info.circle.svg": "InfoCircleIcon",
  "italic.svg": "ItalicIcon",
  "l.curve.fill.svg": "LCurveFillIcon",
  "laser.burst.svg": "LaserBurstIcon",
  "lightbulb.fill.svg": "LightbulbFillIcon",
  "lightbulb.max.fill.svg": "LightbulbMaxFillIcon",
  "lightbulb.svg": "LightbulbIcon",
  "line.3.horizontal.svg": "Line3HorizontalIcon",
  "line.3.svg": "Line3Icon",
  "line.diagonal.svg": "LineDiagonalIcon",
  "line.downtrend.svg": "LineDownTrendIcon",
  "line.uptrend.svg": "LineUpTrendIcon",
  "link.svg": "LinkIcon",
  "list.bullet.svg": "ListBulletIcon",
  "list.number.svg": "ListNumberIcon",
  "logo.svg": "LogoIcon",
  "magnifying.glass.svg": "MagnifyingGlassIcon",
  "mic.fill.svg": "MicFillIcon",
  "mic.slash.fill.svg": "MicSlashFillIcon",
  "minus.square.fill.svg": "MinusSquareFillIcon",
  "moon.fill.svg": "MoonFillIcon",
  "moon.stars.fill.svg": "MoonStarsFillIcon",
  "number.svg": "NumberIcon",
  "paper.plane.svg": "PaperPlaneIcon",
  "paperclip.svg": "PaperClipIcon",
  "pause.fill.svg": "PauseFillIcon",
  "pencil.circle.fill.svg": "PencilCircleFillIcon",
  "pencil.svg": "PencilIcon",
  "pencil.tip.svg": "PencilTipIcon",
  "person.2.crop.square.stack.svg": "Person2CropSquareStackIcon",
  "person.2.fill.svg": "Person2FillIcon",
  "person.crop.rectangle.stack.fill.svg": "PersonCropRectangleStackFillIcon",
  "person.crop.rectangle.stack.svg": "PersonCropRectangleStackIcon",
  "person.fill.svg": "PersonFillIcon",
  "photo.fill.svg": "PhotoFillIcon",
  "play.fill.svg": "PlayFillIcon",
  "play.rectangle.svg": "PlayRectangleIcon",
  "plus.circle.fill.svg": "PlusCircleFillIcon",
  "plus.svg": "PlusIcon",
  "question.mark.circle.fill.svg": "QuestionMarkCircleFillIcon",
  "quote.closing.svg": "QuoteClosingIcon",
  "quote.opening.svg": "QuoteOpeningIcon",
  "rectangle.leading.half.filled.svg": "RectangleLeadingHalfFilledIcon",
  "rectangle.portrait.and.arrow.right.svg": "RectanglePortraitAndArrowRightIcon",
  "rectangle.trailinghalf.filled.svg": "RectangleTrailingHalfFilledIcon",
  "round.bubble.left.svg": "RoundBubbleLeftIcon",
  "screen.share.fill.svg": "ScreenShareFillIcon",
  "sparkle.svg": "SparkleIcon",
  "square.and.arrow.up.svg": "SquareAndArrowUpIcon",
  "square.and.pencil.svg": "SquareAndPencilIcon",
  "square.fill.on.square.fill.svg": "SquareFillOnSquareFillIcon",
  "square.grid.2x2.fill.svg": "SquareGrid2x2FillInIcon",
  "square.on.square.fill.svg": "SquareOnSquareFillIcon",
  "square.on.square.svg": "SquareOnSquareIcon",
  "square.stack.fill.svg": "SquareStackFillIcon",
  "square.text.square.fill.svg": "SquareTextSquareFillIcon",
  "star.fill.svg": "StarFillIcon",
  "star.svg": "StarIcon",
  "stop.fill.svg": "StopFillIcon",
  "stopwatch.fill.svg": "StopWatchFillIcon",
  "strikethrough.svg": "StrikethroughIcon",
  "sun.max.fill.svg": "SunMaxFillIcon",
  "target.svg": "TargetIcon",
  "text.bubble.fill.svg": "TextBubbleFillIcon",
  "textformat.size.larger.svg": "TextFormatSizeLargerIcon",
  "textformat.size.smaller.svg": "TextFormatSizeSmallerIcon",
  "textformat.svg": "TextFormatIcon",
  "trash.fill.svg": "TrashFillIcon",
  "trash.svg": "TrashIcon",
  "tray.fill.1.svg": "TrayFill1Icon",
  "tray.fill.svg": "TrayFillIcon",
  "tray.svg": "TrayIcon",
  "triangle.fill.down.svg": "TriangleFillDownIcon",
  "underline.svg": "UnderlineIcon",
  "upvote.svg": "UpvoteIcon",
  "video.fill.svg": "VideoFillIcon",
  "video.slash.fill.svg": "VideoSlashFillIcon",
  "waveform.path.ecg.svg": "WaveformPathEcgIcon",
  "won.sign.svg": "WonSignIcon",
  "x.circle.fill.svg": "XCircleFillIcon",
  "x.mark.bold.svg": "XMarkBoldIcon",
  "xmark.circle.fill.svg": "XmarkCircleFillIcon",
  "xmark.small.svg": "XmarkSmallIcon",
  "xmark.svg": "XmarkIcon",
  // Doc icons
  "doc.image.light.svg": "DocImageLightIcon",
  "doc.md.light.svg": "DocMdLightIcon",
  "doc.pdf.light.svg": "DocPdfLightIcon",
  "doc.text.light.svg": "DocTextLightIcon",
};

// Convert component name to kebab-case filename
function toFileName(componentName: string): string {
  return componentName
    .replace(/Icon$/, "")
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");
}

// SVG attribute to React JSX attribute mapping
const SVG_ATTR_TO_JSX: Record<string, string> = {
  "clip-path": "clipPath",
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-opacity": "strokeOpacity",
  "fill-opacity": "fillOpacity",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-weight": "fontWeight",
  "font-style": "fontStyle",
  "text-anchor": "textAnchor",
  "text-decoration": "textDecoration",
  "dominant-baseline": "dominantBaseline",
  "alignment-baseline": "alignmentBaseline",
  "baseline-shift": "baselineShift",
  "xlink:href": "xlinkHref",
  "xml:space": "xmlSpace",
  "xmlns:xlink": "xmlnsXlink",
  "color-interpolation": "colorInterpolation",
  "color-interpolation-filters": "colorInterpolationFilters",
  "flood-color": "floodColor",
  "flood-opacity": "floodOpacity",
  "lighting-color": "lightingColor",
  "marker-start": "markerStart",
  "marker-mid": "markerMid",
  "marker-end": "markerEnd",
  "paint-order": "paintOrder",
  "shape-rendering": "shapeRendering",
  "vector-effect": "vectorEffect",
};

// Convert SVG attributes to React JSX camelCase attributes
function convertToJsxAttributes(content: string): string {
  let result = content;
  for (const [svgAttr, jsxAttr] of Object.entries(SVG_ATTR_TO_JSX)) {
    // Match attribute="value" pattern
    const regex = new RegExp(`${svgAttr}=`, "g");
    result = result.replace(regex, `${jsxAttr}=`);
  }
  return result;
}

// Extract SVG content and generate TSX component
function generateComponent(svgContent: string, componentName: string): string {
  // Parse the SVG to extract viewBox and inner content
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 28 28";

  // Extract inner content (everything between <svg> tags)
  const innerMatch = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  const innerContent = innerMatch ? innerMatch[1].trim() : "";

  // Convert SVG attributes to React JSX camelCase and normalize whitespace
  const jsxContent = convertToJsxAttributes(innerContent)
    .replace(/\s+/g, " ")
    .trim();

  return `import { forwardRef, type SVGProps } from "react";

export const ${componentName} = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="${viewBox}"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      ${jsxContent}
    </svg>
  )
);

${componentName}.displayName = "${componentName}";
`;
}

interface ConvertedIcon {
  componentName: string;
  fileName: string;
  isDocIcon: boolean;
}

async function convertSvg(
  svgPath: string,
  outputDir: string,
  svgFilename: string,
  isDocIcon: boolean
): Promise<ConvertedIcon | null> {
  const componentName = ICON_MAPPINGS[svgFilename];
  if (!componentName) {
    console.warn(`No mapping found for: ${svgFilename}`);
    return null;
  }

  const svgContent = await readFile(svgPath, "utf8");
  const fileName = toFileName(componentName);
  const tsxContent = generateComponent(svgContent, componentName);

  await writeFile(join(outputDir, `${fileName}.tsx`), tsxContent);
  return { componentName, fileName, isDocIcon };
}

async function main() {
  console.log("Creating directories...");
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(DOC_ICONS_OUTPUT, { recursive: true });

  console.log("Converting SVGs...");
  const files = await readdir(SOURCE_DIR);
  const convertedIcons: ConvertedIcon[] = [];

  for (const file of files) {
    if (file === "doc-icons") {
      // Handle subdirectory
      const docIconsDir = join(SOURCE_DIR, "doc-icons");
      const docFiles = await readdir(docIconsDir);
      for (const docFile of docFiles.filter((f) => f.endsWith(".svg"))) {
        const result = await convertSvg(
          join(docIconsDir, docFile),
          DOC_ICONS_OUTPUT,
          docFile,
          true
        );
        if (result) convertedIcons.push(result);
      }
    } else if (file.endsWith(".svg")) {
      const result = await convertSvg(
        join(SOURCE_DIR, file),
        OUTPUT_DIR,
        file,
        false
      );
      if (result) convertedIcons.push(result);
    }
  }

  // Sort icons alphabetically by component name
  convertedIcons.sort((a, b) => a.componentName.localeCompare(b.componentName));

  // Generate types.ts with IconName union
  console.log("Generating types.ts...");
  const iconNames = convertedIcons.map((i) => `  | "${i.componentName}"`).join("\n");
  const typesContent = `import type { SVGProps } from "react";

/**
 * Props for icon components, extending standard SVG props.
 * All icons accept className for styling with Tailwind/CSS.
 *
 * @example
 * <ArrowDownIcon className="size-4 text-blue-500" />
 * <CheckmarkIcon style={{ color: "green" }} onClick={handleClick} />
 */
export interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Union type of all available icon names.
 */
export type IconName =
${iconNames};
`;
  await writeFile(TYPES_FILE, typesContent);

  // Generate index.ts
  console.log("Generating index.ts...");
  const exports: string[] = [];

  // Type exports
  exports.push('export type { IconProps, IconName } from "./types";');
  exports.push("");

  // Component exports
  for (const icon of convertedIcons) {
    const folder = icon.isDocIcon ? "doc-icons" : "components";
    exports.push(
      `export { ${icon.componentName} } from "./${folder}/${icon.fileName}";`
    );
  }

  await writeFile(INDEX_FILE, exports.join("\n") + "\n");

  console.log(`\nConverted ${convertedIcons.length} icons:`);
  console.log(`  - ${convertedIcons.filter((i) => !i.isDocIcon).length} main icons`);
  console.log(`  - ${convertedIcons.filter((i) => i.isDocIcon).length} doc icons`);
}

main().catch(console.error);
