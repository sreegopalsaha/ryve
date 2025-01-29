import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js';
import { compareSync } from 'bcrypt';


const isLoggedIn = asyncHandler((req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
        throw new ApiError(401, 'No token provided');
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
});

export default isLoggedIn;