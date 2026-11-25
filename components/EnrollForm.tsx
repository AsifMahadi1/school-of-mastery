"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent, type ReactNode } from "react";

import { enrollFields, enrollmentSchema, PAYMENT_METHODS, type EnrollFieldName } from "@/lib/enrollment";
import { SCREENSHOT_ACCEPT, validateScreenshot } from "@/lib/screenshot";
import { siteConfig } from "@/lib/siteConfig";

/**
 * The enrollment card (section #enroll) — the only client-side interactive
 * piece of the page.
 *
 * Layout follows "Website sections./fifth section.png": light-grey card, the
 * client's logo on top, white pill inputs (label above, * = required), the
 * fee/payment info row, the gold Confirm button and the Discord footnote.
 * Field rules come from lib/enrollment.ts (the same zod schema the API uses).
 */

/** The footnote's link — the design points at discord.com. */
const DISCORD_URL = "https://discord.com";

type Values = {
  fullName: string;
  profession: string;
  phone: string;
  address: string;
  paymentMethod: (typeof PAYMENT_METHODS)[number];
  transactionId: string;
};

type Errors = Partial<Record<keyof Values | "screenshot", string>>;

const INITIAL_VALUES: Values = {
  fullName: "",
  profession: "",
  phone: "",
  address: "",
  paymentMethod: "bKash",
  transactionId: "",
};

const inputClass =
  "h-[clamp(44px,3.07vw,59px)] w-full rounded-full bg-white px-[clamp(14px,2.03vw,39px)] font-body text-[clamp(15px,1.25vw,24px)] leading-none text-[#1c1c1c] outline-none placeholder:text-[#cfcfcf] focus-visible:ring-2 focus-visible:ring-gold-deep/70";

const labelClass =
  "mb-[clamp(4px,0.94vw,18px)] pl-[clamp(6px,1.25vw,24px)] font-body text-[clamp(14px,1.2vw,23px)] leading-none text-[#3b3b3b]";

const errorClass = "mt-1.5 pl-[clamp(6px,1.25vw,24px)] font-body text-[clamp(12px,0.73vw,14px)] text-[#ec1c24]";

function UploadGlyph() {
  return (
    <svg viewBox="0 0 20 22" aria-hidden="true" className="h-[62%] w-[62%] fill-none stroke-[#1c1c1c] stroke-[1.6]" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 14.5V1.5" />
      <path d="M4.5 7 10 1.5 15.5 7" />
      <path d="M1.5 15.5v3a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function ChevronGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full fill-none stroke-[#1c1c1c] stroke-[2.2]" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9l7 7 7-7" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[52%] w-[52%] fill-none stroke-[#1c1c1c] stroke-[2.4]" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5l5.5 5.5L20 7" />
    </svg>
  );
}

