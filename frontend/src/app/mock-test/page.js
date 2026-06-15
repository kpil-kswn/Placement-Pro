"use client";
import { useState } from "react";

export default function MockTestPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!file) {
      setError("Please upload your resume first.");
      return;
    }
    setLoading(true);
    setError("");
    setQuestions([]);
    
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/mock-test", {
        method: "POST",
        body: formData,
      });

      const rawData = await res.json();

      if (res.ok) {
        let finalResult = rawData;
        if(rawData.data) finalResult = rawData.data;
        else if(rawData.response) finalResult = rawData.response;

        if(typeof finalResult === "string"){
            try{
                finalResult = JSON.parse(finalResult);
            }catch(e){
                console.log("Parse error", e);
            }
        }
        if(finalResult.questions && Array.isArray(finalResult.questions)){
            setQuestions(finalResult.questions);
        } else {
            setError("Received an unexpected data format from the AI");
        }

      } else {
        let safeError = rawData.error;
        if (typeof safeError === "object") {
           safeError = Array.isArray(safeError) ? safeError[0]?.msg : JSON.stringify(safeError);
        }
        setError(safeError || "Failed to generate questions.");
      }
    } catch (error) {
      console.log(error);
      setError(error.message || "Network Error please try again..");
    } finally {
        setLoading(false);
    }
  };

  return (
    // 1. Removed max width constraints and added horizontal padding
    <main className="min-h-screen bg-gray-50 pt-28 pb-24 px-4 md:px-8 w-full">
      <div className="w-full flex flex-col gap-6">
        
        {/* Top Section: Compact Horizontal Control Bar */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 w-full">
          
          <div className="flex-shrink-0 text-center md:text-left">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Interview Prep
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Generate 30 technical questions from your resume.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto flex-grow justify-end">
            
            {/* Extremely compact file input row */}
            <div className="w-full md:w-96 relative border-2 border-dashed border-gray-300 hover:border-indigo-400 bg-gray-50 hover:bg-white rounded-xl h-12 flex items-center justify-center transition-all px-4">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="text-gray-600 text-sm font-medium truncate">
                {file ? file.name : "📄 Click or drag PDF here"}
              </span>
            </div>

            <button
              onClick={handleGenerateQuestions}
              disabled={loading}
              className={`w-full md:w-auto h-12 px-8 rounded-xl text-white font-semibold shadow-md transition-all whitespace-nowrap ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5"
              }`}
            >
              {loading ? "Analyzing..." : "Generate Questions"}
            </button>
          </div>
        </div>

        {/* Global Error Display */}
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-4 text-sm font-medium text-center w-full">
            {typeof error === "string" ? error : JSON.stringify(error)}
          </div>
        )}

        {/* Bottom Section: Full-Width Results Area */}
        {(loading || questions.length > 0) && (
          <div className="bg-gray-900 rounded-3xl p-8 md:p-10 text-white shadow-xl flex flex-col relative overflow-hidden min-h-[500px]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-500 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
            
            {loading && (
              <div className="flex-grow flex items-center justify-center z-10 animate-pulse text-indigo-300 font-medium tracking-wide text-lg h-full">
                Processing document structure and generating questions...
              </div>
            )}

            {questions.length > 0 && !loading && (
              <div className="z-10 w-full animate-fade-in flex flex-col">
                <div className="flex flex-col items-center mb-10">
                  <h3 className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-2">
                    Targeted Profile Questions
                  </h3>
                  <div className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                    Top {questions.length}
                  </div>
                </div>

                {/* Grid Layout: 1 col on mobile, 2 on tablet, 3 on wide desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {questions.map((q, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors flex flex-col h-full">
                      
                      {/* Top Row: Category Badge & Number */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-indigo-400 font-black text-xl opacity-50">
                          {(i + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                          {q.category}
                        </span>
                      </div>
                      
                      {/* Middle: The actual question */}
                      <p className="text-base text-gray-100 leading-relaxed font-medium mb-6 flex-grow">
                        {q.question}
                      </p>
                      
                      {/* Bottom: Why Asked Insight */}
                      <div className="border-t border-white/10 pt-4 mt-auto">
                        <p className="text-xs text-gray-400 leading-relaxed">
                          <span className="font-semibold text-gray-300 uppercase tracking-wide text-[10px] block mb-1">
                            Why this matters
                          </span>
                          {q.why_asked}
                        </p>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}