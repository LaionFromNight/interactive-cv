import { PDFDownloadLink } from "@react-pdf/renderer";
import type { CV } from "../../lib/cvTypes";
import { CvPdfDocument } from "./CvPdfDocument";

export function CvPdfDownloadButton({ cv }: { cv: CV }) {
  const fileName = `${cv.person.full_name.replace(/\s+/g, "_")}_CV.pdf`;

  return (
    <PDFDownloadLink
      document={<CvPdfDocument cv={cv} />}
      fileName={fileName}
      className="rounded-full border border-white/10 bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-white/90"
    >
      {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
    </PDFDownloadLink>
  );
}