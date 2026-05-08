# Quick Start - Pressure Cooker Extension

## 3-Minute Setup

### 1. Load the Extension
- Open Chrome
- Go to `chrome://extensions/`
- Turn on **Developer mode** (top right)
- Click **Load unpacked**
- Select this folder
- Done!

### 2. Use It
- Open any PDF in your browser
- Click the purple "PC" icon in your toolbar
- Click **Capture**
- Wait for download
- You now have a ZIP with 1000s of PDF images!

### 3. Upload to AI
- Use the ZIP with DeepSeek, Claude, or any OCR tool
- AI processes multiple perspectives of each page
- Get better accuracy than single-resolution PDFs

##  What's in the ZIP?

```
your_pdf.zip
 images/
    page_1_full_100%.png
    page_1_a_100%.png     (top 1/3)
    page_1_b_100%.png     (middle 1/3)
    page_1_c_100%.png     (bottom 1/3)
    page_1_full_150%.png
    page_1_a_150%.png
   ... and so on
```

Each page captured at 100%, 150%, 200% zoom.
Each zoom produces 4 images (1 full + 3 regions).

##  Customization

- **Change zoom levels**: Edit popup.html (search for "100%" in checkbox group)
- **Change colors**: Edit styles.css (search for #667eea)
- **Change naming**: Edit popup.js (search for `image.name`)

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "No PDF detected" | Open a PDF file first, then click extension |
| Icon is greyed out | You need a PDF open in the tab |
| Very slow capture | Try with fewer pages or zoom levels |
| ZIP download fails | Try a smaller PDF first |

##  Check It's Working

1. Right-click extension  "Inspect popup"
2. Open Console tab (F12)
3. You should see no errors (or only CORS warnings, which are OK)
4. Reload and try again if needed

---

**That's it!** Your extension is ready to capture PDFs at scale.

For detailed documentation, see README.md
