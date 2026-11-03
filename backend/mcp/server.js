
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";
import { TavilySearch } from "@langchain/tavily";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import path from "path";

// Load backend/.env by path, so this works no matter which folder it is started from
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const server = new McpServer({
  name: "automate-ai",
  version: "1.0.0",
});

const tavilySearch = new TavilySearch({
  maxResults: 5,
  topic: "general",
  tavilyApiKey: process.env.TAVILY_API_KEY,
});

// Register MCP tool correctly
server.registerTool(
  "web_search",
  {
    description: "Search the web for information.",
    inputSchema: {
      query: z.string().describe("The search query"),
    },
  },
  async ({ query }) => {
    try {
      const result = await tavilySearch.invoke({ query });

      return {
        content: [
          {
            type: "text",
            text:
              typeof result === "string"
                ? result
                : JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Web search failed: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

const main = async () => {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("MCP server started successfully.");
};

main().catch((err) => {
  console.error("Error starting MCP server:", err);
  process.exit(1);
});
