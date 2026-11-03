import express from "express";
import protect from "../middleware/project.js";
import { createAgent, getallAgents, getAgentById, deleteAgent } from "../controllers/agent.controller.js";
const agentrouter = express.Router();
agentrouter.post("/create", protect, createAgent);
agentrouter.get("/all", protect, getallAgents);
agentrouter.get("/:id", protect, getAgentById);
agentrouter.delete("/:id", protect, deleteAgent);

export default agentrouter;