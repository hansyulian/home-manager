import { apiWrapper } from "~/lib/apiWrapper";
import { defaultEwelinkInstance } from "~/lib/ewelink";
import { homeSensorService } from "~/lib/homeSensorService";
import { GetEwelinkStatusResponse } from "~/types/responses";

export default apiWrapper<GetEwelinkStatusResponse>(async function () {
  const homeSensorData = await homeSensorService.getSensorData();
  const waterTorrentData = homeSensorData.waterTorrent;
  return {
    isAuthenticated: await defaultEwelinkInstance.isAuthenticated(),
    waterTorrent: waterTorrentData,
  };
});
