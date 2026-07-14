import mongoose from "mongoose";
import MODERN_BROWSERSLIST_TARGET from "next/dist/shared/lib/modern-browserslist-target";
const ChatSchema = new mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        title:{
            type:String,
            default:"New Conversation"
        },
        messages:[
            {
                role:{
                    tyoe:String,
                    enum:["user","model","system"],
                    required:true
                },
                text:{
                    type:String,
                    required:true
                },
                timestamp:{
                    type:Date,
                    default:Date.now
                },
            }
        ],
    },
    {
        timestamps:true
    }
);

export default mongoose.models.Chat || mongoose.model("Chat",ChatSchema);