import jwt from 'jsonwebtoken';

const isLoggedIn = (req, res, next) => {
    try {
        // Get the auth header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ message: 'No authorization header' });
        }

        // Split 'Bearer token'
        const parts = authHeader.split(' ');
        
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ message: 'Invalid authorization format' });
        }

        const token = parts[1];
        
        // Verify the token secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded;
        
        next();
        
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export default isLoggedIn;