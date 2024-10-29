import { appConfig } from "~/lib/config";
import { defaultEwelinkInstance } from "~/lib/ewelink";

console.log(appConfig);
if (appConfig.waterTorrent.initialStart) {
  defaultEwelinkInstance.startWaterPumpManager();
}
