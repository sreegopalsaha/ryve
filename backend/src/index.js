import dotenv from 'dotenv';
dotenv.config({
    path: "../.env"
});
import { app } from './app.js';
import connectDB from './configs/db.config.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"]
    }
});

app.set('io', io); // Attach io to app for access in controllers

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinChat', (chatRoomId) => {
        socket.join(chatRoomId);
        console.log(`User ${socket.id} joined chat room: ${chatRoomId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

connectDB()
.then(
    ()=>{
        httpServer.listen(PORT, ()=>{
            console.log('APP IS RUNNING ON PORT', PORT);
        });
    }
).catch(
    (error)=>{
        console.log("ERROR WHILE DB CONNECTION:", error);
    }
);