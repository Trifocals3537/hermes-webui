# Phone profile button follow-up

Before: a8ef6845a16226f613e6c48ade628f8610e16f0e
After: db82c20623d29c38b96123028e9494798390f6da

The optional profile button could still crowd out the conversation title on small phones. With a long profile name at 320px, the title had only 10px and the source badge extended into the next button's space.

Phone headers with a source badge now show the profile icon and arrow in a 44px touch target. The title has 94px at 320px, and the badge stays inside its own space. The full profile label remains visible on wider screens and in headers without a source badge. The existing profile action and title tap-to-expand behavior are unchanged.

The expanded automated header check covers the profile button hidden, shown with a short name and shown with a long name, at seven widths in both themes. It checks several source labels, a three-digit message count, title room, badge containment, touch targets, profile-button taps, title taps and returning to a normal WebUI conversation. Before the fix, 20 cases failed and 22 passed. After the fix, all 42 passed.

The affected and neighboring suite passed 343 tests through scripts/test.sh with disposable homes and state. One unchanged symbolic-link test was excluded locally on Windows and remains in the full GitHub Linux suite. Test-file lint, the Python diff gate and whitespace checks passed.

The browser check passed 84 updated scenarios, with 84 matching before scenarios: seven examples at six widths in light and dark themes. Each scenario has a composer image and an actual-header image, for 336 images total. The profile examples use synthetic names and messages. All page traffic is blocked. There are no credentials or real conversations here.

Reproduce with tests/browser_gateway_read_only_composer.cjs and tests/test_issue8453_mobile_source_badge_layout.py. Set COMPOSER_ARTIFACT_DIR to a disposable folder and COMPOSER_BEFORE_REF to the before commit. Browser dependencies must be available.

This is isolated UI evidence, not a live-provider rehearsal. No live setup was changed.
