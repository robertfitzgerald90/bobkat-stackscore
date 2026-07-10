from __future__ import annotations

import json
import os
import re
import urllib.parse
from collections import defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DOCS = REPO / "docs"
md_files = sorted(DOCS.rglob("*.md"))

by_base: dict[str, list[str]] = defaultdict(list)
for p in DOCS.rglob("*"):
    if p.is_file():
        rel = p.relative_to(DOCS).as_posix()
        by_base[p.name].append(rel)


def norm_name(name: str) -> str:
    return name.replace("\u2013", "-").replace("\u2014", "-")


by_base_norm: dict[str, list[str]] = defaultdict(list)
for name, paths in by_base.items():
    by_base_norm[norm_name(name)].extend(paths)

ALIASES: dict[str, list[str]] = {
    norm_name("DOC-002 - Product Philosophy.md"): by_base.get(
        "DOC-002-Product Philosophy.md", []
    ),
    norm_name("DOC-111 \u2013 Scoring Engine Specification.md"): by_base.get(
        "DOC-111 \u2013 Scoring Engine Specific.md", []
    ),
    norm_name("DOC-111B - Scoring Engine Specification.md"): by_base.get(
        "DOC-111B - Scoring Methodology Reference.md", []
    ),
    norm_name("DOC-302 \u2013 API Specification.md"): by_base.get(
        "DOC-302 - API Specification.md", []
    ),
}

link_re = re.compile(r"(!?\[[^\]]*\]\()([^)#]+)(#[^)]*)?(\))")


def resolve_target_rel(decoded: str) -> str | None:
    decoded = decoded.strip()
    if not decoded:
        return None

    base = Path(decoded).name
    nbase = norm_name(base)

    if "Bobkat Technology Improvement Lifecycle (BTIL" in decoded:
        for name, paths in by_base.items():
            if name.startswith("DOC-003"):
                return paths[0]

    if "Assessment Question Bank (v1 Legacy" in decoded:
        for name, paths in by_base.items():
            if name.startswith("DOC-117"):
                return paths[0]

    if decoded.endswith("RecommendationRuleCatalog.json") or decoded == "RecommendationRuleCatalog.json":
        rel = "70-Data/RecommendationRuleCatalog.json"
        if (DOCS / rel).exists():
            return rel

    alias_paths = ALIASES.get(nbase, [])
    if len(alias_paths) == 1:
        return alias_paths[0]

    paths = by_base.get(base) or by_base_norm.get(nbase, [])
    if len(paths) == 1:
        return paths[0]
    return None


def encode_href(rel_path: str) -> str:
    return urllib.parse.quote(rel_path, safe="/&")


def link_exists(source: Path, href: str) -> bool:
    raw = href.strip()
    if raw.startswith(("http://", "https://", "mailto:", "#")):
        return True
    target = urllib.parse.unquote(raw.split("#", 1)[0].split("?")[0])
    if not target:
        return True
    return (source.parent / target).resolve().exists()


repairs: list[dict] = []
modified_files: set[str] = set()
unresolved: list[dict] = []

for md in md_files:
    original = md.read_text(encoding="utf-8")
    state = {"changed": False}

    def repl(match: re.Match[str]) -> str:
        prefix, url, anchor, suffix = (
            match.group(1),
            match.group(2).strip(),
            match.group(3) or "",
            match.group(4),
        )
        if url.startswith(("http://", "https://", "mailto:", "#")):
            return match.group(0)
        if link_exists(md, url):
            return match.group(0)

        decoded = urllib.parse.unquote(url.split("?")[0])
        new_rel: str | None = None

        if decoded in ("../.env.example", ".env.example"):
            env = REPO / ".env.example"
            if env.exists():
                new_rel = os.path.relpath(env, md.parent).replace("\\", "/")
        else:
            target_rel = resolve_target_rel(decoded)
            if target_rel:
                target_path = DOCS / target_rel
                new_rel = os.path.relpath(target_path, md.parent).replace("\\", "/")

        if not new_rel:
            unresolved.append(
                {
                    "file": md.relative_to(REPO).as_posix(),
                    "url": url,
                    "decoded": decoded,
                }
            )
            return match.group(0)

        new_href = encode_href(new_rel) + anchor
        if new_href != url + anchor:
            state["changed"] = True
            repairs.append(
                {
                    "file": md.relative_to(REPO).as_posix(),
                    "old": url + anchor,
                    "new": new_href,
                }
            )
        return prefix + new_href + suffix

    new_text = link_re.sub(repl, original)
    if state["changed"]:
        md.write_text(new_text, encoding="utf-8")
        modified_files.add(md.relative_to(REPO).as_posix())

remaining: list[dict] = []
for md in md_files:
    text = md.read_text(encoding="utf-8")
    for m in link_re.finditer(text):
        url = m.group(2).strip()
        if url.startswith(("http://", "https://", "mailto:", "#")):
            continue
        if not link_exists(md, url):
            remaining.append({"file": md.relative_to(REPO).as_posix(), "url": url})

report = {
    "links_repaired": len(repairs),
    "files_modified": sorted(modified_files),
    "files_modified_count": len(modified_files),
    "unresolved_during_repair": len(unresolved),
    "remaining_broken_count": len(remaining),
    "remaining_broken": remaining,
    "repairs": repairs,
}

report_path = REPO / "docs-link-repair-report.json"
report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
print(
    json.dumps(
        {
            "links_repaired": report["links_repaired"],
            "files_modified_count": report["files_modified_count"],
            "remaining_broken_count": report["remaining_broken_count"],
            "report_path": str(report_path),
        },
        indent=2,
    )
)
