// Set up PDF.js worker with retry logic
function setupPdfJs() {
    if (typeof pdfjsLib === 'undefined') {
        console.warn('[PC] PDF.js not loaded yet, will retry');
        return setTimeout(setupPdfJs, 100);
    }
    
    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('lib/pdf.worker.min.js');
        logger.log('PDF.js worker configured successfully');
    } catch (e) {
        logger.error('Failed to setup PDF.js', e);
    }
}

// Wait for external scripts to load
function waitForScripts() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50; // Wait up to 5 seconds
        
        function check() {
            if (typeof pdfjsLib !== 'undefined' && typeof JSZip !== 'undefined' && typeof saveAs !== 'undefined') {
                setupPdfJs();
                resolve(true);
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(check, 100);
            } else {
                logger.error('External scripts failed to load', {
                    pdfjsLib: typeof pdfjsLib,
                    JSZip: typeof JSZip,
                    saveAs: typeof saveAs
                });
                resolve(false);
            }
        }
        check();
    });
}

// Logging system
const logger = {
    logs: [],
    errors: [],
    
    log: function(message, data) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: 'INFO',
            message,
            data: data || null
        };
        this.logs.push(logEntry);
        console.log(`[PC INFO] ${message}`, data);
        this.saveLogs();
    },
    
    error: function(message, error) {
        const timestamp = new Date().toISOString();
        const errorEntry = {
            timestamp,
            level: 'ERROR',
            message,
            error: error ? error.toString() : null,
            stack: error ? error.stack : null
        };
        this.errors.push(errorEntry);
        console.error(`[PC ERROR] ${message}`, error);
        this.saveLogs();
    },
    
    warn: function(message, data) {
        const timestamp = new Date().toISOString();
        console.warn(`[PC WARN] ${message}`, data);
        this.saveLogs();
    },
    
    saveLogs: function() {
        try {
            const allLogs = {
                timestamp: new Date().toISOString(),
                logs: this.logs,
                errors: this.errors,
                environment: {
                    browser: this.detectBrowser(),
                    userAgent: navigator.userAgent
                }
            };
            localStorage.setItem('pc_logs', JSON.stringify(allLogs));
        } catch (e) {
            console.warn('Could not save logs to localStorage', e);
        }
    },
    
    detectBrowser: function() {
        const ua = navigator.userAgent;
        if (ua.includes('Brave')) return 'Brave';
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Edge')) return 'Edge';
        if (ua.includes('Firefox')) return 'Firefox';
        return 'Unknown';
    },
    
    getLogs: function() {
        try {
            return JSON.parse(localStorage.getItem('pc_logs') || '{}');
        } catch (e) {
            return {};
        }
    },
    
    downloadLogs: function() {
        const logs = this.getLogs();
        const logText = JSON.stringify(logs, null, 2);
        const blob = new Blob([logText], { type: 'application/json' });
        saveAs(blob, `pressure_cooker_logs_${new Date().toISOString().split('T')[0]}.json`);
    },
    
    clearLogs: function() {
        this.logs = [];
        this.errors = [];
        localStorage.removeItem('pc_logs');
        console.log('[PC] Logs cleared');
    }
};

// State management
let state = {
    pdfUrl: null,
    pdfTitle: null,
    totalPages: 0,
    capturedImages: [],
    isCapturing: false,
    cancelRequested: false,
    captureStats: {
        startTime: null,
        endTime: null,
        pagesProcessed: 0,
        imagesCreated: 0
    }
};

