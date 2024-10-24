/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
import eWeLink from "ewelink-api-next";
import dayjs from "dayjs";
import { wait } from "~/lib/utils/wait";
import { appConfig } from "~/lib/config";
import { randomString } from "~/lib/utils/randomString";

type WaterTorrentData = {
  type: "waterTorrent";
  lastTimestamp: string;
  detected: boolean;
  value: number;
};

export class Ewelink {
  private ewelinkClient = new eWeLink.WebAPI({
    appId: appConfig.ewelink.appId,
    appSecret: appConfig.ewelink.appSecret,
    region: "as",
  });
  private accessTokenExpiryTime = 0;
  private refreshTokenExpiryTime = 0;
  private intervalInstance?: NodeJS.Timeout;
  public refreshToken?: string;
  public accessToken?: string;

  constructor() {}

  getLoginUrl() {
    return this.ewelinkClient.oauth.createLoginUrl({
      redirectUrl: appConfig.ewelink.redirectUrl,
      grantType: "authorization_code",
      state: randomString(10),
    });
  }

  async handleOauthCallback(code: string, region: string) {
    const res = await this.ewelinkClient.oauth.getToken({
      region,
      code,
      redirectUrl: appConfig.ewelink.redirectUrl,
    });
    const { status, data, msg } = res;
    if (status !== 200) {
      throw new Error(msg);
    }
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.accessTokenExpiryTime = data.atExpiredTime;
    this.refreshTokenExpiryTime = data.rtExpiredTime;
    return data;
  }

  get isAuthenticated() {
    return (
      this.accessToken &&
      this.refreshToken &&
      this.accessTokenExpiryTime &&
      this.refreshTokenExpiryTime
    );
  }

  get isWaterPumpManagerRunning() {
    return !!this.intervalInstance;
  }

  startWaterPumpManager() {
    if (this.intervalInstance) {
      clearInterval(this.intervalInstance);
    }
    console.log("Starting water pump manager");
    this.handleWaterPump();
    const self = this;
    this.intervalInstance = setInterval(() => {
      try {
        self.handleWaterPump();
      } catch (err) {
        console.error(err);
      }
    }, 3600_000);
  }
  async handleWaterPump() {
    console.log(`--------- ${dayjs().format("YYYY-MM-DD HH:mm:SS")} ---------`);
    console.log("Checking water torent status");
    const waterTorrentData = await this.getWaterTorrentData();
    if (!waterTorrentData.detected) {
      console.log("Water torrent data not detected! Aborting...");
      return;
    }
    if (!this.refreshToken) {
      console.log("Missing refresh token");
    }
    if (waterTorrentData.value > appConfig.waterTorrent.triggerValue) {
      await this.ensureClientReady();
      console.log("Turning water pump on");
      await this.turnWaterPumpState(true);
      console.log(`Waiting ${appConfig.waterTorrent.triggerDuration} seconds`);
      await wait(appConfig.waterTorrent.triggerDuration * 1000);
      console.log("Turning water pump off");
      await this.turnWaterPumpState(false);
    }
  }

  async getWaterTorrentData() {
    const result = await fetch("http://home.hanyalisti.local/api/sensor");
    const data = await result.json();
    return data.waterTorrent as WaterTorrentData;
  }
  async ensureClientReady() {
    const now = new Date().getTime();
    if (now > this.accessTokenExpiryTime) {
      try {
        console.log("refreshing token");
        const refreshStatus = await this.ewelinkClient.user.refreshToken({
          rt: this.refreshToken,
        });
        if (refreshStatus.error === 0) {
          const accessToken = refreshStatus?.data?.at;
          const refreshToken = refreshStatus?.data?.rt;
          this.refreshToken = refreshStatus?.data?.rt;
          console.log("new access token", accessToken);
          console.log("new refresh token", refreshToken);
          this.accessTokenExpiryTime = now + 2592000_000;
        } else {
          console.error(refreshStatus);
          clearInterval(this.intervalInstance);
        }
      } catch (err) {
        console.error(err);
        clearInterval(this.intervalInstance);
      }
    }
  }
  async turnWaterPumpState(isOn: boolean) {
    const getAllThingsResult = await this.ewelinkClient.device.getAllThings({});
    const allThings = getAllThingsResult.data.thingList;
    const waterPump = allThings.find(
      (record: any) => record.itemData.name === appConfig.ewelink.waterPumpName
    );
    if (!waterPump) {
      console.log("Water pump not found!");
      return;
    }
    await this.ewelinkClient.device.setThingStatus({
      id: waterPump.itemData.deviceid,
      type: 1, // device
      params: {
        switch: isOn ? "on" : "off",
      },
    });
  }
}

// for simplicity, just expect the instance to be always running and no serverless
export const defaultEwelinkInstance = new Ewelink();