function Field({
  name,
  children,
  error,
}: {
  name: EnrollFieldName;
  children: ReactNode;
  error?: string;
}) {
  const meta = enrollFields[name];
  return (
    <div className="flex min-w-0 flex-col">
      <label htmlFor={`enroll-${name}`} className={labelClass}>
        {meta.label}
        {meta.required ? <span aria-hidden="true">*</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`enroll-${name}-error`} role="alert" className={errorClass}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function EnrollForm() {
  const [values, setValues] = useState<Values>(INITIAL_VALUES);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Re-validate a field that is already showing an error, so the message
    // disappears as soon as it is fixed.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function onFileChange(next: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    if (!next) {
      setFile(null);
      setPreview("");
      return;
    }
    const check = validateScreenshot(next);
    if (!check.ok) {
      setFile(null);
      setPreview("");
      setErrors((prev) => ({ ...prev, screenshot: check.error }));
      return;
    }
    setFile(next);
    setPreview(next.type.startsWith("image/") ? URL.createObjectURL(next) : "");
    setErrors((prev) => ({ ...prev, screenshot: undefined }));
  }

  async function copyNumber() {
    const number = siteConfig.paymentNumber;
    try {
      await navigator.clipboard.writeText(number);
    } catch {
      // Clipboard API needs a secure context (https) — the LAN preview is http,
      // so fall back to the old execCommand route.
      const area = document.createElement("textarea");
      area.value = number;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore — the number stays visible in the card anyway */
      }
      document.body.removeChild(area);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function focusFirstError(nextErrors: Errors) {
    const first = Object.keys(nextErrors).find((key) => nextErrors[key as keyof Errors]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`#enroll-${first}`);
    el?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = enrollmentSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Values | undefined;
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      focusFirstError(nextErrors);
      return;
    }

    if (file) {
      const check = validateScreenshot(file);
      if (!check.ok) {
        setErrors({ screenshot: check.error });
        return;
      }
    }

    setErrors({});
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("fullName", parsed.data.fullName);
      body.append("profession", parsed.data.profession);
      body.append("phone", parsed.data.phone);
      body.append("address", parsed.data.address);
      body.append("paymentMethod", parsed.data.paymentMethod);
      body.append("transactionId", parsed.data.transactionId);
      if (file) body.append("screenshot", file);

      const response = await fetch("/api/enroll", { method: "POST", body });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; field?: string | null }
        | null;

      if (!response.ok || !data?.ok) {
        const message = data?.error ?? "Something went wrong. Please try again in a moment.";
        if (data?.field === "screenshot") {
          setErrors((prev) => ({ ...prev, screenshot: message }));
        } else if (data?.field && data.field in INITIAL_VALUES) {
          setErrors({ [data.field]: message } as Errors);
          focusFirstError({ [data.field]: message } as Errors);
        } else {
          setFormError(message);
        }
        return;
      }

      setDone(true);
    } catch {
      setFormError("We couldn't reach the server — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[928px] rounded-[clamp(24px,2.08vw,40px)] bg-panel px-[clamp(20px,5.21vw,100px)] pt-[clamp(32px,2.6vw,50px)] pb-[clamp(40px,4.17vw,80px)]">
      <Image
        src="/images/form-logo.png"
        alt="Level Up English Course"
        width={1360}
        height={1360}
        sizes="(min-width: 1920px) 107px, 6vw"
        className="mx-auto h-auto w-[clamp(64px,5.57vw,107px)]"
      />

      {done ? (
        <div className="mt-[clamp(28px,3.72vw,71px)] flex flex-col items-center text-center">
          <span className="grid size-[clamp(44px,2.81vw,54px)] place-items-center rounded-full bg-gold">
            <CheckGlyph />
          </span>
          <h3 className="mt-[clamp(14px,1.35vw,26px)] font-display course-display text-[#1c1c1c] uppercase">
            Enrollment received
          </h3>
          <p className="mt-[clamp(10px,1.04vw,20px)] max-w-[520px] font-body text-[clamp(14px,1.04vw,20px)] leading-[1.5] text-[#3b3b3b]">
            Thanks! We&apos;ll review your info and add you to the community soon. 🎉 All our classes run on{" "}
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8998e9] underline-offset-2 hover:underline"
            >
              Discord
            </a>
            .
          </p>
        </div>
      ) : (
        <form
          ref={formRef}
          noValidate
          onSubmit={onSubmit}
          className="mt-[clamp(18px,2.66vw,51px)] flex flex-col"
        >
          <div className="flex flex-col gap-y-[clamp(14px,1.35vw,26px)]">
          {/* Full Name */}
          <Field name="fullName" error={errors.fullName}>
            <input
              id="enroll-fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              placeholder={enrollFields.fullName.placeholder}
              value={values.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              aria-invalid={errors.fullName ? true : undefined}
              aria-describedby={errors.fullName ? "enroll-fullName-error" : undefined}
              className={inputClass}
            />
          </Field>

          {/* Profession | Phone */}
          <div className="grid gap-x-[clamp(12px,1.3vw,25px)] gap-y-[clamp(14px,1.72vw,33px)] md:grid-cols-2">
            <Field name="profession" error={errors.profession}>
              <input
                id="enroll-profession"
                name="profession"
                type="text"
                placeholder={enrollFields.profession.placeholder}
                value={values.profession}
                onChange={(e) => update("profession", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field name="phone" error={errors.phone}>
              <input
                id="enroll-phone"
                name="phone"
                type="tel"
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder={enrollFields.phone.placeholder}
                value={values.phone}
                onChange={(e) => update("phone", e.target.value)}
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={errors.phone ? "enroll-phone-error" : undefined}
                className={inputClass}
              />
            </Field>
          </div>

          {/* Present Address | Payment Method */}
          <div className="grid gap-x-[clamp(12px,1.3vw,25px)] gap-y-[clamp(14px,1.72vw,33px)] md:grid-cols-2">
            <Field name="address" error={errors.address}>
              <input
                id="enroll-address"
                name="address"
                type="text"
                autoComplete="street-address"
                placeholder={enrollFields.address.placeholder}
                value={values.address}
                onChange={(e) => update("address", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field name="paymentMethod" error={errors.paymentMethod}>
              <div className="relative">
                <select
                  id="enroll-paymentMethod"
                  name="paymentMethod"
                  required
                  value={values.paymentMethod}
                  onChange={(e) => update("paymentMethod", e.target.value as Values["paymentMethod"])}
                  className={`${inputClass} appearance-none pr-[clamp(38px,3.64vw,70px)]`}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute top-1/2 right-[clamp(14px,1.82vw,35px)] size-[clamp(14px,1.04vw,20px)] -translate-y-1/2">
                  <ChevronGlyph />
                </span>
              </div>
            </Field>
          </div>

          {/* Transaction ID | Attach Screenshot */}
          <div className="grid gap-x-[clamp(12px,1.3vw,25px)] gap-y-[clamp(14px,1.72vw,33px)] md:grid-cols-2">
            <Field name="transactionId" error={errors.transactionId}>
              <input
                id="enroll-transactionId"
                name="transactionId"
                type="text"
                required
                placeholder={enrollFields.transactionId.placeholder}
                value={values.transactionId}
                onChange={(e) => update("transactionId", e.target.value)}
                aria-invalid={errors.transactionId ? true : undefined}
                aria-describedby={errors.transactionId ? "enroll-transactionId-error" : undefined}
                className={inputClass}
              />
            </Field>
            <Field name="screenshot" error={errors.screenshot}>
              <label
                htmlFor="enroll-screenshot"
                className="relative flex h-[clamp(44px,3.07vw,59px)] w-full cursor-pointer items-center rounded-full bg-white pr-[clamp(38px,3.64vw,70px)] pl-[clamp(14px,2.03vw,39px)] focus-within:ring-2 focus-within:ring-gold-deep/70"
              >
                <input
                  id="enroll-screenshot"
                  name="screenshot"
                  type="file"
                  accept={SCREENSHOT_ACCEPT}
                  className="sr-only"
                  onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                />
                <span className="truncate font-body text-[clamp(15px,1.25vw,24px)] leading-none text-[#1c1c1c]">
                  {file ? file.name : "Upload Image"}
                </span>
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Selected screenshot preview"
                    className="absolute top-1/2 right-[clamp(8px,0.52vw,10px)] h-[calc(100%-12px)] -translate-y-1/2 rounded-full object-cover"
                  />
                ) : (
                  <span className="absolute top-1/2 right-[clamp(14px,1.82vw,35px)] size-[clamp(16px,1.14vw,22px)] -translate-y-1/2">
                    <UploadGlyph />
                  </span>
                )}
              </label>
            </Field>
          </div>

          </div>

          {/* Fee + payment info */}
          <div className="mt-[clamp(0px,1.4vw,27px)] grid gap-y-[clamp(16px,1.72vw,33px)] md:grid-cols-2 md:gap-x-[clamp(12px,1.3vw,25px)]">
            <div className="pl-[clamp(0px,2.03vw,39px)]">
              <p className="font-body text-[clamp(13px,0.94vw,18px)] leading-none text-[#3b3b3b]">
                Course Fee:{" "}
                <span className="text-[#ec1c24] line-through">5,000/month</span>
              </p>
              <p className="mt-[clamp(4px,0.55vw,10px)] font-body text-[clamp(18px,1.41vw,27px)] leading-none font-medium text-[#1c1c1c]">
                BDT 2,900/month
              </p>
            </div>
            <div className="pl-[clamp(0px,2.03vw,39px)]">
              <p className="font-body text-[clamp(13px,0.94vw,18px)] leading-none text-[#3b3b3b]">
                Personal <span className="text-[#e2136e]">bKash</span>
                <span className="text-[#3b3b3b]">/</span>
                <span className="text-[#ec1c24]">Nagad</span>
              </p>
              <p className="mt-[clamp(4px,0.55vw,10px)] flex items-center gap-[clamp(8px,0.78vw,15px)]">
                <span className="font-body text-[clamp(18px,1.41vw,27px)] leading-none font-medium text-[#1c1c1c]">
                  {siteConfig.paymentNumber}
                </span>
                <span className="relative">
                  <button
                    type="button"
                    onClick={copyNumber}
                    aria-label={`Copy the payment number ${siteConfig.paymentNumber}`}
                    className="grid size-[clamp(24px,1.56vw,30px)] place-items-center rounded-full transition-transform duration-150 hover:scale-110 focus-visible:ring-2 focus-visible:ring-gold-deep/70 focus-visible:outline-none"
                  >
                    <Image src="/icons/copy.png" alt="" width={512} height={512} className="h-full w-full object-contain" />
                  </button>
                  {copied ? (
                    <span
                      role="status"
                      className="absolute bottom-[130%] left-1/2 -translate-x-1/2 rounded-full bg-[#1c1c1c] px-2.5 py-1 font-body text-[12px] leading-none whitespace-nowrap text-white"
                    >
                      Copied!
                    </span>
                  ) : null}
                </span>
              </p>
            </div>
          </div>

          {formError ? (
            <p role="alert" className="font-body text-[clamp(13px,0.83vw,16px)] text-[#ec1c24]">
              {formError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-[clamp(18px,2.29vw,44px)] flex h-[clamp(48px,3.07vw,59px)] w-full items-center justify-center gap-2.5 rounded-full bg-gold font-body text-[clamp(16px,1.35vw,26px)] leading-none font-semibold text-[#1c1c1c] transition-colors duration-200 hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-[1em] animate-spin rounded-full border-2 border-[#1c1c1c]/25 border-t-[#1c1c1c]"
                />
                Confirming…
              </>
            ) : (
              "Confirm Enrollment"
            )}
          </button>
        </form>
      )}

      <p className="mx-auto mt-[clamp(16px,1.3vw,25px)] max-w-[clamp(320px,26vw,500px)] text-center font-body text-[clamp(13px,0.83vw,16px)] leading-[1.55] text-[#908d93]">
        We&apos;ll review your info and add you to the community. 🎉 All our classes are held on{" "}
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8998e9] underline-offset-2 hover:underline"
        >
          Discord
        </a>
        . Don&apos;t have an account yet? Create one now to speed things up! 🚀
      </p>
    </div>
  );
}
