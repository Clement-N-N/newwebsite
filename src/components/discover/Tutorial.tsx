"use client";

import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";

export function Tutorial({ open, onDone }: { open: boolean; onDone: () => void }) {
  return (
    <Dialog open={open} onClose={onDone} title="How this works">
      <p className="text-brand-muted">You&apos;ll see short statements about your work. React to each one. There are no right answers.</p>
      <ul className="mt-5 space-y-4">
        <li className="flex gap-4">
          <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-success-soft text-lg font-bold text-brand-success">
            →
          </span>
          <span>
            <strong>Swipe or drag right</strong> if it resonates, <strong>left</strong> if it doesn&apos;t.
          </span>
        </li>
        <li className="flex gap-4">
          <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-primary-soft text-lg font-bold text-brand-primary">
            ?
          </span>
          <span>
            Not sure? Use <strong>Not sure</strong>. Uncertainty is useful information too.
          </span>
        </li>
        <li className="flex gap-4">
          <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-surface text-sm font-bold text-brand-muted">
            ⌨
          </span>
          <span>
            Prefer buttons or a keyboard? Use the buttons below each card, or the <strong>← → ↓</strong> arrow keys.
          </span>
        </li>
        <li className="flex gap-4">
          <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-surface text-lg font-bold text-brand-muted">
            ↺
          </span>
          <span>You can go back and change any answer, or pause at any time.</span>
        </li>
      </ul>
      <div className="mt-7 flex justify-end gap-3">
        <Button variant="ghost" onClick={onDone}>
          Skip
        </Button>
        <Button variant="secondary" onClick={onDone}>
          Start
        </Button>
      </div>
    </Dialog>
  );
}
