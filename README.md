# Pressure Cooker

Pressure Cooker is a Chrome extension that turns PDF pages into clean image sets at multiple zoom levels, then packages everything into one ZIP file.

If you work with OCR, document indexing, or archival workflows, this helps you get consistent, high-quality inputs in one click.

## Why it helps

- Captures each page at multiple zoom levels (100%, 150%, 200%)
- Exports full page + top/middle/bottom crops for each zoom level
- Supports full documents or custom page ranges
- Produces predictable filenames for easy downstream processing
- Generates a ZIP with images plus metadata
- Runs fully in-browser; no external upload step in the extension

## Quick start

1. Open `chrome://extensions/`
2. Turn on Developer mode
3. Click Load unpacked
4. Select this project folder
5. Open any PDF tab
6. Click Pressure Cooker and run Capture PDF

## What you get

Example output naming:

- `page_12_full_100%.png`
- `page_12_a_100%.png` (top third)
- `page_12_b_100%.png` (middle third)
- `page_12_c_100%.png` (bottom third)

ZIP contents:

- `images/` folder with all generated PNGs
- `metadata.json` with capture summary
- `README.md` generated for that export

## Browser support

- Chrome: supported
- Edge: supported
- Brave: supported
- Firefox/Safari: not supported for this build target

## Privacy

- Processing happens locally in the browser extension context
- No analytics or telemetry is included by default

## Local development notes

Core files:

- `manifest.json`
- `popup.html`
- `popup.js`
- `background.js`
- `offscreen.html`
- `offscreen.js`
- `styles.css`

Bundled third-party libraries live in `lib/`.
Licensing and attribution details are in `THIRD_PARTY_NOTICES.md`.

## License

This project is licensed under the MIT License.
See `LICENSE` for full text.
