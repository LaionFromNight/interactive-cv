import { Image, Link, Page, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { PdfTheme } from "../theme/createPdfTheme";
import {
  Chips,
  ContactRow,
  EducationList,
  ConsentBlock,
  EntryBody,
  PageFooter,
} from "./shared";
import {
  createCommonStyles,
  initials,
  type CommonStyles,
  type LayoutProps,
} from "./styles";
import type { CvViewModel } from "../model/buildCvViewModel";

/**
 * Timeline — experience drawn as a vertical rail with dates in a left column.
 * Accent strip on the page edge, soft summary panel and skill chips.
 */

const DATE_COLUMN = 84;

function SectionTitle({ title, theme }: { title: string; theme: PdfTheme }) {
  const { palette: p, fs, sp, fonts } = theme;

  return (
    <View style={{ marginBottom: sp(9) }} minPresenceAhead={60}>
      <Text style={{ fontFamily: fonts.heading, fontSize: fs(13), fontWeight: 700, color: p.ink }}>{title}</Text>
      <View style={{ width: 26, height: 2.5, backgroundColor: p.accent, marginTop: 3, borderRadius: 1.25 }} />
    </View>
  );
}

function RailRow({
  date,
  dateStyle,
  dot,
  theme,
  header,
  children,
}: {
  date: string;
  dateStyle: object;
  dot: "filled" | "hollow";
  theme: PdfTheme;
  header: ReactNode;
  children?: ReactNode;
}) {
  const { palette: p, sp } = theme;
  const size = dot === "filled" ? 10 : 7;
  const railPadding = 14;

  // Date and dot are absolutely positioned inside the header, so they always
  // move to the next page together with the title.
  return (
    <View
      style={{
        marginLeft: DATE_COLUMN,
        borderLeft: `1.2pt solid ${p.border}`,
        paddingLeft: railPadding,
        paddingBottom: sp(dot === "filled" ? 6 : 9),
      }}
    >
      <View minPresenceAhead={dot === "filled" ? 80 : 40}>
        <View
          style={{
            position: "absolute",
            left: -railPadding - DATE_COLUMN,
            top: 1,
            width: DATE_COLUMN - 11,
          }}
        >
          <Text style={{ textAlign: "right", ...dateStyle }}>{date}</Text>
        </View>
        <View
          style={{
            position: "absolute",
            left: -railPadding - size / 2 - 0.6,
            top: dot === "filled" ? 3 : 3.5,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: dot === "filled" ? p.accent : p.paper,
            border: dot === "filled" ? undefined : `1.6pt solid ${p.accent}`,
          }}
        />
        {header}
      </View>
      {children}
    </View>
  );
}

function TimelineExperience({ vm, theme, s }: { vm: CvViewModel; theme: PdfTheme; s: CommonStyles }) {
  const { palette: p, fs, fonts } = theme;

  return (
    <View>
      {vm.experience.map((group) => (
        <View key={group.id}>
          {group.employer ? (
            <RailRow
              date={group.dateRange}
              dateStyle={{ fontSize: fs(7.8), fontWeight: 700, color: p.accentText }}
              dot="filled"
              theme={theme}
              header={
                <Text style={{ fontFamily: fonts.heading, fontSize: fs(11.5), fontWeight: 700, color: p.ink }}>
                  {group.employer}
                </Text>
              }
            />
          ) : null}

          {group.entries.map((entry) => (
            <RailRow
              key={entry.id}
              date={entry.dateRange}
              dateStyle={{ fontSize: fs(7.6), color: p.muted, lineHeight: 1.3 }}
              dot="hollow"
              theme={theme}
              header={
                <>
                  <Text style={{ ...s.entryTitle, flex: undefined, paddingRight: 0 }}>{entry.title}</Text>
                  {entry.subtitle ? <Text style={s.entrySubtitle}>{entry.subtitle}</Text> : null}
                </>
              }
            >
              <EntryBody entry={entry} vm={vm} s={s} />
            </RailRow>
          ))}
        </View>
      ))}
    </View>
  );
}

export function TimelineLayout({ vm, theme }: LayoutProps) {
  const { palette: p, fs, sp, fonts } = theme;
  const s = createCommonStyles(theme);
  const marginLeft = 44;
  const marginRight = 40;

  const chip = {
    backgroundColor: p.accentSoft,
    borderRadius: 10,
    paddingHorizontal: 6.5,
    paddingVertical: 2.2,
    marginRight: 3.5,
    marginBottom: 3.5,
  };

  const personal = [
    { title: vm.labels.languages, items: vm.languages },
    { title: vm.labels.strengths, items: vm.strengths },
    { title: vm.labels.interests, items: vm.interests },
  ].filter((list) => list.items.length > 0);

  return (
    <Page
      size={theme.page.size}
      style={{ ...s.page, paddingTop: sp(36), paddingBottom: 46, paddingLeft: marginLeft, paddingRight: marginRight }}
    >
      <View
        fixed
        style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, backgroundColor: p.accent }}
      />

      {/* ---------------- Header ---------------- */}
      <View style={{ flexDirection: "row", alignItems: "center" }} wrap={false}>
        {vm.photoSrc ? (
          <Image
            src={vm.photoSrc}
            style={{ width: 76, height: 76, borderRadius: 14, objectFit: "cover", marginRight: 16 }}
          />
        ) : (
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              backgroundColor: p.accent,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <Text style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, color: p.onAccent }}>
              {initials(vm.name)}
            </Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: fonts.heading,
              fontSize: fs(28),
              fontWeight: 700,
              color: p.ink,
              letterSpacing: -0.4,
              lineHeight: 1.1,
            }}
          >
            {vm.name}
          </Text>
          <Text style={{ fontSize: fs(11), color: p.accentText, marginTop: sp(3), fontWeight: 600, lineHeight: 1.3 }}>
            {vm.headline}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: sp(8) }}>
            {[...vm.contacts, ...vm.links].map((item) => (
              <View key={item.value} style={{ marginRight: 12, marginBottom: 3 }}>
                <ContactRow item={item} iconColor={p.accent} textStyle={{ fontSize: fs(8), color: p.text }} />
              </View>
            ))}
          </View>
        </View>

        {vm.qr ? (
          <Link src={vm.qr.url} style={{ alignItems: "center", marginLeft: 12, textDecoration: "none" }}>
            <Image src={vm.qr.src} style={{ width: 54, height: 54 }} />
            <Text style={{ fontSize: fs(6.4), color: p.muted, marginTop: 3 }}>{vm.qr.label}</Text>
          </Link>
        ) : null}
      </View>

      {/* ---------------- Summary ---------------- */}
      {vm.summary ? (
        <View
          style={{
            marginTop: sp(16),
            backgroundColor: p.accentSoft,
            borderRadius: 8,
            padding: sp(12),
            borderLeft: `3pt solid ${p.accent}`,
          }}
          wrap={false}
        >
          <Text style={{ ...s.paragraph, color: p.ink }}>{vm.summary}</Text>
          {vm.focus.length > 0 ? (
            <Text style={{ fontSize: fs(8.2), color: p.accentText, fontWeight: 600, marginTop: sp(6) }}>
              {vm.focus.join("   /   ")}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* ---------------- Experience ---------------- */}
      <View style={{ marginTop: sp(18) }}>
        <SectionTitle title={vm.labels.experience} theme={theme} />
        <TimelineExperience vm={vm} theme={theme} s={s} />
      </View>

      {/* ---------------- Skills & personal ---------------- */}
      {vm.skillGroups.length > 0 ? (
        <View style={{ marginTop: sp(14) }}>
          <SectionTitle title={vm.labels.skills} theme={theme} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {vm.skillGroups.map((group) => (
              <View key={group.id} style={{ width: "48.5%", marginBottom: sp(7) }} wrap={false}>
                <Text style={{ fontSize: fs(8.2), fontWeight: 600, color: p.ink, marginBottom: 3 }}>{group.title}</Text>
                <Chips
                  items={group.items.map((item) => item.name)}
                  chipStyle={chip}
                  textStyle={{ fontSize: fs(7.3), color: p.accentText }}
                />
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {vm.education.length > 0 || personal.length > 0 ? (
        <View style={{ flexDirection: "row", marginTop: sp(10) }} wrap={false}>
          {vm.education.length > 0 ? (
            <View style={{ flex: 1.3, paddingRight: 18 }}>
              <SectionTitle title={vm.labels.education} theme={theme} />
              <EducationList items={vm.education} s={s} />
            </View>
          ) : null}

          {personal.length > 0 ? (
            <View style={{ flex: 1 }}>
              {personal.map((list) => (
                <View key={list.title} style={{ marginBottom: sp(8) }}>
                  <Text
                    style={{
                      fontFamily: fonts.heading,
                      fontSize: fs(9.5),
                      fontWeight: 700,
                      color: p.ink,
                      marginBottom: 3,
                    }}
                  >
                    {list.title}
                  </Text>
                  <Text style={{ fontSize: fs(8.4), color: p.text, lineHeight: 1.4 }}>{list.items.join(" · ")}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <ConsentBlock vm={vm} s={s} />
      <PageFooter vm={vm} s={s} style={{ left: marginLeft, right: marginRight }} />
    </Page>
  );
}
