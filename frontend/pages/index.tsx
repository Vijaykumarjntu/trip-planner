import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full p-8 bg-white shadow rounded">
        <h1 className="text-3xl font-semibold mb-4">Plan your next trip with AI</h1>
        <p className="mb-6 text-gray-700">Enter destination, dates and interests — the AI will generate a day-by-day itinerary, budget estimate, and hotel suggestions.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard" className="px-4 py-3 bg-blue-600 text-white rounded text-center">Get Started</Link>
          <Link href="/register" className="px-4 py-3 bg-green-600 text-white rounded text-center">Create Account</Link>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          <strong>Tip:</strong> You can try the generator without signing up; save trips to your account after registering.
        </div>
      </div>
    </main>
  )
}
