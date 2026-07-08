import ConnectMongo from "@/lib/mongodb";
import User from "@/models/User";
import { connect } from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
    try{
        const {email,resumeText} = await req.json()
        if(!resumeText){
            return NextResponse.json({error:"Resume not provided"},{status:400})
        }
        await ConnectMongo();
        const user = await User.findOneAndUpdate(
            {email},
            {resumeText:resumeText}
        )
        return NextResponse.json({success:true,message:"Resume saved to Profile"})
    } catch (error){
        console.log("Resume upload failed:",error)
        return NextResponse.json({error:"Internal Server Error"},{status:500})
    }
}
