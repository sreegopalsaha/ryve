import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
    },
    image: {
        type: String,
        trim: true
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    starredBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
},{
    timestamps: true 
});

export const Post = mongoose.model('Post', postSchema);