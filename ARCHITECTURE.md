# Architecture Map

The detailed architecture note lives in `docs/architecture.md`.

Use this root file as a short pointer for tools that look for `ARCHITECTURE.md` by convention.

Key invariants:

- Source-based reviewers run independently on the same diff.
- The final reviewer is the only merge/dedup/severity adjustment step.
- The bot never runs pull request code.
- Repository context is allowlisted and capped by `MAX_CONTEXT_CHARS`.
