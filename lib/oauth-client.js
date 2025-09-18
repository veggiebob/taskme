const GOOGLE_OAUTH_CONFIG = {
  client_id: "", // populated by user settings
  response_type: "code",
  scope: [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.readonly",
  ].join(" "),
  access_type: "offline",
  prompt: "consent",
};

export function applySettings(settings = {}) {
  if (settings.googleClientId) {
    GOOGLE_OAUTH_CONFIG.client_id = settings.googleClientId;
  }
  if (settings.googleScopes) {
    GOOGLE_OAUTH_CONFIG.scope = settings.googleScopes.join(" ");
  }
}

function buildAuthUrl(redirectUri) {
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.client_id,
    redirect_uri: redirectUri,
    response_type: GOOGLE_OAUTH_CONFIG.response_type,
    scope: GOOGLE_OAUTH_CONFIG.scope,
    access_type: GOOGLE_OAUTH_CONFIG.access_type,
    prompt: GOOGLE_OAUTH_CONFIG.prompt,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function launchOAuthFlow() {
  if (!GOOGLE_OAUTH_CONFIG.client_id) {
    throw new Error("Google OAuth client id is missing. Configure it in TaskMe settings.");
  }

  const redirectUri = browser.identity.getRedirectURL();
  const authUrl = buildAuthUrl(redirectUri);
  const responseUrl = await browser.identity.launchWebAuthFlow({
    url: authUrl,
    interactive: true,
  });
  return new URL(responseUrl).searchParams.get("code");
}

export async function exchangeCodeForToken(code, options = {}) {
  const body = new URLSearchParams({
    code,
    client_id: GOOGLE_OAUTH_CONFIG.client_id,
    redirect_uri: options.redirectUri || browser.identity.getRedirectURL(),
    grant_type: "authorization_code",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OAuth token exchange failed: ${error}`);
  }

  return response.json();
}

export default {
  applySettings,
  launchOAuthFlow,
  exchangeCodeForToken,
};
