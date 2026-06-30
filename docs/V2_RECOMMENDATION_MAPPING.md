# V2 Recommendation Mapping Status

Generated recommendation stubs ship with Scoring Engine v2. Each DOC-151 question maps 1:1 to a `REC-{pillar}-###` template in `data/RecommendationCatalogV2.json`.

| Pillar | Prefix | Questions | Stub templates |
| ------ | ------ | --------- | -------------- |
| Identity & Access | REC-IA | 10 | REC-IA-001 … REC-IA-010 |
| Endpoint Management | REC-EP | 10 | REC-EP-001 … REC-EP-010 |
| Network & Connectivity | REC-NW | 10 | REC-NW-001 … REC-NW-010 |
| Data Protection & Recovery | REC-DP | 10 | REC-DP-001 … REC-DP-010 |
| Productivity & Collaboration | REC-PC | 10 | REC-PC-001 … REC-PC-010 |
| Security Operations | REC-SO | 10 | REC-SO-001 … REC-SO-010 |
| Documentation & Knowledge | REC-DK | 10 | REC-DK-001 … REC-DK-010 |
| Technology Strategy | REC-TS | 10 | REC-TS-001 … REC-TS-010 |

**Total:** 80 question → recommendation mappings (all stubs until refined per DOC-153).

## Trigger rules

- **No** and **Partially** answers fire the linked recommendation.
- **Not Applicable** does not fire recommendations.
- Dedupe uses existing `buildDedupeKey` on template code.

## Next steps

1. Replace stub titles/descriptions with finalized DOC-153 language.
2. Add consolidation groups where multiple questions imply one program.
3. Port high-value v1 catalog consolidations where pillar intent aligns.
