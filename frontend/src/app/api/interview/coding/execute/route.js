import { NextResponse } from "next/server";

export async function POST(request) {
    try{
        const body = await request.json()
        
        const response = await fetch('http://127.0.0.1:8000/api/v1/programming/execute',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(body)
        })
        const rawText = await response.text()
        if(!response.ok){
            return NextResponse.json({error:"Execution errro",detail:rawText},{status:response.status})
        }
        return NextResponse.json(JSON.parse(rawText))
    } catch (error){
        return NextResponse.json({error:"Failed to connect to execution server"},{status:500})
    }
}