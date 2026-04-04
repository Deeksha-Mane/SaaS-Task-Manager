import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

/**
 * Protect Routes Middleware
 * 
 * This middleware runs BEFORE your route handlers
 * It checks if the user is authenticated (has valid token)
 * 
 * How it works:
 * 1. Check if Authorization header exists
 * 2. Extract token from header
 * 3. Verify token is valid
 * 4. Find user in database
 * 5. Attach user to request object
 * 6. Call next() to continue to the actual route
 * 
 * Usage: Add this middleware to any route you want to protect
 * Example: router.get('/tasks', protect, getTasks)
 */
export const protect = async (req, res, next) => {
    let token;

    try {
        // 1. Check if Authorization header exists and starts with "Bearer"
        // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            // 2. Extract token from header
            // Split "Bearer token" and take the second part (the actual token)
            token = req.headers.authorization.split(" ")[1];

            // 3. Verify token using our JWT utility
            // This will throw an error if token is invalid or expired
            const decoded = verifyToken(token);

            // 4. Find user in database (exclude password from result)
            // decoded.id contains the user ID we stored in the token
            req.user = await User.findById(decoded.id).select("-password");

            // 5. If user not found in database
            if (!req.user) {
                return res.status(401).json({ message: "User not found" });
            }

            // 6. User is authenticated! Continue to the next middleware/controller
            next();
        } else {
            // No token provided
            return res.status(401).json({ message: "Not authorized, no token" });
        }
    } catch (error) {
        // Token is invalid or expired
        return res.status(401).json({ 
            message: "Not authorized, token failed",
            error: error.message 
        });
    }
};
