import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        if(!session?.user?.id){
            return NextResponse.json({error:"Unauthorized. Please log in."},{status:401})
        }
        const formData = await request.formData()
        formData.set("userId",session.user.id)

        const pythonResponse = await fetch(`${PYTHON_BACKEND_URL}/chat`,{
            method:'POST',
            body:formData
        })
        const data = await pythonResponse.json()
        if(!pythonResponse.ok){
            return NextResponse.json(
                {error: data.detail || "FastAPI Error"},
                {status:backendResponse.status}
            )
        }
        return NextResponse.json(data)
    } catch (error){
        console.log("Fast API Error: ",error)
        return NextResponse.json(
            {error:error || "Internal Server error"},
            {status:500}
        );
    }
}