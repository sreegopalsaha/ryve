import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname:{
        type: String,
        required: true, 
        trim: true,
        index: true
    },
    username: {
        type: String,
        lowercase: true,
        required: true, 
        trim: true,
        unique: true,
        index: true
    },
    email:{
        type: String,
        lowercase: true,
        required: true, 
        trim: true,
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: "defaultprofilepic.jpg"
    },
    bio: {
        type: String,
    },
    location: {
        type: String,
        default: "Earth"
    },
    mood: {
        type: String,
        default: "Feeling New"
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    followings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
},{
    timestamps: true 
});

export default mongoose.model('User', userSchema);