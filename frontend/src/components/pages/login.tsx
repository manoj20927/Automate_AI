import { LoginForm } from '@/components/login-form'
import { Workflow } from 'lucide-react'

function Login() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,#2b2f3a_0%,#191b21_55%,#121317_100%)] px-4 py-12 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.35)_100%)]"
      />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.05] blur-[140px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-violet-500 text-white shadow-[0_10px_40px_rgba(139,92,246,0.3)]">
            <Workflow aria-hidden="true" size={25} />
          </div>
          <p className="mt-3 text-sm font-semibold tracking-wide text-zinc-200">
            Automate AI
          </p>
        </div>
        <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-9">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-medium text-violet-300">
              Welcome back
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Sign in to Automate AI
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Sign in to manage your workspace and keep your workflows moving.
            </p>
          </div>
          <LoginForm />
          <p className="mt-6 text-center text-xs text-zinc-500">
            Secure access to your Automate AI workspace.
          </p>
        </section>
      </div>
    </main>
  )
}

export default Login
