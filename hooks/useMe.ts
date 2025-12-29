import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api/user";
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}