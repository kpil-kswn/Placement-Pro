"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PlacementResultsDashboard() {
  const { pipelineId } = useParams();
  const router = useRouter();

  const [report, setReport] = useState(null);
  const [pipelineData, setPipelineData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const enforceRouteSecurity = async () => {
      try {
        const res = await fetch(`/api/placement/${pipelineId}/status`);
        const data = await res.json();
        
        if (data.global_status !== "COMPLETED") {
            alert("You haven't completed the assessment yet!");
            router.push(`/placement`); 
        }
      } catch (error) {
        console.error("Status check failed", error);
      }
    };
    enforceRouteSecurity();
  }, [pipelineId, router]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/placement/${pipelineId}/results`);
        const data = await res.json();
        
        if (data.status === "success") {
          setReport(data.report);
          setPipelineData(data.pipeline_data);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error(error);
        alert("Failed to load your report. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [pipelineId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center text-white">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🧠</div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Generating Your Readiness Report</h2>
        <p className="text-gray-400">Our AI is analyzing your code, MCQ scores, and interview transcript...</p>
      </div>
    );
  }

  if (!report) return null;

  const aptechScore = pipelineData?.aptech_round?.evaluation?.score_percentage || 0;
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER / HERO */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-slate-900 px-8 py-10 text-center relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"></div>
            <h1 className="text-3xl font-extrabold text-white mb-2">Final AI Placement Report</h1>
            <p className="text-gray-400">Comprehensive Evaluation & Career Feedback</p>
          </div>
          
          <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Status</h2>
              <div className="text-4xl font-black text-slate-900 mb-4">{report.readiness_level}</div>
              <p className="text-gray-600 leading-relaxed text-lg">{report.executive_summary}</p>
            </div>
            
            {/* SCORE CIRCLE */}
            <div className="shrink-0 flex flex-col items-center justify-center w-48 h-48 rounded-full border-8 border-gray-100 relative">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="88" cy="88" r="80" fill="none" stroke="#f3f4f6" strokeWidth="16" />
                <circle 
                  cx="88" cy="88" r="80" 
                  fill="none" 
                  stroke={report.overall_score_out_of_100 >= 80 ? '#22c55e' : report.overall_score_out_of_100 >= 50 ? '#eab308' : '#ef4444'} 
                  strokeWidth="16" 
                  strokeDasharray="502" 
                  strokeDashoffset={502 - (502 * report.overall_score_out_of_100) / 100}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="text-5xl font-black text-slate-900 relative z-10">{report.overall_score_out_of_100}</span>
              <span className="text-sm font-bold text-gray-400 relative z-10 mt-1">/ 100</span>
            </div>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-3">📝</span>
            <h3 className="font-bold text-gray-900">Aptitude Score</h3>
            <p className="text-3xl font-black text-blue-600 mt-2">{aptechScore}%</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-3">💻</span>
            <h3 className="font-bold text-gray-900">Coding Challenges</h3>
            <p className="text-gray-600 mt-2 text-sm">Graded based on Edge Cases & Complexity</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-3">🎙️</span>
            <h3 className="font-bold text-gray-900">Voice Interview</h3>
            <p className="text-gray-600 mt-2 text-sm">Graded on Communication & Depth</p>
          </div>
        </div>

        {/* FEEDBACK GRID */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* STRENGTHS */}
          <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
            <h3 className="text-xl font-bold text-green-900 mb-6 flex items-center gap-3">
              <span className="p-2 bg-green-200 rounded-lg">🚀</span> Top Strengths
            </h3>
            <ul className="space-y-4">
              {report.top_strengths.map((strength, idx) => (
                <li key={idx} className="flex gap-3 text-green-800">
                  <span className="font-bold text-green-600">✓</span>
                  <span className="leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* WEAKNESSES */}
          <div className="bg-amber-50 rounded-2xl p-8 border border-amber-100">
            <h3 className="text-xl font-bold text-amber-900 mb-6 flex items-center gap-3">
              <span className="p-2 bg-amber-200 rounded-lg">⚠️</span> Areas for Improvement
            </h3>
            <ul className="space-y-4">
              {report.key_weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex gap-3 text-amber-800">
                  <span className="font-bold text-amber-600">↳</span>
                  <span className="leading-relaxed">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ACTION PLAN */}
        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl text-white">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400">🗺️</span> Recommended Action Plan
          </h3>
          <div className="space-y-6">
            {report.action_plan.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <p className="text-gray-300 leading-relaxed pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-8">
          <button 
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg font-bold transition-all shadow-sm"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}