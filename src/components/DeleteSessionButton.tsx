'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1 rounded-md font-medium transition-colors"
        >
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); setConfirming(true) }}
      className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
