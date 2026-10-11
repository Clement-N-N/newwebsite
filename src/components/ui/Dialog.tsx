"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Native <dialog> for built-in focus trapping, Escape handling and an accessible modal role. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
      className={`m-auto w-[calc(100%-2rem)] ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[var(--radius-card)] bg-brand-background p-0 text-brand-text shadow-[var(--shadow-lifted)]`}
    >
      <div className="p-6 sm:p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="dialog-title" className="type-h2">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 -mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-brand-muted hover:bg-brand-surface"
            aria-label="Close"
          >
            <svg aria-hidden width="18" height="18" viewBox="0 0 18 18">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
