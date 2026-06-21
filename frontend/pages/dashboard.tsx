import { useState, useEffect } from 'react'
import TripForm from '../components/TripForm'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api'
import TripCard from '../components/TripCard'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [trips, setTrips] = useState<any[]>([])
  const { token, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      if (!token) {
        router.push('/login')
        return
      }
      try {
        const api = apiClient(token)
        const res = await api.get('/trips')
        setTrips(res.data)
      } catch (err) { console.error(err) }
    }
    load()
  }, [token])

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create a Trip</h2>
          {token ? <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button> : null}
        </div>

        <TripForm onGenerated={(data) => setTrips([data, ...trips])} />

        <h3 className="mt-8 text-lg font-semibold">Trips</h3>
        <div className="mt-4 space-y-4">
          {trips.map((t) => (
            <TripCard key={t._id || `${t.destination}-${t.days}`} trip={t} onUpdate={(updated:any)=>{
                setTrips(prev => {
                  const exists = prev.find(p => p._id === updated._id)
                  if (exists) return prev.map(p=>p._id===updated._id?updated:p)
                  return [updated, ...prev]
                })
              }} />
          ))}
        </div>
      </div>
    </main>
  )
}
