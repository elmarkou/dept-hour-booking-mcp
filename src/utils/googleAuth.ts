import { GOOGLE_AUTH_CLIENT_ID, GOOGLE_AUTH_CLIENT_SECRET } from "./env.js";
import { URLSearchParams } from "url";
import fetch from "node-fetch";
import { z } from "zod";

export const GoogleOAuthUrlSchema = z.object({ redirectUri: z.string().url() });
export const GoogleOAuthCodeSchema = z.object({ code: z.string(), redirectUri: z.string().url() });

export function getGoogleOAuthUrl(redirectUri: string): string {
  if (!GOOGLE_AUTH_CLIENT_ID) throw new Error("Missing GOOGLE_AUTH_CLIENT_ID");
  const base = "https://accounts.google.com/o/oauth2/v2/auth";
  const params = new URLSearchParams({
    client_id: GOOGLE_AUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  return `${base}?${params.toString()}`;
}

export async function exchangeCodeForIdToken(code: string, redirectUri: string): Promise<string> {
  if (!GOOGLE_AUTH_CLIENT_ID) throw new Error("Missing GOOGLE_AUTH_CLIENT_ID");
  if (!GOOGLE_AUTH_CLIENT_SECRET) throw new Error("Missing GOOGLE_AUTH_CLIENT_SECRET");
  const tokenUrl = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams({
    code,
    client_id: GOOGLE_AUTH_CLIENT_ID,
    client_secret: GOOGLE_AUTH_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google token exchange failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  const data = await response.json();
  if (!data.id_token) throw new Error("No id_token returned from Google");
  return data.id_token;
}
