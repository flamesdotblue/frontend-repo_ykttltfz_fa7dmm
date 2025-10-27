import { useEffect, useState } from 'react'
import { Sun, Moon, Flower2 } from 'lucide-react'

export default function ControlPanel({ theme, setTheme, blossoms, setBlossoms }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="relative z-10">
      <div className="max-w-6xl mx-auto px-6 pt-4">
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-md border border-white/60 p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme('day')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                theme === 'day' ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Sun size={16} /> Day
            </button>
            <button
              onClick={() => setTheme('night')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                theme === 'night' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Moon size={16} /> Night
            </button>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <Flower2 className="text-pink-600" size={18} />
            <label className="text-sm text-gray-600">Blossoms</label>
            <input
              type="range"
              min="0"
              max="200"
              value={blossoms}
              onChange={(e) => setBlossoms(parseInt(e.target.value))}
              className="w-40 accent-pink-500"
            />
            <span className="text-sm text-gray-600 tabular-nums w-10 text-right">{mounted ? blossoms : 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
