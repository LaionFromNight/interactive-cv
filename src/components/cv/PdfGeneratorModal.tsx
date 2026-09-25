import { useState } from "react";
import type { CV } from "../../lib/cvTypes";
import {
  colorSchemeOptions,
  consentOptions,
  defaultCvPdfOptions,
  templateOptions,
  type CvPdfOptions,
} from "../pdf/CvPdfOptions";
import { Modal } from "../ui/Modal";
import { DownloadIcon } from "../ui/Icons";

export function PdfGeneratorModal({
  cv,
  open,
  onClose,
}: {
  cv: CV;
  open: boolean;
  onClose: () => void;
}) {
  const [pdfOptions, setPdfOptions] =
    useState<CvPdfOptions>(defaultCvPdfOptions);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const updatePdfOption = <K extends keyof CvPdfOptions>(
    key: K,
    value: CvPdfOptions[K],
  ) => {
    setPdfOptions((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const downloadGeneratedPdf = async () => {
    setIsGeneratingPdf(true);

    try {
      const { Buffer } = await import("buffer");

      if (typeof globalThis !== "undefined" && !("Buffer" in globalThis)) {
        (globalThis as typeof globalThis & { Buffer: typeof Buffer }).Buffer =
          Buffer;
      }

      const [
        { pdf },
        { CvPdfDocument },
        { PDFDocument },
        { getPdfDocumentMetadata },
      ] = await Promise.all([
        import("@react-pdf/renderer"),
        import("../pdf/CvPdfDocument"),
        import("pdf-lib"),
        import("../pdf/PdfDocumentMetadata"),
      ]);

      const rawBlob = await pdf(
        <CvPdfDocument cv={cv} options={pdfOptions} />,
      ).toBlob();

      const metadata = getPdfDocumentMetadata(cv);

      const arrayBuffer = await rawBlob.arrayBuffer();
      const pdfDocument = await PDFDocument.load(arrayBuffer);

      pdfDocument.setTitle(metadata.title);
      pdfDocument.setAuthor(metadata.author);
      pdfDocument.setSubject(metadata.subject);
      pdfDocument.setKeywords(
        metadata.keywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean),
      );
      pdfDocument.setCreator(metadata.creator);
      pdfDocument.setProducer(metadata.producer);
      pdfDocument.setModificationDate(new Date());

      const pdfBytes = await pdfDocument.save();

      const finalBlob = new Blob([pdfBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(finalBlob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "Lukasz-Komur-CV.pdf";
      anchor.rel = "noopener noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      onClose();
    } catch (error) {
      console.error("[PdfGeneratorModal] PDF generation failed", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const describe = <T extends { id: string; description: string }>(
    options: readonly T[],
    id: string,
  ) => options.find((option) => option.id === id)?.description;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate PDF CV"
      subtitle="Pick a template, color scheme and optional consent clause — the PDF is built in your browser from the same data as this page."
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={downloadGeneratedPdf}
            disabled={isGeneratingPdf}
          >
            <DownloadIcon />
            {isGeneratingPdf ? "Generating…" : "Download PDF"}
          </button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="field-label">PDF template</span>
          <select
            className="field"
            value={pdfOptions.templateId}
            onChange={(event) =>
              updatePdfOption(
                "templateId",
                event.target.value as CvPdfOptions["templateId"],
              )
            }
          >
            {templateOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-subtle">
            {describe(templateOptions, pdfOptions.templateId)}
          </p>
        </label>

        <label className="block">
          <span className="field-label">Color scheme</span>
          <select
            className="field"
            value={pdfOptions.colorSchemeId}
            onChange={(event) =>
              updatePdfOption(
                "colorSchemeId",
                event.target.value as CvPdfOptions["colorSchemeId"],
              )
            }
          >
            {colorSchemeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-subtle">
            {describe(colorSchemeOptions, pdfOptions.colorSchemeId)}
          </p>
        </label>

        <label className="block">
          <span className="field-label">Consent clause</span>
          <select
            className="field"
            value={pdfOptions.consentStandard}
            onChange={(event) =>
              updatePdfOption(
                "consentStandard",
                event.target.value as CvPdfOptions["consentStandard"],
              )
            }
          >
            {consentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-subtle">
            {describe(consentOptions, pdfOptions.consentStandard)}
          </p>
        </label>

        <label className="block">
          <span className="field-label">Company name</span>
          <input
            className="field"
            value={pdfOptions.companyName}
            onChange={(event) =>
              updatePdfOption("companyName", event.target.value)
            }
            placeholder="Optional, e.g. Company Name"
          />
          <p className="mt-2 text-xs leading-5 text-subtle">
            Used only when a consent clause is selected.
          </p>
        </label>
      </div>
    </Modal>
  );
}
