import jwt from "jsonwebtoken";

/**
 * Generate JWT Token
 * @param {string} userId - The user's MongoDB _id
 * @returns {string} - Signed JWT token
 * 
 * How it works:
 * 1. Takes user ID as input
 * 2. Creates a token with that ID inside (payload)
 * 3. Signs it with a secret key (only server knows this)
 * 4. Sets expiration time (30 days)
 */
export const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },              // Payload: data we want to store in token
        process.env.JWT_SECRET,      // Secret key: used to sign/verify token
        { expiresIn: "30d" }         // Token expires in 30 days
    );
};

/**
 * Verify JWT Token
 * @param {string} token - The JWT token to verify
 * @returns {object} - Decoded token payload (contains user id)
 * 
 * How it works:
 * 1. Takes the token from request
 * 2. Verifies signature using secret key
 * 3. Returns decoded data if valid
 * 4. Throws error if invalid/expired
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
};
