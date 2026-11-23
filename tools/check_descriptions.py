#!/usr/bin/env python3
"""Fail if any OPMS property schema lacks a plain-English description.

Walks every file in schema/, including $defs, nested properties, items,
additionalProperties, and allOf/anyOf/oneOf/if/then/else branches.

A property schema must have a non-empty description, except:

* it is a pure ``$ref`` (no other keywords) whose target definition has a
  description, or
* it only re-constrains a property inside an ``if``, ``then`` or ``else``
  branch.

Empty pattern-property schemas (the ``x_`` extension slot) are not fields.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_DIR = ROOT / "schema"


def load_schemas(schema_dir: Path) -> dict[str, dict]:
    return {
        path.name: json.loads(path.read_text(encoding="utf-8"))
        for path in sorted(schema_dir.glob("*.schema.json"))
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
        return None
    if pointer.startswith("/"):
        for part in [piece for piece in pointer.split("/") if piece]:
            part = part.replace("~1", "/").replace("~0", "~")
            if not isinstance(node, dict) or part not in node:
                return None
            node = node[part]
    return node


def described(node) -> bool:
    return isinstance(node, dict) and isinstance(node.get("description"), str) and bool(node["description"].strip())


def pure_ref(node) -> bool:
    return isinstance(node, dict) and "$ref" in node and set(node) <= {"$ref"}


def target_described(node, base: str, schemas: dict[str, dict]) -> bool:
    target = resolve_ref(node["$ref"], base, schemas)
    return described(target)


def find_missing(schema_dir: Path = SCHEMA_DIR) -> tuple[list[str], int]:
    """Return (missing paths, number of property schemas that must be described)."""
    schemas = load_schemas(schema_dir)
    missing: list[str] = []
    required = 0

    def consider(props, base: str, trail: list[str], conditional: bool) -> None:
        nonlocal required
        if not isinstance(props, dict):
            return
        for name, sub in props.items():
            if not isinstance(sub, dict):
                continue
            path = f"{base}::{'/'.join(trail + [name])}"
            if conditional:
                walk(sub, base, trail + [name], True)
                continue
            if not sub:
                walk(sub, base, trail + [name], False)
                continue
            required += 1
            if described(sub):
                pass
            elif pure_ref(sub) and target_described(sub, base, schemas):
                pass
            else:
                missing.append(path)
            walk(sub, base, trail + [name], False)

    def walk(node, base: str, trail: list[str], conditional: bool) -> None:
        if not isinstance(node, dict):
            return
        if pure_ref(node):
            return
        consider(node.get("properties"), base, trail, conditional)
        pattern = node.get("patternProperties")
        if isinstance(pattern, dict):
            for name, sub in pattern.items():
                if isinstance(sub, dict) and sub:
                    consider({name: sub}, base, trail + ["patternProperties"], conditional)
                elif isinstance(sub, dict):
                    walk(sub, base, trail + ["patternProperties", name], conditional)
        for key in ("items", "additionalProperties", "unevaluatedProperties", "contains", "not"):
            child = node.get(key)
            if isinstance(child, dict):
                walk(child, base, trail + [key], conditional)
            elif isinstance(child, list):
                for index, sub in enumerate(child):
                    if isinstance(sub, dict):
                        walk(sub, base, trail + [key, str(index)], conditional)
        prefix = node.get("prefixItems")
        if isinstance(prefix, list):
            for index, sub in enumerate(prefix):
                if isinstance(sub, dict):
                    walk(sub, base, trail + ["prefixItems", str(index)], conditional)
        if isinstance(node.get("if"), dict):
            walk(node["if"], base, trail + ["if"], True)
        for key in ("then", "else"):
            if isinstance(node.get(key), dict):
                walk(node[key], base, trail + [key], True)
        for key in ("allOf", "anyOf", "oneOf"):
            child = node.get(key)
            if isinstance(child, list):
                for index, sub in enumerate(child):
                    if isinstance(sub, dict):
                        walk(sub, base, trail + [key, str(index)], conditional)
        dependent = node.get("dependentSchemas")
        if isinstance(dependent, dict):
            for name, sub in dependent.items():
                if isinstance(sub, dict):
                    walk(sub, base, trail + ["dependentSchemas", name], conditional)
        defs = node.get("$defs")
        if isinstance(defs, dict) and not trail:
            for name, sub in defs.items():
                if isinstance(sub, dict):
                    walk(sub, base, [f"$defs/{name}"], False)

    for name, doc in schemas.items():
        walk(doc, name, [], False)
    return missing, required


def main(argv: list[str] | None = None) -> int:
    missing, required = find_missing()
    covered = required - len(missing)
    percent = 100.0 if required == 0 else (100.0 * covered / required)
    print(f"property schemas: {required}")
    print(f"described or exempt: {covered}")
    print(f"missing: {len(missing)}")
    print(f"coverage: {percent:.0f}%")
    if missing:
        for path in missing:
            print(f"MISSING {path}")
        print("RESULT: FAIL")
        return 1
    print("RESULT: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
