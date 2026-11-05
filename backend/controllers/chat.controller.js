import { AIMessage,HumanMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";
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
    recursionLimit:5
   });
   const lastMessage = data.messages[data.messages.length - 1].content;
  return res.status(200).json(lastMessage);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'An error occurred while processing the chat.' });
  }
};


// The graph either finished with a reply, or paused to ask the user for approval
const agentReply = (response) => {
  const pending = response.__interrupt__?.[0]?.value
  if(pending) {
    return { approval: pending }
  }
  return response.messages[response.messages.length - 1].content
}

// Only look up the logged-in user's own agent; each agent gets its own conversation thread
const loadAgentGraph = async (req, agentName) => {
  const exitagent = await Agent.findOne({ name:agentName, userId:req.user._id })
  if(!exitagent) {
    return null
  }
  const userId = String(req.user._id)
  return {
    graph: await createAgentGraph(exitagent,userId),
    config: {
      configurable: {
        thread_id: `${userId}:${exitagent._id}`,
        systemPrompt: `${exitagent.instructions}\n\nKnowledge base:\n${exitagent.knowledgeBase}`,
      },
      recursionLimit:5,
    },
  }
}

const hasPendingApproval = async (graph, config) => {
  const state = await graph.getState(config)
  return state.tasks.some((task) => task.interrupts?.length)
}

export const agentChat = async (req, res) => {
  try {
    const { message, agent } = req.body;
   if(!message || typeof message !== "string") {
    return res.status(400).json({ error: 'Message is required.' });
   }
   const loaded = await loadAgentGraph(req, agent)
   if(!loaded) {
    return res.status(404).json({ error: 'Agent not found.' });
   }
   const { graph, config } = loaded

   // A new message while an approval is waiting (e.g. after a page refresh) cancels that action
   if(await hasPendingApproval(graph, config)) {
    await graph.invoke(new Command({ resume: { approved: false } }), config)
   }

   const response = await graph.invoke({ messages:[new HumanMessage(message)]}, config);
  return res.status(200).json(agentReply(response));
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'An error occurred while processing the chat.' });
  }
};

export const agentApprove = async (req, res) => {
  try {
    const { agent, approved } = req.body;
   const loaded = await loadAgentGraph(req, agent)
   if(!loaded) {
    return res.status(404).json({ error: 'Agent not found.' });
   }
   const { graph, config } = loaded

   if(!await hasPendingApproval(graph, config)) {
    return res.status(409).json({ error: 'Nothing is waiting for approval.' });
   }

   const response = await graph.invoke(new Command({ resume: { approved: approved === true } }), config);
  return res.status(200).json(agentReply(response));
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ error: 'An error occurred while processing the approval.' });
  }
};
