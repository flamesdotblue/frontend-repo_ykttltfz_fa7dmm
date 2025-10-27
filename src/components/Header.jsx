import { Sakura, Palette } from 'lucide-react'

export default function Header() {
  return (
    <header className="w-full z-10">
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-400 to-fuchsia-600 flex items-center justify-center shadow-md">
              <Sakura className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-800">
                Voxel Pagoda Garden
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Hand-crafted voxels, blossoms, and winding roofs
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-gray-600 text-sm">
            <Palette size={16} />
            <span>Colorful voxels</span>
          </div>
        </div>
      </div>
    </header>
  )
}
