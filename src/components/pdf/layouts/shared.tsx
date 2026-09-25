import { Circle, Link, Path, Rect, Svg, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { CommonStyles } from "./styles";
import attributionRaw from "../../../data/attribution.json";
import type {
  CvContactItem,
  CvEducationItem,
  CvExperienceEntry,
  CvExperienceGroup,
  CvSkillGroup,
  CvViewModel,
} from "../model/buildCvViewModel";
import type { PdfTheme } from "../theme/createPdfTheme";

const attribution = attributionRaw as { text: string; url: string };



/* ------------------------------------------------------------------ */
/* Icons                                                                */
/* ------------------------------------------------------------------ */

export function ContactIcon({
  kind,
  color,
  size = 8,
}: {
  kind: CvContactItem["kind"] | "pin";
  color: string;
  size?: number;
}) {
  const stroke = { stroke: color, strokeWidth: 2.2, fill: "none" } as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {kind === "email" ? (
        <>
          <Rect x="2.5" y="5" width="19" height="14" rx="2.5" {...stroke} />
          <Path d="M3.5 6.5 12 13l8.5-6.5" {...stroke} />
        </>
      ) : kind === "phone" ? (
        <Path
          d="M5 3.5h3.2l1.6 4.4-2.1 1.4a11 11 0 0 0 7 7l1.4-2.1 4.4 1.6V19a1.9 1.9 0 0 1-2 1.9C10.6 20.4 3.6 13.4 3.1 5.5A1.9 1.9 0 0 1 5 3.5Z"
          {...stroke}
        />
      ) : kind === "pin" ? (
        <>
          <Path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21Z" {...stroke} />
          <Circle cx="12" cy="9.5" r="2.5" {...stroke} />
        </>
      ) : (
        <>
          <Path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L11.8 5.8" {...stroke} />
          <Path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.4-1.4" {...stroke} />
        </>
      )}
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                      */
/* ------------------------------------------------------------------ */

export function ContactRow({
  item,
  iconColor,
  textStyle,
  showLabel = false,
  labelStyle,
  iconSize = 8,
  stretch = false,
}: {
  item: CvContactItem;
  iconColor: string;
  textStyle: Style;
  showLabel?: boolean;
  labelStyle?: Style;
  iconSize?: number;
  /** Let the text take the remaining width (for fixed-width columns). */
  stretch?: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }} wrap={false}>
      <View style={{ marginRight: 5 }}>
        <ContactIcon kind={item.kind} color={iconColor} size={iconSize} />
      </View>
      <View style={stretch ? { flex: 1 } : {}}>
        {showLabel ? <Text style={labelStyle}>{item.label}</Text> : null}
        {item.url ? (
          <Link src={item.url} style={{ ...textStyle, textDecoration: "none" }}>
            {item.value}
          </Link>
        ) : (
          <Text style={textStyle}>{item.value}</Text>
        )}
      </View>
    </View>
  );
}

export function LevelDots({
  level,
  color,
  emptyColor,
  size = 4,
}: {
  level: number | undefined;
  color: string;
  emptyColor: string;
  size?: number;
}) {
  if (!level) return null;

  return (
    <View style={{ flexDirection: "row" }}>
      {[1, 2, 3, 4].map((step) => (
        <View
          key={step}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            marginLeft: 2,
            backgroundColor: step <= level ? color : emptyColor,
          }}
        />
      ))}
    </View>
  );
}

