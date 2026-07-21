import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function POST(req, { params }) {
    try {
        const { pipelineId } = params;
        
        // This endpoint doesn't require a body since it grades the auto-saved drafts
        const response = await fetch(`${BACKEND_URL}/pipeline/${pipelineId}/submit-coding`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        
        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.detail || "Failed to submit coding round" }, { status: response.status });
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server error" }, { status: 500 });
    }
}