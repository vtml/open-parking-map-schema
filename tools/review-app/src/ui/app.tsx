import { useEffect, useMemo, useState } from "preact/hooks";
import simpleExample from "../../../../examples/simple-carpark-dataset.json";
import merriwaExample from "../../../../examples/merriwa-park-dataset.json";
import { browserSchemaValidator } from "../adapters/browser-schemas";
import { browserStorage } from "../adapters/local-storage";
import { drawMap } from "../adapters/svg-map";
import {
  alignControlPoints,
  exportReview,
  importReview,
  levelView,
  loadDataset,
  recordVerification,
} from "../application/review-session";
import type { DatasetModel } from "../domain/dataset";
import type { ValidationIssue } from "../domain/validation-rules";
import type { ReviewerRole, VerificationStatus } from "../domain/verification";
import { basemapOffered, osmTileUrl } from "../domain/basemap";
import type { ControlPoint } from "../domain/transform";

const clock = { now: () => new Date().toISOString() };
const storage = browserStorage();

function draftKey(dataset: DatasetModel): string {
  return `opms-review:${dataset.siteId}:${dataset.datasetVersion}`;
}

export function App() {
  const schemas = useMemo(() => browserSchemaValidator(), []);
  const [dataset, setDataset] = useState<DatasetModel | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [levelId, setLevelId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [role, setRole] = useState<ReviewerRole>("owner");
  const [organisation, setOrganisation] = useState("");
  const [note, setNote] = useState("");
  const [evidence, setEvidence] = useState("");
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [overlayUrl, setOverlayUrl] = useState("");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [opacity, setOpacity] = useState(0.45);
  const [points, setPoints] = useState<ControlPoint[]>([]);
  const [imageX, setImageX] = useState("0");
  const [imageY, setImageY] = useState("0");
  const [placing, setPlacing] = useState(false);
  const [basemap, setBasemap] = useState(false);
  const [message, setMessage] = useState("");

  const view = dataset && levelId ? levelView(dataset, levelId) : null;
  const level = dataset?.levels.find((item) => item.id === levelId);
  const matrix = points.length >= 2 ? safeAlign(points) : null;

  useEffect(() => {
    const svg = document.querySelector<SVGSVGElement>("#park-map");
    if (!svg || !view) return;
    drawMap(svg, view.shapes, {
      scale,
      panX: pan.x,
      panY: pan.y,
      overlay: overlayUrl && imageSize.width ? { href: overlayUrl, width: imageSize.width, height: imageSize.height, opacity, matrix } : null,
      selectedId,
      onSelect: (id) => {
        if (placing) {
          const feature = dataset?.features.find((item) => item.id === id);
          const point = feature?.shapes[0]?.points[0];
          if (point) {
            setPoints((current) => [...current, { image: [Number(imageX), Number(imageY)], map: [point[0], point[1]] }].slice(0, 3) as ControlPoint[]);
            setPlacing(false);
          }
          return;
        }
        setSelectedId(id);
      },
    });
  }, [view, scale, pan, selectedId, placing, imageX, imageY, dataset, overlayUrl, imageSize, opacity, matrix]);

  function openRaw(raw: unknown) {
    const loaded = loadDataset(raw, schemas);
    setIssues(loaded.issues);
    setDataset(loaded.dataset);
    setLevelId(loaded.dataset?.levels[0]?.id ?? "");
    setSelectedId("");
    setBasemap(false);
    setPoints([]);
    if (!loaded.dataset) return;
    const saved = storage.load(draftKey(loaded.dataset));
    if (!saved) return;
    try {
      const draft = JSON.parse(saved) as { review?: unknown };
      if (!draft.review) return;
      const restored = importReview(loaded.dataset, draft.review, schemas);
      if (restored.issues.length === 0) {
        setDataset(restored.dataset);
        setMessage("Restored the review saved in this browser.");
      }
    } catch {
      setMessage("A saved review was found but could not be read.");
    }
  }

  function persist(next: DatasetModel) {
    if (!organisation.trim()) return;
    const review = exportReview(next, { role, organisation: organisation.trim() }, clock);
    storage.save(draftKey(next), JSON.stringify({ review }));
  }

  function mark(status: VerificationStatus) {
    if (!dataset || !selectedId) return;
    const next = recordVerification(dataset, selectedId, {
      role,
      status,
      note: note.trim() || undefined,
      evidenceRef: evidence.trim() || undefined,
    }, clock);
    setDataset(next);
    persist(next);
  }

  async function onFile(file: File) {
    openRaw(JSON.parse(await file.text()) as unknown);
  }

  const groups = groupChecklist(dataset);
  const tile = basemap && level && basemapOffered(level.openAir) && dataset?.frameOrigin
    ? osmTileUrl(dataset.frameOrigin.lat, dataset.frameOrigin.lon)
    : "";

  return (
    <>
      <header>
        <a class="brand" href="../index.html">OPMS <span class="draft">Check my car park · v0.3 draft</span></a>
        <button type="button" onClick={() => {
          const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
          document.documentElement.setAttribute("data-theme", next);
        }}>Theme</button>
      </header>
      <main>
        <h1>Check my car park</h1>
        <p class="banner"><strong>v0.3 draft tool.</strong> Nothing is uploaded. Files stay in this browser. Example car parks are fictional, and no organisation has endorsed this draft. The organisation field must not be a person's name.</p>
        <section class="panel drop" onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer?.files?.[0];
          if (file) void onFile(file);
        }}>
          <div class="toolbar">
            <label>Dataset JSON<input type="file" accept="application/json,.json" onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) void onFile(file);
            }} /></label>
            <button type="button" onClick={() => openRaw(simpleExample)}>Open simple example</button>
            <button type="button" onClick={() => openRaw(merriwaExample)}>Open Merriwa Park example</button>
          </div>
          <p class="muted">Or drop a dataset file here.</p>
        </section>
        {message ? <p role="status">{message}</p> : null}
        {dataset ? (
          <div class="layout">
            <section class="panel" aria-labelledby="map-heading">
              <h2 id="map-heading">{dataset.siteName}</h2>
              <div class="toolbar">
                <label>Level
                  <select value={levelId} onChange={(event) => setLevelId(event.currentTarget.value)}>
                    {dataset.levels.map((item) => <option key={item.id} value={item.id}>{item.facilityName} · {item.label}</option>)}
                  </select>
                </label>
                <button type="button" onClick={() => setScale((value) => value * 1.2)}>Zoom in</button>
                <button type="button" onClick={() => setScale((value) => value / 1.2)}>Zoom out</button>
                <button type="button" onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }}>Reset view</button>
                <button type="button" onClick={() => setPan((value) => ({ ...value, x: value.x - 8 }))}>Pan west</button>
                <button type="button" onClick={() => setPan((value) => ({ ...value, x: value.x + 8 }))}>Pan east</button>
              </div>
              <div class="map-wrap">
                {tile ? <p class="muted">OpenStreetMap tile for the frame origin, loaded because you opted in. It is not warped onto the drawing. © OpenStreetMap contributors.</p> : null}
                {tile ? <img alt="OpenStreetMap tile for the frame origin" src={tile} style={{ maxWidth: "12rem", opacity }} /> : null}
                <svg id="park-map" role="group" aria-label="Car park level"></svg>
              </div>
              <p class="muted">North is up. Dashed lines are paths, ramps or zone edges. Select a shape with Tab and Enter.</p>
              <ul>
                <li>Grey G general, blue A accessible, green EV, amber F family</li>
                <li>Solid lines are aisles and thresholds. Circles are points.</li>
              </ul>
              <details>
                <summary>Text list of this level</summary>
                <ul>{viewText(dataset, levelId).map((line) => <li key={line}>{line}</li>)}</ul>
              </details>
              <h3>Reference image</h3>
              <div class="row">
                <label>Floor plan<input type="file" accept="image/*" onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  if (!file) return;
                  const url = URL.createObjectURL(file);
                  const img = new Image();
                  img.onload = () => setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
                  img.src = url;
                  setOverlayUrl(url);
                  setPoints([]);
                }} /></label>
                <label>Opacity <input type="range" min="0" max="1" step="0.05" value={opacity} onInput={(event) => setOpacity(Number(event.currentTarget.value))} /></label>
                {level && basemapOffered(level.openAir) ? (
                  <label>OSM basemap (off by default, loads tiles only if checked)
                    <input type="checkbox" checked={basemap} onChange={(event) => setBasemap(event.currentTarget.checked)} />
                  </label>
                ) : <p class="muted">A basemap is only offered for open-air or roof levels, and only if you opt in.</p>}
              </div>
              <div class="row">
                <label>Image x <input value={imageX} onInput={(event) => setImageX(event.currentTarget.value)} /></label>
                <label>Image y <input value={imageY} onInput={(event) => setImageY(event.currentTarget.value)} /></label>
                <button type="button" onClick={() => setPlacing((value) => !value)}>{placing ? "Click a map feature to store its point" : "Add control point"}</button>
              </div>
              <p class="muted">{points.length} control point(s). Two points set scale, rotation and position. A third adds shear.</p>
              {issues.length ? (
                <div class="issues">
                  <h3>Checks</h3>
                  {issues.map((item) => (
                    <button type="button" key={`${item.path}-${item.message}`} onClick={() => item.featureId && setSelectedId(item.featureId)}>{item.message}</button>
                  ))}
                </div>
              ) : <p>No dataset problems found.</p>}
            </section>
            <section class="panel" aria-labelledby="review-heading">
              <h2 id="review-heading">Review</h2>
              <p>{dataset.progress.confirmed} confirmed, {dataset.progress.incorrect} incorrect, {dataset.progress.missing} missing, {dataset.progress.unchecked} not checked, of {dataset.progress.total}.</p>
              {dataset.facilities.map((facility) => <p key={facility.id}>{facility.name}: {facility.tierExplanation.summary}</p>)}
              <label>Role
                <select value={role} onChange={(event) => setRole(event.currentTarget.value as ReviewerRole)}>
                  <option value="owner">Owner</option>
                  <option value="operator">Operator</option>
                  <option value="authority">Authority</option>
                  <option value="crowd">Crowd</option>
                </select>
              </label>
              <label>Organisation
                <input value={organisation} onInput={(event) => setOrganisation(event.currentTarget.value)} placeholder="Organisation, not a person's name" />
              </label>
              <label>Note
                <input value={note} onInput={(event) => setNote(event.currentTarget.value)} />
              </label>
              <label>Evidence reference
                <input value={evidence} onInput={(event) => setEvidence(event.currentTarget.value)} placeholder="Optional audit id or URL" />
              </label>
              <div class="toolbar">
                <button type="button" disabled={!selectedId} onClick={() => mark("confirmed")}>Confirmed</button>
                <button type="button" disabled={!selectedId} onClick={() => mark("incorrect")}>Incorrect</button>
                <button type="button" disabled={!selectedId} onClick={() => mark("missing")}>Missing</button>
              </div>
              <h3>Accessibility</h3>
              <Checklist features={dataset.features.filter((feature) => feature.accessible)} selectedId={selectedId} onSelect={setSelectedId} />
              <h3>All features</h3>
              {groups.map((group) => (
                <details key={group.name} open>
                  <summary>{group.name}</summary>
                  <Checklist features={group.features} selectedId={selectedId} onSelect={setSelectedId} />
                </details>
              ))}
              <div class="toolbar">
                <button type="button" disabled={!organisation.trim()} onClick={() => download(exportReview(dataset, { role, organisation: organisation.trim() }, clock))}>Export review</button>
                <label>Import review<input type="file" accept="application/json,.json" onChange={async (event) => {
                  const file = event.currentTarget.files?.[0];
                  if (!file || !dataset) return;
                  const restored = importReview(dataset, JSON.parse(await file.text()) as unknown, schemas);
                  setIssues(restored.issues);
                  setDataset(restored.dataset);
                }} /></label>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </>
  );
}

