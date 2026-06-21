import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  async function handle(e: any) {
    e.preventDefault()
    try {
      await register(email, password, name)
      router.push('/dashboard')
    } catch (err) {
      alert('Register failed')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handle} className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-xl mb-4">Register</h2>
        <label className="block mb-2">Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <label className="block mb-2">Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <label className="block mb-2">Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded">Register</button>
        </div>
      </form>
    </main>
  )
}
