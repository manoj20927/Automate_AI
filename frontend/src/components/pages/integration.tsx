import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Camera, Check, Loader2, Mail, Workflow } from 'lucide-react'

import {
  connectInstagram,
  disconnectIntegration,
  getGoogleConnectUrl,
  getIntegrations,
} from '@/components/feature/integration'

const buttonClass =
  'flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition-all hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60'
const disconnectClass =
  'shrink-0 cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white'

function ConnectedBadge() {
  return (
    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
      <Check className="size-3" />
      Connected
    </span>
  )
}

export default function Integration() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [connected, setConnected] = useState({ google: false, instagram: false })
  const [isLoading, setIsLoading] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [instagramToken, setInstagramToken] = useState('')
  const [error, setError] = useState(
    searchParams.get('error') === 'google' ? 'Could not connect Google. Please try again.' : ''
  )

  useEffect(() => {
    getIntegrations()
      .then(setConnected)
      .catch((err) => {
        console.error('Fetch integrations error:', err)
        setError('Could not load your integrations. Please try again.')
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function handleConnectGoogle() {
    try {
      setError('')
      setIsBusy(true)
      window.location.href = await getGoogleConnectUrl()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not connect Google. Please try again.')
      setIsBusy(false)
    }
  }

  async function handleConnectInstagram(e: FormEvent) {
    e.preventDefault()
    if (!instagramToken.trim()) return
    try {
      setError('')
      setIsBusy(true)
      await connectInstagram(instagramToken)
      setInstagramToken('')
      setConnected((prev) => ({ ...prev, instagram: true }))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not connect Instagram. Please try again.')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleDisconnect(provider: 'google' | 'instagram') {
    try {
      setError('')
      setIsBusy(true)
      await disconnectIntegration(provider)
      setConnected((prev) => ({ ...prev, [provider]: false }))
    } catch (err) {
      console.error('Disconnect error:', err)
      setError('Could not disconnect. Please try again.')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#0a0c10] text-white">
      {/* Subtle radial ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,#1e222d_0%,#0f1117_50%,#090a0f_100%)]"
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
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Integrations</h1>
        <p className="mt-2 text-sm text-zinc-400 sm:text-base">
          Connect your accounts so your agents can act for you. Every action asks for your approval first.
        </p>

        {error && (
          <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-zinc-400">
            <Loader2 className="size-4 animate-spin" />
            <span>Loading integrations...</span>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {/* Google */}
            <section className="rounded-3xl border border-white/10 bg-[#14161c]/80 p-5 shadow-xl backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-950">
                    <Mail className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-white">Google</h2>
                    <p className="flex items-center gap-1.5 text-sm text-zinc-500">
                      <Calendar className="size-3.5 shrink-0" />
                      Send Gmail and create Calendar events
                    </p>
                  </div>
                </div>
                {connected.google ? (
                  <ConnectedBadge />
                ) : (
                  <button type="button" disabled={isBusy} onClick={handleConnectGoogle} className={buttonClass}>
                    Connect
                  </button>
                )}
              </div>
              {connected.google && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleDisconnect('google')}
                    className={disconnectClass}
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </section>

            {/* Instagram */}
            <section className="rounded-3xl border border-white/10 bg-[#14161c]/80 p-5 shadow-xl backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-950">
                    <Camera className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-white">Instagram</h2>
                    <p className="text-sm text-zinc-500">Publish image posts (business or creator account)</p>
                  </div>
                </div>
                {connected.instagram && <ConnectedBadge />}
              </div>

              {connected.instagram ? (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleDisconnect('instagram')}
                    className={disconnectClass}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConnectInstagram} className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="password"
                    value={instagramToken}
                    onChange={(e) => setInstagramToken(e.target.value)}
                    placeholder="Instagram access token"
                    autoComplete="off"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10"
                  />
                  <button type="submit" disabled={isBusy || !instagramToken.trim()} className={buttonClass}>
                    Connect
                  </button>
                </form>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
