const AUTHORIZE_URL = "https://id.twitch.tv/oauth2/authorize";

export function makeConnectLink(clientId: string, redirectUri: string) {
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "token");
  url.searchParams.set("scope", "channel:manage:broadcast");

  return url.toString();
}
