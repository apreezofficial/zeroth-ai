"use client";

import { useState } from "react";

/** A terminal-style command with a copy button. */
export function CopyCommand({ command, className = "" }: { command: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the command stays selectable as text.
    }
  }

  return (
    <div className={`inline-flex max-w-full items-stretch bg-black text-white ${className}`}>
      <code className="overflow-x-auto whitespace-nowrap px-5 py-3.5 font-mono text-[15px] select-all">
        <span className="select-none text-white/45">$ </span>
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : `Copy command: ${command}`}
        className="shrink-0 border-l border-white/15 px-4 text-[13px] font-semibold hover:bg-accent focus-visible:bg-accent"
      >
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
