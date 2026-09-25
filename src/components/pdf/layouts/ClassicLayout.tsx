import { Image, Link, Page, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { ReactNode } from "react";
import {
  ContactRow,
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

function Section({
  title,
  titleStyle,
  gap,
  children,
}: {
  title: string;
  titleStyle: Style;
  gap: number;
  children: ReactNode;
}) {
  return (
    <View style={{ marginTop: gap }}>
      <Text style={titleStyle} minPresenceAhead={60}>
        {title}
      </Text>
      {children}
    </View>
  );
}

/**
 * Classic — single column, ATS-friendly.
 * Plain text skills, clear section rules, no colored panels.
 */
export function ClassicLayout({ vm, theme }: LayoutProps) {
  const { palette: p, fs, sp, fonts } = theme;
  const s = createCommonStyles(theme);
  const marginX = 46;

  const sectionTitle = {
    fontFamily: fonts.heading,
    fontSize: fs(10),
    fontWeight: 700,
    color: p.accentText,
    textTransform: "uppercase" as const,
    letterSpacing: 1.3,
    paddingBottom: sp(3),
    borderBottom: `0.8pt solid ${p.border}`,
    marginBottom: sp(7),
  };

  const smallLists = [
    { title: vm.labels.languages, items: vm.languages },
    { title: vm.labels.strengths, items: vm.strengths },
    { title: vm.labels.interests, items: vm.interests },
  ].filter((list) => list.items.length > 0);

  return (
    <Page
      size={theme.page.size}
      style={{ ...s.page, paddingTop: sp(40), paddingBottom: 48, paddingHorizontal: marginX }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {vm.photoSrc ? (
          <Image
            src={vm.photoSrc}
            style={{ width: 66, height: 66, borderRadius: 33, objectFit: "cover", marginRight: 16 }}
          />
        ) : null}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: fonts.heading,
              fontSize: fs(26),
              fontWeight: 700,
              color: p.ink,
              letterSpacing: -0.2,
              lineHeight: 1.1,
            }}
          >
            {vm.name}
          </Text>
          <Text style={{ fontSize: fs(11), color: p.accentText, marginTop: sp(4) }}>{vm.headline}</Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: sp(8) }}>
            {[...vm.contacts, ...vm.links].map((item) => (
              <View key={item.value} style={{ marginRight: 14, marginBottom: 3 }}>
                <ContactRow
                  item={item}
                  iconColor={p.accent}
                  textStyle={{ fontSize: fs(8.4), color: p.text }}
                />
              </View>
            ))}
          </View>
        </View>

        {vm.qr ? (
          <Link src={vm.qr.url} style={{ alignItems: "center", marginLeft: 14, textDecoration: "none" }}>
            <Image src={vm.qr.src} style={{ width: 54, height: 54 }} />
            <Text style={{ fontSize: fs(6.4), color: p.muted, marginTop: 3 }}>{vm.qr.label}</Text>
          </Link>
        ) : null}
      </View>

      <View style={{ height: 2, backgroundColor: p.accent, marginTop: sp(12) }} />

      {vm.summary ? (
        <Section titleStyle={sectionTitle} gap={sp(14)} title={vm.labels.summary}>
          <Text style={s.paragraph}>{vm.summary}</Text>
          {vm.focus.length > 0 ? (
            <Text style={{ fontSize: fs(8.6), color: p.ink, fontWeight: 600, marginTop: sp(5) }}>
              {vm.focus.join("   •   ")}
            </Text>
          ) : null}
        </Section>
      ) : null}

      <Section titleStyle={sectionTitle} gap={sp(14)} title={vm.labels.experience}>
        <ExperienceGroups groups={vm.experience} vm={vm} s={s} />
      </Section>

      {vm.skillGroups.length > 0 ? (
        <Section titleStyle={sectionTitle} gap={sp(14)} title={vm.labels.skills}>
          <SkillLines groups={vm.skillGroups} theme={theme} />
        </Section>
      ) : null}

      {vm.education.length > 0 ? (
        <Section titleStyle={sectionTitle} gap={sp(14)} title={vm.labels.education}>
          <EducationList items={vm.education} s={s} />
        </Section>
      ) : null}

      {smallLists.length > 0 ? (
        <View style={{ flexDirection: "row", marginTop: sp(14) }} wrap={false}>
          {smallLists.map((list, index) => (
            <View key={list.title} style={{ flex: 1, paddingLeft: index === 0 ? 0 : 14 }}>
              <Text style={sectionTitle}>{list.title}</Text>
              <Text style={{ fontSize: fs(8.6), color: p.text, lineHeight: 1.45 }}>{list.items.join(" · ")}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <ConsentBlock vm={vm} s={s} />
      <PageFooter vm={vm} s={s} style={{ left: marginX, right: marginX }} />
    </Page>
  );
}
