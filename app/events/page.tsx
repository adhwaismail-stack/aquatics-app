'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EventsPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Redirecting...</p>
    </div>
  )
}