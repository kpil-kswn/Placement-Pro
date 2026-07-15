import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000/api/v1";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { attemptId, userAnswers } = await req.json();
    const pythonResponse = await fetch(`${PYTHON_BACKEND_URL}/mock-test/attempt/${attemptId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: session.user.id,
        user_answers: userAnswers
      }),
    });

    const data = await pythonResponse.json();

    if (!pythonResponse.ok) {
      return NextResponse.json({ error: data.detail }, { status: pythonResponse.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Submit Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}