// DOM elements
const pdfTitleInput = document.getElementById('pdfTitle');
const pageModeSelect = document.getElementById('pageMode');
const rangeContainer = document.getElementById('rangeContainer');
const startPageInput = document.getElementById('startPage');
const endPageInput = document.getElementById('endPage');
const captureBtn = document.getElementById('captureBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const statsContainer = document.getElementById('statsContainer');
const capturedPagesSpan = document.getElementById('capturedPages');
const totalImagesSpan = document.getElementById('totalImages');

// Help modal elements
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeHelpBtn = document.getElementById('closeHelpBtn');

// Progress tracking elements
const progressPageInfo = document.getElementById('progressPageInfo');
const progressZoomInfo = document.getElementById('progressZoomInfo');
const progressImageInfo = document.getElementById('progressImageInfo');
const progressFileInfo = document.getElementById('progressFileInfo');
const cancelCaptureBtn = document.getElementById('cancelCaptureBtn');

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    logger.log('Extension popup initialized');
    
    // Clear progress details on initial load
    clearProgressDetails();
    
    // Wait for external scripts to load
    const scriptsReady = await waitForScripts();
    if (!scriptsReady) {
        showError('Failed to load required libraries. Please refresh the popup.');
        logger.error('Initialization failed - scripts not ready');
        return;
    }
    
    await initializePopup();
});

async function initializePopup() {
    try {
        // Get current tab info
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentTab = tabs[0];
        logger.log('Current tab detected', { url: currentTab.url, title: currentTab.title });

        // Detect PDF URL and title
        detectPdfInfo(currentTab);

        if (!state.pdfUrl) {
            showError('No PDF detected. Please open a PDF file in this tab.');
            captureBtn.disabled = true;
            logger.warn('No PDF found in current tab');
            return;
        }

        // Try to get PDF info
        try {
            await loadPdfInfo();
            logger.log('PDF loaded successfully', { pages: state.totalPages, title: state.pdfTitle });
        } catch (err) {
            showError('Unable to load PDF. Make sure it is a valid PDF file.');
            captureBtn.disabled = true;
            logger.error('PDF loading failed', err);
        }
    } catch (err) {
        showError(`Error initializing: ${err.message}`);
        logger.error('Popup initialization error', err);
    }
}

function detectPdfInfo(tab) {
    const url = tab.url || '';
    let pdfUrl = null;
    let pdfTitle = null;

    // Check if it's a PDF URL
    if (url.includes('.pdf')) {
        pdfUrl = url;
        // Extract filename from URL
        const match = url.match(/([^/]+\.pdf)(?:[?#]|$)/i);
        if (match) {
            pdfTitle = decodeURIComponent(match[1]).replace(/\.pdf$/i, '');
        }
    }

    // Try to get from tab title
    if (tab.title) {
        const titleMatch = tab.title.match(/([^/]+\.pdf)/i);
        if (titleMatch) {
            pdfTitle = titleMatch[1].replace(/\.pdf$/i, '');
            pdfUrl = tab.url;
        }
    }

    state.pdfUrl = pdfUrl;
    state.pdfTitle = pdfTitle || 'document';
    pdfTitleInput.value = state.pdfTitle;

    if (progressFileInfo) {
        progressFileInfo.textContent = `File: ${state.pdfTitle}`;
    }
}

async function loadPdfInfo() {
    if (!state.pdfUrl) throw new Error('No PDF URL found');

    try {
        const pdf = await loadPdfDocument(state.pdfUrl);
        state.totalPages = pdf.numPages;
        endPageInput.placeholder = state.totalPages.toString();
        endPageInput.value = state.totalPages.toString();
    } catch (err) {
        throw new Error(`PDF loading error: ${err.message}`);
    }
}

// Help modal functions
function openHelpModal() {
    helpModal.style.display = 'flex';
}

function closeHelpModal() {
    helpModal.style.display = 'none';
}

// Event listeners
pageModeSelect.addEventListener('change', (e) => {
    rangeContainer.style.display = e.target.value === 'range' ? 'grid' : 'none';
});

captureBtn.addEventListener('click', handleCapture);

if (cancelCaptureBtn) {
    cancelCaptureBtn.addEventListener('click', () => {
        if (!state.isCapturing) return;
        state.cancelRequested = true;
        progressText.textContent = 'Cancelling capture...';
        logger.warn('Capture cancel requested by user');
    });
}

// Help button listeners
if (helpBtn) {
    helpBtn.addEventListener('click', openHelpModal);
}

if (closeHelpBtn) {
    closeHelpBtn.addEventListener('click', closeHelpModal);
}

// Close help modal when clicking outside
if (helpModal) {
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            closeHelpModal();
        }
    });
}

