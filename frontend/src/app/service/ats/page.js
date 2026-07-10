"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ATSPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  
  const [history, setHistory] = useState([]); 

  useEffect(() => {
    const savedHistory = sessionStorage.getItem("ats_history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

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

        const historyItem = {
          id: Date.now(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          score: finalResult.match_score,
          jobSnippet: jobDesc,
          resultData: finalResult
        };
        
        const updateHistory = [historyItem, ...history];
        setHistory(updateHistory);
        sessionStorage.setItem("ats_history", JSON.stringify(updateHistory));
        
      } else {
        setError(rawData.error || "Something went wrong.");
      }
    } catch (error) {
      console.log(error);
      setError("Network Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item) => {
    setResult(item.resultData);
    setJobDesc(item.jobSnippet);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="flex-1 bg-gray-50 flex flex-col items-center py-12 px-6 w-full min-h-screen">
      <div className="max-w-7xl w-full flex flex-col gap-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                ATS Scanner
              </h1>
              <p className="text-gray-500 text-sm">
                Upload your resume and the target job description to reveal your match score.
              </p>
            </div>

            <div className="space-y-6 flex-1 flex flex-col">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Resume (PDF)
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition-colors text-center relative cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-gray-500 text-sm font-medium truncate">
                    {file ? file.name : "Drag & drop or click to upload PDF"}
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="w-full flex-1 min-h-[250px] border border-gray-200 rounded-2xl p-5 resize-none text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm leading-relaxed"
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
                className={`w-full py-4 rounded-xl text-white font-bold shadow-lg transition-all text-lg ${
                  loading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5"
                }`}
              >
                {loading ? "Analyzing Alignment..." : "Calculate Match Score"}
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl flex flex-col relative overflow-hidden min-h-[600px]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
            
            {!result && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center z-10 text-gray-400">
                <p className="text-5xl mb-4">🎯</p>
                <p className="font-medium text-lg">Ready for Analysis</p>
                <p className="text-sm mt-2 max-w-xs text-gray-500">
                  Your complete analysis will appear here. The layout expands naturally as the AI generates insights.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center z-10 animate-pulse text-indigo-300">
                <span className="text-4xl mb-4 animate-spin">⚙️</span>
                <span className="font-medium tracking-wide">Processing document structure...</span>
              </div>
            )}
            
            {result && !loading && (
              <div className="z-10 w-full animate-in fade-in flex flex-col">
                <div className="flex flex-col items-center mb-10 shrink-0">
                  <h3 className="text-gray-400 text-sm font-semibold tracking-widest uppercase mb-2">
                    Alignment Score
                  </h3>
                  <div className={`text-8xl font-black tracking-tighter ${result.match_score >= 80 ? 'text-emerald-400' : result.match_score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {result.match_score}%
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                      Acquired Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {result.matched_keywords && result.matched_keywords.length > 0 ? (
                        result.matched_keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide"
                          >
                            ✓ {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No exact keyword matches found.</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                      Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {(result.missing_keyword || result.missing_keywords) && (result.missing_keyword || result.missing_keywords).length > 0 ? (
                        (result.missing_keyword || result.missing_keywords).map((kw, i) => (
                          <span
                            key={i}
                            className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide"
                          >
                            ✕ {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-400 text-sm font-medium">
                          Excellent! No major keywords missing.
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
                    <h4 className="text-xs font-semibold text-indigo-300 mb-5 uppercase tracking-wider">
                      AI Improvement Strategy
                    </h4>
                    <ul className="space-y-4">
                      {result.improvement_suggestions && result.improvement_suggestions.length > 0 ? (
                        result.improvement_suggestions.map((suggestion, i) => (
                          <li
                            key={i}
                            className="flex items-start text-sm text-gray-300 leading-relaxed"
                          >
                            <span className="text-indigo-400 mr-3 mt-1 text-lg leading-none">•</span>
                            <span>{suggestion}</span>
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

        {history.length > 0 && (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm w-full mt-4">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">History</h2>
                <p className="text-gray-500 text-sm mt-1">Previous ATS Score from your current session. Click any card to view your previous ATS Score.</p>
              </div>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">{history.length} Scans</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => loadHistoryItem(item)}
                  className="p-5 border border-gray-200 rounded-2xl hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all flex flex-col group bg-gray-50 hover:bg-white"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-white px-2 py-1 rounded-md border border-gray-100">{item.time}</span>
                    <div className={`text-2xl font-black ${item.score >= 80 ? 'text-emerald-500' : item.score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {item.score}%
                    </div>
                  </div>
                  
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Job Description Snippet</h4>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed group-hover:text-indigo-700 transition-colors">
                    {item.jobSnippet.substring(0,160)+"..."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}