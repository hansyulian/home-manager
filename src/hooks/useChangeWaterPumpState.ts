import { useCallback } from "react";
import { WaterPumpControlPayload } from "~/types/payload";

export function useChangeWaterPumpState() {
  return useCallback(async (data: WaterPumpControlPayload) => {
    const result = await fetch("/api/water-pump", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return result.json();
  }, []);
}