// Log viewer buttons removed - these are debug features not needed in production

async function handleCapture() {
    try {
        if (state.isCapturing) return;

        clearMessages();
        state.capturedImages = [];
        state.isCapturing = true;
        state.cancelRequested = false;
        state.captureStats.startTime = Date.now();
        captureBtn.disabled = true;
        logger.log('Capture started');

        // Get page range
        let startPage = 1;
        let endPage = state.totalPages;

        if (pageModeSelect.value === 'range') {
            startPage = Math.max(1, parseInt(startPageInput.value) || 1);
            endPage = Math.min(state.totalPages, parseInt(endPageInput.value) || state.totalPages);

            if (startPage > endPage) {
                showError('Start page must be less than or equal to end page');
                state.isCapturing = false;
                captureBtn.disabled = false;
                logger.warn('Invalid page range', { startPage, endPage });
                return;
            }
        }

        // Get zoom levels
        const zoomCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
        const zoomLevels = Array.from(zoomCheckboxes).map(cb => parseInt(cb.value));

        if (zoomLevels.length === 0) {
            showError('Please select at least one zoom level');
            state.isCapturing = false;
            captureBtn.disabled = false;
            logger.warn('No zoom levels selected');
            return;
        }

        logger.log('Capture configuration', { 
            startPage, 
            endPage, 
            zoomLevels,
            browser: logger.detectBrowser()
        });

        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';

        if (progressFileInfo) {
            progressFileInfo.textContent = `File: ${state.pdfTitle || 'document'}`;
        }
        
        // Add visual effect - initial animation
        addCaptureEffect();

        // Load PDF (handles both file:// and http(s):// URLs)
        const pdf = await loadPdfDocument(state.pdfUrl);
        logger.log('PDF document loaded', { totalPages: pdf.numPages });

        // Capture pages
        const totalImagesToCapture = (endPage - startPage + 1) * zoomLevels.length * 4;
        let imagesCaptured = 0;

        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
            ensureCaptureNotCancelled();
            progressText.textContent = `Capturing page ${pageNum}/${endPage}...`;
            
            // Add visual scroll effect
            animateProgressUpdate();

            const page = await pdf.getPage(pageNum);
            logger.log(`Processing page ${pageNum}`);

            for (const zoomLevel of zoomLevels) {
                ensureCaptureNotCancelled();
                const images = await capturePageImagesAtZoom(page, pageNum, zoomLevel);
                state.capturedImages.push(...images);
                state.captureStats.imagesCreated += images.length;

                imagesCaptured += images.length;
                const progress = (imagesCaptured / totalImagesToCapture) * 100;
                progressBar.style.width = `${Math.min(progress, 99)}%`;
                
                // Update progress display with current page, zoom, and image count
                updateProgressDisplay(pageNum, endPage, zoomLevel, totalImagesToCapture, imagesCaptured);
            }
            
            state.captureStats.pagesProcessed = pageNum - startPage + 1;
        }

        progressText.textContent = 'Creating ZIP file...';
        progressBar.style.width = '95%';
        ensureCaptureNotCancelled();

        addZoomEffect();

        const blob = await buildCaptureZip({
            title: state.pdfTitle,
            totalPages: endPage - startPage + 1,
            images: state.capturedImages,
            progressCallback: (metadata) => {
                const finalizePercent = Math.min(100, Math.max(0, metadata.percent || 0));
                progressText.textContent = `Finalizing ZIP... ${Math.round(finalizePercent)}%`;
                progressBar.style.width = `${95 + (finalizePercent * 0.05)}%`;
            }
        });

        const zipFileName = `${state.pdfTitle}.zip`;
        saveAs(blob, zipFileName);
    } catch (err) {
        if (err && err.message === 'CAPTURE_CANCELLED') {
            showSuccess('Capture cancelled.');
            logger.log('Capture cancelled before completion');
        } else {
            showError(`Capture failed: ${err.message}`);
            logger.error('Capture error', err);
        }
        progressContainer.style.display = 'none';
        clearProgressDetails();
    } finally {
        state.isCapturing = false;
        state.cancelRequested = false;
        captureBtn.disabled = false;
    }
}

