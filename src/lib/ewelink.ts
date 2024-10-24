/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
import eWeLink from "ewelink-api-next";
import dayjs from "dayjs";
import { wait } from "~/lib/utils/wait";
import { appConfig } from "~/lib/config";
import { randomString } from "~/lib/utils/randomString";
import { homeSensorService } from "~/lib/homeSensorService";
import { BaseFileStore } from "~/lib/fileStore";
import { EwelinkStore } from "~/types/stores";

const ewelinkStore = new BaseFileStore<EwelinkStore>("ewelink.json");

export class Ewelink {
  private ewelinkClient = new eWeLink.WebAPI({
    appId: appConfig.ewelink.appId,
    appSecret: appConfig.ewelink.appSecret,
    region: "as",
  });
  private accessTokenExpiry = 0;
  private refreshTokenExpiry = 0;
  private intervalInstance?: NodeJS.Timeout;
  public refreshToken: string = "";
  public accessToken: string = "";

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
    const { data, msg } = res;
    if (msg) {
      throw new Error(msg);
    }
    if (!data.accessToken) {
      throw new Error("Failed");
    }
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.accessTokenExpiry = data.atExpiredTime;
    this.refreshTokenExpiry = data.rtExpiredTime;
    this.saveAuth(
      this.accessToken,
      this.refreshToken,
      this.accessTokenExpiry,
      this.refreshTokenExpiry
    );
    return data;
  }

  async saveAuth(
    accessToken: string,
    refreshToken: string,
    accessTokenExpiry: number,
    refreshTokenExpiry: number
  ) {
    ewelinkStore.write({
      accessToken,
      accessTokenExpiry,
      refreshToken,
      refreshTokenExpiry,
    });
  }

  async loadAuth() {
    const storedData = ewelinkStore.read();
    if (!storedData) {
      return;
    }
    this.accessToken = storedData.accessToken;
    this.refreshToken = storedData.refreshToken;
    this.accessTokenExpiry = storedData.accessTokenExpiry;
    this.refreshTokenExpiry = storedData.accessTokenExpiry;
  }

  async isAuthenticated() {
    await this.loadAuth();
    return (
      !!this.accessToken &&
      !!this.refreshToken &&
      !!this.accessTokenExpiry &&
      !!this.refreshTokenExpiry
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
    const result = await homeSensorService.getSensorData();
    return result.waterTorrent;
  }
  async ensureClientReady() {
    const now = new Date().getTime();
    if (now > this.accessTokenExpiry) {
      try {
        console.log("refreshing token");
        const refreshStatus = await this.ewelinkClient.user.refreshToken({
          rt: this.refreshToken,
        });
        if (refreshStatus.error === 0) {
          this.accessToken = refreshStatus?.data?.at;
          this.refreshToken = refreshStatus?.data?.rt;
          this.accessTokenExpiry = refreshStatus?.data?.atExpiredTime;
          this.refreshTokenExpiry = refreshStatus?.data?.rtExpiredTime;
          console.log("new access token", this.accessToken);
          console.log("new refresh token", this.refreshToken);
          this.saveAuth(
            this.accessToken,
            this.refreshToken,
            this.accessTokenExpiry,
            this.refreshTokenExpiry
          );
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

export const defaultEwelinkInstance = new Ewelink();
