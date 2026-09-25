import { Image, Link, Page, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { PdfTheme } from "../theme/createPdfTheme";
import {
  Chips,
  ContactRow,
  EducationList,
  ConsentBlock,
  ExperienceGroups,
  PageFooter,
} from "./shared";
import {
  createCommonStyles,
  initials,
  type LayoutProps,
} from "./styles";

/**
 * Modern — full-bleed header band, experience on the left,
 * skill chips and personal details on the right.
 */

function SectionTitle({ title, theme }: { title: string; theme: PdfTheme }) {
  const { palette: p, fs, sp, fonts } = theme;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: sp(8) }} minPresenceAhead={60}>
      <Text
        style={{
          fontFamily: fonts.heading,
          fontSize: fs(10),
          fontWeight: 700,
          color: p.accentText,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          marginRight: 8,
        }}
      >
        {title}
      </Text>
      <View style={{ flex: 1, height: 0.8, backgroundColor: p.border }} />
    </View>
  );
}

function AsideCard({
  title,
  theme,
  children,
}: {
  title: string;
  theme: PdfTheme;
  children: ReactNode;
}) {
  const { palette: p, sp } = theme;

  return (
    <View
      style={{
        backgroundColor: p.surface,
        borderRadius: 8,
        padding: sp(11),
        marginBottom: sp(10),
      }}
      wrap={false}
    >
      <SectionTitle title={title} theme={theme} />
      {children}
    </View>
  );
}

function SkillBar({ level, theme }: { level: number | undefined; theme: PdfTheme }) {
  const { palette: p } = theme;
  if (!level) return null;

  return (
    <View style={{ flexDirection: "row", marginTop: 2.5 }}>
      {[1, 2, 3, 4].map((step) => (
        <View
          key={step}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 1.5,
            marginRight: step < 4 ? 2 : 0,
            backgroundColor: step <= level ? p.accent : p.border,
          }}
        />
      ))}
    </View>
  );
}

