import { apiWrapper } from "~/lib/apiWrapper";
import { defaultEwelinkInstance } from "~/lib/ewelink";
import { homeSensorService } from "~/lib/homeSensorService";
import { GetEwelinkStatusResponse } from "~/types/responses";

export default apiWrapper<GetEwelinkStatusResponse>(async function () {
  const isAuthenticated = await defaultEwelinkInstance.isAuthenticated();
  const homeSensorData = await homeSensorService.getSensorData();
  const waterTorrentData = homeSensorData.waterTorrent;

  const waterPumpData = isAuthenticated
    ? await defaultEwelinkInstance.getWaterPumpState()
    : undefined;
  const isWaterPumpManaged = defaultEwelinkInstance.isWaterPumpManaged;
  return {
    isAuthenticated,
    waterTorrent: waterTorrentData,
    waterPump: {
      isOn: waterPumpData?.isOn,
      isManaged: isWaterPumpManaged,
      history: defaultEwelinkInstance.history,
    },
  };
});
