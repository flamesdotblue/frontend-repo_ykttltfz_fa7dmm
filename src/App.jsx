import { useState } from 'react'
import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import SceneCanvas from './components/SceneCanvas'
import Footer from './components/Footer'

function App() {
  const [theme, setTheme] = useState('day')
  const [blossoms, setBlossoms] = useState(120)

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-sky-50 to-indigo-50 text-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 w-full">
        <ControlPanel theme={theme} setTheme={setTheme} blossoms={blossoms} setBlossoms={setBlossoms} />
        <div className="max-w-6xl mx-auto px-6 py-6">
          <SceneCanvas theme={theme} blossoms={blossoms} />

          <section className="relative z-10 mt-6 grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl p-4 bg-white/80 backdrop-blur-md border border-white/60 shadow-sm">
              <h3 className="font-semibold mb-1">Pagoda</h3>
              <p className="text-sm text-gray-600">Multi-tiered roofs with gold accents and curved eaves atop a stone base.</p>
            </div>
            <div className="rounded-xl p-4 bg-white/80 backdrop-blur-md border border-white/60 shadow-sm">
              <h3 className="font-semibold mb-1">Garden</h3>
              <p className="text-sm text-gray-600">Checkerboard grass, winding stone path, lanterns and evergreen trees for contrast.</p>
            </div>
            <div className="rounded-xl p-4 bg-white/80 backdrop-blur-md border border-white/60 shadow-sm">
              <h3 className="font-semibold mb-1">Blossoms</h3>
              <p className="text-sm text-gray-600">Petals drift and respawn to keep the scene lively. Adjust density above.</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
