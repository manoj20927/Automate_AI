import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUp,
  Bot,
  Check,
  ChevronDown,
  ImagePlus,
  Loader2,
  LogOut,
  Plus,
  Settings2,
  Workflow,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logoutUser } from '@/components/feature/auth'
import { setUserData } from '@/components/redux/userSlice'
import { getAllAgents } from '../feature/agents'
import { setAgents, setAgentsLoading, setSelectedAgent } from '../redux/agentSlice'
import { chat } from '../feature/chat'

interface UserInfo {
  _id?: string
  name?: string
  email?: string
  profileImage?: string
  profilePicture?: string
  user?: UserInfo
}

interface Message {
  role: 'human' | 'ai'
  content: string
  isError?: boolean
}

interface ReduxState {
  user: {
    userData: UserInfo | null
  }
}

export default function Home() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const rawUserData = useSelector((state: ReduxState) => state.user.userData)
  const user = rawUserData?.user || rawUserData
const {agents,selectedAgent} = useSelector((state: any) => state.agent)
  // selectedAgent holds the agent's _id; an empty value means normal chat
  const currentAgent = agents?.find((a: { _id: string }) => a._id === selectedAgent)
  const displayName = user?.name || 'Ayush Sahu'
  const email = user?.email || 'ayushsahu27062004@gmail.com'

  const profileImg =
    user?.profileImage &&
    user.profileImage !==
      'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
      ? user.profileImage
      : user?.profilePicture &&
        user.profilePicture !==
          'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
      ? user.profilePicture
      : null

  const initial = displayName.trim().charAt(0).toUpperCase() || 'A'
  const fetchAgents = async () => {
    dispatch(setAgentsLoading(true))
    try {
     
      const data = await getAllAgents()
      dispatch(setAgents(data))
    dispatch(setAgentsLoading(false))
    } catch (err) {
      console.error('Fetch agents error:', err)
      dispatch(setAgentsLoading(false))
    } finally {
dispatch(setAgentsLoading(false))
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  // Grow the textarea with its content, up to a max height
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [input])

  async function handleSend(e?: FormEvent) {
    e?.preventDefault()
    const message = input.trim()
    if (!message || isSending) return

    setMessages((prev) => [...prev, { role: 'human', content: message }])
    setInput('')
    setIsSending(true)
    try {
      const reply = await chat({ message, agentId: currentAgent?._id })
      setMessages((prev) => [
        ...prev,
        reply
          ? { role: 'ai', content: String(reply) }
          : { role: 'ai', content: 'Something went wrong. Please try again.', isError: true },
      ])
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleLogout() {
    try {
      setIsLoggingOut(true)
      await logoutUser()
      dispatch(setUserData(null))
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-[#0a0c10] text-white">
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
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3 select-none">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white text-zinc-950 shadow-md transition-transform hover:scale-105">
            <Workflow className="size-5" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white sm:text-lg">
            Automate AI
          </span>
        </div>

        {/* Right: Actions (Agents Dropdown + Profile Dropdown) */}
        <div className="flex items-center gap-2.5">
          {/* 1. Agents / Workflow Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              aria-label="Open agents menu"
              className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-300 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            >
              <Workflow className="size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              side="bottom"
              sideOffset={8}
              className="w-56 rounded-2xl border border-white/10 bg-[#181a20]/95 p-1.5 text-white shadow-2xl backdrop-blur-xl ring-0"
            >
              <DropdownMenuItem
                onClick={() => navigate('/agents')}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
              >
                <Bot className="size-4 text-violet-400" />
                <span>My Agents</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 h-px bg-white/10" />

              <DropdownMenuItem
                onClick={() => navigate('/agents/new')}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
              >
                <Plus className="size-4 text-emerald-400" />
                <span>Create New Agent</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 h-px bg-white/10" />

              <DropdownMenuItem
                onClick={() => navigate('/integrations')}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
              >
                <Settings2 className="size-4 text-sky-400" />
                <span>Integration</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 2. User Profile Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              aria-label="Open profile menu"
              className="flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.05] transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            >
              {!imageError && profileImg ? (
                <img
                  src={profileImg}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="size-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-[#ea580c] text-sm font-semibold text-white select-none">
                  {initial}
                </div>
              )}
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              side="bottom"
              sideOffset={8}
              className="w-64 rounded-2xl border border-white/10 bg-[#181a20]/95 p-3 text-white shadow-2xl backdrop-blur-xl ring-0"
            >
              {/* User Name and Email */}
              <div className="px-1.5 py-1">
                <p className="text-[15px] font-semibold tracking-tight text-white leading-tight">
                  {displayName}
                </p>
                <p className="mt-1 truncate text-xs font-normal text-zinc-400">
                  {email}
                </p>
              </div>

              {/* Separator */}
              <DropdownMenuSeparator className="my-2.5 h-px bg-white/10" />

              {/* Logout Button */}
              <DropdownMenuItem
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/20 hover:text-rose-300 focus:bg-rose-500/20 focus:text-rose-300 disabled:pointer-events-none disabled:opacity-50"
              >
                <LogOut className="size-4" />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Body Canvas */}
      <main className="relative z-10 flex min-h-0 flex-1 flex-col">
        {/* Messages */}
        <section className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center pt-[14vh] text-center">
                <div className="relative mb-6 flex items-center justify-center">
                  <div className="absolute size-20 rounded-full bg-violet-500/20 blur-2xl" />
                  <div className="relative flex size-14 items-center justify-center rounded-2xl bg-white text-zinc-950 shadow-lg">
                    <Workflow className="size-7" />
                  </div>
                </div>
                <p className="text-base font-medium text-violet-300">Hi, {displayName}</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Can I help you with anything?
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
                  {currentAgent
                    ? `You're chatting with ${currentAgent.name}. Ask questions or automate tasks.`
                    : 'Ask questions, automate tasks, or upload an image to prepare an Instagram post.'}
                </p>
              </div>
            )}

            {messages.map((msg, i) =>
              msg.role === 'human' ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm leading-relaxed text-white sm:max-w-[75%]">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-950 shadow-md">
                    <Workflow className="size-4" />
                  </div>
                  <div
                    className={
                      msg.isError
                        ? 'min-w-0 flex-1 whitespace-pre-wrap break-words pt-1.5 text-sm leading-relaxed text-rose-300'
                        : 'min-w-0 flex-1 whitespace-pre-wrap break-words pt-1.5 text-sm leading-relaxed text-zinc-200'
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              )
            )}

            {isSending && (
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-950 shadow-md">
                  <Workflow className="size-4" />
                </div>
                <div className="flex items-center gap-1 pt-3">
                  <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-zinc-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </section>

        {/* Composer */}
        <div className="px-4 pb-5 pt-2 sm:px-6">
          <form
            onSubmit={handleSend}
            className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-[#14161c]/90 p-4 shadow-2xl backdrop-blur-xl transition-colors focus-within:border-white/20"
          >
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="max-h-[200px] min-h-14 w-full resize-none bg-transparent px-2 py-1.5 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none"
            />

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  aria-label="Upload image"
                  title="Upload image"
                  className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ImagePlus className="size-5" />
                </button>

                {/* Agent picker */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    type="button"
                    className="flex h-9 min-w-0 max-w-56 cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                  >
                    <Bot size={16} className="shrink-0" />
                    <span className="truncate">{currentAgent?.name || 'Agent Not Selected'}</span>
                    <ChevronDown size={16} className="shrink-0 text-zinc-400" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="start"
                    side="top"
                    sideOffset={10}
                    className="w-64 rounded-2xl border border-white/10 bg-[#1c1e25]/95 p-1.5 text-white shadow-2xl backdrop-blur-xl ring-0"
                  >
                    {agents?.map((agent: { _id: string; name: string }) => (
                      <DropdownMenuItem
                        key={agent._id}
                        // Clicking the selected agent again clears it and goes back to normal chat
                        onClick={() =>
                          dispatch(setSelectedAgent(selectedAgent === agent._id ? '' : agent._id))
                        }
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
                      >
                        <Bot className="size-4 shrink-0 text-violet-400" />
                        <span className="flex-1 truncate">{agent.name}</span>
                        {selectedAgent === agent._id && <Check className="size-4 shrink-0 text-violet-300" />}
                      </DropdownMenuItem>
                    ))}

                    {agents?.length > 0 && <DropdownMenuSeparator className="my-1 h-px bg-white/10" />}

                    <DropdownMenuItem
                      onClick={() => navigate('/agents/new')}
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
                    >
                      <Plus className="size-4 shrink-0" />
                      <span>Create New Agent</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <button
                type="submit"
                aria-label="Send message"
                disabled={!input.trim() || isSending}
                className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-zinc-950 shadow-md transition-all hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-5" />}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
