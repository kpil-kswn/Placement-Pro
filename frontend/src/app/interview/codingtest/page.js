'use client';

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';

export default function InterviewPage() {
    const [problemData, setProblemData] = useState(null);
    const [userCode, setUserCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState("vs-dark");
    const [language, setLanguage] = useState("python");
    const [editorMode, setEditorMode] = useState("standard"); // See note below about Vim
    const editorRef = useRef(null);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const res = await fetch('/api/interview/coding/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resume_text: "Python developer" }) 
                });
                
                const data = await res.json();
                
                if (data.error || data.detail) {
                    console.error("Backend Error:", data.error || data.detail);
                }

                setProblemData(data);
                setUserCode(data.starter_code || "");
            } catch (error) {
                console.error("Failed to fetch problem:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, []);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
    };

    const handleResetCode = () => {
        if (confirm("Are you sure you want to reset your code to the starter template?")) {
            setUserCode(problemData.starter_code);
        }
    };

    const handleRunCode = () => {
        console.log("Running public test cases for:", language);
        alert("Running public test cases! (Backend integration next)");
    };

    const handleSubmitCode = () => {
        console.log("Submitting all test cases for:", language);
        alert("Submitting for final grading! (Backend integration next)");
    };

    const editorOptions = {
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        quickSuggestions: true,
        suggestOnTriggerCharacters: true,
        parameterHints: { enabled: true },
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        formatOnPaste: true,
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-gray-50 font-semibold text-lg">Generating AI Coding Assessment...</div>;
    }

    if (!problemData) {
        return <div className="flex h-screen items-center justify-center text-red-500">Error loading problem. Check your terminal.</div>;
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
                
                <div className="prose max-w-none text-gray-800">
                    <ReactMarkdown>{problemData.problem_statement}</ReactMarkdown>
                </div>

                <div className="mt-8">
                    <h3 className="font-semibold text-lg mb-4 text-gray-900">Public Test Cases:</h3>
                    {problemData.public_test_cases?.map((tc, index) => (
                        <div key={index} className="bg-gray-100 p-4 rounded-lg mb-3 font-mono text-sm border border-gray-200 shadow-sm">
                            <div className="mb-2"><strong className="text-gray-700">Input:</strong> <span className="text-blue-600">{tc.input_data}</span></div>
                            <div><strong className="text-gray-700">Expected Output:</strong> <span className="text-green-600">{tc.expected_output}</span></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT PANEL: Monaco Editor */}
            <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
                
                {/* EDITOR TOOLBAR */}
                <div className="flex justify-between items-center p-3 bg-gray-900 text-gray-300 text-sm border-b border-gray-700">
                    <div className="flex gap-4">
                        {/* Language Selector */}
                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 outline-none hover:border-gray-500 transition-colors"
                        >
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                        </select>

                        {/* Theme Selector */}
                        <select 
                            value={theme} 
                            onChange={(e) => setTheme(e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 outline-none hover:border-gray-500 transition-colors"
                        >
                            <option value="vs-dark">Dark Theme</option>
                            <option value="light">Light Theme</option>
                        </select>

                        {/* Editor Mode Selector */}
                        <select 
                            value={editorMode} 
                            onChange={(e) => setEditorMode(e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 outline-none hover:border-gray-500 transition-colors"
                        >
                            <option value="standard">Standard Mode</option>
                            <option value="vim">Vim Mode</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleResetCode}
                        className="hover:text-white transition-colors flex items-center gap-1"
                        title="Reset to starter code"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Reset
                    </button>
                </div>
                
                {/* MONACO EDITOR */}
                <div className="grow relative">
                    <Editor
                        height="100%"
                        language={language}
                        theme={theme}
                        value={userCode}
                        onChange={(value) => setUserCode(value)}
                        onMount={handleEditorDidMount}
                        options={editorOptions}
                    />
                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="flex justify-end gap-3 p-4 bg-gray-900 border-t border-gray-700">
                    <button 
                        onClick={handleRunCode}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors border border-gray-600"
                    >
                        Run Code
                    </button>
                    <button 
                        onClick={handleSubmitCode}
                        className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-green-900/20"
                    >
                        Submit Code
                    </button>
                </div>
            </div>

        </div>
    );
}