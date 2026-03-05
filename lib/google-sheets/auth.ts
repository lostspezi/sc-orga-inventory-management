import { createSign } from "crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

let cachedToken: { value: string; expiresAt: number } | null = null;

function makeJwt(email: string, privateKey: string): string {
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(
        JSON.stringify({
            iss: email,
            scope: SCOPE,
            aud: TOKEN_URL,
            exp: now + 3600,
            iat: now,
        })
    ).toString("base64url");

    const unsigned = `${header}.${payload}`;
    const sign = createSign("RSA-SHA256");
    sign.update(unsigned);
    const sig = sign.sign(privateKey, "base64url");

    return `${unsigned}.${sig}`;
}

export async function getGoogleAccessToken(): Promise<string> {
    const now = Date.now();
    if (cachedToken && cachedToken.expiresAt > now + 60_000) {
        return cachedToken.value;
    }

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

    if (!email || !rawKey) {
        throw new Error("Google service account credentials not configured.");
    }

    // Support both escaped newlines (from .env) and literal PEM
    const privateKey = rawKey.replace(/\\n/g, "\n");
    const jwt = makeJwt(email, privateKey);

    const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwt,
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Google token exchange failed: ${res.status} ${body}`);
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    cachedToken = { value: data.access_token, expiresAt: now + data.expires_in * 1000 };
    return cachedToken.value;
}
