import Agent from "../models/agent.model.js";
export const createAgent=async (req, res)=>{
try {
    const {name, knowledgeBase, instructions, tools}=req.body
    if(!name || !knowledgeBase || !instructions || !tools) {
        return res.status(400).json({message: "send all details"})
    }const exitsAgent=await Agent.findOne({name})
    if(exitsAgent){
        return res.status(400).json({message: "agent already exits"})
    }
    const userId=req.user?._id
    const agent=await Agent.create({
        userId, name, knowledgeBase, instructions, tools
    })
    return res.status(201).json(agent)
} catch (error) {
    return res.status(500).json({message:`create agent error ${error}`})
}
}

export const getallAgents=async (req, res)=>{
try {
   
    const userId=req.user?._id
    const agent=await Agent.find({
        userId,
    })
    return res.status(200).json(agent)
} catch (error) {
    return res.status(500).json({message:`get all agents error ${error}`})
}
}
export const getAgentById=async (req,res)=>{
try {
    const userId=req.user?._id
    const agentId=req.params.id
    const agent=await Agent.findById(agentId)
    return res.status (200).json (agent)
} catch (error) {
    return res.status(500).json({message: `get agent by id error ${error}` })
} 
}

export const deleteAgent=async (req,res)=>{
try {
    const agentId=req.params.id
    const agent=await Agent.findByIdAndDelete(agentId)
    return res.status (200).json (agent)
} catch (error) {
    return res.status(500).json({message: `get agent by id error ${error}` })
} 
}
