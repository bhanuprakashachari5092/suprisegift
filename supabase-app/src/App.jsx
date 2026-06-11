import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <h1>Vite + React + Supabase</h1>
      <div className="card">
        <p>
          {session ? `Logged in as: ${session.user.email}` : 'Not logged in. Check your Supabase connection and add your credentials to .env.local!'}
        </p>
      </div>
    </>
  )
}

export default App
