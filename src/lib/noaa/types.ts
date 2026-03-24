import { z } from "zod/v4";

// Planetary K-Index (1-minute resolution)
export const KpReadingSchema = z.object({
  time_tag: z.string(),
  kp_index: z.number(),
  estimated_kp: z.number(),
  kp: z.string(),
});
export type KpReading = z.infer<typeof KpReadingSchema>;

// 45-Day Forecast (endpoint returns an object with a `data` array)
export const ForecastDataEntrySchema = z.object({
  time: z.string(),
  metric: z.string(), // "ap" | "f107"
  value: z.number(),
});
export type ForecastDataEntry = z.infer<typeof ForecastDataEntrySchema>;

export const ForecastResponseSchema = z.object({
  data: z.array(ForecastDataEntrySchema),
}).passthrough();
export type ForecastResponse = z.infer<typeof ForecastResponseSchema>;

// Solar Probabilities
export const SolarProbabilitySchema = z.object({
  date: z.string(),
  c_class_1_day: z.number().optional(),
  c_class_2_day: z.number().optional(),
  c_class_3_day: z.number().optional(),
  m_class_1_day: z.number().optional(),
  m_class_2_day: z.number().optional(),
  m_class_3_day: z.number().optional(),
  x_class_1_day: z.number().optional(),
  x_class_2_day: z.number().optional(),
  x_class_3_day: z.number().optional(),
}).passthrough();
export type SolarProbability = z.infer<typeof SolarProbabilitySchema>;

// Enlil Solar Wind Time Series
export const EnlilReadingSchema = z.object({
  time_tag: z.string(),
  earth_particles_per_cm3: z.number().nullable().optional(),
  temperature: z.number().nullable().optional(),
  v_r: z.number().nullable().optional(),
  v_theta: z.number().nullable().optional(),
  v_phi: z.number().nullable().optional(),
  b_r: z.number().nullable().optional(),
  b_theta: z.number().nullable().optional(),
  b_phi: z.number().nullable().optional(),
  polarity: z.number().nullable().optional(),
  cloud: z.number().nullable().optional(),
}).passthrough();
export type EnlilReading = z.infer<typeof EnlilReadingSchema>;

// Aurora Ovation
export const AuroraDataSchema = z.object({
  "Observation Time": z.string(),
  "Forecast Time": z.string(),
  coordinates: z.array(z.tuple([z.number(), z.number(), z.number()])),
});
export type AuroraData = z.infer<typeof AuroraDataSchema>;

// Solar Radio Flux
export const RadioFluxDetailSchema = z.object({
  frequency: z.number(),
  flux: z.number().nullable(),
  observed_quality: z.string().nullable().optional(),
}).passthrough();

export const RadioFluxReadingSchema = z.object({
  time_tag: z.string(),
  common_name: z.string().optional(),
  details: z.array(RadioFluxDetailSchema).optional(),
}).passthrough();
export type RadioFluxReading = z.infer<typeof RadioFluxReadingSchema>;
