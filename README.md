# IntentFeed

IntentFeed is a Manifest V3 Chrome extension that redirects YouTube doomscrolling into goal-aligned action. When you visit the YouTube homepage during a scheduled focus block, it replaces recommendations with your intended activity, motivation keywords, and up to three useful next steps.

## MVP features

- Replaces YouTube homepage recommendations during active daily focus blocks.
- Shows the current intention, motivation keywords, and suggested links.
- Provides **Start 10 min**, **Open task**, and **Ignore for now** actions.
- Includes a clean options page for adding, editing, and removing recurring time blocks.
- Stores schedules and basic analytics (`shown`, `started`, and `ignored`) in `chrome.storage.local`.
- Ships with a sample schedule and has no backend, account, or tracking service.

## Install locally

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose this repository's root directory.
5. Click the IntentFeed toolbar icon to open settings, then edit and save your schedule.
6. Visit `https://www.youtube.com/` during one of the configured blocks.

Chrome initializes the bundled sample schedule the first time the extension is installed. Blocks repeat daily and use the browser's local time. For a quick manual test, change a block so the current time falls between its start and end times, save it, and refresh the YouTube homepage.

## Development

IntentFeed intentionally has no production dependencies or build step. It uses plain JavaScript and CSS so the repository itself can be loaded as an unpacked extension.

```bash
npm test        # Test schedule matching and normalization
npm run check   # Validate the manifest, referenced files, and JavaScript syntax
```

## Project structure

```text
manifest.json                 Manifest V3 configuration
src/background.js             First-install defaults and toolbar action
src/shared/core.js            Shared schedule data and matching logic
src/content/youtube.js        YouTube intervention behavior and analytics
src/content/youtube.css       Intervention panel styles/feed replacement
src/options/options.html      Schedule editor and analytics UI
src/options/options.js        Options-page storage and editing behavior
src/options/options.css       Options-page styles
examples/sample-schedule.json Import-friendly sample schedule data
tests/core.test.js            Unit tests for shared scheduling logic
scripts/validate-extension.js Lightweight extension validation
```

## Behavior notes

- The intervention only runs on the YouTube homepage; searches and video watch pages remain unchanged.
- **Start 10 min** increments the started count and begins an in-panel countdown.
- **Open task** opens the first suggested link.
- **Ignore for now** restores YouTube recommendations for the current block until you navigate away or the page is reloaded.
- If a block crosses midnight (for example, `23:00` to `01:00`), IntentFeed treats it as an overnight block.
- If blocks overlap, the first matching block in the saved schedule is used.

## Privacy

All schedule and analytics data stays in Chrome local extension storage. IntentFeed requests access only to local storage and `youtube.com`; it does not send data to a backend.
