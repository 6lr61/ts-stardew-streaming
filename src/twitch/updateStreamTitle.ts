const CHANNELS_URL = "https://api.twitch.tv/helix/channels";

export async function updateStreamTitle(
  broadcasterId: string,
  newTitle: string
) {
  const url = new URL(CHANNELS_URL);
  url.searchParams.set("broadcaster_id", broadcasterId);

  const headers = {
    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
    "Client-Id": process.env.CLIENT_ID,
    "Content-Type": "application/json",
  };

  const result = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      title: newTitle,
    }),
  });

  if (result.status === 204) {
    console.debug("Successfully updated stream title to:", newTitle);
  } else {
    console.error(
      "Failed to update stream title:",
      result.status,
      result.statusText
    );
  }
}
