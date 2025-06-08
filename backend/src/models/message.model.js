import mongoose, {Schema, model} from "mongoose";

const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    // Optional: for grouping messages into conversations
    chatRoom: {
        type: Schema.Types.ObjectId,
        ref: "ChatRoom", // You might need a ChatRoom model if you want to group conversations
        index: true
    }
}, {timestamps: true});

export const Message = model("Message", messageSchema); 