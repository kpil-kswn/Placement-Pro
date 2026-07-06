import mongoose from "mongoose";
import { unique } from "next/dist/build/utils";

const UserSchema = new mongoose.Schema(
    {
        email:{
            type:String,
            required:[true,"Email is required"],
            unique:true,
            match:[/^\S+@\S+\.\S+$/,"Please use a valid email address"]
        },
        name:{
            type:String,
            required:false,
        },
        password:{
            type:String,
            required:false,
        },
        authProvider:{
            type:String,
            enum:["google","credentials","both"],
            default:"google"
        },
    },
    {timestamps:true}
);

export default mongoose.models.User || mongoose.model("User",UserSchema)