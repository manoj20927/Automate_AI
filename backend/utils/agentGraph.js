import { ChatGroq } from "@langchain/groq"
import {
  StateGraph,
  MessagesAnnotation,
  interrupt,
} from "@langchain/langgraph";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoClient } from "mongodb";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import { getMcpTools } from "../mcp/langGraph-mcp-adapter.js";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { createActionTools } from "./actionTools.js";
dotenv.config();
const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
    // other params...
})
const client = new MongoClient(process.env.MONGODB_URI, );
const checkpointer = new MongoDBSaver({ client, dbName: "langgraph" });

// How many past messages the model sees on each request
const MAX_HISTORY_MESSAGES = 4
const findTool =(tools,names)=>{
    return tools.find((tool)=>names?.includes(tool.name))
}
export const createAgentGraph = async (agent,userId) => {

    const mcptools =await getMcpTools();
console.log("Available tools from MCP Adapter:", mcptools.map((tool) => tool.name));
const websearchTool=findTool(mcptools, ["web_search","automate_web_search"]);
const finalTools=[]
if(websearchTool){
    finalTools.push(new DynamicStructuredTool({
        name:"web_search",
        description:"Search the web for current information, news, tutorials,documations,and factual questions",
        schema:z.object({
            query:z.string().describe("The Search query")
        }),
        func:async ({query})=>{
            try {
                const result = await websearchTool.invoke({query})
                console.log(result)
                return result
                
            } catch (error) {
                console.log("MCP search error:",error)
                return `Web search failed: ${error.message}`
            }
        }
    }))
}

// Email, calendar and Instagram run here, not in the MCP server, because they need the logged-in user
finalTools.push(...createActionTools(userId))

const llmWithTools = llm.bindTools(finalTools);

const approvalTools= new Set(["send_email", "create_calendar_event", "publish_instagram_image"]); // Add tool names that require approval
const chatNode =async (state, config)=>{
// Built on every call so the date and time are always current
const currentDatetTime = new Intl.DateTimeFormat("en-US", {
 timeZone: "Asia/Kolkata",
 dateStyle: "full",
 timeStyle: "long",
}).format(new Date());

const basePrompt = `You are an AI assistant that helps users with their tasks. The current date and time is ${currentDatetTime}. Please provide helpful and accurate responses to the user's queries. When the user asks you to send an email, create a calendar event, or publish on Instagram, call the tool directly once you have the details: the app shows the user an approval card, so do not ask for confirmation yourself. If a required detail is missing, ask for it. Never invent email addresses or image URLs.`;

// An agent's system prompt is passed per request, so it isn't saved in the chat history
const agentPrompt = config?.configurable?.systemPrompt
const systemPrompt = agentPrompt ? `${basePrompt}\n\n${agentPrompt}` : basePrompt
// Only send the most recent messages to the model to keep requests small.
// Drop tool results at the start of the slice: without the AI message that requested them the model rejects the request
let recentMessages = state.messages.slice(-MAX_HISTORY_MESSAGES)
while (recentMessages.length && recentMessages[0].getType() === "tool") {
    recentMessages = recentMessages.slice(1)
}
const messages = [new SystemMessage(systemPrompt), ...recentMessages]
const response = await llmWithTools.invoke(messages)
return {
    messages: [response],
}

}
const toolNode = new ToolNode(finalTools);
// Pauses the graph until the user approves or cancels. The answer arrives through agentApprove in the controller
const actionApprovalNode = async (state)=>{
    const toolCalls = state.messages[state.messages.length - 1].tool_calls
    const decision = interrupt({
        actions: toolCalls.map(({name,args})=>({name,args})),
    })
    if(decision?.approved){
        return {}
    }
    return {
        messages: toolCalls.map((call)=>new ToolMessage({
            tool_call_id: call.id,
            name: call.name,
            content: "The user cancelled this action. Do not try it again unless they ask.",
        })),
    }
};
// After chat: if the model asked for a tool, go to approval, otherwise finish
const routeAfterChat = (state)=>{
  const messages=state.messages || []
  const lastMessage=messages [messages.length-1]
  if(!lastMessage.tool_calls?.length){
    return "__end__"
  }
  const requiresApproval =lastMessage?.tool_calls?.some((call)=>(
    approvalTools.has(call.name)
  ))
  return requiresApproval ? "actionApprovalNode" : "toolNode"
}
// After approval: run the tools. If cancelled, the tool messages are already added, so go back to chat
const routeAfterApproval = (state)=>{
    const lastMessage = state.messages[state.messages.length - 1]
    return lastMessage.getType() === "tool" ? "chatNode" : "toolNode"
}
const workflow = new StateGraph(MessagesAnnotation)
.addNode("chatNode", chatNode)
.addNode("toolNode", toolNode)
.addNode("actionApprovalNode", actionApprovalNode)
.addEdge("__start__", "chatNode")
.addConditionalEdges("chatNode", routeAfterChat, ["actionApprovalNode", "toolNode", "__end__"])
.addConditionalEdges("actionApprovalNode", routeAfterApproval, ["toolNode", "chatNode"])
.addEdge("toolNode", "chatNode")

const chatAgentGraph = workflow.compile({checkpointer})

return chatAgentGraph
}