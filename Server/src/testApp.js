import { app } from "./socket/app.socket.js";
import cors from "cors";
import express from "express";

import  userRouter from "./routes/users.routes.js";
import  messageRouter from "./routes/messages.routes.js";
import  groupRouter from "./routes/group.routes.js";
import googleAuthRouter from "./routes/googleAuth.routes.js";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/uploads', express.static('uploads'));


app.use("/api/v1/users",userRouter);
app.use("/api/v1/messages",messageRouter);
app.use("/api/v1/group",groupRouter);

app.use("/api/v1/googleAuth",googleAuthRouter);



export default app;