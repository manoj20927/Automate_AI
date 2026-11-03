import express from "express";
import protect from "../middleware/project.js";
import { chat } from "../controllers/chat.controller.js";

const chatrouter = express.Router();
chatrouter.post("/",protect,chat);

export default chatrouter;