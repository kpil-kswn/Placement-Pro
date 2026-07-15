"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MockTestDashboard() {
  const router = useRouter();
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingTestId, setStartingTestId] = useState(null);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const response = await fetch("/api/mock-test/catalog");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load tests.");
        }

        setCatalog(data.catalog);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  } , []);

  const handleStartTest = async (testId) => {
    setStartingTestId(testId);
    try {
      
      const response = await fetch("/api/mock-test/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start test session.");
      }

      sessionStorage.setItem("active_mock_test",JSON.stringify(data));

      router.push(`/service/mock-test/${data.attempt_id}`);

    } catch (err) {
      alert(err.message);
      setStartingTestId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium text-gray-600 animate-pulse">Loading available mock tests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          <p className="font-semibold">Error Loading Dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Technical Mock Assessments</h1>
        <p className="text-gray-600 mt-2">
          Select a subject to validate your knowledge or try our specialized AI engine to simulate interviews built entirely around your resume.
        </p>
      </header>

      {/* Grid Layout for Test Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catalog.map((test) => {
          const isCustom = test.type === "resume_custom";
          const isButtonLoading = startingTestId === test.id;

          return (
            <div
              key={test.id}
              className={`flex flex-col justify-between p-6 rounded-xl border transition-all shadow-sm ${
                isCustom
                  ? "border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {test.title}
                </h2>
                <p className="text-gray-600 text-sm mt-3 line-clamp-3">
                  {test.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>⏱️ {test.duration_minutes} Minutes</span>
                  <span>📝 {test.total_questions} Questions</span>
                </div>

                <button
                  onClick={() => handleStartTest(test.id)}
                  disabled={startingTestId !== null}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors text-center ${
                    isCustom
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow-sm disabled:bg-purple-300"
                      : "bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
                  }`}
                >
                  {isButtonLoading ? "Preparing Engine..." : "Start Assessment"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}