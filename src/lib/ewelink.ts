/* eslint-disable @typescript-eslint/no-explicit-any */
import eWeLink from "ewelink-api-next";
import dayjs from "dayjs";
import { wait } from "~/lib/utils/wait";
import { appConfig } from "~/lib/config";
import { randomString } from "~/lib/utils/randomString";

const ewelinkClient = new eWeLink.WebAPI({
  appId: appConfig.ewelink.appId,
  appSecret: appConfig.ewelink.appSecret,
  region: "as",
});
let accessTokenExpiryTime = 0;
let interval: NodeJS.Timeout;

type WaterTorrentData = {
  type: "waterTorrent";
  lastTimestamp: string;
  detected: boolean;
  value: number;
};

export const ewelink = {
  getLoginUrl,
};

function getLoginUrl() {
  const loginUrl = ewelinkClient.oauth.createLoginUrl({
    redirectUrl: appConfig.ewelink.callbackUrl,
    grantType: "authorization_code",
    state: randomString(10),
  });
  return loginUrl;
}

export function waterPumpManager() {
  console.log("Starting water pump manager");
  handleWaterPump();
  interval = setInterval(() => {
    try {
      handleWaterPump();
    } catch (err) {
      console.error(err);
    }
  }, 3600_000);
}

async function handleWaterPump() {
  console.log(`--------- ${dayjs().format("YYYY-MM-DD HH:mm:SS")} ---------`);
  console.log("Checking water torent status");
  const waterTorrentData = await getWaterTorrentData();
  if (!waterTorrentData.detected) {
    console.log("Water torrent data not detected! Aborting...");
    return;
  }
  if (waterTorrentData.value > appConfig.waterTorrent.triggerValue) {
    await ensureClientReady();
    console.log("Turning water pump on");
    await turnWaterPumpState(true);
    console.log(`Waiting ${appConfig.waterTorrent.triggerDuration} seconds`);
    await wait(appConfig.waterTorrent.triggerDuration * 1000);
    console.log("Turning water pump off");
    await turnWaterPumpState(false);
  }
}

async function getWaterTorrentData() {
  const result = await fetch("http://home.hanyalisti.local/api/sensor");
  const data = await result.json();
  return data.waterTorrent as WaterTorrentData;
}

async function ensureClientReady() {
  const now = new Date().getTime();
  if (now > accessTokenExpiryTime) {
    try {
      console.log("refreshing token");
      const refreshStatus = await ewelinkClient.user.refreshToken({
        // rt: appConfig.refreshToken,
      });
      if (refreshStatus.error === 0) {
        const accessToken = refreshStatus?.data?.at;
        const refreshToken = refreshStatus?.data?.rt;
        // appConfig.refreshToken = refreshStatus?.data?.rt;
        console.log("new access token", accessToken);
        console.log("new refresh token", refreshToken);
        accessTokenExpiryTime = now + 2592000_000;
      } else {
        console.error(refreshStatus);
        clearInterval(interval);
      }
    } catch (err) {
      console.error(err);
      clearInterval(interval);
    }
  } else {
  }
}

async function turnWaterPumpState(isOn: boolean) {
  const getAllThingsResult = await ewelinkClient.device.getAllThings({});
  const allThings = getAllThingsResult.data.thingList;
  const waterPump = allThings.find(
    (record: any) => record.itemData.name === "Water Pump"
  );
  if (!waterPump) {
    console.log("Water pump not found!");
    return;
  }
  await ewelinkClient.device.setThingStatus({
    id: waterPump.itemData.deviceid,
    type: 1, // device
    params: {
      switch: isOn ? "on" : "off",
    },
  });
}
