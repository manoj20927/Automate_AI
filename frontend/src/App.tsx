import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

import Login from '@/components/pages/login'
import Home from '@/components/pages/home'
import Agents from '@/components/pages/agents'
import CreateAgent from '@/components/pages/createagent'
import Integration from '@/components/pages/integration'
import { me } from '@/components/feature/auth'
import { setUserData } from '@/components/redux/userSlice'
import { Workflow } from 'lucide-react'
import { chat } from './components/feature/chat'

function App() {
  const dispatch = useDispatch()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await me()
  
        if (data?.user) {
          dispatch(setUserData(data.user || data))
        }
      } catch (error) {
        console.log('Not authenticated:', error)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    fetchUser()
  }, [dispatch])

  const { userData } = useSelector<
    { user: { userData: unknown } },
    { userData: unknown }
  >((state) => state.user)

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0a0c10] text-white">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-zinc-950 shadow-lg">
            <Workflow className="size-6" />
          </div>
          <span className="text-sm font-medium text-zinc-400">Loading Automate AI...</span>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={userData ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/agents"
          element={userData ? <Agents /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/agents/new"
          element={userData ? <CreateAgent /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/integrations"
          element={userData ? <Integration /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App