"use client";

import { useState } from "react";

export default function ATSPage() {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file || !jobDesc) {
      setError("Please provide both a resume and a job description.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_description", jobDesc);

    try {
      const res = await fetch("/api/ats", {
        method: "POST",
        body: formData,
      });

      const rawData = await res.json();

      if (res.ok) {
        let finalResult = rawData;
        if (rawData.data) finalResult = rawData.data;
        else if (rawData.response) finalResult = rawData.response;

        if (typeof finalResult === "string") {
          try {
            finalResult = JSON.parse(finalResult);
          } catch (e) {
            console.error("Failed to parse AI string into JSON", e);
          }
        }
        setResult(finalResult);
        setLoading(false);
      } else {
        setError(rawData.error || "Something went wrong.");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setError("Network Error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-gray-50 flex justify-center py-8 px-6 w-full">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 h-[750px]">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              ATS Scanner
            </h1>
            <p className="text-gray-500 text-sm">
              Upload your resume and the target job description to reveal your
              match score.
            </p>
          </div>

          <div className="space-y-6 grow">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Resume (PDF)
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition-colors text-center relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-gray-500 text-sm font-medium">
                  {file ? file.name : "Drag & drop or click to upload PDF"}
                </div>
              </div>
            </div>

            <div className="grow flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                className="w-full grow border border-gray-200 rounded-2xl p-4 resize-none text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm min-h-[150px]"
                placeholder="Paste the requirements from the job posting here..."
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm font-medium px-2">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-semibold shadow-lg transition-all ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5"
              }`}
            >
              {loading ? "Analyzing Alignment..." : "Calculate Match Score"}
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl flex flex-col relative overflow-hidden h-full">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
          {!result && !loading && (
            <div className="grow flex flex-col items-center justify-center text-center z-10 text-gray-400">
              <p className="font-medium">Waiting for input...</p>
              <p className="text-sm mt-2">
                Your complete analysis will appear here.
              </p>
            </div>
          )}

          {loading && (
            <div className="grow flex items-center justify-center z-10 animate-pulse text-indigo-300 font-medium tracking-wide">
              Processing document structure...
            </div>
          )}
          {result && !loading && (
            <div className="z-10 w-full animate-fade-in flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex flex-col items-center mb-8 shrink-0">
                <h3 className="text-gray-400 text-sm font-semibold tracking-widest uppercase mb-2">
                  Alignment Score
                </h3>
                <div className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-white to-gray-400">
                  {result.match_score}%
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                    Acquired Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.matched_keywords &&
                    result.matched_keywords.length > 0 ? (
                      result.matched_keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-xs font-medium"
                        >
                          ✓ {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">
                        No exact keyword matches found.
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                    Missing Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(result.missing_keyword || result.missing_keywords) &&
                    (result.missing_keyword || result.missing_keywords).length >
                      0 ? (
                      (result.missing_keyword || result.missing_keywords).map(
                        (kw, i) => (
                          <span
                            key={i}
                            className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-md text-xs font-medium"
                          >
                            ✕ {kw}
                          </span>
                        ),
                      )
                    ) : (
                      <span className="text-emerald-400 text-sm font-medium">
                        Excellent! No major keywords missing.
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
                  <h4 className="text-xs font-semibold text-indigo-300 mb-4 uppercase tracking-wider">
                    AI Improvement Strategy
                  </h4>
                  <ul className="space-y-3">
                    {result.improvement_suggestions &&
                    result.improvement_suggestions.length > 0 ? (
                      result.improvement_suggestions.map((suggestion, i) => (
                        <li
                          key={i}
                          className="flex items-start text-sm text-gray-300 leading-relaxed"
                        >
                          <span className="text-indigo-400 mr-3 mt-0.5">•</span>
                          {suggestion}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400 text-sm">
                        Your resume structure looks solid.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
