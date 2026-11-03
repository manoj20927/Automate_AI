import { createSlice } from '@reduxjs/toolkit'
export const agentSlice = createSlice({
  name: 'agent',
  initialState:{
    agents:[],
    selectedAgent:"",
    agentsLoading:false,
    
  },
  reducers: {
setAgents: (state,action)=>{
    state.agents= action.payload
},
setSelectedAgent: (state,action)=>{
    state.selectedAgent= action.payload
},
setAgentsLoading: (state,action)=>{
    state.agentsLoading= action.payload
},
setDelete: (state,action)=>{
    const id = action.payload
    state.agents = (state.agents || []).filter((agent:any)=> agent._id !== id)
}}});
// Action creators are generated for each case reducer function export const { setAgents, setSelectedAgent} = agentSlice.actions
export const {setAgents, setSelectedAgent, setAgentsLoading, setDelete}  = agentSlice.actions;
export default agentSlice.reducer