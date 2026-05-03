// Background service worker for Pressure Cooker extension
// Manages offscreen document and routes capture messages

let offscreenId = null;
const OFFSCREEN_TARGET = 'offscreen';
let offscreenReady = false;
let offscreenReadyWaiters = [];

function markOffscreenReady() {
    offscreenReady = true;
    const waiters = offscreenReadyWaiters;
    offscreenReadyWaiters = [];
    waiters.forEach(resolve => {
        try {
            resolve(true);
        } catch (e) {
            console.warn('[PC Background] Failed to resolve offscreen waiter:', e);
        }
    });
}

function waitForOffscreenReady(timeoutMs = 5000) {
    if (offscreenReady) {
        return Promise.resolve(true);
    }

    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            resolve(false);
        }, timeoutMs);

        offscreenReadyWaiters.push((value) => {
            clearTimeout(timer);
            resolve(value);
        });
    });
}

// Detect browser
function detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Brave')) return 'Brave';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Edge')) return 'Edge';
    return 'Chromium';
}

console.log(`[PC Background] Extension loaded on ${detectBrowser()}`);

chrome.runtime.onInstalled.addListener(() => {
    console.log('[PC Background] Extension installed');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Enable extension icon only for PDF pages
    if (tab.url && tab.url.includes('.pdf')) {
        try {
            chrome.action.enable(tabId).catch(e => console.log('[PC] Action enable error:', e));
        } catch (e) {
            console.log('[PC] Chrome.action error:', e);
        }
    } else if (tab.title && tab.title.includes('.pdf')) {
        try {
            chrome.action.enable(tabId).catch(e => console.log('[PC] Action enable error:', e));
        } catch (e) {
            console.log('[PC] Chrome.action error:', e);
        }
    }
});

// Create or get offscreen document for background processing
async function getOffscreenDocument() {
    try {
        // Check if offscreen API is available (Chrome 109+, not yet in Brave)
        if (!chrome.offscreen) {
            console.warn('[PC Background] chrome.offscreen API not available in this browser');
            return null;
        }

        const existingContexts = await chrome.runtime.getContexts({
            contextTypes: ['OFFSCREEN_DOCUMENT']
        });

        if (existingContexts.length > 0) {
            console.log('[PC Background] Reusing existing offscreen document');
            offscreenReady = true;
            return existingContexts[0];
        }

        console.log('[PC Background] Creating offscreen document');
        await chrome.offscreen.createDocument({
            url: chrome.runtime.getURL('offscreen.html'),
            reasons: ['DOM_PARSER'],
            justification: 'PDF processing and image rendering in background'
        });

        const contexts = await chrome.runtime.getContexts({
            contextTypes: ['OFFSCREEN_DOCUMENT']
        });

        if (contexts.length > 0) {
            offscreenId = contexts[0].contextId;
            console.log('[PC Background] Offscreen document created with ID:', offscreenId);
            return contexts[0];
        }
    } catch (err) {
        console.error('[PC Background] Failed to create offscreen document:', err);
    }
    return null;
}

// Handle capture requests from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.action === 'offscreenReady') {
        markOffscreenReady();
        try { sendResponse({ success: true }); } catch (e) {}
        return;
    }

    if (message?.__target === OFFSCREEN_TARGET) {
        return;
    }

    if (message.action === 'ensureOffscreen') {
        // Popup requesting that offscreen document be created
        ensureOffscreenExists().then(success => {
            try { sendResponse({ success }); } catch(e) { console.warn('[PC Background] sendResponse error:', e); }
        }).catch(err => {
            console.error('[PC Background] Error ensuring offscreen:', err);
            let errorMsg = typeof err === 'string' ? err : (err?.message || JSON.stringify(err));
            try { sendResponse({ success: false, error: errorMsg }); } catch(e) { console.warn('[PC Background] sendResponse error:', e); }
        });
        return true; // Keep channel open for async
    } else if (message.action === 'startCapture') {
        // Popup sending capture request - relay to offscreen document
        relayToOffscreen(message, sendResponse);
        return true;
    } else if (message.action === 'resetCapture') {
        // Popup requesting reset of stuck capture
        console.log('[PC Background] Relaying resetCapture to offscreen');
        chrome.runtime.sendMessage({ ...message, __target: OFFSCREEN_TARGET }).catch(e => {
            console.warn('[PC Background] Could not send reset to offscreen:', e);
        });
        try { sendResponse({ success: true }); } catch(e) { console.warn('[PC Background] sendResponse error:', e); }
    } else if (message.action === 'cancelCapture') {
        if (chrome.offscreen) {
            chrome.runtime.sendMessage({ action: 'cancelCapture', __target: OFFSCREEN_TARGET }).catch(e => {
                console.warn('[PC Background] Could not send cancel to offscreen:', e);
            });
        }
        try { sendResponse({ success: true }); } catch(e) { console.warn('[PC Background] sendResponse error:', e); }
    } else if (message.action === 'getCaptureStatus') {
        console.log('[PC Background] getCaptureStatus requested by popup');
        relayToOffscreen(message, sendResponse);
        return true;
    }
    // Ignore unknown messages to prevent Chrome from throwing errors
});

