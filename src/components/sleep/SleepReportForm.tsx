"use client";

import { useState, useEffect } from "react";
import { generateFingerprint } from "@/lib/utils/fingerprint";

interface SleepReportFormProps {
  onSuccess?: () => void;
}

export function SleepReportForm({ onSuccess }: SleepReportFormProps) {
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error" | "duplicate">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fingerprint, setFingerprint] = useState("");

  useEffect(() => {
    generateFingerprint().then(setFingerprint);
  }, []);

  const qualityLabels = [
    "", "Terrible", "Very Poor", "Poor", "Below Average",
    "Average", "Above Average", "Good", "Very Good", "Excellent", "Perfect"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          // Honeypot field — hidden from users, bots will fill it
          website: (document.getElementById("website-hp") as HTMLInputElement)?.value || "",
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
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Sleep Hours */}
      <div>
        <label className="mb-2 block text-sm font-medium text-cosmic-200">
          Hours slept last night
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={18}
            step={0.5}
            value={sleepHours}
            onChange={(e) => setSleepHours(parseFloat(e.target.value))}
            className="flex-1 accent-cosmic-500"
          />
          <span className="w-16 text-center font-mono text-lg font-bold text-cosmic-200">
            {sleepHours}h
          </span>
        </div>
      </div>

      {/* Sleep Quality */}
      <div>
        <label className="mb-2 block text-sm font-medium text-cosmic-200">
          Sleep quality: {qualityLabels[sleepQuality]}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={sleepQuality}
            onChange={(e) => setSleepQuality(parseInt(e.target.value))}
            className="flex-1 accent-cosmic-500"
          />
          <span className="w-16 text-center font-mono text-lg font-bold text-cosmic-200">
            {sleepQuality}/10
          </span>
        </div>
        <div className="mt-1 flex justify-between text-xs text-cosmic-300/40">
          <span>Terrible</span>
          <span>Perfect</span>
        </div>
      </div>

      {/* Optional Region */}
      <div>
        <label className="mb-2 block text-sm font-medium text-cosmic-200">
          Region <span className="text-cosmic-300/40">(optional)</span>
        </label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full rounded-lg border border-cosmic-800/30 bg-surface-dark px-3 py-2 text-sm text-cosmic-200 focus:border-cosmic-500 focus:outline-none focus:ring-1 focus:ring-cosmic-500"
        >
          <option value="">Prefer not to say</option>
          <option value="north-america">North America</option>
          <option value="south-america">South America</option>
          <option value="europe">Europe</option>
          <option value="africa">Africa</option>
          <option value="asia">Asia</option>
          <option value="oceania">Oceania</option>
          <option value="arctic">Arctic / High Latitude</option>
        </select>
      </div>

      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        id="website-hp"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", opacity: 0 }}
        aria-hidden="true"
      />

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "submitting" || !fingerprint}
        className="w-full rounded-lg bg-cosmic-500 px-4 py-2.5 font-display text-sm font-semibold text-white transition-all hover:bg-cosmic-600 disabled:cursor-not-allowed disabled:opacity-50 glow"
      >
        {status === "submitting" ? "Submitting..." : "Submit Sleep Report"}
      </button>

      {status === "error" && (
        <p className="text-center text-sm text-red-400">{errorMsg}</p>
      )}

      <p className="text-center text-xs text-cosmic-300/40">
        One report per day. No account needed. No personal data stored.
      </p>
    </form>
  );
}
