import { useEffect, type ReactNode } from "react";

export function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  size = "md",
  bodyClassName = "overflow-y-auto px-6 py-5",
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** "xl" gives a near full-screen workspace (e.g. editor + live preview). */
  size?: "md" | "xl";
  bodyClassName?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-backdrop absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className={`modal-surface relative flex w-full flex-col rounded-3xl ${
          size === "xl" ? "h-[94vh] max-w-[1320px]" : "max-h-[90vh] max-w-3xl"
        }`}
      >
        <div
          className={`flex items-start justify-between gap-4 border-b border-line px-6 ${
            size === "xl" ? "py-3 sm:py-5" : "py-5"
          }`}
        >
          <div>
            <h3 className="font-display text-xl font-semibold text-fg">{title}</h3>
            {subtitle ? (
              <p className={`mt-1 text-sm text-muted ${size === "xl" ? "hidden sm:block" : ""}`}>{subtitle}</p>
            ) : null}
          </div>
          <button type="button" onClick={onClose} className="icon-btn shrink-0" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
        {footer ? (
          <div
            className={`flex flex-wrap justify-end gap-3 border-t border-line px-6 ${
              size === "xl" ? "py-3 sm:py-4" : "py-4"
            }`}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
