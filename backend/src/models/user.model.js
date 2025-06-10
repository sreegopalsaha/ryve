import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
        required: [true, "Username is required"], 
        trim: true,
        unique: true,
        index: true,
        minlength: [3, "Username must be at least 3 characters long"],
        match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"]
    },
    isPrivateAccount: {
        type: Boolean,
        default: false
    },
    email:{
        type: String,
        lowercase: true,
        required: [true, "Email is required"], 
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"]
    },
    profilePicture: {
        type: String,
        default: "https://res.cloudinary.com/dmwlciwjk/image/upload/v1739380034/anonymous-user_tb3tgs.jpg"
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
    refreshToken: {
        type: String
    }
},
{
    timestamps: true 
});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isCorrectPassword = async function(givenPassword){
    return await bcrypt.compare(givenPassword, this.password);
};

userSchema.methods.generateAccessToken = function (){
    const token = jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullname: this.fullname,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
    return token;
};

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)};

export const User = mongoose.model('User', userSchema);