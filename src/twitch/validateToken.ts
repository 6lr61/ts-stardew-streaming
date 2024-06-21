const VALIDATE_URL = "https://id.twitch.tv/oauth2/validate";

export interface ValidTokenResponse {
  client_id: string;
  login: string;
  scopes: string[];
  user_id: string;
  /** Expires in n seconds */
  expires_in: number;
}

export interface InvalidTokenResponse {
  status: number;
  message: string;
}

type ValidationResponse = ValidTokenResponse | InvalidTokenResponse;

export async function validateToken(
  token: string
): Promise<ValidationResponse> {
  const response = await fetch(VALIDATE_URL, {
    headers: {
      Authorization: `OAuth ${token}`,
    },
  });

  const result: ValidTokenResponse | InvalidTokenResponse =
    await response.json();

  return result;
}
