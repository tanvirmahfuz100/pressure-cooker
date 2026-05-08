# Pressure Cooker - Project Overview & File Guide

##  Complete Project Structure

```
Pressure Cooker/

  CORE EXTENSION FILES
    manifest.json              [Extension configuration]
    popup.html                 [User interface]
    popup.js                   [Main logic & capture engine]
    styles.css                 [Popup styling]
    background.js              [Service worker]
    images/                    [Extension icons]
        icon-16.svg
        icon-48.svg
        icon-128.svg

  DOCUMENTATION
    README.md                  [Complete user documentation]
    QUICK_START.md             [3-minute setup guide]
    GETTING_STARTED.md         [Testing & verification]
    TROUBLESHOOTING.md         [Error diagnosis & fixes]
    ADVANCED_CONFIG.md         [Customization guide]
    DEVELOPER.md               [Technical architecture]
    PROJECT_OVERVIEW.md        [This file]
```

##  File Descriptions

### Core Extension Files

#### manifest.json
**Purpose**: Extension metadata and permissions
**Key contents**:
- Extension name, version, description
- Required permissions (activeTab, scripting, tabs)
- Host permissions for PDF access
- Entry points (popup.html, background.js)
- Icon references
- Manifest version 3 compliance

**When to edit**: When changing extension name, version, or permissions

---

#### popup.html
**Purpose**: User interface
**Key contents**:
- Page range input form
- Zoom level checkboxes
- Capture button
- Progress bar
- Error/success message displays
- Links to external libraries

**When to edit**: 
- Changing UI layout
- Adding new form fields
- Modifying default values
- Changing library versions

---

#### popup.js (290+ lines)
**Purpose**: Main extension logic and capture engine
**Key functions**:
- `initializePopup()` - Startup and PDF detection
- `detectPdfInfo()` - Extract PDF name and URL
- `loadPdfInfo()` - Get page count
- `handleCapture()` - Orchestrate capture process
- `capturePageAtZoom()` - Render pages and create images
- `createAndDownloadZip()` - Package images into ZIP

**When to edit**:
- Changing image processing logic
- Modifying naming conventions
- Adding features
- Improving performance

---

#### styles.css
**Purpose**: User interface styling
**Key sections**:
- General layout and typography
- Form styling (inputs, buttons)
- Progress bar and animations
- Color scheme (currently purple gradient)
- Responsive design

**When to edit**:
- Changing colors
- Adjusting popup size
- Modifying fonts
- Improving UI/UX

---

#### background.js
**Purpose**: Service worker (required for Manifest V3)
**Key contents**:
- Extension install event handler
- Tab update listener
- Icon enable/disable logic

**When to edit**:
- Adding permission-related handlers
- Implementing background tasks
- Adding context menus

---

#### images/*.svg
**Purpose**: Extension icons
**Files**:
- icon-16.svg (toolbar icon)
- icon-48.svg (extension list)
- icon-128.svg (Chrome Web Store)

**When to edit**: When rebranding or changing visual design

---

### Documentation Files

#### README.md (350+ lines)
**Purpose**: Comprehensive user guide
**Sections**:
- Features overview
- Installation instructions
- Usage workflow
- Technical details
- Use cases
- Troubleshooting basics
- Developer notes

**Audience**: Everyone (users, developers, maintainers)
**When to read**: First time using the extension

---

#### QUICK_START.md (50+ lines)
**Purpose**: Abbreviated setup guide
**Contents**:
- 3-step installation
- Basic usage
- File structure in ZIP
- Quick customization tips
- Troubleshooting table

**Audience**: Impatient users who want to start NOW
**When to read**: If you're in a hurry

---

#### GETTING_STARTED.md (280+ lines)
**Purpose**: Testing and verification guide
**Sections**:
- Pre-installation checklist
- Step-by-step installation
- Test scenarios (basic, medium, large)
- Verification checklist
- Test failure solutions
- Test report template

