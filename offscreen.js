const OFFSCREEN_TARGET = 'offscreen';

let activeCapture = null;
let cancelRequested = false;
let currentStatus = {
    isCapturing: false,
    fileName: null,
    page: 0,
    totalPages: 0,
    zoom: null,
    imagesCaptured: 0,
    totalImages: 0,
    startedAt: null,
    finishedAt: null,
    error: null
};

function log(...args) {
    console.log('[PC Offscreen]', ...args);
}

function normalizeError(error) {
    if (!error) return 'Unknown error';
    if (typeof error === 'string') return error;
    return error.message || JSON.stringify(error);
}

function updateStatus(patch) {
    currentStatus = { ...currentStatus, ...patch };
    try {
        chrome.storage.local.set({ pcCaptureStatus: currentStatus });
    } catch (e) {
        log('Failed to persist status', e);
    }

    chrome.runtime.sendMessage({ action: 'captureProgress', status: currentStatus }).catch(() => {
        // Popup may be closed.
    });
}

function configurePdfWorker() {
    if (typeof pdfjsLib === 'undefined') {
        throw new Error('pdf.js is not available in offscreen document');
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('lib/pdf.worker.min.js');
}

function ensureNotCancelled() {
    if (cancelRequested) {
        throw new Error('CAPTURE_CANCELLED');
    }
}

async function runCapture(request) {
    const {
        pdfUrl,
        pdfTitle = 'document',
        startPage = 1,
        endPage,
        zoomLevels = [100, 150, 200]
    } = request || {};

    if (!pdfUrl) {
        throw new Error('Missing pdfUrl');
    }

    if (!Array.isArray(zoomLevels) || zoomLevels.length === 0) {
        throw new Error('At least one zoom level is required');
    }

    configurePdfWorker();
    const pdf = await loadPdfDocument(pdfUrl);

    const safeStart = Math.max(1, Number(startPage) || 1);
    const safeEnd = Math.min(pdf.numPages, Number(endPage) || pdf.numPages);

    if (safeStart > safeEnd) {
        throw new Error('Invalid page range');
    }

    const totalPages = safeEnd - safeStart + 1;
    const totalImages = totalPages * zoomLevels.length * 4;
    const images = [];

    updateStatus({
        isCapturing: true,
        fileName: pdfTitle,
        page: 0,
        totalPages,
        zoom: null,
        imagesCaptured: 0,
        totalImages,
        startedAt: new Date().toISOString(),
        finishedAt: null,
        error: null
    });

    for (let pageNum = safeStart; pageNum <= safeEnd; pageNum++) {
        ensureNotCancelled();
        const page = await pdf.getPage(pageNum);

        for (const zoomLevel of zoomLevels) {
            ensureNotCancelled();
            const created = await capturePageImagesAtZoom(page, pageNum, zoomLevel);
            images.push(...created);

            updateStatus({
                page: pageNum - safeStart + 1,
                zoom: zoomLevel,
                imagesCaptured: images.length
            });

            // Yield between chunks to keep the worker responsive.
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    const blob = await buildCaptureZip({
        title: pdfTitle,
        totalPages,
        images,
        includeReadme: false
    });
    const fileName = `${pdfTitle}.zip`;
    const url = URL.createObjectURL(blob);

    await chrome.downloads.download({
        url,
        filename: fileName,
        saveAs: false,
        conflictAction: 'uniquify'
    });

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 30000);

    updateStatus({
        isCapturing: false,
        finishedAt: new Date().toISOString(),
        zoom: null
    });

    return {
        success: true,
        totalPages,
        totalImages: images.length,
        fileName
    };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.__target !== OFFSCREEN_TARGET) {
        return;
    }

    (async () => {
        try {
            if (message.action === 'getCaptureStatus') {
                sendResponse({ success: true, status: currentStatus });
                return;
            }

            if (message.action === 'resetCapture') {
                cancelRequested = false;
                activeCapture = null;
                updateStatus({
                    isCapturing: false,
                    fileName: null,
                    page: 0,
                    totalPages: 0,
                    zoom: null,
                    imagesCaptured: 0,
                    totalImages: 0,
                    startedAt: null,
                    finishedAt: new Date().toISOString(),
                    error: null
                });
                sendResponse({ success: true });
                return;
            }

            if (message.action === 'cancelCapture') {
                cancelRequested = true;
                sendResponse({ success: true });
                return;
            }

            if (message.action === 'startCapture') {
                if (activeCapture) {
                    sendResponse({
                        error: 'Capture already in progress',
                        status: currentStatus
                    });
                    return;
                }

                cancelRequested = false;
                activeCapture = runCapture(message)
                    .catch((error) => {
                        const normalized = normalizeError(error);
                        if (normalized === 'CAPTURE_CANCELLED') {
                            updateStatus({
                                isCapturing: false,
                                finishedAt: new Date().toISOString(),
                                error: null
                            });
                            return { success: false, cancelled: true };
                        }

                        updateStatus({
                            isCapturing: false,
                            finishedAt: new Date().toISOString(),
                            error: normalized
                        });
                        throw error;
                    })
                    .finally(() => {
                        activeCapture = null;
                    });

                const result = await activeCapture;
                sendResponse(result);
                return;
            }

            sendResponse({ error: `Unknown action: ${message.action}` });
        } catch (error) {
            sendResponse({ error: normalizeError(error) });
        }
    })();

    return true;
});

// Signal the service worker that this offscreen document is ready.
chrome.runtime.sendMessage({ action: 'offscreenReady' }).catch(() => {
    // Service worker may be restarting, next request will recover.
});

log('Offscreen document initialized');
