import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { CV, CVProfiles } from "../../lib/cvTypes";
import { Avatar } from "../ui/Avatar";
import { ArrowRightIcon, DownloadIcon, MailIcon, ProfileIcon } from "../ui/Icons";
import { Reveal } from "../ui/Reveal";

type InterestTone =
  | "notInterested"
  | "maybe"
  | "looking"
  | "ideal"
  | "neutral";

type Interest = {
  id: string;
  label: string;
  tone: InterestTone;
};

const interestToneClassName: Record<InterestTone, string> = {
  notInterested: "tone-badge tone-badge--rose",
  maybe: "tone-badge tone-badge--amber",
  looking: "tone-badge tone-badge--sky",
  ideal: "tone-badge tone-badge--emerald",
  neutral: "tone-badge tone-badge--slate",
};

const interests: Interest[] = [
  // { id: "long-term", label: "Long-term roles", tone: "notInterested" },
  { id: "part-time", label: "Part-time roles", tone: "maybe" },
  { id: "short", label: "Short-term projects", tone: "looking" },
  { id: "mentoring", label: "Mentoring", tone: "ideal" },
  {
    id: "nonprofit",
    label: "Non-profit (animal welfare)",
    tone: "ideal",
  },
];

const focusAreas = [
  "Backend / Solution Architecture",
  "System Design",
  "Cloud / Serverless",
];

const ROLE_INTERVAL_MS = 2800;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function useCountUp(target: number, ref: RefObject<HTMLElement | null>, durationMs = 1400) {
  const [animate] = useState(
    () => !prefersReducedMotion() && typeof IntersectionObserver !== "undefined",
  );
  const [value, setValue] = useState(animate ? 0 : target);

  useEffect(() => {
    const el = ref.current;
    if (!el || !animate) return;

    let frame = 0;
    const obs = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(target * eased));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });

    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, durationMs, ref, animate]);

  return animate ? value : target;
}

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const counted = useCountUp(value, ref);

  return (
    <div className="px-4 py-4 text-center sm:text-left">
      <p
        ref={ref}
        className="font-display text-3xl font-semibold tabular-nums text-fg md:text-4xl"
      >
        {counted}
        {suffix ? <span className="text-gradient">{suffix}</span> : null}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-subtle">{label}</p>
    </div>
  );
}

function RoleRotator({ roles }: { roles: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (roles.length < 2 || prefersReducedMotion()) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % roles.length), ROLE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [roles.length]);

  return (
    <span className="role-rotator" aria-live="off">
      {roles.map((role, i) => (
        <span key={role} data-active={i === index ? "true" : "false"} aria-hidden={i !== index}>
          {role}
        </span>
      ))}
    </span>
  );
}

export function Hero({
  cv,
  onOpenPdfModal,
}: {
  cv: CV;
  onOpenPdfModal: () => void;
}) {
  const person = cv.person;
  const roles = useMemo(
    () => person.headline.split("/").map((r) => r.trim()).filter(Boolean),
    [person.headline],
  );

  const stats = useMemo(() => {
    const starts = cv.experience_timeline.map((t) => t.start).filter(Boolean).sort();
    const firstYear = Number.parseInt(starts[0]?.slice(0, 4) ?? "", 10);
    const years = Number.isFinite(firstYear) ? new Date().getFullYear() - firstYear : 0;
    const projects = cv.projects.filter((p) => p.public?.show !== false).length;
    const tech = cv.skills?.tech?.length ?? 0;
    const companies = cv.companies.length;
    return { years, projects, tech, companies };
  }, [cv]);

  const profiles: CVProfiles[] = Array.isArray(person.profiles) ? person.profiles : [];
  const [firstName, ...restName] = person.full_name.split(" ");

  return (
    <section className="relative pb-12 pt-12 md:pb-20 md:pt-20" id="about">
      <div className="grid items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <Reveal>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface-2 px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur">
              <span className="pulse-dot" aria-hidden="true" />
              Available for selected projects & mentoring
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight text-fg sm:text-6xl md:text-7xl">
              {firstName}{" "}
              <span className="text-gradient">{restName.join(" ")}</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 font-display text-xl font-medium text-fg/90 md:text-2xl">
              <span className="text-subtle">I’m a </span>
              <RoleRotator roles={roles} />
            </p>
            <p className="sr-only">{person.headline}</p>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted md:text-lg">
              {person.bio_short ?? "—"}
            </p>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="btn btn-primary" href="#contact">
                <MailIcon />
                Let’s talk
              </a>
              <button type="button" className="btn btn-secondary" onClick={onOpenPdfModal}>
                <DownloadIcon />
                Download CV
              </button>
              <a className="btn btn-ghost group" href="#experience">
                Browse experience
                <ArrowRightIcon className="transition group-hover:translate-x-1" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {profiles.map((p) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="icon-btn"
                  aria-label={p.label}
                  title={p.label}
                >
                  <ProfileIcon id={p.id} />
                </a>
              ))}
              <a
                href={`mailto:${person.contacts.email}`}
                className="icon-btn"
                aria-label="Email"
                title={person.contacts.email}
              >
                <MailIcon />
              </a>
              <span className="ml-1 text-sm text-subtle">
                {(person.spoken_languages ?? []).join(" · ")}
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative">
          <div className="float-slow relative mx-auto max-w-sm">
            <div className="panel gradient-border rounded-[2rem] p-6">
              <div className="flex items-center gap-4">
                <div className="avatar-ring shrink-0">
                  <Avatar
                    src={person.avatar_url}
                    name={person.full_name}
                    className="h-20 w-20 rounded-[1.8rem]"
                    textClassName="text-2xl"
                    size={80}
                    priority
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold text-fg">{person.full_name}</p>
                  <p className="mt-0.5 text-sm text-muted">{roles[0]}</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="field-label">Focus</p>
                <div className="flex flex-wrap gap-2">
                  {focusAreas.map((area) => (
                    <span key={area} className="chip rounded-full border px-3 py-1 text-xs font-medium">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="field-label">Currently open for</p>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <span
                      key={interest.id}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${interestToneClassName[interest.tone]}`}
                    >
                      {interest.label}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-subtle">Have something else in mind? Reach out.</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={450}>
        <div className="panel mt-14 grid grid-cols-2 divide-line md:grid-cols-4 md:divide-x">
          <Stat value={stats.years} suffix="+" label="Years in software" />
          <Stat value={stats.projects} label="Commercial projects" />
          <Stat value={stats.companies} label="Companies" />
          <Stat value={stats.tech} suffix="+" label="Technologies" />
        </div>
      </Reveal>
    </section>
  );
}
