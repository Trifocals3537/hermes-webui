# Mobile conversation title follow-up

Before: 92e3d938c153e3279b4a85e4f808ad3a411eeab0
After: a8ef6845a16226f613e6c48ade628f8610e16f0e

The earlier badge change could squeeze the conversation title to zero width on a phone. The previous screenshot harness used a simplified header and missed that problem. These comparisons use the actual header markup, stylesheet and title functions.

On phones with a source badge, the title now has its own row and the badge sits below it. The header keeps its existing height and touch controls. Long badge text can shorten with an ellipsis; the title remains available, including its existing tap-to-expand interaction. Desktop headers and chats without a source badge keep their existing layout.

The browser check passed 60 updated scenarios: Desktop, Spanish, cron, subagent and the original-client fallback at 320, 375, 390, 430, 900 and 1440 pixels in light and dark themes. Matching before images are included. Files ending in -header.png show the real header. Other images show the isolated composer. results.json records the measurements.

The new automated header test uses the real header with synthetic state. It covers seven widths in both themes, Desktop and Telegram labels, longer labels, visible titles, badge containment, unchanged header height, touch-target sizes, tap-to-expand and returning to an ordinary WebUI chat. All 14 cases passed; 10 mobile cases failed before the fix and 4 desktop/tablet cases passed.

The final affected and neighboring run passed 309 tests using scripts/test.sh with isolated homes and state. One unchanged symbolic-link test was excluded on Windows; it remains in the GitHub Linux suite. No runtime permissions, routing or live setup changed.

Reproduce with tests/browser_gateway_read_only_composer.cjs and tests/test_issue8453_mobile_source_badge_layout.py. Set COMPOSER_ARTIFACT_DIR to a disposable output directory and COMPOSER_BEFORE_REF to the before commit for the screenshot check. Browser dependencies must be available. All page traffic is blocked or fulfilled from synthetic HTML; there are no credentials or real conversations.

These are isolated UI checks, not a live-provider rehearsal.