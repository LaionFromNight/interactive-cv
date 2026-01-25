import type { CV, CVProfiles } from "../../lib/cvTypes";
import { SectionHeader } from "../layout/SectionHeader";

export function ContactSection({ cv }: { cv: CV }) {
  const profiles: CVProfiles[] = Array.isArray(cv.person.profiles)
    ? (cv.person.profiles as CVProfiles[])
    : [];

  return (
    <section id="contact" className="py-12 md:py-16">
      <SectionHeader title="Contact" desc="Direct contact details and profiles." />

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-white/70">Email</p>
            <p className="mt-1 font-semibold">{cv.person.contacts.email}</p>

            {cv.person.contacts.phone ? (
              <>
                <p className="mt-2 text-sm text-white/70">Phone</p>
                <p className="mt-1 font-semibold">{cv.person.contacts.phone}</p>
              </>
            ) : null}
          </div>

          <div>
            <p className="text-sm text-white/70">Profiles</p>

            <div className="mt-2 flex flex-wrap gap-2">
              {profiles.map((p: CVProfiles) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                  title={p.url}
                >
                  {p.icon_url ? (
                    <img
                      src={p.icon_url}
                      alt=""
                      className="h-4 w-4"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xs opacity-80">{p.icon === "globe" ? "🌐" : "🔗"}</span>
                  )}

                  <span className="font-medium">{p.label}</span>
                </a>
              ))}

              {profiles.length === 0 ? (
                <span className="text-sm text-white/50">No profiles provided.</span>
              ) : null}
            </div>

            <p className="mt-4 text-xs text-white/50">Last updated: {cv.meta.generated_at_local}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
