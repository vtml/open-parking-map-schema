#!/usr/bin/env python3
"""Build the OPMS data dictionary from schema/.

Writes DATA_DICTIONARY.md and docs/data-dictionary.html.
``--check`` exits 1 when those files differ from a fresh build.
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_DIR = ROOT / "schema"
MARKDOWN_PATH = ROOT / "DATA_DICTIONARY.md"
HTML_PATH = ROOT / "docs" / "data-dictionary.html"
GITHUB = "https://github.com/vtml/open-parking-map-schema/blob/main/"

# Same order as SPEC.md. Common definitions are placed in the section that introduces them.
SECTIONS = [
    (
        "layers",
        "3. Layers and profiles",
        "3-layers-and-profiles",
        [("dataset.schema.json", None)],
    ),
    (
        "conventions",
        "4. Conventions",
        "4-conventions",
        [
            ("common.schema.json", "Id"),
            ("common.schema.json", "Version"),
            ("common.schema.json", "DateTime"),
            ("common.schema.json", "TimeWindow"),
            ("common.schema.json", "VehicleLimits"),
            ("common.schema.json", "ExternalRefs"),
            ("common.schema.json", "Provenance"),
            ("common.schema.json", "Lifecycle"),
            ("common.schema.json", "Profile"),
        ],
    ),
    (
        "located-geometry",
        "4.1 Located geometry and verification",
        "41-located-geometry-and-verification-v03",
        [
            ("common.schema.json", "LocalPoint"),
            ("common.schema.json", "LocalPolygon"),
            ("common.schema.json", "Geometry"),
            ("common.schema.json", "Verification"),
            ("review.schema.json", None),
        ],
    ),
    (
        "static",
        "5. Static entities",
        "5-static-entities",
        [
            ("site.schema.json", None),
            ("frame.schema.json", None),
            ("facility.schema.json", None),
            ("level.schema.json", None),
            ("zone.schema.json", None),
            ("bay.schema.json", None),
            ("drive-node.schema.json", None),
            ("drive-edge.schema.json", None),
            ("access-point.schema.json", None),
            ("gate.schema.json", None),
            ("inter-facility-link.schema.json", None),
            ("localization-aid.schema.json", None),
            ("anchor-feature.schema.json", None),
            ("pillar-grid.schema.json", None),
            ("pillar.schema.json", None),
            ("lift.schema.json", None),
            ("stair-core.schema.json", None),
            ("wayfinding-aid.schema.json", None),
            ("safety-feature.schema.json", None),
        ],
    ),
    (
        "semantics",
        "6. Site semantics",
        "6-site-semantics-profile-static-rules",
        [
            ("pedestrian-portal.schema.json", None),
            ("destination.schema.json", None),
            ("destination-access.schema.json", None),
            ("handover-zone.schema.json", None),
            ("curb-segment.schema.json", None),
            ("rule.schema.json", None),
            ("rate.schema.json", None),
            ("accessible-path.schema.json", None),
        ],
    ),
    (
        "crowd",
        "7. Crowdsourcing model",
        "7-crowdsourcing-model",
        [
            ("common.schema.json", "Evidence"),
            ("contributor.schema.json", None),
            ("campaign.schema.json", None),
            ("contribution.schema.json", None),
            ("contribution-bundle.schema.json", None),
            ("feature-observation.schema.json", None),
            ("alignment-record.schema.json", None),
            ("conflict-case.schema.json", None),
            ("resolution-policy.schema.json", None),
            ("change-set.schema.json", None),
            ("common.schema.json", "QualityTier"),
            ("certification.schema.json", None),
        ],
    ),
    (
        "governance",
        "8. Governance",
        "8-governance-jurisdiction-routing-licence-consent-privacy",
        [
            ("jurisdiction.schema.json", None),
            ("repository.schema.json", None),
            ("registry.schema.json", None),
            ("common.schema.json", "LicenceTerms"),
            ("common.schema.json", "ApprovalStatus"),
            ("redaction-policy.schema.json", None),
        ],
    ),
    (
        "dynamic",
        "9. Dynamic layer and services",
        "9-dynamic-layer-and-services-optional",
        [
            ("occupancy-update.schema.json", None),
            ("closure.schema.json", None),
            ("dynamic-feed.schema.json", None),
        ],
    ),
    (
        "human",
        "12. Human-centred design and accessibility",
        "12-human-centred-design-and-accessibility",
        [
            ("common.schema.json", "BayAccessibility"),
            ("common.schema.json", "HandoverAccessibility"),
            ("common.schema.json", "PublicationTerms"),
            ("passenger-needs.schema.json", None),
            ("handover-requirements.schema.json", None),
        ],
    ),
]


def load_schemas() -> dict[str, dict]:
    return {
        path.name: json.loads(path.read_text(encoding="utf-8"))
        for path in sorted(SCHEMA_DIR.glob("*.schema.json"))
    }


def resolve_ref(ref: str, base: str, schemas: dict[str, dict]):
    file_name = base
    pointer = ref
    if "#" in ref:
        left, pointer = ref.split("#", 1)
        if left:
            file_name = left
    node = schemas.get(file_name)
    if not isinstance(node, dict):
        return None, file_name, ""
    def_name = ""
    if pointer.startswith("/"):
        parts = [piece.replace("~1", "/").replace("~0", "~") for piece in pointer.split("/") if piece]
        if len(parts) >= 2 and parts[0] == "$defs":
            def_name = parts[1]
        for part in parts:
            if not isinstance(node, dict) or part not in node:
                return None, file_name, def_name
            node = node[part]
    return node, file_name, def_name


def slug(text: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return value or "object"


def described(node) -> str:
    if isinstance(node, dict) and isinstance(node.get("description"), str):
        return node["description"].strip()
    return ""


def enum_values(node) -> list:
    if isinstance(node, dict) and isinstance(node.get("enum"), list):
        return node["enum"]
    items = node.get("items") if isinstance(node, dict) else None
    if isinstance(items, dict) and isinstance(items.get("enum"), list):
        return items["enum"]
    return []


def units_of(name: str, node: dict) -> str:
    parts: list[str] = []
    fmt = node.get("format")
    if fmt == "date-time":
        parts.append("RFC 3339")
    elif fmt == "uri":
        parts.append("URI")
    elif isinstance(fmt, str):
        parts.append(fmt)
    if name in {"lat", "lon"} or name.endswith("_deg") or name == "bbox_wgs84":
        parts.append("degrees")
    if name == "odometry_drift_m_per_100m":
        parts.append("m per 100 m")
    elif name.endswith("_kg"):
        parts.append("kg")
    elif name.endswith("_kw"):
        parts.append("kW")
    elif name.endswith("_pct"):
        parts.append("percent")
    elif name.endswith("_min"):
        parts.append("min")
    elif name.endswith("_s") and not name.endswith("_ids"):
        parts.append("s")
    elif name.endswith("_m"):
        parts.append("m")
    pattern = node.get("pattern")
    if name in {"start", "end"} and isinstance(pattern, str) and ":" in pattern:
        parts.append("HH:MM")
    values = enum_values(node)
    if values:
        shown = ", ".join(str(value) for value in values)
        parts.append("one of: " + shown)
    return "; ".join(dict.fromkeys(parts))


def example_of(node: dict, base: str, schemas: dict[str, dict]) -> str:
    examples = node.get("examples") if isinstance(node, dict) else None
    if isinstance(examples, list) and examples:
        return json.dumps(examples[0], ensure_ascii=False)
    if isinstance(node, dict) and "$ref" in node and set(node) <= {"$ref", "description"}:
        target, _, _ = resolve_ref(node["$ref"], base, schemas)
        if isinstance(target, dict) and isinstance(target.get("examples"), list) and target["examples"]:
            return json.dumps(target["examples"][0], ensure_ascii=False)
    return ""


def text_of(node: dict, base: str, schemas: dict[str, dict]) -> str:
    own = described(node)
    if own:
        return own
    if isinstance(node, dict) and "$ref" in node:
        target, _, _ = resolve_ref(node["$ref"], base, schemas)
        if isinstance(target, dict):
            return described(target)
    return ""


def conditional_required(node: dict) -> set[str]:
    found: set[str] = set()
    for branch in node.get("allOf") or []:
        if not isinstance(branch, dict):
            continue
        then = branch.get("then")
        if isinstance(then, dict):
            for name in then.get("required") or []:
                found.add(name)
    return found


class Catalog:
    def __init__(self, schemas: dict[str, dict]):
        self.schemas = schemas
        self.anchors: dict[tuple[str, str], str] = {}
        self.used: set[str] = set()
        self._claim_anchors()

    def _claim(self, file_name: str, def_name: str, label: str) -> str:
        base = slug(label)
        anchor = base
        n = 2
        while anchor in self.used:
            anchor = f"{base}-{n}"
            n += 1
        self.used.add(anchor)
        self.anchors[(file_name, def_name)] = anchor
        return anchor

    def _claim_anchors(self) -> None:
        for _sid, _title, _spec, entries in SECTIONS:
            for file_name, def_name in entries:
                schema = self._schema(file_name, def_name)
                label = def_name or schema.get("title") or file_name
                self._claim(file_name, def_name or "", label)

    def _schema(self, file_name: str, def_name: str | None) -> dict:
        doc = self.schemas[file_name]
        if def_name:
            return doc["$defs"][def_name]
        return doc

    def anchor_for_ref(self, ref: str, base: str) -> tuple[str, str] | None:
        _node, file_name, def_name = resolve_ref(ref, base, self.schemas)
        if not def_name:
            return None
        anchor = self.anchors.get((file_name, def_name))
        if not anchor:
            return None
        return def_name, anchor

    def type_html(self, node: dict, base: str, nested_anchor: str | None) -> str:
        return self._type(node, base, nested_anchor, html_mode=True)

    def type_md(self, node: dict, base: str, nested_anchor: str | None) -> str:
        return self._type(node, base, nested_anchor, html_mode=False)

    def _type(self, node: dict, base: str, nested_anchor: str | None, html_mode: bool) -> str:
        if not isinstance(node, dict):
            return ""
        if "$ref" in node:
            found = self.anchor_for_ref(node["$ref"], base)
            label = found[0] if found else node["$ref"].rsplit("/", 1)[-1]
            if found:
                return self._link(label, found[1], html_mode)
            return self._code(label, html_mode)
        if "enum" in node:
            return "enum"
        kind = node.get("type")
        if kind == "array":
            items = node.get("items")
            if isinstance(items, dict):
                inner = self._type(items, base, nested_anchor, html_mode)
                return f"array of {inner}" if inner else "array"
            return "array"
        if kind == "object" and isinstance(node.get("properties"), dict):
            if nested_anchor:
                return self._link("object", nested_anchor, html_mode)
            return "object"
        if isinstance(kind, list):
            return " or ".join(str(item) for item in kind)
        if isinstance(kind, str):
            return kind
        return ""

    def _link(self, label: str, anchor: str, html_mode: bool) -> str:
        if html_mode:
            return f'<a href="#{html.escape(anchor)}">{html.escape(label)}</a>'
        return f"[{label}](#{anchor})"

    def _code(self, label: str, html_mode: bool) -> str:
        if html_mode:
            return f"<code>{html.escape(label)}</code>"
        return f"`{label}`"


def nested_objects(node: dict, base: str, prefix: str, title_prefix: str) -> list[dict]:
    found = []
    props = node.get("properties") if isinstance(node, dict) else None
    if not isinstance(props, dict):
        props = {}
    for name, sub in props.items():
        targets = []
        if isinstance(sub, dict) and sub.get("type") == "object" and isinstance(sub.get("properties"), dict):
            targets.append((name, sub, f"{prefix}-{slug(name)}", f"{title_prefix}.{name}"))
        items = sub.get("items") if isinstance(sub, dict) else None
        if isinstance(items, dict) and items.get("type") == "object" and isinstance(items.get("properties"), dict):
            targets.append((name, items, f"{prefix}-{slug(name)}", f"{title_prefix}.{name} item"))
        for _name, child, anchor, title in targets:
            found.append({"anchor": anchor, "title": title, "node": child, "file": base, "children": nested_objects(child, base, anchor, title)})
    return found


def field_rows(node: dict, base: str, schemas: dict[str, dict], catalog: Catalog, child_anchors: dict[str, str]) -> list[dict]:
    props = node.get("properties") if isinstance(node, dict) else None
    if not isinstance(props, dict):
        return []
    required = set(node.get("required") or [])
    conditional = conditional_required(node)
    rows = []
    for name, sub in props.items():
        if not isinstance(sub, dict):
            continue
        if name in required:
            req = "required"
        elif name in conditional:
            req = "conditional"
        else:
            req = "optional"
        nested = child_anchors.get(name)
        rows.append(
            {
                "name": name,
                "type_html": catalog.type_html(sub, base, nested),
                "type_md": catalog.type_md(sub, base, nested),
                "required": req,
                "units": units_of(name, sub),
                "description": text_of(sub, base, schemas),
                "example": example_of(sub, base, schemas),
            }
        )
    return rows


def md_cell(value: str) -> str:
    return value.replace("|", "\\|").replace("\n", " ").strip() or "—"


def render_markdown(catalog: Catalog) -> str:
    lines = [
        "# OPMS data dictionary",
        "",
        "Generated from `schema/` by `tools/build_data_dictionary.py`. Do not edit by hand.",
        "",
        "This is a **v0.3 draft for discussion**. It is not a published standard and no organisation has endorsed it. Examples are fictional. Validation rules are unchanged by these descriptions.",
        "",
        "Fields are grouped in the same order as [SPEC.md](SPEC.md). A type that links to another object is a `$ref` or a nested object.",
        "",
    ]
    for sid, title, spec, entries in SECTIONS:
        lines.append(f"## {title}")
        lines.append("")
        lines.append(f"[SPEC.md section](SPEC.md#{spec})")
        lines.append("")
        for file_name, def_name in entries:
            schema = catalog._schema(file_name, def_name)
            anchor = catalog.anchors[(file_name, def_name or "")]
            label = def_name or schema.get("title") or file_name
            lines.extend(object_markdown(catalog, file_name, schema, anchor, label, spec, 3))
        lines.append("")
    lines.append("## Licence")
    lines.append("")
    lines.append("Specification text, including this dictionary: [CC BY 4.0](LICENSE-CC-BY-4.0). Schemas and the generator: [Apache-2.0](LICENSE-APACHE-2.0).")
    lines.append("")
    return "\n".join(lines)


def object_markdown(catalog: Catalog, file_name: str, node: dict, anchor: str, title: str, spec: str, level: int) -> list[str]:
    children = nested_objects(node, file_name, anchor, title)
    child_anchors = {}
    for child in children:
        short = child["title"].rsplit(".", 1)[-1]
        short = short.removesuffix(" item")
        child_anchors[short] = child["anchor"]
    rows = field_rows(node, file_name, catalog.schemas, catalog, child_anchors)
    heading = "#" * level
    lines = [
        f"{heading} {title}",
        "",
        f'<a id="{anchor}"></a>',
        "",
    ]
    description = described(node)
    if description:
        lines.append(description)
        lines.append("")
    lines.append(f"Schema: [`schema/{file_name}`](schema/{file_name}). [SPEC section](SPEC.md#{spec}).")
    lines.append("")
    if rows:
        lines.append("| Name | Type | Required | Units / format | Description | Example |")
        lines.append("|---|---|---|---|---|---|")
        for row in rows:
            lines.append(
                "| {name} | {type} | {required} | {units} | {description} | {example} |".format(
                    name=f"`{row['name']}`",
                    type=md_cell(row["type_md"]),
                    required=row["required"],
                    units=md_cell(row["units"]),
                    description=md_cell(row["description"]),
                    example=md_cell(f"`{row['example']}`" if row["example"] else ""),
                )
            )
        lines.append("")
    elif "enum" in node:
        lines.append("Allowed values: " + ", ".join(f"`{value}`" for value in node["enum"]) + ".")
        lines.append("")
    for child in children:
        lines.extend(object_markdown(catalog, file_name, child["node"], child["anchor"], child["title"], spec, min(level + 1, 6)))
    return lines


NAV = """
        <nav aria-label="Primary">
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="spec.html">Spec</a></li>
            <li><a href="data-dictionary.html" aria-current="page">Data dictionary</a></li>
            <li><a href="example.html">Example</a></li>
            <li><a href="explorer.html">Explorer</a></li>
            <li><a href="get-involved.html">Get involved</a></li>
          </ul>
        </nav>
