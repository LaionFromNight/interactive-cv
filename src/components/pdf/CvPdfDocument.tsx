// src/components/pdf/CvPdfDocument.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
} from "@react-pdf/renderer";
import type { CV } from "../../lib/cvTypes";

// Register a font that supports Polish diacritics (Ł, ą,ę, etc.)
Font.register({
  family: "Inter",
  fonts: [
    { src: "/assets/fonts/Inter-Regular.ttf", fontWeight: 400 },
    { src: "/assets/fonts/Inter-SemiBold.ttf", fontWeight: 600 },
  ],
});

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMonth(value: string | null | undefined) {
  if (!value) return "Present";
  const [y, m] = value.split("-");
  const idx = Number(m) - 1;
  if (!y || Number.isNaN(idx) || idx < 0 || idx > 11) return value;
  return `${months[idx]} ${y}`;
}

function formatRange(start: string | null | undefined, end: string | null | undefined) {
  if (!start && !end) return "—";
  return `${formatMonth(start)} – ${formatMonth(end)}`;
}

function groupSkills(cv: CV) {
  const buckets = [
    { key: "language", title: "Languages" },
    { key: "backend", title: "Backend" },
    { key: "frontend", title: "Frontend" },
    { key: "cloud", title: "Cloud" },
    { key: "db", title: "Databases" },
    { key: "devops", title: "DevOps" },
    { key: "testing", title: "Testing" },
    { key: "platform", title: "Platforms" },
  ] as const;

  return buckets
    .map((b) => ({
      ...b,
      items: cv.skills.tech.filter((t) => t.tags?.includes(b.key)),
    }))
    .filter((b) => b.items.length > 0);
}

