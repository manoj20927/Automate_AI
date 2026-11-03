 import { MCPAdapter } from "@langchain/mcp-adapters";
 import { fileURLToPath } from "node:url";
 import path from "path";
const _fileName =fileURLToPath(import.meta.url);
const _dirname =path.dirname(_fileName);
console.log("MCP Adapter directory:", _dirname);
 const adapter = new MCPAdapter({
    servers: { automate:{
transport: "stdio",
command:process.execPath,
args: [path.join(_dirname, "server.js")]
    }},
  });

export const getMcpTools = async ()=>{
const tools = await adapter.listTools();
console.log("Available tools from MCP Adapter:", tools.map((tool) => tool.name));
return tools
}