"""


def render_html(catalog: Catalog) -> str:
    parts = [
        """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OPMS data dictionary (v0.3 draft)</title>
  <meta name="description" content="Field-by-field data dictionary for the Open Parking Map Schema, generated from the JSON Schemas.">
  <link rel="stylesheet" href="assets/style.css">
  <script>
    (function () {
      try {
        var stored = localStorage.getItem("opms-theme");
        if (stored === "light" || stored === "dark") {
          document.documentElement.setAttribute("data-theme", stored);
        }
      } catch (e) {}
    })();
  </script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="index.html">
        <span class="brand-mark">OPMS</span>
        <span class="brand-text">
          <span class="brand-name">Open Parking Map Schema</span>
          <span class="brand-version">v0.3 draft</span>
        </span>
      </a>
      <div class="header-tools">
""",
        NAV,
        """
        <button type="button" class="theme-toggle" data-theme-toggle>Theme</button>
      </div>
    </div>
  </header>
  <main id="main" class="wide">
    <p class="kicker">Draft for discussion</p>
    <h1>Data dictionary</h1>
    <p class="lede">Every object and field in the OPMS schemas, in the same order as the specification. Generated from <code>schema/</code>. Do not edit this page by hand.</p>
    <aside class="status">
      <p><strong>This is a v0.3 draft.</strong> It is not a published standard. No organisation has endorsed it. Examples are fictional. Descriptions do not change validation.</p>
    </aside>
    <div class="filter-bar">
      <div>
        <label for="field-filter">Filter fields</label>
        <input id="field-filter" type="search" placeholder="Name, type, or description" autocomplete="off">
      </div>
      <p id="filter-status" role="status" class="muted"></p>
    </div>
    <h2>Contents</h2>
    <ul>
