"use client";

import { useState, useEffect } from "react";
import { generateFingerprint } from "@/lib/utils/fingerprint";

interface SleepReportFormProps {
  onSuccess?: () => void;
}

const qualityOptions = [
  { value: 1, label: "Terrible", emoji: "😵" },
  { value: 2, label: "Very Poor", emoji: "😫" },
  { value: 3, label: "Poor", emoji: "😣" },
  { value: 4, label: "Below Avg", emoji: "😕" },
  { value: 5, label: "Average", emoji: "😐" },
  { value: 6, label: "Above Avg", emoji: "🙂" },
  { value: 7, label: "Good", emoji: "😊" },
  { value: 8, label: "Very Good", emoji: "😄" },
  { value: 9, label: "Excellent", emoji: "🤩" },
  { value: 10, label: "Perfect", emoji: "😴" },
];

const regions = [
  { value: "", label: "Prefer not to say" },
  { value: "north-america", label: "North America" },
  { value: "south-america", label: "South America" },
  { value: "europe", label: "Europe" },
  { value: "africa", label: "Africa" },
  { value: "asia", label: "Asia" },
  { value: "oceania", label: "Oceania" },
  { value: "arctic", label: "Arctic / High Latitude" },
];

export function SleepReportForm({ onSuccess }: SleepReportFormProps) {
  const [step, setStep] = useState(1);
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error" | "duplicate"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fingerprint, setFingerprint] = useState("");

  useEffect(() => {
    generateFingerprint().then(setFingerprint);
  }, []);

  const handleSubmit = async () => {
    setStatus("submitting");
    setErrorMsg("");

    try {
      const response = await fetch("/api/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sleepHours,
          sleepQuality,
          region: region || undefined,
          fingerprint,
          website:
            (document.getElementById("website-hp") as HTMLInputElement)
              ?.value || "",
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        setStatus("duplicate");
        setErrorMsg(data.error);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit");
      }

      setStatus("success");
      onSuccess?.();
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <div className="text-4xl">&#10024;</div>
        <p className="font-display text-lg font-semibold text-cosmic-200">
          Thanks for your report!
        </p>
        <p className="text-sm text-cosmic-300/60">
          Come back tomorrow to report again.
        </p>
      </div>
    );
  }

  if (status === "duplicate") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <div className="text-4xl">&#127769;</div>
        <p className="font-display text-lg font-semibold text-cosmic-200">
          Already reported today
        </p>
        <p className="text-sm text-cosmic-300/60">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[280px]">
      {/* Progress dots */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => {
              if (s < step) setStep(s);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              s === step
                ? "w-6 bg-cosmic-500"
                : s < step
                  ? "w-2 cursor-pointer bg-cosmic-400"
                  : "w-2 bg-cosmic-800/50"
            }`}
          />
        ))}
      </div>

      {/* Honeypot */}
      <input
        type="text"
        id="website-hp"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", opacity: 0 }}
        aria-hidden="true"
      />

      {/* Step 1: Hours */}
      {step === 1 && (
        <div className="flex flex-col items-center gap-6">
          <p className="font-display text-base font-medium text-cosmic-200">
            How many hours did you sleep?
          </p>

          <div className="font-mono text-5xl font-bold text-cosmic-100">
            {sleepHours}
            <span className="text-2xl text-cosmic-300/60">h</span>
          </div>

          <input
            type="range"
            min={0}
            max={18}
            step={0.5}
            value={sleepHours}
            onChange={(e) => setSleepHours(parseFloat(e.target.value))}
            className="w-full accent-cosmic-500"
          />
          <div className="flex w-full justify-between text-xs text-cosmic-300/40">
            <span>0h</span>
            <span>9h</span>
            <span>18h</span>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full rounded-lg bg-cosmic-500 px-4 py-2.5 font-display text-sm font-semibold text-white transition-all hover:bg-cosmic-600 glow"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Quality */}
      {step === 2 && (
        <div className="flex flex-col items-center gap-4">
          <p className="font-display text-base font-medium text-cosmic-200">
            How well did you sleep?
          </p>

          <div className="grid w-full grid-cols-2 gap-2">
            {qualityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setSleepQuality(opt.value);
                  setStep(3);
                }}
                className={`group flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-all hover:border-cosmic-500 hover:bg-cosmic-500/10 ${
                  sleepQuality === opt.value
                    ? "border-cosmic-500 bg-cosmic-500/15 text-cosmic-100"
                    : "border-cosmic-800/30 bg-surface-dark/50 text-cosmic-300"
                }`}
              >
                <span className="text-lg">{opt.emoji}</span>
                <span className="font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Region + Submit */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <p className="text-center font-display text-base font-medium text-cosmic-200">
            What region are you in?
          </p>

          <div className="grid grid-cols-2 gap-2">
            {regions.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRegion(r.value)}
                className={`rounded-lg border px-3 py-2 text-sm transition-all hover:border-cosmic-500 hover:bg-cosmic-500/10 ${
                  region === r.value
                    ? "border-cosmic-500 bg-cosmic-500/15 text-cosmic-100"
                    : "border-cosmic-800/30 bg-surface-dark/50 text-cosmic-300"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="flex items-center justify-center gap-4 rounded-lg bg-surface-dark/50 px-4 py-3 text-sm text-cosmic-300">
            <span>
              <span className="font-bold text-cosmic-200">{sleepHours}h</span>{" "}
              sleep
            </span>
            <span className="text-cosmic-800">|</span>
            <span>
              {sleepQuality !== null && (
                <>
                  <span className="font-bold text-cosmic-200">
                    {qualityOptions[sleepQuality - 1]?.emoji}{" "}
                    {qualityOptions[sleepQuality - 1]?.label}
                  </span>
                </>
              )}
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={status === "submitting" || !fingerprint}
            className="w-full rounded-lg bg-cosmic-500 px-4 py-2.5 font-display text-sm font-semibold text-white transition-all hover:bg-cosmic-600 disabled:cursor-not-allowed disabled:opacity-50 glow"
          >
            {status === "submitting" ? "Submitting..." : "Submit Sleep Report"}
          </button>

          {status === "error" && (
            <p className="text-center text-sm text-red-400">{errorMsg}</p>
          )}

          <p className="text-center text-xs text-cosmic-300/40">
            One report per day. No account needed.
          </p>
        </div>
      )}
    </div>
  );
}
