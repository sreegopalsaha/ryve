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
        required: true, 
        trim: true,
        unique: true,
        index: true
    },
    isPrivateAccount: {
        type: Boolean,
        default: false
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