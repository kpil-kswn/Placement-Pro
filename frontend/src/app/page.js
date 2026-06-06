"use client"
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 pt-20 text-center">
      <div className="max-w-4xl w-full">
        
        {/* Massive Headline */}
        <h1 className="text-6xl md:text-8xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8">
          Land your <br />
          <span className="text-gray-400">dream job.</span>
        </h1>
        
        {/* Minimal Subtitle */}
        <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
          The smartest way to prepare for technical interviews. 
          Upload your resume and let AI handle the rest.
        </p>

        {/* Primary Call to Action */}
        <button className="bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
          Start Preparing Now
        </button>
        
      </div>
    </main>
  );
}