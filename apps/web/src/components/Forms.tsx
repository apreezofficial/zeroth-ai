"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { card } from "./styles";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[13px] font-semibold">{label}</label>
      {children}
      {error && <p role="alert" className="mt-1.5 text-[13px] font-medium text-red-600">{error}</p>}
    </div>
  );
}

const input =
  "w-full border border-black bg-white px-4 py-3.5 text-[15px] outline-none placeholder:text-black/35 focus:border-accent focus:shadow-[0_0_0_3px_rgba(123,97,255,0.25)]";

function Submit({ children, busy }: { children: ReactNode; busy: boolean }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="group inline-flex w-full items-center justify-between gap-12 bg-black px-5 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-accent disabled:opacity-60 sm:w-auto sm:min-w-[220px]"
    >
      {busy ? "Sending…" : children}
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden><path d="M2 2l6 6-6 6" stroke="currentColor" strokeWidth="2" /></svg>
    </button>
  );
}

function useFakeSubmit() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  // No backend yet: this only simulates the round trip. Wire to a real endpoint before launch.
  const run = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setDone(true);
    }, 700);
  };
  return { busy, done, run, reset: () => setDone(false) };
}

const topics = ["Sales", "Support", "Other"] as const;

export function ContactForm() {
  const [topic, setTopic] = useState<(typeof topics)[number]>("Sales");
  const [v, setV] = useState({ email: "", name: "", company: "", msg: "" });
  const [err, setErr] = useState<{ email?: string; name?: string; msg?: string }>({});
  const s = useFakeSubmit();
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((o) => ({ ...o, [k]: e.target.value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next = {
      email: EMAIL.test(v.email) ? undefined : "Enter a valid email address.",
      name: v.name.trim() ? undefined : "Please tell us your name.",
      msg: v.msg.trim().length >= 10 ? undefined : "Add a little more detail (10+ characters).",
    };
    setErr(next);
    if (!next.email && !next.name && !next.msg) s.run();
  };

  if (s.done)
    return (
      <div className={`${card} p-8 text-left`}>
        <h3 className="text-[26px] font-bold tracking-tight">Message ready.</h3>
        <p className="mt-3 text-[15px] leading-[1.55] text-black/70">
          This preview build isn’t connected to a mail service yet, so nothing was sent. Connect the form to an endpoint before launch.
        </p>
        <button onClick={s.reset} className="mt-6 text-[14px] font-semibold underline underline-offset-4">Write another</button>
      </div>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="text-left">
      <div className="mb-8 flex flex-wrap justify-center gap-2" role="tablist">
        {topics.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={t === topic} onClick={() => setTopic(t)} className={`px-6 py-3 text-[15px] font-semibold ${t === topic ? "bg-accent text-white" : "bg-black text-white hover:bg-accent/80"}`}>{t}</button>
        ))}
      </div>
      <div className="space-y-5">
        <Field id="c-email" label="Work email" error={err.email}><input id="c-email" type="email" value={v.email} onChange={set("email")} placeholder="you@company.com" className={input} /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="c-name" label="Your name" error={err.name}><input id="c-name" value={v.name} onChange={set("name")} className={input} /></Field>
          <Field id="c-company" label="Company"><input id="c-company" value={v.company} onChange={set("company")} className={input} /></Field>
        </div>
        <Field id="c-msg" label={topic === "Support" ? "What’s going wrong?" : "What can we show you?"} error={err.msg}>
          <textarea id="c-msg" rows={5} value={v.msg} onChange={set("msg")} className={input} />
        </Field>
        <Submit busy={s.busy}>Send message</Submit>
      </div>
    </form>
  );
}
