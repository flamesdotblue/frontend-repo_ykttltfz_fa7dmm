export default function Footer() {
  return (
    <footer className="w-full z-10">
      <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-gray-500 flex items-center justify-between">
        <p>
          Tip: drag to orbit, scroll to zoom, right-drag to pan. Toggle day/night and blossom density above.
        </p>
        <p className="hidden sm:block">Crafted in real time with procedural voxels.</p>
      </div>
    </footer>
  )
}
