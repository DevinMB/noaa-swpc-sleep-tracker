import useSWR from "swr";
import type { CorrelationResult } from "@/lib/sleep/correlate";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCorrelation() {
  const { data, error, isLoading } = useSWR<CorrelationResult>(
    "/api/correlations",
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000,
      revalidateOnFocus: false,
    }
  );

  return { data, error, isLoading };
}
