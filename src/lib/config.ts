const pe = process.env;

export const appConfig = {
  cacheDirectory: pe.CACHE_DIRECTORY || "tmp",
  hans: {
    homeServerUrl: pe.HANS_HOME_SERVER_URL || "http://192.168.0.1:6973",
  },
  ewelink: {
    appId: pe.EWELINK_APP_ID || "",
    appSecret: pe.EWELINK_APP_SECRET || "",
    redirectUrl: pe.EWELINK_REDIRECT_URL || "",
    waterPumpName: pe.EWELINK_WATER_PUMP_NAME || "",
  },
  waterTorrent: {
    triggerValue: parseInt(pe.WATER_TORRENT_TRIGER_VALUE || "25"),
    triggerDuration: parseInt(pe.WATER_TORRENT_TRIGGER_DURATION || "300"),
    triggerInterval: parseInt(pe.WATER_TORRENT_TRIGGER_INTERVAL || "3600"),
    initialStart: pe.WATER_TORRENT_INITIAL_START === "true",
  },
};
console.log(appConfig);
