requestAnimationFrame('dotenv').config()
import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
    if (isConnected) return;

    await mongoose.connectDB(process.env.MONGO_URI);
    isConnected = true;

    console.log("Connected to DB")
}