function viewText(dataset: DatasetModel, levelId: string): string[] {
  return levelView(dataset, levelId).textAlternative;
}

function groupChecklist(dataset: DatasetModel | null): Array<{ name: string; features: DatasetModel["features"] }> {
  if (!dataset) return [];
  const groups = new Map<string, DatasetModel["features"]>();
  for (const feature of dataset.features) {
    const facility = dataset.facilities.find((item) => item.id === feature.facilityId)?.name ?? "Site";
    const level = dataset.levels.find((item) => feature.levelIds.includes(item.id))?.label ?? "Unassigned";
    const name = `${facility} · ${level} · ${feature.type.replaceAll("_", " ")}`;
    groups.set(name, [...(groups.get(name) ?? []), feature]);
  }
  return [...groups.entries()].map(([name, features]) => ({ name, features }));
}

function Checklist(props: { features: DatasetModel["features"]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div class="check">
      {props.features.map((feature) => {
        const status = feature.verifications.at(-1)?.status ?? "not checked";
        return (
          <button type="button" key={feature.id} aria-current={props.selectedId === feature.id ? "true" : undefined} onClick={() => props.onSelect(feature.id)}>
            {feature.label} ({feature.id}) · {status}
          </button>
        );
      })}
    </div>
  );
}

function download(review: unknown) {
  const blob = new Blob([JSON.stringify(review, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "opms-review.json";
  link.click();
  URL.revokeObjectURL(url);
}

function safeAlign(points: ControlPoint[]) {
  try {
    return alignControlPoints(points);
  } catch {
    return null;
  }
}
