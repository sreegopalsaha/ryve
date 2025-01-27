import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js';


const isLoggedIn = asyncHandler((req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
        throw new ApiError(401, 'No token provided');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
});

export default isLoggedIn;