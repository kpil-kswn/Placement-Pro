import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function GET(req, { params }) {
    try {
        const { pipelineId } = await params;
        
        const response = await fetch(`${BACKEND_URL}/pipeline/${pipelineId}/results`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        
        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.detail || "Failed to fetch final results" }, { status: response.status });
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server error" }, { status: 500 });
    }
}