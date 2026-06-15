import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const formData = await request.formData()
        const backendurl = "http://localhost:8000/api/v1/chat"

        const backendResponse = await fetch(backendurl,{
            method:'POST',
            body:formData
        })
        
        const data = await backendResponse.json();
        if(!backendResponse.ok){
            return NextResponse.json(
                {error: data.detail || "FastAPI Error"},
                {status:backendResponse.status}
            )
        }
        return NextResponse.json(data)
    } catch (error){
        console.log("Fast API Error: ",error)
        return NextResponse.json(
            {error:error || "Failed to connect to backend server"},
            {status:500}
        );
    }
}