export function CvPdfDocument({ cv }: { cv: CV }) {
  const companiesById = Object.fromEntries(cv.companies.map((c) => [c.id, c]));
  const projectsById = Object.fromEntries(cv.projects.map((p) => [p.id, p]));

  // Timeline: keep order as in JSON (or sort if you want)
  const timeline = cv.experience_timeline ?? [];

  // Projects list: sort by start desc
  const publicProjects = cv.projects
    .filter((p) => p.public?.show !== false)
    .slice()
    .sort((a, b) => (b.time_range.start ?? "").localeCompare(a.time_range.start ?? ""));

  const skillGroups = groupSkills(cv);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{cv.person.full_name}</Text>
              <Text style={styles.headline}>{cv.person.headline}</Text>

              <View style={styles.pillsRow}>
                <Text style={[styles.pill, styles.pillSoft]}>{cv.person.contacts.email}</Text>
                {cv.person.contacts.phone ? (
                  <Text style={[styles.pill, styles.pillAccent]}>{cv.person.contacts.phone}</Text>
                ) : null}
                {(cv.person.spoken_languages ?? []).map((l) => (
                  <Text key={l} style={[styles.pill, styles.pillNeutral]}>{l}</Text>
                ))}
              </View>

              {cv.person.bio_short ? (
                <Text style={styles.bio}>{cv.person.bio_short}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Summary centered */}
        <View style={styles.summaryWrap}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.paragraph}>
              {cv.person.bio_short ?? "—"}
            </Text>
          </View>
        </View>

        {/* Two columns */}
        <View style={styles.columns}>
          {/* Left column */}
          <View style={styles.colLeft}>
            {/* Timeline */}
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={styles.card}>
              {timeline.map((t, idx) => {
                const label =
                  t.company_id ? (companiesById[t.company_id]?.name ?? "Company") : "B2B / Contract";
                return (
                  <View key={`${t.company_id ?? t.client_id ?? "x"}-${t.start}-${idx}`} style={styles.timelineRow}>
                    <Text style={styles.timelineIndex}>{idx + 1}.</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timelineTitle}>{label}</Text>
                      <Text style={styles.muted}>{formatRange(t.start, t.end)}</Text>
                      <Text style={styles.mutedSmall}>Projects: {t.project_ids?.length ?? 0}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Skills */}
            <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Skills</Text>
            <View style={styles.card}>
              {skillGroups.map((g) => (
                <View key={g.key} style={{ marginBottom: 10 }}>
                  <Text style={styles.groupTitle}>{g.title}</Text>
                  <View style={styles.badgesRow}>
                    {g.items.map((it) => (
                      <Text key={it.id} style={styles.badge}>{it.name}</Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Right column */}
          <View style={styles.colRight}>
            <Text style={styles.sectionTitle}>Experience (projects)</Text>
            <View style={styles.card}>
              {publicProjects.map((p) => {
                const company = p.company_id ? companiesById[p.company_id]?.name : "B2B / Contract";
                return (
                  <View key={p.id} style={styles.projectRow}>
                    <Text style={styles.projectMeta}>
                      {formatRange(p.time_range.start, p.time_range.end)} · {company}
                    </Text>
                    <Text style={styles.projectTitle}>{p.display_name ?? p.name}</Text>
                    {p.description ? (
                      <Text style={styles.projectDesc}>{p.description}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>

            {/* Optional: links (if you have them in profiles array) */}
            {Array.isArray(cv.person.profiles) && cv.person.profiles.length ? (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Links</Text>
                <View style={styles.card}>
                  {cv.person.profiles.map((pr) => (
                    <View key={pr.id} style={styles.linkRow}>
                      <Text style={styles.muted}>{pr.label}</Text>
                      <Link src={pr.url} style={styles.link}>
                        {pr.url}
                      </Link>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
          </View>
        </View>

        <Text style={styles.footer}>
          Last updated: {cv.meta.generated_at_local}
        </Text>
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    padding: 28,
    backgroundColor: "#F6F8FB",
    color: "#0B1220",
  },

  header: {
    backgroundColor: "#0E1A2B", // less black, more navy
    borderRadius: 16,
    padding: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    marginBottom: 16,
  },
  headerTopRow: { flexDirection: "row" },
  name: { fontSize: 22, fontWeight: 600, color: "#EAF2FF" },
  headline: { fontSize: 11, marginTop: 4, color: "rgba(234,242,255,0.75)" },
  bio: { fontSize: 10, marginTop: 10, color: "rgba(234,242,255,0.70)", lineHeight: 1.35 },

  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 as any, marginTop: 10 },
  pill: { fontSize: 9, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  pillSoft: { backgroundColor: "rgba(16,185,129,0.15)", color: "#A7F3D0" },
  pillAccent: { backgroundColor: "rgba(245,158,11,0.18)", color: "#FCD34D" },
  pillNeutral: { backgroundColor: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.75)" },

  summaryWrap: { alignItems: "center", marginBottom: 12 },
  summaryCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    border: "1px solid rgba(15,23,42,0.08)",
  },

  columns: { flexDirection: "row", gap: 14 as any },
  colLeft: { width: "40%" },
  colRight: { width: "60%" },

  sectionTitle: { fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#0B1220" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    border: "1px solid rgba(15,23,42,0.08)",
  },

  paragraph: { fontSize: 10.5, lineHeight: 1.4, color: "#0B1220" },
  muted: { fontSize: 9, color: "rgba(11,18,32,0.65)" },
  mutedSmall: { fontSize: 8.5, marginTop: 2, color: "rgba(11,18,32,0.55)" },

  timelineRow: { flexDirection: "row", gap: 8 as any, marginBottom: 10 },
  timelineIndex: { fontSize: 9, color: "rgba(11,18,32,0.55)", width: 14 },
  timelineTitle: { fontSize: 10, fontWeight: 600, color: "#0B1220" },

  groupTitle: { fontSize: 9.5, fontWeight: 600, marginBottom: 6, color: "#0B1220" },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 as any },
  badge: {
    fontSize: 8.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(2,132,199,0.10)",
    color: "#075985",
    border: "1px solid rgba(2,132,199,0.18)",
  },

  projectRow: { marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid rgba(15,23,42,0.06)" },
  projectMeta: { fontSize: 8.5, color: "rgba(11,18,32,0.60)" },
  projectTitle: { fontSize: 10.5, fontWeight: 600, marginTop: 3, color: "#0B1220" },
  projectDesc: { fontSize: 9.5, marginTop: 4, color: "rgba(11,18,32,0.75)", lineHeight: 1.35 },

  linkRow: { marginBottom: 8 },
  link: { fontSize: 8.5, color: "#2563EB", textDecoration: "none" },

  footer: { marginTop: 14, fontSize: 8.5, color: "rgba(11,18,32,0.55)", textAlign: "center" },
});
