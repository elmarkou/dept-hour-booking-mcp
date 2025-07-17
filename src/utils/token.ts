import { TokenResponse } from "./types.js";
import fetch from "node-fetch";
import { URLSearchParams } from "url";

const {
  DEPT_CLIENT_ID,
  DEPT_CLIENT_SECRET,
  DEPT_TOKEN_URL,
} = process.env;

let currentAccessToken: string | null = null;
let currentRefreshToken: string | null = null;
let tokenExpiresAt: Date | null = null;

export async function getValidAccessToken(): Promise<string> {
  if (currentAccessToken && tokenExpiresAt && tokenExpiresAt > new Date(Date.now() + 60000)) {
    return currentAccessToken;
  }
  return await refreshAccessToken();
}

export async function refreshAccessToken(): Promise<string> {
  if (!currentRefreshToken) {
    const tokenData = await getInitialAccessToken();
    return tokenData.access_token;
  }
  if (!DEPT_CLIENT_ID || !DEPT_CLIENT_SECRET) {
    throw new Error("Missing required credentials: DEPT_CLIENT_ID or DEPT_CLIENT_SECRET");
  }
  const params = new URLSearchParams({
    client_id: DEPT_CLIENT_ID,
    client_secret: DEPT_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: currentRefreshToken as string
  });
  const response = await fetch(DEPT_TOKEN_URL as string, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  const tokenData = await response.json() as TokenResponse;
  currentAccessToken = tokenData.access_token;
  currentRefreshToken = tokenData.refresh_token;
  tokenExpiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));
  return currentAccessToken;
}

export async function getInitialAccessToken(): Promise<TokenResponse> {
  // Use latestGoogleIdToken from oauthCallbackServer
  const { latestGoogleIdToken } = await import("./oauthCallbackServer.js");
  const { getGoogleOAuthUrl } = await import("./googleAuth.js");
  
  const googleIdToken = latestGoogleIdToken;
  if (!DEPT_CLIENT_ID || !DEPT_CLIENT_SECRET) {
    const missing = [];
    if (!DEPT_CLIENT_ID) missing.push("DEPT_CLIENT_ID");
    if (!DEPT_CLIENT_SECRET) missing.push("DEPT_CLIENT_SECRET");
    throw new Error(`Missing required credentials: ${missing.join(", ")}`);
  }


  if (!googleIdToken) {
    // Generate Google OAuth URL and throw a custom error to prompt authentication
    const redirectUri = "http://127.0.0.1:3005/oauth2callback";
    const oauthUrl = getGoogleOAuthUrl(redirectUri);
    // Show the oauth URL as a link to the user so they can click it directly on the console
    // Wait until latestGoogleIdToken is defined
    // Continue when latestGoogleIdToken is set
    throw {
      isGoogleAuthPrompt: true,
      message: `❌ Google ID token is missing.\n\nTo authorize, please visit the following URL in your browser, sign in, and paste the resulting code here:\n\n${oauthUrl}\n\nAfter authorization, use the code to obtain a new Google ID token.`,
      oauthUrl,
    };
  } else {
      console.log("Using Google ID Token:", googleIdToken.slice(0, 20), "...");
      // The token is now valid and stored in latestGoogleIdToken
  }
  const params = new URLSearchParams({
    client_id: DEPT_CLIENT_ID,
    client_secret: DEPT_CLIENT_SECRET,
    grant_type: 'google',
    google_id_token: googleIdToken
  });
  const response = await fetch(DEPT_TOKEN_URL as string, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Initial token exchange failed:", response.status, response.statusText, errorText);
    // Just throw a custom error, let startOAuthCallbackServer handle the prompt
    if (errorText.toLowerCase().includes("google authentication failed") || errorText.toLowerCase().includes("invalid token") || errorText.toLowerCase().includes("google") || errorText.toLowerCase().includes("jwt")) {
      const redirectUri = "http://127.0.0.1:3005/oauth2callback";
      const oauthUrl = getGoogleOAuthUrl(redirectUri);
      throw {
        isGoogleAuthPrompt: true,
        message: errorText,
        oauthUrl,
      };
    }
    throw new Error(`Initial token exchange failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  const tokenData = await response.json() as TokenResponse;
  currentAccessToken = tokenData.access_token;
  currentRefreshToken = tokenData.refresh_token;
  tokenExpiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));
  return tokenData;
}