// Visual Effects
function addCaptureEffect() {
    progressBar.style.transition = 'width 0.3s ease, box-shadow 0.3s ease';
    progressBar.style.boxShadow = '0 0 10px rgba(192, 80, 77, 0.5)';
}

function animateProgressUpdate() {
    // Subtle scroll/pulse effect
    progressContainer.style.transform = 'scale(1.01)';
    setTimeout(() => {
        progressContainer.style.transform = 'scale(1)';
    }, 100);
}

function addZoomEffect() {
    // Zoom in effect on progress bar
    progressBar.style.transform = 'scaleX(1.05)';
    setTimeout(() => {
        progressBar.style.transform = 'scaleX(1)';
    }, 300);
}

function addCompletionEffect() {
    // Success animation
    progressBar.style.background = 'linear-gradient(90deg, #d85450, #8b3a3a, #d85450)';
    progressBar.style.backgroundSize = '200% 100%';
    progressBar.style.animation = 'gradientShift 2s ease-in-out';
}

// Update progress display with detailed information
function updateProgressDisplay(currentPage, totalPages, currentZoom, totalImages, imagesCaptured) {
    // Update page info
    if (progressPageInfo) {
        progressPageInfo.textContent = `Page: ${currentPage}/${totalPages}`;
        progressPageInfo.classList.add('active');
    }
    
    // Update zoom info
    if (progressZoomInfo) {
        progressZoomInfo.textContent = `Zoom: ${currentZoom}%`;
        progressZoomInfo.classList.add('active');
    }
    
    // Update image count info
    if (progressImageInfo) {
        progressImageInfo.textContent = `Images: ${imagesCaptured}/${totalImages}`;
    }
    
    // Update zoom level indicators
    updateZoomIndicators(currentZoom);
}

// Visual feedback for active zoom level
function updateZoomIndicators(activeZoom) {
    const zoom100 = document.getElementById('zoom100');
    const zoom150 = document.getElementById('zoom150');
    const zoom200 = document.getElementById('zoom200');
    
    // Reset all
    [zoom100, zoom150, zoom200].forEach(el => {
        if (el) {
            el.classList.remove('active', 'processing');
        }
    });
    
    // Highlight current zoom
    const currentEl = document.getElementById(`zoom${activeZoom}`);
    if (currentEl) {
        currentEl.classList.add('active');
        currentEl.classList.add('processing');
    }
}

// Clear progress details
function clearProgressDetails() {
    if (progressFileInfo) progressFileInfo.textContent = `File: ${state.pdfTitle || '--'}`;
    if (progressPageInfo) progressPageInfo.textContent = 'Page: --/--';
    if (progressZoomInfo) progressZoomInfo.textContent = 'Zoom: --';
    if (progressImageInfo) progressImageInfo.textContent = 'Images: --';
    
    const zoomLevels = document.querySelectorAll('.zoom-level');
    zoomLevels.forEach(el => el.classList.remove('active', 'processing'));
}

function clearMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    errorMessage.textContent = '';
    successMessage.textContent = '';
}

function showError(message) {
    clearMessages();
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    logger.error('User error message', message);
}

function showSuccess(message) {
    clearMessages();
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    logger.log('User success message', message);
}

function ensureCaptureNotCancelled() {
    if (state.cancelRequested) {
        throw new Error('CAPTURE_CANCELLED');
    }
}
