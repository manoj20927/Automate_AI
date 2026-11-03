import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authrouter from "./routes/auth.route.js";
import { login, logout, me } from "./controllers/auth.controller.js";
import protect from "./middleware/project.js";  
import agentrouter from "./routes/agent.route.js";
import chatrouter from "./routes/chat.route.js";
import { getMcpTools } from "./mcp/langGraph-mcp-adapter.js";
dotenv.config();

const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use("/api/auth", authrouter);
app.use("/api/agents", agentrouter);

app.use("/api/chat", chatrouter);
app.listen(port, () => {
    connectDB();
  console.log(`Server is running on port ${port}`);
});