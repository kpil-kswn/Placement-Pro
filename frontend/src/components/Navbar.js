"use client";
import Logo from "./Logo.js";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center justify-start">
          {/* <Logo className="w-25" /> */}
          <Link href="/" className="text-2xl font-bold tracking-tighter text-gray-900">
            PlacementPro
          </Link>
        </div>

        <div className="flex items-center gap-8 font-bold">
          <Link href="/ats">ATS</Link>
          <Link href="/chat">Chat With AI</Link>
          <Link href="/mock-test">MockTest</Link>
          <Link href="/interview">AI Interview</Link>
          <button className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}
