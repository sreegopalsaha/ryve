import mongoose, {Schema, model} from "mongoose";

const chatRoomSchema = new Schema({
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: "Message"
    }
}, {timestamps: true});

export const ChatRoom = model("ChatRoom", chatRoomSchema); 