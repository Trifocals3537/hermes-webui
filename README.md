# Read-only conversation wording follow-up

Before: 528c43588cb858c7ee3b31c42c830b58919fe1ce
After: 92e3d938c153e3279b4a85e4f808ad3a411eeab0

These images use the repository's composer markup, styles, translations, and actual composer and title functions. The surrounding page is a small test harness. All conversations are synthetic and all browser network requests are blocked. No live settings or history were used.

The 30 updated scenarios passed at 1440, 900, and 390 pixels, in light and dark themes: Desktop, Desktop with Spanish selected, cron, subagent, and the original-client fallback. Another 30 images show the previous version under the same conditions. See results.json for text and layout measurements.

The checks cover the shortened notice, hidden notice for unsupported sources, help label and destination, full button description, both read-only badges, blocked typing and sending, no duplicate popup, preserved drafts, Stop availability, and navigation back to an editable conversation. The continuation text and badge suffix still use English; the placeholder and help link use the selected language.

Reproduce with tests/browser_gateway_read_only_composer.cjs in the PR checkout. Set COMPOSER_ARTIFACT_DIR to a disposable folder and COMPOSER_BEFORE_REF to the before commit. Supply Playwright and a Chromium executable through the environment as needed.

These are isolated component checks, not a full-app or live-provider rehearsal.