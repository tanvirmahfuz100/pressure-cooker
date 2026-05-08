# Pressure Cooker - Troubleshooting Guide

## Issue: Extension icon is greyed out / disabled

### Cause
The extension only turns on when the current tab looks like a PDF.

### Solutions
1. **Check the URL**: Make sure it ends with `.pdf`
   - Good: `https://example.com/report.pdf`
   - Bad: `https://example.com/report.php?file=abc`

2. **Check the tab title**: Should contain `.pdf`
   - Right-click the tab and confirm the title includes "PDF"

3. **Try Chrome's PDF viewer**:
   - Open a PDF directly in Chrome (drag and drop a .pdf file)
   - The PDF should open in Chrome's built-in viewer
   - After that, the extension should activate

4. **Reload the PDF**:
   - Reload the page (F5 or Cmd+R)
   - Try the extension again

## Issue: "No PDF detected" error message

### Cause
The extension did not find a valid PDF URL in the current tab.

### Solutions
1. **Make sure you're on a PDF page**: Check that the URL contains `.pdf`

2. **Try with a different PDF**: Some PDFs might be served with non-standard URLs
   - Example problem: `https://example.com/pdf.php?id=123` (does not end with .pdf)
   - Try with a simpler URL like: `https://example.com/sample.pdf`

3. **Check the browser console**:
   - Press F12 to open Developer Tools
   - Click the Console tab
   - Look for error messages
   - Share errors if asking for help

## Issue: "Unable to load PDF" error

### Cause
The extension cannot access the PDF file (CORS, bad file, or network issue).

### Solutions
1. **Check your internet connection**:
   - First, load the PDF normally
   - Make sure it displays in your browser

2. **Try downloading locally**:
   - Right-click PDF and choose "Save link as"
   - Save to your computer
   - Open the file with `file:///path/to/your/file.pdf`
   - Run the extension again

3. **Check for CORS issues**:
   - Open the console (F12)
   - Look for messages mentioning "CORS" or "blocked"
   - That means the PDF server does not allow extension access
   - Solution: Download the PDF locally

4. **Try a different PDF**:
   - Use the sample PDF provided or any public PDF
   - This tells you whether the problem is the file or your setup

5. **Reload the page**:
   - A fresh load often fixes temporary issues
   - Refresh the PDF (Ctrl+R or Cmd+R)

## Issue: Capture is very slow

### Cause
Large PDFs with lots of pages and zoom levels take time.

### Solutions
1. **Start with fewer pages**:
   - Select "Custom Range"
   - Try pages 1-5 first
   - If that works, run the full PDF

2. **Use fewer zoom levels**:
   - Uncheck some zoom level checkboxes
   - 100% and 200% is usually faster than enabling all levels

3. **Check your browser resources**:
   - Open Task Manager (Ctrl+Shift+Esc)
   - Check Chrome CPU usage
   - If it's maxed out, wait or close other tabs

4. **Try a simpler PDF**:
   - PDFs with lots of images and graphics are slower to process
   - Try with a text-heavy PDF first

## Issue: Extension crashes or freezes browser

### Cause
Running out of memory with very large PDF captures.

### Solutions
1. **Close other tabs and apps**:
   - Free up RAM before capturing
   - Close Chrome completely and restart

2. **Start smaller**:
   - Capture just pages 1-10 first
   - Then capture the rest in separate batches

3. **Use fewer zoom levels**:
   - This cuts memory use immediately
   - Try just 100% zoom

4. **Reduce image quality**:
   - This requires code changes
   - Edit popup.js: change `scale: scale * baseScale` (line ~220)
   - Change `2` to `1.5` for lower quality but faster capture

## Issue: ZIP file download doesn't start

### Cause
Usually a browser setting or permission issue.

### Solutions
1. **Check download permissions**:
   - Go to `chrome://settings/content/automaticDownloads`
   - Make sure your site is not blocked
   - Or set Chrome to "Ask where to save each file"

2. **Check Downloads folder**:
   - The file may have downloaded already
   - Open your Downloads folder manually
   - Search for `.zip` files

