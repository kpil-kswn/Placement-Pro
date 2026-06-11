import { NextResponse } from "next/server";

export async function POST(request){
    try{
        const formData = await request.formData();
        const backendUrl = "http://localhost:8000/api/v1/ats/scan"

        const backendResponse = await fetch(backendUrl,{
            method:"POST",
            body:formData,
        })

        const data = backendResponse.json();
        if(!backendResponse.ok){
            return NextResponse.json({error:data.detail || "FastAPI error"},
                {status:backendResponse.status}
            )
        }
        return NextResponse.json(data);
    } catch (error){
        console.log("Next.js API Error",e)
        return NextResponse.json(
            {error:"Failed to connect to backend server."},
            {status:500}
        );
    }
}