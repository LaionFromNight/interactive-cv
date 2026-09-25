import { Document } from "@react-pdf/renderer";
import type { CV } from "../../lib/cvTypes";
import type { CvPdfOptions } from "./CvPdfOptions";
import { ClassicLayout } from "./layouts/ClassicLayout";
import { ElegantLayout } from "./layouts/ElegantLayout";
import { ModernLayout } from "./layouts/ModernLayout";
import { SidebarLayout } from "./layouts/SidebarLayout";
import { TimelineLayout } from "./layouts/TimelineLayout";
import type { LayoutProps } from "./layouts/styles";
import { buildCvViewModel, type CvPdfAssets } from "./model/buildCvViewModel";
import { getPdfDocumentMetadata } from "./PdfDocumentMetadata";
import { createPdfTemplateConfig } from "./PdfTemplateConfig";
import { createPdfTheme } from "./theme/createPdfTheme";

const LAYOUTS: Record<CvPdfOptions["layoutId"], (props: LayoutProps) => React.ReactElement> = {
  classic: ClassicLayout,
  sidebar: SidebarLayout,
  modern: ModernLayout,
  elegant: ElegantLayout,
  timeline: TimelineLayout,
};

export function CvPdfDocument({
  cv,
  options,
  assets,
}: {
  cv: CV;
  options: CvPdfOptions;
  assets: CvPdfAssets;
}) {
  const theme = createPdfTheme(options);
  const vm = buildCvViewModel(cv, options, createPdfTemplateConfig(cv), assets);
  const metadata = getPdfDocumentMetadata(cv);
  const Layout = LAYOUTS[options.layoutId] ?? SidebarLayout;

  return (
    <Document
      author={metadata.author}
      title={metadata.title}
      subject={metadata.subject}
      keywords={metadata.keywords}
      creator={metadata.creator}
      producer={metadata.producer}
      language="en"
    >
      <Layout vm={vm} theme={theme} />
    </Document>
  );
}
