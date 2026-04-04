import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Validation: Check if all fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }

        // 2. Check if user already exists in the database
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 3. Create the user
        // Remember: Our User model will automatically hash the password here!
        const user = await User.create({
            name,
            email,
            password,
        });

        // 4. Send success response with JWT token
        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id), // Generate JWT token
                message: "User registered successfully!",
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        // 5. Catch any server errors
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * Login User
 * POST /api/auth/login
 * 
 * How login works:
 * 1. User sends email & password
 * 2. Find user in database by email
 * 3. Compare password with hashed password in DB
 * 4. If match, generate JWT token
 * 5. Send token back to user
 */
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validation: Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }

        // 2. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 3. Compare password with hashed password in database
        // bcrypt.compare() takes plain password and hashed password
        // Returns true if they match, false otherwise
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 4. If password matches, generate JWT token and send response
        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id), // This is the JWT token!
            message: "Login successful!",
        });

    } catch (error) {
        // 5. Catch any server errors
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * Update Profile
 * PUT /api/auth/profile
 * Protected Route
 */
export const updateProfile = async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update name if provided
        if (name) {
            user.name = name;
        }

        // Update email if provided and different
        if (email && email !== user.email) {
            // Check if email already exists
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use" });
            }
            user.email = email;
        }

        // Update password if provided
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password required" });
            }

            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            message: "Profile updated successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * Get Profile
 * GET /api/auth/profile
 * Protected Route
 */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
