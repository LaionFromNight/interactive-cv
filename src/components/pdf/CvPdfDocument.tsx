import type { CV } from "../../lib/cvTypes";
import {
  defaultCvPdfOptions,
  type CvPdfOptions,
} from "./CvPdfOptions";
import { amberExecutiveStyles } from "./styles/amberExecutive";
import { blueEngineeringStyles } from "./styles/blueEngineering";
import { emeraldArchitectStyles } from "./styles/emeraldArchitect";
import { graphiteMonoStyles } from "./styles/graphiteMono";
import { slateProfessionalStyles } from "./styles/slateProfessional";
import { ArchitectBriefTemplate } from "./templates/ArchitectBriefTemplate";
import { ExecutiveLightTemplate } from "./templates/ExecutiveLightTemplate";
import { OnePageCompactTemplate } from "./templates/OnePageCompactTemplate";

function getStyles(options: CvPdfOptions) {
  switch (options.colorSchemeId) {
    case "emeraldArchitect":
      return emeraldArchitectStyles;

    case "blueEngineering":
      return blueEngineeringStyles;

    case "graphiteMono":
      return graphiteMonoStyles;

    case "amberExecutive":
      return amberExecutiveStyles;

    case "slateProfessional":
    default:
      return slateProfessionalStyles;
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

  switch (options.templateId) {
    case "architectBrief":
      return (
        <ArchitectBriefTemplate
          cv={cv}
          options={options}
          styles={styles}
        />
      );

    case "onePageCompact":
      return (
        <OnePageCompactTemplate
          cv={cv}
          options={options}
          styles={styles}
        />
      );

    case "executiveLight":
    default:
      return (
        <ExecutiveLightTemplate
          cv={cv}
          options={options}
          styles={styles}
        />
      );
  }
}