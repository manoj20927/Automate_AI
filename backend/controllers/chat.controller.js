import { AIMessage,HumanMessage } from "@langchain/core/messages";
import chatGraph from "../utils/chatGraph.js";
import Agent from "../models/agent.model.js";
import { createAgentGraph } from "../utils/agentGraph.js";

export const chat = async (req, res) => {
  try {
    const { message, agentId } = req.body;
   if(!message || typeof message !== "string") {
    return res.status(400).json({ error: 'Message is required.' });
   }
   const userId =String(req.user._id)

   // No agent selected: normal chat. Agent selected: use its instructions and knowledge base in its own thread
   let threadId = userId
   let systemPrompt
   if(agentId) {
    const agent = await Agent.findOne({ _id: agentId, userId: req.user._id })
    if(!agent) {
     return res.status(404).json({ error: 'Agent not found.' });
    }
    threadId = `${userId}:${agent._id}`
    systemPrompt = `${agent.instructions}\n\nKnowledge base:\n${agent.knowledgeBase}`
   }

   const  data = await chatGraph.invoke({ messages:[new HumanMessage(message)]},{

    configurable: {
      thread_id: threadId,
      systemPrompt,
    },
   });
   const lastMessage = data.messages[data.messages.length - 1].content;
  return res.status(200).json(lastMessage);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'An error occurred while processing the chat.' });
  }
};


export const agentChat = async (req, res) => {
  try {
    const { message, agent } = req.body;
   if(!message || typeof message !== "string") {
    return res.status(400).json({ error: 'Message is required.' });
   }
   const userId =String(req.user._id)

   // Only look up the logged-in user's own agent; each agent gets its own conversation thread
    const exitagent = await Agent.findOne({ name:agent, userId:req.user._id })
    if(!exitagent) {
     return res.status(404).json({ error: 'Agent not found.' });
    }
   const threadId = `${userId}:${exitagent._id}`
   const systemPrompt = `${exitagent.instructions}\n\nKnowledge base:\n${exitagent.knowledgeBase}`

   const  data = await createAgentGraph(exitagent,userId)
   const response = await data.invoke({ messages:[new HumanMessage(message)]},{
    configurable: {
      thread_id: threadId,
      systemPrompt,
    },
   });
   const lastMessage = response.messages[response.messages.length - 1].content;
  return res.status(200).json(lastMessage);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'An error occurred while processing the chat.' });
  }
};