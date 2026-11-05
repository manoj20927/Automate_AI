import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import Integration from "../models/integration.model.js";
import { decrypt } from "./tokenCrypto.js";

const INSTAGRAM_API = "https://graph.instagram.com/v24.0";

const getIntegration = async (userId, provider, label) => {
  const integration = await Integration.findOne({ userId, provider });
  if (!integration) {
    throw new Error(`${label} is not connected. Ask the user to connect it on the Integrations page.`);
  }
  return integration;
};

// Google access tokens last about an hour, so get a fresh one from the saved refresh token
const getGoogleAccessToken = async (userId) => {
  const integration = await getIntegration(userId, "google", "Google");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: decrypt(integration.token),
      grant_type: "refresh_token",
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error("Google access has expired. Ask the user to reconnect it on the Integrations page.");
  }
  return data.access_token;
};

const requestJson = async (url, options) => {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Request failed with status ${response.status}`);
  }
  return data;
};

const toBase64 = (text) => Buffer.from(text, "utf8").toString("base64");

// A failed action comes back as text, so the model can tell the user what went wrong
const safely = (action, label) => async (input) => {
  try {
    return await action(input);
  } catch (error) {
    console.error(`${label} error:`, error);
    return `${label} failed: ${error.message}`;
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const createActionTools = (userId) => [
  new DynamicStructuredTool({
    name: "send_email",
    description: "Send an email from the user's connected Gmail account.",
    schema: z.object({
      to: z.string().email().describe("Recipient email address"),
      subject: z.string().describe("Email subject"),
      body: z.string().describe("Plain text email body"),
    }),
    func: safely(async ({ to, subject, body }) => {
      const accessToken = await getGoogleAccessToken(userId);
      const email = [
        `To: ${to}`,
        `Subject: =?UTF-8?B?${toBase64(subject)}?=`,
        "MIME-Version: 1.0",
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        toBase64(body),
      ].join("\r\n");

      await requestJson("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ raw: Buffer.from(email, "utf8").toString("base64url") }),
      });
      return `Email sent to ${to}.`;
    }, "Sending the email"),
  }),

  new DynamicStructuredTool({
    name: "create_calendar_event",
    description: "Create an event on the user's connected Google Calendar.",
    schema: z.object({
      title: z.string().describe("Event title"),
      start: z.string().describe("Start time, ISO format without timezone, e.g. 2026-11-06T15:00:00"),
      end: z.string().describe("End time, ISO format without timezone, e.g. 2026-11-06T16:00:00"),
      description: z.string().optional().describe("Event details"),
      attendees: z.array(z.string().email()).optional().describe("Guest email addresses"),
    }),
    func: safely(async ({ title, start, end, description, attendees }) => {
      const accessToken = await getGoogleAccessToken(userId);
      const timeZone = "Asia/Kolkata";
      const event = await requestJson("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: title,
          description,
          start: { dateTime: start, timeZone },
          end: { dateTime: end, timeZone },
          attendees: attendees?.map((email) => ({ email })),
        }),
      });
      return `Event created: ${event.htmlLink}`;
    }, "Creating the calendar event"),
  }),

  new DynamicStructuredTool({
    name: "publish_instagram_image",
    description: "Publish an image post on the user's connected Instagram account.",
    schema: z.object({
      imageUrl: z.string().url().describe("Public URL of a JPEG image"),
      caption: z.string().describe("Post caption"),
    }),
    func: safely(async ({ imageUrl, caption }) => {
      const integration = await getIntegration(userId, "instagram", "Instagram");
      const accessToken = decrypt(integration.token);
      const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

      // Instagram posts in two stages: upload the image, then publish it when it is ready
      const media = await requestJson(`${INSTAGRAM_API}/${integration.accountId}/media`, {
        method: "POST",
        headers,
        body: JSON.stringify({ image_url: imageUrl, caption }),
      });

      for (let attempt = 0; attempt < 10; attempt++) {
        const { status_code: status } = await requestJson(
          `${INSTAGRAM_API}/${media.id}?fields=status_code`,
          { headers }
        );
        if (status === "FINISHED") break;
        if (status === "ERROR" || status === "EXPIRED") {
          throw new Error("Instagram could not process this image.");
        }
        await sleep(2000);
      }

      await requestJson(`${INSTAGRAM_API}/${integration.accountId}/media_publish`, {
        method: "POST",
        headers,
        body: JSON.stringify({ creation_id: media.id }),
      });
      return "Image published on Instagram.";
    }, "Publishing to Instagram"),
  }),
];
