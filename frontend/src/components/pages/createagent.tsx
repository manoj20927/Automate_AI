import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bot,
  Calculator,
  Check,
  Globe,
  Loader2,
  Mail,
  Send,
  Workflow,
} from 'lucide-react'

import { createAgent } from '@/components/feature/agents'
import { cn } from '@/components/lib/utils'

const TOOLS = [
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Perform mathematical calculations',
    icon: Calculator,
  },
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Search for information on the web',
    icon: Globe,
  },
  {
    id: 'read_emails',
    name: 'Read Emails',
    description: 'Read and summarize emails',
    icon: Mail,
  },
  {
    id: 'send_emails',
    name: 'Send Emails',
    description: 'Draft and send emails',
    icon: Send,
  },
]

const fieldClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-white/25 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-white/10'

export default function CreateAgent() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [instructions, setInstructions] = useState('')
  const [knowledgebase, setKnowledgebase] = useState('')
  const [tools, setTools] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  function toggleTool(id: string) {
    setTools((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !instructions.trim() || !knowledgebase.trim()) {
      setError('Please fill in the agent name, instructions and knowledge base.')
      return
    }
    try {
      setError('')
      setIsSubmitting(true)
    const result = await createAgent({ name, knowledgebase, instructions, tools })
    console.log('Create agent result:', result)
    const responseMessage = (
      result as { response?: { data?: { message?: string } } }
    )?.response?.data?.message
    if (responseMessage) {
      setError(responseMessage)
         setIsSubmitting(false)
      return;
    }
       setIsSubmitting(false)
      navigate('/agents')
    } catch (err) {
      console.error('Create agent error:', err)
      setError('Could not create the agent. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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

      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6">
        {/* Page heading */}
        <div className="mb-8">
          <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-white text-zinc-950 shadow-[0_0_40px_rgba(255,255,255,0.08)]">
            <Bot className="size-7" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Create an agent
          </h1>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            Configure your AI agent and define what it can do.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-[#14161c]/80 p-5 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="agent-name" className="text-sm font-medium text-zinc-200">
                Agent Name
              </label>
              <input
                id="agent-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jarvis"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="agent-instructions" className="text-sm font-medium text-zinc-200">
                Instructions
              </label>
              <textarea
                id="agent-instructions"
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="You are a helpful AI assistant. Your job is to..."
                className={cn(fieldClass, 'resize-none')}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="agent-knowledgebase" className="text-sm font-medium text-zinc-200">
                Knowledge Base
              </label>
              <textarea
                id="agent-knowledgebase"
                rows={6}
                value={knowledgebase}
                onChange={(e) => setKnowledgebase(e.target.value)}
                placeholder="Facts, context or notes your agent should know..."
                className={cn(fieldClass, 'min-h-36 resize-y')}
              />
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-zinc-200">Tools</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Select the capabilities available to your agent.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {TOOLS.map((tool) => {
                  const selected = tools.includes(tool.id)
                  const Icon = tool.icon
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      role="checkbox"
                      aria-checked={selected}
                      onClick={() => toggleTool(tool.id)}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
                        selected
                          ? 'border-white/30 bg-white/[0.08]'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                      )}
                    >
                      <div
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                          selected ? 'bg-white text-zinc-950' : 'bg-white/[0.06] text-zinc-300'
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">{tool.name}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">{tool.description}</p>
                      </div>
                      <div
                        className={cn(
                          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-all',
                          selected ? 'border-white bg-white text-zinc-950' : 'border-white/20'
                        )}
                      >
                        {selected && <Check className="size-3" strokeWidth={3} />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-md transition-all hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
