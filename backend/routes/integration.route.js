import express from "express";
import protect from "../middleware/project.js";
import {
  connectInstagram,
  disconnectIntegration,
  getGoogleConnectUrl,
  getIntegrations,
  googleCallback,
} from "../controllers/integration.controller.js";

const integrationrouter = express.Router();
integrationrouter.get("/", protect, getIntegrations);
integrationrouter.get("/google/url", protect, getGoogleConnectUrl);
integrationrouter.get("/google/callback", googleCallback);
integrationrouter.post("/instagram", protect, connectInstagram);
integrationrouter.delete("/:provider", protect, disconnectIntegration);

export default integrationrouter;