export function ModernLayout({ vm, theme }: LayoutProps) {
  const { palette: p, fs, sp, fonts } = theme;
  const s = createCommonStyles(theme);
  const topPadding = sp(30);
  const marginX = 34;

  const chip = {
    backgroundColor: p.paper,
    border: `0.7pt solid ${p.border}`,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 3.5,
    marginBottom: 3.5,
  };

  return (
    <Page size={theme.page.size} style={{ ...s.page, paddingTop: topPadding, paddingBottom: 44 }}>
      {/* ---------------- Header band ---------------- */}
      <View style={{ marginTop: -topPadding, backgroundColor: p.dark }} wrap={false}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: marginX,
            paddingTop: sp(26),
            paddingBottom: sp(22),
          }}
        >
          {vm.photoSrc ? (
            <View style={{ width: 86, height: 86, borderRadius: 43, padding: 3, backgroundColor: p.darkAccent, marginRight: 18 }}>
              <Image src={vm.photoSrc} style={{ width: 80, height: 80, borderRadius: 40, objectFit: "cover" }} />
            </View>
          ) : (
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: p.accent,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 18,
              }}
            >
              <Text style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: p.onAccent }}>
                {initials(vm.name)}
              </Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.heading,
                fontSize: fs(27),
                fontWeight: 700,
                color: p.darkText,
                letterSpacing: -0.2,
                lineHeight: 1.1,
              }}
            >
              {vm.name}
            </Text>
            <Text style={{ fontSize: fs(10.8), color: p.darkAccent, marginTop: sp(4), lineHeight: 1.3 }}>
              {vm.headline}
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: sp(9) }}>
              {[...vm.contacts, ...vm.links].map((item) => (
                <View key={item.value} style={{ marginRight: 12, marginBottom: 3 }}>
                  <ContactRow
                    item={item}
                    iconColor={p.darkAccent}
                    textStyle={{ fontSize: fs(8), color: p.darkText }}
                  />
                </View>
              ))}
            </View>
          </View>

          {vm.qr ? (
            <Link src={vm.qr.url} style={{ alignItems: "center", marginLeft: 14, textDecoration: "none" }}>
              <View style={{ padding: 4, backgroundColor: "#FFFFFF", borderRadius: 5 }}>
                <Image src={vm.qr.src} style={{ width: 52, height: 52 }} />
              </View>
              <Text style={{ fontSize: fs(6.4), color: p.darkMuted, marginTop: 3 }}>{vm.qr.label}</Text>
            </Link>
          ) : null}
        </View>
        <View style={{ height: 4, backgroundColor: p.accent }} />
      </View>

      {/* ---------------- Body ---------------- */}
      <View style={{ flexDirection: "row", paddingHorizontal: marginX, marginTop: sp(18) }}>
        <View style={{ flex: 1, paddingRight: 18 }}>
          {vm.summary ? (
            <View style={{ marginBottom: sp(14) }}>
              <SectionTitle title={vm.labels.summary} theme={theme} />
              <Text style={s.paragraph}>{vm.summary}</Text>
            </View>
          ) : null}

          <SectionTitle title={vm.labels.experience} theme={theme} />
          <ExperienceGroups groups={vm.experience} vm={vm} s={s} />
        </View>

        <View style={{ width: "34%" }}>
          {vm.focus.length > 0 ? (
            <AsideCard title={vm.labels.profile} theme={theme}>
              {vm.focus.map((item) => (
                <View key={item} style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: p.accent, marginRight: 6 }} />
                  <Text style={{ fontSize: fs(8.2), color: p.ink, fontWeight: 600 }}>{item}</Text>
                </View>
              ))}
            </AsideCard>
          ) : null}

          {vm.showSkillLevels && vm.coreSkills.length > 0 ? (
            <AsideCard title={vm.labels.coreSkills} theme={theme}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                {vm.coreSkills.slice(0, 10).map((skill) => (
                  <View key={skill.id} style={{ width: "47%", marginBottom: sp(5) }}>
                    <Text style={{ fontSize: fs(7.8), color: p.text }}>{skill.name}</Text>
                    <SkillBar level={skill.level} theme={theme} />
                  </View>
                ))}
              </View>
            </AsideCard>
          ) : null}

          {vm.skillGroups.map((group, index) => (
            <View
              key={group.id}
              style={{
                backgroundColor: p.surface,
                borderRadius: 8,
                paddingHorizontal: sp(11),
                paddingTop: index === 0 ? sp(11) : sp(4),
                paddingBottom: index === vm.skillGroups.length - 1 ? sp(8) : sp(3),
                borderTopLeftRadius: index === 0 ? 8 : 0,
                borderTopRightRadius: index === 0 ? 8 : 0,
                borderBottomLeftRadius: index === vm.skillGroups.length - 1 ? 8 : 0,
                borderBottomRightRadius: index === vm.skillGroups.length - 1 ? 8 : 0,
                marginBottom: index === vm.skillGroups.length - 1 ? sp(10) : 0,
              }}
              wrap={false}
            >
              {index === 0 ? <SectionTitle title={vm.labels.skills} theme={theme} /> : null}
              <Text style={{ fontSize: fs(7.6), fontWeight: 600, color: p.ink, marginBottom: 3 }}>{group.title}</Text>
              <Chips
                items={group.items.map((item) => item.name)}
                chipStyle={chip}
                textStyle={{ fontSize: fs(7.2), color: p.text }}
              />
            </View>
          ))}

          {vm.education.length > 0 ? (
            <AsideCard title={vm.labels.education} theme={theme}>
              <EducationList items={vm.education} s={s} titleStyle={{ fontSize: fs(8.2) }} metaStyle={{ fontSize: fs(7.4) }} />
            </AsideCard>
          ) : null}

          {vm.languages.length > 0 ? (
            <AsideCard title={vm.labels.languages} theme={theme}>
              <Chips items={vm.languages} chipStyle={chip} textStyle={{ fontSize: fs(7.6), color: p.text }} />
            </AsideCard>
          ) : null}

          {vm.strengths.length > 0 ? (
            <AsideCard title={vm.labels.strengths} theme={theme}>
              {vm.strengths.map((item) => (
                <Text key={item} style={{ fontSize: fs(8), color: p.text, marginBottom: 2.5, lineHeight: 1.3 }}>
                  {item}
                </Text>
              ))}
            </AsideCard>
          ) : null}

          {vm.interests.length > 0 ? (
            <AsideCard title={vm.labels.interests} theme={theme}>
              <Text style={{ fontSize: fs(8), color: p.text, lineHeight: 1.4 }}>{vm.interests.join(" · ")}</Text>
            </AsideCard>
          ) : null}
        </View>
      </View>

      <View style={{ paddingHorizontal: marginX }}>
        <ConsentBlock vm={vm} s={s} />
      </View>
      <PageFooter vm={vm} s={s} style={{ left: marginX, right: marginX }} />
    </Page>
  );
}
