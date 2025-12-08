import 'dotenv/config.js'
import express from "express";
import connectToMongo from "./config/mongodb.config.js";
import  {connectToRedis}  from "./config/redis.config.js";
import {server} from "./socket/app.socket.js";
import app from "./testApp.js";
const port = process.env.PORT;



connectToMongo();
connectToRedis();





server.listen(port,()=>{
    console.log("Backend is Running");
})