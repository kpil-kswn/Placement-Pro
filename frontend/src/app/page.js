"use client";
import Link from "next/link";
export default function Home() {
  return (
    <main className="flex-1 bg-gray-50 flex flex-col items-center justify-center px-6 py-12 text-center w-full">
      <div className="max-w-4xl w-full">
        <h1 className="text-6xl md:text-8xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8">
          Land your <br />
          <span className="text-gray-400">dream job.</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
          The smartest way to prepare for technical interviews. Upload your
          resume and let AI handle the rest.
        </p>

        <Link
          href="/ats"
          className="bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Start Preparing Now
        </Link>
      </div>
    </main>
  );
}
