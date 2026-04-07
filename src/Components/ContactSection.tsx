"use client";

import AnimatedReveal from "@/Components/AnimatedReveal";
import { Loader2, Mail, MapPin, PhoneCall, RefreshCcw } from "lucide-react";
import { useAppUI } from "@/Components/AppUIProvider";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type SiteConfigSubset = {
  contactEmail: string | null;
  contactPhone: string | null;
  contactLocationEn: string | null;
  contactLocationBn: string | null;
};

type ContactSectionProps = {
  siteConfig?: SiteConfigSubset | null;
};

type ContactFormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  captchaAnswer: string;
};

type CaptchaPayload = {
  captchaText: string;
  captchaToken: string;
};

export default function ContactSection({ siteConfig = null }: Readonly<ContactSectionProps>) {
  const { language, t } = useAppUI();
  const [form, setForm] = useState<ContactFormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
    captchaAnswer: "",
  });
  const [captchaText, setCaptchaText] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const location = language === "bn" ? siteConfig?.contactLocationBn : siteConfig?.contactLocationEn;
  const captchaDisplay = useMemo(() => captchaText.split("").join(" "), [captchaText]);

  const loadCaptcha = useCallback(async () => {
    setIsLoadingCaptcha(true);

    try {
      const response = await fetch("/api/public/contact/captcha", { cache: "no-store" });
      const payload = (await response.json()) as CaptchaPayload & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || t("contact.captchaLoadFailed", "Failed to load captcha."));
      }

      setCaptchaText(payload.captchaText || "");
      setCaptchaToken(payload.captchaToken || "");
      setForm((previous) => ({ ...previous, captchaAnswer: "" }));
    } catch (captchaError) {
      const captchaMessage = captchaError instanceof Error ? captchaError.message : t("contact.captchaLoadFailed", "Failed to load captcha.");
      setError(captchaMessage);
    } finally {
      setIsLoadingCaptcha(false);
    }
  }, [t]);

  useEffect(() => {
    void loadCaptcha();
  }, [loadCaptcha]);

  const updateField = (field: keyof ContactFormState, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!captchaToken) {
      await loadCaptcha();
      setError(t("contact.captchaRequired", "Captcha is required."));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          captchaToken,
        }),
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error || t("contact.sendFailed", "Failed to send message."));
      }

      setMessage(payload.message || t("contact.sentSuccess", "Thanks! Your message has been sent."));
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
        captchaAnswer: "",
      });
      await loadCaptcha();
    } catch (submitError) {
      const submitMessage = submitError instanceof Error ? submitError.message : t("contact.sendFailed", "Failed to send message.");
      setError(submitMessage);
      await loadCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-surface px-8 py-32" id="contact">
      <AnimatedReveal className="glass-panel relative mx-auto max-w-4xl overflow-hidden rounded-[40px] p-8 md:p-16" delay={0.05}>
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-secondary/20 blur-[80px]" />

        <div className="mb-16 text-center" data-reveal>
          <h2 className="mb-4 font-headline text-5xl font-bold">
            <span className="text-gradient-primary">{t("sections.connect", "Let's Connect")}</span>
          </h2>
          <p className="text-on-surface-variant">{t("contact.openTo", "Currently open to freelance opportunities and full-time senior roles.")}</p>
        </div>

        <form className="space-y-8" data-reveal onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="ml-1 text-xs tracking-widest text-on-surface-variant uppercase">
                {t("contact.name", "Your Name")}
              </label>
              <input
                id="name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="w-full border-0 border-b border-outline-variant/30 bg-transparent px-1 py-3 text-on-surface transition-all focus:border-secondary focus:ring-0"
                type="text"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="ml-1 text-xs tracking-widest text-on-surface-variant uppercase">
                {t("contact.email", "Email Address")}
              </label>
              <input
                id="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full border-0 border-b border-outline-variant/30 bg-transparent px-1 py-3 text-on-surface transition-all focus:border-secondary focus:ring-0"
                type="email"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="ml-1 text-xs tracking-widest text-on-surface-variant uppercase">
              {t("contact.subject", "Subject")}
            </label>
            <input
              id="subject"
              value={form.subject}
              onChange={(event) => updateField("subject", event.target.value)}
              className="w-full border-0 border-b border-outline-variant/30 bg-transparent px-1 py-3 text-on-surface transition-all focus:border-secondary focus:ring-0"
              type="text"
              placeholder={t("contact.subjectPlaceholder", "Hiring, collaboration, project help...")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="ml-1 text-xs tracking-widest text-on-surface-variant uppercase">
              {t("contact.message", "Your Message")}
            </label>
            <textarea
              id="message"
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              className="w-full resize-none border-0 border-b border-outline-variant/30 bg-transparent px-1 py-3 text-on-surface transition-all focus:border-secondary focus:ring-0"
              rows={4}
              placeholder={t("contact.messagePlaceholder", "Tell me about your project...")}
              required
            />
          </div>

          <div className="glass-panel rounded-2xl border border-outline-variant/30 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs tracking-widest text-on-surface-variant uppercase">{t("contact.captchaVerification", "Captcha Verification")}</p>
              <button
                type="button"
                onClick={() => void loadCaptcha()}
                disabled={isLoadingCaptcha || isSubmitting}
                className="inline-flex items-center gap-1 rounded-full border border-outline-variant/40 px-3 py-1 text-[11px] font-semibold text-on-surface-variant"
              >
                <RefreshCcw className={`h-3.5 w-3.5 ${isLoadingCaptcha ? "animate-spin" : ""}`} />
                {isLoadingCaptcha ? t("contact.refreshing", "Refreshing") : t("contact.refresh", "Refresh")}
              </button>
            </div>
            <p className="mb-3 font-mono text-lg font-bold tracking-[0.3em] text-on-surface select-none">
              {captchaDisplay || "------"}
            </p>
            <input
              id="captcha"
              value={form.captchaAnswer}
              onChange={(event) => updateField("captchaAnswer", event.target.value.toUpperCase())}
              className="w-full border-0 border-b border-outline-variant/30 bg-transparent px-1 py-2 text-on-surface transition-all focus:border-secondary focus:ring-0"
              type="text"
              placeholder={t("contact.captchaPlaceholder", "Type captcha here")}
              required
            />
          </div>

          <button
            disabled={isSubmitting || isLoadingCaptcha}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-primary-container hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {isSubmitting ? t("contact.sending", "Sending...") : t("contact.send", "Send Message")}
          </button>

          {message ? <p className="text-sm text-emerald-500">{message}</p> : null}
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </form>

        <div className="mt-16 grid grid-cols-1 gap-8 border-t border-white/5 pt-12 text-center md:grid-cols-3" data-reveal>
          <div className="space-y-2">
            <Mail className="mx-auto h-6 w-6 text-secondary" />
            <p className="text-sm text-on-surface">{siteConfig?.contactEmail || "hello@devportfolio.com"}</p>
          </div>
          <div className="space-y-2">
            <PhoneCall className="mx-auto h-6 w-6 text-secondary" />
            <p className="text-sm text-on-surface">{siteConfig?.contactPhone || "+1 (555) 000-0000"}</p>
          </div>
          <div className="space-y-2">
            <MapPin className="mx-auto h-6 w-6 text-secondary" />
            <p className="text-sm text-on-surface">{location || t("contact.locationFallback", "Worldwide Remote")}</p>
          </div>
        </div>
      </AnimatedReveal>
    </section>
  );
}
