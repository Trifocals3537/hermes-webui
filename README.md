# Read-only composer review

Before-and-after evidence for hermes-webui PR #8523, October 31, 2026.

The before images use `bd0e0168e`, after the upstream merge and maintainer Stop fix but before the wording changes. The after images use the accompanying composer changes.

The check loads the actual composer markup, stylesheet and composer functions in Chromium with made-up session state. Network requests are blocked. It checks desktop (1440px), tablet (900px) and phone (390px) widths in light and dark themes.

All six updated views preserve drafts, refuse typing and sending while read-only, keep Stop available during an active turn, hide connection help for unsupported sources, and restore editing when switching to a WebUI conversation. The notice fits without horizontal overflow and takes at most two lines on the phone view.

These are isolated composer checks, not a new Gateway, container or live-provider rehearsal. The runnable check is `tests/browser_gateway_read_only_composer.cjs` in the PR. Set `COMPOSER_ARTIFACT_DIR` to a disposable folder; `COMPOSER_BEFORE_REF` selects a comparison commit, and `CHROMIUM_EXECUTABLE_PATH` can select an installed Chromium browser.

`results.json` records the layout measurements. All images use synthetic content.
