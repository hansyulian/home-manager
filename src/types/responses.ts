export type WaterTorrentData = {
  type: "waterTorrent";
  lastTimestamp: string;
  detected: boolean;
  value: number;
};

export type HomeSensorResponse = {
  waterTorrent: WaterTorrentData;
};

export type GetEwelinkStatusResponse = {
  isAuthenticated: boolean;
  waterTorrent: WaterTorrentData;
  waterPump: WaterPumpData;
};

export type WaterPumpData = {
  isOn?: boolean;
  isManaged: boolean;
};

export type EwelinkSwitchData = {
  // just use anything useful for now
  name: string;
  deviceid: string;
  params: {
    switch: "off" | "on";
  };
};
