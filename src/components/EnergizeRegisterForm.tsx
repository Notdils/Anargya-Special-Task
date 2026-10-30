"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { friendlyError } from "@/lib/format";

type Form = { name: string; email: string; phone: string; institution: string };
type Errors = Partial<Record<keyof Form, string>>;
const EMPTY: Form = { name: "", email: "", phone: "", institution: "" };

// Placeholder — ganti dengan link grup LINE asli
const LINE_GROUP_URL = "#";

function validate(f: Form): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 3) e.name = "Name must be at least 3 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid email, e.g. you@example.com.";
  if (!/^(\+62|62|0)8\d{7,12}$/.test(f.phone.replace(/[\s-]/g, ""))) e.phone = "Enter a valid WhatsApp number, e.g. 081234567890.";
  if (f.institution.trim().length < 2) e.institution = 'Institution is required. Write "Umum" if none.';
  return e;
}

const inputCls =
  "w-full rounded-lg bg-[#1c1c1c] px-5 py-4 font-inter text-[17px] text-white placeholder:text-[#9e9e9e] outline-none transition focus:ring-2 focus:ring-brand/60";

export default function EnergizeRegisterForm({ deadline }: { deadline: string }) {
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: number; name: string } | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => setClosed(Date.now() > new Date(deadline).getTime()), [deadline]);

  const set = (k: keyof Form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError(null);
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) {
      const el = document.getElementById(`reg-${Object.keys(e)[0]}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" }); // tidak tertutup navbar sticky
      el?.focus({ preventScroll: true });
      return;
    }
    setBusy(true);
    const { data, error } = await supabase().rpc("register_energize", {
      p_name: form.name,
      p_email: form.email,
      p_phone: form.phone.replace(/[\s-]/g, ""),
      p_institution: form.institution,
    });
    setBusy(false);
    if (error) {
      if (error.message.includes("EMAIL_ALREADY_REGISTERED")) setErrors({ email: "This email is already registered." });
      else if (error.message.includes("REGISTRATION_CLOSED")) setClosed(true);
      else setServerError(friendlyError(error));
      return;
    }
    setDone(data as { id: number; name: string });
  }

  if (done) {
    return (
      <div className="flex flex-col items-start gap-5 rounded-xl border border-brand/60 bg-[#1c1c1c] p-7 md:p-9" role="status">
        <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden>
          <circle cx="24" cy="24" r="22" stroke="#29D970" strokeWidth="3" />
          <path d="M15 25l6 6 12-13" stroke="#29D970" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3 className="font-inter text-[28px] font-black tracking-[-0.02em] md:text-[32px]">You&apos;re registered, {done.name}!</h3>
        <p className="text-[17px] leading-relaxed text-white/75">The Zoom link will be shared in the LINE group before the event.</p>
        <a
          href={LINE_GROUP_URL}
          onClick={(e) => e.preventDefault()}
          className="w-full rounded-lg bg-brand px-7 py-4 text-center font-inter text-[19px] font-bold text-black transition hover:brightness-110 md:w-auto"
        >
          Join the LINE Group
        </a>
        <p className="font-robomono text-sm font-medium text-white/50">Registration ID: ET-{String(done.id).padStart(4, "0")}</p>
      </div>
    );
  }

  const fields: { key: keyof Form; label: string; type?: string; placeholder: string; help: string; auto: string; mode?: "tel" | "email" }[] = [
    { key: "name", label: "Full Name", placeholder: "Enter your full name", help: "", auto: "name" },
    { key: "email", label: "Email", type: "email", placeholder: "you@example.com", help: "We use this to make sure you only register once.", auto: "email", mode: "email" },
    { key: "phone", label: "WhatsApp Number", placeholder: "08xxxxxxxxxx", help: "Example: 081234567890", auto: "tel", mode: "tel" },
    { key: "institution", label: "Institution", placeholder: 'e.g. ITS, or "Umum"', help: 'Not from any institution? Just write "Umum".', auto: "organization" },
  ];

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-7">
      <fieldset disabled={closed || busy} className={`grid gap-6 md:grid-cols-2 md:gap-x-9 ${closed ? "opacity-40" : ""}`}>
        {fields.map((f) => (
          <div key={f.key} className="flex flex-col gap-2.5">
            <label htmlFor={`reg-${f.key}`} className="font-inter text-lg font-bold">
              {f.label}
            </label>
            <input
              id={`reg-${f.key}`}
              type={f.type ?? "text"}
              inputMode={f.mode}
              autoComplete={f.auto}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              aria-invalid={!!errors[f.key]}
              aria-describedby={`reg-${f.key}-msg`}
              className={`${inputCls} ${errors[f.key] ? "ring-[1.5px] ring-danger" : ""}`}
            />
            <p id={`reg-${f.key}-msg`} className={`text-sm ${errors[f.key] ? "text-danger" : "text-white/75"}`}>
              {errors[f.key] ?? f.help}
            </p>
          </div>
        ))}
      </fieldset>

      {serverError && <p className="rounded-lg border border-danger/60 bg-danger/10 p-3 text-danger">{serverError}</p>}

      <div className="flex flex-col gap-3 md:items-end">
        <button
          type="submit"
          disabled={closed || busy}
          className="w-full rounded-lg bg-brand px-7 py-4 font-inter text-[19px] font-bold text-black transition hover:brightness-110 disabled:bg-white/10 disabled:text-[#9e9e9e] md:w-auto"
        >
          {closed ? "Registration Closed" : busy ? "Registering…" : "Register"}
        </button>
        {closed && <p className="text-[15px] text-[#9e9e9e]">Registration closed on 14 June 2027 at 17:00 WIB.</p>}
      </div>
    </form>
  );
}
