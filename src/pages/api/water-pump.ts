import { apiActions } from "~/lib/apiActions";
import { defaultEwelinkInstance } from "~/lib/ewelink";

export default apiActions({
  async post(req) {
    const { isOn, isManaged } = req.body;
    if (isOn !== undefined) {
      await defaultEwelinkInstance.setWaterPumpState(isOn);
    }
    if (isManaged !== undefined) {
      if (isManaged) {
        await defaultEwelinkInstance.startWaterPumpManager();
      } else {
        await defaultEwelinkInstance.stopWaterPumpManager();
      }
    }
    return {
      success: true,
    };
  },
});
