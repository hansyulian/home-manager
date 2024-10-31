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
import { EwelinkSwitchData, TriggerHistory } from "~/types/responses";

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
  private triggerInterval = appConfig.waterTorrent.triggerInterval;
  private _history: TriggerHistory[] = [];

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
    this.ewelinkClient.rt = this.refreshToken;
    this.ewelinkClient.at = this.accessToken;
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

  get isWaterPumpManaged() {
    return !!this.intervalInstance;
  }

  get history() {
    return this._history.slice(0, 20);
  }

  private addHistory(record: TriggerHistory) {
    this._history.unshift(record);
  }

  async stopWaterPumpManager() {
    await this.ensureClientReady();
    if (this.intervalInstance) {
      console.log("stopping water pump manager");
      clearInterval(this.intervalInstance);
      this.intervalInstance = undefined;
    }
  }

  async startWaterPumpManager() {
    await this.ensureClientReady();
    await this.stopWaterPumpManager();
    console.log("Starting water pump manager");
    this.handleWaterPump();
    const self = this;
    this.intervalInstance = setInterval(async () => {
      try {
        self.handleWaterPump();
      } catch (err) {
        console.error(err);
      }
    }, this.triggerInterval * 1000);
  }
  async handleWaterPump() {
    const now = dayjs();
    console.log(`--------- ${now.format("YYYY-MM-DD HH:mm:SS")} ---------`);
    console.log("Checking water torent status");
    const waterTorrentData = await this.getWaterTorrentData();
    if (!waterTorrentData.detected) {
      console.log("Water torrent data not detected! Aborting...");
      this.addHistory({
        time: now.toDate(),
        trigger: false,
        sensorValue: undefined,
      });
      return;
    }
    console.log("Water torrent distance", waterTorrentData.value);
    if (waterTorrentData.value < appConfig.waterTorrent.triggerValue) {
      console.log(
        "Pumping untriggered, trigger value: ",
        appConfig.waterTorrent.triggerValue
      );
      this.addHistory({
        time: now.toDate(),
        trigger: false,
        sensorValue: waterTorrentData.value,
      });
      return;
    }
    if (!this.refreshToken) {
      console.log("Missing refresh token");
      return;
    }
    await this.ensureClientReady();
    this.addHistory({
      time: now.toDate(),
      trigger: true,
      sensorValue: waterTorrentData.value,
    });
    console.log("Turning water pump on");
    await this.setWaterPumpState(true);
    console.log(`Waiting ${appConfig.waterTorrent.triggerDuration} seconds`);
    await wait(appConfig.waterTorrent.triggerDuration * 1000);
    console.log("Turning water pump off");
    await this.setWaterPumpState(false);
  }

  async getWaterTorrentData() {
    const result = await homeSensorService.getSensorData();
    return result.waterTorrent;
  }
  async ensureClientReady() {
    await this.loadAuth();
    if (!this.refreshToken) {
      throw new Error("missing refresh token");
    }
    const now = new Date().getTime();
    if (now < this.accessTokenExpiry) {
      return;
    }
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
        this.stopWaterPumpManager();
      }
    } catch (err) {
      console.error(err);
      this.stopWaterPumpManager();
    }
  }

  async getWaterPump() {
    await this.ensureClientReady();
    if (!this.isAuthenticated()) {
      return undefined;
    }
    const getAllThingsResult = await this.ewelinkClient.device.getAllThings({});
    const allThings = getAllThingsResult.data.thingList;
    const waterPump = allThings.find(
      (record: any) => record.itemData.name === appConfig.ewelink.waterPumpName
    );
    if (!waterPump) {
      return;
    }
    return waterPump.itemData as EwelinkSwitchData;
  }

  async getWaterPumpState() {
    const waterPump = await this.getWaterPump();
    return {
      isOn: waterPump?.params.switch === "on",
    };
  }

  async setWaterPumpState(isOn: boolean) {
    const waterPump = await this.getWaterPump();
    if (!waterPump) {
      console.log("Water pump not found!");
      return;
    }

    await this.ewelinkClient.device.setThingStatus({
      id: waterPump.deviceid,
      type: 1, // device
      params: {
        switch: isOn ? "on" : "off",
      },
    });
  }
}

export const defaultEwelinkInstance = new Ewelink();