""",
    ]
    for sid, title, _spec, _entries in SECTIONS:
        parts.append(f'      <li><a href="#{html.escape(sid)}">{html.escape(title)}</a></li>\n')
    parts.append("    </ul>\n")
    for sid, title, spec, entries in SECTIONS:
        spec_url = GITHUB + "SPEC.md#" + spec
        parts.append(f'    <section id="{html.escape(sid)}" data-section>\n')
        parts.append(f"      <h2>{html.escape(title)}</h2>\n")
        parts.append(f'      <p class="prose"><a href="{html.escape(spec_url)}">SPEC.md section</a></p>\n')
        for file_name, def_name in entries:
            schema = catalog._schema(file_name, def_name)
            anchor = catalog.anchors[(file_name, def_name or "")]
            label = def_name or schema.get("title") or file_name
            parts.append(object_html(catalog, file_name, schema, anchor, label, spec, 3))
        parts.append("    </section>\n")
    parts.append(
        """    <h2>Licence</h2>
    <p class="prose">Specification text, including this dictionary: <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Schemas and the generator: <a href="https://www.apache.org/licenses/LICENSE-2.0">Apache-2.0</a>.</p>
  </main>
  <footer class="site-footer">
    <div class="footer-inner">
      <p>OPMS v0.3 is a draft for discussion. No organisation has endorsed it. Example places, roads and organisations are fictional.</p>
      <p>Text and documentation: <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Schemas, examples and code: <a href="https://www.apache.org/licenses/LICENSE-2.0">Apache-2.0</a>.</p>
      <p><a href="https://github.com/vtml/open-parking-map-schema">Repository on GitHub</a></p>
    </div>
  </footer>
  <script src="assets/site.js"></script>
  <script>
    (function () {
      var input = document.getElementById("field-filter");
      var status = document.getElementById("filter-status");
      function rowsOf(article) {
        var table = article.querySelector(":scope > .table-wrap tbody");
        return table ? Array.prototype.slice.call(table.rows) : [];
      }
      function apply() {
        var q = input.value.trim().toLowerCase();
        var shown = 0;
        var total = 0;
        var articles = Array.prototype.slice.call(document.querySelectorAll("[data-object]"));
        articles.forEach(function (article) {
          var heading = (article.getAttribute("data-title") || "").toLowerCase();
          var desc = article.querySelector(":scope > .object-desc");
          var blob = heading + " " + (desc ? desc.textContent.toLowerCase() : "");
          var headingMatch = !q || blob.indexOf(q) !== -1;
          var any = false;
          rowsOf(article).forEach(function (row) {
            total += 1;
            var ok = headingMatch || row.textContent.toLowerCase().indexOf(q) !== -1;
            row.hidden = !ok;
            if (ok) { any = true; shown += 1; }
          });
          if (!rowsOf(article).length) any = headingMatch;
          article.hidden = !any;
        });
        articles.forEach(function (article) {
          if (article.querySelector("[data-object]:not([hidden])")) article.hidden = false;
        });
        document.querySelectorAll("[data-section]").forEach(function (section) {
          section.hidden = !section.querySelector("[data-object]:not([hidden])");
        });
        status.textContent = q ? (shown + " of " + total + " fields match") : (total + " fields");
      }
      input.addEventListener("input", apply);
      apply();
    })();
  </script>
