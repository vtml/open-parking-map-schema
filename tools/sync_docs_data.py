#!/usr/bin/env python3
"""Copy explorer data into docs/data for GitHub Pages.

Pages for this repository is published from /docs only, so the explorer
cannot fetch /examples or /schema from the site. This script copies the
two map examples and bundles every schema file.

    python tools/sync_docs_data.py           # write docs/data
    python tools/sync_docs_data.py --check   # fail if docs/data is stale

Licence: Apache-2.0
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_DIR = ROOT / "schema"
EXAMPLE_DIR = ROOT / "examples"
OUT = ROOT / "docs" / "data"
EXAMPLES = (
    "simple-carpark-dataset.json",
    "merriwa-park-dataset.json",
)


def bundle():
    out = {}
    for path in sorted(SCHEMA_DIR.glob("*.schema.json")):
        out[path.name] = json.loads(path.read_text(encoding="utf-8"))
    return out


def example_bytes(name):
    return (EXAMPLE_DIR / name).read_bytes()


def write():
    (OUT / "examples").mkdir(parents=True, exist_ok=True)
    for name in EXAMPLES:
        (OUT / "examples" / name).write_bytes(example_bytes(name))
    text = json.dumps(bundle(), indent=2) + "\n"
    (OUT / "schemas.json").write_text(text, encoding="utf-8")


def check():
    problems = []
    for name in EXAMPLES:
        dest = OUT / "examples" / name
        if not dest.is_file() or dest.read_bytes() != example_bytes(name):
            problems.append(f"docs/data/examples/{name} does not match examples/{name}")
    dest = OUT / "schemas.json"
    if not dest.is_file():
        problems.append("docs/data/schemas.json is missing")
    else:
        got = json.loads(dest.read_text(encoding="utf-8"))
        fresh = bundle()
        if got != fresh:
            problems.append("docs/data/schemas.json does not match schema/")
    if problems:
        print("docs data is stale. Run: python tools/sync_docs_data.py")
        for item in problems:
            print(" ", item)
        return 1
    print("docs/data matches examples/ and schema/")
    return 0


if __name__ == "__main__":
    if "--check" in sys.argv:
        sys.exit(check())
    write()
    print(f"wrote {OUT}")
