import { exchangeCodeForIdToken } from "./googleAuth.js";
import http from "http";
import { URL } from "url";

export const OAUTH_CALLBACK_PATH = "/oauth2callback";
export let latestGoogleIdToken: string | null = null;

 
// eslint-disable-next-line no-unused-vars
export function startOAuthCallbackServer(port: number = 3005, onToken?: (code: string, redirectUri: string, idToken: string) => void) {
  const server = http.createServer(async (req, res) => {
    if (req.url && req.url.startsWith(OAUTH_CALLBACK_PATH)) {
      const host = req.headers.host || `localhost:${port}`;
      const urlObj = new URL(req.url, `http://${host}`);
      const code = urlObj.searchParams.get("code");
      if (code) {
        try {
          const redirectUri = `http://${host}${OAUTH_CALLBACK_PATH}`;
          const idToken = await exchangeCodeForIdToken(code, redirectUri);
          latestGoogleIdToken = idToken;
          console.log(`Google ID Token successfully exchanged:', ${idToken.slice(0, 20)}...`);
          if (typeof onToken === 'function') {
            onToken(code, redirectUri, idToken);
          }
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`<h2>Google authentication successful!</h2><p>You may close this window.</p>`);
          return;
        } catch (err) {
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end(`<h2>Google authentication failed.</h2><pre>${err instanceof Error ? err.message : String(err)}</pre>`);
        }
      } else {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end(`<h2>Missing code parameter.</h2>`);
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  server.listen(port, '0.0.0.0', () => {
    console.error(`OAuth callback server listening on http://0.0.0.0:${port}${OAUTH_CALLBACK_PATH} (accessible via http://localhost:${port}${OAUTH_CALLBACK_PATH} on host)`);
  });
}
