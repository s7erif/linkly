"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import styles from "./create-card-flow.module.css";
import type { PlanDTO, BillingIntervalDTO } from "@/dto/subscription.dto";
import { checkRegistrationEmail, submitCardOrder } from "./actions";

type Details = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  company: string;
  planId: string;
  billingInterval: BillingIntervalDTO;
  paymentMethod: "INSTAPAY" | "MOBILE_WALLET";
  senderName: string;
  senderPhone: string;
  referenceNumber: string;
  proof: string;
};

const planPrice = (minor: number | null, currency: string) =>
  minor == null ? null : new Intl.NumberFormat("en", { style: "currency", currency }).format(minor / 100);

const featureLabel = (key: string) =>
  key.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;

export function CreateCardFlow({ plans, currency }: { plans: readonly PlanDTO[]; currency: string }) {
  const initial: Details = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    company: "",
    planId: plans[0]?.id ?? "",
    billingInterval: "MONTHLY",
    paymentMethod: "INSTAPAY",
    senderName: "",
    senderPhone: "",
    referenceNumber: "",
    proof: "",
  };

  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<Details>(initial);
  const [result, setResult] = useState<{ orderNumber: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [pending, startTransition] = useTransition();
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "taken" | "ok">("idle");
  const [emailMessage, setEmailMessage] = useState("");

  useEffect(() => {
    const email = details.email.trim();
    const handle = setTimeout(() => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailStatus("idle"); setEmailMessage(""); return; }
      setEmailStatus("checking");
      checkRegistrationEmail(email)
        .then((result) => {
          if (result.available) { setEmailStatus("ok"); setEmailMessage(""); }
          else { setEmailStatus("taken"); setEmailMessage(result.message ?? "This email is not available."); }
        })
        .catch(() => { setEmailStatus("idle"); setEmailMessage(""); });
    }, 350);
    return () => clearTimeout(handle);
  }, [details.email]);

  const patch = <K extends keyof Details>(key: K, value: Details[K]) =>
    setDetails((current) => ({ ...current, [key]: value }));

  const selectedPlan = plans.find((p) => p.id === details.planId) ?? null;
  const amount =
    details.billingInterval === "YEARLY"
      ? selectedPlan?.yearlyMinor ?? selectedPlan?.monthlyMinor ?? 0
      : selectedPlan?.monthlyMinor ?? 0;

  const uploadProof = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Upload failed");
      patch("proof", data.mediaAssetId);
      setUploadedUrl(data.publicUrl || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      patch("proof", "");
    } finally {
      setUploading(false);
    }
  };

  function next(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (step === 1) {
      if (!details.firstName.trim() || !details.lastName.trim()) return setError("Enter your full name.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) return setError("Enter a valid email address.");
      if (emailStatus === "taken") return setError(emailMessage || "This email is not available.");
      if (emailStatus === "checking") return setError("Checking email availability…");
      if (!PASSWORD_RULES.test(details.password)) return setError("Password needs 8+ characters with upper, lower and a number.");
      if (details.password !== details.confirmPassword) return setError("Passwords do not match.");
      if (!details.phone.trim()) return setError("Enter your phone number.");
    }

    if (step === 2 && !details.planId) return setError("Choose a subscription plan.");

    if (step === 3) {
      const missing: string[] = [];
      if (!details.senderName.trim()) missing.push("sender name");
      if (!details.senderPhone.trim()) missing.push("sender phone");
      if (!details.referenceNumber.trim()) missing.push("reference number");
      if (!details.proof.trim()) missing.push(uploading ? "upload completion" : "payment proof");
      if (missing.length) return setError(`Complete: ${missing.join(", ")}.`);
    }

    setStep((value) => Math.min(4, value + 1));
  }

  function submit() {
    setError(null);
    if (!details.planId) return setError("Choose a subscription plan before submitting.");
    startTransition(async () => {
      const response = await submitCardOrder({
        firstName: details.firstName,
        lastName: details.lastName,
        email: details.email,
        phone: details.phone,
        company: details.company || undefined,
        password: details.password,
        package: "DIGITAL",
        quantity: 1,
        planId: details.planId,
        billingInterval: details.billingInterval,
        paymentMethod: details.paymentMethod,
        senderName: details.senderName,
        senderPhone: details.senderPhone,
        referenceNumber: details.referenceNumber,
        paymentProofAssetId: details.proof,
        amount,
        currency,
      });
      if (response.ok) setResult({ orderNumber: response.order.orderNumber });
      else setError(response.message);
    });
  }

  if (result) {
    return (
      <div className={styles.glassContainer}>
        <section className={styles.orderCard}>
          <p className={styles.kicker}>Application received</p>
          <h2>Your profile is pending admin approval.</h2>
          <p>
            Your request <strong>{result.orderNumber}</strong> was received. Once approved, you can sign
            in to your Workspace and manage your digital identity.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.glassContainer}>
      <div className={styles.orderFlow}>
        {["Create your profile", "Choose your card", "Activate your card", "Review & Launch"].map((label, index) => (
          <span key={label} className={step === index + 1 ? styles.flowActive : ""}>
            <span className={styles.stepNum}>{index + 1}</span>
            <span className={styles.stepLabel}>{label}</span>
          </span>
        ))}
      </div>
      <form className={styles.orderCard} onSubmit={next}>
        {step === 1 && (
          <div className={styles.orderGrid}>
            <label>
              First name
              <input value={details.firstName} onChange={(e) => patch("firstName", e.target.value)} required minLength={1} />
            </label>
            <label>
              Last name
              <input value={details.lastName} onChange={(e) => patch("lastName", e.target.value)} required minLength={1} />
            </label>
            <label className={styles.spanTwo}>
              Email
              <input type="email" value={details.email} onChange={(e) => patch("email", e.target.value)} required />
              {emailStatus === "checking" && <span className={styles.fieldHint}>Checking availability…</span>}
              {emailStatus === "taken" && <span className={styles.fieldHint} style={{ color: "#b42318" }}>{emailMessage}</span>}
              {emailStatus === "ok" && <span className={styles.fieldHint} style={{ color: "#29804b" }}>This email is available.</span>}
            </label>
            <label>
              Password
              <input
                type="password"
                value={details.password}
                onChange={(e) => patch("password", e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <span className={styles.fieldHint}>Use uppercase, lowercase and a number (8+ characters).</span>
            </label>
            <label>
              Confirm password
              <input
                type="password"
                value={details.confirmPassword}
                onChange={(e) => patch("confirmPassword", e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>
            <label>
              Phone
              <input value={details.phone} onChange={(e) => patch("phone", e.target.value)} required />
            </label>
            <label>
              Company
              <input value={details.company} onChange={(e) => patch("company", e.target.value)} />
            </label>
          </div>
        )}

        {step === 2 && (
          <>
            <div className={styles.planGrid}>
              {plans.map((plan) => {
                const monthly = planPrice(plan.monthlyMinor, currency);
                const yearly = planPrice(plan.yearlyMinor, currency);
                return (
                  <button
                    type="button"
                    key={plan.id}
                    className={styles.planCard}
                    data-popular={plan.popular || undefined}
                    onClick={() => patch("planId", plan.id)}
                    aria-pressed={details.planId === plan.id}
                  >
                    {plan.badge ? <span className={styles.planBadge}>{plan.badge}</span> : plan.popular ? <span className={styles.planBadge}>Popular</span> : null}
                    <p className={styles.kicker}>{currency}</p>
                    <h3>{plan.name || "Untitled plan"}</h3>
                    <p>{plan.description || "Plan details will be available soon."}</p>
                    <div className={styles.planPrices}>
                      <strong>{monthly ? monthly + " / month" : "Monthly pricing unavailable"}</strong>
                      {yearly ? <span>{yearly} / year</span> : null}
                    </div>
                    {plan.features.some((feature) => feature.enabled) ? (
                      <ul>
                        {plan.features
                          .filter((feature) => feature.enabled)
                          .map((feature) => (
                            <li key={feature.key}>{featureLabel(feature.key)}</li>
                          ))}
                      </ul>
                    ) : (
                      <small>Features will be announced soon.</small>
                    )}
                  </button>
                );
              })}
            </div>
            <label>
              Billing interval
              <select value={details.billingInterval} onChange={(e) => patch("billingInterval", e.target.value as BillingIntervalDTO)}>
                <option value="MONTHLY">Monthly</option>
                {selectedPlan?.yearlyMinor != null ? <option value="YEARLY">Yearly</option> : null}
              </select>
            </label>
          </>
        )}

        {step === 3 && (
          <div>
            <div className={styles.paymentOptions}>
              <button
                type="button"
                className={`${styles.paymentCard} ${styles.paymentCardSelected}`}
                onClick={() => patch("paymentMethod", "INSTAPAY")}
                aria-pressed
              >
                <span className={styles.paymentCardHead}>
                  <span className={styles.paymentCardTitle}>Manual bank transfer</span>
                  <span className={styles.comingSoon}>Required</span>
                </span>
                <select
                  value={details.paymentMethod}
                  onChange={(e) => patch("paymentMethod", e.target.value as "INSTAPAY" | "MOBILE_WALLET")}
                  style={{ marginTop: "0.5rem" }}
                >
                  <option value="INSTAPAY">Instapay</option>
                  <option value="MOBILE_WALLET">Mobile Wallet</option>
                </select>
              </button>

              <div className={`${styles.paymentCard} ${styles.paymentCardDisabled}`} aria-disabled="true">
                <span className={styles.paymentCardHead}>
                  <span className={styles.paymentCardTitle}>Card payment</span>
                  <span className={styles.comingSoon}>Coming soon</span>
                </span>
                <span className={styles.cardBrands}>Visa · Mastercard</span>
              </div>
            </div>

            <div className={styles.orderGrid} style={{ marginTop: "1rem" }}>
              <label>
                Sender name
                <input value={details.senderName} onChange={(e) => patch("senderName", e.target.value)} />
              </label>
              <label>
                Sender phone
                <input value={details.senderPhone} onChange={(e) => patch("senderPhone", e.target.value)} />
              </label>
              <label className={styles.spanTwo}>
                Reference number
                <input value={details.referenceNumber} onChange={(e) => patch("referenceNumber", e.target.value)} />
              </label>
              <label className={styles.spanTwo}>
                Payment receipt
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadProof(file);
                  }}
                />
              </label>
              {uploadedUrl ? (
                <p className={`${styles.fieldHint} ${styles.spanTwo}`}>
                  Uploaded: <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">View receipt</a>
                </p>
              ) : null}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className={styles.kicker}>Review your profile</p>
            <h3>{selectedPlan?.name ?? "Plan"}</h3>
            <p>
              {details.firstName} {details.lastName} · {details.email} · {details.billingInterval.toLowerCase()}
            </p>
          </div>
        )}

        {error ? <p className={`${styles.formError} ${styles.spanTwo}`} role="alert">{error}</p> : null}

        <div className={styles.orderActions}>
          {step > 1 ? (
            <button type="button" className={styles.secondaryCta} onClick={() => setStep((v) => v - 1)} disabled={pending || uploading}>
              Back
            </button>
          ) : null}
          {step < 4 ? (
            <button type="submit" className={styles.primaryCta} disabled={uploading || (step === 2 && !details.planId)}>
              {uploading ? "Uploading…" : "Continue →"}
            </button>
          ) : (
            <button type="button" className={styles.primaryCta} onClick={submit} disabled={pending}>
              {pending ? "Submitting…" : "Launch your card"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
