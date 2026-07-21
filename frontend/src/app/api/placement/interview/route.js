import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function POST(req) {
    try {
        const body = await req.json();
        
        const response = await fetch(`${BACKEND_URL}/pipeline/interview`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.detail || "Interview generation failed" }, { status: response.status });
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server error" }, { status: 500 });
    }
}