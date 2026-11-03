import api from "@/api"
export const chat=async ({message, agentId}:any)=>{
    try {
        const {data}= await api.post("/api/chat", {message, agentId: agentId || undefined})
        return data
    } catch (error) {
        console.log(error)
    }
}