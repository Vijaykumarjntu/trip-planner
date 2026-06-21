  import { useState } from 'react'
  import { useAuth } from '../contexts/AuthContext'
  import { apiClient } from '../lib/api'

  type Props = {
    onGenerated?: (trip: any) => void
  }

  export default function TripForm({ onGenerated }: Props) {
    const [destination, setDestination] = useState('')
    const [days, setDays] = useState(3)
    const [budgetType, setBudgetType] = useState<'Low'|'Medium'|'High'>('Medium')
    const [interests, setInterests] = useState('Food, Culture')
    const [loading, setLoading] = useState(false)
    const { token } = useAuth()
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: any) {
      e.preventDefault()
      setError(null)
      if (!destination.trim()) { setError('Destination is required'); return }
      if (!days || days < 1) { setError('Days must be at least 1'); return }
      setLoading(true)
      const payload = { destination, days, budgetType, interests: interests.split(',').map(s => s.trim()) }
      try {
        if (token) {
          const api = apiClient(token)
          const res = await api.post('/trips', payload)
          // res.data contains { trip, generated }
          onGenerated && onGenerated({ destination, days, ...res.data.generated, _id: res.data.trip._id, estimatedBudget: res.data.trip.estimatedBudget })
        } else {
          // public quick generate
          const api = apiClient()
          const res = await api.post('/trips/generate', payload)
          const est = res.data?.budgetBreakdown?.totalEstimatedBudget
          onGenerated && onGenerated({ destination, days, ...res.data, estimatedBudget: est })
        }
      } catch (err) {
        console.error(err)
        setError('Failed to generate. Try again later.')
      } finally {
        setLoading(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block mb-2">Destination</label>
            <input aria-label="destination" value={destination} onChange={e=>setDestination(e.target.value)} className="w-full p-2 border rounded mb-3" />
          </div>

          <div>
            <label className="block mb-2">Days</label>
            <input aria-label="days" type="number" value={days} onChange={e=>setDays(Number(e.target.value))} className="w-full p-2 border rounded mb-3" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block mb-2">Budget Type</label>
            <select aria-label="budget" value={budgetType} onChange={e=>setBudgetType(e.target.value as any)} className="w-full p-2 border rounded mb-3">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2">Interests (comma separated)</label>
            <input aria-label="interests" value={interests} onChange={e=>setInterests(e.target.value)} className="w-full p-2 border rounded mb-3" />
          </div>
        </div>

        {error ? <div role="alert" className="mb-3 text-red-600">{error}</div> : null}

        <div className="flex items-center gap-3">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2" disabled={loading} aria-busy={loading}>
            {loading ? <span className="spinner" /> : null}
            <span>{loading ? 'Generating...' : 'Generate Itinerary'}</span>
          </button>
          <button type="button" onClick={()=>{ setDestination(''); setDays(3); setInterests('Food, Culture'); setBudgetType('Medium'); setError(null); }} className="px-3 py-2 bg-gray-100 rounded">Reset</button>
        </div>
      </form>
    )
  }
