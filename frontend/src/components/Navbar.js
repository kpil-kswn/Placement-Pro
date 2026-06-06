"use client"
export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo area */}
        <div className="text-2xl font-bold tracking-tighter text-gray-900">
          Placement Pro.
        </div>
        
        {/* Action Button */}
        <div>
          <button className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}