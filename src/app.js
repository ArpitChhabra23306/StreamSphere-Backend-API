import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "1mb"})); //to parse json data from request
app.use(express.urlencoded({extended: true, limit: "1mb"})); //url encoder, taking data from url
app.use(express.static("public")); //to serve static files
app.use(cookieParser());  //to parse cookies from request


// Importing routes
import userRouter from "./routes/user.router.js";

//routes declaration
app.use("/api/v1/users", userRouter);

export {app};