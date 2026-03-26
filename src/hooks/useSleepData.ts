import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface SleepLog {
  id: number;
  date: string;
  sleepHours: number;
  sleepQuality: number;
  region: string | null;
  source: string;
  submittedAt: string | null;
  createdAt: string;
}

export interface DailyAverage {
  date: string;
  avgHours: number;
  avgQuality: number;
  count: number;
}

export interface SleepDataResponse {
  logs: SleepLog[];
  dailyAverages: DailyAverage[];
}

export function useSleepData(days: number = 30) {
  const { data, error, isLoading, mutate } = useSWR<SleepDataResponse>(
    `/api/sleep?days=${days}`,
    fetcher,
    {
      refreshInterval: 60_000, // Refresh every minute
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
