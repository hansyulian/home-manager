import { apiWrapper } from "~/lib/apiWrapper";
import { defaultEwelinkInstance } from "~/lib/ewelink";
import { homeSensorService } from "~/lib/homeSensorService";
import { GetEwelinkStatusResponse } from "~/types/responses";

export default apiWrapper<GetEwelinkStatusResponse>(async function () {
  const homeSensorData = await homeSensorService.getSensorData();
  const waterPumpData = await defaultEwelinkInstance.getWaterPumpState();
  const waterTorrentData = homeSensorData.waterTorrent;
  const isAuthenticated = await defaultEwelinkInstance.isAuthenticated();
  const isWaterPumpManaged = defaultEwelinkInstance.isWaterPumpManaged;
  return {
    isAuthenticated,
    waterTorrent: waterTorrentData,
    waterPump: {
      isOn: waterPumpData.isOn,
      isManaged: isWaterPumpManaged,
    },
  };
});
