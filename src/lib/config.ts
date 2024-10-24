const pe = process.env;

export const appConfig = {
  ewelink: {
    appId: pe.EWELINK_APP_ID || "",
    appSecret: pe.EWELINK_APP_SECRET || "",
    redirectUrl: pe.EWELINK_REDIRECT_URL || "",
    waterPumpName: pe.EWELINK_WATER_PUMP_NAME || "",
  },
  waterTorrent: {
    triggerValue: parseInt(pe.WATER_TORRENT_TRIGER_VALUE || "25"),
    triggerDuration: parseInt(pe.WATER_TORRENT_TRIGGER_DURATION || "300"),
  },
};
