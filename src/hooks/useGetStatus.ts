import useSWR from "swr";
import { GetEwelinkStatusResponse } from "~/types/responses";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useGetStatus() {
  return useSWR<GetEwelinkStatusResponse>("/api/status", fetcher);
}
