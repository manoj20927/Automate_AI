import express from "express";
import protect from "../middleware/project.js";
import { chat } from "../controllers/chat.controller.js";
import { agentChat } from "../controllers/chat.controller.js";
const chatrouter = express.Router();
chatrouter.post("/",protect,chat);
chatrouter.post("/agent",protect,agentChat);

export default chatrouter;