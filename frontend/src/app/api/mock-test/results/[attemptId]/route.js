import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

const PYTHON_BACKEND_URL =
  process.env.PYTHON_BACKEND_URL || "http://localhost:8000/api/v1";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { attemptId } = await params;

    const pythonResponse = await fetch(
      `${PYTHON_BACKEND_URL}/mock-test/attempt/${attemptId}/results?user_id=${session.user.id}`,
    );

    const data = await pythonResponse.json();

    if (!pythonResponse.ok) {
      return NextResponse.json(
        { error: data.detail },
        { status: pythonResponse.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Results Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
