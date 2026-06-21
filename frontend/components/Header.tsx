import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'

export default function Header(){
  const { token, logout } = useAuth()
  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">AI Travel Planner</Link>
        <nav className="flex items-center gap-3">
          <Link href="/dashboard" className="px-3 py-1 rounded hover:bg-gray-100">Dashboard</Link>
          {token ? (
            <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1 bg-blue-600 text-white rounded">Login</Link>
              <Link href="/register" className="px-3 py-1 bg-green-600 text-white rounded">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
