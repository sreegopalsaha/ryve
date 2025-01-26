import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

export const connectDB = async()=>{
    try {
        const conn = await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`);
        console.log("DB CONNECTED:", conn.connection.host);

    } catch (error) {
        console.log("ERROR WHILE DB CONNECTION:", error.message);
        process.exit(1);
    }
}
export default connectDB;