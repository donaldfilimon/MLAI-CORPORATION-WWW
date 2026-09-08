# Research Review Discovery Refinements

## Implementation Summary

The maintained Research exporter now places MLAI Research and its searchable
collection before the area and implementation-study sections. The collection
contains all 21 publications and seven implementation studies. Studies match
every associated research area and have their own document type. Publication
review dates come from the reviewed records; studies do not receive invented
dates. Both record types explicitly identify their reference-snapshot scope.

One progressive-enhancement controller owns query, topic and type state. It
preserves unrelated parameters and fragments, restores browser navigation,
accepts historical `track` and `tag` links, represents unknown filters, and keeps
Clear search, Reset filters and Clear all separate. Clearing restores search
focus. Without JavaScript, all document links remain available.

Reading pages retain their section fragments and provide sticky desktop contents,
a mobile disclosure, and keyboard-focusable equation and code overflow. The
original logo, reviewed content, source links and attachment bytes are unchanged.
The obsolete competing tag-filter controller is removed.

## Verification Boundary

Canonical TypeScript checking and all 364 tests passed. Artifact tests exercise
the 28-record collection, metadata counts, study areas, disclosure markup,
deterministic hashes and destination safeguards. Formatting validation covers the
touched source and test files. There is no Rust target in this web application,
so Clippy is not applicable.

Production-build, browser, manual accessibility, content-parity and release
receipts belong to the integrated completion report. This change does not publish
the Site, push the canonical deployment branch, activate a local application,
alter provider configuration or configure credentials.
