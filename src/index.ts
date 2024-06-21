import { exit } from "node:process";
import { listenForSaves } from "./stardew/listenForSaves.js";
import { makeConnectLink } from "./twitch/makeConnectLink.js";
import { validateToken } from "./twitch/validateToken.js";
import { updateStreamTitle } from "./twitch/updateStreamTitle.js";

console.debug("Checking for access token in config.env");

const streamTitle = "Farming in Pelican Town! 🧑‍🌾";

if (!process.env.ACCESS_TOKEN) {
  console.error(
    "Error: No access token in config.env! Please visit:",
    makeConnectLink(process.env.CLIENT_ID, process.env.REDIRECT_URI),
    "and copy the access token into config.env"
  );

  exit(1);
}

console.debug("Validating token found in config.env");

const tokenResponse = await validateToken(process.env.ACCESS_TOKEN);

if ("status" in tokenResponse) {
  console.error(
    "Error: Invalid token response:",
    tokenResponse.status,
    tokenResponse.message
  );
  exit(1);
}

console.log("Valid token for:", tokenResponse.login);

listenForSaves((date) => {
  const dateString = `Day ${date.dayOfMonth} of ${capitalize(
    date.currentSeason
  )}, Year ${date.year}`;

  updateStreamTitle(tokenResponse.user_id, `${streamTitle} | ${dateString}`);
});

// listenForSaves((date) => console.log(date));

function capitalize(word: string) {
  return word.slice(0, 1).toUpperCase() + word.slice(1);
}
