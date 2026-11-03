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

const chatNode =async (state, config)=>{
// An agent's system prompt is passed per request, so it isn't saved in the chat history
const systemPrompt = config?.configurable?.systemPrompt
const messages = systemPrompt ? [new SystemMessage(systemPrompt), ...state.messages] : state.messages
const response = await llm.invoke(messages)
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
