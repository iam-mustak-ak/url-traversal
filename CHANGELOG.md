# Changelog

## v1.0.1 – 2026-05-21

- **Added auto‑pause/resume on skip URLs**: Traversal now automatically pauses when the active tab URL matches a defined skip pattern and automatically resumes when navigating away, preserving traversal state.
- **Persist URL list on End**: The URL list is now stored against the original start URL, ensuring the list remains intact after clicking the End button.
- **Added `startUrl` tracking** in traversal state to correctly restore configuration after a pause or navigation change.
- Updated documentation (`README.md`) with the new feature description.
- Minor refactors and bug fixes for state handling.
