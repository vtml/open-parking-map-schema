# Contributing to OPMS

Thanks for helping. OPMS is a draft, so questions and critiques are as valuable as pull requests.

## Ways to contribute

- **Issues:** open one for a missing scenario, an unclear field, a conflict with another standard, or a jurisdiction we should model.
- **Pull requests:** small and focused. Change the schema in `schema/`, update or add an example in `examples/`, update `SPEC.md` and `CHANGELOG.md`, and run `python tools/validate.py` until it prints `RESULT: PASS`.
- **Mappings:** tables mapping OPMS entities to ISO/TS 22726-1, NDS.Live, OpenDRIVE, Lanelet2, IndoorGML, CDS, APDS and SENSORIS.
- **Jurisdiction profiles:** please include citations and say whether a lawyer reviewed them.

## Rules

1. **No personal data.** No real number plates, VINs, faces, driver or passenger identities, or real vehicle traces in issues, examples or tests.
2. **Co-design matters.** Changes that affect accessibility fields should cite input from people with lived experience or an accessibility audit; avoid inventing needs on behalf of others.
2. **Fictional examples only,** clearly labelled with a `_note`, unless the facility operator has agreed in writing to publication.
3. **No claims about third parties' internals.** Describe public standards and your own work; do not speculate about a company's systems.
4. **Identifiers:** lower-case dotted IDs, stable, never reused. Prefer `external_refs` to copying another standard's geometry.
5. **Safe defaults:** unknown means not allowed.
6. **Version impact:** while `opms_version` is 0.x, breaking changes are allowed but must be listed in `CHANGELOG.md`.

## Licensing of contributions

By contributing you agree that:

- changes to specification text and documentation are licensed under **CC BY 4.0**;
- changes to schemas, examples and code are licensed under **Apache-2.0**.

Please add a `Signed-off-by: Your Name <email>` line to commits (Developer Certificate of Origin, https://developercertificate.org/) to confirm you have the right to submit your work.

## Conduct

Be respectful and specific. Disagree with ideas, not people. Maintainers may remove content that is abusive, contains personal data, or makes unsupported claims about third parties.

## Local checks

```bash
pip install jsonschema referencing rfc3339-validator rfc3987
python tools/validate.py
```