3. **Try a test**:
   - Click extension → Capture with just page 1
   - This will create a smaller ZIP
   - If that works, the issue is likely file size

4. **Check available disk space**:
   - Make sure you have at least 500MB free
   - Large PDFs can create multi-GB ZIPs

5. **Restart Chrome**:
   - Close Chrome completely
   - Reopen it
   - Try again

## Issue: Downloaded ZIP is empty or corrupted

### Cause
Capture did not finish, or ZIP creation failed.

### Solutions
1. **Wait longer**:
   - The progress bar should reach 100%
   - Do not close the popup during capture

2. **Check the console**:
   - Right-click extension → "Inspect popup"
   - Open Console tab
   - Look for red error messages
   - Save a screenshot of the error

3. **Try with fewer pages**:
   - Custom range: pages 1-3 only
   - If that works, memory pressure was likely the issue

4. **Try a different ZIP tool**:
   - Windows: Use 7-Zip or WinRAR instead of built-in unzip
   - Mac: Use Archive Utility or A-Zippr
   - Linux: Use `unzip` command: `unzip yourfile.zip`

5. **Clear browser cache**:
   - Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
   - Select "All time"
   - Check "Cookies and other site data"
   - Clear browsing data
   - Reload the extension

## Issue: PDF has embedded password or is corrupted

### Cause
The PDF is restricted or malformed.

### Solutions
1. **Try the PDF in Chrome normally**:
   - If Chrome cannot open it, this extension cannot either
   - Try with a different PDF

2. **Remove password protection**:
   - Use an online tool or local tool to remove PDF password
   - Then try the extension again

3. **Repair the PDF**:
   - Some PDFs are corrupted
   - Try Adobe Reader or Preview (Mac) to open it
   - Export as PDF
   - Try the extension with the new file

## Issue: Extension doesn't appear in toolbar

### Cause
Extension might be unpinned or disabled.

### Solutions
1. **Check it's installed**:
   - Go to `chrome://extensions/`
   - Search for "Pressure Cooker"
   - Make sure "Enabled" toggle is on (blue)

2. **Pin it to toolbar**:
   - Click puzzle icon (Extensions) in top right
   - Find "Pressure Cooker"
   - Click the pin icon

3. **Reload the extension**:
   - On `chrome://extensions/` page
   - Find "Pressure Cooker"
   - Click the refresh button
   - This reloads the extension

## Issue: Getting CORS errors in console

### Cause
Chrome security is blocking direct PDF access from the extension.

### Solutions
This is **normal and expected** for some PDF hosts. The extension often still works.

1. **If capture still works**: Ignore these errors
   - They show up in the console but do not block capture

2. **If capture doesn't work**: Download the PDF locally
   - Right-click PDF and choose Save link as
   - Open with `file:///path/to/file.pdf`
   - CORS does not apply to local files

## Issue: Images in ZIP are blank or corrupted

### Cause
PDF rendering issue or memory problem.

### Solutions
1. **Try a simpler PDF**:
   - Complex PDFs with unusual fonts may fail to render
   - Try with a standard PDF first

2. **Use single zoom level**:
   - One zoom level may work while another fails
   - Try just 100%

3. **Capture fewer pages**:
   - Memory pressure can cause partial corruption
   - Try pages 1-5

4. **Check PNG utility**:
   - Try opening PNG files in a different image viewer
   - Sometimes the files are fine and the viewer is the issue

## General Debugging Steps

**When nothing else works:**

1. Open Developer Console: F12 → Console tab
2. Reload the extension: `chrome://extensions/` → Click refresh
3. Open the PDF again
4. Click extension and try again
5. Check console for any error messages (red text)
6. Screenshot the error
7. Note:
   - PDF title
   - Number of pages
   - File size
   - Your browser version

## Still Stuck?

- Check the README.md for more details
- Try with the example PDFs online
- Clear cache and restart Chrome
- Try uninstalling and reinstalling the extension

---

**Remember**: The extension runs locally. Most problems come from PDF access rules or browser resource limits, not from core extension logic.
