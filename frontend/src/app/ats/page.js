"use client";

export default function ats() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">ATS Checker</h1>
          <div className="text-sm text-gray-500">
            <p>Upload your Resume and Job Description.</p>
            <p>Get your ATS match score and insights.</p>
          </div>
        </div>
        <div className="flex flex-col w-full space-y-4">
          <input
            type="file"
            className="border border-gray-200 rounded-lg p-2 text-sm w-full"
          />
          <textarea
            className="border border-gray-200 rounded-lg p-3 w-full h-32 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Paste Job description here..."
          />
          <button className="bg-indigo-600 text-white font-semibold rounded-lg p-3 hover:bg-indigo-500 transition-colors w-full">
            Check ATS Match
          </button>
        </div>
      </div>
    </div>
  );
}
