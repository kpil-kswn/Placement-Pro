import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  { 
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: false,
    },
    authProvider: {
      type: String,
      enum: ["google", "credentials", "both"],
      default: "google",
    },
    resumeText: {
      type: String,
      required: false,
      description:
        "The extracted raw text of the resume for fast AI processing",
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
