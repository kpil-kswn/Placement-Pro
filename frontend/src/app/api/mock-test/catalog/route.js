import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000/api/v1"

export async function GET(){
    try{
        const session = await getServerSession(authOptions);
        if (!session?.user?.id){
            return NextResponse.json({error:"Unauthorized.Please log in."},{status:401})
        }
        const pythonResponse = await fetch(`${PYTHON_BACKEND_URL}/mock-test/catalog/${session.user.id}`,{
            method:"GET",
            headers:{
                "Content-Type": "application/json",
            }
        })
        const data = await pythonResponse.json();
        if(!pythonResponse.ok){
            return NextResponse.json({error:data.detail || "Failed to fetch catalog"},{status:pythonResponse.status})
        }

        return NextResponse.json(data)
    }catch (error) {
    console.error("Catalog Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}