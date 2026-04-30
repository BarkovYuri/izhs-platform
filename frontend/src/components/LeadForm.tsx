"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import PrivacyLink from "@/components/PrivacyLink";
import { createLead } from "@/services/api";
import type { LeadPayload } from "@/types/api";

type Source = NonNullable<LeadPayload["source"]>;

export default function LeadForm({
  source = "homepage",
  buildId,
  buildTitle,
  compact = false,
}: {
  source?: Source;
  buildId?: number;
  buildTitle?: string;
  compact?: boolean;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [message, setMessage] = useState(buildTitle ? `Интересует проект «${buildTitle}»` : "");
  const [agree, setAgree] = useState(true);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setState("error"); setErrorText("Введите имя"); return;
    }
    // Жёсткая проверка номера телефона: должно быть 10-15 цифр
    // (без учёта пробелов/скобок/дефисов).
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      setState("error");
      setErrorText("Введите корректный номер телефона (минимум 10 цифр)");
      return;
    }
    if (!agree) {
      setState("error"); setErrorText("Нужно согласие на обработку персональных данных"); return;
    }
    setState("loading"); setErrorText("");

    const payload: LeadPayload & { website?: string } = {
      name: name.trim(), phone: phone.trim(),
      email: email.trim() || undefined,
      message: message.trim() || undefined,
      source,
      build: buildId,
      page_url: typeof window !== "undefined" ? window.location.href : undefined,
      website,
    };

    const res = await createLead(payload);
    if (res.ok) {
      setState("ok");
      setName(""); setPhone(""); setEmail("");
      setMessage(buildTitle ? `Интересует проект «${buildTitle}»` : "");
    } else {
      setState("error"); setErrorText(res.error || "Не удалось отправить, попробуйте позже");
    }
  }

  if (state === "ok") {
    return (
      <div className="card-rs p-6 flex items-start gap-3">
        <CheckCircle2 className="text-[var(--rs-success)] shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-[16px]">Заявка отправлена</div>
          <div className="text-[14px] text-[var(--rs-muted)] mt-1">
            Свяжемся с вами в ближайшее время. Спасибо!
          </div>
          <button className="btn-ghost mt-3 text-[13px]" onClick={() => setState("idle")}>
            Отправить ещё одну
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "grid gap-3" : "card-rs p-6 grid gap-3"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="input-rs" placeholder="Ваше имя" value={name}
          onChange={(e) => setName(e.target.value)} required
          minLength={2} maxLength={120}
          autoComplete="name"
        />
        <input
          className="input-rs"
          placeholder="+7 (___) ___-__-__"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          inputMode="tel"
          autoComplete="tel"
          pattern="[\d\+\-\(\)\s]{10,20}"
          title="Минимум 10 цифр (с кодом страны)"
        />
      </div>
      <input
        className="input-rs" placeholder="Email (опционально)" type="email" value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <textarea
        className="input-rs min-h-[96px] resize-y" placeholder="Сообщение"
        value={message} onChange={(e) => setMessage(e.target.value)}
      />
      {/* honeypot — скрыт от людей, видим ботам */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Сайт (не заполняйте)
          <input
            type="text" name="website" tabIndex={-1} autoComplete="off"
            value={website} onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>
      <label className="flex items-start gap-2 text-[12px] text-[var(--rs-muted)]">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
        <span>
          Согласен с{" "}
          <PrivacyLink>Политикой обработки персональных данных</PrivacyLink>{" "}
          (152-ФЗ).
        </span>
      </label>
      {state === "error" && errorText && (
        <div className="text-[13px] text-[var(--rs-danger)]">{errorText}</div>
      )}
      <button type="submit" disabled={state === "loading"} className="btn-primary justify-center disabled:opacity-60">
        {state === "loading" ? <Loader2 size={16} className="animate-spin" /> : null}
        {state === "loading" ? "Отправляем…" : "Отправить заявку"}
      </button>
    </form>
  );
}
