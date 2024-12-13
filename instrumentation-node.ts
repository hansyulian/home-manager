import { appConfig } from "~/lib/config";

console.log(appConfig);
if (appConfig.waterTorrent.initialStart) {
  console.log("initial start detected, delaying initalization for 10s");
  setTimeout(() => {
    console.log("executing initial start");
    fetch(`${appConfig.hans.homeServerUrl}/api/water-pump`, {
      body: JSON.stringify({ isManaged: true }),
      method: "POST",
    });
  }, 10000);
}
