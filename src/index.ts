import { exit } from "node:process";
import {
  type StardewDate,
  listenForSaves,
  parseGameSave,
  readCurrentDate,
} from "./stardew/listenForSaves.js";
import { makeConnectLink } from "./twitch/makeConnectLink.js";
import { validateToken } from "./twitch/validateToken.js";
import { updateStreamTitle } from "./twitch/updateStreamTitle.js";
import {
  percentPerfection,
  perfectionCounter,
} from "./stardew/perfectionCounter.js";

console.debug("Checking for access token in .env");

const streamTitle = "Finding the Trash Catalogue today!? 🗑️💢";

if (!process.env.ACCESS_TOKEN) {
  console.error(
    "Error: No access token in .env! Please visit:",
    makeConnectLink(process.env.CLIENT_ID, process.env.REDIRECT_URI),
    "and copy the access token into .env"
  );

  exit(1);
}

console.debug("Validating token found in .env");

const tokenResponse = await validateToken(process.env.ACCESS_TOKEN);

if ("status" in tokenResponse) {
  console.error(
    "Error: Invalid token response:",
    tokenResponse.status,
    tokenResponse.message
  );
  exit(1);
}

const userId = tokenResponse.user_id;

console.log("Valid token for:", tokenResponse.login);

listenForSaves((data) => {
  const date = readCurrentDate(data);
  const perfection = perfectionCounter(data.SaveGame);
  const percentage = percentPerfection(perfection);

  handleUpdate(date, percentage);
});

async function handleUpdate(date: StardewDate, percentage: number) {
  function capitalize(word: string) {
    return word.slice(0, 1).toUpperCase() + word.slice(1);
  }

  const dateString = `Day ${date.dayOfMonth} of ${capitalize(
    date.currentSeason
  )}, Year ${date.year}`;

  updateStreamTitle(
    userId,
    `${streamTitle} | ${dateString} | ${percentage}% perfection`
  );
}
