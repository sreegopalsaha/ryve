import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';


const isLoggedIn = asyncHandler(async(req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
        throw new ApiError(401, 'No token provided');
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("-password -refreshToken");
    if (!user) throw new ApiError(401, 'Invalid Access Token');
    req.user = decoded;
    next();
});

export default isLoggedIn;