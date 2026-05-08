# Pressure Cooker - Getting Started & Testing

## ✅ Pre-Installation Checklist

- [ ] Chrome 91 or newer installed
- [ ] All extension files downloaded
- [ ] Developer mode available on your system
- [ ] About 500MB free disk space

## 🎯 Quick Installation (3 Steps)

### Step 1: Open Extensions Page
```
Chrome Menu → More Tools → Extensions
OR
Type in address bar: chrome://extensions/
```

### Step 2: Enable Developer Mode
- Toggle the switch in the top-right corner
- You should see "Load unpacked" button appear

### Step 3: Load the Extension
1. Click "Load unpacked"
2. Navigate to the Pressure Cooker folder
3. Select it and click "Open"
4. Done! You should see the extension in the list

## 🧪 First Test

### Test 1: Basic Detection

1. **Open a PDF**:
   - Try: https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-files/table.pdf
   - Or download any PDF and open it locally

2. **Click the Pressure Cooker icon**
   - It should be purple with "PC" logo
   - If greyed out, the PDF wasn't detected

3. **Check the popup**:
   - PDF name should appear
   - Page count should show
   - If blank, check the browser console (F12)

### Test 2: Minimal Capture

1. **Use custom range**: Select pages 1-2 only
2. **Uncheck zoom levels**: Keep only "100%"
3. **Click Capture**
   - Should be very fast (10 seconds or less)
   - Should create a ZIP with about 12 images

### Test 3: Full Capture

1. **Try with all defaults**: All pages, all zoom levels
2. **Monitor progress**: Watch the progress bar
3. **Wait for completion**: Should reach 100%
4. **Check the ZIP**: Unzip and verify structure

## 📋 Test Scenarios

### Scenario A: Small PDF (10 pages)

| Setting | Value |
|---------|-------|
| Pages | All (1-10) |
| Zoom | 100%, 150%, 200% |
| Expected time | 30-60 seconds |
| Expected ZIP size | 50-100 MB |

**Success criteria**:
- ✓ ZIP contains 120 images (10 × 3 × 4)
- ✓ All images are PNG files
- ✓ metadata.json exists
- ✓ README.md exists

### Scenario B: Medium PDF (50 pages)

| Setting | Value |
|---------|-------|
| Pages | Custom (1-10) to start |
| Zoom | 100%, 150% only |
| Expected time | 20-40 seconds |
| Expected ZIP size | 20-40 MB |

**Success criteria**:
- ✓ ZIP contains 80 images (10 × 2 × 4)
- ✓ File naming is consistent
- ✓ No errors in console

### Scenario C: Performance Test

| Setting | Value |
|---------|-------|
| Pages | 100 pages or more |
| Zoom | 100% only |
| Expected time | 120+ seconds |
| Expected ZIP size | 200+ MB |

**Success criteria**:
- ✓ Browser doesn't freeze
- ✓ Progress bar updates smoothly
- ✓ ZIP completes successfully

## 🔍 Verification Checklist

After each capture, verify:

### ZIP Structure
```
your_pdf.zip
├── images/
│   ├── page_1_full_100%.png ✓
│   ├── page_1_a_100%.png ✓
│   ├── page_1_b_100%.png ✓
│   ├── page_1_c_100%.png ✓
│   ├── page_2_full_100%.png ✓
│   ...
├── metadata.json ✓
└── README.md ✓
```

### Image Quality
- [ ] Images open in any image viewer
- [ ] Images are not blank or corrupted
- [ ] Images show readable content
- [ ] Full-page images show entire page
- [ ] Region images show distinct sections

### Metadata Check
Open `metadata.json` and verify:
```json
{
  "title": "your_pdf_name",
  "totalPages": 10,
  "totalImages": 120,
  "captureDate": "2024-01-15T10:30:00Z",
  "structure": {
    "perPage": 12,
    "fullPageImages": 30,
    "croppedImages": 90
  }
}
```

## 🐛 Common Test Failures & Fixes

### Test Failure: Icon Stays Greyed Out

**Why**: PDF not detected
**How to fix**:
1. Make sure URL ends with `.pdf`
2. Try downloading the PDF locally
3. Open with `file:///path/to/file.pdf`
4. Reload extension (refresh button on extensions page)

### Test Failure: "Unable to load PDF" error

