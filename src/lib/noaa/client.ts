import { z } from "zod/v4";
import {
  KpReadingSchema,
  ForecastResponseSchema,
  SolarProbabilitySchema,
  EnlilReadingSchema,
  AuroraDataSchema,
  RadioFluxReadingSchema,
  type KpReading,
  type ForecastDataEntry,
  type SolarProbability,
  type EnlilReading,
  type AuroraData,
  type RadioFluxReading,
} from "./types";

const BASE_URL = "https://services.swpc.noaa.gov/json";
const TIMEOUT_MS = 15000;

async function fetchJSON<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`NOAA API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return schema.parse(data);
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchKpIndex(): Promise<KpReading[]> {
  return fetchJSON(`${BASE_URL}/planetary_k_index_1m.json`, z.array(KpReadingSchema));
}

export async function fetchForecast(): Promise<ForecastDataEntry[]> {
  const response = await fetchJSON(`${BASE_URL}/45-day-forecast.json`, ForecastResponseSchema);
  return response.data;
}

export async function fetchSolarProbabilities(): Promise<SolarProbability[]> {
  return fetchJSON(`${BASE_URL}/solar_probabilities.json`, z.array(SolarProbabilitySchema));
}

export async function fetchSolarWind(): Promise<EnlilReading[]> {
  return fetchJSON(`${BASE_URL}/enlil_time_series.json`, z.array(EnlilReadingSchema));
}

export async function fetchAurora(): Promise<AuroraData> {
  return fetchJSON(`${BASE_URL}/ovation_aurora_latest.json`, AuroraDataSchema);
}

export async function fetchRadioFlux(): Promise<RadioFluxReading[]> {
  return fetchJSON(`${BASE_URL}/solar-radio-flux.json`, z.array(RadioFluxReadingSchema));
}
