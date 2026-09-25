import { useEffect, useRef, useState } from "react";

type PdfJs = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let pdfJsPromise: Promise<PdfJs> | null = null;

function loadPdfJs() {
  if (!pdfJsPromise) {
    pdfJsPromise = Promise.all([
      import("pdfjs-dist/legacy/build/pdf.mjs"),
      import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url"),
    ]).then(([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    });
  }

  return pdfJsPromise;
}

/**
 * Renders every page of a PDF blob to canvases with pdf.js.
 * Unlike an <iframe>, this looks identical on every browser and on mobile.
 * New pages replace the old ones only when fully rendered, so updates never flicker.
 */
export function PdfPreview({
  blob,
  onPageCount,
  onError,
}: {
  blob: Blob | null;
  onPageCount?: (count: number) => void;
  onError?: (error: unknown) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Callbacks in refs so parents can pass inline functions without re-rendering the PDF.
  const onPageCountRef = useRef(onPageCount);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onPageCountRef.current = onPageCount;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    let frame = 0;
    const observer = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Round to avoid re-rendering on sub-pixel changes.
        setWidth(Math.round(entry.contentRect.width / 8) * 8);
      });
    });

    observer.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !blob || width === 0) return;

    let cancelled = false;

    (async () => {
      try {
        const pdfjs = await loadPdfJs();
        const data = new Uint8Array(await blob.arrayBuffer());
        const document = await pdfjs.getDocument({ data }).promise;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const pages: HTMLCanvasElement[] = [];

        for (let index = 1; index <= document.numPages; index += 1) {
          if (cancelled) break;

          const page = await document.getPage(index);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = (width / baseViewport.width) * pixelRatio;
          const viewport = page.getViewport({ scale });

          const canvas = window.document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.className = "pdf-preview-page";
          canvas.setAttribute("aria-label", `Page ${index} of ${document.numPages}`);
          canvas.setAttribute("role", "img");

          await page.render({ canvas, viewport }).promise;
          pages.push(canvas);
        }

        if (!cancelled) {
          container.replaceChildren(...pages);
          onPageCountRef.current?.(document.numPages);
        }

        await document.destroy();
      } catch (error) {
        if (!cancelled) onErrorRef.current?.(error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [blob, width]);

  return <div ref={containerRef} className="pdf-preview-pages" />;
}
