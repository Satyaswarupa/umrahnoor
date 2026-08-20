"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 70;
const DELETE_MS = 40;
const PAUSE_AFTER_TYPE_MS = 1600;
const PAUSE_AFTER_DELETE_MS = 300;

export default function TypewriterText({
  phrases,
  className,
}: {
  phrases: string[];
  className?: string;
}) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIndex % phrases.length];

    if (!deleting && length === phrase.length) {
      const id = setTimeout(() => setDeleting(true), PAUSE_AFTER_TYPE_MS);
      return () => clearTimeout(id);
    }

    if (deleting && length === 0) {
      const id = setTimeout(() => {
        setDeleting(false);
        setPhraseIndex((i) => (i + 1) % phrases.length);
      }, PAUSE_AFTER_DELETE_MS);
      return () => clearTimeout(id);
    }

    const id = setTimeout(
      () => setLength((l) => l + (deleting ? -1 : 1)),
      deleting ? DELETE_MS : TYPE_MS
    );
    return () => clearTimeout(id);
  }, [length, deleting, phraseIndex, phrases]);

  const phrase = phrases[phraseIndex % phrases.length];

  return (
    <span className={className}>
      {/* Real, complete text for search engines and screen readers — the
          animated span below is decorative and hidden from assistive tech. */}
      <span className="sr-only">{phrases[0]}</span>
      <span aria-hidden="true">
        {phrase.slice(0, length)}
        <span className="animate-pulse">|</span>
      </span>
    </span>
  );
}