**Audience**: Users who want to verify everything works
**When to read**: Before using on important PDFs

---

#### TROUBLESHOOTING.md (350+ lines)
**Purpose**: Comprehensive error diagnosis
**Sections**:
- Icon greyed out (causes & solutions)
- "No PDF detected" error
- "Unable to load PDF" error
- Slow capture issues
- Crash/freeze problems
- ZIP download failures
- ZIP corruption issues
- CORS error explanation
- General debugging steps

**Audience**: Users experiencing problems
**When to read**: When something doesn't work

---

#### ADVANCED_CONFIG.md (400+ lines)
**Purpose**: Customization and configuration guide
**Sections**:
- Changing zoom levels
- Customizing colors & appearance
- Default page range settings
- Image naming conventions
- Crop region configuration
- Image format changes
- Canvas rendering quality
- Progress bar styling
- Theme presets (dark, minimal, compact)
- Performance tweaks
- Advanced modifications (settings page, storage, context menus)
- Common mistakes
- Debugging tips

**Audience**: Technical users who want to customize
**When to read**: When you want to modify the extension

---

#### DEVELOPER.md (350+ lines)
**Purpose**: Technical architecture and extension guide
**Sections**:
- Architecture overview
- File structure and responsibilities
- Key libraries (pdf.js, jszip, filesaver)
- Core logic deep dive
- Image generation process
- ZIP creation process
- Testing strategies
- Security considerations
- Enhancement ideas (new features)
- Debugging tips
- Performance metrics
- Extension lifecycle
- Learning resources

**Audience**: Developers and technical contributors
**When to read**: When extending or maintaining the extension

---

#### PROJECT_OVERVIEW.md
**Purpose**: This file - guide to all documentation
**Contents**: This overview and file descriptions

---

##  Documentation Roadmap

### For Different Users

** First-time user?**
1. Read: QUICK_START.md
2. Follow: Installation steps
3. Try: Test scenario A
4. Reference: README.md for details

** Want to customize?**
1. Read: ADVANCED_CONFIG.md
2. Make changes to popup.html, styles.css, or popup.js
3. Reload: chrome://extensions/ (click refresh)
4. Test: Verify changes work

** Something broken?**
1. Read: TROUBLESHOOTING.md
2. Find: Your specific error
3. Follow: Suggested solutions
4. Check: Browser console (F12)

** Want to extend it?**
1. Read: DEVELOPER.md
2. Study: Architecture section
3. Review: Enhancement ideas
4. Modify: popup.js or add new features
5. Test: Thoroughly before using

---

##  Quick Reference

### Installation
```
1. chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select Pressure Cooker folder
```

### Basic Usage
```
1. Open PDF in browser
2. Click extension icon
3. Click "Capture"
4. Wait for download
5. You have a ZIP with 1000s of images!
```

### Upload to AI
```
1. Use the ZIP file with DeepSeek, Claude, etc.
2. Tell AI to process all images for OCR
3. AI merges text from multiple angles
4. Get highly accurate transcription
```

### Customization
```
Edit files  Reload extension  Test
```

### Troubleshooting
```
Check console (F12)  Read TROUBLESHOOTING.md  Try solution
```

---

##  Feature Matrix

| Feature | Implemented | Documented | Tested |
|---------|-------------|-----------|--------|
| Multi-zoom capture |  |  |  |
| Crop regions |  |  |  |
| Page range selection |  |  |  |
| ZIP packaging |  |  |  |
| Metadata included |  |  |  |
| Progress indication |  |  |  |
| Error handling |  |  |  |
| PDF detection |  |  |  |
| Customization |  |  |  |
| Performance optimization |  |  |  |

---

##  Typical Workflows

### Workflow 1: Basic OCR Processing
```
1. Open PDF in browser
2. Click Pressure Cooker
3. Accept defaults (all pages, all zoom)
4. Wait for capture
5. Send ZIP to DeepSeek/Claude
6. Get OCR results
```
*Time: 5-30 minutes depending on PDF size*

