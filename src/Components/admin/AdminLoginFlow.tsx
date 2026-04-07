"use client";

import { useEffect, useMemo, useState } from "react";

type CaptchaPayload = {
  captchaText: string;
  captchaToken: string;
  expiresInSeconds: number;
};

type LoginResponse = {
  requiresOtp: boolean;
  challengeId: string;
  maskedEmail: string;
  expiresAt: string;
};

type VerifyOtpResponse = {
  ok: boolean;
};

export default function AdminLoginFlow() {
  const [step, setStep] = useState<"login" | "otp">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const captchaDisplay = useMemo(() => captchaText.split("").join(" "), [captchaText]);

  async function loadCaptcha() {
    const response = await fetch("/api/admin/auth/captcha", { cache: "no-store" });
    const payload = (await response.json()) as CaptchaPayload;

    setCaptchaText(payload.captchaText);
    setCaptchaToken(payload.captchaToken);
    setCaptchaAnswer("");
  }

  useEffect(() => {
    void loadCaptcha();
  }, []);

  async function handleLoginSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          captchaAnswer,
          captchaToken,
        }),
      });

      const payload = (await response.json()) as LoginResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Login failed.");
      }

      setChallengeId(payload.challengeId);
      setMaskedEmail(payload.maskedEmail);
      setStep("otp");
      setOtp("");
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : "Login failed.";
      setError(message);
      await loadCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOtpSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId,
          otp,
        }),
      });

      const payload = (await response.json()) as VerifyOtpResponse & { error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "OTP verification failed.");
      }

      globalThis.location.reload();
    } catch (otpError) {
      const message = otpError instanceof Error ? otpError.message : "OTP verification failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-outline-variant/30 bg-surface-container p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-on-surface">Admin Login</h1>
      <p className="mt-2 text-sm text-on-surface-variant">
        {step === "login"
          ? "Enter your admin credentials, solve captcha, and continue."
          : `OTP sent to ${maskedEmail}. Enter your 8-character code.`}
      </p>

      {step === "login" ? (
        <form className="mt-8 space-y-5" onSubmit={handleLoginSubmit}>
          <label className="block space-y-2 text-sm">
            <span className="text-on-surface">Admin Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-on-surface outline-none focus:border-primary"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="text-on-surface">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-on-surface outline-none focus:border-primary"
            />
          </label>

          <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase">Captcha</p>
              <button
                type="button"
                onClick={() => {
                  void loadCaptcha();
                }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Refresh
              </button>
            </div>
            <p className="font-mono text-xl font-bold tracking-[0.35em] text-on-surface select-none">{captchaDisplay}</p>
          </div>

          <label className="block space-y-2 text-sm">
            <span className="text-on-surface">Type the captcha above</span>
            <input
              type="text"
              value={captchaAnswer}
              onChange={(event) => setCaptchaAnswer(event.target.value)}
              required
              className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-on-surface outline-none focus:border-primary"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary px-4 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Verifying..." : "Continue to 2FA"}
          </button>
        </form>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={handleOtpSubmit}>
          <label className="block space-y-2 text-sm">
            <span className="text-on-surface">8-character OTP</span>
            <input
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value.toUpperCase())}
              minLength={8}
              maxLength={8}
              required
              className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 font-mono tracking-[0.25em] text-on-surface outline-none focus:border-primary"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary px-4 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Verifying OTP..." : "Login"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("login");
              setOtp("");
              setChallengeId("");
              setMaskedEmail("");
              void loadCaptcha();
            }}
            className="w-full rounded-xl border border-outline-variant/40 px-4 py-2.5 font-semibold text-on-surface transition hover:bg-surface-container-low"
          >
            Back to login
          </button>
        </form>
      )}

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