**Why**: CORS or access issue
**How to fix**:
1. Download PDF to your computer
2. Open using `file://` protocol
3. Try a different public PDF

### Test Failure: Capture progress freezes

**Why**: Large PDF or out of memory
**How to fix**:
1. Try fewer pages first (1-5)
2. Try fewer zoom levels (just 100%)
3. Close other browser tabs
4. Restart Chrome

### Test Failure: ZIP is empty

**Why**: Capture didn't complete
**How to fix**:
1. Check browser console for errors (F12)
2. Try a smaller page range
3. Wait longer before checking
4. Restart the extension

## 📊 Test Report Template

Save this as a reference for tracking tests:

```markdown
## Test Report - [Date]

### Environment
- Browser: Chrome [version]
- OS: [Windows/Mac/Linux]
- RAM: [amount]
- Disk space: [available]

### Test: [Name]
- PDF: [filename]
- Pages tested: [range]
- Zoom levels: [selected]
- Duration: [seconds]
- Result: ✓ PASS / ✗ FAIL

### Issues encountered
- [Issue 1]
- [Issue 2]

### Notes
[Any observations]
```

## 🎓 Test PDFs to Use

### Public PDFs for Testing

1. **Simple text PDF** (small)
   - http://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-files/table.pdf

2. **Complex PDF** (medium)
   - https://www.adobe.io/content/dam/udp/assets/open/pdf/principles/extract/BusinessPresentationProposal.pdf

3. **Large document** (large)
   - https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-files/table.pdf

### Create Test PDFs

If you need specific test cases:

**Using Google Docs**:
1. Create document in Google Docs
2. Download as PDF
3. Use for testing

**Using LibreOffice** (free):
1. Create document in Writer
2. Export as PDF
3. Use for testing

**Recommended test PDFs to create**:
- [ ] 5-page simple text
- [ ] 20-page mixed content
- [ ] 100-page document
- [ ] PDF with images
- [ ] PDF with tables
- [ ] PDF with complex fonts

## 💾 Backup & Restore

### Backing Up Your Setup

```bash
# On your computer
cp -r "/path/to/Pressure Cooker" "/path/to/Backup"
```

### Restore After Reinstall

```bash
# On your computer
cp -r "/path/to/Backup"/* "/path/to/Pressure Cooker"
```

Then reload the extension.

## 📈 Expected Results by PDF Size

| PDF Size | Pages | All 3 Zoom | Est. Time | ZIP Size |
|----------|-------|-----------|-----------|----------|
| Small | 5 | 3 min | 20-30s | 5-10 MB |
| Medium | 20 | 12 min | 2-3m | 40-60 MB |
| Large | 50 | 30 min | 5-8m | 100-150 MB |
| X-Large | 100 | 60 min | 10-15m | 200-300 MB |
| XXL | 200 | 120 min | 20-30m | 400-600 MB |

*Times are estimates on mid-range hardware (quad-core CPU, 8GB RAM)*

## ✨ Success Indicators

You've successfully installed and tested when:

- [x] Extension icon appears in toolbar
- [x] Icon activates (shows color) when PDF is open
- [x] Popup displays correctly with form inputs
- [x] Progress bar works during capture
- [x] ZIP file downloads successfully
- [x] ZIP contains correct number of images
- [x] Images are valid PNG files
- [x] Image naming follows convention
- [x] metadata.json is valid JSON
- [x] README.md is readable
- [x] No browser crashes or freezes

## 🎯 Next Steps

Once testing is complete:

1. **Use with your PDFs**: Try it on your actual documents
2. **Upload to AI**: Send ZIP to DeepSeek or Claude for OCR
3. **Customize if needed**: Follow ADVANCED_CONFIG.md
4. **Share feedback**: Note what works well, what could improve
5. **Integrate with workflow**: Add to your document processing pipeline

## 📞 Test Support

If tests fail:

1. **Check the console**: F12 → Console tab → Look for errors
2. **Clear cache**: Ctrl+Shift+Del → Clear browsing data
3. **Reload extension**: Go to extensions page, click refresh
4. **Restart browser**: Close and reopen Chrome completely
5. **Read TROUBLESHOOTING.md**: Comprehensive error solutions

---

**You're ready to test! Start with Test Scenario A and work up to larger PDFs.**