export function Chips({
  items,
  chipStyle,
  textStyle,
}: {
  items: string[];
  chipStyle: Style;
  textStyle: Style;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={chipStyle} wrap={false}>
          <Text style={textStyle}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function Bullets({ items, s }: { items: string[]; s: CommonStyles }) {
  if (items.length === 0) return null;

  return (
    <View style={s.bulletList}>
      {items.map((item, index) => (
        <View key={index} style={s.bulletRow} wrap={false}>
          <View style={s.bulletDot} />
          <Text style={s.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function StackLine({
  stack,
  label,
  s,
}: {
  stack: string[];
  label: string;
  s: CommonStyles;
}) {
  if (stack.length === 0) return null;

  return (
    <Text style={s.stackText}>
      <Text style={s.stackLabel}>{label}: </Text>
      {stack.join(" · ")}
    </Text>
  );
}

export function EntryBody({
  entry,
  vm,
  s,
}: {
  entry: CvExperienceEntry;
  vm: CvViewModel;
  s: CommonStyles;
}) {
  return (
    <>
      {entry.description ? <Text style={s.entryText}>{entry.description}</Text> : null}
      <Bullets items={entry.bullets} s={s} />
      <StackLine stack={entry.stack} label={vm.labels.stack} s={s} />
    </>
  );
}

export function ExperienceEntry({
  entry,
  vm,
  s,
}: {
  entry: CvExperienceEntry;
  vm: CvViewModel;
  s: CommonStyles;
}) {
  return (
    <View style={s.entry}>
      <View style={s.entryHeader} minPresenceAhead={48}>
        <Text style={s.entryTitle}>{entry.title}</Text>
        <Text style={s.entryDate}>{entry.dateRange}</Text>
      </View>
      {entry.subtitle ? <Text style={s.entrySubtitle}>{entry.subtitle}</Text> : null}
      <EntryBody entry={entry} vm={vm} s={s} />
    </View>
  );
}

export function ExperienceGroups({
  groups,
  vm,
  s,
}: {
  groups: CvExperienceGroup[];
  vm: CvViewModel;
  s: CommonStyles;
}) {
  return (
    <View>
      {groups.map((group) => (
        <View key={group.id} style={s.group}>
          {group.employer ? (
            <View style={s.groupHeader} minPresenceAhead={70}>
              <Text style={s.groupName}>{group.employer}</Text>
              <Text style={s.groupDate}>{group.dateRange}</Text>
            </View>
          ) : null}

          {group.entries.map((entry) => (
            <ExperienceEntry key={entry.id} entry={entry} vm={vm} s={s} />
          ))}
        </View>
      ))}
    </View>
  );
}

export function EducationList({
  items,
  s,
  titleStyle,
  metaStyle,
}: {
  items: CvEducationItem[];
  s: CommonStyles;
  titleStyle?: Style;
  metaStyle?: Style;
}) {
  return (
    <View>
      {items.map((item) => (
        <View key={item.id} style={s.eduItem} wrap={false}>
          <Text style={{ ...s.eduTitle, ...titleStyle }}>{item.title}</Text>
          <Text style={{ ...s.eduMeta, ...metaStyle }}>
            {[item.institution, item.dateRange].filter(Boolean).join(" · ")}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Skills rendered as "Group: a, b, c" lines — plain text parses best in ATS systems. */
export function SkillLines({
  groups,
  theme,
}: {
  groups: CvSkillGroup[];
  theme: PdfTheme;
}) {
  const { palette: p, fs, sp } = theme;

  return (
    <View>
      {groups.map((group) => (
        <View key={group.id} style={{ flexDirection: "row", marginBottom: sp(3.5) }} wrap={false}>
          <Text style={{ width: "30%", fontSize: fs(8.6), fontWeight: 600, color: p.ink, paddingRight: 8 }}>
            {group.title}
          </Text>
          <Text style={{ flex: 1, fontSize: fs(8.6), color: p.text, lineHeight: 1.4 }}>
            {group.items.map((item) => item.name).join(", ")}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function PageFooter({
  vm,
  s,
  style,
}: {
  vm: CvViewModel;
  s: CommonStyles;
  style?: Style;
}) {
  return (
    <View style={{ ...s.footer, ...style }} fixed>
      <Text>
        {vm.name} · {vm.labels.lastUpdated}: {vm.lastUpdated}
      </Text>
      <Link src={attribution.url} style={s.footerLink}>
        <Text render={({ pageNumber, totalPages }) => (pageNumber === totalPages ? attribution.text : "")} />
      </Link>
      <Text
        render={({ pageNumber, totalPages }) =>
          totalPages > 1 ? `${vm.labels.page} ${pageNumber} / ${totalPages}` : ""
        }
      />
    </View>
  );
}

/** Optional consent clause at the end of the document flow. */
export function ConsentBlock({
  vm,
  s,
  style,
}: {
  vm: CvViewModel;
  s: CommonStyles;
  style?: Style;
}) {
  if (!vm.consentText) return null;

  return (
    <View style={{ ...s.endBlock, ...style }} wrap={false}>
      <Text style={s.consent}>{vm.consentText}</Text>
    </View>
  );
}