---

### Workflow 2: Extract Specific Pages
```
1. Open PDF in browser
2. Click Pressure Cooker
3. Select "Custom Range"
4. Enter page range (e.g., 10-20)
5. Click Capture
6. Send ZIP to OCR
```
*Time: 1-10 minutes*

---

### Workflow 3: Customize Extension
```
1. Edit ADVANCED_CONFIG.md
2. Make changes to popup.html/js/css
3. Go to chrome://extensions/
4. Click refresh button
5. Test with a PDF
6. Iterate until satisfied
```
*Time: 10 minutes to 1 hour*

---

### Workflow 4: Debug Issues
```
1. Encounter problem
2. Open console (F12)
3. Note error message
4. Search TROUBLESHOOTING.md
5. Follow suggested fix
6. Test again
```
*Time: 2-10 minutes*

---

##  Version History

### v1.0.0 (Current)
-  Multi-zoom PDF capture
-  Regional cropping (3 regions per zoom)
-  ZIP bundling with JSZip
-  Page range selection
-  Progress indication
-  Metadata generation
-  Full documentation

---

##  Learning Paths

### Path 1: User (No coding)
1. QUICK_START.md
2. README.md (Features section)
3. GETTING_STARTED.md
4. TROUBLESHOOTING.md (as needed)

### Path 2: Customizer (Basic coding)
1. QUICK_START.md
2. ADVANCED_CONFIG.md
3. GETTING_STARTED.md
4. Try a customization
5. TROUBLESHOOTING.md (if issues)

### Path 3: Developer (Advanced coding)
1. README.md
2. DEVELOPER.md
3. Study popup.js code
4. Review enhancement ideas
5. Implement a feature
6. Test thoroughly

### Path 4: Maintainer (Full understanding)
1. Study entire codebase
2. Read all documentation
3. Create test plan
4. Build CI/CD pipeline
5. Maintain issues/PRs

---

##  Common Entry Points by Task

| Task | Start Here | Time | Difficulty |
|------|-----------|------|-----------|
| Install extension | QUICK_START.md | 3 min | Easy |
| Use the extension | README.md + popup | 5 min | Easy |
| Verify it works | GETTING_STARTED.md | 15 min | Easy |
| Fix an error | TROUBLESHOOTING.md | 5-30 min | Easy |
| Change colors | ADVANCED_CONFIG.md | 5 min | Easy |
| Add zoom level | ADVANCED_CONFIG.md | 2 min | Easy |
| Add new feature | DEVELOPER.md | 30-60 min | Hard |
| Extend architecture | DEVELOPER.md | 1-3 hours | Hard |

---

##  Pro Tips

1. **Keep backups**: Before modifying, copy the folder
2. **Test incrementally**: Test after each small change
3. **Use test PDFs**: Create known test cases
4. **Check console first**: F12  Console always shows issues
5. **Read docs completely**: Most answers are in the docs
6. **Join communities**: Chrome extension forums for help

---

##  Getting Help

### Problem Type  Where to Look
- "How do I install?"  QUICK_START.md
- "It doesn't work"  TROUBLESHOOTING.md
- "How do I customize?"  ADVANCED_CONFIG.md
- "How does it work?"  DEVELOPER.md
- "Test didn't pass"  GETTING_STARTED.md
- "I want a new feature"  DEVELOPER.md (Enhancement Ideas)

---

##  Quality Checklist

This project includes:
-  Fully functional extension
-  Clean, documented code
-  Comprehensive user guide
-  Troubleshooting guide
-  Advanced configuration guide
-  Developer documentation
-  Getting started guide
-  Technical deep-dives
-  Customization options
-  Multiple test scenarios

---

##  You're All Set!

Pick a documentation file based on your needs and dive in. Everything you need is documented.

**Enjoy capturing PDFs with Pressure Cooker!** 

---

*Last updated: 2026-05-03*
*Version: 1.0.0*
*Status: Production Ready*
