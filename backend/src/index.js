import dotenv from 'dotenv';
dotenv.config({
    path: "../.env"
});
import { app } from './app.js';
import connectDB from './configs/db.config.js';
const PORT = process.env.PORT || 5000;



connectDB()
.then(
    ()=>{
        app.listen(PORT, ()=>{
            console.log('APP IS RUNNING ON PORT', PORT);
        });
    }
).catch(
    (error)=>{
        console.log("ERROR WHILE DB CONNECTION:", error);
    }
);