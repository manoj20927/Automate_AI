import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Loader2,
  Plus,
  Search,
  Trash2,
  Workflow,
} from 'lucide-react'

import { deleteAgent, getAllAgents } from '@/components/feature/agents'
import { useDispatch, useSelector } from 'react-redux'
import { setAgents, setAgentsLoading, setSelectedAgent } from '@/components/redux/agentSlice'

interface Agent {
  _id: string
  name: string
  instructions: string
  knowledgeBase: string
  tools: string[]
}

export default function Agents() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // const [agents, setAgents] = useState<Agent[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
const { agentsLoading:loading,agents } = useSelector((state: any) => state.agent)

  // Refetch on mount so agents created on other pages show up here
  useEffect(() => {
    const fetchAgents = async () => {
      dispatch(setAgentsLoading(true))
      try {
        const data = await getAllAgents()
        dispatch(setAgents(Array.isArray(data) ? data : []))
      } catch (err) {
        console.error('Fetch agents error:', err)
        setError('Could not load your agents. Please try again.')
      } finally {
        dispatch(setAgentsLoading(false))
      }
    }
    fetchAgents()
  }, [dispatch])

  async function handleDelete(agent: Agent) {
    if (!window.confirm(`Delete "${agent.name}"? This cannot be undone.`)) return
    try {
      setDeletingId(agent._id)
      await deleteAgent(agent._id)
     dispatch({ type: 'agent/setDelete', payload: agent._id })
    } catch (err) {
      console.error('Delete agent error:', err)
      setError('Could not delete the agent. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredAgents = (agents || []).filter((agent: Agent) => {
    const query = search.toLowerCase()
    return (
      agent?.name?.toLowerCase().includes(query) ||
      agent?.instructions?.toLowerCase().includes(query) ||
      agent?.knowledgeBase?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#0a0c10] text-white">
      {/* Subtle radial ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,#1e222d_0%,#0f1117_50%,#090a0f_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/[0.04] blur-[150px]"
      />

      {/* Top Navigation Bar */}
      <header className="relative z-20 flex h-20 w-full items-center justify-between px-6 sm:px-8">
        <div className="flex items-center gap-3 select-none">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white text-zinc-950 shadow-md">
            <Workflow className="size-5" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white sm:text-lg">
            Automate AI
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-sm font-medium text-zinc-300 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        >
          <ArrowLeft className="size-4" />
          <span>Back to chat</span>
        </button>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        {/* Page heading */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/80">
              <Bot className="size-4" />
              <span>Agent Workspace</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">My Agents</h1>
            <p className="mt-2 text-sm text-zinc-400 sm:text-base">
              Manage your AI agents and choose one to get started.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/agents/new')}
            className="flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-md transition-all hover:bg-zinc-200"
          >
            <Plus className="size-4" />
            <span>Create agent</span>
          </button>
        </div>

        {/* Search + count */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-white/25 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-white/10"
            />
          </div>
          {!loading && (
            <span className="text-sm text-zinc-500">
              {filteredAgents.length} {filteredAgents.length === 1 ? 'Agent' : 'Agents'}
            </span>
          )}
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-zinc-400">
            <Loader2 className="size-4 animate-spin" />
            <span>Loading agents...</span>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-white/[0.06] text-zinc-300">
              <Bot className="size-6" />
            </div>
            <p className="font-medium text-white">
              {agents.length === 0 ? 'No agents yet' : 'No agents match your search'}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {agents.length === 0
                ? 'Create your first agent to get started.'
                : 'Try a different name or keyword.'}
            </p>
            {agents.length === 0 && (
              <button
                type="button"
                onClick={() => navigate('/agents/new')}
                className="mt-6 flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition-all hover:bg-zinc-200"
              >
                <Plus className="size-4" />
                <span>Create agent</span>
              </button>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent: Agent) => (
              <div
                key={agent._id}
                className="group flex flex-col rounded-3xl border border-white/10 bg-[#14161c]/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-white/20 hover:bg-[#181a21]/90"
              >
                <div className="flex items-start justify-between">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-zinc-950 shadow-[0_0_30px_rgba(255,255,255,0.06)]">
                    <Bot className="size-6" />
                  </div>
                  <button
                    type="button"
                    aria-label={`Delete ${agent.name}`}
                    onClick={() => handleDelete(agent)}
                    disabled={deletingId === agent._id}
                    className="flex size-9 cursor-pointer items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed"
                  >
                    {deletingId === agent._id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </button>
                </div>

                <h2 className="mt-5 truncate text-lg font-semibold text-white">{agent.name}</h2>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm text-zinc-400">
                  {agent.instructions}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-xs text-zinc-500">
                    {agent.tools?.length || 0} {agent.tools?.length === 1 ? 'tool' : 'tools'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(setSelectedAgent(agent._id))
                      navigate('/')
                    }}
                    className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-white transition-all hover:gap-2.5"
                  >
                    <span>Use agent</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
