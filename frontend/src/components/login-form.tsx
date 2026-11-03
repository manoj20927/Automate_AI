import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { FcGoogle } from 'react-icons/fc'

import { auth, googleProvider } from '@/firebase'
import { login } from '@/components/feature/auth'
import { useDispatch } from 'react-redux'
import { setUserData } from '@/components/redux/userSlice'
export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
const dispatch = useDispatch()
  async function handleGoogleLogin() {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const token = await result.user.getIdToken()
      const data = await login(token)
      dispatch(setUserData(data.user || data))
      console.log(data)

    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to sign in with Google. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FcGoogle aria-hidden="true" className="size-5" />
        {isLoading ? 'Connecting…' : 'Continue with Google'}
      </button>
      {errorMessage && (
        <p role="alert" className="mt-4 text-center text-sm text-rose-300">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
