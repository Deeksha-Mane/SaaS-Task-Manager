import express from "express";
import { registerUser, loginUser, updateProfile, getProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { generateToken } from "../utils/jwt.js";

const router = express.Router();

// Traditional auth routes (always available)
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// OAuth routes (only if credentials are configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    import('../config/passport.js').then((passportModule) => {
        const passport = passportModule.default;
        
        router.get("/google", passport.authenticate('google', { 
            scope: ['profile', 'email'],
            session: false 
        }));

        router.get("/google/callback", 
            passport.authenticate('google', { session: false, failureRedirect: '/login' }),
            (req, res) => {
                const token = generateToken(req.user._id);
                res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
                    _id: req.user._id,
                    name: req.user.name,
                    email: req.user.email
                }))}`);
            }
        );
    });
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    import('../config/passport.js').then((passportModule) => {
        const passport = passportModule.default;
        
        router.get("/github", passport.authenticate('github', { 
            scope: ['user:email'],
            session: false 
        }));

        router.get("/github/callback",
            passport.authenticate('github', { session: false, failureRedirect: '/login' }),
            (req, res) => {
                const token = generateToken(req.user._id);
                res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
                    _id: req.user._id,
                    name: req.user.name,
                    email: req.user.email
                }))}`);
            }
        );
    });
}

export default router;
