import { HomeSensorResponse } from "~/types/responses";

export const homeSensorService = {
  getSensorData,
};

async function getSensorData() {
  const result = await fetch("http://home.hanyalisti.local/api/sensor");
  const data = await result.json();
  return data as HomeSensorResponse;
}
