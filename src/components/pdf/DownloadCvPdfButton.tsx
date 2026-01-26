import type { CV } from "../../lib/cvTypes";
import { pdf } from "@react-pdf/renderer";
import { CvPdfDocument } from "./CvPdfDocument";

export function DownloadCvPdfButton({ cv }: { cv: CV }) {
  const onDownload = async () => {
    // NOTE: Generate a PDF blob in the browser (works on GitHub Pages).
    const blob = await pdf(<CvPdfDocument cv={cv} />).toBlob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Lukasz-Komur-CV.pdf";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={onDownload}
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
    >
      Download CV (PDF)
    </button>
  );
}
