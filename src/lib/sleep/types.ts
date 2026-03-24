import { z } from "zod/v4";

export const SleepReportSchema = z.object({
  sleepHours: z.number().min(0).max(18),
  sleepQuality: z.number().int().min(1).max(10),
  region: z.string().optional(),
  fingerprint: z.string().min(1),
  // Honeypot field — should be empty if submitted by a human
  website: z.string().optional(),
});

export type SleepReport = z.infer<typeof SleepReportSchema>;
