import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

export const connectDB = async()=>{
    try {
        await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`);
        console.log("DB CONNECTED");

    } catch (error) {
        console.log("ERROR WHILE DB CONNECTION:", error);
        process.exit(1);
    }
}
export default connectDB;