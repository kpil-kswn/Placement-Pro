"use client";
import { useState,useEffect } from "react";
import { Editor } from "@monaco-editor/react";

export default function Codingtest() {
  const [problemData, setProblemData] = useState(null);
  const [userCode,setUserCode] = useState("")
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    const fetchProblem = async()=>{
        try{
            const res = await fetch('/api/interview/coding/generate',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({resume_test:"Data structure and algorithams"})
            });
            const data = await res.json();
            setProblemData(data)
            setUserCode(data.starter_code)
        }catch (error){
            console.error("Failed to fetch problem:",error)
        } finally{
            setLoading(false);
        }
    };
    fetchProblem();
  },[]);

  const handleRunCode = () => {
        // Placeholder for Step 3: Sending code to backend for Piston execution
        console.log("Submitting code:", userCode);
        alert("Code execution backend integration coming next!");
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Generating AI Coding Assessment...</div>;
    }

    if (!problemData) {
        return <div className="flex h-screen items-center justify-center text-red-500">Error loading problem.</div>;
    }

    
  return (
        <div className="flex h-screen w-full bg-gray-50">
            
            {/* LEFT PANEL: Problem Statement */}
            <div className="w-1/2 p-8 overflow-y-auto border-r border-gray-200 bg-white">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{problemData.title}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                        ${problemData.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                          problemData.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'}`}>
                        {problemData.difficulty}
                    </span>
                </div>
                
                {/* Note: In a production app, use 'react-markdown' to render this properly */}
                <div className="prose max-w-none whitespace-pre-wrap">
                    {problemData.problem_statement}
                </div>

                <div className="mt-8">
                    <h3 className="font-semibold text-lg mb-2">Public Test Cases:</h3>
                    {problemData.public_test_cases?.map((tc, index) => (
                        <div key={index} className="bg-gray-100 p-4 rounded mb-2 font-mono text-sm">
                            <div><strong>Input:</strong> {tc.input_data}</div>
                            <div><strong>Expected Output:</strong> {tc.expected_output}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT PANEL: Monaco Editor */}
            <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
                <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
                    <span className="font-mono text-sm">main.py</span>
                    <button 
                        onClick={handleRunCode}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
                    >
                        Run Code
                    </button>
                </div>
                
                <div className="flex-grow">
                    <Editor
                        height="100%"
                        defaultLanguage="python"
                        theme="vs-dark"
                        value={userCode}
                        onChange={(value) => setUserCode(value)}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: "on",
                        }}
                    />
                </div>
            </div>

        </div>
    );
}
