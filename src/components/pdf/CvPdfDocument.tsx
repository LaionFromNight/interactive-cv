import type { CV } from "../../lib/cvTypes";
import {
  defaultCvPdfOptions,
  type CvPdfOptions,
} from "./CvPdfOptions";
import { createPdfTemplateConfig } from "./PdfTemplateConfig";
import { amberExecutiveStyles } from "./styles/amberExecutive";
import { blueEngineeringStyles } from "./styles/blueEngineering";
import { emeraldArchitectStyles } from "./styles/emeraldArchitect";
import { graphiteMonoStyles } from "./styles/graphiteMono";
import { highContrastAccessibleStyles } from "./styles/highContrastAccessible";
import { ExecutiveLightTemplate } from "./templates/ExecutiveLightTemplate";
import { AmericanResumeTemplate } from "./templates/AmericanResumeTemplate";
import { OnePageGradientTemplate } from "./templates/OnePageGradientTemplate";

function getStyles(options: CvPdfOptions) {
  switch (options.colorSchemeId) {
    case "blueEngineering":
      return blueEngineeringStyles;

    case "graphiteMono":
      return graphiteMonoStyles;

    case "amberExecutive":
      return amberExecutiveStyles;

    case "emeraldArchitect":
      return emeraldArchitectStyles;

    case "highContrastAccessible":
      return highContrastAccessibleStyles;

    default:
      return emeraldArchitectStyles;
  }
}

export function CvPdfDocument({
  cv,
  options = defaultCvPdfOptions,
}: {
  cv: CV;
  options?: CvPdfOptions;
}) {
  const styles = getStyles(options);
  const templateConfig = createPdfTemplateConfig(cv);

  switch (options.templateId) {
    case "americanResume":
      return (
        <AmericanResumeTemplate
          cv={cv}
          options={options}
          styles={styles}
          templateConfig={templateConfig}
        />
      );
    case "onePageGradient":
      return (
        <OnePageGradientTemplate
          cv={cv}
          options={options}
          templateConfig={templateConfig}
        />
      );

    case "executiveLight":
    default:
      return (
        <ExecutiveLightTemplate
          cv={cv}
          options={options}
          styles={styles}
          templateConfig={templateConfig}
        />
      );
  }
}