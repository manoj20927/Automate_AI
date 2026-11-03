import { ChatGroq } from "@langchain/groq"
import {
  StateGraph,
  MessagesAnnotation,
} from "@langchain/langgraph";import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoClient } from "mongodb";
import { SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
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

const chatNode =async (state, config)=>{
// The agent (if any) is passed per request, so the system prompt isn't saved in the chat history
const agent = config?.configurable?.agent || {}
const userName = config?.configurable?.userName

// Built on every call so the date and time are always current
const currentDateTime=new Intl.DateTimeFormat("en-IN",{
    timeZone:"Asia/Kolkata",
    dateStyle:"full",
    timeStyle:"long"
}).format(new Date())

const systemPrompt = `
${agent.instructions || "You are AutoMate AI, a helpful personal assistant."}
${agent.name ? `Your name is ${agent.name}.` : ""}

CURRENT DATE AND TIME:
- Current date and time in Asia/Kolkata: ${currentDateTime}
- Resolve today, tomorrow, and weekday references using this timestamp.
- Do not ask the user to confirm a date that can be resolved.

DEFAULT SETTINGS:
- Default timezone: Asia/Kolkata (IST) unless the user says otherwise.
- Reply in the same language the user writes in.
- Keep answers clear and concise; use lists or steps when they help.
${userName ? `- The user's name is ${userName}.` : ""}

${agent.knowledgeBase ? `KNOWLEDGE BASE:
Use this information when it is relevant to the user's question.
${agent.knowledgeBase}` : ""}
`.trim()

// Only send the most recent messages to the model to keep requests small
const recentMessages = state.messages.slice(-MAX_HISTORY_MESSAGES)
const response = await llm.invoke([new SystemMessage(systemPrompt), ...recentMessages])
return {
    messages: [response],
}

}
const workflow = new StateGraph(MessagesAnnotation)
.addNode("chatNode", chatNode)
.addEdge("__start__", "chatNode")
.addEdge("chatNode", "__end__")

const chatGraph = workflow.compile({checkpointer})

export default chatGraph
