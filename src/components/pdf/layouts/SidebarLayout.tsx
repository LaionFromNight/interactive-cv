import { Image, Link, Page, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { PdfTheme } from "../theme/createPdfTheme";
import {
  Chips,
  ContactRow,
  EducationList,
  ConsentBlock,
  ExperienceGroups,
  LevelDots,
  PageFooter,
} from "./shared";
import {
  createCommonStyles,
  initials,
  type LayoutProps,
} from "./styles";

/**
 * Sidebar — dark colored sidebar (photo, contact, skills, education)
 * next to a wide main column with summary and experience.
 */

function SideSection({
  title,
  theme,
  keepTogether = true,
  children,
}: {
  title: string;
  theme: PdfTheme;
  keepTogether?: boolean;
  children: ReactNode;
}) {
  const { palette: p, fs, sp, fonts } = theme;

  return (
    <View style={{ marginTop: sp(16) }} wrap={!keepTogether}>
      <View minPresenceAhead={40}>
        <Text
          style={{
            fontFamily: fonts.heading,
            fontSize: fs(8.6),
            fontWeight: 700,
            color: p.darkAccent,
            textTransform: "uppercase",
            letterSpacing: 1.4,
          }}
        >
          {title}
        </Text>
        <View style={{ height: 0.8, backgroundColor: p.darkBorder, marginTop: sp(4), marginBottom: sp(7) }} />
      </View>
      {children}
    </View>
  );
}

function MainSection({
  title,
  theme,
  first = false,
  children,
}: {
  title: string;
  theme: PdfTheme;
  first?: boolean;
  children: ReactNode;
}) {
  const { palette: p, fs, sp, fonts } = theme;

  return (
    <View style={{ marginTop: first ? sp(14) : sp(16) }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: sp(8) }} minPresenceAhead={60}>
        <View style={{ width: 14, height: 3, backgroundColor: p.accent, marginRight: 7, borderRadius: 1.5 }} />
        <Text
          style={{
            fontFamily: fonts.heading,
            fontSize: fs(12),
            fontWeight: 700,
            color: p.ink,
            letterSpacing: 0.2,
          }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

export function SidebarLayout({ vm, theme }: LayoutProps) {
  const { palette: p, fs, sp, fonts } = theme;
  const s = createCommonStyles(theme);

  const sidebarWidth = Math.round(theme.page.width * 0.335);
  const sidebarPadding = 22;
  const lightText = { fontSize: fs(8.2), color: p.darkText, lineHeight: 1.35 };

  return (
    <Page
      size={theme.page.size}
      style={{ ...s.page, paddingTop: sp(34), paddingBottom: 44 }}
    >
      {/* Sidebar background, repeated on every page. */}
      <View
        fixed
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: sidebarWidth,
          backgroundColor: p.dark,
        }}
      />

      <View style={{ flexDirection: "row" }}>
        {/* ---------------- Sidebar ---------------- */}
        <View style={{ width: sidebarWidth, paddingHorizontal: sidebarPadding }}>
          <View style={{ alignItems: "center" }} wrap={false}>
            {vm.photoSrc ? (
              <View
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: 52,
                  padding: 3,
                  backgroundColor: p.darkAccent,
                }}
              >
                <Image
                  src={vm.photoSrc}
                  style={{ width: 98, height: 98, borderRadius: 49, objectFit: "cover" }}
                />
              </View>
            ) : (
              <View
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 42,
                  backgroundColor: p.accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 700, color: p.onAccent }}>
                  {initials(vm.name)}
                </Text>
              </View>
            )}
          </View>

          <SideSection title={vm.labels.contact} theme={theme}>
            {[...vm.contacts, ...vm.links].map((item) => (
              <View key={item.value} style={{ marginBottom: sp(6) }}>
                <ContactRow
                  item={item}
                  iconColor={p.darkAccent}
                  textStyle={lightText}
                  showLabel={item.kind === "link"}
                  stretch
                  labelStyle={{ fontSize: fs(6.8), color: p.darkMuted, marginBottom: 1 }}
                />
              </View>
            ))}
          </SideSection>

          {vm.showSkillLevels && vm.coreSkills.length > 0 ? (
            <SideSection title={vm.labels.coreSkills} theme={theme}>
              {vm.coreSkills.slice(0, 10).map((skill) => (
                <View
                  key={skill.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: sp(4),
                  }}
                  wrap={false}
                >
                  <Text style={{ ...lightText, flex: 1, paddingRight: 6 }}>{skill.name}</Text>
                  <LevelDots level={skill.level} color={p.darkAccent} emptyColor={p.darkBorder} size={4.5} />
                </View>
              ))}
            </SideSection>
          ) : null}

          {vm.skillGroups.length > 0 ? (
            <SideSection title={vm.labels.skills} theme={theme} keepTogether={false}>
              {vm.skillGroups.map((group) => (
                <View key={group.id} style={{ marginBottom: sp(6) }} wrap={false}>
                  <Text style={{ fontSize: fs(7.8), fontWeight: 600, color: p.darkText, marginBottom: 1.5 }}>
                    {group.title}
                  </Text>
                  <Text style={{ fontSize: fs(7.6), color: p.darkMuted, lineHeight: 1.4 }}>
                    {group.items.map((item) => item.name).join(" · ")}
                  </Text>
                </View>
              ))}
            </SideSection>
          ) : null}

          {vm.languages.length > 0 ? (
            <SideSection title={vm.labels.languages} theme={theme}>
              {vm.languages.map((language) => (
                <Text key={language} style={{ ...lightText, marginBottom: 2 }}>
                  {language}
                </Text>
              ))}
            </SideSection>
          ) : null}

          {vm.education.length > 0 ? (
            <SideSection title={vm.labels.education} theme={theme}>
              <EducationList
                items={vm.education}
                s={s}
                titleStyle={{ color: p.darkText, fontSize: fs(8.2) }}
                metaStyle={{ color: p.darkMuted, fontSize: fs(7.4) }}
              />
            </SideSection>
          ) : null}


        </View>

        {/* ---------------- Main column ---------------- */}
        <View style={{ flex: 1, paddingLeft: 26, paddingRight: 34 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }} wrap={false}>
            <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.heading,
                fontSize: fs(27),
                fontWeight: 700,
                color: p.ink,
                lineHeight: 1.1,
                letterSpacing: -0.3,
              }}
            >
              {vm.name}
            </Text>
            <Text style={{ fontSize: fs(11), color: p.accentText, marginTop: sp(5), lineHeight: 1.3 }}>
              {vm.headline}
            </Text>
            </View>

            {vm.qr ? (
              <Link src={vm.qr.url} style={{ alignItems: "center", marginLeft: 12, textDecoration: "none" }}>
                <Image src={vm.qr.src} style={{ width: 50, height: 50 }} />
                <Text style={{ fontSize: fs(6.2), color: p.muted, marginTop: 3 }}>{vm.qr.label}</Text>
              </Link>
            ) : null}
          </View>

          {vm.summary ? (
            <MainSection title={vm.labels.summary} theme={theme} first>
              <Text style={s.paragraph}>{vm.summary}</Text>
              {vm.focus.length > 0 ? (
                <View style={{ marginTop: sp(7) }}>
                  <Chips
                    items={vm.focus}
                    chipStyle={{
                      backgroundColor: p.accentSoft,
                      borderRadius: 4,
                      paddingHorizontal: 6,
                      paddingVertical: 2.5,
                      marginRight: 4,
                      marginBottom: 4,
                    }}
                    textStyle={{ fontSize: fs(7.6), color: p.accentText, fontWeight: 600 }}
                  />
                </View>
              ) : null}
            </MainSection>
          ) : null}

          <MainSection title={vm.labels.experience} theme={theme}>
            <ExperienceGroups groups={vm.experience} vm={vm} s={s} />
          </MainSection>

          {vm.strengths.length > 0 ? (
            <MainSection title={vm.labels.strengths} theme={theme}>
              <Chips
                items={vm.strengths}
                chipStyle={{
                  border: `0.8pt solid ${p.border}`,
                  borderRadius: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 2.5,
                  marginRight: 4,
                  marginBottom: 4,
                }}
                textStyle={{ fontSize: fs(7.8), color: p.text }}
              />
            </MainSection>
          ) : null}

          {vm.interests.length > 0 ? (
            <MainSection title={vm.labels.interests} theme={theme}>
              <Text style={{ fontSize: fs(8.8), color: p.text, lineHeight: 1.45 }}>{vm.interests.join("  ·  ")}</Text>
            </MainSection>
          ) : null}

          <ConsentBlock vm={vm} s={s} />
        </View>
      </View>

      <PageFooter vm={vm} s={s} style={{ left: sidebarWidth + 26, right: 34 }} />
    </Page>
  );
}
