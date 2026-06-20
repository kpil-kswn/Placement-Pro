import { NextResponse } from "next/server";


export async function POST(request){
    try{
        const body = await request.json().catch(()=>({}));
        const resumeText = body.resume_text || null
        const response = await fetch(`http://localhost:8000/api/v1/programming/generate`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
        },
        body:JSON.stringify(resumeText?{resume_text:resumeText}:{})
        })
        const data = response.json();
        if(!response.ok){
            return NextResponse.json(
                {error: data.detail || "FastAPI Error"},
                {status:response.status}
            )
        }
        return NextResponse.json(data)
    } catch(error){
        console.error("API route error:",error)
        return NextResponse.json(
            { error: "Failed to generate coding problem" }, 
            { status: 500 }
        );
    }
    
}