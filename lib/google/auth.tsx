"use server";

import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { google, Auth, Common } from "googleapis";
import { KeyStore } from "@/lib/db";

const KeyName = "Service.Google.RefreshToken";

const OAuth2Client = new Auth.OAuth2Client(
  process.env.client_id, //YOUR_CLIENT_ID,
  process.env.client_secret, //YOUR_CLIENT_SECRET,
  process.env.redirect_uris //YOUR_REDIRECT_URL
);

const scopes = ["https://www.googleapis.com/auth/photoslibrary.readonly"];

await initRefreshToken();

export async function getAccessToken() {
  try {
    await OAuth2Client.getAccessToken();
  } catch (error) {
    switch (error) {
      case "Error: invalid_grant":
        return null;
        break;
      default:
        return null;
        break;
    }
  }

  return OAuth2Client.credentials.access_token;
}

//Load token from database if available and set it
async function initRefreshToken() {
  const Key = await KeyStore.findOne({ where: { Key: KeyName } });
  if (Key === null) return;
  const RefreshToken = Key.Value;
  console.log("Refresh Token loaded from db");

  OAuth2Client.setCredentials({ refresh_token: RefreshToken });
  await getAccessToken();
}

//Next JS Server function - Redirect the user to google authorization page
export async function initiateGoogleAuth() {
  const url = OAuth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",
    prompt: "consent",

    // If you only need one scope you can pass it as a string
    scope: scopes,
  });

  redirect(url);
}

//Authorization callback handler auth/google/callback route
export async function handleAuthCallback(request: NextRequest) {
  const authorizationCode = new URLSearchParams(
    request.nextUrl.searchParams
  ).get("code");

  if (authorizationCode === null) return new Response();

  //get user tokens
  const { tokens } = await OAuth2Client.getToken(authorizationCode);

  //save tokens
  OAuth2Client.setCredentials(tokens);

  return Response.redirect("http://localhost:3000/settings");
}

OAuth2Client.on("tokens", (tokens) => {
  if (tokens.refresh_token) {
    console.log("Refresh token recieved");

    KeyStore.upsert({
      Key: KeyName,
      Value: tokens.refresh_token,
    });
  }
});

export async function isAuthenticated() {
  return !!(await getAccessToken());
}
