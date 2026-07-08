"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (status === "unauthenticated") {
    redirect("/");
  }

  if (status === "loading") {
    return <div className="flex-1 flex items-center justify-center min-h-screen text-gray-500 font-bold">Loading Profile...</div>;
  }

  const extractTextFromPDF = async (pdfFile) => {

    const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const extractedText = await extractTextFromPDF(file);
      const res = await fetch("/api/user/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          resumeText: extractedText,
        }),
      });

      if (res.ok) {
        setUploadSuccess(true);
      } else {
        alert("Failed to save resume to database. Please try again.");
      }
    } catch (error) {
      console.error("PDF Processing Error:", error);
      alert("Failed to read the PDF file. Please ensure it is a valid document.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="flex-1 bg-gray-50 flex flex-col items-center py-12 px-6 w-full min-h-[calc(100vh-80px)]">
      <div className="max-w-4xl w-full flex flex-col gap-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-50 bg-gray-100 mb-4 shadow-inner">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl uppercase font-bold">
                      {session?.user?.email?.[0]}
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900">
                {session?.user?.name || "Candidate"}
              </h2>
              <p className="text-gray-500 text-sm font-medium mt-1 mb-4">{session?.user?.email}</p>
              
              <div className="w-full border-t border-gray-100 my-4"></div>
              
              <div className="flex flex-col gap-2 w-full">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider text-left mb-1">Subscription</p>
                {session?.user?.isPro ? (
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-black px-4 py-2.5 rounded-xl uppercase tracking-wider shadow-sm flex justify-center items-center gap-2">
                    <span>👑</span> Pro Member
                  </div>
                ) : (
                  <div className="bg-gray-100 text-gray-600 text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm flex justify-between items-center">
                    <span>Free Tier</span>
                    <button className="text-indigo-600 hover:text-indigo-700 text-xs underline">Upgrade</button>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full bg-white border border-red-100 hover:bg-red-50 text-red-600 py-4 rounded-3xl text-sm font-bold transition-all shadow-sm"
            >
              Log Out of Account
            </button>
          </div>

          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Master Resume</h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Your AI uses this document across the ATS, Mock Test, and Interview modules. Update it anytime to reflect your latest experience.
              </p>

              <div className="flex flex-col flex-1">
                {uploadSuccess ? (
                  <div className="flex flex-col flex-1 items-center justify-center border-2 border-gray-100 rounded-2xl p-8 bg-gray-50/50">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm">✓</div>
                    <h3 className="font-bold text-gray-800 text-lg">Resume Active</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1 mb-6 truncate max-w-[250px]">{file?.name}</p>
                    
                    <button 
                      onClick={() => {
                        setUploadSuccess(false);
                        setFile(null);
                      }}
                      className="px-6 py-2.5 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 text-gray-700 font-bold rounded-xl shadow-sm transition-all text-sm"
                    >
                      Replace Master Resume
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleResumeUpload} className="flex flex-col flex-1">
                    <div className="relative border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-2xl p-10 transition-all text-center bg-gray-50 hover:bg-white cursor-pointer group flex-1 flex flex-col items-center justify-center">
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={(e) => setFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center gap-3">
                        <span className="text-5xl group-hover:scale-110 group-hover:-translate-y-1 transition-transform">📄</span>
                        <span className="text-base font-bold text-gray-700">
                          {file ? file.name : "Click or drag a new PDF here"}
                        </span>
                        {!file && <span className="text-sm text-gray-400 font-medium">Standard PDF Format (Max 5MB)</span>}
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <button 
                        type="submit" 
                        disabled={!file || isUploading}
                        className={`px-8 py-3.5 rounded-xl text-white font-bold transition-all shadow-md w-full sm:w-auto ${!file || isUploading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'}`}
                      >
                        {isUploading ? "Extracting & Saving..." : "Save as Master Resume"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}