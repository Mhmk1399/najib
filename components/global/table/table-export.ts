import type { Cell, SheetData } from "write-excel-file/browser";

import type { DataDirection, DynamicColumn } from "./types";
import { getColumnValue } from "./utils";

type TableExportArgs<TRecord> = {
  title: string;
  records: TRecord[];
  columns: DynamicColumn<TRecord>[];
  displayedRows?: Array<Array<unknown>>;
  locale: string;
  direction: DataDirection;
  fileName?: string;
  sheetName?: string;
  theme?: "dark" | "light";
};

type PreparedCell = string | number;

type PreparedExport<TRecord> = {
  columns: DynamicColumn<TRecord>[];
  rows: PreparedCell[][];
};

const FILE_NAME_FORBIDDEN = /[<>:"/\\|?*\u0000-\u001f]/g;
const SHEET_NAME_FORBIDDEN = /[\\/?*:[\]]/g;

export async function exportTableToExcel<TRecord>(
  args: TableExportArgs<TRecord>,
) {
  const prepared = prepareExport(args);
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const cellStyle = {
    align: args.direction === "rtl" ? ("right" as const) : ("left" as const),
    alignVertical: "center" as const,
    borderColor: "#D9DEE7",
    borderStyle: "thin" as const,
    wrap: true,
  };
  const header: Cell[] = prepared.columns.map((column) => ({
    value: column.label,
    type: String,
    ...cellStyle,
    backgroundColor: "#151A22",
    textColor: "#FFFFFF",
    fontWeight: "bold",
    height: 34,
  }));
  const rows: SheetData = prepared.rows.map((row) =>
    row.map((value) => ({
      value,
      type: typeof value === "number" ? Number : String,
      ...cellStyle,
      height: 30,
    })),
  );
  const data: SheetData = [header, ...rows];
  const columns = prepared.columns.map((column, columnIndex) => ({
    width: calculateExcelWidth(
      column.label,
      prepared.rows.map((row) => row[columnIndex]),
    ),
  }));

  const workbook = writeXlsxFile(
    data,
    {
      sheet: sanitizeSheetName(args.sheetName ?? args.title),
      columns,
      orientation: "landscape",
      rightToLeft: args.direction === "rtl",
      showGridLines: false,
      stickyRowsCount: 1,
      zoomScale: 1,
    },
    {
      fontFamily: "Tahoma",
      fontSize: 11,
    },
  );

  await workbook.toFile(`${buildBaseFileName(args.fileName ?? args.title)}.xlsx`);
}

export async function exportTableToImage<TRecord>(
  args: TableExportArgs<TRecord>,
) {
  const prepared = prepareExport(args);
  if (document.fonts?.ready) await document.fonts.ready;

  const palette =
    args.theme === "dark"
      ? {
          page: "#0C1118",
          surface: "#111823",
          surfaceAlt: "#151E2A",
          header: "#E8EDF5",
          headerText: "#111720",
          text: "#F4F7FB",
          muted: "#AAB4C2",
          border: "#293545",
          accent: "#C95C2B",
        }
      : {
          page: "#F2F4F7",
          surface: "#FFFFFF",
          surfaceAlt: "#F7F8FA",
          header: "#171B22",
          headerText: "#FFFFFF",
          text: "#171B22",
          muted: "#667085",
          border: "#D9DEE7",
          accent: "#B84E22",
        };
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available in this browser.");

  const padding = 34;
  const titleHeight = 92;
  const headerHeight = 50;
  const cellPadding = 14;
  const lineHeight = 18;
  const maxCellLines = 3;
  const fontFamily = '"Vazirmatn", "IRANSans", Tahoma, Arial, sans-serif';

  context.font = `600 13px ${fontFamily}`;
  const columnWidths = prepared.columns.map((column, columnIndex) => {
    const samples = [
      column.label,
      ...prepared.rows.slice(0, 100).map((row) => String(row[columnIndex] ?? "")),
    ];
    const measured = Math.max(
      ...samples.map((sample) => context.measureText(sample).width),
    );
    return Math.min(300, Math.max(132, Math.ceil(measured + cellPadding * 2)));
  });
  const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  const canvasWidth = Math.max(720, tableWidth + padding * 2);

  context.font = `400 12px ${fontFamily}`;
  const preparedLines = prepared.rows.map((row) =>
    row.map((value, columnIndex) =>
      wrapCanvasText(
        context,
        String(value ?? ""),
        columnWidths[columnIndex] - cellPadding * 2,
        maxCellLines,
      ),
    ),
  );
  const rowHeights = preparedLines.map((row) => {
    const lines = Math.max(1, ...row.map((cell) => cell.length));
    return Math.max(48, lines * lineHeight + 22);
  });
  const canvasHeight =
    padding * 2 +
    titleHeight +
    headerHeight +
    rowHeights.reduce((sum, height) => sum + height, 0);
  const preferredScale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  const dimensionScale = Math.min(
    preferredScale,
    16_000 / canvasWidth,
    16_000 / canvasHeight,
    Math.sqrt(48_000_000 / Math.max(1, canvasWidth * canvasHeight)),
  );
  const scale = Math.max(1, dimensionScale);

  canvas.width = Math.ceil(canvasWidth * scale);
  canvas.height = Math.ceil(canvasHeight * scale);
  context.scale(scale, scale);
  context.direction = args.direction;
  context.textBaseline = "middle";

  context.fillStyle = palette.page;
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  context.fillStyle = palette.surface;
  context.fillRect(padding, padding, tableWidth, canvasHeight - padding * 2);

  const titleX = args.direction === "rtl" ? canvasWidth - padding * 2 : padding * 2;
  context.textAlign = args.direction === "rtl" ? "right" : "left";
  context.fillStyle = palette.text;
  context.font = `700 22px ${fontFamily}`;
  context.fillText(args.title, titleX, padding + 29);
  context.fillStyle = palette.muted;
  context.font = `400 11px ${fontFamily}`;
  const count = new Intl.NumberFormat(args.locale).format(args.records.length);
  const date = new Intl.DateTimeFormat(args.locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  context.fillText(`تعداد ردیف‌ها: ${count} | زمان خروجی: ${date}`, titleX, padding + 61);
  context.fillStyle = palette.accent;
  context.fillRect(
    args.direction === "rtl" ? canvasWidth - padding * 2 - 42 : padding * 2,
    padding + 76,
    42,
    3,
  );

  const columnLayouts = layoutColumns(
    columnWidths,
    padding,
    tableWidth,
    args.direction,
  );
  let y = padding + titleHeight;
  context.fillStyle = palette.header;
  context.fillRect(padding, y, tableWidth, headerHeight);
  context.font = `700 12px ${fontFamily}`;
  context.fillStyle = palette.headerText;
  prepared.columns.forEach((column, index) => {
    const layout = columnLayouts[index];
    drawCellText(
      context,
      [column.label],
      layout.x,
      y,
      layout.width,
      headerHeight,
      cellPadding,
      lineHeight,
      args.direction,
    );
    strokeCell(context, layout.x, y, layout.width, headerHeight, palette.border);
  });

  y += headerHeight;
  prepared.rows.forEach((_, rowIndex) => {
    const rowHeight = rowHeights[rowIndex];
    context.fillStyle = rowIndex % 2 === 0 ? palette.surface : palette.surfaceAlt;
    context.fillRect(padding, y, tableWidth, rowHeight);
    context.fillStyle = palette.text;
    context.font = `400 12px ${fontFamily}`;
    preparedLines[rowIndex].forEach((lines, columnIndex) => {
      const layout = columnLayouts[columnIndex];
      drawCellText(
        context,
        lines,
        layout.x,
        y,
        layout.width,
        rowHeight,
        cellPadding,
        lineHeight,
        args.direction,
      );
      strokeCell(context, layout.x, y, layout.width, rowHeight, palette.border);
    });
    y += rowHeight;
  });

  const blob = await canvasToBlob(canvas);
  downloadBlob(blob, `${buildBaseFileName(args.fileName ?? args.title)}.png`);
}

function prepareExport<TRecord>(
  args: TableExportArgs<TRecord>,
): PreparedExport<TRecord> {
  const columns = args.columns.filter((column) => column.exportable !== false);
  const rows = args.records.map((record, rowIndex) =>
    columns.map((column, columnIndex) => {
      const value = getColumnValue(column, record);
      const displayedValue = args.displayedRows?.[rowIndex]?.[columnIndex];
      const exportValue =
        displayedValue !== undefined
          ? displayedValue
          : column.exportValue
            ? column.exportValue({
                value,
                record,
                rowIndex,
                locale: args.locale,
              })
            : value;
      return normalizeExportValue(exportValue, args.locale);
    }),
  );

  return { columns, rows };
}

function normalizeExportValue(value: unknown, locale: string): PreparedCell {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") return Number.isFinite(value) ? value : "";
  if (typeof value === "boolean") {
    return locale.startsWith("fa") ? (value ? "بله" : "خیر") : value ? "Yes" : "No";
  }
  if (value instanceof Date) {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeExportValue(item, locale)).join("، ");
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function calculateExcelWidth(label: string, values: PreparedCell[]) {
  const longest = Math.max(
    Array.from(label).length,
    ...values.slice(0, 200).map((value) => Array.from(String(value)).length),
  );
  return Math.min(48, Math.max(14, longest + 3));
}

function buildBaseFileName(value: string) {
  const normalized = value
    .replace(/\.(xlsx|png)$/i, "")
    .replace(FILE_NAME_FORBIDDEN, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "")
    .slice(0, 80);
  const date = new Date().toISOString().slice(0, 10);
  return `${normalized || "table-export"}-${date}`;
}

function sanitizeSheetName(value: string) {
  return (
    value.replace(SHEET_NAME_FORBIDDEN, "-").trim().slice(0, 31) || "داده‌ها"
  );
}

function layoutColumns(
  widths: number[],
  startX: number,
  totalWidth: number,
  direction: DataDirection,
) {
  if (direction === "ltr") {
    let x = startX;
    return widths.map((width) => {
      const layout = { x, width };
      x += width;
      return layout;
    });
  }

  let x = startX + totalWidth;
  return widths.map((width) => {
    x -= width;
    return { x, width };
  });
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
  maxLines: number,
) {
  const words = value.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (!words.length) return [""];

  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (context.measureText(current).width > maxWidth) {
      const chunks = splitLongWord(context, current, maxWidth);
      lines.push(...chunks.slice(0, -1));
      current = chunks.at(-1) ?? "";
    }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;

  const limited = lines.slice(0, maxLines);
  limited[maxLines - 1] = fitEllipsis(
    context,
    limited[maxLines - 1],
    maxWidth,
  );
  return limited;
}

function splitLongWord(
  context: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
) {
  const chunks: string[] = [];
  let current = "";
  for (const character of Array.from(value)) {
    const candidate = `${current}${character}`;
    if (current && context.measureText(candidate).width > maxWidth) {
      chunks.push(current);
      current = character;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks.length ? chunks : [value];
}

function fitEllipsis(
  context: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
) {
  const ellipsis = "…";
  let result = value;
  while (
    result &&
    context.measureText(`${result}${ellipsis}`).width > maxWidth
  ) {
    result = Array.from(result).slice(0, -1).join("");
  }
  return `${result}${ellipsis}`;
}

function drawCellText(
  context: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  padding: number,
  lineHeight: number,
  direction: DataDirection,
) {
  context.textAlign = direction === "rtl" ? "right" : "left";
  const textX = direction === "rtl" ? x + width - padding : x + padding;
  const totalHeight = Math.max(1, lines.length) * lineHeight;
  const firstLineY = y + (height - totalHeight) / 2 + lineHeight / 2;
  lines.forEach((line, index) => {
    context.fillText(line, textX, firstLineY + index * lineHeight);
  });
}

function strokeCell(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) {
  context.strokeStyle = color;
  context.lineWidth = 1;
  context.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The table image could not be generated."));
    }, "image/png");
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
