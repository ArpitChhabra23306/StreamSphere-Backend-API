import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";  
import connectDB from "./db/index.js";
import dotenv from "dotenv";



dotenv.config({
    path: './env'
}); // Load environment variables from .env file

connectDB() // Connect to MongoDB and start the server

















/*  1st approach: Using async IIFE to connect to MongoDB and start the server
This approach allows us to use async/await syntax for better readability and error handling.

import express from "express";
const app = express();


( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (err) => {
            console.error("Connection error:", err);    
            throw err;
        });
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });

    } catch (error) {
        console.log("ERROR: ", error);
        throw error;
    }
} )()

*/