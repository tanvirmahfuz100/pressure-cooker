function configurePdfWorker() {
    if (typeof pdfjsLib === 'undefined') {
        throw new Error('pdf.js is not available');
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('lib/pdf.worker.min.js');
}

async function loadPdfDocument(pdfUrl) {
    let pdfData = pdfUrl;

    if (pdfUrl.startsWith('file://')) {
        const response = await fetch(pdfUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch local PDF: ${response.status} ${response.statusText}`);
        }
        pdfData = await response.arrayBuffer();
    }

    return pdfjsLib.getDocument(pdfData).promise;
}

function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Failed to create image blob from canvas'));
                return;
            }
            resolve(blob);
        }, 'image/png');
    });
}

async function capturePageImagesAtZoom(page, pageNumber, zoomPercent, baseScale = 2) {
    const scale = (zoomPercent / 100) * baseScale;
    const viewport = page.getViewport({ scale });

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = viewport.width;
    pageCanvas.height = viewport.height;

    const pageContext = pageCanvas.getContext('2d', { willReadFrequently: true });
    pageContext.fillStyle = 'white';
    pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

    await page.render({ canvasContext: pageContext, viewport }).promise;

    const images = [{
        name: `page_${pageNumber}_full_${zoomPercent}%.png`,
        blob: await canvasToBlob(pageCanvas)
    }];

    const regionHeight = pageCanvas.height / 3;
    const regions = [
        { name: 'a', y: 0 },
        { name: 'b', y: regionHeight },
        { name: 'c', y: regionHeight * 2 }
    ];

    for (const region of regions) {
        const regionCanvas = document.createElement('canvas');
        regionCanvas.width = pageCanvas.width;
        regionCanvas.height = Math.min(regionHeight, pageCanvas.height - region.y);

        const regionContext = regionCanvas.getContext('2d', { willReadFrequently: true });
        regionContext.fillStyle = 'white';
        regionContext.fillRect(0, 0, regionCanvas.width, regionCanvas.height);
        regionContext.drawImage(
            pageCanvas,
            0,
            region.y,
            pageCanvas.width,
            regionCanvas.height,
            0,
            0,
            regionCanvas.width,
            regionCanvas.height
        );

        images.push({
            name: `page_${pageNumber}_${region.name}_${zoomPercent}%.png`,
            blob: await canvasToBlob(regionCanvas)
        });
    }

    return images;
}

function buildCaptureMetadata({ title, totalPages, images, captureDate = new Date().toISOString() }) {
    return {
        title,
        totalPages,
        totalImages: images.length,
        captureDate,
        structure: {
            perPage: totalPages > 0 ? images.length / totalPages : 0,
            fullPageImages: images.filter(image => image.name.includes('_full_')).length,
            croppedImages: images.filter(image => !image.name.includes('_full_')).length
        }
    };
}

async function buildCaptureZip({ title, totalPages, images, progressCallback, includeReadme = true }) {
    const zip = new JSZip();
    const imagesFolder = zip.folder('images');

    for (const image of images) {
        imagesFolder.file(image.name, image.blob);
    }

    zip.file('metadata.json', JSON.stringify(buildCaptureMetadata({ title, totalPages, images }), null, 2));

    if (includeReadme) {
        zip.file('README.md', `# ${title} - Captured Images

This ZIP contains multi-resolution captures of the PDF for OCR processing.

## Structure
- **Full page images**: page_X_full_Y%.png (Y = zoom percentage)
- **Cropped regions**: page_X_a_Y%.png (top), page_X_b_Y%.png (middle), page_X_c_Y%.png (bottom)

## Metadata
- Total Pages: ${totalPages}
- Total Images: ${images.length}
- Capture Date: ${new Date().toLocaleString()}

## Usage
Use these images with an OCR tool like DeepSeek or Tesseract for text extraction.
The multiple zoom levels ensure better OCR accuracy on different content.
`);
    }

    return zip.generateAsync(
        {
            type: 'blob',
            compression: 'STORE',
            streamFiles: true
        },
        (metadata) => {
            if (progressCallback) {
                progressCallback(metadata);
            }
        }
    );
}