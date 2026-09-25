import { Image, Link, Page, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { PdfTheme } from "../theme/createPdfTheme";
import {
  EducationList,
  ConsentBlock,
  ExperienceGroups,
  PageFooter,
  SkillLines,
} from "./shared";
import {
  createCommonStyles,
  type LayoutProps,
} from "./styles";

/**
 * Elegant — centered header, section titles in a left gutter,
 * generous white space. Pairs especially well with serif typography.
 */

function GutterSection({
  title,
  theme,
  children,
}: {
  title: string;
  theme: PdfTheme;
  children: ReactNode;
}) {
  const { palette: p, fs, sp, fonts } = theme;

  // Title is absolutely positioned in the gutter instead of using a flex row:
  // rows that split across pages leave large blank areas in react-pdf.
  return (
    <View style={{ marginTop: sp(16), paddingLeft: "21%" }}>
      <Text
        style={{
          position: "absolute",
          left: 0,
          top: 1,
          width: "19%",
          fontFamily: fonts.heading,
          fontSize: fs(8.8),
          fontWeight: 700,
          color: p.accentText,
          textTransform: "uppercase",
          letterSpacing: 1.6,
          lineHeight: 1.35,
        }}
      >
        {title}
      </Text>
      <View style={{ borderLeft: `0.6pt solid ${p.border}`, paddingLeft: 14 }} minPresenceAhead={40}>
        {children}
      </View>
    </View>
  );
}

export function ElegantLayout({ vm, theme }: LayoutProps) {
  const { palette: p, fs, sp, fonts } = theme;
  const s = createCommonStyles(theme);
  const marginX = 50;

  const elegant = {
    ...s,
    groupName: { ...s.groupName, fontSize: fs(11.5), fontWeight: 600 },
    groupDate: { ...s.groupDate, fontStyle: "italic" as const },
    entryDate: { ...s.entryDate, fontStyle: "italic" as const },
    entrySubtitle: { ...s.entrySubtitle, color: p.muted, fontStyle: "italic" as const },
    bulletDot: { ...s.bulletDot, width: 2.6, height: 2.6, backgroundColor: p.muted },
  };

  const contactParts = [...vm.contacts, ...vm.links];

  const inlineLists = [
    { title: vm.labels.languages, items: vm.languages },
    { title: vm.labels.strengths, items: vm.strengths },
    { title: vm.labels.interests, items: vm.interests },
  ].filter((list) => list.items.length > 0);

  return (
    <Page size={theme.page.size} style={{ ...s.page, paddingTop: sp(42), paddingBottom: 50, paddingHorizontal: marginX }}>
      {/* ---------------- Header ---------------- */}
      <View style={{ alignItems: "center" }} wrap={false}>
        {vm.photoSrc ? (
          <Image
            src={vm.photoSrc}
            style={{ width: 70, height: 70, borderRadius: 35, objectFit: "cover", marginBottom: sp(10) }}
          />
        ) : null}

        <Text
          style={{
            fontFamily: fonts.heading,
            fontSize: fs(25),
            fontWeight: 600,
            color: p.ink,
            letterSpacing: 2.5,
            textTransform: "uppercase",
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          {vm.name}
        </Text>
        <Text
          style={{
            fontSize: fs(10),
            color: p.accentText,
            letterSpacing: 0.8,
            marginTop: sp(5),
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {vm.headline}
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: sp(9) }}>
          {contactParts.map((item, index) => (
            <View key={item.value} style={{ flexDirection: "row" }}>
              {index > 0 ? <Text style={{ fontSize: fs(8.2), color: p.subtle, marginHorizontal: 6 }}>·</Text> : null}
              {item.url ? (
                <Link src={item.url} style={{ fontSize: fs(8.2), color: p.text, textDecoration: "none" }}>
                  {item.value}
                </Link>
              ) : (
                <Text style={{ fontSize: fs(8.2), color: p.text }}>{item.value}</Text>
              )}
            </View>
          ))}
        </View>

        {vm.qr ? (
          <Link
            src={vm.qr.url}
            style={{ position: "absolute", right: 0, top: 0, alignItems: "center", textDecoration: "none" }}
          >
            <Image src={vm.qr.src} style={{ width: 48, height: 48 }} />
            <Text style={{ fontSize: fs(6.2), color: p.muted, marginTop: 3 }}>{vm.qr.label}</Text>
          </Link>
        ) : null}

        <View style={{ width: "100%", marginTop: sp(14) }}>
          <View style={{ height: 0.9, backgroundColor: p.ink }} />
          <View style={{ height: 0.4, backgroundColor: p.accent, marginTop: 2 }} />
        </View>
      </View>

      {/* ---------------- Sections ---------------- */}
      {vm.summary ? (
        <GutterSection title={vm.labels.summary} theme={theme}>
          <Text style={{ ...s.paragraph, lineHeight: 1.55 }}>{vm.summary}</Text>
          {vm.focus.length > 0 ? (
            <Text style={{ fontSize: fs(8.4), color: p.accentText, marginTop: sp(5), fontStyle: "italic" }}>
              {vm.focus.join("  ·  ")}
            </Text>
          ) : null}
        </GutterSection>
      ) : null}

      <GutterSection title={vm.labels.experience} theme={theme}>
        <ExperienceGroups groups={vm.experience} vm={vm} s={elegant} />
      </GutterSection>

      {vm.skillGroups.length > 0 ? (
        <GutterSection title={vm.labels.skills} theme={theme}>
          <SkillLines groups={vm.skillGroups} theme={theme} />
        </GutterSection>
      ) : null}

      {vm.education.length > 0 ? (
        <GutterSection title={vm.labels.education} theme={theme}>
          <EducationList items={vm.education} s={s} metaStyle={{ fontStyle: "italic" }} />
        </GutterSection>
      ) : null}

      {inlineLists.map((list) => (
        <GutterSection key={list.title} title={list.title} theme={theme}>
          <Text style={{ fontSize: fs(8.8), color: p.text, lineHeight: 1.45 }}>{list.items.join("  ·  ")}</Text>
        </GutterSection>
      ))}

      <ConsentBlock vm={vm} s={s} style={{ marginTop: sp(18) }} />
      <PageFooter vm={vm} s={s} style={{ left: marginX, right: marginX }} />
    </Page>
  );
}
