import { useState } from 'react'
import { apiClient } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/router'

export default function TripCard({ trip, onUpdate }: any) {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [hotelOpen, setHotelOpen] = useState(false)
  const [hotelList, setHotelList] = useState<any[]>(trip.hotels || [])

  async function addActivity(day: number) {
    if (!trip._id) { alert('Save the trip first to edit'); return }
    const activity = window.prompt('New activity')
    if (!activity) return
    setLoading(true)
    try {
      const api = apiClient(token || undefined)
      const res = await api.post(`/trips/${trip._id}/activity`, { day, activity })
      onUpdate && onUpdate(res.data.trip)
    } catch (err) { console.error(err); alert('Failed') } finally { setLoading(false) }
  }

  async function removeActivity(day: number, index: number) {
    if (!trip._id) { alert('Save the trip first to edit'); return }
    if (!confirm('Remove activity?')) return
    setLoading(true)
    try {
      const api = apiClient(token || undefined)
      const res = await api.delete(`/trips/${trip._id}/activity`, { data: { day, index } })
      onUpdate && onUpdate(res.data.trip)
    } catch (err) { console.error(err); alert('Failed') } finally { setLoading(false) }
  }

  async function regenerate(day: number) {
    if (!trip._id) { alert('Save the trip first to regenerate a day'); return }
    const focus = window.prompt('Regenerate focus (e.g. outdoor, food)') || ''
    setLoading(true)
    try {
      const api = apiClient(token || undefined)
      const res = await api.patch(`/trips/${trip._id}/day/${day}/regenerate`, { focus })
      onUpdate && onUpdate(res.data.trip)
    } catch (err) { console.error(err); alert('Failed') } finally { setLoading(false) }
  }

  async function fetchHotels() {
    if (!trip._id) { alert('Save the trip first to get hotel suggestions'); return }
    setLoading(true)
    try {
      const api = apiClient(token || undefined)
      const res = await api.get(`/trips/${trip._id}/hotels`)
      setHotelList(res.data.hotels || [])
      setHotelOpen(true)
    } catch (err) { console.error(err); alert('Failed') } finally { setLoading(false) }
  }

  async function saveTrip() {
    if (!token) { router.push('/login'); return }
    setLoading(true)
    try {
      const api = apiClient(token)
      const payload = { destination: trip.destination, days: trip.days, budgetType: trip.budgetType || 'Medium', interests: trip.interests || [] }
      const res = await api.post('/trips', payload)
      onUpdate && onUpdate(res.data.trip)
    } catch (err) { console.error(err); alert('Save failed') } finally { setLoading(false) }
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">{trip.destination} — {trip.days} days</div>
          <div className="text-sm text-gray-600">Estimated: ${trip.estimatedBudget}</div>
        </div>
        <div className="flex gap-2">
            {!trip._id ? (
              <button onClick={saveTrip} className="px-3 py-1 bg-indigo-600 text-white rounded">Save</button>
            ) : null}
            <button onClick={()=>fetchHotels()} className="px-3 py-1 bg-yellow-500 rounded flex items-center gap-2">{loading ? <span className="spinner"/> : null}Hotels</button>
          </div>
      </div>

      <div className="mt-3 space-y-3">
        {(trip.itinerary || []).map((d: any) => (
          <div key={d.day} className="border p-2 rounded">
            <div className="font-medium">Day {d.day}</div>
            <ul className="list-disc ml-5">
              {d.activities?.map((a: string, idx: number) => (
                <li key={idx} className="flex justify-between items-center">
                  <span>{a}</span>
                  {trip._id ? (
                    <div className="flex gap-1">
                      <button onClick={()=>removeActivity(d.day, idx)} className="text-red-600 text-sm">Remove</button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2">
              {trip._id ? (
                <>
                  <button onClick={()=>addActivity(d.day)} className="px-2 py-1 bg-blue-600 text-white rounded">Add</button>
                  <button onClick={()=>regenerate(d.day)} className="px-2 py-1 bg-green-600 text-white rounded">Regenerate</button>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {/* Budget breakdown */}
      <div className="mt-4">
        {trip.budgetBreakdown ? (
          <div className="p-3 bg-gray-50 rounded">
            <div className="font-medium">Estimated Budget</div>
            <div className="text-sm">Flights: ${trip.budgetBreakdown.flights}</div>
            <div className="text-sm">Accommodation: ${trip.budgetBreakdown.accommodation}</div>
            <div className="text-sm">Food: ${trip.budgetBreakdown.food}</div>
            <div className="text-sm">Activities: ${trip.budgetBreakdown.activities}</div>
            <div className="font-semibold mt-1">Total: ${trip.budgetBreakdown.totalEstimatedBudget}</div>
          </div>
        ) : trip.estimatedBudget ? (
          <div className="p-3 bg-gray-50 rounded">Estimated Total: ${trip.estimatedBudget}</div>
        ) : null}
      </div>

      {/* Hotel modal */}
      {hotelOpen ? (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded max-w-lg w-full p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">Recommended Hotels</div>
              <button onClick={()=>setHotelOpen(false)} className="text-gray-600">Close</button>
            </div>
            <ul className="list-disc ml-5">
              {hotelList.map((h:any, i:number) => (
                <li key={i} className="mb-1">{h.name} — {h.tier}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}
