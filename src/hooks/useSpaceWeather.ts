import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface KpRecord {
  id: number;
  timeTag: string;
  kpIndex: number;
  estimatedKp: number | null;
  createdAt: string;
}

export interface ForecastRecord {
  id: number;
  timeTag: string;
  metric: string;
  value: number;
  fetchedAt: string;
}

export interface SpaceWeatherData {
  kp: KpRecord[];
  forecast: ForecastRecord[];
  flareProb: Record<string, unknown>[] | null;
  enlil: Record<string, unknown>[] | null;
  aurora: {
    "Observation Time": string;
    "Forecast Time": string;
    coordinates: [number, number, number][];
  } | null;
  radioFlux: Record<string, unknown>[] | null;
}

export function useSpaceWeather() {
  const { data, error, isLoading, mutate } = useSWR<SpaceWeatherData>(
    "/api/space-weather",
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useKpIndex() {
  const { data, error, isLoading } = useSWR<KpRecord[]>(
    "/api/space-weather?type=kp",
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000,
      revalidateOnFocus: false,
    }
  );

  return { kpData: data, error, isLoading };
}
