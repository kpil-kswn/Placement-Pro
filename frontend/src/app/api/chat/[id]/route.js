import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

const PYTHON_BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const chatID = params.id;

    const pythonResponse = await fetch(`${PYTHON_BACKEND_URL}/chat/${chatID}`);
    const data = await pythonResponse.json();

    if (!pythonResponse.ok) {
      return NextResponse.json(
        { error: data.detail },
        { status: pythonResponse.status },
      );
    }
    if (data.chat.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this chat." },
        { status: 403 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Next.js Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