</body>
</html>
"""
    )
    return "".join(parts)


def object_html(catalog: Catalog, file_name: str, node: dict, anchor: str, title: str, spec: str, level: int) -> str:
    children = nested_objects(node, file_name, anchor, title)
    child_anchors = {}
    for child in children:
        short = child["title"].rsplit(".", 1)[-1].removesuffix(" item")
        child_anchors[short] = child["anchor"]
    rows = field_rows(node, file_name, catalog.schemas, catalog, child_anchors)
    tag = "h3" if level <= 3 else "h4"
    spec_url = GITHUB + "SPEC.md#" + spec
    file_url = GITHUB + "schema/" + file_name
    description = described(node)
    chunks = [
        f'      <article id="{html.escape(anchor)}" class="dict-object" data-object data-title="{html.escape(title)}">\n',
        f"        <{tag}>{html.escape(title)}</{tag}>\n",
    ]
    if description:
        chunks.append(f'        <p class="object-desc prose">{html.escape(description)}</p>\n')
    else:
        chunks.append('        <p class="object-desc prose visually-hidden">No extra description.</p>\n')
    chunks.append(
        f'        <p class="meta prose"><a href="{html.escape(file_url)}"><code>schema/{html.escape(file_name)}</code></a>'
        f' · <a href="{html.escape(spec_url)}">SPEC.md section</a></p>\n'
    )
    if rows:
        chunks.append('        <div class="table-wrap">\n')
        chunks.append(f'          <table>\n            <caption>Fields of {html.escape(title)}</caption>\n')
        chunks.append("            <thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Units / format</th><th>Description</th><th>Example</th></tr></thead>\n")
        chunks.append("            <tbody>\n")
        for row in rows:
            example = f"<code>{html.escape(row['example'])}</code>" if row["example"] else "—"
            chunks.append(
                "              <tr>"
                f"<td><code>{html.escape(row['name'])}</code></td>"
                f"<td>{row['type_html'] or '—'}</td>"
                f"<td>{html.escape(row['required'])}</td>"
                f"<td>{html.escape(row['units']) or '—'}</td>"
                f"<td>{html.escape(row['description']) or '—'}</td>"
                f"<td>{example}</td>"
                "</tr>\n"
            )
        chunks.append("            </tbody>\n          </table>\n        </div>\n")
    elif "enum" in node:
        values = ", ".join(f"<code>{html.escape(str(value))}</code>" for value in node["enum"])
        chunks.append(f"        <p class=\"prose\">Allowed values: {values}.</p>\n")
    for child in children:
        chunks.append(object_html(catalog, file_name, child["node"], child["anchor"], child["title"], spec, level + 1))
    chunks.append("      </article>\n")
    return "".join(chunks)


def build() -> tuple[str, str]:
    schemas = load_schemas()
    assigned = {name for _sid, _title, _spec, entries in SECTIONS for file_name, name in entries if name}
    defined = set(schemas["common.schema.json"]["$defs"])
    if assigned != defined:
        missing = sorted(defined - assigned)
        extra = sorted(assigned - defined)
        raise SystemExit(f"common $defs grouping mismatch missing={missing} extra={extra}")
    used_files = {file_name for _s, _t, _p, entries in SECTIONS for file_name, _name in entries}
    all_files = set(schemas)
    if used_files != all_files:
        raise SystemExit(f"schema files not grouped: {sorted(all_files - used_files)}")
    catalog = Catalog(schemas)
    return render_markdown(catalog), render_html(catalog)


def write() -> None:
    markdown, page = build()
    MARKDOWN_PATH.write_text(markdown, encoding="utf-8")
    HTML_PATH.write_text(page, encoding="utf-8")
    print(f"wrote {MARKDOWN_PATH.relative_to(ROOT)}")
    print(f"wrote {HTML_PATH.relative_to(ROOT)}")


def dictionaries_match() -> bool:
    markdown, page = build()
    if not MARKDOWN_PATH.is_file() or not HTML_PATH.is_file():
        return False
    return MARKDOWN_PATH.read_text(encoding="utf-8") == markdown and HTML_PATH.read_text(encoding="utf-8") == page


def main(argv: list[str] | None = None) -> int:
    args = argv if argv is not None else sys.argv
    if "--check" in args:
        if dictionaries_match():
            print("data dictionary: up to date")
            print("RESULT: PASS")
            return 0
        print("data dictionary: stale (run python tools/build_data_dictionary.py)")
        print("RESULT: FAIL")
        return 1
    write()
    print("RESULT: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
