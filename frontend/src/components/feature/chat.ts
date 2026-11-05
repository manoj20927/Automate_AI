import api from "@/api"
export const chat=async ({message, agentId}:any)=>{
    try {
        const {data}= await api.post("/api/chat", {message, agentId: agentId || undefined})
        return data
    } catch (error) {
        console.log(error)
    }
}
export const agentChat=async ({message, agent}:any)=>{
    try {
        const {data}= await api.post("/api/chat/agent", {message, agent: agent || undefined})
        return data
    } catch (error) {
        console.log(error)
    }
}
export const approveAgentAction=async ({agent, approved}:any)=>{
    try {
        const {data}= await api.post("/api/chat/agent/approve", {agent, approved})
        return data
    } catch (error) {
        console.log(error)
    }
}
