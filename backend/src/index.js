import dotenv from 'dotenv';
dotenv.config({
    path: "../.env"
});
import { app } from './app.js';
import connectDB from './configs/db.config.js';
const PORT = process.env.PORT || 5000;



import { initializeWebSocketServer } from './services/websocket.service.js';

connectDB()
.then(
    ()=>{
        const server = app.listen(PORT, ()=>{
            console.log('APP IS RUNNING ON PORT', PORT);
        });
        // Initialize WebSocket server
        initializeWebSocketServer(server);
    }
).catch(
    (error)=>{
        console.log("ERROR WHILE DB CONNECTION:", error);
    }
);