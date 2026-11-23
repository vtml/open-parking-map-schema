import type { ShapeModel } from "../domain/dataset";

export interface MapOverlay {
  href: string;
  width: number;
  height: number;
  opacity: number;
  matrix: { a: number; b: number; c: number; d: number; e: number; f: number } | null;
}

export interface MapHandlers {
  onSelect(featureId: string): void;
  selectedId?: string;
  scale: number;
  panX: number;
  panY: number;
  overlay?: MapOverlay | null;
}

const bayFill: Record<string, string> = {
  accessible: "#9eb6d9",
  ev: "#8fbfa8",
  family: "#e2c07a",
  taxi: "#c5b4d6",
  courier: "#d7b59a",
  general: "#d9d3c7",
};

function svgEl<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string>): SVGElementTagNameMap[K] {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
}

const polygons = new Set(["bay", "zone", "lift", "stair", "handover", "destination", "boundary"]);

export function drawMap(svg: SVGSVGElement, shapes: ShapeModel[], handlers: MapHandlers): void {
  svg.replaceChildren();
  const coords = shapes.flatMap((shape) => shape.points);
  const xs = coords.map((point) => point[0]);
  const ys = coords.map((point) => point[1]);
  const minX = xs.length ? Math.min(...xs) - 3 : 0;
  const minY = ys.length ? Math.min(...ys) - 3 : 0;
  const maxX = xs.length ? Math.max(...xs) + 3 : 30;
  const maxY = ys.length ? Math.max(...ys) + 3 : 30;
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);
  svg.setAttribute("viewBox", `${minX} ${-maxY} ${width} ${height}`);
  const cx = (minX + maxX) / 2;
  const cy = -(minY + maxY) / 2;
  const viewport = svgEl("g", {
    transform: `translate(${cx + handlers.panX} ${cy + handlers.panY}) scale(${handlers.scale}) translate(${-cx} ${-cy})`,
  });
  const group = svgEl("g", { transform: "scale(1 -1)" });
  viewport.append(group);
  svg.append(viewport);
  const overlay = handlers.overlay;
  if (overlay?.matrix) {
    const { a, b, c, d, e, f } = overlay.matrix;
    const image = svgEl("image", {
      href: overlay.href,
      width: String(overlay.width),
      height: String(overlay.height),
      opacity: String(overlay.opacity),
      transform: `matrix(${a} ${c} ${b} ${d} ${e} ${f})`,
    });
    group.append(image);
  }
  const stroke = Math.max(width, height) / 160;
  for (const shape of shapes) {
    const item = svgEl("g", {
      role: "button",
      tabindex: "0",
      "aria-label": `${shape.label} ${shape.featureId}`,
      "aria-pressed": handlers.selectedId === shape.featureId ? "true" : "false",
    });
    item.classList.add("map-shape");
    if (handlers.selectedId === shape.featureId) item.classList.add("is-selected");
    const select = () => handlers.onSelect(shape.featureId);
    item.addEventListener("click", select);
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select();
      }
    });
    const rendered = shape.points.map((point) => `${point[0]},${point[1]}`).join(" ");
    if (polygons.has(shape.kind) && shape.points.length >= 3) {
      const polygon = svgEl("polygon", { points: rendered, stroke: "currentColor", "stroke-width": String(stroke) });
      polygon.setAttribute("fill", shape.kind === "bay" ? (bayFill[shape.bayType ?? "general"] ?? "#e3c1b8") : "transparent");
      if (shape.kind !== "bay") polygon.setAttribute("stroke-dasharray", `${stroke * 1.6} ${stroke}`);
      item.append(polygon);
    } else if (shape.points.length >= 2) {
      const line = svgEl("polyline", { points: rendered, fill: "none", stroke: "currentColor", "stroke-width": String(stroke * 1.6) });
      if (shape.kind === "ramp" || shape.kind === "centreline") line.setAttribute("stroke-dasharray", `${stroke * 2} ${stroke}`);
      item.append(line);
    } else if (shape.points[0]) {
      const [x, y] = shape.points[0];
      item.append(svgEl("circle", { cx: String(x), cy: String(y), r: String(stroke * 1.8), fill: "none", stroke: "currentColor", "stroke-width": String(stroke) }));
    }
    group.append(item);
  }
}
