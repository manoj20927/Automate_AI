import api from "@/api";

export interface User {
  _id?: string;
  firebaseId?: string;
  name?: string;
  email?: string;
  profileImage?: string;
  [key: string]: unknown;
}

export interface CreateAgentResponse {
  message: string;
  agent?: User;
}


export const createAgent = async ({name,knowledgebase,instructions,tools}:any) => {
  try { 
  const response = await api.post<CreateAgentResponse>("/api/agents/create", {
    name,
    knowledgeBase: knowledgebase,
    instructions,
    tools
  });
  return response.data;
} catch (error) {
  console.error("Error creating agent:", error);
  return error;  
}};

export const getAllAgents = async () => {
  const response = await api.get("/api/agents/all");
  return response.data;
};

export const getAgentById = async (id: string) => {
  const response = await api.get(`/api/agents/${id}`);
  return response.data;
};

export const deleteAgent = async (id: string) => {
  const response = await api.delete(`/api/agents/${id}`);
  return response.data;
};
