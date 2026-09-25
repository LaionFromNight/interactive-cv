import { useState } from "react";
import type { CV, CVProfiles } from "../../lib/cvTypes";
import { Reveal } from "../ui/Reveal";
import { CheckIcon, CopyIcon, MailIcon, PhoneIcon, ProfileIcon } from "../ui/Icons";

function formatPhone(phone: string) {
  const match = phone.match(/^(\+\d{2})(\d{3})(\d{3})(\d{3})$/);
  return match ? `${match[1]} ${match[2]} ${match[3]} ${match[4]}` : phone;
}

export function ContactSection({ cv }: { cv: CV }) {
  const profiles: CVProfiles[] = Array.isArray(cv.person.profiles)
    ? (cv.person.profiles as CVProfiles[])
    : [];
  const { email, phone } = cv.person.contacts;
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24">
      <Reveal>
        <div className="panel gradient-border relative overflow-hidden rounded-[2rem] px-6 py-12 text-center md:px-12 md:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
            style={{ background: "var(--grad)" }}
          />

          <p className="eyebrow relative justify-center">Contact</p>
          <h2 className="relative mx-auto mt-4 max-w-2xl font-display text-4xl font-bold tracking-tight text-fg md:text-5xl">
            Have a project in mind? <span className="text-gradient">Let’s talk.</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base leading-7 text-muted">
            Architecture reviews, backend delivery, short-term projects or mentoring — drop me a line and I’ll get back to you.
          </p>

          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={`mailto:${email}`} className="btn btn-primary">
              <MailIcon />
              {email}
            </a>
            <button type="button" className="btn btn-secondary" onClick={copyEmail} aria-live="polite">
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Copied!" : "Copy email"}
            </button>
            {phone ? (
              <a href={`tel:${phone}`} className="btn btn-secondary">
                <PhoneIcon />
                {formatPhone(phone)}
              </a>
            ) : null}
          </div>

          {profiles.length ? (
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              {profiles.map((p) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost"
                  title={p.url}
                >
                  <ProfileIcon id={p.id} />
                  {p.label}
                </a>
              ))}
            </div>
          ) : null}

          <p className="relative mt-8 text-xs text-subtle">Last updated: {cv.meta.generated_at_local}</p>
        </div>
      </Reveal>
    </section>
  );
}
