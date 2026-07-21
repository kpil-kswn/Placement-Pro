"use client";
import Link from "next/link";
import { useState } from "react";
import AuthModal from "./AuthModal";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const [isAuthModelOpen, setIsAuthModelOpen] = useState(false);
  const { data: session, status } = useSession();
  return (
    <nav className="sticky top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center justify-start">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tighter text-gray-900"
          >
            PlacementPro
          </Link>
        </div>

        <div className="flex items-center gap-8 font-bold">
          <Link href="/service/ats">ATS</Link>
          <Link href="/service/chat">Chat With AI</Link>
          <Link href="/service/mock-test">MockTest</Link>
          <Link href="/placement">AI Interview</Link>

          {status === "unauthenticated" && (
            <button
              onClick={() => setIsAuthModelOpen(true)}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors"
            >
              Login
            </button>
          )}

          {status === "authenticated" && (
            <Link href="/service/profile" className="flex items-center justify-center w-11 h-11 rounded-full border-2 border-indigo-100 hover:border-indigo-400 focus:outline-none transition-all shadow-sm overflow-hidden bg-gray-100 hover:scale-105">
              {session.user.image? (
                <img src={session.user.image} alt="Profile" className="w-full h-full object-cover"/>
              ):(
                <span className="text-gray-500 text-xl uppercase font-bold">{session.user?.email?.[0]}</span>
              )}
            </Link>
          )}
          <AuthModal
            isOpen={isAuthModelOpen}
            onClose={() => setIsAuthModelOpen(false)}
          />
        </div>
      </div>
    </nav>
  );
}
