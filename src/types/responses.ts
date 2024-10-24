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
};
