'use client'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-xl text-gray-900">AquaRef</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome to AquaRef! 🎉
        </h1>
        <p className="text-gray-500 text-lg">
          You are successfully logged in.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Your subscriber dashboard is coming soon.
        </p>
      </div>
    </div>
  )
}