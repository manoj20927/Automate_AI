import jwt from "jsonwebtoken";
import Integration from "../models/integration.model.js";
import { encrypt } from "../utils/tokenCrypto.js";

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/calendar.events",
];
const INSTAGRAM_API = "https://graph.instagram.com/v24.0";
const frontendUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";

const saveIntegration = (userId, provider, token, accountId) =>
  Integration.findOneAndUpdate(
    { userId, provider },
    { token: encrypt(token), accountId },
    { upsert: true }
  );

export const getIntegrations = async (req, res) => {
  try {
    const integrations = await Integration.find({ userId: req.user._id }).select("provider");
    const connected = integrations.map((item) => item.provider);
    return res.status(200).json({
      google: connected.includes("google"),
      instagram: connected.includes("instagram"),
    });
  } catch (error) {
    return res.status(500).json({ message: `get integrations error ${error}` });
  }
};

export const getGoogleConnectUrl = async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
    return res.status(500).json({ message: "Google is not set up on the server yet." });
  }
  // Google's redirect back doesn't carry our login cookie, so the signed state says who is connecting
  const state = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: "10m" });
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: GOOGLE_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return res.status(200).json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
};

export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const { userId } = jwt.verify(state, process.env.JWT_SECRET);

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.refresh_token) {
      throw new Error(data.error_description || "Google did not return a refresh token");
    }

    await saveIntegration(userId, "google", data.refresh_token);
    return res.redirect(`${frontendUrl()}/integrations?connected=google`);
  } catch (error) {
    console.error("Google connect error:", error);
    return res.redirect(`${frontendUrl()}/integrations?error=google`);
  }
};

export const connectInstagram = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken || typeof accessToken !== "string") {
      return res.status(400).json({ message: "Access token is required." });
    }

    // Check the token works before saving it
    const params = new URLSearchParams({ fields: "user_id,username", access_token: accessToken.trim() });
    const response = await fetch(`${INSTAGRAM_API}/me?${params}`);
    const data = await response.json();
    if (!response.ok) {
      return res.status(400).json({ message: data.error?.message || "Instagram rejected this token." });
    }

    await saveIntegration(req.user._id, "instagram", accessToken.trim(), data.user_id);
    return res.status(200).json({ username: data.username });
  } catch (error) {
    return res.status(500).json({ message: `connect instagram error ${error}` });
  }
};

export const disconnectIntegration = async (req, res) => {
  try {
    await Integration.deleteOne({ userId: req.user._id, provider: req.params.provider });
    return res.status(200).json({ message: "Disconnected" });
  } catch (error) {
    return res.status(500).json({ message: `disconnect error ${error}` });
  }
};