async function relayToOffscreen(message, sendResponse) {
    try {
        const offscreen = await ensureOffscreenExists();
        if (!offscreen) {
            try { sendResponse({ error: 'Failed to create offscreen document' }); } catch(e) {}
            return;
        }

        const ready = await waitForOffscreenReady();
        if (!ready) {
            if (message.action === 'getCaptureStatus') {
                console.warn('[PC Background] Offscreen not signaled ready - attempting getCaptureStatus');
                try {
                    if (chrome && chrome.storage && chrome.storage.local) {
                        chrome.storage.local.get('pcCaptureStatus', (items) => {
                            const err = chrome.runtime.lastError;
                            if (err) {
                                console.warn('[PC Background] storage.local.get failed:', err.message);
                                try { sendResponse({ error: 'Offscreen not ready', status: null }); } catch(e) {}
                                return;
                            }
                            const status = items?.pcCaptureStatus || null;
                            try { sendResponse({ success: !!status, status }); } catch(e) { console.warn('[PC Background] sendResponse error:', e); }
                        });
                        return;
                    }
                } catch (e) {
                    console.warn('[PC Background] storage.local not available to retrieve status', e);
                }
            } else if (message.action === 'startCapture') {
                console.warn('[PC Background] Rejecting startCapture - offscreen not ready yet');
                try { sendResponse({ error: 'Offscreen document not ready' }); } catch(e) {}
                return;
            }

            try { sendResponse({ error: 'Offscreen document not ready yet' }); } catch(e) {}
            return;
        }

        // Forward to offscreen document
        console.log('[PC Background] Relaying', message.action, 'to offscreen');
        chrome.runtime.sendMessage({ ...message, __target: OFFSCREEN_TARGET }, (response) => {
            if (chrome.runtime.lastError) {
                const errorMessage = chrome.runtime.lastError?.message || JSON.stringify(chrome.runtime.lastError);
                console.error('[PC Background] Offscreen response error:', errorMessage);
                try { sendResponse({ error: errorMessage }); } catch(e) {}
                return;
            }

            // If offscreen reports 'already in progress', attach the current status (if available)
            try {
                if (response && response.error && typeof response.error === 'string' && response.error.toLowerCase().includes('already in progress')) {
                    // Request status directly from offscreen
                    chrome.runtime.sendMessage({ action: 'getCaptureStatus', __target: OFFSCREEN_TARGET }, (statusResp) => {
                        if (chrome.runtime.lastError) {
                            console.warn('[PC Background] Failed to fetch status after already-in-progress:', chrome.runtime.lastError.message);
                            try { sendResponse(response); } catch(e) { console.warn('[PC Background] sendResponse error:', e); }
                        } else {
                            const status = statusResp?.status || statusResp;
                            try { sendResponse({ ...response, status }); } catch(e) { console.warn('[PC Background] sendResponse error:', e); }
                        }
                    });
                } else {
                    console.log('[PC Background] Offscreen response received, relaying to popup');
                    try { sendResponse(response); } catch(e) { console.warn('[PC Background] sendResponse error:', e); }
                }
            } catch (e) {
                console.warn('[PC Background] Error handling offscreen response:', e);
                try { sendResponse(response); } catch(err) { console.warn('[PC Background] sendResponse error:', err); }
            }
        });
    } catch (err) {
        console.error('[PC Background] Relay error:', err);
        let errorMsg = typeof err === 'string' ? err : (err?.message || JSON.stringify(err));
        try { sendResponse({ error: errorMsg }); } catch(e) { console.warn('[PC Background] sendResponse error:', e); }
    }
}

async function ensureOffscreenExists() {
    if (!chrome.offscreen) {
        throw new Error('Offscreen API not available');
    }

    try {
        const contexts = await chrome.runtime.getContexts({
            contextTypes: ['OFFSCREEN_DOCUMENT']
        });

        if (contexts.length > 0) {
            console.log('[PC Background] Offscreen document already exists');
            return true;
        }

        console.log('[PC Background] Creating new offscreen document');
        await chrome.offscreen.createDocument({
            url: chrome.runtime.getURL('offscreen.html'),
            reasons: ['DOM_PARSER'],
            justification: 'PDF processing and image rendering in background'
        });

        console.log('[PC Background] Offscreen document created successfully');
        return true;
    } catch (err) {
        console.error('[PC Background] Failed to create/ensure offscreen document:', err);
        throw err;
    }
}

// Route progress messages from offscreen back to popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'captureProgress') {
        // Broadcast to all popup windows
        chrome.runtime.sendMessage(message).catch(e => {
            // Popup might not be open, that's okay
        });
    }
});

// Clean up old logs (keep only last 30 days) - optional feature
if (chrome.alarms) {
    chrome.alarms.create('cleanupLogs', { periodInMinutes: 24 * 60 });
    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'cleanupLogs') {
            try {
                const logs = JSON.parse(localStorage.getItem('pc_logs') || '{}');
                if (logs.timestamp) {
                    const logDate = new Date(logs.timestamp);
                    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    if (logDate < thirtyDaysAgo) {
                        localStorage.removeItem('pc_logs');
                        console.log('[PC Background] Old logs cleaned up');
                    }
                }
            } catch (e) {
                console.log('[PC Background] Cleanup error:', e);
            }
        }
    });
} else {
    console.log('[PC Background] chrome.alarms not available on this browser');
}
